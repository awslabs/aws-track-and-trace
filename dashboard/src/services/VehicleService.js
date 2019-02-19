import async from 'async';
import aws from 'aws-sdk';
import locations from 'random-location';

import AuthService from '@/services/AuthService';
import ConfigurationService from '@/services/ConfigurationService';
import IotService from '@/services/IotService';

export default class VehicleService {

  constructor () {
    this.authService = AuthService.getInstance();
    this.configService = ConfigurationService.getInstance();
    this.iotService = IotService.getInstance();

    const credentials = this.authService.getCredentials();
    const region = this.configService.get('AWS_REGION');
    this.dynamo = new aws.DynamoDB.DocumentClient({
      credentials, region
    });
  }

  async getVehicle (vin) {
    const token = this.authService.getAccessToken();
    const owner_id = token.sub;
    const TableName = this.configService.get('VEHICLES_TABLE_NAME');

    return new Promise((resolve, reject) => {
      this.dynamo.get({
        TableName,
        Key: {
          owner_id,
          vin
        }
      }, (err, data) => {
        if (err) {
          console.error('ERROR: Failed to get vehicle');
          reject(err);
        } else {
          console.log('INFO: Successfully retrieved vehicle');
          resolve(data.Item);
        }
      })
    })
  }

  async listMyVehicles () {
    const token = this.authService.getAccessToken();
    const owner_id = token.sub;
    const TableName = this.configService.get('VEHICLES_TABLE_NAME');
    const FilterExpression = 'owner_id = :owner_id';
    const ExpressionAttributeValues = {
      ':owner_id': owner_id
    };

    return new Promise((resolve, reject) => {
      this.dynamo.scan({
        TableName, FilterExpression, ExpressionAttributeValues
      }, (err, data) => {
        if (err) {
          console.error('ERROR: Failed to list my vehicles');
          reject (err);
        } else {
          console.log('INFO: Successfully listed my vehicles');
          resolve(data.Items);
        }
      })
    });
  }

  async deployVirtualVehicle (vehicle) {
    return new Promise(async (resolve, reject) => {
      const locationCenter = this.configService.get('VIRTUAL_VEHICLES_CENTER');
      const location = locations.randomCirclePoint(locationCenter, locationCenter.radius);
      
      location.bearing = Math.random()*360;

      const systems = {
        tyres: {
          frontLeft: Math.random()*35,
          frontRight: Math.random()*35,
          rearLeft: Math.random()*35,
          rearRight: Math.random()*35
        },
        mainBattery: {
          level: Math.random()
        },
        key: {
          in: false,
          inRange: false
        },
        locks: {
          locked: false
        },
        clima: {
          temperature: Math.random()*12+12,
          smartWarmer: false
        },
        doorsOpened: {
          frontLeft: false,
          frontRight: false,
          rearLeft: false,
          rearRight: false
        }
      };

      const status = {
        location,
        systems
      };

      // Update vehicle status
      await this.iotService.updateVehicleStatus(vehicle, status);

      const TableName = this.configService.get('VEHICLES_TABLE_NAME');
      const Key = {
        owner_id: vehicle.owner_id,
        vin: vehicle.vin
      };
      const UpdateExpression = 'set #s = :status';
      const ExpressionAttributeNames = {
        '#s': 'VehicleStatus'
      };
      const ExpressionAttributeValues = {
        ':status': 'deployed'
      };

      this.dynamo.update({
        TableName, 
        Key, 
        UpdateExpression, 
        ExpressionAttributeNames,
        ExpressionAttributeValues
      }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(null, data);
        }
      })
    })
  }

  async provisionVirtualVehicle (data) {
    console.log('INFO: Starting provision of virtual vehicle');

    const accessToken = this.authService.getAccessToken();
    
    const owner_id = accessToken.sub;
    const Timestamp = new Date().getTime();

    const TableName = this.configService.get('VEHICLES_TABLE_NAME')
    const Item = {
      ...data,
      owner_id,
      Timestamp,
      Fleet: 'VirtualVehicles',
      VehicleStatus: 'awaiting-deployment',
      Brand: data.VehicleType === 'suv' ? 'Range Rover' : data.VehicleType === 'sport' ? 'Jaguar' : 'Standard',
      Model: data.VehicleType === 'suv' ? 'Defender' : data.VehicleType === 'sport' ? 'F-Type' : 'Standard',
      Year: 2019,
      EVA: data.VehicleType === 'suv' ? 'v3' : data.VehicleType === 'sport' ? 'v2' : 'N/A',
      VehicleLocation: 'United Kingdom'
    };

    // Create Iot footprint
    await this.iotService.provisionVirtualVehicle(data);

    return new Promise((resolve, reject) => {
      console.log('INFO: Including vehicle in fleet table');
      this.dynamo.put({
        TableName,
        Item
      }, (err, result) => {
        if (err) {
          console.error('ERROR: Failed to provision virtual vehicle');
          reject(err);
        } else {
          console.log('INFO: Successfully provisioned virtual vehicle');
          resolve(result.Item);
        }
      })
    });
  }

  static getInstance () {
    if (!VehicleService._instance) VehicleService._instance = new VehicleService()
    return VehicleService._instance
  }
}

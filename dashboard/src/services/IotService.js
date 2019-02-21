import async from 'async';
import aws from 'aws-sdk';
import deviceSdk from 'aws-iot-device-sdk';

import AuthService from '@/services/AuthService';
import ConfigurationService from '@/services/ConfigurationService';

export default class IotService {

  constructor () {
    this.authService = AuthService.getInstance();
    this.configService = ConfigurationService.getInstance();

    const credentials = this.authService.getCredentials();
    const region = this.configService.get('AWS_REGION');
    this.iot = new aws.Iot({
      credentials, region
    });
  }

  connect () {
    const credentials = this.authService.getCredentials()
    this.iotData = new aws.IotData({
      endpoint: this.configService.get('IOT_ENDPOINT'),
      region: this.configService.get('AWS_REGION'),
      credentials
    })

    const req = {
      host: this.configService.get('IOT_ENDPOINT'),
      protocol: 'wss',
      clientId: 'ui' + new Date().getTime(),
      accessKeyId: credentials.accessKeyId,
      secretKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken
    }

    const device = deviceSdk.device(req)

    return device
  }

  async getVehicleStatus (vehicle) {
    return new Promise((resolve, reject) => {
      const thingName = vehicle.vin;
      this.iotData.getThingShadow({
        thingName
      }, (err, data) => {
        if (err) {
          console.error('ERROR: Failed to fetch vehicle status');
          reject(err);
        }
        else {
          console.log('INFO: Successfully fecthed vehicle status');

          const parsedPayload = JSON.parse(data.payload);
          let originalState = parsedPayload.state.reported;
          let originalMetadata = parsedPayload.metadata.reported;
          
          if (originalState.location instanceof Array) {
            const oldLocation = originalState.location;

            const parsedState = {
              location: {
                latitude: oldLocation[0],
                longitude: oldLocation[1],
                bearing: 0
              },
              systems: {
                locks: {
                  locked: originalState.door
                },
                trunk: {
                  opened: originalState.trunk
                },
                tyres: {
                  frontLeft: originalState.tires[0],
                  frontRight: originalState.tires[1],
                  rearLeft: originalState.tires[2],
                  rearRight: originalState.tires[3]
                },
                mainBattery: {
                  level: originalState.battery
                },
                clima: {
                  temperature: 70
                }
              }
            };

            originalState = parsedState;

          } 
          
          const lastLocationUpdate = originalMetadata.location ? originalMetadata.location.latitude ? originalMetadata.location.latitude.timestamp : originalMetadata.location instanceof Array ? originalMetadata.location[0].timestamp : 0 : 0;
          originalState.location.lastUpdated = lastLocationUpdate;
          const ret = {
            ...vehicle,
            ...originalState
          }
          resolve(ret);
        }
      });
    });
  }

  async getAllVehicleStatus (vehicles) {
    return new Promise((resolve, reject) => {
      const tasks = vehicles.map(vehicle => cb => {
        this.getVehicleStatus(vehicle)
          .then(data => cb(null, data))
          .catch(err => cb(err));
      });

      async.parallelLimit(tasks, 25, (err, data) => {
        if (err) {
          console.error('ERROR: Failed to fetch batch status');
          reject(err);
        } else {
          console.log('INFO: Successfully fetched batch status');
          resolve(data);
        }
      })
    });
  }

  async prepareAccount () {
    return new Promise((resolve, reject) => {
      async.parallel([
        // Authorize myself
        cb => {
          const policyName = this.configService.get('PEOPLE_POLICY_NAME');
          const identityId = this.authService.getIdentity();

          this.iot.attachPolicy({
            policyName,
            target: identityId
          }, (err, data) => {
            if (err) {
              console.error('ERROR: Failed to grant access to iot broker');
              cb(err);
            } else {
              console.log('INFO: Successfully granted access to iot broker');
              cb(null, data);
            }
          })
        },

        // Create virtual vehicles thing type
        cb => {
          const thingTypeName = this.configService.get('VIRTUAL_VEHICLES_THING_TYPE');
          const thingTypeProperties = {
            searchableAttributes: ['type']
          };
          this.iot.createThingType({
            thingTypeName,
            thingTypeProperties
          }, (err, data) => {
            if (err) {
              cb(err);
            } else {
              cb(null, data);
            }
          })
        },
        
        // Create real vehicles thing type
        cb => {
          const thingTypeName = this.configService.get('REAL_VEHICLES_THING_TYPE');
          const thingTypeProperties = {
            searchableAttributes: ['brand', 'model', 'version']
          };
          this.iot.createThingType({
            thingTypeName,
            thingTypeProperties
          }, (err, data) => {
            if (err) {
              cb(err);
            } else {
              cb(null, data);
            }
          })
        }
      ], (err, data) => {
        if (err) {
          console.error('ERROR: Failed to prepare account');
          reject(err);
        } else {
          console.log('INFO: Successfully prepared account');
          resolve(data);
        }
      })
    });
  }

  async provisionVirtualVehicle (params) {
    return new Promise((resolve, reject) => {
      const thingTypeName = this.configService.get('VIRTUAL_VEHICLES_THING_TYPE');
      const thingName = params.vin;

      this.iot.createThing({
        thingName,
        thingTypeName,
        attributePayload: {
          attributes: {
            type: params.VehicleType
          }
        }
      }, (err, data) => {
        if (err) {
          console.error('ERROR: Failed to provision virtual vehicle');
          reject(err);
        } else {
          console.log('INFO: Successfully provisioned virtual vehicle');
          resolve(data);
        }
      });
    });
  }

  async updateVehicleStatus (vehicle, status) {
    const vin = vehicle.vin;

    return new Promise((resolve, reject) => {
      this.iotData.updateThingShadow({
        thingName: vin,
        payload: JSON.stringify({
          state: {
            reported: status
          }
        })
      }, (err, data) => {
        if (err) {
          console.error('ERROR: Failed to update vehicle status');
          reject(err);
        } else {
          console.log('INFO: Successfully updated vehicle status');
          resolve(data);
        }
      })
    });
  }

  static getInstance () {
    if (!IotService._instance) IotService._instance = new IotService()
    return IotService._instance
  }
}

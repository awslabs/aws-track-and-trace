import { DynamoDB } from 'aws-sdk';
import uuid from 'uuid/v4';

import AuthService from '@/services/AuthService';
import ConfigurationService from '@/services/ConfigurationService';

export default class PoiService {

  constructor () {
    this.authService = AuthService.getInstance();
    this.configService = ConfigurationService.getInstance();

    const credentials = this.authService.getCredentials();
    const region = this.configService.get('AWS_REGION');

    this.dynamo = new DynamoDB.DocumentClient({
      credentials, region
    });
  }

  async addPoi (poiData) {
    const TableName = this.configService.get('POI_TABLE_NAME');
    const Item = {
      PoiId: uuid(),
      ...poiData
    };

    return new Promise((resolve, reject) => {
      this.dynamo.put({
        TableName,
        Item
      }, (err, data) => {
        if (err) {
          console.error('ERROR: Failed to create POI')
          reject(err);
        } else {
          console.log('INFO: Successfully created POI');
          resolve(data.Item);
        }
      })
    });
  }

  async clearPois (pois) {
    const deleteRequests = pois.map(item => ({
      DeleteRequest: {
        Key: {
          PoiId: item.PoiId
        }
      }
    }));
    const TableName = this.configService.get('POI_TABLE_NAME');

    const req = {
      RequestItems: {}
    };
    req.RequestItems[TableName] = deleteRequests;
    return new Promise((resolve, reject) => {
      this.dynamo.batchWrite(req, (err, data) => {
        if (err) {
          console.error('ERROR: Failed to clear POIs');
          reject(err);
        } else {
          console.log('INFO: Successfully cleared POIs');
          resolve(data);
        }
      });
    });
  }

  async listAllPois () {
    const TableName = this.configService.get('POI_TABLE_NAME');
    return new Promise((resolve, reject) => {
      this.dynamo.scan({
        TableName
      }, (err, data) => {
        if (err) {
          console.error('ERROR: Failed to list Pois');
          reject(err);
        } else {
          console.log('INFO: Successfully fetched Pois');
          resolve(data.Items);
        }
      })
    });
  }

  static getInstance () {
    if (!PoiService._instance) PoiService._instance = new PoiService()
    return PoiService._instance
  }
}

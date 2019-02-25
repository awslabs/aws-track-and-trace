import { DynamoDB } from 'aws-sdk';

import AuthService from '@/services/AuthService';
import ConfigurationService from '@/services/ConfigurationService';

export default class DdbService {

  constructor () {
    this.auth = AuthService.getInstance();
    this.config = ConfigurationService.getInstance();

    const credentials = this.auth.getCredentials();
    const region = this.config.get('AWS_REGION');

    this.ddb = new DynamoDB.DocumentClient({
      credentials, region
    });
  }

  async delete (TableName, Key) {
    const ret = await this.ddb.delete({ TableName, Key }).promise()
    return ret;
  }

  async get (TableName, Key) {
    const ret = await this.ddb.get({ TableName, Key }).promise();
    return ret.Item;
  }

  async put (TableName, Key, Item) {
    const ret = await this.ddb.put({ TableName, Key, Item }).promise();
    return ret.Item;
  }

  async query (TableName, KeyConditionExpression, ExpressionAttributeNames, ExpressionAttributeValues) {
    const ret = await this.ddb.query({ TableName, KeyConditionExpression, ExpressionAttributeNames, ExpressionAttributeValues }).promise();
    return ret.Items;
  }

  async scan (TableName) {
    const ret = await this.ddb.scan({ TableName }).promise();
    return ret.Items;
  }

  async update (TableName, Key, UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues) {
    const ret = await this.ddb.update({ TableName, Key, UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues }).promise()
    return ret.Item;
  }

  static getInstance () {
    if (!DdbService._instance) DdbService._instance = new DdbService()
    return DdbService._instance
  }
}

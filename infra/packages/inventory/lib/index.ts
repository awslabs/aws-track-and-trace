import { RemovalPolicy, Construct } from '@aws-cdk/cdk';
import { Table, AttributeType } from '@aws-cdk/aws-dynamodb';
import { Bucket } from '@aws-cdk/aws-s3';

export class Inventory extends Construct {

  /** @returns the Inventory assets DynamoDB table */
  public readonly assetsTable: Table;

  /** @returns the Inventory Sensors DynamoDB table */
  public readonly sensorsTable: Table;

  /** @returns the assets bucket */
  public readonly assetsBucket: Bucket;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.assetsTable = new Table(this, 'InventoryAssetsTable', {
      partitionKey: {
        name: 'AssetId',
        type: AttributeType.String
      }
    });

    this.sensorsTable = new Table(this, 'InventorySensorsTable', {
      partitionKey: {
        name: 'AssetId',
        type: AttributeType.String
      },
      sortKey: {
        name: 'SensorId',
        type: AttributeType.String
      }
    });

    this.assetsBucket = new Bucket(this, 'AssetsBucket', {
      removalPolicy: RemovalPolicy.Destroy
    });
  }
}

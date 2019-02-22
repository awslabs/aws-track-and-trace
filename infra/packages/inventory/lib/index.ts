import { RemovalPolicy, Construct } from '@aws-cdk/cdk';
import { Table, AttributeType } from '@aws-cdk/aws-dynamodb';
import { Bucket } from '@aws-cdk/aws-s3';

export class Inventory extends Construct {

  /** @returns the Inventory DynamoDB table */
  public readonly inventoryTable: Table;

  /** @returns the assets bucket */
  public readonly assetsBucket: Bucket;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.inventoryTable = new Table(this, 'InventoryTable', {
      partitionKey: {
        name: 'AssetId',
        type: AttributeType.String
      }
    });

    this.assetsBucket = new Bucket(this, 'AssetsBucket', {
      removalPolicy: RemovalPolicy.Destroy
    });
  }
}

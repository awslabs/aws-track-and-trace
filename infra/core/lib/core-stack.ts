import { Auth } from '../../packages/auth';
import { Inventory } from '../../packages/inventory';
import { Dns } from '../../packages/dns';
import { Webui } from '../../packages/webui';
import { Stack, App, StackProps, Aws, CfnOutput } from '@aws-cdk/core';
import { CfnUserPoolUser, CfnUserPoolUserToGroupAttachment } from '@aws-cdk/aws-cognito';
import { AnyPrincipal, ArnPrincipal, PolicyStatement, Effect } from '@aws-cdk/aws-iam';
import { ConfigModel } from '../../config-model';

export interface SystemProps extends StackProps {
  data: ConfigModel
}

export class CoreStack extends Stack {

  /** @returns the Auth construct instance */
  public readonly auth: Auth;

  /** @returns the Dns construct instance */
  public readonly dns: Dns;

  /** @returns the Inventory construct instance */
  public readonly inventory: Inventory;

  /** @returns the Webui construct instance */
  public readonly webui: Webui;
  
  constructor(scope: App, id: string, props: SystemProps) {
    super(scope, id, props);

    this.auth = new Auth(this, 'AuthConstruct');

    this.webui = new Webui(this, 'WebuiConstruct', {
      deploymentName: props.data.general.solutionName,
      deploymentDescription: props.data.general.description,
      domainName: props.data.dns ? props.data.dns.domainName : undefined,
      certificateArn: props.data.dns ? props.data.dns.certificateArn : undefined
    });

    if (props.data.dns && props.data.dns.hostedZoneId) {
      this.dns = new Dns(this, 'DnsConstruct', {
        fqdn: props.data.dns.domainName,
        description: props.data.general.description,
        hostedZoneId: props.data.dns.hostedZoneId,
        target: this.webui.websiteDistribution
      });
    }

    this.inventory = new Inventory(this, 'Inventory');

    this.inventory.assetsBucket.addToResourcePolicy(
      new PolicyStatement({
        effect: Effect.DENY,
        principals: [new AnyPrincipal()],
        actions: ['s3:PutObject'],
        resources: [this.inventory.assetsBucket.arnForObjects('*')],
        conditions: {
          'StringNotEquals': {
            "s3:x-amz-server-side-encryption": "aws:kms"
          }
        }
      })
    );

    this.inventory.assetsBucket.addToResourcePolicy(
      new PolicyStatement({
        effect: Effect.DENY,
        principals: [new AnyPrincipal()],
        actions: ['s3:PutObject'],
        resources: [this.inventory.assetsBucket.arnForObjects('*')],
        conditions: {
          'Null': {
            "s3:x-amz-server-side-encryption": true
          }
        }
      })
    );

    this.inventory.assetsBucket.addToResourcePolicy(
      new PolicyStatement({
        principals: [new ArnPrincipal(this.auth.adminRole.roleArn)],
        actions: [
          's3:GetObject',
          's3:PutObject'
        ],
        resources: [this.inventory.assetsBucket.arnForObjects('*')]
      }));

    this.auth.adminRole.addToPolicy(new PolicyStatement({
      actions: [
        's3:GetObject',
        's3:PutObject'
      ],
      resources: [this.inventory.assetsBucket.arnForObjects('*')]
    }));

    this.auth.adminRole.addToPolicy(new PolicyStatement({
      actions: [
        'dynamodb:GetItem',
        'dynamodb:PutItem',
        'dynamodb:Query',
        'dynamodb:Scan',
        'dynamodb:DeleteItem',
        'dynamodb:UpdateItem'
      ],
      resources: [
        this.inventory.assetsTable.tableArn,
        this.inventory.conditionsTable.tableArn,
        this.inventory.sensorsTable.tableArn
      ]
    }));

    this.createAdminUser(props);
    this.generateOutputs(props);
  }

  createAdminUser (props: SystemProps) {
    const user = new CfnUserPoolUser(this, `AdminUser`, {
      username: props.data.administrator.username,
      userPoolId: this.auth.userPool.ref,
      userAttributes: [
        {
          name: 'email',
          value: props.data.administrator.email
        },
        {
          name: 'name',
          value: props.data.administrator.name
        }
      ]
    });

    new CfnUserPoolUserToGroupAttachment(this, `AdminAttachment`, {
      userPoolId: this.auth.userPool.ref,
      groupName: this.auth.adminGroup.ref,
      username: user.ref
    });
  }

  generateOutputs (props: SystemProps) {
    // Core
    new CfnOutput(this, 'AwsAccountId', { value: Aws.ACCOUNT_ID });
    new CfnOutput(this, 'AwsRegion', { value: Aws.REGION });

    // Auth
    new CfnOutput(this, 'UserPoolId', { value: this.auth.userPool.ref });
    new CfnOutput(this, 'UserPoolClientId', { value: this.auth.userPoolClient.ref });
    new CfnOutput(this, 'IdentityPoolId', { value: this.auth.identityPool.ref });
    new CfnOutput(this, 'PeopleIotPolicy', { value: this.auth.identityIotPolicy.policyName! });
    new CfnOutput(this, 'AuthenticatedRoleArn', { value: this.auth.identityPoolAuthRole.roleArn });
    new CfnOutput(this, 'UnauthenticatedRoleArn', { value: this.auth.identityPoolUnauthRole.roleArn });

    // Inventory
    new CfnOutput(this, 'InventoryAssetsTableName', { value: this.inventory.assetsTable.tableName });
    new CfnOutput(this, 'InventoryConditionsTableName', { value: this.inventory.conditionsTable.tableName });
    new CfnOutput(this, 'InventorySensorsTableName', { value: this.inventory.sensorsTable.tableName });
    new CfnOutput(this, 'InventoryAssetsBucketName', { value: this.inventory.assetsBucket.bucketName });

    // Web UI
    new CfnOutput(this, 'WebUiBucketName', { value: this.webui.websiteBucket.bucketName });
    new CfnOutput(this, 'WebUiDistributionId', { value: this.webui.websiteDistribution.distributionId });
    new CfnOutput(this, 'WebUiDistributionDomainName', { value: this.webui.websiteDistribution.domainName });

    const callbackUrls = [this.webui.websiteDistribution.domainName];
    if (props.data.dns) {
      callbackUrls.push(props.data.dns.domainName);
      callbackUrls.push(`www.${props.data.dns.domainName}`);
    }

    const loginCallbackUrls = callbackUrls.map(url => `"https://${url}/login"`);
    const logoutCallbackUrls = callbackUrls.map(url => `"https://${url}/logout"`);

    new CfnOutput(this, 'LoginCallbackUrls', { value: `[${loginCallbackUrls.join(',')}]` });
    new CfnOutput(this, 'LogoutCallbackUrls', { value: `[${logoutCallbackUrls.join(',')}]` });
  }
}

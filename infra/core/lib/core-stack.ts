import { Auth } from '../../packages/auth';
import { Inventory } from '../../packages/inventory';
import { Dns } from '../../packages/dns';
import { Webui } from '../../packages/webui';
import { Output, Stack, App, StackProps, Aws } from '@aws-cdk/cdk';
import { CfnUserPoolUser, CfnUserPoolUserToGroupAttachment } from '@aws-cdk/aws-cognito';
import { AnyPrincipal, PolicyStatement, PolicyStatementEffect } from '@aws-cdk/aws-iam';
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
      new PolicyStatement(PolicyStatementEffect.Deny)
        .addPrincipal(new AnyPrincipal())
        .addAction('s3:PutObject')
        .addResource(this.inventory.assetsBucket.arnForObjects('*'))
        .addCondition('StringNotEquals', {
          "s3:x-amz-server-side-encryption": "aws:kms"
        })
    );

    this.inventory.assetsBucket.addToResourcePolicy(
      new PolicyStatement(PolicyStatementEffect.Deny)
        .addPrincipal(new AnyPrincipal())
        .addAction('s3:PutObject')
        .addResource(this.inventory.assetsBucket.arnForObjects('*'))
        .addCondition('Null', {
          "s3:x-amz-server-side-encryption": true
        })
    );

    this.inventory.assetsBucket.addToResourcePolicy(
      new PolicyStatement()
        .addArnPrincipal(this.auth.adminRole.roleArn)
        .addActions(
          's3:GetObject',
          's3:PutObject'
        )
        .addResource(this.inventory.assetsBucket.arnForObjects('*'))
    );

    this.auth.adminRole.addToPolicy(new PolicyStatement()
      .addActions(
        's3:GetObject',
        's3:PutObject'
      )
      .addResource(this.inventory.assetsBucket.arnForObjects('*'))
    );

    this.auth.adminRole.addToPolicy(new PolicyStatement()
      .addActions(
        'dynamodb:GetItem',
        'dynamodb:PutItem',
        'dynamodb:Query',
        'dynamodb:Scan',
        'dynamodb:DeleteItem',
        'dynamodb:UpdateItem'
      )
      .addResources(
        this.inventory.assetsTable.tableArn,
        this.inventory.conditionsTable.tableArn,
        this.inventory.sensorsTable.tableArn
      )
    );

    this.createAdminUser(props);
    this.generateOutputs(props);
  }

  createAdminUser (props: SystemProps) {
    const user = new CfnUserPoolUser(this, `AdminUser`, {
      username: props.data.administrator.username,
      userPoolId: this.auth.userPool.userPoolId,
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
      userPoolId: this.auth.userPool.userPoolId,
      groupName: this.auth.adminGroup.userPoolGroupName,
      username: user.userPoolUserName
    });
  }

  generateOutputs (props: SystemProps) {
    const aws = new Aws();
    const disableExport = true;
    
    // Core
    new Output(this, 'AwsAccountId', { value: aws.accountId, disableExport });
    new Output(this, 'AwsRegion', { value: aws.region, disableExport });

    // Auth
    new Output(this, 'UserPoolId', { value: this.auth.userPool.userPoolId, disableExport });
    new Output(this, 'UserPoolClientId', { value: this.auth.userPoolClient.userPoolClientId, disableExport });
    new Output(this, 'IdentityPoolId', { value: this.auth.identityPool.identityPoolId, disableExport });
    new Output(this, 'PeopleIotPolicy', { value: this.auth.identityIotPolicy.policyName, disableExport });
    new Output(this, 'AuthenticatedRoleArn', { value: this.auth.identityPoolAuthRole.roleArn, disableExport });
    new Output(this, 'UnauthenticatedRoleArn', { value: this.auth.identityPoolUnauthRole.roleArn, disableExport });

    // Inventory
    new Output(this, 'InventoryAssetsTableName', { value: this.inventory.assetsTable.tableName, disableExport });
    new Output(this, 'InventoryConditionsTableName', { value: this.inventory.conditionsTable.tableName, disableExport });
    new Output(this, 'InventorySensorsTableName', { value: this.inventory.sensorsTable.tableName, disableExport });
    new Output(this, 'InventoryAssetsBucketName', { value: this.inventory.assetsBucket.bucketName, disableExport });

    // Web UI
    new Output(this, 'WebUiBucketName', { value: this.webui.websiteBucket.bucketName, disableExport });
    new Output(this, 'WebUiDistributionId', { value: this.webui.websiteDistribution.distributionId, disableExport });
    new Output(this, 'WebUiDistributionDomainName', { value: this.webui.websiteDistribution.domainName, disableExport });

    const callbackUrls = [this.webui.websiteDistribution.domainName];
    if (props.data.dns) {
      callbackUrls.push(props.data.dns.domainName);
      callbackUrls.push(`www.${props.data.dns.domainName}`);
    }

    const loginCallbackUrls = callbackUrls.map(url => `"https://${url}/login"`);
    const logoutCallbackUrls = callbackUrls.map(url => `"https://${url}/logout"`);

    new Output(this, 'LoginCallbackUrls', { value: `[${loginCallbackUrls.join(',')}]`, disableExport });
    new Output(this, 'LogoutCallbackUrls', { value: `[${logoutCallbackUrls.join(',')}]`, disableExport });
  }
}

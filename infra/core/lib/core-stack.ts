import { Auth } from '../../packages/auth';
import { Dns } from '../../packages/dns';
import { Webui } from '../../packages/webui';
import { Output, Stack, App, StackProps, Aws } from '@aws-cdk/cdk';
import { CfnUserPoolUser, CfnUserPoolUserToGroupAttachment } from '@aws-cdk/aws-cognito';
import { ConfigModel } from '../../config-model';

export interface SystemProps extends StackProps {
  data: ConfigModel
}

export class CoreStack extends Stack {

  /** @returns the Auth construct instance */
  public readonly auth: Auth;

  /** @returns the Dns construct instance */
  public readonly dns: Dns;

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

    this.createAdminUser(props);
    this.generateOutputs();
  }

  createAdminUser (props: SystemProps) {
    new CfnUserPoolUser(this, `AdminUser`, {
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
      username: props.data.administrator.username
    });
  }

  generateOutputs () {
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

    // Web UI
    new Output(this, 'WebUiBucketName', { value: this.webui.websiteBucket.bucketName, disableExport });
    new Output(this, 'WebUiDistributionId', { value: this.webui.websiteDistribution.distributionId, disableExport });
    new Output(this, 'WebUiDistributionDomainName', { value: this.webui.websiteDistribution.domainName, disableExport });
  }
}

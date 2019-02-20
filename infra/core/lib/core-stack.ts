import { Auth } from '../../packages/auth';
import { Dns } from '../../packages/dns';
import { Webui } from '../../packages/webui';
import { Output, Stack, App, StackProps, Aws } from '@aws-cdk/cdk';
import { CfnUserPoolUser, CfnUserPoolUserToGroupAttachment } from '@aws-cdk/aws-cognito';

export interface SystemProps extends StackProps {
  solutionName: string,
  solutionDescription: string,
  admin: {
    username: string,
    email: string,
    phoneNumber: string
  },
  dns?: {
    fqdn: string,
    description: string
  }
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

    if (props.dns) {
      this.dns = new Dns(this, 'DnsConstruct', {
        fqdn: props.dns.fqdn,
        description: props.dns.description
      });
    }

    this.webui = new Webui(this, 'WebuiConstruct', {
      deploymentName: props.solutionName,
      deploymentDescription: props.solutionDescription
    });

    this.createAdminUser(props);
    this.generateOutputs();
  }

  createAdminUser (props: SystemProps) {
    new CfnUserPoolUser(this, `AdminUser`, {
      username: props.admin.username,
      userPoolId: this.auth.userPool.userPoolId,
      userAttributes: [
        {
          name: 'email',
          value: props.admin.email
        },
        {
          name: 'name',
          value: 'Administrator'
        },
        {
          name: 'phone_number',
          value: props.admin.phoneNumber
        }
      ]
    });

    new CfnUserPoolUserToGroupAttachment(this, `AdminAttachment`, {
      userPoolId: this.auth.userPool.userPoolId,
      groupName: this.auth.adminGroup.userPoolGroupName,
      username: props.admin.username
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
    new Output(this, 'WebUiDistributionDomainName', { value: this.webui.websiteDistribution.distributionDomainName, disableExport });
  }
}

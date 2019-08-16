import { Role, PolicyStatement, FederatedPrincipal, PolicyDocument } from '@aws-cdk/aws-iam';
import { CfnPolicy } from '@aws-cdk/aws-iot';
import { CfnUserPool, CfnUserPoolClient, CfnIdentityPool, CfnIdentityPoolRoleAttachment, CfnUserPoolGroup } from '@aws-cdk/aws-cognito';
import { Construct, Aws } from '@aws-cdk/cdk';

/**
 * @description Defines an authentication provider module for utilizing within the solution. It leverages Amazon Cognito to provide a fully managed user experience.
 * @author Pelayo Sanchez Margareto <pelaym@amazon.com>
 * @copyright Amazon Web Services EMEA Sarl
 * @license MIT-O
 * @version 0.1.4
 */
export class Auth extends Construct {

  /** @returns the cognito user pool */
  public readonly userPool: CfnUserPool;

  /** @returns the cognito user pool client */
  public readonly userPoolClient: CfnUserPoolClient;

  /** @returns the cognito identity pool */
  public readonly identityPool: CfnIdentityPool;

  /** @returns the identity pool's unauth role */
  public readonly identityPoolUnauthRole: Role;

  /** @returns the identity pool's auth role */
  public readonly identityPoolAuthRole: Role;

  /** @returns the identity pool's role attachments */
  public readonly identityPoolRoleAttachments: CfnIdentityPoolRoleAttachment;

  /** @returns the iot policy used for identities */
  public readonly identityIotPolicy: CfnPolicy;

  /** @returns the administrators cognito group */
  public readonly adminGroup: CfnUserPoolGroup;

  /** @returns the administrators iam role */
  public readonly adminRole: Role;

  constructor(parent: Construct, name: string) {
    super(parent, name);

    const aws = new Aws();
    const awsRegion = aws.region;
    const awsAccountId = aws.accountId;

    this.userPool = new CfnUserPool(this, 'Users', {
      aliasAttributes: ['email'],
      autoVerifiedAttributes: ['email'],
      policies: {
        passwordPolicy: {
          minimumLength: 8,
          requireLowercase: true,
          requireUppercase: true,
          requireNumbers: true,
          requireSymbols: false
        }
      },
      schema: [
        {
          attributeDataType: 'String',
          name: 'email',
          required: true
        },
        {
          attributeDataType: 'String',
          name: 'phone_number',
          required: false
        },
        {
          attributeDataType: 'String',
          name: 'nickname',
          required: false
        }
      ]
    });

    this.userPoolClient = new CfnUserPoolClient(this, 'DefaultClient', {
      clientName: 'default',
      generateSecret: false,
      refreshTokenValidity: 1,
      writeAttributes: [
        'email', 
        'phone_number', 
        'given_name', 
        'family_name'
      ],
      userPoolId: this.userPool.userPoolId,
    });

    this.identityPool = new CfnIdentityPool(this, 'Identities', {
      allowUnauthenticatedIdentities: true,
      cognitoIdentityProviders: [
        {
          clientId: this.userPoolClient.userPoolClientId,
          providerName: this.userPool.userPoolProviderName,
        }
      ]
    });

    this.identityPoolUnauthRole = new Role(this, 'UnauthIdentitiesRole', {
      assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {}, 'sts:AssumeRoleWithWebIdentity')
    });

    this.identityPoolUnauthRole.addToPolicy(new PolicyStatement()
      .addResource(`arn:aws:cognito-identity:${awsRegion}:${awsAccountId}:identitypool/${this.identityPool.identityPoolId}`)
      .addAction('mobileanalytics:PutEvents')
    );

    this.identityPoolAuthRole = new Role(this, 'AuthIdentitiesRole', {
      assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {
        StringEquals: {
          'cognito-identity.amazonaws.com:aud': this.identityPool.identityPoolId
        },
        'ForAnyValue:StringLike': {
          'cognito-identity.amazonaws.com:amr': 'authenticated'
        }
      }, 'sts:AssumeRoleWithWebIdentity')
    });

    this.identityPoolAuthRole.addToPolicy(new PolicyStatement()
      .addResource(`arn:aws:cognito-identity:${awsRegion}:${awsAccountId}:identitypool/${this.identityPool.identityPoolId}`)
      .addAction('mobileanalytics:PutEvents')
    );

    
    // let labMemberRoleMapping: {[key: string]: CfnIdentityPoolRoleAttachment.RoleMappingProperty} = {};

    // const clientId: string = `cognito-idp-${awsRegion}.amazonaws.com/${this.userPool.userPoolId}:${this.userPoolClient.userPoolClientId}`;

    // labMemberRoleMapping[clientId] = {
    //   ambiguousRoleResolution: 'AuthenticatedRole',
    //   type: 'Token'
    // };
    
    this.identityPoolRoleAttachments = new CfnIdentityPoolRoleAttachment(this, 'IdentitiesRoleAttachments', {
      identityPoolId: this.identityPool.identityPoolId,
      roles: {
        unauthenticated: this.identityPoolUnauthRole.roleArn,
        authenticated: this.identityPoolAuthRole.roleArn,
      },
      // roleMappings: labMemberRoleMapping
    });

    this.adminRole = new Role(this, 'AdministratorsRole', {
      assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {
        StringEquals: {
          'cognito-identity.amazonaws.com:aud': this.identityPool.identityPoolId
        },
        'ForAnyValue:StringLike': {
          'cognito-identity.amazonaws.com:amr': 'authenticated'
        }
      }, 'sts:AssumeRoleWithWebIdentity')
    });

    // IoT Core
    this.adminRole.addToPolicy(new PolicyStatement()
      .addResource('*')
      .addActions(
        'iot:Connect',
        'iot:Subscribe',
        'iot:Receive',
        'iot:Publish',
        'iot:AttachPolicy',
        'iot:GetThingShadow',
      )
    );

    // Analytics
    this.adminRole.addToPolicy(new PolicyStatement()
      .addResource(`arn:aws:cognito-identity:${awsRegion}:${awsAccountId}:identitypool/${this.identityPool.identityPoolId}`)
      .addAction('mobileanalytics:PutEvents')
    );

    this.adminGroup = new CfnUserPoolGroup(this, 'AdministratorsGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'Administrators',
      roleArn: this.adminRole.roleArn
    });

    this.identityIotPolicy = new CfnPolicy(this, 'PeoplePolicy', {
      policyName: 'PeoplePolicy',
      policyDocument: new PolicyDocument()
        .addStatement(new PolicyStatement()
          .addResource('*')
          .addAction('iot:*')
        )
    });
  }
}

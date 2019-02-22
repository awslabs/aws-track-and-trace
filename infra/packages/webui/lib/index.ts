import cdk = require('@aws-cdk/cdk');

import { CloudFrontWebDistribution, CfnCloudFrontOriginAccessIdentity, AliasConfiguration, PriceClass } from '@aws-cdk/aws-cloudfront';
import { PolicyStatement, CanonicalUserPrincipal } from '@aws-cdk/aws-iam';
import { Bucket } from '@aws-cdk/aws-s3';
import { RemovalPolicy } from '@aws-cdk/cdk';

export interface WebuiProps {
  deploymentName: string;
  deploymentDescription: string;
  domainName?: string,
  certificateArn?: string,
  priceClass?: PriceClass
}

export class Webui extends cdk.Construct {
  
  /** @returns the website bucket */
  public readonly websiteBucket: Bucket;

  /** @returns the website distribution */
  public readonly websiteDistribution: CloudFrontWebDistribution;

  /** @returns the website origin access identity */
  public readonly websiteOAI: CfnCloudFrontOriginAccessIdentity;

  constructor(scope: cdk.Construct, id: string, props: WebuiProps) {
    super(scope, id);

    // Create the OAI
    this.websiteOAI = new CfnCloudFrontOriginAccessIdentity(this, 'WebsiteOAI', {
      cloudFrontOriginAccessIdentityConfig: {
        comment: props.deploymentDescription
      }
    });

    // Create the S3 bucket
    this.websiteBucket = new Bucket(this, 'WebsiteBucket', {
      removalPolicy: RemovalPolicy.Destroy
    });

    // Configure the bucket policy
    this.websiteBucket.addToResourcePolicy(new PolicyStatement()
      .addPrincipal(new CanonicalUserPrincipal(this.websiteOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId))
      .addActions(
        's3:GetObject',
        's3:ListBucket'
      )
      .addResource(this.websiteBucket.bucketArn)
      .addResource(this.websiteBucket.arnForObjects('*'))
    );

    const aliasConfiguration: AliasConfiguration | undefined = props.domainName && props.certificateArn ? {
      acmCertRef: props.certificateArn,
      names: [
        props.domainName,
        `www.${props.domainName}`
      ]
    } : undefined;

    this.websiteDistribution = new CloudFrontWebDistribution(this, 'WebsiteDistribution', {
      aliasConfiguration,
      comment: props.deploymentDescription,
      defaultRootObject: 'index.html',
      errorConfigurations: [
        {
          errorCode: 404,
          responseCode: 200,
          responsePagePath: '/'
        }
      ],
      originConfigs: [
        {
          behaviors: [
            {
              minTtlSeconds: 0,
              defaultTtlSeconds: 5,
              maxTtlSeconds: 86400,
              forwardedValues: {
                queryString: true
              },
              isDefaultBehavior: true
            }
          ],
          s3OriginSource: {
            originAccessIdentity: this.websiteOAI,
            s3BucketSource: this.websiteBucket
          }
        }
      ],
      priceClass: props.priceClass || PriceClass.PriceClass100
    });
  }
}
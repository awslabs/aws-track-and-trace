import cdk = require('@aws-cdk/cdk');

import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as iam from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';

export interface WebuiProps {
  deploymentName: string;
  deploymentDescription: string;
  aliases?: string[];
  origins?: cloudfront.CfnDistribution.OriginProperty[];
  cacheBehaviors?: cloudfront.CfnDistribution.CacheBehaviorProperty[];
}

export class Webui extends cdk.Construct {
  
  /** @returns the website bucket */
  public readonly websiteBucket: s3.Bucket;

  /** @returns the website distribution */
  public readonly websiteDistribution: cloudfront.CfnDistribution;

  /** @returns the website origin access identity */
  public readonly websiteOAI: cloudfront.CfnCloudFrontOriginAccessIdentity;

  constructor(scope: cdk.Construct, id: string, props: WebuiProps) {
    super(scope, id);

    // Create the OAI
    this.websiteOAI = new cloudfront.CfnCloudFrontOriginAccessIdentity(this, 'WebsiteOAI', {
      cloudFrontOriginAccessIdentityConfig: {
        comment: props.deploymentDescription
      }
    });

    // Create the S3 bucket
    this.websiteBucket = new s3.Bucket(this, 'WebsiteBucket');

    // Configure the bucket policy
    this.websiteBucket.addToResourcePolicy(new iam.PolicyStatement()
      .addPrincipal(new iam.CanonicalUserPrincipal(this.websiteOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId))
      .addActions(
        's3:GetObject',
        's3:ListBucket'
      )
      .addResource(this.websiteBucket.bucketArn)
      .addResource(this.websiteBucket.arnForObjects('*'))
    );

    // Create the cloudfront distribution
    const origins: cloudfront.CfnDistribution.OriginProperty[] = [];
    origins.push({
      id: 'default',
      domainName: this.websiteBucket.domainName,
      s3OriginConfig: {
        originAccessIdentity: `origin-access-identity/cloudfront/${this.websiteOAI.cloudFrontOriginAccessIdentityId}`
      }
    });
    origins.push.apply(origins, props.origins || []);

    this.websiteDistribution = new cloudfront.CfnDistribution(this, 'WebsiteDistribution', {
      distributionConfig: {
        aliases: props.aliases,
        priceClass: 'PriceClass_100',
        enabled: true,
        comment: props.deploymentDescription,
        defaultCacheBehavior: {
          minTtl: 0,
          defaultTtl: 5,
          maxTtl: 5,
          targetOriginId: 'default',
          viewerProtocolPolicy: 'redirect-to-https',
          forwardedValues: {
            queryString: true
          }
        },
        cacheBehaviors: props.cacheBehaviors,
        defaultRootObject: 'index.html',
        customErrorResponses: [
          {
            errorCode: 404,
            responseCode: 200,
            responsePagePath: '/'
          }
        ],
        origins
      }
    });
  }
}

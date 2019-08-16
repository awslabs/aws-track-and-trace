import { CloudFrontWebDistribution, CfnCloudFrontOriginAccessIdentity, AliasConfiguration, PriceClass } from '@aws-cdk/aws-cloudfront';
import { PolicyStatement, CanonicalUserPrincipal } from '@aws-cdk/aws-iam';
import { Bucket } from '@aws-cdk/aws-s3';
import { RemovalPolicy, Construct, Duration } from '@aws-cdk/core';

export interface WebuiProps {
  deploymentName: string;
  deploymentDescription: string;
  domainName?: string,
  certificateArn?: string,
  priceClass?: PriceClass
}

export class Webui extends Construct {
  
  /** @returns the website bucket */
  public readonly websiteBucket: Bucket;

  /** @returns the website distribution */
  public readonly websiteDistribution: CloudFrontWebDistribution;

  /** @returns the website origin access identity */
  public readonly websiteOAI: CfnCloudFrontOriginAccessIdentity;

  constructor(scope: Construct, id: string, props: WebuiProps) {
    super(scope, id);

    // Create the OAI
    this.websiteOAI = new CfnCloudFrontOriginAccessIdentity(this, 'WebsiteOAI', {
      cloudFrontOriginAccessIdentityConfig: {
        comment: props.deploymentDescription
      }
    });

    // Create the S3 bucket
    this.websiteBucket = new Bucket(this, 'WebsiteBucket', {
      removalPolicy: RemovalPolicy.DESTROY
    });

    // Configure the bucket policy
    this.websiteBucket.addToResourcePolicy(new PolicyStatement({
      principals: [new CanonicalUserPrincipal(this.websiteOAI.attrS3CanonicalUserId)],
      actions: [
        's3:GetObject',
        's3:ListBucket'
      ],
      resources: [
        this.websiteBucket.bucketArn,
        this.websiteBucket.arnForObjects('*')
      ]
    })
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
              minTtl: Duration.seconds(0),
              defaultTtl: Duration.seconds(5),
              maxTtl: Duration.seconds(86400),
              forwardedValues: {
                queryString: true
              },
              isDefaultBehavior: true
            }
          ],
          s3OriginSource: {
            originAccessIdentityId: this.websiteOAI.ref,
            s3BucketSource: this.websiteBucket
          }
        }
      ],
      priceClass: props.priceClass || PriceClass.PRICE_CLASS_100
    });
  }
}
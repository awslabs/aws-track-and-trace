import { Construct } from '@aws-cdk/core';
import { CloudFrontWebDistribution } from '@aws-cdk/aws-cloudfront';
import { HostedZone, IHostedZone, RecordSet, RecordTarget, RecordType } from '@aws-cdk/aws-route53';
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets'

export interface DnsProps {
  fqdn: string,
  description: string,
  hostedZoneId: string,
  target: CloudFrontWebDistribution
}

export class Dns extends Construct {
  
  /** @returns the Hosted zone */
  public readonly hostedZone: IHostedZone;

  /** @returns the main website record set */
  public readonly websiteMainRecordSet: RecordSet;

  /** @returns the www record set */
  public readonly websiteWwwRecordSet: RecordSet;

  constructor(scope: Construct, id: string, props: DnsProps) {
    super(scope, id);

    // Create the hosted zone
    this.hostedZone = HostedZone.fromHostedZoneId(this, 'HostedZone', props.hostedZoneId);

    this.websiteMainRecordSet = new RecordSet(this, 'MainRecord', {
      recordName: `${props.fqdn}.`,
      recordType: RecordType.A,
      target: RecordTarget.fromAlias(new CloudFrontTarget(props.target)),
      zone: this.hostedZone
    });
  }
}

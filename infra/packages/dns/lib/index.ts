import { Construct } from '@aws-cdk/cdk';
import { CloudFrontWebDistribution } from '@aws-cdk/aws-cloudfront';
import { HostedZone, IHostedZone, AliasRecord } from '@aws-cdk/aws-route53';

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
  public readonly websiteMainRecordSet: AliasRecord;

  /** @returns the www record set */
  public readonly websiteWwwRecordSet: AliasRecord;

  constructor(scope: Construct, id: string, props: DnsProps) {
    super(scope, id);

    // Create the hosted zone
    this.hostedZone = HostedZone.import(this, 'HostedZone', {
      hostedZoneId: props.hostedZoneId,
      zoneName: props.fqdn
    });

    this.websiteMainRecordSet = new AliasRecord(this, 'MainRecord', {
      recordName: `${props.fqdn}.`,
      target: props.target,
      zone: this.hostedZone
    });
  }
}

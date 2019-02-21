import { Construct } from '@aws-cdk/cdk';
import { HostedZone, CfnRecordSet } from '@aws-cdk/aws-route53';

export interface DnsProps {
  fqdn: string,
  description: string
}

export class Dns extends Construct {
  
  /** @returns the Hosted zone */
  public readonly hostedZone: HostedZone;

  /** @returns the main website record set */
  public readonly websiteMainRecordSet: CfnRecordSet;

  /** @returns the www record set */
  public readonly websiteWwwRecordSet: CfnRecordSet;

  constructor(scope: Construct, id: string, props: DnsProps) {
    super(scope, id);

    // Create the hosted zone
    this.hostedZone = new HostedZone(this, 'HostedZone', {
      comment: props.description,
      zoneName: props.fqdn
    });
  }
}

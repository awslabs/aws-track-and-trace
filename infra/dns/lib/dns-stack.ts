import { Stack, App, StackProps, CfnOutput } from '@aws-cdk/core';
import { Certificate } from '@aws-cdk/aws-certificatemanager';
import { HostedZone, IHostedZone } from '@aws-cdk/aws-route53';

export interface DnsProps extends StackProps {
  solutionName: string,
  domainName: string,
  description: string,
  hostedZoneId?: string
}

export class DnsStack extends Stack {

  /** @returns The created certificate */
  public readonly certificate: Certificate;

  /** @returns the hosted zone */
  public readonly hostedZone: IHostedZone;

  constructor(scope: App, id: string, props: DnsProps) {
    super(scope, id, props);

    if (props.hostedZoneId) {
      this.hostedZone = HostedZone.fromHostedZoneId(this, 'HostedZone', props.hostedZoneId);
    } else {
      this.hostedZone = new HostedZone(this, 'HostedZone', {
        comment: props.description,
        zoneName: props.domainName
      });
    }

    this.certificate = new Certificate(this, 'Certificate', {
      domainName: `*.${props.domainName}`
    });

    new CfnOutput(this, `CertificateArn`, { exportName: `${props.solutionName}-certificate`, value: this.certificate.certificateArn });
    new CfnOutput(this, 'HostedZoneId', { exportName: `${props.solutionName}-hosted-zone`, value: this.hostedZone.hostedZoneId });
  }
}

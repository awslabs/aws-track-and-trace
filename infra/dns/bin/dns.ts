#!/usr/bin/env node
import { DnsStack } from '../lib/dns-stack';
import { App } from '@aws-cdk/core';
import { Config } from '../../config';


const app = new App();
if (Config.dns) {
  new DnsStack(app, `${Config.general.solutionName}-DNS`, {
    solutionName: Config.general.solutionName,
    description: Config.general.description,
    domainName: Config.dns.domainName,
    hostedZoneId: Config.dns.hostedZoneId,
    env: {
      region: 'us-east-1'
    }
  });
} else {
  console.error('ERROR: No DNS configuration specified. This is not needed');
  process.exit(1);
}
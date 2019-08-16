#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import { CoreStack } from '../lib/core-stack';
import { Config } from '../../config';

const app = new cdk.App();
new CoreStack(app, Config.general.solutionName, {
  data: Config
});

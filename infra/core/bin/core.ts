#!/usr/bin/env node
import cdk = require('@aws-cdk/cdk');
import { CoreStack } from '../lib/core-stack';

const app = new cdk.App();
new CoreStack(app, 'PLP', {
  solutionName: 'eirnvienbtv',
  solutionDescription: 'einvienbvt',
  admin: {
    username: 'admin',
    email: 'something',
    phoneNumber: 'something'
  }
});
app.run();

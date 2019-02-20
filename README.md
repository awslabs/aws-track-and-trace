# AWS Fleet Management System

Sample system to track and trace vehicles and assets in the cloud. This project contains infrastructure definition and sample code for spinning up a web user interface with a map, in which you can connect your existing or simulated vehicles and assets, and visualize how they progress through their journey.

## Getting started

This project uses the [AWS Cloud Development Kit](https://github.com/awslabs/aws-cdk) - aka CDK - for describing the infrastructure resources needed. These resources are eventually synthetised into a CloudFormation template so it could equally be spun up directly through CloudFormation. 

_NOTE: Independently of the deployment method you choose for spinning up the solution, upon deploying the solution you will need to execute some manual steps. Please refer to the [MANUAL_CONFIG](./MANUAL_CONFIG.md) page for details.

### Direct deployment

TODO

### CDK Deployment

TODO

## Using the system

Once your system is deployed and fully configured, you should be able to reach it from a web browser. You will need to find the domain name of the CloudFront distribution deployed by this system - typically in the form of `xxyyzz.cloudfront.net`. Once you've got that, type the URL in a browser.

### The Fleet map

TODO

### Adding vehicles

TODO
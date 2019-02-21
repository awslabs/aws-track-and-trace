# AWS Fleet Management System

Sample system to track and trace vehicles and assets in the cloud. This project contains infrastructure definition and sample code for spinning up a web user interface with a map, in which you can connect your existing or simulated vehicles and assets, and visualize how they progress through their journey.

* [Getting started](#getting-started)
* * [Prerequisites](#prerequisites)
* * [Spinning up the infrastructure](#spinning-up-the-infrastructure)
* * [Deploying the UI](#deploying-the-ui)
* [Using the system](#using-the-system)

## Getting started

This project uses the [AWS Cloud Development Kit](https://github.com/awslabs/aws-cdk) - aka CDK - for describing the infrastructure resources needed. 

_NOTE: Upon deploying the solution you will need to execute some manual steps. Please refer to the [MANUAL_CONFIG](./MANUAL_CONFIG.md) page for details._

### Prerequisites

You will need to have the following software installed in your workstation to successfully deploy this project:

* **AWS CLI:** You will need to install the [AWS CLI](https://aws.amazon.com/cli/) and configure your access keys to interact with your AWS account. _NOTE: You will need Python and pip installed to do this._
* **AWS CDK:** Follow the instructions [here](https://github.com/awslabs/aws-cdk) to install the Cloud Development Kit.
* **jq:** You need the [`jq`](https://stedolan.github.io/jq/) cli to configure your system.
* **Clone this repository:** Get the contents of the project in your machine.

### Spinning up the infrastructure

Once you have a local copy of the project in your local machine, you need to configure the required parameters for deploying the infrastructure. Navigate to the `infra/` folder and open the `config.json` file.



### Deploying the UI

TODO

## Using the system

Once your system is deployed and fully configured, you should be able to reach it from a web browser. You will need to find the domain name of the CloudFront distribution deployed by this system - typically in the form of `xxyyzz.cloudfront.net`. Once you've got that, type the URL in a browser.

### Landing page

Once you reach

### The Fleet map

TODO

### Adding vehicles

TODO

## License Summary

This sample code is made available under a modified MIT license. See the LICENSE file.

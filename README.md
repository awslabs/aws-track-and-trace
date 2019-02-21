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
* **AWS CDK:** Follow the instructions [here](https://github.com/awslabs/aws-cdk) to install the Cloud Development Kit. _NOTE: You will need to have `Node.js` and `npm` installed to do this._
* **jq:** You need the [`jq`](https://stedolan.github.io/jq/) cli to configure your system.
* **Clone this repository:** Get the contents of the project in your machine.

### Preparing the infrastructure

#### Configuring the project

Once you have a local copy of the project in your local machine, you need to configure the required parameters for deploying the infrastructure. Navigate to the `infra/` folder and open the `config.sample.json` file.

```json
{
  "general": {
    "name": "Give a name to your solution",
    "description": "Give a description to your solution"
  },
  "administrator": {
    "name": "Your name",
    "email": "your.email@example.com",
    "username": "admin",
    "phone": "+1234567890"
  },
  "dns?": {
    "fqdn": "myfleet.example.com",
    "hosted_zone?": "Hosted Zone ID"
  }
}
```

_NOTE: All parameters ending with a question mark are optional._

* **General:** Basic information about the deployment.
* * **Name:** Human friendly name of your solution.
* * **Description:** Description of your solution.
* **Administrator:** Information about the administrator user
* * **Name:** Full name of the administrator user.
* * **Email:** Email address of the administrator user.
* * **Username:** User name for the admin user.
* * **Phone:** Phone number of the admin user.
* **Dns:** Information about the DNS records.
* * **Fqdn:** Domain name of the solution.
* * **Hosted_zone:** ID of the existing hosted zone.

Configure the values to your best convenience and store the result at `infra/config.json`. This file will configure your deployment once we move forward.

#### Preparing the modules

The infrastructure of this project is completely modular. All infrastructure is stored under the `infra/` folder, and modules can be found at the `packages` folder inside it. The `core` folder puts all modules together into a CDK Application, that will be responsible for deploying the infrastructure as a whole.

We have created a script that will help you autommatically build all modules and infrastructure definition, so its ready to be deployed without many extra steps. From the project folder on a terminal, simply run `npm run build:infra`.

#### Starting the deployment

Once the infrastructure definition code is ready, we can proceed to deploy it into our AWS account. We will use the CDK deployment tools to do this.

* Navigate to the `infra/core` folder.
* Run `cdk deploy`, and confirm the operation.

_NOTE: Optionally, you can run `cdk synth` to output a CloudFormation template of your infrastructure definition, to spin it up using CloudFormation directly._

This will kickstart the deployment process, which may take about 15-20 minutes to complete. Time for a coffee and coming back!

#### Verifying the deployment

The `cdk deploy` task will synchronously create the resources and wait for their completion, so you will see all progress appearing in the console. To see the detailed status of the deployment, you can also follow it from the [CloudFormation console](https://eu-west-1.console.aws.amazon.com/cloudformation/home). Once the infrastructure finishes deploying, we could safely continue to the next steps.

Is your infrastructure not deploying correctly? Take a look at the [TROUBLESHOOTING](./TROUBLESHOOTING.md#failed-during-infrastructure-spin-up) section.

_NOTE: Remember to execute the [After deployment manual steps](./MANUAL_CONFIG.md#after-deployment)_ to fully configure the infrastructure once it finishes deploying.

### Deploying the UI

Once your infrastructure is ready, we need to configure and deploy the UI code into it so we could access it and use it. 

#### Reflecting the deployment manual steps

Once you've finished up executing your manual steps, you will have several values to reflect in the infrastructure so the system could work successfully. You will therefore need to edit your `infra/config.json` file to include these values:

```json
{
  ...
  "auth": {
    "domain": "myfleetauth or auth.myfleet.example.com",
    "fqdn?": "aabbccdd.cloudfront.net"
  }
}
```

TODO Maps API Keys and other stuff.

* `fqdn`: [Optional] If you plan to use your own domain for authentication, this value needs to be populated with the Cognito's given distribution URL for your login UI.
* `domain`: If you configured a Cognito hosted domain input the prefix of such domain here - e.g. `myfleetauth`. If you're using your own domain, input the fully qualified domain name of your desired auth domain - e.g. `auth.myfleet.example.com`. _NOTE: If you choose this latter approach, you will have had to reference either a Hosted Zone or a custom domain to create the zone for in the previous infrastructure processes._

Once you've reflected these values, you will need to re-deploy the infrastructure:

* Navigate to `infra/core` folder.
* Run `npm run build`.
* Run `cdk deploy`.

Once the infrastructure finishes re-deploying - it should be much quicker than the first time - you'll be ready to continue.

#### Preparing and deploying the UI

In order for the UI to fully comprehend the underlying infrastructure, we need to configure it reflecting the required resource identifiers. All these identifiers have been defined as outputs in the infrastructure definition, so we could automate the configuration process. Navigate to the project's root folder and run `npm run configure:ui`.

Once your UI finishes configuring, you are ready to deploy it. From the project's root folder, run `npm run deploy:ui`.

Is the UI not deploying correctly? Take a look at the [TROUBLESHOOTING](./TROUBLESHOOTING.md#failed-during-ui-deployment) section.

When your deployment finishes successfully you could start testing it by accessing its URL. If you have configured your custom domain you could simply navigate to it - e.g. `myfleet.example.com`. Otherwise you'll need to retrieve the distribution URL, which will be the entry point to your solution. From the project's root folder execute `npm run get:ui-entry-point`. It will print the distribution URL to the standard output.

## Using the system

Type the URL you've gathered previously on a browser. You will be redirected to your recently deployed system, more specifically to the UI's landing page. 

TODO Image

Click on the _Access_ button to start the authentication process. You should be redirected to the Cognito login page. In there you can use the username you've defined in the `infra/config.json` file, along with a password that you should've received over email. Use those credentials and log in. You should be asked to change your password, and use your new credentials to finalize the login process. Once you've done that, you should be redirected back to the private section of the solution's UI.

### Fleet map

The UI is a Single Page Application that renders a fullscreen map and certain tools to interact with the solution. The first time you access the map it should have no assets present. You should be able to zoom and pan the map to your desire.

TODO Processes

## License Summary

This sample code is made available under a modified MIT license. See the [LICENSE](./LICENSE.md) file.

### Graphical content

* **Landing page background image:** Licensed under the [Pixabay license](https://pixabay.com/en/service/license/).
* **Logo**: Truck licensed under the [Pixabay license](https://pixabay.com/en/service/license/), modified to include the AWS logo and the solution title.

# Manual configuration steps

For successfully using this system, you'll need to run this manual steps along with the infrastructure deployment. Please follow this guide to configure them.

## BEFORE deployment

### If you want to use your custom domain

_NOTE: This process assumes you have your fqdn domain configured in AWS Route53, with an existing hosted zone. If that's not your case, please follow [this guide](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/CreatingHostedZone.html) to create one._

One of the deployed resources is a CloudFront distribution, which will be responsible for serving you and other users all front-end content of the system. By default, CloudFront will create a unique domain name - with the format `xxyyzz.cloudfront.net` - that you can use to access the system. Whilst this is handy for testing purposes, the generated URL is not human-friendly if you plan on sharing it. Instead, you can configure the system to load when you access one custom domain you own - e.g. `fleetmanagement.example.com`.

#### Request your certificate

If you want to use your custom domain, you need to create a certificate that will be used to verify the domain's ownership identity when your users reach the system, avoiding a security exception to be shown to them.

![Request a certificate in ACM](/static/acm-request.png)

You need to validate the ownership of the domain you're requesting a certificate for, either via Email or DNS. As we are using Route53 for our Hosted Zone, DNS validation is quite easy to perform:

![ACM Ownership validation](/static/acm-verify.png)

After your certificate status transitions to `Verified`, you can use the certificate arn for linking it to our webapp distribution, by pasting the value on the `CertificateArn` parameter of the CloudFormation template. Then we need to perform an stack update to adapt to these changes - it will also take some time.

#### Configure distribution aliases

Apart from registering your certificate, you need to reference the domain you wish to use, so upon system's deployment all neccessary linkings happen successfully. There are two parameters that you will need to referenxe on the template/construct:

* **Hosted Zone ID:** Used to create all needed record sets for reference your distribution there.
* **UI Domain name:** Select the domain name you want to use for accessing your solution - e.g. `myfleet.mywebsite.com` - so the deployment can link your distribution successfully with the domain.

## AFTER deployment

Once your infrastructure is correctly spun up, you will need to perform the last manual steps for fully fine-tuning the system.

_NOTE: After executing these steps another deployment will be needed, to reference all infrastructure and configuration definitions correctly in the spun-up CloudFormation Stack. This will allow the UI to fetch all needed parameters to work properly._

### Configuring users resources

With the deployment of our last stack, we have created several resources that will be used for authenticating and authorizing users in your platform. This is handled mostly by [Amazon Cognito](https://aws.amazon.com/cognito/), that will store and manage your user base, and perform any auth/n tasks required for your users to consume your services.

There is a couple of manual steps we need to perform to finish configuring these resources:

#### Configure authentication providers

In the Cognito console you can configure how each User Pool Client interacts with its User Pool, and which authentication mechanisms it is allowed to perform:

![Cognito App Client configuration](/static/cognito-client-settings.png)

We need to enable Cognito as an enabled Identity Provider, and configure our login and logout URLs for our system - these URLs will be the only one authorized as callbacks from the login system upon any login/logout operation. Then we need to setup `implicit grant` as an allowed OAuth flow. Implicit grant allows Cognito to resolve Access Tokens directly and send them back to the application. We will only use `openid` as allowed OAuth scope.

#### Configure Custom domain

Once the authentication provider is set, we need to configure a domain for hosting our custom login UI. The login UI is handled by Cognito, which needs only an endpoint to host the application into. 

There are two options for configuring your Custom Login UI domain name: 

* **Use a custom prefix on the standard auth domain:** This will give you the ability to have your login UI hosted at `myprefix.auth.AWS_REGION.amazoncognito.com`.
* **Use your own custom login domain:** If you have your own domain, you can also use a custom subdomain to reach your login UI - e.g. `auth.myfleet.mywebsite.com`. 

![Cognito Custom domain](/static/cognito-domain-setup.png)

_NOTE: If you've chosen to use your custom domain, you may need to create another ACM certificate for it, unless the previously created one also validated the identity of the auth domain. You will also need to create an alias recordset on our Hosted Zone to correctly resolve the DNS name of the auth system to the proper distribution URL. Copy the value of the Alias target for your login domain, and paste it in the `LoginDomainAliasTarget` parameter of the dashboard CloudFormation template._

![Cognito Alias setup](/static/cognito-domain-alias-setup.png)

Once these steps have been completed, you can deploy the solution again, and reference all values as their corresponding parameters' values.
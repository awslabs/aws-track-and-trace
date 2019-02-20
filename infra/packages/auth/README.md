# Human authentication module

The `auth` module provides authentication and authorisation mechanisms for human stakeholders that use the system. It uses Amazon Cognito to enable you to store your own user base within your deployment, and allows you to define RBAC policies for individual users and/or groups. 

## Module components

The `auth` module comprehends all resources needed for an authentication system, including default configuration for being instantly ready to use. These are the resources this module includes:

* **Cognito User Pool:** Stores your users and groups and provides a built-in customizable login experience for web and mobile apps. This user pool is built with a `default` app client, that you can use to leverage authentication capabilities right out of the box. You can add multiple other clients for the different consumers of the module.
* **Cognito Identity Pool:** Enables federated access to AWS resources for users within the User Pool. Configured already for the default User Pool client, this Identity Pool provides AWS credentials for users of the User Pool.
* **Identity Pool default roles:** The IdP is configured with two IAM roles, used by default for both `authenticated` and `unauthenticated` users. 

#!/bin/bash
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
project_dir="${script_dir}/.."
requested_domain_name="${1:-none}"
if [ "none" = $requested_domain_name ]; then
  echo "ERROR: Parameter domain name is mandatory, and not given."
  exit 1
fi

source ${script_dir}/config.sh
source ${script_dir}/config.infra.sh

echo "INFO: Starting post-deployment tasks"
echo "INFO: Requesting custom login domain ${requested_domain_name}"
aws cognito-idp create-user-pool-domain \
  --domain ${requested_domain_name} \
  --user-pool-id $USER_POOL_ID
prev_code=$(echo $?)
if [ "0" != $prev_code ]; then
  echo "ERROR: Failed to create user pool domain. Check the error and try again"
  exit 1
fi

echo "INFO: Successfully created domain ${requested_domain_name}"
echo "INFO: Remember reflecting this value in your config.sh file"

echo "INFO: Enabling User Pool client to authorize users"
aws cognito-idp update-user-pool-client \
  --user-pool-id $USER_POOL_ID \
  --client-id $USER_POOL_CLIENT_ID \
  --allowed-o-auth-flows-user-pool-client \
  --allowed-o-auth-flows "implicit" \
  --allowed-o-auth-scopes "openid" \
  --callback-urls $LOGIN_CALLBACK_URLS \
  --logout-urls $LOGOUT_CALLBACK_URLS \
  --supported-identity-providers '["COGNITO"]'
prev_code=$(echo $?)
if [ "0" != $prev_code ]; then
  echo "ERROR: Failed to configure User pool client."
  exit 1
fi

echo "INFO: Configure token-based role assignment in Identity Pool"
aws cognito-identity set-identity-pool-roles \
  --identity-pool-id $IDENTITY_POOL_ID \
  --roles "unauthenticated=${UNAUTHENTICATED_ROLE_ARN},authenticated=${AUTHENTICATED_ROLE_ARN}" \
  --role-mappings "{\"cognito-idp.${AWS_REGION}.amazonaws.com/${USER_POOL_ID}:${USER_POOL_CLIENT_ID}\": {\"Type\": \"Token\",\"AmbiguousRoleResolution\": \"AuthenticatedRole\"}}"
prev_code=$(echo $?)
if [ "0" != $prev_code ]; then
  echo "ERROR: Failed to configure role mappings."
  exit 1
fi

echo "INFO: Successfully configured Identity Pool"

echo "INFO: Your system is configured. Remember to update your config.sh file to reflect your login domain"
echo "INFO: See README.md for details"
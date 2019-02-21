#!/bin/bash
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
project_dir="${script_dir}/.."
dashboard_dir="${project_dir}/dashboard"

echo "INFO: Configuring UI"

source ${script_dir}/config.sh

echo "INFO: Fetching deployment information."
stack_description=$(aws cloudformation describe-stacks --stack-name ${STACK_NAME})

aws_account_id=$(echo $stack_description | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "AwsAccountId") | .OutputValue')
aws_region=$(echo $stack_description | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "AwsRegion") | .OutputValue')
user_pool_id=$(echo $stack_description | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "UserPoolId") | .OutputValue')
user_pool_client_id=$(echo $stack_description | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "UserPoolClientId") | .OutputValue')
identity_pool_id=$(echo $stack_description | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "IdentityPoolId") | .OutputValue')
iot_endpoint=$(aws iot describe-endpoint | jq -r '.endpointAddress')

echo "INFO: Creating JSON configuration"
config="{ \
  \"AWS_ACCOUNT_ID\": \"${aws_account_id}\", \
  \"AWS_REGION\": \"${aws_region}\", \
  \"USER_POOL_ID\": \"${user_pool_id}\", \
  \"USER_POOL_CLIENT_ID\": \"${user_pool_client_id}\", \
  \"IDENTITY_POOL_ID\": \"${identity_pool_id}\", \
  \"COGNITO_CUSTOM_DOMAIN\": \"${COGNITO_CUSTOM_DOMAIN}\", \
  \"IOT_ENDPOINT\": \"${iot_endpoint}\", \
  \"APP_CLIENT_NAME\": \"${APP_CLIENT_NAME}\"
}"

echo "INFO: Writing JSON configuration"
echo $config > $dashboard_dir/src/assets/config.json

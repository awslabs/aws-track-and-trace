#!/bin/bash
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
project_dir="${script_dir}/.."

source ${script_dir}/config.sh

echo "INFO: Fetching deployment information."
stack_description=$(aws cloudformation describe-stacks --stack-name ${STACK_NAME})

export web_ui_bucket_name=$(echo $stack_description | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "WebUiBucketName") | .OutputValue')
export web_distributon_domain_name=$(echo $stack_description | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "WebUiDistributionDomainName") | .OutputValue')
export aws_account_id=$(echo $stack_description | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "AwsAccountId") | .OutputValue')
export aws_region=$(echo $stack_description | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "AwsRegion") | .OutputValue')
export user_pool_id=$(echo $stack_description | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "UserPoolId") | .OutputValue')
export user_pool_client_id=$(echo $stack_description | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "UserPoolClientId") | .OutputValue')
export identity_pool_id=$(echo $stack_description | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "IdentityPoolId") | .OutputValue')
export inventory_assets_table_name=$(echo $stack_description | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "InventoryAssetsTableName") | .OutputValue')
export inventory_conditions_table_name=$(echo $stack_description | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "InventoryConditionsTableName") | .OutputValue')
export inventory_sensors_table_name=$(echo $stack_description | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "InventorySensorsTableName") | .OutputValue')
export inventory_assets_bucket_name=$(echo $stack_description | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "InventoryAssetsBucketName") | .OutputValue')
export iot_endpoint=$(aws iot describe-endpoint --endpoint-type iot:Data-ATS | jq -r '.endpointAddress')
export people_policy_name=$(echo $stack_description | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "PeopleIotPolicy") | .OutputValue')
export unauthenticated_role_arn=$(echo $stack_description | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "UnauthenticatedRoleArn") | .OutputValue')
export authenticated_role_arn=$(echo $stack_description | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "AuthenticatedRoleArn") | .OutputValue')
export login_callback_urls=$(echo $stack_description | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "LoginCallbackUrls") | .OutputValue')
export logout_callback_urls=$(echo $stack_description | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "LogoutCallbackUrls") | .OutputValue')

echo "#!/bin/bash" > ${script_dir}/config.infra.sh
echo "export WEB_UI_BUCKET_NAME=\"$web_ui_bucket_name\"" >> ${script_dir}/config.infra.sh
echo "export WEB_DISTRIBUTION_DOMAIN_NAME=\"$web_distributon_domain_name\"" >> ${script_dir}/config.infra.sh
echo "export AWS_ACCOUNT_ID=\"$aws_account_id\"" >> ${script_dir}/config.infra.sh
echo "export AWS_REGION=\"$aws_region\"" >> ${script_dir}/config.infra.sh
echo "export USER_POOL_ID=\"$user_pool_id\"" >> ${script_dir}/config.infra.sh
echo "export USER_POOL_CLIENT_ID=\"$user_pool_client_id\"" >> ${script_dir}/config.infra.sh
echo "export IOT_ENDPOINT=\"$iot_endpoint\"" >> ${script_dir}/config.infra.sh
echo "export PEOPLE_POLICY_NAME=\"$people_policy_name\"" >> ${script_dir}/config.infra.sh
echo "export IDENTITY_POOL_ID=\"$identity_pool_id\"" >> ${script_dir}/config.infra.sh
echo "export INVENTORY_ASSETS_TABLE_NAME=\"$inventory_assets_table_name\"" >> ${script_dir}/config.infra.sh
echo "export INVENTORY_CONDITIONS_TABLE_NAME=\"$inventory_conditions_table_name\"" >> ${script_dir}/config.infra.sh
echo "export INVENTORY_SENSORS_TABLE_NAME=\"$inventory_sensors_table_name\"" >> ${script_dir}/config.infra.sh
echo "export INVENTORY_ASSETS_BUCKET_NAME=\"$inventory_assets_bucket_name\"" >> ${script_dir}/config.infra.sh
echo "export UNAUTHENTICATED_ROLE_ARN=\"$unauthenticated_role_arn\"" >> ${script_dir}/config.infra.sh
echo "export AUTHENTICATED_ROLE_ARN=\"$authenticated_role_arn\"" >> ${script_dir}/config.infra.sh
echo "export LOGIN_CALLBACK_URLS='$login_callback_urls'" >> ${script_dir}/config.infra.sh
echo "export LOGOUT_CALLBACK_URLS='$logout_callback_urls'" >> ${script_dir}/config.infra.sh

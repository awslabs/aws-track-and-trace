#!/bin/bash
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
project_dir="${script_dir}/.."
dashboard_dir="${project_dir}/dashboard"

echo "INFO: Configuring UI"

source ${script_dir}/config.sh
source ${script_dir}/config.infra.sh

echo "INFO: Creating JSON configuration"
config="{ \
  \"AWS_ACCOUNT_ID\": \"${AWS_ACCOUNT_ID}\", \
  \"AWS_REGION\": \"${AWS_REGION}\", \
  \"USER_POOL_ID\": \"${USER_POOL_ID}\", \
  \"USER_POOL_CLIENT_ID\": \"${USER_POOL_CLIENT_ID}\", \
  \"IDENTITY_POOL_ID\": \"${IDENTITY_POOL_ID}\", \
  \"COGNITO_CUSTOM_DOMAIN\": \"${COGNITO_CUSTOM_DOMAIN}\", \
  \"IOT_ENDPOINT\": \"${IOT_ENDPOINT}\", \
  \"PEOPLE_POLICY_NAME\": \"${PEOPLE_POLICY_NAME}\", \
  \"INVENTORY_TABLE_NAME\": \"${INVENTORY_TABLE_NAME}\", \
  \"INVENTORY_ASSETS_BUCKET_NAME\": \"${INVENTORY_ASSETS_BUCKET_NAME}\", \
  \"APP_CLIENT_NAME\": \"${STACK_NAME}\", \
  \"GMAPS_API_KEY\": \"${GOOGLE_MAPS_API_KEY}\"
}"

echo "INFO: Writing JSON configuration"
echo $config > $dashboard_dir/src/assets/config.json

echo "INFO: Updating config.sh file"
echo "export WEB_UI_BUCKET_NAME=\"${WEB_UI_BUCKET_NAME}\"" >> ${script_dir}/config.sh
echo "export WEB_DISTRIBUTION_DOMAIN_NAME=\"${WEB_DISTRIBUTION_DOMAIN_NAME}\"" >> ${script_dir}/config.sh

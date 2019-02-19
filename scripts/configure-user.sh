#!/bin/bash
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
project_dir="${script_dir}/.."
dashboard_dir="${project_dir}/dashboard"

echo "INFO: Configuring UI"

#################################
# Configurable parameters start #
#################################

export STACK_NAME="Users"
export AWS_REGION="eu-west-1"

#################################
# Configurable parameters end   #
#################################

echo "INFO: Fetching deployment information."
stack_description=$(aws cloudformation describe-stacks --stack-name ${STACK_NAME})

iot_policy=$(echo $stack_description | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "IotPolicyName") | .OutputValue')
identity_id=${1:-none}
if [ "none" = $identity_id ]; then
  echo "ERROR: Parameter identity_id is mandatory, and not given."
  exit 1
fi

echo "INFO: Configuring Iot policy for identity ${identity_id}"
aws iot attach-principal-policy --principal ${identity_id} --policy-name ${iot_policy}

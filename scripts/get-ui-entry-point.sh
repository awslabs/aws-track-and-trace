#!/bin/bash
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
project_dir="${script_dir}/.."

source ${script_dir}/config.sh

stack_description=$(aws cloudformation describe-stacks --stack-name ${STACK_NAME})
prev_code=$(echo $?)
if [ "0" != $prev_code ]; then
  echo "ERROR: Failed to describe stack."
  exit 1
fi

distribution_url=$(echo $stack_description | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "WebUiDistributionDomainName") | .OutputValue')
prev_code=$(echo $?)
if [ "0" != $prev_code ]; then
  echo "ERROR: Failed to get distribution URL from outputs."
  exit 1
fi

echo "INFO: This is your distribution URL: ${distribution_url}"

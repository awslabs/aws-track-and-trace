#!/bin/bash
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
project_dir="${script_dir}/.."

#################################
# Configurable parameters start #
#################################

export STACK_NAME="AWSFleetManagementSample"
export AWS_REGION="eu-west-1"
export COGNITO_CUSTOM_DOMAIN="aws-fleet-management" # Change this with your own
export APP_CLIENT_NAME="AWSFleetManagement"

#################################
# Configurable parameters end   #
#################################
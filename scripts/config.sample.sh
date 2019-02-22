#!/bin/bash
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
project_dir="${script_dir}/.."

#################################
# Configurable parameters start #
#################################

export STACK_NAME="AWSTrackAndTrace"
export AWS_REGION="eu-west-1"
export COGNITO_CUSTOM_DOMAIN="<your-domain-name>" # Change this with your own
export GOOGLE_MAPS_API_KEY="<your-api-key>"

#################################
# Configurable parameters end   #
#################################

############################
# Autopopulated parameters #
############################


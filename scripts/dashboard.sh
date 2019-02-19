#!/bin/bash
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
project_dir="${script_dir}/.."

stack_name="helicopters-dashboard"
tmp_bucket="aws-pelaym-tmp-bucket"

echo "INFO: Packaging templates"
aws cloudformation package \
  --s3-bucket $tmp_bucket \
  --template-file $project_dir/infra/dashboard.yaml \
  --output-template-file $project_dir/infra/dashboard.pkg.yaml
prev_code=$(echo $?)
if [ "0" != $prev_code ]; then
  echo "ERROR: Failed to package template."
  exit 1
fi

echo "INFO: Deploying stack"
aws cloudformation deploy \
  --stack-name $stack_name \
  --template-file $project_dir/infra/dashboard.pkg.yaml \
  --capabilities CAPABILITY_IAM
prev_code=$(echo $?)
if [ "0" != $prev_code ]; then
  echo "ERROR: Failed to deploy stack."
  exit 1
fi

echo "INFO: Stack deployed successfully"
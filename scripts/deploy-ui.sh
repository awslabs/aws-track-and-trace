#!/bin/bash
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
project_dir="${script_dir}/.."

source ${script_dir}/configure-infra.sh
website_bucket=${web_ui_bucket_name}

cd $project_dir/dashboard
npm i
npm run build

aws s3 cp --acl bucket-owner-full-control ./dist/index.html s3://$website_bucket/index.html
aws s3 cp --acl bucket-owner-full-control --recursive ./dist/static s3://$website_bucket/static
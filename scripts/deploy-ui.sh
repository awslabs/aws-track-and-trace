#!/bin/bash
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
project_dir="${script_dir}/.."
website_bucket="connectedvehiclesdevkit-webuiwebsitebucketdd8efb9-1h9jukttzleyw"

cd $project_dir/dashboard
npm i
npm run build

aws s3 cp --acl bucket-owner-full-control ./dist/index.html s3://$website_bucket/index.html
aws s3 cp --acl bucket-owner-full-control --recursive ./dist/static s3://$website_bucket/static
#!/bin/bash
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
project_dir="${script_dir}/.."

infra_core_folder=${project_dir}/infra/core
packages_folder=${project_dir}/infra/packages/
cdk_packages=("auth dns inventory webui")

echo "INFO: Preparing your environment"

echo "INFO: Building modules..."
for i in $cdk_packages; do
  
  echo "INFO: Preparing package ${i}"
  cd $packages_folder/$i
  
  echo "INFO: Installing dependencies"
  npm i
  prev_code=$(echo $?)
  if [ "0" != $prev_code ]; then
    echo "ERROR: Failed to install dependencies for package ${i}."
    exit 1
  fi
  
  echo "INFO: Building package"
  npm run build
  prev_code=$(echo $?)
  if [ "0" != $prev_code ]; then
    echo "ERROR: Failed to build package ${i}."
    exit 1
  fi
done

echo "INFO: Preparing core infrastructure..."
cd $infra_core_folder

echo "INFO: Installing dependencies"
npm i
prev_code=$(echo $?)
if [ "0" != $prev_code ]; then
  echo "ERROR: Failed to install dependencies."
  exit 1
fi

echo "INFO: Building core"
npm run build
prev_code=$(echo $?)
if [ "0" != $prev_code ]; then
  echo "ERROR: Failed to build infrastructure."
  exit 1
fi

echo "INFO: Successfully built infrastructure."

#!/bin/bash
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
project_dir="${script_dir}/.."

source ${script_dir}/config.sh
source ${script_dir}/config.infra.sh

echo "INFO: This is your distribution URL: ${WEB_DISTRIBUTION_DOMAIN_NAME}"

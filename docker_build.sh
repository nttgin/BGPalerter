#!/usr/bin/env bash
# source AWS DEV credentials
set -e
source ./assume_role.sh ${ACCOUNT_ALIAS}

LOGIN_COMMAND=`aws ecr get-login --no-include-email --region ${AWS_REGION} --registry-ids ${ACCOUNT_ID} | sed 's|https://||'`
if ${LOGIN_COMMAND}; then
  echo "Login to ECR successful."
else
  echo "Login to ECR failed.  Check your IAM settings or AWS credentials."
  echo "Exiting build."
  exit 1
fi

aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ACCOUNT_ALIAS}.dkr.ecr.us-east-1.amazonaws.com/bgp-alerter-binary
docker build -t bgpalerter-binary .
docker tag bgp-alerter-binary:latest ${ACCOUNT_ALIAS}.dkr.ecr.us-east-1.amazonaws.com/bgp-alerter-binary:latest
docker push ${ACCOUNT_ALIAS}.dkr.ecr.us-east-1.amazonaws.com/bgp-alerter-binary:latest




#!/usr/bin/env bash

# Assume role
ACCOUNT_ID=657125119322
ROLE=tf-automation-user-role
BUCKET=$1
S3_PATH="s3://${BUCKET}/"

temp_role=$(aws sts assume-role \
                    --role-arn "arn:aws:iam::${ACCOUNT_ID}:role/${ROLE}" \
                    --role-session-name "tc_role_assumption")
PWD=`pwd`
export AWS_ACCESS_KEY_ID=$(echo $temp_role | jq .Credentials.AccessKeyId | xargs)
export AWS_SECRET_ACCESS_KEY=$(echo $temp_role | jq .Credentials.SecretAccessKey | xargs)
export AWS_SESSION_TOKEN=$(echo $temp_role | jq .Credentials.SessionToken | xargs)
aws s3 cp $PWD/bin/bgpalerter-linux-x64 ${S3_PATH} --acl public-read-write

#!/bin/bash
set -eo pipefail
APIID=$(aws cloudformation describe-stack-resource --stack-name email-api-lambda --logical-resource-id api --query 'StackResourceDetail.PhysicalResourceId' --output text)
REGION=$(aws configure get region)

curl -X POST -H "Content-Type: application/json" \
-d '{"name": "John Smith","email": "sample@gmail.com","message": "Test"}' \
https://$APIID.execute-api.$REGION.amazonaws.com/api/send | grep Message
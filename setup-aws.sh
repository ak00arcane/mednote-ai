#!/bin/bash

set -e

echo "🚀 MedNote AI - AWS CI/CD Setup Script"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check prerequisites
echo "📋 Checking prerequisites..."
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Install from: https://aws.amazon.com/cli/${NC}"
    exit 1
fi
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git not found.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Prerequisites OK${NC}\n"

# Get configuration
read -p "Enter AWS Region (default: us-east-1): " AWS_REGION
AWS_REGION=${AWS_REGION:-us-east-1}

read -p "Enter S3 bucket name prefix (e.g., mednote-ai-prod): " BUCKET_PREFIX
BUCKET_NAME="${BUCKET_PREFIX}-$(date +%s)"

# Create S3 bucket
echo ""
echo "🪣 Creating S3 bucket: $BUCKET_NAME"
aws s3 mb "s3://$BUCKET_NAME" --region "$AWS_REGION" 2>/dev/null || true

# Enable versioning
echo "📝 Enabling versioning..."
aws s3api put-bucket-versioning \
  --bucket "$BUCKET_NAME" \
  --versioning-configuration Status=Enabled \
  --region "$AWS_REGION"

# Create IAM user
echo ""
echo "👤 Creating IAM user: github-ci-user"
aws iam create-user --user-name github-ci-user 2>/dev/null || echo "  (User already exists)"

# Attach policy
echo "🔐 Attaching S3 policy..."
aws iam put-user-policy \
  --user-name github-ci-user \
  --policy-name S3DeployPolicy \
  --policy-document file://aws-s3-policy.json

# Create access keys
echo ""
echo "🔑 Creating access keys..."
KEYS=$(aws iam create-access-key --user-name github-ci-user)
ACCESS_KEY=$(echo $KEYS | grep -o '"AccessKeyId": "[^"]*' | grep -o '[^"]*$')
SECRET_KEY=$(echo $KEYS | grep -o '"SecretAccessKey": "[^"]*' | grep -o '[^"]*$')

# Summary
echo ""
echo -e "${GREEN}✅ AWS Setup Complete!${NC}"
echo ""
echo "📋 Save these values to GitHub Secrets:"
echo "========================================"
echo -e "${YELLOW}AWS_ACCESS_KEY_ID${NC}: $ACCESS_KEY"
echo -e "${YELLOW}AWS_SECRET_ACCESS_KEY${NC}: $SECRET_KEY"
echo -e "${YELLOW}AWS_REGION${NC}: $AWS_REGION"
echo -e "${YELLOW}S3_BUCKET_NAME${NC}: $BUCKET_NAME"
echo ""
echo "🔗 GitHub Repo Settings → Secrets and variables → Actions"
echo ""
echo "📚 Next steps:"
echo "1. Go to GitHub Settings → Secrets and variables → Actions"
echo "2. Add the 4 secrets above"
echo "3. Push code: git push origin main"
echo "4. Watch GitHub Actions deploy automatically!"
echo ""
echo "🌐 After deployment, access your app at:"
echo "   https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com"

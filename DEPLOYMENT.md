# 🚀 CI/CD Pipeline Setup Guide

## Architecture
```
GitHub (Code) → GitHub Actions (Build) → AWS S3 (Hosting) → CloudFront (CDN)
```

## Free Tier Benefits
- **GitHub Actions**: 2000 minutes/month FREE
- **AWS S3**: 5GB storage FREE (first year)
- **AWS CloudFront**: 1TB data transfer FREE (first year)
- **Total Cost**: $0/month

## Quick Setup (30 minutes)

### 1️⃣ Create GitHub Repository
```bash
git init
git add .
git commit -m "Initial commit with CI/CD"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mednote-ai.git
git push -u origin main
```

### 2️⃣ Set Up AWS Resources

#### Create S3 Bucket
```bash
# Create bucket
aws s3 mb s3://mednote-ai-prod-$(date +%s) --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket mednote-ai-prod-XXXXX \
  --versioning-configuration Status=Enabled

# Block public access (security first)
aws s3api put-public-access-block \
  --bucket mednote-ai-prod-XXXXX \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=false,RestrictPublicBuckets=false"
```

#### Create IAM User for GitHub Actions
```bash
# Create user
aws iam create-user --user-name github-ci-user

# Attach S3 policy
aws iam put-user-policy --user-name github-ci-user \
  --policy-name S3DeployPolicy \
  --policy-document file://aws-s3-policy.json

# Create access keys
aws iam create-access-key --user-name github-ci-user
```

Save the output with `AccessKeyId` and `SecretAccessKey`.

#### (Optional) Create CloudFront Distribution
```bash
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

### 3️⃣ Configure GitHub Secrets

Go to: **GitHub Repo → Settings → Secrets and variables → Actions**

Add these secrets:
```
AWS_ACCESS_KEY_ID          = (from IAM user)
AWS_SECRET_ACCESS_KEY      = (from IAM user)
AWS_REGION                 = us-east-1
S3_BUCKET_NAME             = mednote-ai-prod-XXXXX
VITE_GEMINI_API_KEY        = (your Gemini API key)
CLOUDFRONT_DISTRIBUTION_ID = (optional, from CloudFront)
```

### 4️⃣ Push to GitHub
```bash
# Workflow file is already in .github/workflows/deploy.yml
git add .
git commit -m "Add CI/CD pipeline"
git push origin main
```

✅ **GitHub Actions will automatically:**
1. Install dependencies
2. Run linting
3. Build the app
4. Deploy to S3
5. Invalidate CloudFront cache
6. Show deployment URL

### 5️⃣ Access Your App

After successful deployment:
```
https://mednote-ai-prod-XXXXX.s3.amazonaws.com
```

Or if using CloudFront:
```
https://d1234abcd.cloudfront.net
```

## Monitoring & Troubleshooting

### View GitHub Actions Logs
1. Go to **Actions** tab in GitHub
2. Click on the latest workflow run
3. Expand job logs to see build progress

### Common Issues

**Issue**: `AccessDenied` error
- Check IAM user has correct permissions
- Verify S3 bucket name is correct in secrets

**Issue**: CloudFront still showing old content
- Check if invalidation succeeded
- Wait 5-10 minutes for edge locations to refresh

**Issue**: Large bundle size
- Run `npm run build` locally
- Check `dist/` folder size
- Optimize assets in `vite.config.ts`

## Advanced: Using Vercel (Even Easier!)

If you want **even simpler** deployment:
1. Connect GitHub to Vercel (https://vercel.com)
2. Select repo and deploy
3. Vercel handles everything for FREE
4. Custom domain support

## Cost Breakdown

| Service | Free Tier | Your Usage | Cost |
|---------|-----------|-----------|------|
| GitHub Actions | 2000 min/month | ~5 min per deploy | $0 |
| AWS S3 | 5GB, 20K requests | ~500MB, 100 requests | $0 |
| CloudFront | 1TB data transfer | ~100MB/month | $0 |
| **TOTAL** | - | - | **$0/month** |

## Next Steps
1. Set up monitoring with CloudWatch (free)
2. Add error tracking with GitHub Issues
3. Set up automated testing before deployment
4. Use AWS Certificate Manager for HTTPS (free)

---
**Questions?** Check AWS Free Tier: https://aws.amazon.com/free/

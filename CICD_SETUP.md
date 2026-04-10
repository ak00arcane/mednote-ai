# 🚀 FREE CI/CD Pipeline to AWS - Complete Guide

## 📊 Architecture Overview

```
┌─────────────────┐
│   Your GitHub   │
│     Repo        │
└────────┬────────┘
         │ git push
         ▼
┌─────────────────────────┐
│ GitHub Actions (FREE)   │ ← 2000 min/month
│ • Build                 │
│ • Test                  │
│ • Deploy                │
└────────┬────────────────┘
         │
         ▼
┌────────────────────┐
│  AWS S3 (FREE)     │ ← 5GB storage
│  Static Hosting    │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ CloudFront (FREE)  │ ← 1TB/month data
│ CDN Cache Layer    │
└────────────────────┘
         │
         ▼
    Your Users 🎉
```

---

## ⚡ Quick Setup (30 minutes)

### **Phase 1: Push Code to GitHub (5 min)**

```bash
# Initialize/update git repo
git init
git add .
git commit -m "Add CI/CD pipeline"

# Push to GitHub (if not already done)
git remote add origin https://github.com/YOUR_USERNAME/mednote-ai.git
git branch -M main
git push -u origin main
```

### **Phase 2: Set Up AWS Resources (15 min)**

#### Option A: Automated Setup Script (Recommended)
```bash
chmod +x setup-aws.sh
./setup-aws.sh
```

#### Option B: Manual AWS CLI Commands
```bash
# 1. Set variables
export AWS_REGION="us-east-1"
export BUCKET_NAME="mednote-ai-prod-$(date +%s)"

# 2. Create S3 bucket
aws s3 mb s3://$BUCKET_NAME --region $AWS_REGION

# 3. Enable versioning
aws s3api put-bucket-versioning \
  --bucket $BUCKET_NAME \
  --versioning-configuration Status=Enabled

# 4. Create IAM user
aws iam create-user --user-name github-ci-user

# 5. Attach S3 policy
aws iam put-user-policy \
  --user-name github-ci-user \
  --policy-name S3DeployPolicy \
  --policy-document file://aws-s3-policy.json

# 6. Create and save access keys
aws iam create-access-key --user-name github-ci-user
# ⚠️ SAVE the AccessKeyId and SecretAccessKey!
```

### **Phase 3: Configure GitHub Secrets (5 min)**

1. Go to: **GitHub Repo → Settings → Secrets and variables → Actions**
2. Click **New repository secret** and add:

| Secret Name | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` | From IAM user creation |
| `AWS_SECRET_ACCESS_KEY` | From IAM user creation |
| `AWS_REGION` | `us-east-1` |
| `S3_BUCKET_NAME` | `mednote-ai-prod-XXXXX` |
| `VITE_GEMINI_API_KEY` | Your Gemini API key |
| `CLOUDFRONT_DISTRIBUTION_ID` | (Optional) CloudFront ID |

### **Phase 4: Deploy! (5 min)**

```bash
# Just push to main branch
git push origin main

# Watch it deploy at: GitHub Repo → Actions tab
```

---

## 🎯 What Happens on Every Push to `main`

1. **GitHub Actions** triggers automatically
2. **Builds** your React app with Vite
3. **Tests** TypeScript types
4. **Uploads** to AWS S3
5. **Invalidates** CloudFront cache
6. **Done!** Your app is live

**Deployment Status URL:** `https://YOUR_S3_BUCKET.s3.us-east-1.amazonaws.com`

---

## 📦 What's Included in This Setup

### Files Created:
```
.github/workflows/deploy.yml    ← GitHub Actions workflow
Dockerfile                      ← For Docker deployment option
docker-build.sh                 ← Docker build script
aws-s3-policy.json             ← IAM permissions
setup-aws.sh                    ← Automated AWS setup
.dockerignore                   ← Docker ignore file
.env.local.example              ← Environment template
DEPLOYMENT.md                   ← This guide
```

---

## 🆓 Free Tier Limits & Costs

### GitHub Actions
- **Free:** 2,000 minutes per month
- **Your usage:** ~3-5 minutes per deploy
- **Cost:** $0

### AWS S3
- **Free:** 5GB storage + 20,000 GET + 2,000 PUT requests/month
- **Your usage:** ~500KB-2MB (React app), ~100 requests/month
- **Cost:** $0

### AWS CloudFront
- **Free:** 1TB data transfer + 10M HTTP/HTTPS requests/month
- **Your usage:** ~10-50MB/month (depending on traffic)
- **Cost:** $0

### Gemini API
- **Free:** 15 requests per minute
- **Your usage:** Depends on app
- **Cost:** $0 or pay-as-you-go

### **TOTAL COST: $0/month** ✅

---

## 🔧 Troubleshooting

### Issue: "AccessDenied" during deployment

**Solution:** Check IAM user has correct permissions
```bash
# Re-attach policy
aws iam put-user-policy \
  --user-name github-ci-user \
  --policy-name S3DeployPolicy \
  --policy-document file://aws-s3-policy.json
```

### Issue: Old content still showing

**Solution:** CloudFront cache not cleared
1. Check GitHub Actions logs for "Invalidate CloudFront" step
2. Manually invalidate:
```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### Issue: Build fails with "VITE_GEMINI_API_KEY is undefined"

**Solution:** Add `VITE_GEMINI_API_KEY` to GitHub Secrets
- Must start with `VITE_` prefix (Vite requirement)
- Check spelling exactly

### Issue: Can't push to GitHub

**Solution:** Check git configuration
```bash
git config --global user.email "you@example.com"
git config --global user.name "Your Name"
git push origin main
```

---

## 🚀 Advanced Options

### Option 1: Add CloudFront for Better Performance

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --distribution-config '{
    "CallerReference": "'$(date +%s)'",
    "Enabled": true,
    "Origins": {
      "Quantity": 1,
      "Items": [{
        "Id": "S3Origin",
        "DomainName": "'$BUCKET_NAME'.s3.'$AWS_REGION'.amazonaws.com",
        "S3OriginConfig": {}
      }]
    },
    "DefaultCacheBehavior": {
      "TargetOriginId": "S3Origin",
      "ViewerProtocolPolicy": "redirect-to-https",
      "TrustedSigners": {"Enabled": false, "Quantity": 0},
      "ForwardedValues": {
        "QueryString": false,
        "Cookies": {"Forward": "none"}
      },
      "MinTTL": 0
    }
  }'
```

### Option 2: Use Docker for Complex Deployments

```bash
# Build and run locally
./docker-build.sh

# Or deploy to AWS ECS, ECR, etc.
```

### Option 3: Add Custom Domain

1. Register domain (Route53 or external registrar)
2. Point to CloudFront distribution
3. Enable HTTPS automatically

### Option 4: Add Environment-Based Deployments

Modify workflow to deploy to different buckets:
- `main` → Production
- `staging` → Staging
- `develop` → Development

---

## 📈 Scaling Beyond Free Tier

When you outgrow free tier:
- **GitHub Actions:** $0.25/min → Consider GitLab CI or Jenkins
- **AWS S3:** $0.023/GB → Standard pricing
- **CloudFront:** $0.085/GB → Standard pricing
- **Total Est. Cost:** $10-50/month for medium traffic

---

## 🎓 Learning Resources

| Topic | Resource |
|-------|----------|
| GitHub Actions | https://docs.github.com/en/actions |
| AWS S3 | https://aws.amazon.com/s3/ |
| CloudFront | https://aws.amazon.com/cloudfront/ |
| Vite | https://vitejs.dev/ |
| Docker | https://docs.docker.com/ |

---

## ✅ Checklist

- [ ] Code pushed to GitHub `main` branch
- [ ] AWS account created
- [ ] S3 bucket created
- [ ] IAM user created with access keys
- [ ] GitHub Secrets configured (5 secrets)
- [ ] `.github/workflows/deploy.yml` in repo
- [ ] First push triggers GitHub Actions
- [ ] App deployed to S3
- [ ] Can access at `https://bucket-name.s3.region.amazonaws.com`

---

## 💡 Next Steps

1. **Monitor Deployments:** Check GitHub Actions tab for every push
2. **Set Up Alerts:** Get notified on deployment failures
3. **Add Testing:** Include unit/integration tests in workflow
4. **Custom Domain:** Point your domain to CloudFront
5. **Backend API:** Deploy FastAPI backend (optional)

---

## 🆘 Need Help?

1. Check GitHub Actions logs: **Actions tab → Click workflow → Expand logs**
2. Verify AWS credentials: `aws iam get-user-summary --user-name github-ci-user`
3. Test S3 access: `aws s3 ls s3://your-bucket-name`
4. View Cloudwatch logs: AWS Console → CloudWatch → Log Groups

---

**Happy Deploying! 🎉**

# ✅ CI/CD Pipeline - Implementation Checklist

## 🚀 Choose Your Path

### Path A: Quick & Easy (5 min) - RECOMMENDED
- **Tool:** Vercel
- **Cost:** $0/month
- **Setup Time:** 5 minutes
- **Recommended if:** You want to launch NOW

**→ [Skip to Vercel Section](#vercel-quick-deploy)**

### Path B: AWS S3 (30 min) - Enterprise Ready
- **Tool:** GitHub Actions + AWS S3
- **Cost:** $0/month (free tier)
- **Setup Time:** 30 minutes
- **Recommended if:** You want maximum control

**→ [Skip to AWS Section](#aws-s3-deployment)**

---

## 🔥 Vercel Quick Deploy

### Step 1: Go to Vercel
```
https://vercel.com/signup
```

### Step 2: Sign Up with GitHub
- Click "Continue with GitHub"
- Authorize Vercel to access your GitHub account

### Step 3: Import Your Repository
1. Click "Import Project"
2. Enter your repo URL or search for it
3. Select `mednote-ai` repository
4. Click "Import"

### Step 4: Configure Project
```
Framework: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Step 5: Add Environment Variables
In "Environment Variables" section:
```
VITE_GEMINI_API_KEY = your_gemini_api_key_here
```

### Step 6: Deploy!
Click "Deploy" and wait 2-3 minutes.

### Result:
```
✅ Your app deployed at:
   https://mednote-ai-XXXXX.vercel.app
```

### Enable Auto-Deploy (Optional)
- Already enabled by default!
- Every push to `main` = automatic deploy
- Preview deployments for pull requests

---

## ☁️ AWS S3 Deployment

### Prerequisites
```bash
# Check you have these installed
aws --version          # AWS CLI
node --version         # Node.js
git --version          # Git
```

### Step 1: Set Up AWS Resources

#### Option A: Automated Setup (Recommended)
```bash
# Make script executable
chmod +x setup-aws.sh

# Run setup script
./setup-aws.sh

# Follow prompts and save the output!
```

#### Option B: Manual AWS CLI
```bash
# Set variables
export AWS_REGION="us-east-1"
export BUCKET_NAME="mednote-ai-prod-$(date +%s)"

# Create S3 bucket
aws s3 mb s3://$BUCKET_NAME --region $AWS_REGION

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket $BUCKET_NAME \
  --versioning-configuration Status=Enabled

# Create IAM user
aws iam create-user --user-name github-ci-user

# Attach policy
aws iam put-user-policy \
  --user-name github-ci-user \
  --policy-name S3DeployPolicy \
  --policy-document file://aws-s3-policy.json

# Create access keys (SAVE THESE!)
aws iam create-access-key --user-name github-ci-user
```

### Step 2: Save AWS Credentials
The setup script will output something like:
```
AWS_ACCESS_KEY_ID: AKIA1234567890ABCDEF
AWS_SECRET_ACCESS_KEY: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION: us-east-1
S3_BUCKET_NAME: mednote-ai-prod-1234567890
```

**⚠️ SAVE THIS IMMEDIATELY AND SECURELY** ⚠️

### Step 3: Add GitHub Secrets

1. Go to your GitHub repo
2. **Settings → Secrets and variables → Actions**
3. Click **"New repository secret"**
4. Add each secret:

| Name | Value |
|------|-------|
| `AWS_ACCESS_KEY_ID` | From step 2 |
| `AWS_SECRET_ACCESS_KEY` | From step 2 |
| `AWS_REGION` | `us-east-1` |
| `S3_BUCKET_NAME` | From step 2 |
| `VITE_GEMINI_API_KEY` | Your Gemini API key |

**Screenshot Guide:**
```
1. Click "New repository secret" ➜ 
2. Name: AWS_ACCESS_KEY_ID
3. Value: [paste your AWS access key]
4. Click "Add secret"
5. Repeat for each secret
```

### Step 4: Verify Workflow File
Check that `.github/workflows/deploy.yml` exists:
```bash
ls -la .github/workflows/deploy.yml
```

If not, copy it from this repo.

### Step 5: Deploy!
```bash
# Push code to GitHub
git add .
git commit -m "Add AWS CI/CD deployment"
git push origin main
```

### Watch Deployment
1. Go to **GitHub Actions tab**
2. Click the latest workflow run
3. Wait for "Deploy to S3" step
4. See deployment URL in logs

### Step 6: Access Your App
After successful deployment:
```
https://mednote-ai-prod-XXXXX.s3.us-east-1.amazonaws.com
```

---

## 🔄 GitHub Actions Workflow Explained

What happens when you push to `main`:

```
1. GitHub Actions Triggers
   ↓
2. Checkout Code
   ↓
3. Setup Node.js 20
   ↓
4. Install Dependencies (npm ci)
   ↓
5. Lint TypeScript (npm run lint)
   ↓
6. Build App (npm run build)
   ↓
7. Configure AWS Credentials
   ↓
8. Sync dist/ to S3
   ↓
9. Invalidate CloudFront Cache
   ↓
10. ✅ DONE! App is live
```

**Each step takes ~30-60 seconds total.**

---

## 📋 Final Checklist

### Before Deployment

- [ ] Code committed and pushed to GitHub `main` branch
- [ ] `package.json` has correct scripts
- [ ] `.env.local.example` has template
- [ ] `VITE_GEMINI_API_KEY` is configured

### AWS Setup (if using AWS)

- [ ] AWS account created
- [ ] AWS CLI installed and configured
- [ ] S3 bucket created
- [ ] IAM user created
- [ ] Access keys generated and saved safely
- [ ] S3 policy attached to IAM user

### GitHub Configuration

- [ ] Repository is public or GitHub Actions is enabled
- [ ] All 5 secrets added:
  - [ ] `AWS_ACCESS_KEY_ID`
  - [ ] `AWS_SECRET_ACCESS_KEY`
  - [ ] `AWS_REGION`
  - [ ] `S3_BUCKET_NAME`
  - [ ] `VITE_GEMINI_API_KEY`
- [ ] `.github/workflows/deploy.yml` exists
- [ ] Workflow file is in `main` branch

### Deployment

- [ ] First push to `main` triggers workflow
- [ ] GitHub Actions shows green checkmark
- [ ] App builds successfully
- [ ] Deploys to S3 successfully
- [ ] Can access deployed app at provided URL

### Validation

- [ ] App loads in browser
- [ ] All pages work
- [ ] API calls work correctly
- [ ] No console errors

---

## 🆘 Troubleshooting

### Issue: GitHub Actions showing red X

**Solution:** Check logs
1. Go to **Actions tab**
2. Click the failed workflow
3. Expand each step to find error
4. Common issues:
   - Missing secrets
   - Wrong S3 bucket name
   - Missing VITE_ prefix on env vars

### Issue: "AccessDenied" error

**Solution:** Check IAM permissions
```bash
# Verify policy is attached
aws iam list-user-policies --user-name github-ci-user

# Re-attach if needed
aws iam put-user-policy \
  --user-name github-ci-user \
  --policy-name S3DeployPolicy \
  --policy-document file://aws-s3-policy.json
```

### Issue: Old content still showing

**Solution:** Clear browser cache
1. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. Or open in Incognito/Private window
3. Or wait 5-10 minutes for CloudFront to sync

### Issue: "npm ERR! code ERESOLVE"

**Solution:** Update dependencies
```bash
npm update
npm run build
```

---

## 🚀 Next Steps After First Deploy

### 1. Set Up Custom Domain (Optional)

#### With Vercel:
```
1. Go to Vercel Dashboard
2. Project Settings → Domains
3. Add your domain
4. Point DNS records (Vercel provides steps)
```

#### With AWS:
```
1. Get your domain (Route53 or external)
2. Create CloudFront distribution
3. Point domain to CloudFront
4. Enable SSL (free with AWS Certificate Manager)
```

### 2. Enable Automatic Deployments
Already enabled! Every push to `main` deploys automatically.

### 3. Add Preview Deployments

For pull requests (shows preview before merging):
- **Vercel:** Already enabled ✅
- **AWS:** Need to add manual step in workflow

### 4. Monitor Deployments

```bash
# View recent deployments
# Vercel: Dashboard → Deployments tab
# AWS: GitHub Actions → Latest runs

# Check error logs
# Vercel: Click deployment → Logs
# AWS: GitHub Actions → Expand logs
```

### 5. Set Up Email Notifications
- **GitHub Actions:** Settings → Notifications
- **Vercel:** Project Settings → Notifications
- **AWS:** CloudWatch → Alarms

---

## 📊 Monitoring Dashboard

### GitHub Actions
```
GitHub Repo → Actions Tab → All Workflows
Shows:
✅ Successful deployments (green)
❌ Failed deployments (red)
⏱️ Deployment duration
📝 Logs
```

### Vercel Dashboard
```
vercel.com/dashboard
Shows:
📈 Deployments history
🌐 Domain assignments
🔧 Environment variables
📊 Usage analytics
```

### AWS CloudWatch
```
AWS Console → CloudWatch → Metrics
Shows:
📤 Data uploaded to S3
🔍 S3 requests
⚡ CloudFront cache hit ratio
```

---

## 🎓 Learning Resources

| Topic | Link |
|-------|------|
| GitHub Actions | https://docs.github.com/en/actions |
| Vercel Docs | https://vercel.com/docs |
| AWS S3 | https://docs.aws.amazon.com/s3/ |
| Vite | https://vitejs.dev/ |
| React | https://react.dev |

---

## ✨ You're All Set!

Your CI/CD pipeline is now ready. Every time you:
```bash
git push origin main
```

Your app will automatically:
1. ✅ Build
2. ✅ Test  
3. ✅ Deploy
4. ✅ Go live

**No manual steps. Just push and celebrate! 🎉**

---

## 💬 Questions?

For help:
1. Check GitHub Actions logs
2. Review CICD_SETUP.md for details
3. Check ALTERNATIVE_DEPLOYMENTS.md for other options
4. See DEPLOYMENT.md for architecture overview

---

**Happy Deploying! 🚀**

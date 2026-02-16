# 🚀 Vercel Deployment Guide (FREE!)

## ✅ Why Vercel?
- ✅ Completely FREE
- ✅ No credit card needed
- ✅ Serverless functions included
- ✅ Auto HTTPS
- ✅ 5 minutes setup

## 📋 Step-by-Step Deployment

### Step 1: Create Vercel Account
1. Go to: https://vercel.com/signup
2. Sign up with GitHub (recommended)
3. Free forever!

### Step 2: Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

Ya direct website se deploy karo (easier!)

### Step 3: Deploy via Website (Easiest)

1. **Push code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to: https://vercel.com/new
   - Click "Import Git Repository"
   - Select your GitHub repo
   - Click "Import"

3. **Configure Environment Variables**:
   - In Vercel dashboard, go to: Settings → Environment Variables
   - Add these (use your actual Cashfree credentials):
   ```
   CASHFREE_APP_ID = your_cashfree_app_id
   CASHFREE_SECRET_KEY = your_cashfree_secret_key
   CASHFREE_MODE = sandbox
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - Done! 🎉

### Step 4: Update .env with Vercel URL

After deployment, Vercel will give you a URL like: `https://your-app.vercel.app`

No need to update anything! API routes automatically work at:
- `https://your-app.vercel.app/api/create-payment`
- `https://your-app.vercel.app/api/verify-payment`

## 🧪 Testing

### Local Testing (Before Deploy):
```bash
# Install Vercel CLI
npm install -g vercel

# Run locally
vercel dev
```

This will start local server with serverless functions!

### Production Testing:
1. Deploy to Vercel
2. Open your Vercel URL
3. Register student
4. Admin approve
5. Click "Pay" button
6. **Real Cashfree payment page will open!** 🎉

## 💳 Test Payment

Use these test details:
```
Card: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
OTP: 123456
```

## 🔄 Auto Deployment

Every time you push to GitHub, Vercel automatically deploys! 🚀

```bash
git add .
git commit -m "Update payment"
git push
```

Vercel will auto-deploy in 2 minutes!

## 💰 Production Setup

### 1. Complete Cashfree KYC
- Login to Cashfree
- Submit documents
- Wait for approval

### 2. Get Production Credentials
- Cashfree Dashboard → API Keys
- Switch to "Production"
- Copy credentials

### 3. Update Vercel Environment Variables
```
CASHFREE_MODE = production
CASHFREE_APP_ID = <production_app_id>
CASHFREE_SECRET_KEY = <production_secret_key>
```

### 4. Redeploy
Vercel will auto-redeploy with new credentials!

## 📊 Monitor Payments

### Vercel Logs:
- Vercel Dashboard → Your Project → Functions
- See all API calls and errors

### Cashfree Dashboard:
- https://merchant.cashfree.com
- See all transactions

## 🐛 Troubleshooting

### API not working?
- Check Vercel logs
- Verify environment variables are set
- Check CORS settings

### Payment not redirecting?
- Check Cashfree credentials
- Verify return URL is correct
- Check browser console

### Database not updating?
- Check Supabase connection
- Verify RLS policies
- Check payment table exists

## 💡 Benefits of Vercel

1. **Free Forever**: No credit card needed
2. **Auto HTTPS**: Secure by default
3. **Global CDN**: Fast worldwide
4. **Auto Deploy**: Push to GitHub = Auto deploy
5. **Serverless**: No server management
6. **Scalable**: Handles millions of requests

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord
- Cashfree Support: support@cashfree.com

## ✅ Checklist

Before going live:
- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Environment variables set
- [ ] Test payment successful
- [ ] Cashfree KYC completed (for production)
- [ ] Production credentials updated
- [ ] Real ₹1 transaction tested

---

**Total Time: 10 minutes** ⏱️

**Cost: ₹0 (FREE!)** 💰

Koi problem ho toh batana! 🚀

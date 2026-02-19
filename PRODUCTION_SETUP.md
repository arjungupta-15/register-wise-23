# Production Setup Guide - Cashfree Live Credentials

## Steps to Switch from Sandbox to Production

### 1. Get Production Credentials from Cashfree

1. Login to Cashfree Dashboard: https://merchant.cashfree.com/
2. Go to **Developers** → **API Keys**
3. Switch to **Production** mode (toggle at top)
4. Copy your:
   - Production App ID
   - Production Secret Key

### 2. Update Local .env File

Open `register-wise-23/.env` and update:

```env
# Cashfree Payment Gateway - PRODUCTION
VITE_CASHFREE_APP_ID="your_production_app_id_here"
VITE_CASHFREE_SECRET_KEY="your_production_secret_key_here"
VITE_CASHFREE_MODE="production"
```

**⚠️ IMPORTANT:** 
- Never commit production credentials to Git
- Keep `.env` file in `.gitignore`

### 3. Update Vercel Environment Variables

1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Update these variables:
   - `CASHFREE_APP_ID` = your production app ID
   - `CASHFREE_SECRET_KEY` = your production secret key
   - `CASHFREE_MODE` = `production`
3. Click **Save**
4. Redeploy your project

### 4. Test Production Payment

1. Deploy to Vercel
2. Test with a small amount (₹1 or ₹10)
3. Use real payment methods (UPI, Card, etc.)
4. Verify payment appears in Cashfree dashboard
5. Check admin panel shows payment correctly

### 5. Differences Between Sandbox and Production

| Feature | Sandbox | Production |
|---------|---------|------------|
| Real Money | ❌ No | ✅ Yes |
| Test Cards | ✅ Works | ❌ Won't work |
| Real Cards/UPI | ❌ Won't work | ✅ Works |
| Redirect | ⚠️ May not work | ✅ Works properly |
| Settlement | ❌ No | ✅ Yes (to bank) |

### 6. Important Notes

- **Test thoroughly** before going live
- **Start with small amounts** for testing
- **Monitor transactions** in Cashfree dashboard
- **Check webhook logs** for any issues
- **Keep credentials secure** - never share or commit

### 7. Rollback to Sandbox (if needed)

If you need to go back to sandbox mode:

```env
VITE_CASHFREE_APP_ID="TEST10957773ed79b84bd2222f0c07ac37775901"
VITE_CASHFREE_SECRET_KEY="cfsk_ma_test_2be9b446e849a945aecfb725b01b5b9d_7aebd3e2"
VITE_CASHFREE_MODE="sandbox"
```

Update Vercel environment variables accordingly and redeploy.

## Support

If you face any issues:
- Check Cashfree Dashboard logs
- Check Vercel deployment logs
- Verify environment variables are set correctly
- Contact Cashfree support: support@cashfree.com

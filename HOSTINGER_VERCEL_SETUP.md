# Hostinger Frontend + Vercel Backend Setup Guide

## Current Architecture

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Frontend (Hostinger)                                   │
│  Domain: https://tarseducation.in                       │
│  ├── React App                                          │
│  ├── Static Files                                       │
│  └── Calls Vercel APIs ──────────────┐                 │
│                                       │                 │
└───────────────────────────────────────┼─────────────────┘
                                        │
                                        │ HTTPS
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Backend (Vercel)                                       │
│  Domain: https://tareducations.vercel.app               │
│  ├── /api/create-payment                                │
│  ├── /api/verify-payment                                │
│  └── Serverless Functions                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
                    │
                    │ API Calls
                    ▼
┌─────────────────────────────────────────────────────────┐
│  Cashfree Payment Gateway (Production)                  │
│  Approved Domain: tarseducation.in                      │
└─────────────────────────────────────────────────────────┘
                    │
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│  Supabase Database                                      │
│  ├── students table                                     │
│  ├── courses table                                      │
│  └── payments table                                     │
└─────────────────────────────────────────────────────────┘
```

## Setup Steps

### 1. Hostinger Frontend Setup

Your React app is hosted on Hostinger at `https://tarseducation.in`

**Build Command:**
```bash
npm run build
```

**Upload to Hostinger:**
- Upload the `dist` folder contents to your Hostinger public_html directory
- Make sure `.htaccess` is configured for React Router

**`.htaccess` file (for React Router):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### 2. Vercel Backend Setup

Your backend APIs are deployed on Vercel at `https://tareducations.vercel.app`

**Environment Variables (Set in Vercel Dashboard):**
```
CASHFREE_APP_ID=your_production_app_id_here
CASHFREE_SECRET_KEY=your_production_secret_key_here
CASHFREE_MODE=production
```

**API Endpoints:**
- `POST /api/create-payment` - Creates payment session
- `POST /api/verify-payment` - Verifies payment status

**CORS:** Already enabled for all origins (`Access-Control-Allow-Origin: *`)

### 3. Frontend Code Configuration

The frontend code is configured to call Vercel APIs:

**PaymentButton.tsx:**
```typescript
const apiUrl = window.location.hostname === 'localhost' 
  ? `${window.location.origin}/api`  // Local development
  : 'https://tareducations.vercel.app/api';  // Production (Vercel)
```

**VerifyPayment.tsx:**
```typescript
const apiUrl = window.location.hostname === 'localhost' 
  ? `${window.location.origin}/api`  // Local development
  : 'https://tareducations.vercel.app/api';  // Production (Vercel)
```

### 4. Cashfree Configuration

**Approved Domain:** `tarseducation.in` ✅

**Mode:** Production

**Payment Flow:**
1. User clicks "Pay" button on `tarseducation.in`
2. Frontend calls `https://tareducations.vercel.app/api/create-payment`
3. Vercel API creates payment session with Cashfree
4. Cashfree opens payment modal on `tarseducation.in` (approved domain)
5. After payment, redirects to `tarseducation.in/payment/success`

### 5. Local Development

**Environment Variables (.env):**
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key_here
VITE_CASHFREE_APP_ID=your_production_app_id_here
VITE_CASHFREE_SECRET_KEY=your_production_secret_key_here
VITE_CASHFREE_MODE=production
```

**Run locally:**
```bash
npm run dev
```

This will use localhost API URLs automatically.

### 6. Deployment Process

**Deploy Frontend to Hostinger:**
```bash
# Build the project
npm run build

# Upload dist folder to Hostinger
# Use FTP/SFTP or Hostinger File Manager
```

**Deploy Backend to Vercel:**
```bash
# Vercel will auto-deploy on git push
git add .
git commit -m "Update"
git push origin main
```

Or manually:
```bash
vercel --prod
```

### 7. Testing Checklist

- [ ] Frontend loads on `https://tarseducation.in`
- [ ] Payment button works
- [ ] Cashfree modal opens (production mode)
- [ ] Payment completes successfully
- [ ] Redirects to success page
- [ ] Payment status updates in database
- [ ] Admin panel shows payment details
- [ ] Manual verification works

### 8. Troubleshooting

**Issue: CORS Error**
- Solution: CORS is already enabled in Vercel APIs

**Issue: Payment modal doesn't open**
- Check browser console for errors
- Verify Cashfree SDK loaded
- Check if domain is approved in Cashfree dashboard

**Issue: API calls fail**
- Check Vercel deployment logs
- Verify environment variables are set
- Check network tab in browser DevTools

**Issue: Payment success but not updating**
- Check Supabase database connection
- Verify payment webhook is working
- Check Vercel function logs

### 9. Important URLs

- **Frontend:** https://tarseducation.in
- **Backend:** https://tareducations.vercel.app
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Cashfree Dashboard:** https://merchant.cashfree.com/
- **Supabase Dashboard:** https://supabase.com/dashboard

### 10. Security Notes

- ✅ Never commit `.env` file to Git
- ✅ Use environment variables for sensitive data
- ✅ CORS is enabled but consider restricting to specific domains in production
- ✅ Cashfree credentials are stored in Vercel environment variables
- ✅ Frontend only has public keys (VITE_ prefixed)

## Summary

Your setup is now configured for:
- Frontend on Hostinger (`tarseducation.in`)
- Backend on Vercel (`tareducations.vercel.app`)
- Cashfree production mode with approved domain
- Cross-origin API calls with CORS enabled

Everything should work seamlessly! 🚀

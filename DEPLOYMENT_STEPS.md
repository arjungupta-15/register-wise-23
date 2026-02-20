# Quick Deployment Steps

## What Changed?

✅ Frontend code updated to call Vercel backend APIs
✅ Production mode enabled (Cashfree)
✅ CORS already configured

## Deploy Kaise Kare?

### Step 1: Build Frontend
```bash
cd register-wise-23
npm run build
```

### Step 2: Upload to Hostinger

1. Hostinger File Manager mein jao
2. `public_html` folder open karo
3. `dist` folder ke saare files upload karo
4. `.htaccess` file check karo (React Router ke liye)

**`.htaccess` content:**
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

### Step 3: Verify Vercel Backend

Vercel backend already deployed hai. Bas check karo:

1. https://vercel.com/dashboard pe jao
2. Environment variables check karo:
   - `CASHFREE_APP_ID` ✅
   - `CASHFREE_SECRET_KEY` ✅
   - `CASHFREE_MODE=production` ✅

### Step 4: Test Payment

1. https://tarseducation.in pe jao
2. Student login/register karo
3. Course select karo
4. Payment button click karo
5. Cashfree modal open hoga (production mode)
6. Test payment karo (₹1 se start karo)

## Important Notes

- ✅ Cashfree domain approved: `tarseducation.in`
- ✅ Frontend: Hostinger pe host hai
- ✅ Backend: Vercel pe deploy hai
- ✅ APIs: `https://tareducations.vercel.app/api/*`
- ✅ CORS: Enabled hai

## Testing Checklist

- [ ] Frontend loads properly
- [ ] Student registration works
- [ ] Course selection works
- [ ] Payment button appears
- [ ] Cashfree modal opens
- [ ] Payment completes
- [ ] Success page shows
- [ ] Database updates
- [ ] Admin panel shows payment

## Agar Problem Aaye?

1. Browser console check karo (F12)
2. Network tab mein API calls dekho
3. Vercel logs check karo
4. Cashfree dashboard mein transaction dekho

## Support

Koi problem ho toh batao! 🚀

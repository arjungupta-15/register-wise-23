# ⚡ Quick Start - Real Payment Setup

## 🎯 5 Minute Setup

### 1. Install Supabase CLI (One-time)
```bash
npm install -g supabase
```

### 2. Login & Link Project
```bash
cd register-wise-23
npx supabase login
npx supabase link --project-ref bbcikbqmhdzktgpmqrmd
```

### 3. Set Secrets in Supabase Dashboard

Go to: https://supabase.com/dashboard/project/bbcikbqmhdzktgpmqrmd/settings/functions

Add these secrets (use your actual Cashfree credentials):
```
CASHFREE_APP_ID = your_cashfree_app_id
CASHFREE_SECRET_KEY = your_cashfree_secret_key
CASHFREE_MODE = sandbox
SUPABASE_URL = https://bbcikbqmhdzktgpmqrmd.supabase.co
SUPABASE_SERVICE_ROLE_KEY = (Get from Settings → API → service_role key)
```

### 4. Deploy Functions
```bash
# Windows
deploy-functions.bat

# Or manually
npx supabase functions deploy create-payment
npx supabase functions deploy verify-payment
```

### 5. Test Payment
```bash
npm run dev
```

Then:
1. Register student
2. Admin approve
3. Click "Pay" button
4. **Cashfree payment page will open!** 🎉

Use test card: `4111 1111 1111 1111`, CVV: `123`, Expiry: `12/25`

---

## 🚨 Common Issues

### "Supabase CLI not found"
```bash
npm install -g supabase
```

### "Project not linked"
```bash
npx supabase link --project-ref bbcikbqmhdzktgpmqrmd
```

### "Edge function error"
- Check secrets are set in Supabase Dashboard
- Check SUPABASE_SERVICE_ROLE_KEY is correct

### "Payment not working"
- Check browser console for errors
- Check Edge Function logs: `npx supabase functions logs create-payment`

---

## 📖 Full Documentation

See `REAL_PAYMENT_SETUP.md` for complete guide.

---

**Total Time: 5-10 minutes** ⏱️

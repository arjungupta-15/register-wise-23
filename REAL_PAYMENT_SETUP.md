# 💰 Real Cashfree Payment Setup Guide

## ✅ What I've Done

1. ✅ Created Supabase Edge Functions for backend
2. ✅ Updated PaymentButton to use real Cashfree API
3. ✅ Added Cashfree SDK to index.html
4. ✅ Payment will redirect to actual Cashfree payment page

## 🚀 Setup Steps (Follow Carefully)

### Step 1: Install Supabase CLI

```bash
# Windows (PowerShell as Administrator)
scoop install supabase

# Or download from: https://github.com/supabase/cli/releases
```

### Step 2: Login to Supabase

```bash
cd register-wise-23
npx supabase login
```

Ye browser mein khulega, login karo apne Supabase account se.

### Step 3: Link Your Project

```bash
npx supabase link --project-ref bbcikbqmhdzktgpmqrmd
```

Password maangega - Supabase dashboard se database password lo.

### Step 4: Set Environment Variables in Supabase

Supabase Dashboard mein jao:
1. Settings → Edge Functions → Secrets
2. Ye secrets add karo (use your actual Cashfree credentials):

```
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
CASHFREE_MODE=sandbox
SUPABASE_URL=https://bbcikbqmhdzktgpmqrmd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>
```

Service Role Key kaise milega:
- Supabase Dashboard → Settings → API
- "service_role" key copy karo (secret hai, careful!)

### Step 5: Deploy Edge Functions

```bash
# Deploy create-payment function
npx supabase functions deploy create-payment

# Deploy verify-payment function
npx supabase functions deploy verify-payment
```

### Step 6: Test Payment

1. Dev server chalo:
```bash
npm run dev
```

2. Student register karo
3. Admin se approve karwao
4. Payment button click karo
5. **Cashfree ka actual payment page khulega!** 🎉

## 🧪 Test Cards (Sandbox Mode)

### Success Payment:
```
Card: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
OTP: 123456
```

### Failed Payment:
```
Card: 4000 0000 0000 0002
CVV: 123
Expiry: 12/25
```

### UPI Test:
```
UPI ID: success@upi
```

## 🔄 Payment Flow

```
Student clicks "Pay" 
    ↓
Frontend calls Edge Function (create-payment)
    ↓
Edge Function calls Cashfree API (backend)
    ↓
Cashfree returns payment session
    ↓
Student redirects to Cashfree payment page
    ↓
Student enters card/UPI/netbanking details
    ↓
Cashfree processes payment
    ↓
Redirects back to /payment/success
    ↓
Frontend calls Edge Function (verify-payment)
    ↓
Edge Function verifies with Cashfree
    ↓
Updates database (payment_status = 'paid')
    ↓
Shows success message
```

## 💸 Production Setup (Real Money)

### 1. Complete Cashfree KYC
- Login to Cashfree dashboard
- Submit business documents
- Wait for approval (2-3 days)

### 2. Get Production Credentials
- Cashfree Dashboard → Developers → API Keys
- Switch to "Production" mode
- Copy new App ID and Secret Key

### 3. Update Supabase Secrets
```
CASHFREE_MODE=production
CASHFREE_APP_ID=<production_app_id>
CASHFREE_SECRET_KEY=<production_secret_key>
```

### 4. Update .env (Frontend)
```
VITE_CASHFREE_MODE=production
```

### 5. Test with ₹1
- Make a real ₹1 transaction
- Verify money comes to your account
- Check settlement time (T+1 or T+2 days)

## 🐛 Troubleshooting

### Edge Function not working?
```bash
# Check logs
npx supabase functions logs create-payment
npx supabase functions logs verify-payment
```

### CORS error?
- Make sure Edge Functions are deployed
- Check Supabase secrets are set correctly

### Payment not redirecting?
- Check Cashfree SDK is loaded (check browser console)
- Verify return URL is correct

### Database not updating?
- Check RLS policies on payments table
- Verify SUPABASE_SERVICE_ROLE_KEY is correct

## 💰 Fees & Settlement

### Cashfree Charges:
- Domestic Cards: 2% + GST
- UPI: 0.5% - 1%
- Net Banking: 2% + GST

### Example:
```
Student pays: ₹72,000
Cashfree fee (2%): ₹1,440
GST (18%): ₹259
You receive: ₹70,301
```

### Settlement:
- Sandbox: Instant (for testing)
- Production: T+1 or T+2 days
- Money comes to your bank account

## 📞 Support

### Supabase Issues:
- Docs: https://supabase.com/docs/guides/functions
- Discord: https://discord.supabase.com

### Cashfree Issues:
- Support: support@cashfree.com
- Docs: https://docs.cashfree.com
- Dashboard: https://merchant.cashfree.com

## ✅ Checklist

Before going live:
- [ ] Supabase CLI installed
- [ ] Edge Functions deployed
- [ ] Secrets configured in Supabase
- [ ] Test payment successful in sandbox
- [ ] Cashfree KYC completed
- [ ] Production credentials obtained
- [ ] Test ₹1 transaction done
- [ ] Bank account verified
- [ ] Return URL configured
- [ ] Payment verification working

---

**Ab real payment ready hai! 🚀**

Koi problem aaye toh batana, main help karunga.

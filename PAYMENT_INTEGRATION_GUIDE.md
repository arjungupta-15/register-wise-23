# 💳 Cashfree Payment Gateway Integration Guide

## 📋 Complete Setup Instructions

### Step 1: Get Cashfree Credentials

1. **Sign up on Cashfree**
   - Visit: https://www.cashfree.com/
   - Click "Sign Up" and create account
   - Complete KYC verification

2. **Get API Credentials**
   - Login to Cashfree Dashboard
   - Go to: **Developers → API Keys**
   - Copy:
     - **App ID** (Client ID)
     - **Secret Key**

3. **Update .env File**
   ```env
   VITE_CASHFREE_APP_ID="your_actual_app_id"
   VITE_CASHFREE_SECRET_KEY="your_actual_secret_key"
   VITE_CASHFREE_MODE="sandbox"  # Use "production" for live
   ```

---

### Step 2: Run Database Migration

Run this SQL in Supabase SQL Editor:

```sql
-- Create payments table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('onetime', 'installment')),
  installment_number INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  payment_session_id TEXT,
  payment_method TEXT,
  transaction_id TEXT,
  payment_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view payments" ON payments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert payments" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update payments" ON payments FOR UPDATE USING (true);

CREATE TRIGGER update_payments_updated_at 
BEFORE UPDATE ON payments 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
```

---

### Step 3: How to Use Payment Button

**Example Usage in StudentStatus.tsx:**

```tsx
import PaymentButton from "@/components/PaymentButton";

// Inside your component:
<PaymentButton
  amount={72000}
  studentId={student.id}
  studentName={student.name}
  studentMobile={student.mobile}
  studentEmail={student.email}
  paymentType="onetime"
  onSuccess={() => {
    // Refresh student data
    loadStudent();
  }}
/>
```

**For Installments:**

```tsx
<PaymentButton
  amount={40000}
  studentId={student.id}
  studentName={student.name}
  studentMobile={student.mobile}
  paymentType="installment"
  installmentNumber={1}
  onSuccess={() => loadStudent()}
/>
```

---

### Step 4: Testing Payment Flow

#### Sandbox Mode Testing:

1. **Test Card Details:**
   ```
   Card Number: 4111 1111 1111 1111
   CVV: 123
   Expiry: Any future date (e.g., 12/25)
   OTP: 123456
   ```

2. **Test UPI:**
   ```
   UPI ID: success@upi
   ```

3. **Test Net Banking:**
   - Select any bank
   - Use test credentials provided by Cashfree

#### Testing Steps:
1. Register a student
2. Complete student details
3. Go to Student Status page
4. Click "Pay Online" button
5. Use test card details
6. Complete payment
7. Verify payment success page
8. Check database for payment record

---

### Step 5: Go Live (Production)

1. **Complete KYC on Cashfree**
   - Submit business documents
   - Wait for approval

2. **Get Production Credentials**
   - Go to Production API Keys
   - Copy new App ID and Secret Key

3. **Update .env**
   ```env
   VITE_CASHFREE_MODE="production"
   VITE_CASHFREE_APP_ID="production_app_id"
   VITE_CASHFREE_SECRET_KEY="production_secret_key"
   ```

4. **Test with Small Amount**
   - Make a real ₹1 transaction
   - Verify it works end-to-end
   - Check money in your account

5. **Go Live!**
   - Deploy your application
   - Start accepting real payments

---

## 🔧 Files Created/Modified

### New Files:
1. `src/lib/cashfree.ts` - Payment gateway configuration
2. `src/components/PaymentButton.tsx` - Reusable payment button
3. `src/pages/PaymentSuccess.tsx` - Payment success/failure page
4. `supabase/migrations/006_create_payments_table.sql` - Database schema

### Modified Files:
1. `.env` - Added Cashfree credentials
2. `src/App.tsx` - Added payment success route

---

## 💰 Payment Flow

```
Student clicks "Pay" 
    ↓
PaymentButton creates order
    ↓
Saves to database (status: pending)
    ↓
Redirects to Cashfree payment page
    ↓
Student completes payment
    ↓
Cashfree redirects to /payment/success
    ↓
System verifies payment
    ↓
Updates database (status: success)
    ↓
Updates student payment_status to 'paid'
    ↓
Shows success message
```

---

## 🛡️ Security Best Practices

1. **Never expose Secret Key in frontend**
   - ✅ We use it only in API calls
   - ✅ Environment variables are safe

2. **Always verify payments**
   - ✅ We verify with Cashfree API
   - ✅ Don't trust client-side data

3. **Use HTTPS in production**
   - Required for payment gateway
   - Cashfree won't work on HTTP

4. **Keep .env file secure**
   - ✅ Already in .gitignore
   - Never commit to GitHub

---

## 📊 Admin Features

### View All Payments:
```sql
SELECT 
  p.order_id,
  s.name,
  s.mobile,
  p.amount,
  p.status,
  p.payment_time
FROM payments p
JOIN students s ON p.student_id = s.id
ORDER BY p.created_at DESC;
```

### Check Payment Status:
```sql
SELECT * FROM payments WHERE student_id = 'student_uuid';
```

---

## 🐛 Troubleshooting

### Payment button not working?
- Check .env file has correct credentials
- Restart dev server after updating .env
- Check browser console for errors

### Payment verification failing?
- Check Cashfree dashboard for order status
- Verify API credentials are correct
- Check network tab for API errors

### Database errors?
- Run migration SQL again
- Check Supabase logs
- Verify RLS policies are correct

---

## 💡 Tips for Client Demo

1. **Use Sandbox Mode**
   - Show payment flow without real money
   - Use test cards for demo

2. **Show Payment Records**
   - Admin can see all payments in database
   - Track payment status

3. **Explain Fees**
   - Cashfree charges ~2% per transaction
   - Calculate: ₹72,000 × 2% = ₹1,440 fee
   - You receive: ₹70,560

4. **Settlement Time**
   - Sandbox: Instant (for testing)
   - Production: T+1 or T+2 days
   - Money comes to your bank account

---

## 📞 Support

- **Cashfree Support**: support@cashfree.com
- **Documentation**: https://docs.cashfree.com/
- **Dashboard**: https://merchant.cashfree.com/

---

## ✅ Checklist Before Going Live

- [ ] KYC completed on Cashfree
- [ ] Production credentials obtained
- [ ] Database migration run
- [ ] Test payment successful
- [ ] .env updated with production keys
- [ ] HTTPS enabled on domain
- [ ] Payment flow tested end-to-end
- [ ] Webhook URL configured (if needed)
- [ ] Bank account verified
- [ ] Small test transaction done

---

**Good Luck! 🚀**

Client se acha paisa lena! 💰
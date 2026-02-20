# Cashfree Payment Limit Error - Fix Guide

## Error Message
```
"order amount cannot be greater than the max order amount set with Cashfree"
```

## Problem
Cashfree production account mein maximum order amount limit set hai. Default limit usually:
- New accounts: ₹50,000
- Verified accounts: ₹1,00,000
- Premium accounts: ₹5,00,000+

## Solution 1: Increase Limit in Cashfree Dashboard (Recommended)

### Steps:

1. **Login to Cashfree**
   - Go to: https://merchant.cashfree.com/
   - Login with your credentials

2. **Switch to Live Mode**
   - Toggle at top right corner
   - Make sure you're in "Live" mode, not "Test"

3. **Check Current Limit**
   - Go to **Settings** → **Payment Settings**
   - Look for "Maximum Order Amount" or "Transaction Limit"
   - Note the current limit

4. **Request Limit Increase**
   - Click on "Request Limit Increase" or "Contact Support"
   - Fill the form:
     - Business Type: Educational Institute
     - Average Transaction: ₹72,000
     - Maximum Transaction: ₹1,00,000
     - Monthly Volume: (estimate)
     - Reason: "Student course fee payments"
   
5. **Submit Documents (if required)**
   - Business registration
   - PAN card
   - Bank statement
   - GST certificate (if applicable)

6. **Wait for Approval**
   - Usually takes 1-3 business days
   - Check email for updates
   - Follow up if needed

## Solution 2: Use Installments (Temporary)

While waiting for limit increase, use installment payments:

### Current Limits in Code:
- Full Payment: ₹72,000 (may exceed limit)
- 2 Installments: ₹40,000 + ₹34,000 (within limit)
- 3 Installments: ₹25,000 each (within limit)
- 4 Installments: ₹20,000 each (within limit)

### Recommendation:
Tell students to use installment option until limit is increased.

## Solution 3: Test with Small Amount

For testing purposes, temporarily reduce amounts:

1. Open browser console (F12)
2. Before clicking Pay, run:
   ```javascript
   // This is just for testing
   localStorage.setItem('testMode', 'true');
   ```
3. Test with ₹1 or ₹10
4. Once limit is increased, remove test mode

## Solution 4: Split Payments

If urgent and limit can't be increased:
- Accept partial payment now
- Collect remaining later
- Update payment tracking accordingly

## Check Your Current Limit

### Via Cashfree Dashboard:
1. Login → Live Mode
2. Settings → Payment Settings
3. Look for "Transaction Limits"

### Via API (for developers):
```bash
curl -X GET 'https://api.cashfree.com/pg/account' \
  -H 'x-client-id: YOUR_APP_ID' \
  -H 'x-client-secret: YOUR_SECRET_KEY' \
  -H 'x-api-version: 2023-08-01'
```

## Common Limits by Account Type

| Account Type | Default Limit | Can Increase To |
|--------------|---------------|-----------------|
| New Account | ₹50,000 | ₹1,00,000 |
| Verified | ₹1,00,000 | ₹5,00,000 |
| Premium | ₹5,00,000 | ₹50,00,000+ |

## Code Changes Made

Added validation in `api/create-payment.js`:
- Maximum amount check: ₹1,00,000
- Minimum amount check: ₹1
- Clear error messages

To change the limit in code:
```javascript
const MAX_AMOUNT = 100000; // Change this value
```

## Important Notes

1. **Don't bypass limits** - Cashfree will reject transactions
2. **Verify account** - Complete KYC for higher limits
3. **Business documents** - Keep ready for verification
4. **Test mode** - No limits in test/sandbox mode
5. **Contact support** - For urgent limit increase

## Contact Cashfree Support

- Email: support@cashfree.com
- Phone: +91-80-61799600
- Dashboard: Raise ticket from dashboard
- Response time: Usually 24-48 hours

## Troubleshooting

**Limit increased but still getting error?**
- Clear browser cache
- Wait 10-15 minutes for changes to propagate
- Try in incognito mode
- Check if you're in Live mode

**Can't find limit settings?**
- Some accounts don't show this option
- Contact support directly
- They can check and increase for you

**Need immediate solution?**
- Use installment payments
- Each installment will be under limit
- Students can pay in parts

## Prevention

To avoid this in future:
1. Request higher limit during account setup
2. Provide all business documents upfront
3. Maintain good transaction history
4. Keep account verified and active

## Summary

**Quick Fix:** Use installment payments (all under ₹50,000)

**Permanent Fix:** Request limit increase from Cashfree dashboard

**Timeline:** 1-3 business days for approval

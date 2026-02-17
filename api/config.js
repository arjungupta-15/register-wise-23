// Cashfree Configuration
// NOTE: In production, use environment variables
export const cashfreeConfig = {
  appId: process.env.CASHFREE_APP_ID || 'TEST10957773ed79b84bd2222f0c07ac37775901',
  secretKey: process.env.CASHFREE_SECRET_KEY || 'cfsk_ma_test_2be9b446e849a945aecfb725b01b5b9d_7aebd3e2',
  mode: process.env.CASHFREE_MODE || 'sandbox'
};

export const getCashfreeUrl = () => {
  return cashfreeConfig.mode === 'production' 
    ? 'https://api.cashfree.com/pg' 
    : 'https://sandbox.cashfree.com/pg';
};

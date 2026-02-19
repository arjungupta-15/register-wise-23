// Cashfree Configuration
// NOTE: In production, use environment variables
export const cashfreeConfig = {
  appId: process.env.CASHFREE_APP_ID || 'TEST10957773ed79b84bd2222f0c07ac37775901',
  secretKey: process.env.CASHFREE_SECRET_KEY || 'cfsk_ma_test_2be9b446e849a945aecfb725b01b5b9d_7aebd3e2',
  mode: process.env.CASHFREE_MODE || 'sandbox'
};

// Add detailed logging
console.log('🔧 Cashfree Config:', {
  hasAppId: !!cashfreeConfig.appId,
  hasSecretKey: !!cashfreeConfig.secretKey,
  mode: cashfreeConfig.mode,
  appIdPrefix: cashfreeConfig.appId?.substring(0, 10),
  usingEnvVars: !!process.env.CASHFREE_APP_ID,
  envVarValue: process.env.CASHFREE_MODE || 'NOT_SET'
});

console.log('📋 All Cashfree Env Vars:', {
  CASHFREE_APP_ID: process.env.CASHFREE_APP_ID ? 'SET' : 'NOT_SET',
  CASHFREE_SECRET_KEY: process.env.CASHFREE_SECRET_KEY ? 'SET' : 'NOT_SET',
  CASHFREE_MODE: process.env.CASHFREE_MODE || 'NOT_SET'
});

export const getCashfreeUrl = () => {
  const url = cashfreeConfig.mode === 'production' 
    ? 'https://api.cashfree.com/pg' 
    : 'https://sandbox.cashfree.com/pg';
  console.log('🌐 Cashfree URL:', url);
  return url;
};

// Cashfree Payment Gateway Configuration
export const cashfreeConfig = {
  appId: import.meta.env.VITE_CASHFREE_APP_ID,
  secretKey: import.meta.env.VITE_CASHFREE_SECRET_KEY,
  mode: import.meta.env.VITE_CASHFREE_MODE || 'sandbox',
  apiVersion: '2023-08-01'
};

export const getCashfreeUrl = () => {
  return cashfreeConfig.mode === 'production' 
    ? 'https://api.cashfree.com/pg' 
    : 'https://sandbox.cashfree.com/pg';
};

// Generate order ID
export const generateOrderId = () => {
  return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Create payment session
export const createPaymentSession = async (orderData: {
  orderId: string;
  orderAmount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  returnUrl: string;
}) => {
  try {
    const url = `${getCashfreeUrl()}/orders`;
    
    const payload = {
      order_id: orderData.orderId,
      order_amount: orderData.orderAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: orderData.customerPhone,
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail || `${orderData.customerPhone}@student.com`,
        customer_phone: orderData.customerPhone
      },
      order_meta: {
        return_url: orderData.returnUrl,
        notify_url: `${window.location.origin}/api/payment/webhook`
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': cashfreeConfig.appId,
        'x-client-secret': cashfreeConfig.secretKey,
        'x-api-version': cashfreeConfig.apiVersion
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create payment session');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Payment session creation error:', error);
    throw error;
  }
};

// Verify payment
export const verifyPayment = async (orderId: string) => {
  try {
    const url = `${getCashfreeUrl()}/orders/${orderId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': cashfreeConfig.appId,
        'x-client-secret': cashfreeConfig.secretKey,
        'x-api-version': cashfreeConfig.apiVersion
      }
    });

    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
};
// Vercel Serverless Function for Cashfree Payment
import { cashfreeConfig, getCashfreeUrl } from './config.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, amount, customerName, customerPhone, customerEmail, studentId } = req.body;

    // Validate input
    if (!orderId || !amount || !customerName || !customerPhone || !studentId) {
      throw new Error('Missing required fields');
    }

    // Get Cashfree credentials from config
    const cashfreeAppId = cashfreeConfig.appId;
    const cashfreeSecretKey = cashfreeConfig.secretKey;
    const cashfreeUrl = getCashfreeUrl();

    console.log('Payment request:', { orderId, amount, customerName, hasCredentials: !!cashfreeAppId });

    if (!cashfreeAppId || !cashfreeSecretKey) {
      return res.status(400).json({
        success: false,
        error: 'Cashfree credentials not configured'
      });
    }

    // Create payment order with Cashfree
    const cashfreeResponse = await fetch(`${cashfreeUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': cashfreeAppId,
        'x-client-secret': cashfreeSecretKey,
        'x-api-version': '2023-08-01'
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: customerPhone,
          customer_name: customerName,
          customer_email: customerEmail || `${customerPhone}@student.com`,
          customer_phone: customerPhone
        },
        order_meta: {
          return_url: `${req.headers.origin || 'https://tareducations.vercel.app'}/payment/success?order_id=${orderId}`,
          notify_url: `${req.headers.origin || 'https://tareducations.vercel.app'}/api/payment/webhook`
        }
      })
    });

    if (!cashfreeResponse.ok) {
      const error = await cashfreeResponse.json();
      console.error('Cashfree API error:', error);
      throw new Error(error.message || 'Failed to create payment order');
    }

    const cashfreeData = await cashfreeResponse.json();

    console.log('Payment session created:', { orderId, sessionId: cashfreeData.payment_session_id });

    // Return payment session details
    return res.status(200).json({
      success: true,
      payment_session_id: cashfreeData.payment_session_id,
      order_id: orderId,
      payment_url: cashfreeData.payment_link || null
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

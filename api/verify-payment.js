// Vercel Serverless Function for Payment Verification
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
    const { orderId } = req.body;

    if (!orderId) {
      throw new Error('Order ID is required');
    }

    // Get Cashfree credentials from config
    const cashfreeAppId = cashfreeConfig.appId;
    const cashfreeSecretKey = cashfreeConfig.secretKey;
    const cashfreeUrl = getCashfreeUrl();

    if (!cashfreeAppId || !cashfreeSecretKey) {
      throw new Error('Cashfree credentials not configured');
    }

    // Verify payment with Cashfree
    const cashfreeResponse = await fetch(`${cashfreeUrl}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': cashfreeAppId,
        'x-client-secret': cashfreeSecretKey,
        'x-api-version': '2023-08-01'
      }
    });

    if (!cashfreeResponse.ok) {
      throw new Error('Failed to verify payment');
    }

    const paymentData = await cashfreeResponse.json();

    // Determine payment status
    const paymentStatus = paymentData.order_status === 'PAID' ? 'success' : 
                         paymentData.order_status === 'ACTIVE' ? 'pending' : 'failed';

    return res.status(200).json({
      success: true,
      status: paymentStatus,
      order_id: orderId,
      payment_data: paymentData
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

// Supabase Edge Function for Cashfree Payment
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId, amount, customerName, customerPhone, customerEmail, studentId } = await req.json()

    // Validate input
    if (!orderId || !amount || !customerName || !customerPhone || !studentId) {
      throw new Error('Missing required fields')
    }

    // Get Cashfree credentials from environment
    const cashfreeAppId = Deno.env.get('CASHFREE_APP_ID')
    const cashfreeSecretKey = Deno.env.get('CASHFREE_SECRET_KEY')
    const cashfreeMode = Deno.env.get('CASHFREE_MODE') || 'sandbox'

    if (!cashfreeAppId || !cashfreeSecretKey) {
      throw new Error('Cashfree credentials not configured')
    }

    // Determine Cashfree API URL
    const cashfreeUrl = cashfreeMode === 'production' 
      ? 'https://api.cashfree.com/pg' 
      : 'https://sandbox.cashfree.com/pg'

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
          return_url: `${req.headers.get('origin')}/payment/success?order_id=${orderId}`,
          notify_url: `${req.headers.get('origin')}/api/payment/webhook`
        }
      })
    })

    if (!cashfreeResponse.ok) {
      const error = await cashfreeResponse.json()
      console.error('Cashfree API error:', error)
      throw new Error(error.message || 'Failed to create payment order')
    }

    const cashfreeData = await cashfreeResponse.json()

    // Save payment record to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { error: dbError } = await supabase
      .from('payments')
      .insert({
        order_id: orderId,
        student_id: studentId,
        amount: amount,
        payment_type: 'onetime',
        status: 'pending',
        payment_session_id: cashfreeData.payment_session_id,
        created_at: new Date().toISOString()
      })

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to save payment record')
    }

    // Return payment session details
    return new Response(
      JSON.stringify({
        success: true,
        payment_session_id: cashfreeData.payment_session_id,
        order_id: orderId,
        payment_url: cashfreeData.payment_link || null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

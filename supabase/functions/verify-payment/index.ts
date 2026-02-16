// Supabase Edge Function for Payment Verification
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
    const { orderId } = await req.json()

    if (!orderId) {
      throw new Error('Order ID is required')
    }

    // Get Cashfree credentials
    const cashfreeAppId = Deno.env.get('CASHFREE_APP_ID')
    const cashfreeSecretKey = Deno.env.get('CASHFREE_SECRET_KEY')
    const cashfreeMode = Deno.env.get('CASHFREE_MODE') || 'sandbox'

    if (!cashfreeAppId || !cashfreeSecretKey) {
      throw new Error('Cashfree credentials not configured')
    }

    const cashfreeUrl = cashfreeMode === 'production' 
      ? 'https://api.cashfree.com/pg' 
      : 'https://sandbox.cashfree.com/pg'

    // Verify payment with Cashfree
    const cashfreeResponse = await fetch(`${cashfreeUrl}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': cashfreeAppId,
        'x-client-secret': cashfreeSecretKey,
        'x-api-version': '2023-08-01'
      }
    })

    if (!cashfreeResponse.ok) {
      throw new Error('Failed to verify payment')
    }

    const paymentData = await cashfreeResponse.json()

    // Update payment record in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get payment record
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*, students(*)')
      .eq('order_id', orderId)
      .single()

    if (fetchError || !payment) {
      throw new Error('Payment record not found')
    }

    // Update payment status
    const paymentStatus = paymentData.order_status === 'PAID' ? 'success' : 
                         paymentData.order_status === 'ACTIVE' ? 'pending' : 'failed'

    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: paymentStatus,
        payment_method: paymentData.payment_method || null,
        transaction_id: paymentData.cf_order_id || null,
        payment_time: paymentData.order_status === 'PAID' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId)

    if (updateError) {
      console.error('Failed to update payment:', updateError)
    }

    // If payment successful, update student status
    if (paymentStatus === 'success') {
      const { error: studentUpdateError } = await supabase
        .from('students')
        .update({ payment_status: 'paid' })
        .eq('id', payment.student_id)

      if (studentUpdateError) {
        console.error('Failed to update student:', studentUpdateError)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: paymentStatus,
        order_id: orderId,
        payment_data: paymentData
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

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2, XCircle, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    // Try both orderId and order_id parameters
    const orderId = searchParams.get('order_id') || searchParams.get('orderId');
    
    console.log('=== Payment Success Page Loaded ===');
    console.log('Order ID:', orderId);
    console.log('All URL params:', Object.fromEntries(searchParams.entries()));
    console.log('Full URL:', window.location.href);
    
    if (!orderId) {
      console.error('❌ No order ID found in URL');
      setStatus('failed');
      return;
    }

    verifyPaymentStatus(orderId);
  }, [searchParams]);

  const verifyPaymentStatus = async (orderId: string) => {
    try {
      console.log('Verifying payment for order:', orderId);

      // Call backend API to verify payment
      const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/api'
        : '/api';

      const response = await fetch(`${apiUrl}/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId })
      });

      const data = await response.json();
      console.log('Verification response:', data);

      if (!data.success) {
        throw new Error(data.error || 'Payment verification failed');
      }

      // Update payment status in database
      const { error: updateError } = await (supabase
        .from('payments') as any)
        .update({
          status: data.status,
          transaction_id: data.payment_data?.cf_order_id || null,
          payment_method: data.payment_data?.payment_method || null,
          payment_time: data.status === 'success' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId);

      if (updateError) {
        console.error('Database update error:', updateError);
      }

      // If payment successful, update student payment status
      if (data.status === 'success') {
        const { data: payment } = await (supabase
          .from('payments') as any)
          .select('student_id')
          .eq('order_id', orderId)
          .single();

        if (payment) {
          await (supabase
            .from('students') as any)
            .update({ payment_status: 'paid' })
            .eq('id', payment.student_id);
        }

        setStatus('success');
        setPaymentDetails(data.payment_data);
        
        toast({
          title: "Payment Successful!",
          description: "Your payment has been processed successfully.",
        });
      } else {
        setStatus('failed');
        toast({
          title: "Payment Failed",
          description: "Your payment could not be processed.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      setStatus('failed');
      toast({
        title: "Verification Failed",
        description: error.message || "Could not verify payment status.",
        variant: "destructive"
      });
    }
  };

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-12 pb-8 text-center">
            <Loader2 className="h-16 w-16 text-primary mx-auto mb-6 animate-spin" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Verifying Payment</h2>
            <p className="text-muted-foreground">
              Please wait while we verify your payment...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-12 pb-8 text-center">
            <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground mb-6">
              Your payment has been processed successfully.
            </p>
            
            {paymentDetails && (
              <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order ID:</span>
                    <span className="font-medium text-xs">{paymentDetails.order_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">₹{paymentDetails.order_amount?.toLocaleString() || '72,000'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium text-green-600">Paid</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <Button onClick={() => navigate("/student/status")} className="w-full">
                View Status
              </Button>
              <Button onClick={() => navigate("/")} variant="outline" className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-12 pb-8 text-center">
          <div className="mx-auto h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Payment Failed</h2>
          <p className="text-muted-foreground mb-6">
            Your payment could not be processed. Please try again.
          </p>
          
          <div className="space-y-3">
            <Button onClick={() => navigate("/student/status")} className="w-full">
              Try Again
            </Button>
            <Button onClick={() => navigate("/")} variant="outline" className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
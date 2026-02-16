import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2, XCircle, Home } from "lucide-react";
import { verifyPayment } from "@/lib/cashfree";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    
    if (!orderId) {
      setStatus('failed');
      return;
    }

    verifyPaymentStatus(orderId);
  }, [searchParams]);

  const verifyPaymentStatus = async (orderId: string) => {
    try {
      // Verify payment with Cashfree
      const paymentData = await verifyPayment(orderId);
      
      // Update payment status in database
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: paymentData.order_status === 'PAID' ? 'success' : 'failed',
          transaction_id: paymentData.cf_order_id,
          payment_method: paymentData.payment_method,
          payment_time: new Date().toISOString()
        })
        .eq('order_id', orderId);

      if (updateError) {
        console.error('Database update error:', updateError);
      }

      // If payment successful, update student payment status
      if (paymentData.order_status === 'PAID') {
        const { data: payment } = await supabase
          .from('payments')
          .select('student_id')
          .eq('order_id', orderId)
          .single();

        if (payment) {
          await supabase
            .from('students')
            .update({ payment_status: 'paid' })
            .eq('id', payment.student_id);
        }

        setStatus('success');
        setPaymentDetails(paymentData);
        
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
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('failed');
      toast({
        title: "Verification Failed",
        description: "Could not verify payment status.",
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
                    <span className="font-medium">{paymentDetails.order_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">₹{paymentDetails.order_amount}</span>
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
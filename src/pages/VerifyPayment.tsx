import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const VerifyPayment = () => {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!orderId.trim()) {
      toast({
        title: "Order ID Required",
        description: "Please enter your order ID",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);

    try {
      console.log('🔍 Verifying payment for order:', orderId);

      // Call backend API to verify payment
      const apiUrl = window.location.hostname === 'localhost' 
        ? `${window.location.origin}/api`
        : '/api';

      const response = await fetch(`${apiUrl}/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: orderId.trim() })
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Verification response:', data);

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
        .eq('order_id', orderId.trim());

      if (updateError) {
        console.error('Database update error:', updateError);
      }

      // If payment successful, update student payment status
      if (data.status === 'success') {
        const { data: payment } = await (supabase
          .from('payments') as any)
          .select('student_id')
          .eq('order_id', orderId.trim())
          .single();

        if (payment) {
          await (supabase
            .from('students') as any)
            .update({ payment_status: 'paid' })
            .eq('id', payment.student_id);
        }

        toast({
          title: "Payment Verified!",
          description: "Your payment has been verified successfully.",
        });

        // Redirect to success page
        setTimeout(() => {
          navigate(`/payment/success?order_id=${orderId.trim()}`);
        }, 1000);
      } else {
        toast({
          title: "Payment Not Completed",
          description: "Payment is still pending or failed.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Could not verify payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Search className="h-5 w-5 text-primary" />
            </div>
            Verify Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 If your payment was successful but didn't redirect automatically, 
              enter your Order ID below to verify and complete the process.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderId">Order ID</Label>
            <Input
              id="orderId"
              placeholder="order_1234567890_xxxxx"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              disabled={isVerifying}
            />
            <p className="text-xs text-muted-foreground">
              You can find your Order ID in the payment confirmation email or on the Cashfree payment page.
            </p>
          </div>

          <Button
            onClick={handleVerify}
            disabled={isVerifying || !orderId.trim()}
            className="w-full"
            size="lg"
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying Payment...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify Payment
              </>
            )}
          </Button>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => navigate("/student/status")}
              className="text-sm"
            >
              Back to Status Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyPayment;

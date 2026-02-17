import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { generateOrderId } from "@/lib/cashfree";
import { supabase } from "@/integrations/supabase/client";

interface PaymentButtonProps {
  amount: number;
  studentId: string;
  studentName: string;
  studentMobile: string;
  studentEmail?: string;
  paymentType: "onetime" | "installment";
  installmentNumber?: number;
  onSuccess?: () => void;
}

const PaymentButton = ({
  amount,
  studentId,
  studentName,
  studentMobile,
  studentEmail,
  paymentType,
  installmentNumber,
  onSuccess
}: PaymentButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Generate unique order ID
      const orderId = generateOrderId();
      
      // Determine API URL (Vercel or local)
      const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/api'
        : '/api';
      
      // Call backend API to create payment
      const response = await fetch(`${apiUrl}/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          customerName: studentName,
          customerPhone: studentMobile,
          customerEmail: studentEmail || `${studentMobile}@student.com`,
          studentId,
          paymentType,
          installmentNumber
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create payment session');
      }

      console.log('Payment session created:', data);

      // Save payment record to database
      const { error: dbError } = await (supabase
        .from('payments') as any)
        .insert({
          order_id: orderId,
          student_id: studentId,
          amount: amount,
          payment_type: paymentType,
          installment_number: installmentNumber || null,
          status: 'pending',
          payment_session_id: data.payment_session_id,
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Database error:', dbError);
      }

      // Initialize Cashfree SDK
      const loadCashfree = () => {
        return new Promise((resolve, reject) => {
          if ((window as any).Cashfree) {
            resolve((window as any).Cashfree);
            return;
          }

          const script = document.createElement('script');
          script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
          script.onload = () => {
            if ((window as any).Cashfree) {
              resolve((window as any).Cashfree);
            } else {
              reject(new Error('Cashfree SDK failed to load'));
            }
          };
          script.onerror = () => reject(new Error('Failed to load Cashfree SDK'));
          document.head.appendChild(script);
        });
      };

      // Load and initialize Cashfree
      const Cashfree: any = await loadCashfree();
      
      // Initialize Cashfree with mode
      const cashfree = Cashfree.create({
        mode: 'sandbox' // Change to 'production' for live
      });

      // Open checkout
      const checkoutOptions = {
        paymentSessionId: data.payment_session_id,
        returnUrl: `${window.location.origin}/payment/success?order_id=${orderId}`,
      };

      cashfree.checkout(checkoutOptions);

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isProcessing}
      className="w-full"
      size="lg"
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Redirecting to Payment...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4 mr-2" />
          Pay ₹{amount.toLocaleString()}
        </>
      )}
    </Button>
  );
};

export default PaymentButton;
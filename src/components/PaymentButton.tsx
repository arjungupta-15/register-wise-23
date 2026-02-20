import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2, CheckCircle } from "lucide-react";
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
  const [showVerifyButton, setShowVerifyButton] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Generate unique order ID
      const orderId = generateOrderId();
      
      // Determine API URL based on environment
      // For Hostinger frontend calling Vercel backend
      const apiUrl = window.location.hostname === 'localhost' 
        ? `${window.location.origin}/api`  // Use same origin for local dev
        : 'https://tareducations.vercel.app/api';  // Vercel backend
      
      console.log('API URL:', apiUrl);
      console.log('Calling create-payment API...');
      
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
      console.log('API Response:', data);

      if (!data.success) {
        throw new Error(data.error || 'Failed to create payment session');
      }

      console.log('Payment session created:', data);

      // Save order ID to localStorage for easy verification later
      localStorage.setItem('lastPaymentOrderId', data.order_id);
      console.log('💾 Order ID saved to localStorage:', data.order_id);

      // Save payment record to database
      const { error: dbError } = await (supabase
        .from('payments') as any)
        .insert({
          order_id: data.order_id,
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

      // Load Cashfree SDK
      const Cashfree: any = await loadCashfree();
      
      console.log('✅ Cashfree SDK loaded');
      console.log('🔧 Mode from env:', import.meta.env.VITE_CASHFREE_MODE);
      
      // Create checkout instance - Production mode (domain approved)
      const mode = import.meta.env.VITE_CASHFREE_MODE || 'production';
      console.log('🎯 Using mode:', mode);
      
      const cashfree = Cashfree({
        mode: mode
      });

      console.log('💳 Opening checkout with session:', data.payment_session_id);

      // Reset processing state after modal opens (so button doesn't stay stuck)
      setTimeout(() => {
        setIsProcessing(false);
        setShowVerifyButton(true);
      }, 2000); // Give 2 seconds for modal to open

      // Open checkout with callback handlers
      cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: '_modal'
      }).then((result: any) => {
        console.log('✅ Checkout completed:', result);
        // Show verify button after modal closes
        setShowVerifyButton(true);
        setIsProcessing(false);
        toast({
          title: "Payment Process Completed",
          description: "Please verify your payment status below.",
        });
      }).catch((error: any) => {
        console.error('❌ Checkout error:', error);
        // Even on error, show verify button so user can check status
        setShowVerifyButton(true);
        setIsProcessing(false);
      });
      
      console.log('🚀 Checkout initiated');

    } catch (error: any) {
      console.error('❌ Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  // If payment completed successfully, show verify button
  if (showVerifyButton) {
    return (
      <div className="space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          💡 Payment process completed. Click below to verify your payment status.
        </div>
        <Button
          onClick={() => window.location.href = '/payment/verify'}
          variant="default"
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Verify Payment Status
        </Button>
      </div>
    );
  }

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
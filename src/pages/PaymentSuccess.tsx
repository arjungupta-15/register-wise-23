import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PaymentReceipt from "@/components/PaymentReceipt";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id') || searchParams.get('orderId');
  const [studentData, setStudentData] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Update payment status in database and fetch details
    if (orderId) {
      updatePaymentStatus(orderId);
    }
  }, [orderId]);

  const updatePaymentStatus = async (orderId: string) => {
    try {
      // Update payment status to success
      const { error: updateError } = await (supabase
        .from('payments') as any)
        .update({
          status: 'success',
          payment_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId);

      if (updateError) {
        console.error('Database update error:', updateError);
      }

      // Fetch payment details with student info
      const { data: payment } = await (supabase
        .from('payments') as any)
        .select(`
          *,
          students (
            id,
            name,
            mobile,
            email,
            registration_id,
            student_courses (
              courses (
                name,
                fee
              )
            )
          )
        `)
        .eq('order_id', orderId)
        .single();

      if (payment) {
        setPaymentData(payment);
        setStudentData({
          ...payment.students,
          courses: payment.students.student_courses?.map((sc: any) => sc.courses) || []
        });

        // Update student payment status
        await (supabase
          .from('students') as any)
          .update({ payment_status: 'paid' })
          .eq('id', payment.student_id);
      }
    } catch (error) {
      console.error('Error updating payment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-12 pb-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading receipt...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl space-y-6">
        {/* Success Message */}
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-12 pb-8 text-center">
            <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground mb-6">
              Your payment has been processed successfully.
            </p>
            
            {orderId && (
              <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order ID:</span>
                    <span className="font-medium text-xs">{orderId}</span>
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

        {/* Payment Receipt */}
        {studentData && paymentData && (
          <PaymentReceipt
            student={studentData}
            payment={paymentData}
            courses={studentData.courses}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
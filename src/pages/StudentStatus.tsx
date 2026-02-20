import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, CreditCard, Building2, ArrowLeft, BookOpen, GraduationCap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PaymentButton from "@/components/PaymentButton";
import { calculatePricing, parseFee, getInstallmentTotal, formatCurrency, type PricingPlan } from "@/lib/pricing";

interface Student {
  id: string;
  registration_id?: number;
  name: string;
  email: string | null;
  mobile: string | null;
  status: "pending" | "approved" | "rejected";
  payment_status: "pending" | "paid";
  center: 'rajasthan' | 'centerexam' | 'other';
  created_at: string;
  courses?: { id: string; name: string; fee?: string }[];
}

const courseNames: Record<string, string> = {
  "rs-cfa": "Computer Fundamentals & Applications",
  "rs-dca": "Diploma in Computer Applications", 
  "rs-pgdca": "PG Diploma in Computer Applications",
  "rs-tally": "Tally & Accounting",
  "rs-web": "Web Development",
  "rs-python": "Python Programming",
  "ce-ccc": "CCC (Course on Computer Concepts)",
  "ce-bcc": "BCC (Basic Computer Course)",
  "ce-acc": "ACC (Advanced Computer Course)",
  "ce-nielit": "NIELIT Courses",
  "ce-doeacc": "DOEACC Courses",
  "ce-typing": "Typing & Stenography",
  "ot-bca": "Bachelor in Computer Applications",
  "ot-mca": "Master in Computer Applications",
  "ot-data": "Data Science & Analytics",
  "ot-ai": "Artificial Intelligence",
  "ot-cyber": "Cyber Security",
  "ot-cloud": "Cloud Computing",
};

const StudentStatus = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [pricing, setPricing] = useState<PricingPlan | null>(null);

  useEffect(() => {
    console.log('StudentStatus component mounted'); // Debug log
    
    // Check if student is logged in
    const authData = JSON.parse(localStorage.getItem("studentAuth") || "{}");
    const currentStudentId = localStorage.getItem("currentStudentId");
    
    console.log('Auth data:', authData); // Debug log
    console.log('Current student ID:', currentStudentId); // Debug log
    
    if (!authData.mobile && !currentStudentId) {
      console.log('No auth data found, redirecting to login'); // Debug log
      navigate("/student/login");
      return;
    }

    loadStudent(authData.mobile, currentStudentId);
  }, [navigate]);

  const loadStudent = async (mobile?: string, studentId?: string) => {
    setLoading(true);
    try {
      let student = null;
      
      // First try Supabase
      if (studentId) {
        const { data, error } = await supabase
          .from('students')
          .select(`
            *,
            student_courses (
              course_id,
              courses (
                id,
                name,
                fee
              )
            )
          `)
          .eq('id', studentId)
          .single();

        if (!error && data) {
          student = {
            ...(data as any),
            courses: (data as any).student_courses?.map((sc: any) => sc.courses).filter(Boolean) || []
          };
          
          // Load payments for this student
          const { data: paymentsData } = await (supabase
            .from('payments') as any)
            .select('*')
            .eq('student_id', studentId)
            .eq('status', 'success')
            .order('created_at', { ascending: true });
          
          if (paymentsData) {
            setPayments(paymentsData);
            console.log('Loaded payments:', paymentsData);
          }
        }
      } else if (mobile) {
        const { data, error } = await supabase
          .from('students')
          .select(`
            *,
            student_courses (
              course_id,
              courses (
                id,
                name,
                fee
              )
            )
          `)
          .eq('mobile', mobile)
          .single();

        if (!error && data) {
          student = {
            ...(data as any),
            courses: (data as any).student_courses?.map((sc: any) => sc.courses).filter(Boolean) || []
          };
          
          // Load payments for this student
          const { data: paymentsData } = await (supabase
            .from('payments') as any)
            .select('*')
            .eq('student_id', (data as any).id)
            .eq('status', 'success')
            .order('created_at', { ascending: true });
          
          if (paymentsData) {
            setPayments(paymentsData);
            console.log('Loaded payments:', paymentsData);
          }
        }
      }
      
      // If Supabase fails, try localStorage as fallback
      if (!student) {
        const registeredStudents = JSON.parse(localStorage.getItem("registeredStudents") || "[]");
        const localStudent = registeredStudents.find((s: any) => {
          if (studentId && s.id === Number(studentId)) return true;
          if (mobile) {
            return s.mobile === mobile;
          }
          return false;
        });
        
        if (localStudent) {
          // Convert localStorage format to Supabase format
          student = {
            id: localStudent.id.toString(),
            registration_id: localStudent.registration_id || (10000 + Number(localStudent.id)),
            name: localStudent.name,
            email: null,
            mobile: localStudent.mobile,
            status: localStudent.status || 'pending',
            payment_status: localStudent.paymentStatus || 'pending',
            center: localStudent.center,
            created_at: localStudent.registeredAt || new Date().toISOString(),
            courses: localStudent.selectedCourses?.map((courseId: string) => ({
              id: courseId,
              name: getCourseNameById(courseId)
            })) || []
          };
        }
      }

      setStudent(student);
      
      // Calculate pricing based on minimum course fee
      if (student && student.courses && student.courses.length > 0) {
        console.log('📚 Student courses:', student.courses); // Debug
        
        const courseFees = student.courses
          .map(c => {
            console.log('Course:', c.name, 'Fee string:', c.fee); // Debug
            return c.fee ? parseFee(c.fee) : 0;
          })
          .filter(fee => fee > 0);
        
        console.log('💰 Parsed course fees:', courseFees); // Debug
        
        if (courseFees.length > 0) {
          const minFee = Math.min(...courseFees);
          console.log('✅ Minimum fee:', minFee);
          const calculatedPricing = calculatePricing(minFee);
          console.log('💵 Calculated pricing:', calculatedPricing);
          setPricing(calculatedPricing);
        } else {
          console.log('⚠️ No valid course fees found, using default');
          setPricing(calculatePricing(72000));
        }
      } else {
        console.log('⚠️ No courses found, using default pricing');
        setPricing(calculatePricing(72000));
      }
    } catch (error) {
      console.error('Error loading student:', error);
      setStudent(null);
      setPricing(calculatePricing(72000)); // Default pricing
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get course name by ID (for localStorage fallback)
  const getCourseNameById = (courseId: string) => {
    const courseNames: Record<string, string> = {
      "rs-cfa": "Computer Fundamentals & Applications",
      "rs-dca": "Diploma in Computer Applications",
      "rs-pgdca": "PG Diploma in Computer Applications",
      "rs-tally": "Tally & Accounting",
      "rs-web": "Web Development",
      "rs-python": "Python Programming",
      "ce-ccc": "CCC (Course on Computer Concepts)",
      "ce-bcc": "BCC (Basic Computer Course)",
      "ce-acc": "ACC (Advanced Computer Course)",
      "ce-nielit": "NIELIT Courses",
      "ce-doeacc": "DOEACC Courses",
      "ce-typing": "Typing & Stenography",
      "ot-bca": "Bachelor in Computer Applications",
      "ot-mca": "Master in Computer Applications",
      "ot-data": "Data Science & Analytics",
      "ot-ai": "Artificial Intelligence",
      "ot-cyber": "Cyber Security",
      "ot-cloud": "Cloud Computing",
    };
    return courseNames[courseId] || courseId;
  };

  // Check if full payment is done
  const isFullPaymentDone = () => {
    return payments.some(p => p.payment_type === 'onetime' && p.amount >= 72000);
  };

  // Get paid installments
  const getPaidInstallments = () => {
    return payments.filter(p => p.payment_type === 'installment');
  };

  // Calculate total paid amount
  const getTotalPaid = () => {
    return payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  };

  // Check if all payments are complete
  const isPaymentComplete = () => {
    if (isFullPaymentDone()) return true;
    
    const totalPaid = getTotalPaid();
    // Consider payment complete if paid >= minimum required (full payment amount)
    return pricing ? totalPaid >= pricing.fullPayment : totalPaid >= 72000;
  };

  // Check if any installment from a specific plan is paid
  const hasAnyInstallmentPaid = () => {
    return getPaidInstallments().length > 0;
  };

  // Check if specific installment is paid
  const isInstallmentPaid = (installmentNumber: number) => {
    return payments.some(p => 
      p.payment_type === 'installment' && 
      p.installment_number === installmentNumber &&
      p.status === 'success'
    );
  };

  // Get the installment plan being used (based on payment count and pricing)
  const getActiveInstallmentPlan = () => {
    const paidInstallments = getPaidInstallments();
    if (paidInstallments.length === 0) return null;
    
    // Check if we have pricing data
    if (!pricing) return null;
    
    // Check amounts against pricing to determine plan
    const firstAmount = parseFloat(paidInstallments[0].amount);
    
    // Check 2 installments (with tolerance for rounding)
    if (Math.abs(firstAmount - pricing.twoInstallments[0]) < 10) return '2-installment';
    
    // Check 3 installments
    if (Math.abs(firstAmount - pricing.threeInstallments[0]) < 10) return '3-installment';
    
    // Check 4 installments
    if (Math.abs(firstAmount - pricing.fourInstallments[0]) < 10) return '4-installment';
    
    return null;
  };

  // Check if a payment option should be disabled
  const isPaymentOptionDisabled = (planType: string) => {
    // If full payment done, disable everything
    if (isFullPaymentDone()) return true;
    
    // If any installment paid, disable full payment and other plans
    if (hasAnyInstallmentPaid()) {
      const activePlan = getActiveInstallmentPlan();
      if (planType === 'full') return true;
      if (planType !== activePlan) return true;
    }
    
    return false;
  };

  // Check if specific installment button should be disabled
  const isInstallmentButtonDisabled = (planType: string, installmentNumber: number) => {
    // If full payment done, disable all
    if (isFullPaymentDone()) return true;
    
    // If different plan is active, disable this
    const activePlan = getActiveInstallmentPlan();
    if (activePlan && activePlan !== planType) return true;
    
    // For sequential payment: only enable if previous installment is paid
    if (installmentNumber > 1) {
      return !isInstallmentPaid(installmentNumber - 1);
    }
    
    return false;
  };

  // Get installment amount for display
  const getInstallmentAmount = (plan: '2' | '3' | '4', installmentNumber: number): number => {
    if (!pricing) return 0;
    
    switch (plan) {
      case '2':
        return pricing.twoInstallments[installmentNumber - 1] || 0;
      case '3':
        return pricing.threeInstallments[installmentNumber - 1] || 0;
      case '4':
        return pricing.fourInstallments[installmentNumber - 1] || 0;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("studentAuth");
    localStorage.removeItem("currentStudentId");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    navigate("/");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-6 w-6 text-green-600" />;
      case "rejected": return <XCircle className="h-6 w-6 text-red-600" />;
      default: return <Clock className="h-6 w-6 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "approved": return "Congratulations! Your application has been approved.";
      case "rejected": return "Sorry, your application has been rejected. Please contact admin for more details.";
      default: return "Your application is under review. Please wait for admin approval.";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your status...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Registration Found</h2>
            <p className="text-muted-foreground mb-4">
              We couldn't find your registration. Please register first.
            </p>
            <Button onClick={() => navigate("/register")} className="w-full">
              Register Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('Student data:', student); // Debug log

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="max-w-6xl mx-auto p-4 space-y-8">
        <div className="flex items-center justify-between pt-6">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">Registration Status</h1>
            <p className="text-muted-foreground">Track your application progress</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            Logout
          </Button>
        </div>

        <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-gray-50">
          <CardContent className="p-8">
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                {getStatusIcon(student.status)}
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full -z-10"></div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Hello, {student.name}!</h2>
                <Badge className={`${getStatusColor(student.status)} text-sm px-3 py-1`}>
                  {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                </Badge>
              </div>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-4 mb-6">
              <p className="text-lg text-muted-foreground">
                {getStatusMessage(student.status)}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-muted-foreground mb-1">Registration ID</p>
                <p className="text-xl font-bold text-primary">
                  #{student.registration_id || student.id}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-muted-foreground mb-1">Applied On</p>
                <p className="text-lg font-semibold text-foreground">
                  {new Date(student.created_at).toLocaleDateString("en-IN")}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-muted-foreground mb-1">Selected Courses</p>
                <p className="text-xl font-bold text-secondary">{student.courses?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {student.status === "approved" && !isPaymentComplete() && (
          <Card className="shadow-xl border-0 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-green-800">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
                Payment Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-white/70 rounded-lg p-4">
                  <p className="text-green-800 font-medium">
                    🎉 Congratulations! Your application has been approved. Please complete the payment to confirm your enrollment.
                  </p>
                  {payments.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm font-semibold text-blue-900">Payment Status:</p>
                      <p className="text-sm text-blue-800">
                        Total Paid: ₹{getTotalPaid().toLocaleString()} 
                        {getPaidInstallments().length > 0 && (
                          <span className="ml-2">
                            ({getPaidInstallments().length} installment{getPaidInstallments().length > 1 ? 's' : ''} paid)
                          </span>
                        )}
                      </p>
                      {pricing && !isPaymentComplete() && (
                        <p className="text-xs text-blue-600 mt-1">
                          Remaining: {formatCurrency(pricing.fullPayment - getTotalPaid())}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Full Payment Option */}
                <div className={`bg-white rounded-lg p-6 shadow-md border-2 ${isPaymentOptionDisabled('full') ? 'border-gray-200 opacity-50' : 'border-green-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Full Payment</h3>
                      <p className="text-sm text-muted-foreground">Pay complete amount at once</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary">
                        {pricing ? formatCurrency(pricing.fullPayment) : '₹72,000'}
                      </p>
                      <p className="text-xs text-green-600 font-medium">Best Value</p>
                    </div>
                  </div>
                  
                  {isPaymentOptionDisabled('full') ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">
                        {isFullPaymentDone() ? '✓ Full payment completed' : 'Installment plan selected'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <PaymentButton
                        amount={pricing?.fullPayment || 72000}
                        studentId={student.id}
                        studentName={student.name}
                        studentMobile={student.mobile || ""}
                        studentEmail={student.email || undefined}
                        paymentType="onetime"
                        onSuccess={() => {
                          toast({
                            title: "Payment Successful!",
                            description: "Your payment has been processed successfully.",
                          });
                          const authData = JSON.parse(localStorage.getItem("studentAuth") || "{}");
                          const currentStudentId = localStorage.getItem("currentStudentId");
                          loadStudent(authData.mobile, currentStudentId);
                        }}
                      />
                    </>
                  )}
                </div>

                {/* Installment Options */}
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">OR</p>
                    <p className="text-lg font-bold text-foreground mt-1">Choose Installment Plan</p>
                  </div>

                  {/* 2 Installments */}
                  <div className={`bg-white rounded-lg p-6 shadow-md border-2 ${isPaymentOptionDisabled('2-installment') ? 'border-gray-200 opacity-50' : 'border-blue-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">2 Installments</h3>
                        <p className="text-sm text-muted-foreground">
                          {pricing ? `${formatCurrency(pricing.twoInstallments[0])} + ${formatCurrency(pricing.twoInstallments[1])}` : '₹40,000 + ₹34,000'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {pricing ? formatCurrency(getInstallmentTotal(pricing, '2')) : '₹74,000'}
                        </p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                    </div>
                    
                    {isPaymentOptionDisabled('2-installment') ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">
                          {isFullPaymentDone() ? 'Full payment completed' : 'Different plan selected'}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            {isInstallmentPaid(1) ? (
                              <div className="text-center py-3 bg-green-50 border border-green-200 rounded">
                                <p className="text-sm font-semibold text-green-800">✓ Paid</p>
                                <p className="text-xs text-green-600">{formatCurrency(getInstallmentAmount('2', 1))}</p>
                              </div>
                            ) : (
                              <PaymentButton
                                amount={pricing?.twoInstallments[0] || 40000}
                                studentId={student.id}
                                studentName={student.name}
                                studentMobile={student.mobile || ""}
                                studentEmail={student.email || undefined}
                                paymentType="installment"
                                installmentNumber={1}
                                onSuccess={() => {
                                  toast({
                                    title: "1st Installment Paid!",
                                    description: `${formatCurrency(getInstallmentAmount('2', 1))} payment successful.`,
                                  });
                                  const authData = JSON.parse(localStorage.getItem("studentAuth") || "{}");
                                  const currentStudentId = localStorage.getItem("currentStudentId");
                                  loadStudent(authData.mobile, currentStudentId);
                                }}
                              />
                            )}
                          </div>
                          <div>
                            {isInstallmentPaid(2) ? (
                              <div className="text-center py-3 bg-green-50 border border-green-200 rounded">
                                <p className="text-sm font-semibold text-green-800">✓ Paid</p>
                                <p className="text-xs text-green-600">{formatCurrency(getInstallmentAmount('2', 2))}</p>
                              </div>
                            ) : isInstallmentButtonDisabled('2-installment', 2) ? (
                              <div className="text-center py-3 bg-gray-50 border border-gray-200 rounded opacity-50">
                                <p className="text-sm text-gray-500">Pay 1st First</p>
                                <p className="text-xs text-gray-400">{formatCurrency(getInstallmentAmount('2', 2))}</p>
                              </div>
                            ) : (
                              <PaymentButton
                                amount={pricing?.twoInstallments[1] || 34000}
                                studentId={student.id}
                                studentName={student.name}
                                studentMobile={student.mobile || ""}
                                studentEmail={student.email || undefined}
                                paymentType="installment"
                                installmentNumber={2}
                                onSuccess={() => {
                                  toast({
                                    title: "2nd Installment Paid!",
                                    description: `${formatCurrency(getInstallmentAmount('2', 2))} payment successful.`,
                                  });
                                  const authData = JSON.parse(localStorage.getItem("studentAuth") || "{}");
                                  const currentStudentId = localStorage.getItem("currentStudentId");
                                  loadStudent(authData.mobile, currentStudentId);
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* 3 Installments */}
                  <div className={`bg-white rounded-lg p-6 shadow-md border-2 ${isPaymentOptionDisabled('3-installment') ? 'border-gray-200 opacity-50' : 'border-purple-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">3 Installments</h3>
                        <p className="text-sm text-muted-foreground">
                          {pricing ? `${formatCurrency(pricing.threeInstallments[0])} each` : '₹25,000 each'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {pricing ? formatCurrency(getInstallmentTotal(pricing, '3')) : '₹75,000'}
                        </p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                    </div>
                    
                    {isPaymentOptionDisabled('3-installment') ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">
                          {isFullPaymentDone() ? 'Full payment completed' : 'Different plan selected'}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            {isInstallmentPaid(1) ? (
                              <div className="text-center py-3 bg-green-50 border border-green-200 rounded">
                                <p className="text-xs font-semibold text-green-800">✓ Paid</p>
                                <p className="text-xs text-green-600">{formatCurrency(getInstallmentAmount('3', 1))}</p>
                              </div>
                            ) : (
                              <PaymentButton
                                amount={pricing?.threeInstallments[0] || 25000}
                                studentId={student.id}
                                studentName={student.name}
                                studentMobile={student.mobile || ""}
                                studentEmail={student.email || undefined}
                                paymentType="installment"
                                installmentNumber={1}
                                onSuccess={() => {
                                  toast({
                                    title: "1st Installment Paid!",
                                    description: `${formatCurrency(getInstallmentAmount('3', 1))} payment successful.`,
                                  });
                                  const authData = JSON.parse(localStorage.getItem("studentAuth") || "{}");
                                  const currentStudentId = localStorage.getItem("currentStudentId");
                                  loadStudent(authData.mobile, currentStudentId);
                                }}
                              />
                            )}
                          </div>
                          <div>
                            {isInstallmentPaid(2) ? (
                              <div className="text-center py-3 bg-green-50 border border-green-200 rounded">
                                <p className="text-xs font-semibold text-green-800">✓ Paid</p>
                                <p className="text-xs text-green-600">{formatCurrency(getInstallmentAmount('3', 2))}</p>
                              </div>
                            ) : isInstallmentButtonDisabled('3-installment', 2) ? (
                              <div className="text-center py-3 bg-gray-50 border border-gray-200 rounded opacity-50">
                                <p className="text-xs text-gray-500">Pay 1st</p>
                                <p className="text-xs text-gray-400">{formatCurrency(getInstallmentAmount('3', 2))}</p>
                              </div>
                            ) : (
                              <PaymentButton
                                amount={pricing?.threeInstallments[1] || 25000}
                                studentId={student.id}
                                studentName={student.name}
                                studentMobile={student.mobile || ""}
                                studentEmail={student.email || undefined}
                                paymentType="installment"
                                installmentNumber={2}
                                onSuccess={() => {
                                  toast({
                                    title: "2nd Installment Paid!",
                                    description: `${formatCurrency(getInstallmentAmount('3', 2))} payment successful.`,
                                  });
                                  const authData = JSON.parse(localStorage.getItem("studentAuth") || "{}");
                                  const currentStudentId = localStorage.getItem("currentStudentId");
                                  loadStudent(authData.mobile, currentStudentId);
                                }}
                              />
                            )}
                          </div>
                          <div>
                            {isInstallmentPaid(3) ? (
                              <div className="text-center py-3 bg-green-50 border border-green-200 rounded">
                                <p className="text-xs font-semibold text-green-800">✓ Paid</p>
                                <p className="text-xs text-green-600">{formatCurrency(getInstallmentAmount('3', 3))}</p>
                              </div>
                            ) : isInstallmentButtonDisabled('3-installment', 3) ? (
                              <div className="text-center py-3 bg-gray-50 border border-gray-200 rounded opacity-50">
                                <p className="text-xs text-gray-500">Pay 2nd</p>
                                <p className="text-xs text-gray-400">{formatCurrency(getInstallmentAmount('3', 3))}</p>
                              </div>
                            ) : (
                              <PaymentButton
                                amount={pricing?.threeInstallments[2] || 25000}
                                studentId={student.id}
                                studentName={student.name}
                                studentMobile={student.mobile || ""}
                                studentEmail={student.email || undefined}
                                paymentType="installment"
                                installmentNumber={3}
                                onSuccess={() => {
                                  toast({
                                    title: "3rd Installment Paid!",
                                    description: `${formatCurrency(getInstallmentAmount('3', 3))} payment successful.`,
                                  });
                                  const authData = JSON.parse(localStorage.getItem("studentAuth") || "{}");
                                  const currentStudentId = localStorage.getItem("currentStudentId");
                                  loadStudent(authData.mobile, currentStudentId);
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* 4 Installments */}
                  <div className={`bg-white rounded-lg p-6 shadow-md border-2 ${isPaymentOptionDisabled('4-installment') ? 'border-gray-200 opacity-50' : 'border-orange-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">4 Installments</h3>
                        <p className="text-sm text-muted-foreground">
                          {pricing ? `${formatCurrency(pricing.fourInstallments[0])} each` : '₹20,000 each'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {pricing ? formatCurrency(getInstallmentTotal(pricing, '4')) : '₹80,000'}
                        </p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                    </div>
                    
                    {isPaymentOptionDisabled('4-installment') ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">
                          {isFullPaymentDone() ? 'Full payment completed' : 'Different plan selected'}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            {isInstallmentPaid(1) ? (
                              <div className="text-center py-3 bg-green-50 border border-green-200 rounded">
                                <p className="text-sm font-semibold text-green-800">✓ Paid</p>
                                <p className="text-xs text-green-600">{formatCurrency(getInstallmentAmount('4', 1))}</p>
                              </div>
                            ) : (
                              <PaymentButton
                                amount={pricing?.fourInstallments[0] || 20000}
                                studentId={student.id}
                                studentName={student.name}
                                studentMobile={student.mobile || ""}
                                studentEmail={student.email || undefined}
                                paymentType="installment"
                                installmentNumber={1}
                                onSuccess={() => {
                                  toast({
                                    title: "1st Installment Paid!",
                                    description: `${formatCurrency(getInstallmentAmount('4', 1))} payment successful.`,
                                  });
                                  const authData = JSON.parse(localStorage.getItem("studentAuth") || "{}");
                                  const currentStudentId = localStorage.getItem("currentStudentId");
                                  loadStudent(authData.mobile, currentStudentId);
                                }}
                              />
                            )}
                          </div>
                          <div>
                            {isInstallmentPaid(2) ? (
                              <div className="text-center py-3 bg-green-50 border border-green-200 rounded">
                                <p className="text-sm font-semibold text-green-800">✓ Paid</p>
                                <p className="text-xs text-green-600">{formatCurrency(getInstallmentAmount('4', 2))}</p>
                              </div>
                            ) : isInstallmentButtonDisabled('4-installment', 2) ? (
                              <div className="text-center py-3 bg-gray-50 border border-gray-200 rounded opacity-50">
                                <p className="text-sm text-gray-500">Pay 1st First</p>
                                <p className="text-xs text-gray-400">{formatCurrency(getInstallmentAmount('4', 2))}</p>
                              </div>
                            ) : (
                              <PaymentButton
                                amount={pricing?.fourInstallments[1] || 20000}
                                studentId={student.id}
                                studentName={student.name}
                                studentMobile={student.mobile || ""}
                                studentEmail={student.email || undefined}
                                paymentType="installment"
                                installmentNumber={2}
                                onSuccess={() => {
                                  toast({
                                    title: "2nd Installment Paid!",
                                    description: `${formatCurrency(getInstallmentAmount('4', 2))} payment successful.`,
                                  });
                                  const authData = JSON.parse(localStorage.getItem("studentAuth") || "{}");
                                  const currentStudentId = localStorage.getItem("currentStudentId");
                                  loadStudent(authData.mobile, currentStudentId);
                                }}
                              />
                            )}
                          </div>
                          <div>
                            {isInstallmentPaid(3) ? (
                              <div className="text-center py-3 bg-green-50 border border-green-200 rounded">
                                <p className="text-sm font-semibold text-green-800">✓ Paid</p>
                                <p className="text-xs text-green-600">{formatCurrency(getInstallmentAmount('4', 3))}</p>
                              </div>
                            ) : isInstallmentButtonDisabled('4-installment', 3) ? (
                              <div className="text-center py-3 bg-gray-50 border border-gray-200 rounded opacity-50">
                                <p className="text-sm text-gray-500">Pay 2nd First</p>
                                <p className="text-xs text-gray-400">{formatCurrency(getInstallmentAmount('4', 3))}</p>
                              </div>
                            ) : (
                              <PaymentButton
                                amount={pricing?.fourInstallments[2] || 20000}
                                studentId={student.id}
                                studentName={student.name}
                                studentMobile={student.mobile || ""}
                                studentEmail={student.email || undefined}
                                paymentType="installment"
                                installmentNumber={3}
                                onSuccess={() => {
                                  toast({
                                    title: "3rd Installment Paid!",
                                    description: `${formatCurrency(getInstallmentAmount('4', 3))} payment successful.`,
                                  });
                                  const authData = JSON.parse(localStorage.getItem("studentAuth") || "{}");
                                  const currentStudentId = localStorage.getItem("currentStudentId");
                                  loadStudent(authData.mobile, currentStudentId);
                                }}
                              />
                            )}
                          </div>
                          <div>
                            {isInstallmentPaid(4) ? (
                              <div className="text-center py-3 bg-green-50 border border-green-200 rounded">
                                <p className="text-sm font-semibold text-green-800">✓ Paid</p>
                                <p className="text-xs text-green-600">{formatCurrency(getInstallmentAmount('4', 4))}</p>
                              </div>
                            ) : isInstallmentButtonDisabled('4-installment', 4) ? (
                              <div className="text-center py-3 bg-gray-50 border border-gray-200 rounded opacity-50">
                                <p className="text-sm text-gray-500">Pay 3rd First</p>
                                <p className="text-xs text-gray-400">{formatCurrency(getInstallmentAmount('4', 4))}</p>
                              </div>
                            ) : (
                              <PaymentButton
                                amount={pricing?.fourInstallments[3] || 20000}
                                studentId={student.id}
                                studentName={student.name}
                                studentMobile={student.mobile || ""}
                                studentEmail={student.email || undefined}
                                paymentType="installment"
                                installmentNumber={4}
                                onSuccess={() => {
                                  toast({
                                    title: "4th Installment Paid!",
                                    description: `${formatCurrency(getInstallmentAmount('4', 4))} payment successful.`,
                                  });
                                  const authData = JSON.parse(localStorage.getItem("studentAuth") || "{}");
                                  const currentStudentId = localStorage.getItem("currentStudentId");
                                  loadStudent(authData.mobile, currentStudentId);
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    🔒 Secure payment powered by Cashfree
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {student.status === "approved" && isPaymentComplete() && (
          <Card className="shadow-xl border-0 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-8 text-center">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">Payment Completed!</h3>
              <p className="text-green-700 mb-2">
                Your enrollment has been confirmed. You will receive course details via email/SMS.
              </p>
              <div className="mt-4 p-4 bg-white/70 rounded-lg">
                <p className="text-sm font-semibold text-green-900">Payment Summary:</p>
                <p className="text-lg font-bold text-green-800">
                  Total Paid: ₹{getTotalPaid().toLocaleString()}
                </p>
                {getPaidInstallments().length > 0 && (
                  <p className="text-sm text-green-700 mt-1">
                    Paid in {getPaidInstallments().length} installment{getPaidInstallments().length > 1 ? 's' : ''}
                  </p>
                )}
                {isFullPaymentDone() && (
                  <p className="text-sm text-green-700 mt-1">
                    ✓ Full payment received
                  </p>
                )}
              </div>
              <Button onClick={() => navigate("/")} variant="outline" className="mt-4">
                Back to Home
              </Button>
            </CardContent>
          </Card>
        )}


        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-orange-600" />
              </div>
              Selected Courses ({student.courses?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {student.courses?.map((course) => (
                <div key={course.id} className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-4 border border-border hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <p className="font-medium text-foreground">
                      {course.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentStatus;
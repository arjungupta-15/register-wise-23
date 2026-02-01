import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, CreditCard, Building2, ArrowLeft, BookOpen, GraduationCap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Student {
  id: string;
  name: string;
  email: string | null;
  mobile: string | null;
  status: "pending" | "approved" | "rejected";
  payment_status: "pending" | "paid";
  center: 'rajasthan' | 'centerexam' | 'other';
  created_at: string;
  courses?: { id: string; name: string }[];
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
  const [selectedPaymentType, setSelectedPaymentType] = useState<"onetime" | "installment" | null>(null);
  const [selectedInstallment, setSelectedInstallment] = useState<string | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<{
    amount: number;
    type: string;
    method: string;
    date: string;
  } | null>(null);

  const paymentOptions = {
    onetime: {
      amount: 72000,
      title: "One Time Payment",
      description: "Pay full amount at once and save money"
    },
    installments: {
      "2-installment": {
        installments: [40000, 35000],
        total: 75000,
        title: "2 Installments",
        description: "₹40,000 + ₹35,000"
      },
      "3-installment": {
        installments: [26000, 26000, 26000],
        total: 78000,
        title: "3 Installments", 
        description: "₹26,000 × 3"
      },
      "4-installment": {
        installments: [20000, 20000, 20000, 20000],
        total: 80000,
        title: "4 Installments",
        description: "₹20,000 × 4"
      }
    }
  };

  useEffect(() => {
    console.log('StudentStatus component mounted'); // Debug log
    
    // Check if student is logged in
    const authData = JSON.parse(localStorage.getItem("studentAuth") || "{}");
    const currentStudentId = localStorage.getItem("currentStudentId");
    
    console.log('Auth data:', authData); // Debug log
    console.log('Current student ID:', currentStudentId); // Debug log
    
    if (!authData.emailOrMobile && !currentStudentId) {
      console.log('No auth data found, redirecting to login'); // Debug log
      navigate("/student/login");
      return;
    }

    loadStudent(authData.emailOrMobile, currentStudentId);
  }, [navigate]);

  const loadStudent = async (emailOrMobile?: string, studentId?: string) => {
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
                name
              )
            )
          `)
          .eq('id', studentId)
          .single();

        if (!error && data) {
          student = {
            ...data,
            courses: data.student_courses?.map(sc => sc.courses).filter(Boolean) || []
          };
        }
      } else if (emailOrMobile) {
        const { data, error } = await supabase
          .from('students')
          .select(`
            *,
            student_courses (
              course_id,
              courses (
                id,
                name
              )
            )
          `)
          .or(`email.eq.${emailOrMobile},mobile.eq.${emailOrMobile}`)
          .single();

        if (!error && data) {
          student = {
            ...data,
            courses: data.student_courses?.map(sc => sc.courses).filter(Boolean) || []
          };
        }
      }
      
      // If Supabase fails, try localStorage as fallback
      if (!student) {
        const registeredStudents = JSON.parse(localStorage.getItem("registeredStudents") || "[]");
        const localStudent = registeredStudents.find((s: any) => {
          if (studentId && s.id === Number(studentId)) return true;
          if (emailOrMobile) {
            return s.emailOrMobile === emailOrMobile || 
                   s.email === emailOrMobile || 
                   s.mobile === emailOrMobile;
          }
          return false;
        });
        
        if (localStudent) {
          // Convert localStorage format to Supabase format
          student = {
            id: localStudent.id.toString(),
            name: localStudent.name,
            email: localStudent.email || localStudent.emailOrMobile,
            mobile: localStudent.mobile || localStudent.emailOrMobile,
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
    } catch (error) {
      console.error('Error loading student:', error);
      setStudent(null);
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

  const handleLogout = () => {
    localStorage.removeItem("studentAuth");
    localStorage.removeItem("currentStudentId");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    navigate("/");
  };

  const handlePayment = (method: "online" | "offline", paymentType?: "onetime" | "installment", installmentType?: string) => {
    let amount = 0;
    let description = "";
    
    if (paymentType === "onetime") {
      amount = paymentOptions.onetime.amount;
      description = "One Time Payment";
    } else if (paymentType === "installment" && installmentType) {
      const installmentOption = paymentOptions.installments[installmentType as keyof typeof paymentOptions.installments];
      amount = installmentOption.installments[0]; // First installment
      description = `${installmentOption.title} - First Installment`;
    }
    
    // Simulate payment process
    const paymentMethod = method === "online" ? "Online" : "Office Payment";
    
    if (method === "online") {
      // Simulate online payment success
      setTimeout(() => {
        setPaymentCompleted(true);
        setPaymentDetails({
          amount: amount,
          type: description,
          method: paymentMethod,
          date: new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long", 
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })
        });
        
        toast({
          title: "Payment Successful!",
          description: `₹${amount.toLocaleString()} payment completed successfully.`,
        });
      }, 2000); // 2 second delay to simulate payment processing
      
      toast({
        title: "Processing Payment...",
        description: "Please wait while we process your payment.",
      });
    } else {
      // For offline payment, just show the details
      alert(`Please visit our office for offline payment:\n\nAmount: ₹${amount.toLocaleString()}\nType: ${description}\n\nAddress: Rajasthan Center, Jaipur\nOffice Hours: 9 AM - 6 PM`);
    }
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
                <p className="text-xl font-bold text-primary">#{student.id}</p>
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

        {student.status === "approved" && (
          <>
            {/* Payment Success Section */}
            {paymentCompleted && paymentDetails && (
              <Card className="shadow-xl border-0 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-green-800">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    Payment Successful! 🎉
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-white/70 rounded-lg p-6">
                      <div className="text-center mb-4">
                        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-green-800 mb-2">Payment Completed!</h3>
                        <p className="text-green-700">Your enrollment has been confirmed successfully.</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="bg-green-50 rounded-lg p-4">
                          <p className="text-sm text-green-600 font-medium">Amount Paid</p>
                          <p className="text-2xl font-bold text-green-800">₹{paymentDetails.amount.toLocaleString()}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <p className="text-sm text-green-600 font-medium">Payment Type</p>
                          <p className="text-lg font-semibold text-green-800">{paymentDetails.type}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <p className="text-sm text-green-600 font-medium">Payment Method</p>
                          <p className="text-lg font-semibold text-green-800">{paymentDetails.method}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <p className="text-sm text-green-600 font-medium">Payment Date</p>
                          <p className="text-lg font-semibold text-green-800">{paymentDetails.date}</p>
                        </div>
                      </div>
                      
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2">📚 Next Steps:</h4>
                        <ul className="text-blue-700 text-sm space-y-1">
                          <li>• You will receive course materials within 2-3 working days</li>
                          <li>• Class schedule will be shared via email/SMS</li>
                          <li>• Keep this payment receipt for your records</li>
                          <li>• Contact support for any queries: +91-XXXXXXXXXX</li>
                        </ul>
                      </div>
                      
                      <div className="flex gap-3 mt-6">
                        <Button 
                          onClick={() => window.print()} 
                          variant="outline" 
                          className="flex-1"
                        >
                          Print Receipt
                        </Button>
                        <Button 
                          onClick={() => navigate("/")} 
                          className="flex-1"
                        >
                          Back to Home
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Payment Options Section - Only show if payment not completed */}
            {!paymentCompleted && (
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
                    </div>
                    
                    {/* Payment Type Selection */}
                    {!selectedPaymentType && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-green-800">Choose Payment Option:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card 
                            className="border-2 border-green-200 hover:border-green-400 transition-all cursor-pointer hover:shadow-lg transform hover:-translate-y-1"
                            onClick={() => setSelectedPaymentType("onetime")}
                          >
                            <CardContent className="p-6 text-center">
                              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CreditCard className="h-8 w-8 text-green-600" />
                              </div>
                              <h3 className="text-xl font-bold mb-2 text-foreground">One Time Payment</h3>
                              <p className="text-2xl font-bold text-green-600 mb-2">₹72,000</p>
                              <p className="text-muted-foreground text-sm">
                                Pay full amount at once and save money
                              </p>
                            </CardContent>
                          </Card>
                          
                          <Card 
                            className="border-2 border-blue-200 hover:border-blue-400 transition-all cursor-pointer hover:shadow-lg transform hover:-translate-y-1"
                            onClick={() => setSelectedPaymentType("installment")}
                          >
                            <CardContent className="p-6 text-center">
                              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Building2 className="h-8 w-8 text-blue-600" />
                              </div>
                              <h3 className="text-xl font-bold mb-2 text-foreground">Installments</h3>
                              <p className="text-lg font-semibold text-blue-600 mb-2">2, 3, or 4 EMIs</p>
                              <p className="text-muted-foreground text-sm">
                                Pay in easy monthly installments
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )}
                    
                    {/* One Time Payment Options */}
                    {selectedPaymentType === "onetime" && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedPaymentType(null)}>
                            ← Back
                          </Button>
                          <h3 className="text-lg font-semibold text-green-800">One Time Payment - ₹72,000</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card className="border-2 border-primary/30 hover:border-primary/60 transition-all cursor-pointer hover:shadow-lg transform hover:-translate-y-1"
                                onClick={() => handlePayment("online", "onetime")}>
                            <CardContent className="p-6 text-center">
                              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CreditCard className="h-8 w-8 text-primary" />
                              </div>
                              <h3 className="text-xl font-bold mb-2 text-foreground">Pay Online</h3>
                              <p className="text-muted-foreground mb-4">
                                UPI, Card, or Net Banking
                              </p>
                              <Button className="w-full mt-4" size="lg">
                                Pay ₹72,000 Online
                              </Button>
                            </CardContent>
                          </Card>
                          
                          <Card className="border-2 border-secondary/30 hover:border-secondary/60 transition-all cursor-pointer hover:shadow-lg transform hover:-translate-y-1"
                                onClick={() => handlePayment("offline", "onetime")}>
                            <CardContent className="p-6 text-center">
                              <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Building2 className="h-8 w-8 text-secondary" />
                              </div>
                              <h3 className="text-xl font-bold mb-2 text-foreground">Pay at Office</h3>
                              <p className="text-muted-foreground mb-4">
                                Visit our office and pay in person
                              </p>
                              <Button variant="secondary" className="w-full mt-4" size="lg">
                                Pay ₹72,000 Offline
                              </Button>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )}
                    
                    {/* Installment Options */}
                    {selectedPaymentType === "installment" && !selectedInstallment && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedPaymentType(null)}>
                            ← Back
                          </Button>
                          <h3 className="text-lg font-semibold text-blue-800">Choose Installment Plan:</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {Object.entries(paymentOptions.installments).map(([key, option]) => (
                            <Card 
                              key={key}
                              className="border-2 border-blue-200 hover:border-blue-400 transition-all cursor-pointer hover:shadow-lg transform hover:-translate-y-1"
                              onClick={() => setSelectedInstallment(key)}
                            >
                              <CardContent className="p-4 text-center">
                                <h4 className="text-lg font-bold mb-2 text-foreground">{option.title}</h4>
                                <p className="text-sm text-muted-foreground mb-2">{option.description}</p>
                                <p className="text-lg font-semibold text-blue-600">Total: ₹{option.total.toLocaleString()}</p>
                                <div className="mt-3 text-xs text-muted-foreground">
                                  {option.installments.map((amount, index) => (
                                    <div key={index}>EMI {index + 1}: ₹{amount.toLocaleString()}</div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Selected Installment Payment Options */}
                    {selectedPaymentType === "installment" && selectedInstallment && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedInstallment(null)}>
                            ← Back
                          </Button>
                          <h3 className="text-lg font-semibold text-blue-800">
                            {paymentOptions.installments[selectedInstallment as keyof typeof paymentOptions.installments].title} - First Payment
                          </h3>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 mb-4">
                          <p className="text-blue-800 font-medium">
                            First Installment: ₹{paymentOptions.installments[selectedInstallment as keyof typeof paymentOptions.installments].installments[0].toLocaleString()}
                          </p>
                          <p className="text-blue-600 text-sm mt-1">
                            Total Amount: ₹{paymentOptions.installments[selectedInstallment as keyof typeof paymentOptions.installments].total.toLocaleString()} 
                            ({paymentOptions.installments[selectedInstallment as keyof typeof paymentOptions.installments].description})
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card className="border-2 border-primary/30 hover:border-primary/60 transition-all cursor-pointer hover:shadow-lg transform hover:-translate-y-1"
                                onClick={() => handlePayment("online", "installment", selectedInstallment)}>
                            <CardContent className="p-6 text-center">
                              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CreditCard className="h-8 w-8 text-primary" />
                              </div>
                              <h3 className="text-xl font-bold mb-2 text-foreground">Pay Online</h3>
                              <p className="text-muted-foreground mb-4">
                                UPI, Card, or Net Banking
                              </p>
                              <Button className="w-full mt-4" size="lg">
                                Pay ₹{paymentOptions.installments[selectedInstallment as keyof typeof paymentOptions.installments].installments[0].toLocaleString()} Online
                              </Button>
                            </CardContent>
                          </Card>
                          
                          <Card className="border-2 border-secondary/30 hover:border-secondary/60 transition-all cursor-pointer hover:shadow-lg transform hover:-translate-y-1"
                                onClick={() => handlePayment("offline", "installment", selectedInstallment)}>
                            <CardContent className="p-6 text-center">
                              <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Building2 className="h-8 w-8 text-secondary" />
                              </div>
                              <h3 className="text-xl font-bold mb-2 text-foreground">Pay at Office</h3>
                              <p className="text-muted-foreground mb-4">
                                Visit our office and pay in person
                              </p>
                              <Button variant="secondary" className="w-full mt-4" size="lg">
                                Pay ₹{paymentOptions.installments[selectedInstallment as keyof typeof paymentOptions.installments].installments[0].toLocaleString()} Offline
                              </Button>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
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
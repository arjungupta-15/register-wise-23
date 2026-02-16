import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, CreditCard, Building2, ArrowLeft, BookOpen, GraduationCap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PaymentButton from "@/components/PaymentButton";

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
                name
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
                name
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

        {student.status === "approved" && student.payment_status === "pending" && (
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
                
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h3 className="text-xl font-bold text-foreground mb-4">Course Fee Payment</h3>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-lg text-muted-foreground">Total Amount:</span>
                    <span className="text-3xl font-bold text-primary">₹72,000</span>
                  </div>
                  
                  <PaymentButton
                    amount={72000}
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
                      // Reload student data
                      const authData = JSON.parse(localStorage.getItem("studentAuth") || "{}");
                      const currentStudentId = localStorage.getItem("currentStudentId");
                      loadStudent(authData.mobile, currentStudentId);
                    }}
                  />
                  
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Secure payment powered by Cashfree
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {student.status === "approved" && student.payment_status === "paid" && (
          <Card className="shadow-xl border-0 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-8 text-center">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">Payment Completed!</h3>
              <p className="text-green-700 mb-4">
                Your enrollment has been confirmed. You will receive course details via email/SMS.
              </p>
              <Button onClick={() => navigate("/")} variant="outline">
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
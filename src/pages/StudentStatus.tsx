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

  useEffect(() => {
    // Check if student is logged in
    const authData = JSON.parse(localStorage.getItem("studentAuth") || "{}");
    const currentStudentId = localStorage.getItem("currentStudentId");
    
    if (!authData.emailOrMobile && !currentStudentId) {
      navigate("/student/login");
      return;
    }

    loadStudent(authData.emailOrMobile, currentStudentId);
  }, [navigate]);

  const loadStudent = async (emailOrMobile?: string, studentId?: string) => {
    setLoading(true);
    try {
      let query = supabase
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
        `);

      // Search by student ID first, then by email/mobile
      if (studentId) {
        query = query.eq('id', studentId);
      } else if (emailOrMobile) {
        query = query.or(`email.eq.${emailOrMobile},mobile.eq.${emailOrMobile}`);
      } else {
        setStudent(null);
        setLoading(false);
        return;
      }

      const { data, error } = await query.single();

      if (error) {
        console.error('Error loading student:', error);
        setStudent(null);
        setLoading(false);
        return;
      }

      // Transform the data to include courses array
      const transformedStudent = {
        ...data,
        courses: data.student_courses?.map(sc => sc.courses).filter(Boolean) || []
      };

      setStudent(transformedStudent);
    } catch (error) {
      console.error('Error loading student:', error);
      setStudent(null);
    } finally {
      setLoading(false);
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

  const handlePayment = (method: "online" | "offline") => {
    if (method === "online") {
      alert("Redirecting to payment gateway...\n\nDemo: Payment would be processed online.");
    } else {
      alert("Please visit our office for offline payment:\n\nAddress: Rajasthan Center, Jaipur\nOffice Hours: 9 AM - 6 PM");
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-2 border-primary/30 hover:border-primary/60 transition-all cursor-pointer hover:shadow-lg transform hover:-translate-y-1"
                        onClick={() => handlePayment("online")}>
                    <CardContent className="p-6 text-center">
                      <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CreditCard className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-foreground">Online Payment</h3>
                      <p className="text-muted-foreground mb-4">
                        Pay securely using UPI, Card, or Net Banking
                      </p>
                      <Button className="w-full mt-4" size="lg">
                        Pay Online Now
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 border-secondary/30 hover:border-secondary/60 transition-all cursor-pointer hover:shadow-lg transform hover:-translate-y-1"
                        onClick={() => handlePayment("offline")}>
                    <CardContent className="p-6 text-center">
                      <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 className="h-8 w-8 text-secondary" />
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-foreground">Office Payment</h3>
                      <p className="text-muted-foreground mb-4">
                        Visit our office and pay in person
                      </p>
                      <Button variant="secondary" className="w-full mt-4" size="lg">
                        Get Office Details
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
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
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, BookOpen, GraduationCap, Calendar } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Student {
  id: string;
  name: string;
  email: string | null;
  mobile: string | null;
  father_name: string;
  mother_name: string;
  address: string;
  eligibility: string;
  obtained_marks: number | null;
  total_marks: number | null;
  percentage: number | null;
  aadhaar: string;
  caste: 'general' | 'obc' | 'sc' | 'st';
  gender: 'male' | 'female';
  center: 'rajasthan' | 'centerexam' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  payment_status: 'pending' | 'paid';
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

const AdminStudentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const isAuth = localStorage.getItem("adminAuth");
    if (!isAuth) {
      navigate("/admin/login");
      return;
    }
    
    if (id) {
      loadStudent();
    }
  }, [id, navigate]);

  const loadStudent = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
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
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error loading student:', error);
        toast({
          title: "Error",
          description: "Failed to load student details",
          variant: "destructive"
        });
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
      toast({
        title: "Error",
        description: "Failed to load student details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (status: "approved" | "rejected") => {
    if (!student || !id) return;
    
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('students')
        .update({
          status,
          payment_status: status === "approved" ? "pending" : "pending"
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating student status:', error);
        toast({
          title: "Error",
          description: "Failed to update student status",
          variant: "destructive"
        });
        return;
      }

      // Update local state
      setStudent(prev => prev ? { 
        ...prev, 
        status, 
        payment_status: status === "approved" ? "pending" : "pending" 
      } : null);

      toast({
        title: "Success",
        description: status === "approved" ? "Student application approved!" : "Student application rejected!"
      });
    } catch (error) {
      console.error('Error updating student status:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved": return "Approved";
      case "rejected": return "Rejected";
      default: return "Pending";
    }
  };

  const getEligibilityLabel = (eligibility: string) => {
    const eligibilityMap: Record<string, string> = {
      "10th": "10th Pass",
      "12th": "12th Pass", 
      "diploma": "Diploma",
      "ba": "BA",
      "bsc": "BSc",
      "bcom": "BCom",
      "bba": "BBA",
      "btech": "BTech",
      "be": "BE",
      "bca": "BCA",
      "llb": "LLB",
      "bds": "BDS",
      "mbbs": "MBBS",
      "bpharm": "B.Pharm",
      "ma": "MA",
      "msc": "MSc",
      "mcom": "MCom",
      "mba": "MBA",
      "mtech": "MTech",
      "me": "ME",
      "mca": "MCA",
      "llm": "LLM",
      "phd": "PhD",
      "other": "Other"
    };
    return eligibilityMap[eligibility] || eligibility;
  };

  const getCasteLabel = (caste: string) => {
    switch (caste) {
      case "general": return "General";
      case "obc": return "Other Backward Class (OBC)";
      case "sc": return "Scheduled Caste (SC)";
      case "st": return "Scheduled Tribe (ST)";
      default: return caste;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading student details...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!student) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Student not found.</p>
          <Button onClick={() => navigate("/admin/students")} className="mt-4">
            Back to Students
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/admin/students")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{student.name}</h1>
            <p className="text-muted-foreground">Student ID: {student.id}</p>
          </div>
          
          {/* Status and Action Buttons */}
          <div className="flex items-center gap-4 ml-auto">
            <Badge className={getStatusColor(student.status)}>
              {getStatusLabel(student.status)}
            </Badge>
            
            {student.status === "pending" && (
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleApproval("approved")}
                  disabled={updating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {updating ? "Updating..." : "Approve"}
                </Button>
                <Button 
                  onClick={() => handleApproval("rejected")}
                  disabled={updating}
                  variant="destructive"
                >
                  {updating ? "Updating..." : "Reject"}
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <Card className="shadow-sm lg:col-span-2">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium text-card-foreground">{student.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <div className="font-medium text-card-foreground">
                    {student.email && <div>{student.email}</div>}
                    {student.mobile && <div>{student.mobile}</div>}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Father's Name</p>
                  <p className="font-medium text-card-foreground">{student.father_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mother's Name</p>
                  <p className="font-medium text-card-foreground">{student.mother_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium text-card-foreground">{student.address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium text-card-foreground">{student.gender?.charAt(0).toUpperCase() + student.gender?.slice(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Registration Info */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle>Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Registered On</p>
                <p className="font-medium text-card-foreground">
                  {new Date(student.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Center</p>
                <Badge variant="secondary">
                  {student.center === "rajasthan" ? "Rajasthan Center" : 
                   student.center === "centerexam" ? "Center Exam" : "Other Center"}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          {/* Educational Information */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle>Educational Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Eligibility</p>
                <p className="font-medium text-card-foreground">{getEligibilityLabel(student.eligibility)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Marks Obtained</p>
                <p className="font-medium text-card-foreground">
                  {student.obtained_marks} / {student.total_marks}
                  {student.percentage && (
                    <span className="ml-2 text-primary font-bold">
                      ({student.percentage.toFixed(2)}%)
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aadhaar Number</p>
                <p className="font-medium text-card-foreground font-mono">
                  {student.aadhaar?.replace(/(\d{4})/g, "$1 ").trim()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium text-card-foreground">{getCasteLabel(student.caste)}</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Selected Courses */}
          <Card className="shadow-sm lg:col-span-2">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-orange-600" />
              </div>
              <CardTitle>Selected Courses ({student.courses?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {student.courses?.map((course) => (
                  <div 
                    key={course.id} 
                    className="p-4 bg-muted/50 rounded-lg border border-border"
                  >
                    <p className="font-medium text-card-foreground">
                      {course.name}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminStudentDetail;
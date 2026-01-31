import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, BookOpen, GraduationCap, Calendar } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

interface Student {
  id: number;
  name: string;
  email: string;
  mobile: string;
  fatherName: string;
  motherName: string;
  address: string;
  eligibility: string;
  aadhaar: string;
  caste: string;
  center: string;
  selectedCourses: string[];
  registeredAt: string;
}

const courseNames: Record<string, string> = {
  "rs-cfa": "Computer Fundamentals & Applications",
  "rs-dca": "Diploma in Computer Applications",
  "rs-pgdca": "PG Diploma in Computer Applications",
  "rs-tally": "Tally & Accounting",
  "rs-web": "Web Development",
  "rs-python": "Python Programming",
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

  useEffect(() => {
    const isAuth = localStorage.getItem("adminAuth");
    if (!isAuth) {
      navigate("/admin/login");
      return;
    }
    
    const storedStudents = JSON.parse(localStorage.getItem("registeredStudents") || "[]");
    const found = storedStudents.find((s: Student) => s.id === Number(id));
    setStudent(found || null);
  }, [id, navigate]);

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

  const getEligibilityLabel = (eligibility: string) => {
    switch (eligibility) {
      case "10th": return "10th Pass";
      case "12th": return "12th Pass";
      case "graduation": return "Graduation";
      default: return eligibility;
    }
  };

  const getCasteLabel = (caste: string) => {
    switch (caste) {
      case "general": return "General";
      case "obc": return "Other Backward Class (OBC)";
      case "sc": return "Scheduled Caste (SC)";
      default: return caste;
    }
  };

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
            <p className="text-muted-foreground">Student ID: #{student.id}</p>
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
                  <p className="text-sm text-muted-foreground">Email Address</p>
                  <p className="font-medium text-card-foreground">{student.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mobile Number</p>
                  <p className="font-medium text-card-foreground">{student.mobile}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Father's Name</p>
                  <p className="font-medium text-card-foreground">{student.fatherName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mother's Name</p>
                  <p className="font-medium text-card-foreground">{student.motherName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium text-card-foreground">{student.address}</p>
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
                  {new Date(student.registeredAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Center</p>
                <Badge variant="secondary">
                  {student.center === "rajasthan" ? "Rajasthan Center" : "Other Center"}
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
              <CardTitle>Selected Courses ({student.selectedCourses?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {student.selectedCourses?.map((courseId) => (
                  <div 
                    key={courseId} 
                    className="p-4 bg-muted/50 rounded-lg border border-border"
                  >
                    <p className="font-medium text-card-foreground">
                      {courseNames[courseId] || courseId}
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

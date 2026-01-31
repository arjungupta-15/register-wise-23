import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Download } from "lucide-react";
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

const AdminStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEligibility, setFilterEligibility] = useState("");
  const [filterCaste, setFilterCaste] = useState("");

  useEffect(() => {
    const isAuth = localStorage.getItem("adminAuth");
    if (!isAuth) {
      navigate("/admin/login");
      return;
    }
    
    const storedStudents = JSON.parse(localStorage.getItem("registeredStudents") || "[]");
    setStudents(storedStudents);
  }, [navigate]);

  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.mobile?.includes(searchTerm);
    
    const matchesEligibility = !filterEligibility || student.eligibility === filterEligibility;
    const matchesCaste = !filterCaste || student.caste === filterCaste;
    
    return matchesSearch && matchesEligibility && matchesCaste;
  });

  const getCasteColor = (caste: string) => {
    switch (caste) {
      case "general": return "bg-blue-100 text-blue-800";
      case "obc": return "bg-green-100 text-green-800";
      case "sc": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getEligibilityLabel = (eligibility: string) => {
    switch (eligibility) {
      case "10th": return "10th Pass";
      case "12th": return "12th Pass";
      case "graduation": return "Graduation";
      default: return eligibility;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Students</h1>
            <p className="text-muted-foreground">Manage all registered students</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>
        
        {/* Filters */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email or mobile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterEligibility}
                onChange={(e) => setFilterEligibility(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All Eligibility</option>
                <option value="10th">10th Pass</option>
                <option value="12th">12th Pass</option>
                <option value="graduation">Graduation</option>
              </select>
              <select
                value={filterCaste}
                onChange={(e) => setFilterCaste(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All Categories</option>
                <option value="general">General</option>
                <option value="obc">OBC</option>
                <option value="sc">SC</option>
              </select>
            </div>
          </CardContent>
        </Card>
        
        {/* Students Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>
              Student Records ({filteredStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {students.length === 0 
                  ? "No students registered yet."
                  : "No students match your search criteria."
                }
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Mobile</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Eligibility</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Courses</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium text-card-foreground">{student.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{student.email}</td>
                        <td className="py-3 px-4 text-muted-foreground">{student.mobile}</td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary">
                            {getEligibilityLabel(student.eligibility)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${getCasteColor(student.caste)}`}>
                            {student.caste}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{student.selectedCourses?.length || 0} courses</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/admin/students/${student.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminStudents;

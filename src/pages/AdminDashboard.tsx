import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Building, TrendingUp } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

interface Student {
  id: number;
  name: string;
  email: string;
  mobile: string;
  eligibility: string;
  caste: string;
  selectedCourses: string[];
  registeredAt: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const isAuth = localStorage.getItem("adminAuth");
    if (!isAuth) {
      navigate("/admin/login");
      return;
    }
    
    const storedStudents = JSON.parse(localStorage.getItem("registeredStudents") || "[]");
    setStudents(storedStudents);
  }, [navigate]);

  const stats = [
    {
      title: "Total Students",
      value: students.length,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Total Courses",
      value: 12,
      icon: BookOpen,
      color: "bg-green-500",
    },
    {
      title: "Active Centers",
      value: 2,
      icon: Building,
      color: "bg-purple-500",
    },
    {
      title: "This Month",
      value: students.filter(s => {
        const date = new Date(s.registeredAt);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length,
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of registrations.</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`h-10 w-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-card-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Recent Registrations */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No registrations yet. Students will appear here once they register.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Mobile</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.slice(0, 5).map((student) => (
                      <tr key={student.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium text-card-foreground">{student.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{student.email}</td>
                        <td className="py-3 px-4 text-muted-foreground">{student.mobile}</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(student.registeredAt).toLocaleDateString()}
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

export default AdminDashboard;

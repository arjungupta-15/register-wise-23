import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, BookOpen, GraduationCap } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Course {
  id: string;
  name: string;
  duration: string;
  fee: string;
  center: "rajasthan" | "centerexam" | "other";
  description?: string;
}

const AdminCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    duration: "",
    fee: "",
    center: "" as "rajasthan" | "centerexam" | "other" | "",
    description: ""
  });

  useEffect(() => {
    const isAuth = localStorage.getItem("adminAuth");
    if (!isAuth) {
      navigate("/admin/login");
      return;
    }
    
    loadCourses();
  }, [navigate]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('center, name');

      if (error) {
        console.error('Error loading courses:', error);
        toast({
          title: "Error",
          description: "Failed to load courses",
          variant: "destructive"
        });
        return;
      }

      // If no courses exist, add default dummy courses
      if (!data || data.length === 0) {
        await insertDefaultCourses();
        return;
      }

      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const insertDefaultCourses = async () => {
    const defaultCourses = [
      // Rajasthan Center Courses
      { id: "rs-cfa", name: "Computer Fundamentals & Applications", duration: "6 Months", fee: "₹5,000", center: "rajasthan", description: "Basic computer skills and applications" },
      { id: "rs-dca", name: "Diploma in Computer Applications", duration: "1 Year", fee: "₹12,000", center: "rajasthan", description: "Comprehensive computer applications course" },
      { id: "rs-pgdca", name: "PG Diploma in Computer Applications", duration: "1 Year", fee: "₹18,000", center: "rajasthan", description: "Advanced computer applications for graduates" },
      { id: "rs-tally", name: "Tally & Accounting", duration: "3 Months", fee: "₹4,000", center: "rajasthan", description: "Accounting software training" },
      { id: "rs-web", name: "Web Development", duration: "6 Months", fee: "₹8,000", center: "rajasthan", description: "HTML, CSS, JavaScript web development" },
      { id: "rs-python", name: "Python Programming", duration: "4 Months", fee: "₹6,000", center: "rajasthan", description: "Python programming language course" },
      
      // Center Exam Courses
      { id: "ce-ccc", name: "CCC (Course on Computer Concepts)", duration: "3 Months", fee: "₹3,500", center: "centerexam", description: "Government certified computer course" },
      { id: "ce-bcc", name: "BCC (Basic Computer Course)", duration: "2 Months", fee: "₹2,500", center: "centerexam", description: "Basic computer literacy course" },
      { id: "ce-acc", name: "ACC (Advanced Computer Course)", duration: "4 Months", fee: "₹5,500", center: "centerexam", description: "Advanced computer skills certification" },
      { id: "ce-nielit", name: "NIELIT Courses", duration: "6 Months", fee: "₹8,000", center: "centerexam", description: "National Institute of Electronics & IT courses" },
      { id: "ce-doeacc", name: "DOEACC Courses", duration: "1 Year", fee: "₹15,000", center: "centerexam", description: "Department of Electronics & Accreditation courses" },
      { id: "ce-typing", name: "Typing & Stenography", duration: "3 Months", fee: "₹3,000", center: "centerexam", description: "Professional typing and stenography skills" },
      
      // Other Center Courses
      { id: "ot-bca", name: "Bachelor in Computer Applications", duration: "3 Years", fee: "₹45,000/year", center: "other", description: "Undergraduate degree in computer applications" },
      { id: "ot-mca", name: "Master in Computer Applications", duration: "2 Years", fee: "₹55,000/year", center: "other", description: "Postgraduate degree in computer applications" },
      { id: "ot-data", name: "Data Science & Analytics", duration: "1 Year", fee: "₹25,000", center: "other", description: "Data analysis and machine learning course" },
      { id: "ot-ai", name: "Artificial Intelligence", duration: "1 Year", fee: "₹30,000", center: "other", description: "AI and machine learning specialization" },
      { id: "ot-cyber", name: "Cyber Security", duration: "6 Months", fee: "₹15,000", center: "other", description: "Information security and ethical hacking" },
      { id: "ot-cloud", name: "Cloud Computing", duration: "6 Months", fee: "₹12,000", center: "other", description: "AWS, Azure cloud platform training" },
    ];

    try {
      const { error } = await supabase
        .from('courses')
        .insert(defaultCourses);

      if (error) {
        console.error('Error inserting default courses:', error);
        toast({
          title: "Error",
          description: "Failed to initialize courses",
          variant: "destructive"
        });
        return;
      }

      // Reload courses after inserting defaults
      loadCourses();
    } catch (error) {
      console.error('Error inserting default courses:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.duration || !formData.fee || !formData.center) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingCourse) {
        // Update existing course
        const { error } = await supabase
          .from('courses')
          .update({
            name: formData.name,
            duration: formData.duration,
            fee: formData.fee,
            center: formData.center as "rajasthan" | "centerexam" | "other",
            description: formData.description || null
          })
          .eq('id', editingCourse.id);

        if (error) {
          console.error('Error updating course:', error);
          toast({
            title: "Error",
            description: "Failed to update course",
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Success",
          description: "Course updated successfully!"
        });
      } else {
        // Add new course
        const courseId = `${formData.center}-${Date.now()}`;
        const { error } = await supabase
          .from('courses')
          .insert({
            id: courseId,
            name: formData.name,
            duration: formData.duration,
            fee: formData.fee,
            center: formData.center as "rajasthan" | "centerexam" | "other",
            description: formData.description || null
          });

        if (error) {
          console.error('Error adding course:', error);
          toast({
            title: "Error",
            description: "Failed to add course",
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Success", 
          description: "Course added successfully!"
        });
      }

      // Reload courses
      await loadCourses();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving course:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      duration: course.duration,
      fee: course.fee,
      center: course.center,
      description: course.description || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) {
        console.error('Error deleting course:', error);
        toast({
          title: "Error",
          description: "Failed to delete course",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Course deleted successfully!"
      });

      // Reload courses
      await loadCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      duration: "",
      fee: "",
      center: "",
      description: ""
    });
    setEditingCourse(null);
  };

  const getCenterLabel = (center: string) => {
    switch (center) {
      case "rajasthan": return "Rajasthan Center";
      case "centerexam": return "Center Exam";
      case "other": return "Other Center";
      default: return center;
    }
  };

  const getCenterColor = (center: string) => {
    switch (center) {
      case "rajasthan": return "bg-blue-100 text-blue-800";
      case "centerexam": return "bg-green-100 text-green-800";
      case "other": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const coursesByCenter = {
    rajasthan: courses.filter(c => c.center === "rajasthan"),
    centerexam: courses.filter(c => c.center === "centerexam"),
    other: courses.filter(c => c.center === "other")
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Course Management</h1>
            <p className="text-muted-foreground">Add and manage courses for all centers</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="gap-2">
                <Plus className="h-4 w-4" />
                Add New Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingCourse ? "Edit Course" : "Add New Course"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Course Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Computer Fundamentals"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="center">Center *</Label>
                  <Select value={formData.center} onValueChange={(value) => setFormData({...formData, center: value as any})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select center" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rajasthan">Rajasthan Center</SelectItem>
                      <SelectItem value="centerexam">Center Exam</SelectItem>
                      <SelectItem value="other">Other Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration *</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      placeholder="e.g., 6 Months"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fee">Fee *</Label>
                    <Input
                      id="fee"
                      value={formData.fee}
                      onChange={(e) => setFormData({...formData, fee: e.target.value})}
                      placeholder="e.g., ₹5,000"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Course description (optional)"
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : editingCourse ? "Update Course" : "Add Course"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{coursesByCenter.rajasthan.length}</p>
                  <p className="text-sm text-muted-foreground">Rajasthan Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{coursesByCenter.centerexam.length}</p>
                  <p className="text-sm text-muted-foreground">Center Exam Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{coursesByCenter.other.length}</p>
                  <p className="text-sm text-muted-foreground">Other Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses by Center */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        ) : (
          Object.entries(coursesByCenter).map(([centerKey, centerCourses]) => (
          <Card key={centerKey} className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Badge className={getCenterColor(centerKey)}>
                  {getCenterLabel(centerKey)}
                </Badge>
                <span>({centerCourses.length} courses)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {centerCourses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No courses added for {getCenterLabel(centerKey)} yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {centerCourses.map((course) => (
                    <Card key={course.id} className="border border-border hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-foreground">{course.name}</h4>
                            {course.description && (
                              <p className="text-sm text-muted-foreground">{course.description}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{course.duration}</span>
                            <span className="font-medium text-primary">{course.fee}</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(course)}
                              className="flex-1 gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(course.id)}
                              className="flex-1 gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCourses;
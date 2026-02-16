import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Check, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Course {
  id: string;
  name: string;
  duration: string;
  fee: string;
  center: "rajasthan" | "centerexam" | "other";
  description?: string;
}

interface CourseSelectionProps {
  selectedCourses: string[];
  onCoursesChange: (courses: string[]) => void;
  errors: Record<string, string>;
}

const CourseSelection = ({
  selectedCourses,
  onCoursesChange,
  errors,
}: CourseSelectionProps) => {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAllCourses();
  }, []);

  const loadAllCourses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('center, name');

      if (error) {
        console.error('Error loading courses:', error);
        return;
      }

      setAllCourses(data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCourse = (courseId: string) => {
    if (selectedCourses.includes(courseId)) {
      // Remove course if already selected
      onCoursesChange(selectedCourses.filter((id) => id !== courseId));
    } else {
      // Add course only if less than 2 courses are selected
      if (selectedCourses.length < 2) {
        onCoursesChange([...selectedCourses, courseId]);
      }
    }
  };

  const getCenterName = (center: string) => {
    switch (center) {
      case 'rajasthan': return 'Rajasthan Exams';
      case 'centerexam': return 'Center Exams';
      case 'other': return 'Other State Exams';
      default: return center;
    }
  };

  const getCenterColor = (center: string) => {
    switch (center) {
      case 'rajasthan': return 'bg-primary/10 text-primary';
      case 'centerexam': return 'bg-blue-100 text-blue-600';
      case 'other': return 'bg-secondary/10 text-secondary';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const groupedCourses = allCourses.reduce((acc, course) => {
    if (!acc[course.center]) {
      acc[course.center] = [];
    }
    acc[course.center].push(course);
    return acc;
  }, {} as Record<string, Course[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Select Courses (Select exactly 2 courses from any centers) *</Label>
        <span className={`text-sm font-medium ${
          selectedCourses.length === 2 ? "text-green-600" : 
          selectedCourses.length > 2 ? "text-red-600" : "text-muted-foreground"
        }`}>
          {selectedCourses.length}/2 selected
        </span>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedCourses).map(([center, courses]) => (
            <div key={center} className="space-y-4">
              {/* Center Header */}
              <div className="flex items-center gap-3 pb-2 border-b">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getCenterColor(center)}`}>
                  <MapPin className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{getCenterName(center)}</h3>
                <span className="text-sm text-muted-foreground">({courses.length} courses)</span>
              </div>
              
              {/* Courses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => {
                  const isSelected = selectedCourses.includes(course.id);
                  const isDisabled = !isSelected && selectedCourses.length >= 2;
                  
                  return (
                    <Card
                      key={course.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? "ring-2 ring-primary bg-primary/5" : 
                        isDisabled ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={() => !isDisabled && toggleCourse(course.id)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-card-foreground mb-1">{course.name}</h4>
                            {course.description && (
                              <p className="text-sm text-muted-foreground">{course.description}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{course.duration}</span>
                            <span className="font-medium text-primary">{course.fee}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className={`text-xs px-2 py-1 rounded-full ${getCenterColor(center)}`}>
                              {getCenterName(center)}
                            </span>
                            <div
                              className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-muted-foreground"
                              }`}
                            >
                              {isSelected && <Check className="h-4 w-4" />}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {errors.courses && (
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
          {errors.courses}
        </p>
      )}
      
      {selectedCourses.length >= 2 && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            ✅ You have selected the maximum number of courses (2). To select a different course, first deselect one of your current selections.
          </p>
        </div>
      )}
      
      {selectedCourses.length > 0 && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">Selected Courses:</h4>
          <div className="space-y-2">
            {selectedCourses.map((courseId) => {
              const course = allCourses.find(c => c.id === courseId);
              if (!course) return null;
              return (
                <div key={courseId} className="flex items-center justify-between bg-white p-2 rounded border">
                  <div>
                    <span className="font-medium text-green-800">{course.name}</span>
                    <span className={`ml-2 text-xs px-2 py-1 rounded-full ${getCenterColor(course.center)}`}>
                      {getCenterName(course.center)}
                    </span>
                  </div>
                  <span className="text-sm text-green-600">{course.fee}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseSelection;
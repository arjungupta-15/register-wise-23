import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  center: string;
  selectedCourses: string[];
  onCenterChange: (center: string) => void;
  onCoursesChange: (courses: string[]) => void;
  errors: Record<string, string>;
}

const CourseSelection = ({
  center,
  selectedCourses,
  onCenterChange,
  onCoursesChange,
  errors,
}: CourseSelectionProps) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (center) {
      loadCourses();
    }
  }, [center]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('center', center)
        .order('name');

      if (error) {
        console.error('Error loading courses:', error);
        return;
      }

      setCourses(data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCourse = (courseId: string) => {
    if (selectedCourses.includes(courseId)) {
      onCoursesChange(selectedCourses.filter((id) => id !== courseId));
    } else {
      onCoursesChange([...selectedCourses, courseId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Center Selection */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Select Course Center *</Label>
        <RadioGroup
          value={center}
          onValueChange={onCenterChange}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <label
            htmlFor="rajasthan"
            className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              center === "rajasthan"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <RadioGroupItem value="rajasthan" id="rajasthan" />
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-card-foreground">Rajasthan Center</p>
                <p className="text-sm text-muted-foreground">Jaipur, Rajasthan</p>
              </div>
            </div>
          </label>
          
          <label
            htmlFor="centerexam"
            className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              center === "centerexam"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <RadioGroupItem value="centerexam" id="centerexam" />
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-card-foreground">Center Exam</p>
                <p className="text-sm text-muted-foreground">Exam Based Courses</p>
              </div>
            </div>
          </label>
          
          <label
            htmlFor="other"
            className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              center === "other"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <RadioGroupItem value="other" id="other" />
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-secondary/10 rounded-full flex items-center justify-center">
                <MapPin className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="font-medium text-card-foreground">Other Center</p>
                <p className="text-sm text-muted-foreground">Multiple Locations</p>
              </div>
            </div>
          </label>
        </RadioGroup>
        {errors.center && <p className="text-sm text-destructive">{errors.center}</p>}
      </div>

      {/* Course Cards */}
      {center && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Select Courses (Minimum 2 required) *</Label>
            <span className={`text-sm font-medium ${selectedCourses.length >= 2 ? "text-green-600" : "text-muted-foreground"}`}>
              {selectedCourses.length} selected
            </span>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No courses available for this center.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => {
                const isSelected = selectedCourses.includes(course.id);
                return (
                  <Card
                    key={course.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? "ring-2 ring-primary bg-primary/5" : ""
                    }`}
                    onClick={() => toggleCourse(course.id)}
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
                        
                        <div
                          className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ml-auto ${
                            isSelected
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-muted-foreground"
                          }`}
                        >
                          {isSelected && <Check className="h-4 w-4" />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          
          {errors.courses && (
            <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              {errors.courses}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseSelection;
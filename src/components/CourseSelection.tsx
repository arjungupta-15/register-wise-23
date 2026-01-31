import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Check, MapPin } from "lucide-react";

interface CourseSelectionProps {
  center: string;
  selectedCourses: string[];
  onCenterChange: (center: string) => void;
  onCoursesChange: (courses: string[]) => void;
  errors: Record<string, string>;
}

const rajasthanCourses = [
  { id: "rs-cfa", name: "Computer Fundamentals & Applications", duration: "6 Months", fee: "₹5,000" },
  { id: "rs-dca", name: "Diploma in Computer Applications", duration: "1 Year", fee: "₹12,000" },
  { id: "rs-pgdca", name: "PG Diploma in Computer Applications", duration: "1 Year", fee: "₹18,000" },
  { id: "rs-tally", name: "Tally & Accounting", duration: "3 Months", fee: "₹4,000" },
  { id: "rs-web", name: "Web Development", duration: "6 Months", fee: "₹8,000" },
  { id: "rs-python", name: "Python Programming", duration: "4 Months", fee: "₹6,000" },
];

const otherCourses = [
  { id: "ot-bca", name: "Bachelor in Computer Applications", duration: "3 Years", fee: "₹45,000/year" },
  { id: "ot-mca", name: "Master in Computer Applications", duration: "2 Years", fee: "₹55,000/year" },
  { id: "ot-data", name: "Data Science & Analytics", duration: "1 Year", fee: "₹25,000" },
  { id: "ot-ai", name: "Artificial Intelligence", duration: "1 Year", fee: "₹30,000" },
  { id: "ot-cyber", name: "Cyber Security", duration: "6 Months", fee: "₹15,000" },
  { id: "ot-cloud", name: "Cloud Computing", duration: "6 Months", fee: "₹12,000" },
];

const CourseSelection = ({
  center,
  selectedCourses,
  onCenterChange,
  onCoursesChange,
  errors,
}: CourseSelectionProps) => {
  const courses = center === "rajasthan" ? rajasthanCourses : center === "other" ? otherCourses : [];

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
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
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
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-card-foreground mb-1">{course.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{course.duration}</span>
                          <span className="font-medium text-primary">{course.fee}</span>
                        </div>
                      </div>
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
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
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

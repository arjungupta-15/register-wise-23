import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Check, User, BookOpen, GraduationCap, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import CourseSelection from "@/components/CourseSelection";
import { supabase } from "@/integrations/supabase/client";

const steps = [
  { id: 1, title: "Personal Details", icon: User },
  { id: 2, title: "Educational Details", icon: BookOpen },
  { id: 3, title: "Course Selection", icon: GraduationCap },
];

const StudentDetails = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    motherName: "",
    address: "",
    eligibility: "",
    obtainedMarks: "",
    totalMarks: "",
    aadhaar: "",
    caste: "",
    gender: "",
    center: "",
    selectedCourses: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculatePercentage = () => {
    if (formData.obtainedMarks && formData.totalMarks && Number(formData.totalMarks) > 0) {
      const percentage = (Number(formData.obtainedMarks) / Number(formData.totalMarks)) * 100;
      return percentage.toFixed(2);
    }
    return "";
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.fatherName.trim()) newErrors.fatherName = "Father's name is required";
      if (!formData.motherName.trim()) newErrors.motherName = "Mother's name is required";
      if (!formData.address.trim()) newErrors.address = "Address is required";
    }
    
    if (step === 2) {
      if (!formData.eligibility) newErrors.eligibility = "Eligibility is required";
      if (!formData.obtainedMarks) {
        newErrors.obtainedMarks = "Obtained marks is required";
      } else if (isNaN(Number(formData.obtainedMarks)) || Number(formData.obtainedMarks) < 0) {
        newErrors.obtainedMarks = "Please enter valid obtained marks";
      }
      if (!formData.totalMarks) {
        newErrors.totalMarks = "Total marks is required";
      } else if (isNaN(Number(formData.totalMarks)) || Number(formData.totalMarks) <= 0) {
        newErrors.totalMarks = "Please enter valid total marks";
      }
      if (formData.obtainedMarks && formData.totalMarks && Number(formData.obtainedMarks) > Number(formData.totalMarks)) {
        newErrors.obtainedMarks = "Obtained marks cannot be greater than total marks";
      }
      if (!formData.aadhaar) {
        newErrors.aadhaar = "Aadhaar number is required";
      } else if (!/^\d{12}$/.test(formData.aadhaar)) {
        newErrors.aadhaar = "Please enter a valid 12-digit Aadhaar number";
      }
      if (!formData.caste) newErrors.caste = "Caste selection is required";
      if (!formData.gender) newErrors.gender = "Gender selection is required";
    }
    
    if (step === 3) {
      if (!formData.center) newErrors.center = "Please select a center";
      if (formData.selectedCourses.length < 2) {
        newErrors.courses = "Please select at least 2 courses";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setIsSubmitting(true);
    
    try {
      // Get existing auth data (email/mobile)
      const existingData = JSON.parse(localStorage.getItem("studentAuth") || "{}");
      
      // Insert student data (percentage is auto-calculated by database)
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .insert({
          name: formData.name,
          email: existingData.email || null,
          mobile: existingData.mobile || null,
          father_name: formData.fatherName,
          mother_name: formData.motherName,
          address: formData.address,
          eligibility: formData.eligibility,
          obtained_marks: formData.obtainedMarks ? Number(formData.obtainedMarks) : null,
          total_marks: formData.totalMarks ? Number(formData.totalMarks) : null,
          aadhaar: formData.aadhaar,
          caste: formData.caste as 'general' | 'obc' | 'sc' | 'st',
          gender: formData.gender as 'male' | 'female',
          center: formData.center as 'rajasthan' | 'centerexam' | 'other'
        } as any)
        .select()
        .single();

      if (studentError) {
        console.error('Error inserting student:', studentError);
        toast({
          title: "Error",
          description: "Failed to save registration. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!studentData) {
        toast({
          title: "Error",
          description: "Failed to save registration. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Insert student-course relationships
      const courseInserts = formData.selectedCourses.map(courseId => ({
        student_id: (studentData as any).id,
        course_id: courseId
      }));

      const { error: coursesError } = await supabase
        .from('student_courses')
        .insert(courseInserts as any);

      if (coursesError) {
        console.error('Error inserting student courses:', coursesError);
        toast({
          title: "Error",
          description: "Failed to save course selection. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Store student ID for future reference
      localStorage.setItem("currentStudentId", (studentData as any).id);
      
      setIsSubmitted(true);
      toast({
        title: "Success!",
        description: "Your registration has been completed successfully.",
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardContent className="pt-12 pb-8">
            <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-card-foreground mb-2">Registration Completed!</h2>
            <p className="text-muted-foreground mb-6">
              Your course registration has been submitted successfully. You can check your approval status and payment options anytime.
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate("/student/status")} className="w-full">
                Check Status & Payment
              </Button>
              <Button onClick={() => navigate("/")} variant="outline" className="w-full">
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Registration</h1>
          <p className="text-muted-foreground">Please fill in all the required details</p>
        </div>
        
        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`h-12 w-12 rounded-full flex items-center justify-center border-2 transition-all ${
                      currentStep > step.id
                        ? "bg-primary border-primary text-primary-foreground"
                        : currentStep === step.id
                        ? "border-primary text-primary bg-primary/10"
                        : "border-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <step.icon className="h-6 w-6" />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 rounded ${
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Form Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>
              {currentStep === 1 && "Enter your personal information"}
              {currentStep === 2 && "Enter your educational qualifications"}
              {currentStep === 3 && "Select your preferred center and courses"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Step 1: Personal Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fatherName">Father's Name *</Label>
                  <Input
                    id="fatherName"
                    placeholder="Enter father's name"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className={errors.fatherName ? "border-destructive" : ""}
                  />
                  {errors.fatherName && <p className="text-sm text-destructive">{errors.fatherName}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="motherName">Mother's Name *</Label>
                  <Input
                    id="motherName"
                    placeholder="Enter mother's name"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    className={errors.motherName ? "border-destructive" : ""}
                  />
                  {errors.motherName && <p className="text-sm text-destructive">{errors.motherName}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your complete address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={errors.address ? "border-destructive" : ""}
                    rows={3}
                  />
                  {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                </div>
              </div>
            )}
            
            {/* Step 2: Educational Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Eligibility *</Label>
                  <Select
                    value={formData.eligibility}
                    onValueChange={(value) => setFormData({ ...formData, eligibility: value })}
                  >
                    <SelectTrigger className={errors.eligibility ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select your eligibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10th">10th Pass</SelectItem>
                      <SelectItem value="12th">12th Pass</SelectItem>
                      <SelectItem value="diploma">Diploma</SelectItem>
                      <SelectItem value="ba">BA (Bachelor of Arts)</SelectItem>
                      <SelectItem value="bsc">BSc (Bachelor of Science)</SelectItem>
                      <SelectItem value="bcom">BCom (Bachelor of Commerce)</SelectItem>
                      <SelectItem value="bba">BBA (Bachelor of Business Administration)</SelectItem>
                      <SelectItem value="btech">BTech (Bachelor of Technology)</SelectItem>
                      <SelectItem value="be">BE (Bachelor of Engineering)</SelectItem>
                      <SelectItem value="bca">BCA (Bachelor of Computer Applications)</SelectItem>
                      <SelectItem value="llb">LLB (Bachelor of Laws)</SelectItem>
                      <SelectItem value="bds">BDS (Bachelor of Dental Surgery)</SelectItem>
                      <SelectItem value="mbbs">MBBS (Bachelor of Medicine)</SelectItem>
                      <SelectItem value="bpharm">B.Pharm (Bachelor of Pharmacy)</SelectItem>
                      <SelectItem value="ma">MA (Master of Arts)</SelectItem>
                      <SelectItem value="msc">MSc (Master of Science)</SelectItem>
                      <SelectItem value="mcom">MCom (Master of Commerce)</SelectItem>
                      <SelectItem value="mba">MBA (Master of Business Administration)</SelectItem>
                      <SelectItem value="mtech">MTech (Master of Technology)</SelectItem>
                      <SelectItem value="me">ME (Master of Engineering)</SelectItem>
                      <SelectItem value="mca">MCA (Master of Computer Applications)</SelectItem>
                      <SelectItem value="llm">LLM (Master of Laws)</SelectItem>
                      <SelectItem value="phd">PhD (Doctor of Philosophy)</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.eligibility && <p className="text-sm text-destructive">{errors.eligibility}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="obtainedMarks">Obtained Marks *</Label>
                    <Input
                      id="obtainedMarks"
                      type="number"
                      placeholder="Enter obtained marks"
                      value={formData.obtainedMarks}
                      onChange={(e) => setFormData({ ...formData, obtainedMarks: e.target.value })}
                      className={errors.obtainedMarks ? "border-destructive" : ""}
                    />
                    {errors.obtainedMarks && <p className="text-sm text-destructive">{errors.obtainedMarks}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="totalMarks">Total Marks *</Label>
                    <Input
                      id="totalMarks"
                      type="number"
                      placeholder="Enter total marks"
                      value={formData.totalMarks}
                      onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                      className={errors.totalMarks ? "border-destructive" : ""}
                    />
                    {errors.totalMarks && <p className="text-sm text-destructive">{errors.totalMarks}</p>}
                  </div>
                </div>
                
                {calculatePercentage() && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary">Calculated Percentage:</span>
                      <span className="text-lg font-bold text-primary">{calculatePercentage()}%</span>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="aadhaar">Aadhaar Number *</Label>
                  <Input
                    id="aadhaar"
                    placeholder="Enter 12-digit Aadhaar number"
                    value={formData.aadhaar}
                    onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value.replace(/\D/g, "").slice(0, 12) })}
                    className={errors.aadhaar ? "border-destructive" : ""}
                  />
                  {errors.aadhaar && <p className="text-sm text-destructive">{errors.aadhaar}</p>}
                </div>
                
                <div className="space-y-3">
                  <Label>Caste Category *</Label>
                  <RadioGroup
                    value={formData.caste}
                    onValueChange={(value) => setFormData({ ...formData, caste: value })}
                    className="flex flex-wrap gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="general" id="general" />
                      <Label htmlFor="general" className="cursor-pointer">General</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="obc" id="obc" />
                      <Label htmlFor="obc" className="cursor-pointer">OBC</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sc" id="sc" />
                      <Label htmlFor="sc" className="cursor-pointer">SC</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="st" id="st" />
                      <Label htmlFor="st" className="cursor-pointer">ST</Label>
                    </div>
                  </RadioGroup>
                  {errors.caste && <p className="text-sm text-destructive">{errors.caste}</p>}
                </div>
                
                <div className="space-y-3">
                  <Label>Gender *</Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    className="flex flex-wrap gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male" className="cursor-pointer">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female" className="cursor-pointer">Female</Label>
                    </div>
                  </RadioGroup>
                  {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
                </div>
              </div>
            )}
            
            {/* Step 3: Course Selection */}
            {currentStep === 3 && (
              <CourseSelection
                center={formData.center}
                selectedCourses={formData.selectedCourses}
                onCenterChange={(center) => setFormData({ ...formData, center, selectedCourses: [] })}
                onCoursesChange={(courses) => setFormData({ ...formData, selectedCourses: courses })}
                errors={errors}
              />
            )}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep < 3 ? (
                <Button onClick={handleNext}>
                  Next Step
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={formData.selectedCourses.length < 2 || isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? "Submitting..." : "Submit Registration"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDetails;

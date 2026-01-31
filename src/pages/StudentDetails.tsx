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

const steps = [
  { id: 1, title: "Personal Details", icon: User },
  { id: 2, title: "Educational Details", icon: BookOpen },
  { id: 3, title: "Course Selection", icon: GraduationCap },
];

const StudentDetails = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    motherName: "",
    address: "",
    eligibility: "",
    aadhaar: "",
    caste: "",
    center: "",
    selectedCourses: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      if (!formData.aadhaar) {
        newErrors.aadhaar = "Aadhaar number is required";
      } else if (!/^\d{12}$/.test(formData.aadhaar)) {
        newErrors.aadhaar = "Please enter a valid 12-digit Aadhaar number";
      }
      if (!formData.caste) newErrors.caste = "Caste selection is required";
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

  const handleSubmit = () => {
    if (validateStep(3)) {
      // Store all data
      const existingData = JSON.parse(localStorage.getItem("studentAuth") || "{}");
      const completeData = { ...existingData, ...formData };
      
      // Add to registered students list
      const students = JSON.parse(localStorage.getItem("registeredStudents") || "[]");
      students.push({
        id: Date.now(),
        ...completeData,
        registeredAt: new Date().toISOString()
      });
      localStorage.setItem("registeredStudents", JSON.stringify(students));
      
      setIsSubmitted(true);
      toast({
        title: "Success!",
        description: "Your registration has been completed successfully.",
      });
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
              Your course registration has been submitted successfully.
            </p>
            <Button onClick={() => navigate("/")} className="w-full">
              Back to Home
            </Button>
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
                      <SelectItem value="graduation">Graduation</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.eligibility && <p className="text-sm text-destructive">{errors.eligibility}</p>}
                </div>
                
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
                  </RadioGroup>
                  {errors.caste && <p className="text-sm text-destructive">{errors.caste}</p>}
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
                  disabled={formData.selectedCourses.length < 2}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Submit Registration
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

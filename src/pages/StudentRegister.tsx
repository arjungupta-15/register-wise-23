import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const StudentRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    mobile: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.mobile) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Please enter a valid 10-digit mobile number";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      // Check if mobile number already exists in Supabase
      const { data: existingStudent, error: checkError } = await supabase
        .from('students')
        .select('mobile')
        .eq('mobile', formData.mobile)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is what we want
        console.error('Error checking mobile number:', checkError);
        toast({
          title: "Error",
          description: "Failed to verify mobile number. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (existingStudent) {
        setErrors({ mobile: "This mobile number is already registered. Please use a different number or login instead." });
        return;
      }

      // Also check localStorage for fallback
      const registeredStudents = JSON.parse(localStorage.getItem("registeredStudents") || "[]");
      const localExists = registeredStudents.find((s: any) => s.mobile === formData.mobile);
      
      if (localExists) {
        setErrors({ mobile: "This mobile number is already registered. Please use a different number or login instead." });
        return;
      }

      // Store registration data in localStorage for demo
      const authData = {
        mobile: formData.mobile,
        studentId: Date.now(),
        loginTime: new Date().toISOString()
      };
      
      localStorage.setItem("studentAuth", JSON.stringify(authData));
      
      toast({
        title: "Registration Successful",
        description: "Please complete your details to finish registration.",
      });
      navigate("/student/details");
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10 mb-4"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-card-foreground">Student Registration</CardTitle>
            <CardDescription>Create your account to get started</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="Enter Your Number"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className={errors.mobile ? "border-destructive" : ""}
                  maxLength={10}
                />
                {errors.mobile && <p className="text-sm text-destructive">{errors.mobile}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter Your Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Enter Your Password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={errors.confirmPassword ? "border-destructive" : ""}
                />
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>
              
              <Button type="submit" className="w-full" size="lg">
                Register
              </Button>
              
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/student/login")}>
                  Login here
                </Button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentRegister;

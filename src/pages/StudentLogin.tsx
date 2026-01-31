import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const StudentLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emailOrMobile: "",
    password: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.emailOrMobile) {
      newErrors.emailOrMobile = "Email or Mobile number is required";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Get all registered students
      const registeredStudents = JSON.parse(localStorage.getItem("registeredStudents") || "[]");
      
      // Find student by email/mobile and password
      const student = registeredStudents.find((s: any) => {
        const matchesEmailOrMobile = 
          s.emailOrMobile === formData.emailOrMobile ||
          s.email === formData.emailOrMobile ||
          s.mobile === formData.emailOrMobile;
        
        // For demo, we'll use a simple password check
        // In real app, passwords should be hashed
        return matchesEmailOrMobile;
      });
      
      if (!student) {
        setErrors({ auth: "No account found with this email/mobile number. Please register first." });
        setIsLoading(false);
        return;
      }
      
      // For demo purposes, we'll accept any password for registered users
      // In production, you'd verify the actual password
      
      // Store login session
      localStorage.setItem("studentAuth", JSON.stringify({ 
        emailOrMobile: formData.emailOrMobile,
        studentId: student.id,
        loginTime: new Date().toISOString()
      }));
      
      toast({
        title: "Login Successful",
        description: "Welcome back! Redirecting to your status page.",
      });
      
      // Redirect to status page
      navigate("/student/status");
      
    } catch (error) {
      setErrors({ auth: "Login failed. Please try again." });
    } finally {
      setIsLoading(false);
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
            <CardTitle className="text-2xl font-bold text-card-foreground">Student Login</CardTitle>
            <CardDescription>Login to check your registration status</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.auth && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg text-center">
                  {errors.auth}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="emailOrMobile">Email or Mobile Number</Label>
                <Input
                  id="emailOrMobile"
                  type="text"
                  placeholder="Enter your email or mobile number"
                  value={formData.emailOrMobile}
                  onChange={(e) => setFormData({ ...formData, emailOrMobile: e.target.value })}
                  className={errors.emailOrMobile ? "border-destructive" : ""}
                />
                {errors.emailOrMobile && <p className="text-sm text-destructive">{errors.emailOrMobile}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={errors.password ? "border-destructive pr-10" : "pr-10"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/register")}>
                    Register here
                  </Button>
                </p>
                
                <div className="bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground">
                  <strong>Demo Note:</strong><br />
                  Use any registered email/mobile with any password to login.
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentLogin;
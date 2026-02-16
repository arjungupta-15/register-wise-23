import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Users, Award, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

const Landing = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    // Check if student is logged in
    const authData = JSON.parse(localStorage.getItem("studentAuth") || "{}");
    const currentStudentId = localStorage.getItem("currentStudentId");
    
    if (authData.mobile || currentStudentId) {
      setIsLoggedIn(true);
      // You could fetch student name from Supabase here if needed
      setStudentName("Student"); // For now, just show "Student"
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("studentAuth");
    localStorage.removeItem("currentStudentId");
    setIsLoggedIn(false);
    setStudentName("");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  const handleStatusCheck = () => {
    if (isLoggedIn) {
      navigate("/student/status");
    } else {
      navigate("/student/login");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center p-1">
            <img src="/TARSLOGO.JPG-removebg-preview.jpg" alt="TARS Education" className="h-full w-full object-contain rounded-full" />
          </div>
          <div className="text-white">
            <div className="font-bold text-lg">
              <span className="text-green-400">T</span>
              <span className="text-blue-400">A</span>
              <span className="text-purple-400">R</span>
              <span className="text-red-400">S</span>
              <span className="text-white"> </span>
              <span className="text-green-400">E</span>
              <span className="text-blue-400">d</span>
              <span className="text-purple-400">u</span>
              <span className="text-red-400">c</span>
              <span className="text-green-400">a</span>
              <span className="text-blue-400">t</span>
              <span className="text-purple-400">i</span>
              <span className="text-red-400">o</span>
              <span className="text-green-400">n</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLoggedIn && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full">
                <User className="h-4 w-4 text-white" />
                <span className="text-white text-sm">{studentName}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-white/10 gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            className="text-white hover:bg-white/10"
            onClick={() => navigate("/contact")}
          >
            Contact Us
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-secondary">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <GraduationCap className="h-5 w-5" />
              <span className="text-sm font-medium">Welcome to TARS Education</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-green-500">T</span>
              <span className="text-blue-500">A</span>
              <span className="text-purple-500">R</span>
              <span className="text-red-500">S</span>
              <span className="text-white"> </span>
              <span className="text-green-500">E</span>
              <span className="text-blue-500">d</span>
              <span className="text-purple-500">u</span>
              <span className="text-red-500">c</span>
              <span className="text-green-500">a</span>
              <span className="text-blue-500">t</span>
              <span className="text-purple-500">i</span>
              <span className="text-red-500">o</span>
              <span className="text-green-500">n</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl mx-auto">
              Register once. Choose your future. Seamless course registration for students across all centers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 font-semibold px-6 py-6 text-lg shadow-lg"
                onClick={() => navigate("/register")}
              >
                New Registration
              </Button>
              {!isLoggedIn && (
                <Button 
                  size="lg" 
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary font-semibold px-6 py-6 text-lg shadow-lg transition-all"
                  onClick={() => navigate("/student/login")}
                >
                  Student Login
                </Button>
              )}
              <Button 
                size="lg" 
                variant="outline"
                className="bg-white/10 border-2 border-white text-white hover:bg-white hover:text-primary font-semibold px-6 py-6 text-lg shadow-lg transition-all backdrop-blur-sm"
                onClick={handleStatusCheck}
              >
                {isLoggedIn ? "View Status" : "Check Status"}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(210, 40%, 98%)"/>
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose TARS Education?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform makes course registration simple, fast, and efficient for students and administrators alike.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-card-foreground">Easy Registration</h3>
            <p className="text-muted-foreground">
              Simple step-by-step process to register and select your preferred courses.
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-card-foreground">Multiple Centers</h3>
            <p className="text-muted-foreground">
              Choose from Rajasthan Exams or other centers based on your location.
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-card-foreground">Quality Courses</h3>
            <p className="text-muted-foreground">
              Wide range of professional courses designed for your career growth.
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Learning Environment</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Take a look at our modern facilities and learning spaces designed for your success.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <img 
                src="/education.jpg" 
                alt="education" 
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-foreground">Education</h3>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <img 
                src="/Hostel.jpg" 
                alt="Hostel" 
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-foreground">Hostel</h3>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <img 
                src="/Librabry.jpg" 
                alt="Library" 
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-foreground">Library</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/80 mb-4 md:mb-0">© 2026 Powered By <a href="https://developerwallah.org/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-300 underline">Developer Wallah</a>. All rights reserved.</p>
            <div className="flex gap-4">
              <Button 
                variant="ghost" 
                className="text-white/80 hover:bg-white/10 hover:text-white"
                onClick={() => navigate("/contact")}
              >
                Contact Us
              </Button>
              <Button 
                variant="ghost" 
                className="text-white/80 hover:bg-white/10 hover:text-white"
                onClick={() => navigate("/admin/login")}
              >
                Admin Login
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

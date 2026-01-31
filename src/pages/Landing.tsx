import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Users, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-secondary">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <GraduationCap className="h-5 w-5" />
              <span className="text-sm font-medium">Welcome to SCRS</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Student Course
              <br />
              Registration System
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl mx-auto">
              Register once. Choose your future. Seamless course registration for students across all centers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-6 text-lg shadow-lg"
                onClick={() => navigate("/register")}
              >
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 font-semibold px-8 py-6 text-lg"
                onClick={() => navigate("/admin/login")}
              >
                Admin Login
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
          <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose SCRS?</h2>
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
              Choose from Rajasthan Center or other centers based on your location.
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

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/80">© 2024 Student Course Registration System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

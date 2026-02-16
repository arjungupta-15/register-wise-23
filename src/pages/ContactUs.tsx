import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ContactUs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10 mb-6"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Get in touch with TARS Education. We're here to help you with your educational journey.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Contact Information */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">Get in Touch</h2>
            <p className="text-muted-foreground text-lg">
              Have questions about our courses or need assistance with registration? 
              We're here to help! Reach out to us through any of the following methods.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Phone */}
            <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-xl">Phone Number</h3>
                  <a 
                    href="tel:7014130070" 
                    className="text-primary hover:underline text-2xl font-bold block mb-2"
                  >
                    +91 7014130070
                  </a>
                  <p className="text-muted-foreground">Call us for immediate assistance</p>
                </div>
              </CardContent>
            </Card>

            {/* Email */}
            <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-xl">Email Address</h3>
                  <a 
                    href="mailto:tarseducation@gmail.com" 
                    className="text-blue-600 hover:underline text-xl font-bold block mb-2"
                  >
                    tarseducation@gmail.com
                  </a>
                  <p className="text-muted-foreground">Send us your queries anytime</p>
                </div>
              </CardContent>
            </Card>

            {/* Office Hours */}
            <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-xl">Office Hours</h3>
                  <div className="text-foreground text-lg font-medium mb-2">
                    <p>Monday - Saturday</p>
                    <p>9:00 AM - 6:00 PM</p>
                  </div>
                  <p className="text-muted-foreground">Closed on Sundays</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Office Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Head Office */}
            <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-3 text-xl">Branch Office</h3>
                  <div className="text-foreground text-lg font-medium mb-2 space-y-1">
                    <p>Kailash Nagar, Hindaun City</p>
                    <p>Karauli, Rajasthan</p>
                  </div>
                  <p className="text-muted-foreground">Main administrative office</p>
                </div>
              </CardContent>
            </Card>

            {/* Branch Office */}
            <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-3 text-xl">Head Office</h3>
                  <div className="text-foreground text-lg font-medium mb-2 space-y-1">
                    <p>60 Feet Road, Azad Nagar</p>
                    <p>Alwar, Rajasthan - 322230</p>
                  </div>
                  <p className="text-muted-foreground">Regional service center</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <Card className="shadow-lg border-0 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">Why Choose TARS Education?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                <div>
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">Quick Response</h4>
                  <p className="text-muted-foreground">We respond to all inquiries within 24 hours</p>
                </div>
                <div>
                  <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">Expert Guidance</h4>
                  <p className="text-muted-foreground">Get advice from our experienced counselors</p>
                </div>
                <div>
                  <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-secondary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">Local Support</h4>
                  <p className="text-muted-foreground">Visit our office for in-person assistance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
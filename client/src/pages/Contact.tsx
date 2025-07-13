import { useEffect } from "react";
import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram, Linkedin, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Contact() {
  useEffect(() => {
    // Initialize AOS
    const initAOS = async () => {
      const AOS = (await import('aos')).default;
      await import('aos/dist/aos.css');
      AOS.init({
        duration: 1000,
        easing: 'ease-in-out',
        once: true
      });
    };

    initAOS();
  }, []);

  const contactInfo = [
    {
      icon: MapPin,
      title: "Address",
      details: "1. Theo Okeke's Close, Ozuda Market Area, Obosi Anambra State",
      subDetails: "Reg No: 7779525",
      color: "text-red-600"
    },
    {
      icon: Phone,
      title: "Phone Numbers",
      details: "+234 814 637 3297",
      subDetails: "+234 701 677 4165",
      color: "text-blue-600"
    },
    {
      icon: Mail,
      title: "Email",
      details: "robertsonvocational@gmail.com",
      subDetails: "obosirobertson@gmail.com",
      color: "text-green-600"
    },
    {
      icon: Clock,
      title: "Office Hours",
      details: "Monday - Friday: 8:00 AM - 5:00 PM",
      subDetails: "Weekends: Closed",
      color: "text-purple-600"
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook", color: "hover:text-blue-600" },
    { icon: Twitter, href: "#", label: "Twitter", color: "hover:text-blue-400" },
    { icon: Instagram, href: "#", label: "Instagram", color: "hover:text-pink-600" },
    { icon: Linkedin, href: "#", label: "LinkedIn", color: "hover:text-blue-700" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16" data-aos="fade-up">
            <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6">
              Contact Us
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Get in touch with Robertson Education. We're here to help with admissions, 
              inquiries, and any questions about our educational programs.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {contactInfo.map((info, index) => (
              <Card 
                key={index} 
                className="text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <CardHeader className="pb-4">
                  <div className={`mx-auto w-16 h-16 md:w-20 md:h-20 ${info.color} bg-gray-50 rounded-full flex items-center justify-center mb-4`}>
                    <info.icon className="h-8 w-8 md:h-10 md:w-10" />
                  </div>
                  <CardTitle className="text-lg md:text-xl text-gray-900">
                    {info.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm md:text-base text-gray-700 font-medium mb-2">
                    {info.details}
                  </p>
                  <p className="text-xs md:text-sm text-gray-500">
                    {info.subDetails}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <p className="text-lg text-gray-600">
              Choose how you'd like to reach us
            </p>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
            {/* Call Us */}
            <div className="text-center" data-aos="fade-up" data-aos-delay="100">
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-full w-16 h-16 md:w-20 md:h-20 mx-auto flex items-center justify-center mb-4">
                <Phone className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Call Us</h3>
              <p className="text-sm md:text-base text-gray-600 mb-4">
                Speak directly with our admissions team
              </p>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 text-sm md:text-base"
                onClick={() => window.open('tel:+2348146373297')}
              >
                Call Now
              </Button>
            </div>

            {/* Email Us */}
            <div className="text-center" data-aos="fade-up" data-aos-delay="200">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full w-16 h-16 md:w-20 md:h-20 mx-auto flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Email Us</h3>
              <p className="text-sm md:text-base text-gray-600 mb-4">
                Send us your questions and inquiries
              </p>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm md:text-base"
                onClick={() => window.open('mailto:robertsonvocational@gmail.com')}
              >
                Send Email
              </Button>
            </div>

            {/* Visit Us */}
            <div className="text-center" data-aos="fade-up" data-aos-delay="300">
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full w-16 h-16 md:w-20 md:h-20 mx-auto flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Visit Us</h3>
              <p className="text-sm md:text-base text-gray-600 mb-4">
                Come to our campus for a personal tour
              </p>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 text-sm md:text-base"
                onClick={() => window.open('https://maps.google.com/?q=Theo+Okeke+Close+Ozuda+Market+Obosi+Anambra+State')}
              >
                Get Directions
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Map and Additional Info */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Map */}
            <div data-aos="fade-right">
              <Card className="overflow-hidden shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl text-gray-900">
                    Our Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-64 md:h-80 bg-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm md:text-base text-gray-600">
                        Interactive map coming soon
                      </p>
                      <Button 
                        className="mt-4 bg-red-600 hover:bg-red-700 text-white text-sm md:text-base"
                        onClick={() => window.open('https://maps.google.com/?q=Theo+Okeke+Close+Ozuda+Market+Obosi+Anambra+State')}
                      >
                        Open in Google Maps
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Information */}
            <div className="space-y-6 md:space-y-8" data-aos="fade-left">
              <div>
                <h3 className="font-playfair text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Why Choose Robertson Education?
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-red-100 rounded-full p-2 flex-shrink-0">
                      <MessageCircle className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm md:text-base">Responsive Support</h4>
                      <p className="text-gray-600 text-sm md:text-base">
                        Our team responds to inquiries within 24 hours
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                      <Clock className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm md:text-base">Flexible Hours</h4>
                      <p className="text-gray-600 text-sm md:text-base">
                        Extended office hours for your convenience
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                      <MapPin className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm md:text-base">Convenient Location</h4>
                      <p className="text-gray-600 text-sm md:text-base">
                        Easily accessible location in Obosi, Anambra State
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 text-lg md:text-xl">
                  Connect With Us
                </h4>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      className={`bg-white p-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 ${social.color}`}
                      aria-label={social.label}
                    >
                      <social.icon className="h-5 w-5 md:h-6 md:w-6" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
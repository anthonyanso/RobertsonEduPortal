import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Award, Users, Globe, Star, Heart, HandHeart, Lightbulb, ChevronDown } from "lucide-react";
import HeroSlider from "../components/HeroSlider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  // Fetch dynamic school information
  const { data: settings = [] } = useQuery({
    queryKey: ["/api/admin/school-info"],
    refetchOnWindowFocus: false,
    staleTime: 0, // Always fresh data
  });

  const settingsMap = settings.reduce((acc: any, setting: any) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});

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

  const handleApplyClick = () => {
    window.location.hash = "admission";
  };

  const handleLearnMoreClick = () => {
    window.location.hash = "about";
  };

  const toggleFAQ = (element: HTMLElement) => {
    const content = element.nextElementSibling as HTMLElement;
    const icon = element.querySelector('.faq-icon') as HTMLElement;
    
    if (content.classList.contains('hidden')) {
      content.classList.remove('hidden');
      icon.style.transform = 'rotate(180deg)';
    } else {
      content.classList.add('hidden');
      icon.style.transform = 'rotate(0deg)';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSlider onApplyClick={handleApplyClick} onLearnMoreClick={handleLearnMoreClick} />

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose {settingsMap.school_name || "Robertson Education"}?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover what makes our institution a beacon of academic excellence and character development.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-xl transition-shadow group" data-aos="fade-up" data-aos-delay="100">
              <CardContent className="pt-6">
                <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Award className="h-10 w-10 text-white" />
                </div>
                <h3 className="font-playfair text-2xl font-bold mb-4 text-gray-900">Academic Excellence</h3>
                <p className="text-gray-600">Our rigorous curriculum and experienced faculty ensure students achieve their highest potential.</p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-xl transition-shadow group" data-aos="fade-up" data-aos-delay="200">
              <CardContent className="pt-6">
                <div className="w-20 h-20 bg-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="font-playfair text-2xl font-bold mb-4 text-gray-900">Holistic Development</h3>
                <p className="text-gray-600">We focus on developing well-rounded individuals with strong character and leadership skills.</p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-xl transition-shadow group" data-aos="fade-up" data-aos-delay="300">
              <CardContent className="pt-6">
                <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Globe className="h-10 w-10 text-white" />
                </div>
                <h3 className="font-playfair text-2xl font-bold mb-4 text-gray-900">Global Perspective</h3>
                <p className="text-gray-600">Our international programs prepare students for success in a globally connected world.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-700">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div data-aos="fade-up">
              <div className="text-5xl font-bold mb-2">5000+</div>
              <p className="text-xl">Students Graduated</p>
            </div>
            <div data-aos="fade-up" data-aos-delay="100">
              <div className="text-5xl font-bold mb-2">150+</div>
              <p className="text-xl">Expert Faculty</p>
            </div>
            <div data-aos="fade-up" data-aos-delay="200">
              <div className="text-5xl font-bold mb-2">25+</div>
              <p className="text-xl">Years of Excellence</p>
            </div>
            <div data-aos="fade-up" data-aos-delay="300">
              <div className="text-5xl font-bold mb-2">98%</div>
              <p className="text-xl">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div data-aos="fade-right">
              <img 
                src="https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Historic school building" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div data-aos="fade-left">
              <h2 className="font-playfair text-4xl font-bold text-gray-900 mb-6">Our Rich History</h2>
              <p className="text-lg text-gray-600 mb-6">
                Founded in 1999, Robertson Education has been at the forefront of educational excellence for over two decades. 
                Our journey began with a simple mission: to provide quality education that transforms lives and builds character.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                From our humble beginnings with just 50 students, we have grown into a prestigious institution that has 
                graduated over 5,000 successful alumni who now lead in various fields across the globe.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">1999 - Founded with 50 students</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">2005 - Expanded to secondary education</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">2010 - Introduced international programs</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">2024 - Celebrating 25 years of excellence</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about our school and admission process.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-4" data-aos="fade-up">
              {[
                {
                  question: "What is the admission process?",
                  answer: "Our admission process involves completing an online application, submitting required documents, attending an interview, and taking an entrance examination. We review applications holistically considering academic performance, character, and potential."
                },
                {
                  question: "What are the school hours?",
                  answer: "Our school hours are Monday to Friday, 8:00 AM to 3:30 PM. We also offer extended care programs until 6:00 PM for working parents."
                },
                {
                  question: "Do you offer scholarships?",
                  answer: "Yes, we offer merit-based scholarships for exceptional students and need-based financial aid for families who qualify. Our scholarship program covers up to 50% of tuition fees."
                },
                {
                  question: "What extracurricular activities are available?",
                  answer: "We offer a wide range of activities including sports teams, debate club, drama society, music band, science club, and community service programs. Students are encouraged to participate in at least one activity."
                }
              ].map((faq, index) => (
                <Card key={index} className="border">
                  <button
                    className="w-full px-6 py-4 text-left font-semibold text-gray-900 hover:bg-gray-50 transition-colors flex justify-between items-center"
                    onClick={(e) => toggleFAQ(e.currentTarget)}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className="h-5 w-5 transition-transform faq-icon" />
                  </button>
                  <div className="px-6 pb-4 text-gray-600 hidden">
                    <p>{faq.answer}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Our Community Says
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hear from our students, parents, and alumni about their Robertson Education experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Class of 2023",
                image: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60",
                testimonial: "Robertson Education provided me with the foundation I needed to succeed. The teachers genuinely care about each student's growth and development."
              },
              {
                name: "Michael Chen",
                role: "Parent",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60",
                testimonial: "As a parent, I'm impressed by the school's commitment to both academic excellence and character development. My daughter loves going to school every day."
              },
              {
                name: "David Rodriguez",
                role: "Alumni, Class of 2020",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60",
                testimonial: "The education I received at Robertson prepared me well for university. I'm now pursuing my dream career in engineering, thanks to the strong foundation I received."
              }
            ].map((testimonial, index) => (
              <Card key={index} className="p-8 shadow-lg" data-aos="fade-up" data-aos-delay={index * 100}>
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="text-yellow-500 text-lg">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current inline" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-6 italic">"{testimonial.testimonial}"</p>
                  <div className="flex items-center">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-700">
        <div className="container mx-auto px-4 text-center">
          <div data-aos="fade-up">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Join Our Community?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Take the first step towards an exceptional education. Apply now and become part of the Robertson Education family.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleApplyClick}
                className="bg-yellow-500 hover:bg-yellow-400 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105"
              >
                Apply Now
              </Button>
              <Button
                onClick={() => window.location.hash = "contact"}
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-red-600 px-8 py-4 rounded-full text-lg font-semibold transition-all bg-transparent"
              >
                Schedule Visit
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

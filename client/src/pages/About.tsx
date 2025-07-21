import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, Star, HandHeart, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16" data-aos="fade-up">
            <h1 className="font-playfair text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              About {settingsMap.school_name || "Robertson Education"}
            </h1>
          </div>

          {/* About Robertson Education */}
          <div className="mb-20" data-aos="fade-up">
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-xl">
              <CardContent className="p-8 md:p-12">
                <div className="max-w-4xl mx-auto">
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    Robertson Education Limited is one of the contemporary government approved co-educational institution in Obosi Anambra State, Nigeria. It aims to provide quality and affordable education at the secondary school level as well as adult skills education, addressing the economic needs of the community.
                  </p>
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                    It has been growing steadily in the past three years and is graduating its first WAEC pupils in July 2025 and has trained a lot of adults in computer awareness and software packages.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div data-aos="fade-right">
              <img 
                src="https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Modern classroom" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div data-aos="fade-left">
              <h2 className="font-playfair text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                {settingsMap.mission || "To provide a transformative educational experience that develops critical thinking, creativity, and character in our students, preparing them to become responsible global citizens and leaders of tomorrow."}
              </p>
              <p className="text-lg text-gray-600">
                We believe that education is more than just academic achievement - it's about developing the whole person, 
                fostering curiosity, and building the skills needed for lifelong learning and success.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div data-aos="fade-right" className="order-2 lg:order-1">
              <h2 className="font-playfair text-4xl font-bold text-gray-900 mb-6">Our Vision</h2>
              <p className="text-lg text-gray-600 mb-6">
                {settingsMap.vision || "To be recognized as a leading educational institution that sets the standard for academic excellence, innovative teaching, and character development in our community and beyond."}
              </p>
              <p className="text-lg text-gray-600">
                We envision a future where our graduates are confident, compassionate, and capable individuals who 
                make meaningful contributions to society and drive positive change in the world.
              </p>
            </div>
            <div data-aos="fade-left" className="order-1 lg:order-2">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Students collaborating" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>

          {/* Values Section */}
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="font-playfair text-4xl font-bold text-gray-900 mb-6">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
              These fundamental principles guide everything we do and shape the character of our school community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Heart,
                title: "Integrity",
                description: "We uphold the highest standards of honesty, transparency, and ethical behavior in all our interactions.",
                color: "bg-red-600"
              },
              {
                icon: Star,
                title: "Excellence",
                description: "We strive for excellence in all aspects of education, continually raising the bar for achievement.",
                color: "bg-yellow-500"
              },
              {
                icon: HandHeart,
                title: "Compassion",
                description: "We foster empathy, kindness, and understanding in our students and staff.",
                color: "bg-red-600"
              },
              {
                icon: Lightbulb,
                title: "Innovation",
                description: "We embrace new ideas, technologies, and teaching methods to enhance learning experiences.",
                color: "bg-yellow-500"
              }
            ].map((value, index) => (
              <div key={index} className="text-center p-6" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className={`w-16 h-16 ${value.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-playfair text-xl font-bold mb-3 text-gray-900">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="font-playfair text-4xl font-bold text-gray-900 mb-6">Our Leadership Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Meet the dedicated professionals who lead Robertson Education with passion and expertise.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Dr. Emily Robertson",
                role: "Principal & Founder",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80",
                bio: "With over 30 years in education, Dr. Robertson founded our school with a vision of transformative learning that prepares students for global success."
              },
              {
                name: "Mr. James Thompson",
                role: "Vice Principal", 
                image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80",
                bio: "Mr. Thompson brings 20 years of educational leadership experience and specializes in curriculum development and teacher training."
              },
              {
                name: "Ms. Sarah Williams",
                role: "Academic Director",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80",
                bio: "Ms. Williams oversees our academic programs and ensures alignment with international standards and best practices in education."
              }
            ].map((leader, index) => (
              <Card key={index} className="text-center shadow-lg" data-aos="fade-up" data-aos-delay={index * 100}>
                <CardContent className="p-8">
                  <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-6 overflow-hidden">
                    <img 
                      src={leader.image} 
                      alt={leader.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.name)}&size=400&background=dc2626&color=ffffff&bold=true`;
                      }}
                    />
                  </div>
                  <h3 className="font-playfair text-2xl font-bold text-gray-900 mb-2">{leader.name}</h3>
                  <p className="text-red-600 font-semibold mb-4">{leader.role}</p>
                  <p className="text-gray-600">{leader.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, Star, HandHeart, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  // Fetch dynamic school information
  const { data: settings = [] } = useQuery({
    queryKey: ["/api/school-info"],
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
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12 lg:mb-16" data-aos="fade-up">
            <h1 className="font-playfair text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 px-2 leading-tight">
              About {settingsMap.school_name || "Robertson Education"}
            </h1>
          </div>

          {/* About Robertson Education */}
          <div className="mb-8 sm:mb-12 md:mb-16 lg:mb-20" data-aos="fade-up">
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-xl mx-2 sm:mx-0">
              <CardContent className="p-4 xs:p-5 sm:p-6 md:p-8 lg:p-10 xl:p-12">
                <div className="max-w-4xl mx-auto">
                  <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed mb-3 sm:mb-4 md:mb-6">
                    Robertson Education Limited is one of the contemporary government approved co-educational institution in Obosi Anambra State, Nigeria. It aims to provide quality and affordable education at the secondary school level as well as adult skills education, addressing the economic needs of the community.
                  </p>
                  <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed">
                    It has been growing steadily in the past three years and is graduating its first WAEC pupils in July 2025 and has trained a lot of adults in computer awareness and software packages.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center mb-8 sm:mb-12 md:mb-16 lg:mb-20 mx-2 sm:mx-0">
            <div data-aos="fade-right" className="order-2 lg:order-1">
              <img 
                src="https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Modern classroom" 
                className="w-full h-48 xs:h-56 sm:h-64 md:h-80 lg:h-96 object-cover rounded-xl sm:rounded-2xl shadow-2xl"
              />
            </div>
            <div data-aos="fade-left" className="order-1 lg:order-2 px-2 sm:px-0">
              <h2 className="font-playfair text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">Our Mission</h2>
              <p className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-600 mb-3 sm:mb-4 md:mb-6 leading-relaxed">
                {settingsMap.mission || "To provide a transformative educational experience that develops critical thinking, creativity, and character in our students, preparing them to become responsible global citizens and leaders of tomorrow."}
              </p>
              <p className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                We believe that education is more than just academic achievement - it's about developing the whole person, 
                fostering curiosity, and building the skills needed for lifelong learning and success.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center mb-8 sm:mb-12 md:mb-16 lg:mb-20 mx-2 sm:mx-0">
            <div data-aos="fade-right" className="order-2 lg:order-1 px-2 sm:px-0">
              <h2 className="font-playfair text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">Our Vision</h2>
              <p className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-600 mb-3 sm:mb-4 md:mb-6 leading-relaxed">
                {settingsMap.vision || "To be recognized as a leading educational institution that sets the standard for academic excellence, innovative teaching, and character development in our community and beyond."}
              </p>
              <p className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                We envision a future where our graduates are confident, compassionate, and capable individuals who 
                make meaningful contributions to society and drive positive change in the world.
              </p>
            </div>
            <div data-aos="fade-left" className="order-1 lg:order-2">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Students collaborating" 
                className="w-full h-48 xs:h-56 sm:h-64 md:h-80 lg:h-96 object-cover rounded-xl sm:rounded-2xl shadow-2xl"
              />
            </div>
          </div>

          {/* Values Section */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16 px-2 sm:px-0" data-aos="fade-up">
            <h2 className="font-playfair text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">Our Core Values</h2>
            <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-12 leading-relaxed">
              These fundamental principles guide everything we do and shape the character of our school community.
            </p>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mx-2 sm:mx-0">
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
              <div key={index} className="text-center p-3 xs:p-4 sm:p-6" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className={`w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 ${value.color} rounded-full flex items-center justify-center mx-auto mb-2 xs:mb-3 sm:mb-4`}>
                  <value.icon className="h-5 w-5 xs:h-6 xs:w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="font-playfair text-base xs:text-lg sm:text-xl font-bold mb-1 xs:mb-2 sm:mb-3 text-gray-900">{value.title}</h3>
                <p className="text-xs xs:text-sm sm:text-base text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16 px-2 sm:px-0" data-aos="fade-up">
            <h2 className="font-playfair text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">Our Leadership Team</h2>
            <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Meet the dedicated professionals who lead Robertson Education with passion and expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mx-2 sm:mx-0">
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
                <CardContent className="p-3 xs:p-4 sm:p-6 md:p-8">
                  <div className="w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gray-200 mx-auto mb-3 xs:mb-4 md:mb-6 overflow-hidden">
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
                  <h3 className="font-playfair text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 xs:mb-2">{leader.name}</h3>
                  <p className="text-red-600 font-semibold mb-2 xs:mb-3 md:mb-4 text-xs xs:text-sm sm:text-base">{leader.role}</p>
                  <p className="text-gray-600 text-xs xs:text-sm sm:text-base leading-relaxed">{leader.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

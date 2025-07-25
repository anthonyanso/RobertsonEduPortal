import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    title: "Excellence in Education",
    subtitle: "Nurturing minds, building futures, and creating tomorrow's leaders through innovative learning experiences.",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080"
  },
  {
    title: "Innovative Learning",
    subtitle: "State-of-the-art facilities and cutting-edge technology to enhance the educational experience.",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080"
  },
  {
    title: "Character Development",
    subtitle: "Building strong moral foundations and leadership skills for lifelong success.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080"
  },
  {
    title: "Global Perspective",
    subtitle: "Preparing students for success in an interconnected world through international programs.",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080"
  }
];

interface HeroSliderProps {
  onApplyClick: () => void;
  onLearnMoreClick: () => void;
}

export default function HeroSlider({ onApplyClick, onLearnMoreClick }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden"
      style={{ minHeight: 'calc(100vh - 80px)' }}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{
          backgroundImage: `url(${slides[currentSlide].image})`,
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-900/80 to-red-800/60" />
      
      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center text-white max-w-4xl mx-auto py-8 sm:py-12">
          <h1 className="font-playfair text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-4 md:mb-6 animate-fade-in leading-tight">
            {slides[currentSlide].title.split(' ').map((word, index) => (
              <span key={index}>
                {word === 'Education' || word === 'Learning' || word === 'Development' || word === 'Perspective' ? (
                  <span className="text-yellow-400">{word}</span>
                ) : (
                  word
                )}
                {index < slides[currentSlide].title.split(' ').length - 1 ? ' ' : ''}
              </span>
            ))}
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto font-crimson animate-fade-in-delay leading-relaxed px-2">
            {slides[currentSlide].subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-fade-in-delay-2 px-4 sm:px-0">
            <button
              onClick={onApplyClick}
              className="bg-yellow-500 hover:bg-yellow-400 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full text-sm sm:text-base lg:text-lg font-semibold transition-all transform hover:scale-105 hover:shadow-lg w-full sm:w-auto min-h-[44px] sm:min-h-[48px]"
            >
              Apply Now
            </button>
            <button
              onClick={onLearnMoreClick}
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-red-600 px-6 py-3 sm:px-8 sm:py-4 rounded-full text-sm sm:text-base lg:text-lg font-semibold transition-all hover:shadow-lg w-full sm:w-auto min-h-[44px] sm:min-h-[48px]"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 md:left-6 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10 bg-black/20 hover:bg-black/40 rounded-full p-2 sm:p-3"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 md:right-6 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10 bg-black/20 hover:bg-black/40 rounded-full p-2 sm:p-3"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/80 hover:scale-110'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

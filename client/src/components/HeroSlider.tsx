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
    <section className="relative min-h-screen flex items-center overflow-hidden">
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
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center text-white max-w-4xl mx-auto">
          <h1 className="font-playfair text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
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
          
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto font-crimson animate-fade-in-delay">
            {slides[currentSlide].subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
            <button
              onClick={onApplyClick}
              className="bg-yellow-500 hover:bg-yellow-400 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 hover:shadow-lg"
            >
              Apply Now
            </button>
            <button
              onClick={onLearnMoreClick}
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-red-600 px-8 py-4 rounded-full text-lg font-semibold transition-all hover:shadow-lg"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white transition-colors z-10"
      >
        <ChevronLeft className="h-8 w-8" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white transition-colors z-10"
      >
        <ChevronRight className="h-8 w-8" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-white' : 'bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </section>
  );
}

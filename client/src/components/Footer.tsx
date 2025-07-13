import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail, Clock } from "lucide-react";
import logoUrl from "@assets/logo_1751823007371.png";

interface FooterProps {
  setCurrentPage: (page: string) => void;
}

export default function Footer({ setCurrentPage }: FooterProps) {
  const navigateTo = (page: string) => {
    setCurrentPage(page);
    window.location.hash = page;
  };

  return (
    <footer className="bg-gray-900 text-white py-8 sm:py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="mb-6 sm:mb-0">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
              <img src={logoUrl} alt="Robertson Education Logo" className="h-10 w-10 sm:h-12 sm:w-12 object-contain" />
              <div>
                <h3 className="font-playfair text-lg sm:text-xl font-bold">Robertson Education</h3>
                <p className="text-yellow-400 text-xs sm:text-sm">Excellence in Learning</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4 text-sm sm:text-base">
              Nurturing minds, building futures, and creating tomorrow's leaders through innovative learning experiences.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors">
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors">
                <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors">
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors">
                <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
            </div>
          </div>

          <div className="mb-6 sm:mb-0">
            <h4 className="font-playfair text-base sm:text-lg font-bold mb-3 sm:mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm sm:text-base">
              <li>
                <button 
                  onClick={() => navigateTo("home")}
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo("about")}
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo("admission")}
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  Admissions
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo("news")}
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  News
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo("contact")}
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          <div className="mb-6 sm:mb-0">
            <h4 className="font-playfair text-base sm:text-lg font-bold mb-3 sm:mb-4">Services</h4>
            <ul className="space-y-2 text-sm sm:text-base">
              <li>
                <button 
                  onClick={() => navigateTo("results")}
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  Result Checker
                </button>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  Online Learning
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  Student Portal
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  Parent Portal
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  Library
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-playfair text-base sm:text-lg font-bold mb-3 sm:mb-4">Contact Info</h4>
            <div className="space-y-2 text-gray-300 text-sm sm:text-base">
              <p className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>1. Theo Okeke's Close, Ozuda Market Area, Obosi Anambra State</span>
              </p>
              <p className="flex items-center">
                <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>+2348146373297</span>
              </p>
              <p className="flex items-center">
                <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>info@robertsoneducation.com</span>
              </p>
              <p className="flex items-center">
                <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>Mon-Fri: 8:00 AM - 5:00 PM</span>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
          <p className="text-gray-300 text-sm sm:text-base">
            &copy; 2024 Robertson Education. All rights reserved. | 
            <a href="#" className="text-yellow-400 hover:underline ml-1">Privacy Policy</a> | 
            <a href="#" className="text-yellow-400 hover:underline ml-1">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

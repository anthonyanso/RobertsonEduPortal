import { useState } from "react";
import { Menu, X } from "lucide-react";
import logoUrl from "@assets/logo_1751823007371.png";

interface NavigationProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export default function Navigation({ currentPage, setCurrentPage }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    window.location.hash = page;
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "news", label: "News" },
    { id: "admission", label: "Admission" },
    { id: "results", label: "Results" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
            <img src={logoUrl} alt="Robertson Education Logo" className="h-12 w-12 object-contain" />
            <div>
              <h1 className="font-playfair text-xl font-bold text-red-600">Robertson Education</h1>
              <p className="text-xs text-gray-600 font-crimson">Excellence in Learning</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`text-gray-700 hover:text-red-600 font-medium transition-colors ${
                  currentPage === item.id ? "text-red-600" : ""
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full transition-colors">
              Call Now
            </button>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`text-left text-gray-700 hover:text-red-600 font-medium transition-colors ${
                    currentPage === item.id ? "text-red-600" : ""
                  }`}
                >
                  {item.label}
                </button>
              ))}

            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

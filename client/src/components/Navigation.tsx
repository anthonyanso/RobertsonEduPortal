import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Menu, X } from "lucide-react";
import logoUrl from "@assets/logo_1751823007371.png";

interface NavigationProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export default function Navigation({ currentPage, setCurrentPage }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch settings to control navigation visibility
  const { data: settings = [] } = useQuery({
    queryKey: ["/api/admin/school-info"],
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds cache
  });

  const settingsMap = settings.reduce((acc: any, setting: any) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});

  const isResultCheckerEnabled = settingsMap.enable_result_checker === 'true';
  const isAdmissionsEnabled = settingsMap.enable_admissions === 'true';
  const isNewsSystemEnabled = settingsMap.enable_news_system === 'true';

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    window.location.hash = page;
    setIsMobileMenuOpen(false);
  };

  // Filter navigation items based on settings
  const allNavItems = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "news", label: "News", enabled: isNewsSystemEnabled },
    { id: "admission", label: "Admission", enabled: isAdmissionsEnabled },
    { id: "results", label: "Results", enabled: isResultCheckerEnabled },
    { id: "contact", label: "Contact" },
  ];

  const navItems = allNavItems.filter(item => 
    item.enabled === undefined || item.enabled === true
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <img src={logoUrl} alt="Robertson Education Logo" className="h-10 w-10 sm:h-12 sm:w-12 object-contain" />
            <div>
              <h1 className="font-playfair text-lg sm:text-xl font-bold text-red-600">Robertson Education</h1>
              <p className="text-xs text-gray-600 font-crimson hidden sm:block">Excellence in Learning</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`text-gray-700 hover:text-red-600 font-medium transition-colors text-sm lg:text-base ${
                  currentPage === item.id ? "text-red-600" : ""
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 lg:px-6 lg:py-2 rounded-full transition-colors text-sm lg:text-base"
              onClick={() => navigateTo('contact')}
            >
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
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`text-left text-gray-700 hover:text-red-600 font-medium transition-colors py-2 ${
                    currentPage === item.id ? "text-red-600" : ""
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full transition-colors font-medium mt-4"
                onClick={() => navigateTo('contact')}
              >
                Call Now
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

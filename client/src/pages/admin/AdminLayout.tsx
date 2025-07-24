import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Home, Users, GraduationCap, CreditCard, Newspaper, MessageSquare, Settings, ChevronDown, ChevronRight, UserPlus, UserCheck, Plus, FileText, BarChart3, Menu, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import Dashboard from "./Dashboard";
// @ts-ignore
import AddStudent from "./AddStudent";
// @ts-ignore
import ViewStudents from "./ViewStudents";
// @ts-ignore  
import CreateResult from "./CreateResult";
// @ts-ignore  
import ViewResults from "./ViewResults";
// @ts-ignore  
import ResultAnalytics from "./ResultAnalytics";
// @ts-ignore  
import CumulativeResults from "./CumulativeResults";
import ScratchCardManagement from "./ScratchCardManagement";
import NewsManagement from "./NewsManagement";
import SettingsPage from "./SettingsNew";
// @ts-ignore
import AdmissionManagement from "./AdmissionManagement";
import logoUrl from "@assets/logo_1751823007371.png";

interface AdminLayoutProps {
  onLogout: () => void;
}

export default function AdminLayout({ onLogout }: AdminLayoutProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [adminUser, setAdminUser] = useState<any>(null);
  const [studentsDropdownOpen, setStudentsDropdownOpen] = useState(false);
  const [resultsDropdownOpen, setResultsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Get admin user info from localStorage (in real app, this would be from API)
    const adminData = localStorage.getItem("adminUser");
    if (adminData) {
      setAdminUser(JSON.parse(adminData));
    }
  }, []);

  useEffect(() => {
    // Auto-open dropdowns when related tabs are active
    if (activeTab === "add-student" || activeTab === "view-students") {
      setStudentsDropdownOpen(true);
    }
    if (activeTab === "create-result" || activeTab === "view-results" || activeTab === "cumulative-results" || activeTab === "result-analytics") {
      setResultsDropdownOpen(true);
    }
  }, [activeTab]);

  const handleLogout = async () => {
    try {
      // Call admin logout endpoint to clear server session
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error("Error during admin logout:", error);
    }
    
    // Clear client-side storage
    localStorage.removeItem("isAdminAuthenticated");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminToken");
    
    // Clear all React Query cache to ensure fresh data on next login
    queryClient.clear();
    
    // Also logout from Replit Auth if user is logged in
    try {
      await fetch('/api/logout', {
        method: 'GET',
        credentials: 'include'
      });
    } catch (error) {
      console.error("Error during Replit logout:", error);
    }
    
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
    
    // Call parent logout handler to update app state
    onLogout();
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "students", label: "Students", icon: Users, hasDropdown: true },
    { id: "results", label: "Results", icon: GraduationCap, hasDropdown: true },
    { id: "scratch-cards", label: "Scratch Cards", icon: CreditCard },
    { id: "news", label: "News Management", icon: Newspaper },
    { id: "admissions", label: "Admissions", icon: UserPlus },

    { id: "settings", label: "Settings", icon: Settings },
  ];

  const studentsSubItems = [
    { id: "add-student", label: "Add Student", icon: UserPlus },
    { id: "view-students", label: "View Students", icon: UserCheck },
  ];

  const resultsSubItems = [
    { id: "create-result", label: "Create Result", icon: Plus },
    { id: "view-results", label: "View Results", icon: FileText },
    { id: "cumulative-results", label: "Cumulative Results", icon: BarChart3 },
    { id: "result-analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>
              <img src={logoUrl} alt="Robertson Education" className="h-8 w-8 object-contain" />
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-gray-900">Robertson Education</h1>
                <p className="text-xs sm:text-sm text-gray-500">Admin Panel</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {adminUser && (
                <div className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  Welcome, {adminUser.firstName} {adminUser.lastName}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-1 sm:space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-50 w-64 bg-white shadow-sm min-h-screen transform transition-transform duration-300 ease-in-out md:translate-x-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex justify-between items-center p-4 md:hidden">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="p-4">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                
                if (item.hasDropdown) {
                  const isStudents = item.id === "students";
                  const isResults = item.id === "results";
                  const dropdownOpen = isStudents ? studentsDropdownOpen : resultsDropdownOpen;
                  const setDropdownOpen = isStudents ? setStudentsDropdownOpen : setResultsDropdownOpen;
                  const subItems = isStudents ? studentsSubItems : resultsSubItems;
                  const isActive = isStudents ? 
                    (activeTab === "add-student" || activeTab === "view-students") :
                    (activeTab === "create-result" || activeTab === "view-results" || activeTab === "result-analytics");
                  
                  return (
                    <div key={item.id} className="space-y-1">
                      <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
                          isActive
                            ? "bg-red-50 text-red-600 border-l-4 border-red-600"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <ChevronDown className={`h-4 w-4 transition-transform ${
                          dropdownOpen ? "transform rotate-180" : ""
                        }`} />
                      </button>
                      
                      {dropdownOpen && (
                        <div className="ml-4 pl-4 border-l-2 border-gray-200 space-y-1">
                          {subItems.map((subItem) => {
                            const SubIcon = subItem.icon;
                            return (
                              <button
                                key={subItem.id}
                                onClick={() => setActiveTab(subItem.id)}
                                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-colors ${
                                  activeTab === subItem.id
                                    ? "bg-red-50 text-red-600"
                                    : "text-gray-600 hover:bg-gray-50"
                                }`}
                              >
                                <SubIcon className="h-4 w-4" />
                                <span className="text-sm">{subItem.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? "bg-red-50 text-red-600 border-l-4 border-red-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
              
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeTab === "dashboard" && <Dashboard onNavigate={setActiveTab} />}
          {activeTab === "add-student" && <AddStudent />}
          {activeTab === "view-students" && <ViewStudents />}
          
          {activeTab === "create-result" && <CreateResult />}
          {activeTab === "view-results" && <ViewResults />}
          {activeTab === "cumulative-results" && <CumulativeResults />}
          {activeTab === "result-analytics" && <ResultAnalytics />}
          {activeTab === "scratch-cards" && <ScratchCardManagement />}
          {activeTab === "news" && <NewsManagement />}
          {activeTab === "admissions" && <AdmissionManagement />}
          {activeTab === "settings" && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}
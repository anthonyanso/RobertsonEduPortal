import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Home, Users, GraduationCap, CreditCard, Newspaper, MessageSquare, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Dashboard from "./Dashboard";
import StudentRegistration from "./StudentRegistration";
import logoUrl from "@assets/logo_1751823007371.png";

interface AdminLayoutProps {
  onLogout: () => void;
}

export default function AdminLayout({ onLogout }: AdminLayoutProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [adminUser, setAdminUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get admin user info from localStorage (in real app, this would be from API)
    const adminData = localStorage.getItem("adminUser");
    if (adminData) {
      setAdminUser(JSON.parse(adminData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAdminAuthenticated");
    localStorage.removeItem("adminUser");
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
    onLogout();
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "students", label: "Students", icon: Users },
    { id: "results", label: "Results", icon: GraduationCap },
    { id: "scratch-cards", label: "Scratch Cards", icon: CreditCard },
    { id: "news", label: "News", icon: Newspaper },
    { id: "admissions", label: "Admissions", icon: Users },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img src={logoUrl} alt="Robertson Education" className="h-8 w-8 object-contain" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Robertson Education</h1>
                <p className="text-sm text-gray-500">Admin Panel</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {adminUser && (
                <div className="text-sm text-gray-600">
                  Welcome, {adminUser.firstName} {adminUser.lastName}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="p-4">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
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
        <main className="flex-1 p-8">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "students" && <StudentRegistration />}
          {activeTab === "results" && (
            <Card>
              <CardHeader>
                <CardTitle>Results Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Results management interface will be implemented here.</p>
              </CardContent>
            </Card>
          )}
          {activeTab === "scratch-cards" && (
            <Card>
              <CardHeader>
                <CardTitle>Scratch Cards Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Scratch cards management interface will be implemented here.</p>
              </CardContent>
            </Card>
          )}
          {activeTab === "news" && (
            <Card>
              <CardHeader>
                <CardTitle>News Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p>News management interface will be implemented here.</p>
              </CardContent>
            </Card>
          )}
          {activeTab === "admissions" && (
            <Card>
              <CardHeader>
                <CardTitle>Admissions Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Admissions management interface will be implemented here.</p>
              </CardContent>
            </Card>
          )}
          {activeTab === "messages" && (
            <Card>
              <CardHeader>
                <CardTitle>Messages Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Messages management interface will be implemented here.</p>
              </CardContent>
            </Card>
          )}
          {activeTab === "settings" && (
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Settings interface will be implemented here.</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
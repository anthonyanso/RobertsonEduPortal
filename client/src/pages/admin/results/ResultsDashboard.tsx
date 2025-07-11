import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Plus, 
  Search, 
  BarChart3, 
  Users, 
  GraduationCap,
  Calendar,
  Award,
  Settings
} from "lucide-react";

// Import sub-pages
import CreateResult from "./CreateResult";
import ViewResults from "./ViewResults";
import ResultAnalytics from "./ResultAnalytics";
import ResultSettings from "./ResultSettings";

export default function ResultsDashboard() {
  const [activeSection, setActiveSection] = useState<string>("dashboard");

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "create", label: "Create Result", icon: Plus },
    { id: "view", label: "View Results", icon: Search },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "create":
        return <CreateResult />;
      case "view":
        return <ViewResults />;
      case "analytics":
        return <ResultAnalytics />;
      case "settings":
        return <ResultSettings />;
      default:
        return <DashboardHome onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Results Management System</h1>
          <p className="text-gray-600">Comprehensive academic results management and reporting</p>
        </div>
        
        {/* Navigation Dropdown */}
        <div className="flex items-center space-x-4">
          <Select value={activeSection} onValueChange={setActiveSection}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              {menuItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  <div className="flex items-center space-x-2">
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <span>Results</span>
        <span>/</span>
        <span className="font-medium">
          {menuItems.find(item => item.id === activeSection)?.label || "Dashboard"}
        </span>
      </div>

      {/* Content Area */}
      <div className="min-h-[600px]">
        {renderContent()}
      </div>
    </div>
  );
}

// Dashboard Home Component
function DashboardHome({ onNavigate }: { onNavigate: (section: string) => void }) {
  const quickStats = [
    { label: "Total Results", value: "0", icon: FileText, color: "bg-blue-500" },
    { label: "This Term", value: "0", icon: Calendar, color: "bg-green-500" },
    { label: "Students", value: "0", icon: Users, color: "bg-purple-500" },
    { label: "Subjects", value: "20+", icon: GraduationCap, color: "bg-orange-500" },
  ];

  const quickActions = [
    {
      title: "Create New Result",
      description: "Add academic results for students",
      icon: Plus,
      action: () => onNavigate("create"),
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "View All Results",
      description: "Browse and manage existing results",
      icon: Search,
      action: () => onNavigate("view"),
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "Analytics Dashboard",
      description: "View performance analytics and reports",
      icon: BarChart3,
      action: () => onNavigate("analytics"),
      color: "bg-purple-600 hover:bg-purple-700"
    },
    {
      title: "System Settings",
      description: "Configure grading and result settings",
      icon: Settings,
      action: () => onNavigate("settings"),
      color: "bg-orange-600 hover:bg-orange-700"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={action.action}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center text-gray-500 py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No recent activity</p>
              <p className="text-sm">Results will appear here once you start creating them</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
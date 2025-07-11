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
  Settings,
  Calendar,
  Award,
  BookOpen,
  TrendingUp
} from "lucide-react";

// Import sub-components
import CreateResultForm from "./results/CreateResultForm";
import ViewResultsList from "./results/ViewResultsList";
import ResultAnalytics from "./results/ResultAnalytics";
import ResultSettings from "./results/ResultSettings";

type ActiveSection = "dashboard" | "create" | "view" | "analytics" | "settings";

export default function ResultsManagement() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("dashboard");

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, description: "Overview & Statistics" },
    { id: "create", label: "Create Result", icon: Plus, description: "Add New Student Result" },
    { id: "view", label: "View Results", icon: Search, description: "Browse & Manage Results" },
    { id: "analytics", label: "Analytics", icon: TrendingUp, description: "Performance Insights" },
    { id: "settings", label: "Settings", icon: Settings, description: "Configure System" },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "create":
        return <CreateResultForm />;
      case "view":
        return <ViewResultsList />;
      case "analytics":
        return <ResultAnalytics />;
      case "settings":
        return <ResultSettings />;
      default:
        return <ResultsDashboard onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Results Management System</h1>
          <p className="text-gray-600">Comprehensive secondary school academic result management</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={activeSection} onValueChange={(value) => setActiveSection(value as ActiveSection)}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              {navigationItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  <div className="flex items-center space-x-2">
                    <item.icon className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <span>Results Management</span>
        <span>/</span>
        <span className="font-medium">
          {navigationItems.find(item => item.id === activeSection)?.label || "Dashboard"}
        </span>
      </div>

      {/* Main Content */}
      <div className="min-h-[600px]">
        {renderContent()}
      </div>
    </div>
  );
}

// Dashboard Component
function ResultsDashboard({ onNavigate }: { onNavigate: (section: ActiveSection) => void }) {
  const quickStats = [
    { label: "Total Results", value: "0", icon: FileText, color: "bg-blue-500", description: "All academic results" },
    { label: "This Session", value: "0", icon: Calendar, color: "bg-green-500", description: "Current session results" },
    { label: "Students Assessed", value: "0", icon: Users, color: "bg-purple-500", description: "Students with results" },
    { label: "Subjects Offered", value: "15+", icon: BookOpen, color: "bg-orange-500", description: "Available subjects" },
  ];

  const quickActions = [
    {
      title: "Create New Result",
      description: "Add comprehensive result for a student",
      icon: Plus,
      action: () => onNavigate("create"),
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "View All Results",
      description: "Browse, search, and manage existing results",
      icon: Search,
      action: () => onNavigate("view"),
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "Performance Analytics",
      description: "View detailed performance insights and trends",
      icon: TrendingUp,
      action: () => onNavigate("analytics"),
      color: "bg-purple-600 hover:bg-purple-700"
    },
    {
      title: "System Settings",
      description: "Configure grading system and preferences",
      icon: Settings,
      action: () => onNavigate("settings"),
      color: "bg-orange-600 hover:bg-orange-700"
    }
  ];

  const recentActivities = [
    { action: "Result created", student: "No recent activity", time: "Start creating results to see activity here" },
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
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
                className="group p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
                onClick={action.action}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${action.color} group-hover:scale-105 transition-transform`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center text-gray-500 py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No recent activity</p>
              <p className="text-sm mt-2">Results and activities will appear here once you start creating them</p>
              <Button 
                onClick={() => onNavigate("create")} 
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Result
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Database</span>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">Result System</span>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Ready</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium">Analytics</span>
              </div>
              <Badge className="bg-purple-100 text-purple-800">Available</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
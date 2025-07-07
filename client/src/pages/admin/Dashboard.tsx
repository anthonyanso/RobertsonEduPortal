import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { 
  Users, 
  GraduationCap, 
  CreditCard, 
  Newspaper, 
  MessageSquare, 
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Calendar,
  Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export default function Admin({ onNavigate }: DashboardProps) {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Fetch admin data
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/admin/students"],
    retry: false,
  });

  const { data: results = [], isLoading: resultsLoading } = useQuery({
    queryKey: ["/api/admin/results"],
    retry: false,
  });

  const { data: scratchCards = [], isLoading: scratchCardsLoading } = useQuery({
    queryKey: ["/api/admin/scratch-cards"],
    retry: false,
  });

  const { data: news = [], isLoading: newsLoading } = useQuery({
    queryKey: ["/api/admin/news"],
    retry: false,
  });

  const { data: admissions = [], isLoading: admissionsLoading } = useQuery({
    queryKey: ["/api/admin/admissions"],
    retry: false,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/admin/contact-messages"],
    retry: false,
  });

  // Delete student mutation
  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId: number) => {
      return await apiRequest("DELETE", `/api/admin/students/${studentId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Student deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/students"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      });
    },
  });

  // Generate scratch cards mutation
  const generateCardsMutation = useMutation({
    mutationFn: async ({ count, expiryMonths }: { count: number; expiryMonths: number }) => {
      return await apiRequest("POST", "/api/admin/scratch-cards/generate", { count, expiryMonths });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Scratch cards generated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/scratch-cards"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to generate scratch cards",
        variant: "destructive",
      });
    },
  });

  // Generic delete mutation for other items
  const deleteMutation = useMutation({
    mutationFn: async ({ endpoint, id }: { endpoint: string; id: number }) => {
      return await apiRequest("DELETE", `${endpoint}/${id}`);
    },
    onSuccess: (_, { endpoint }) => {
      toast({
        title: "Success",
        description: "Item deleted successfully!",
      });
      // Invalidate relevant queries
      if (endpoint.includes("results")) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/results"] });
      } else if (endpoint.includes("scratch-cards")) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/scratch-cards"] });
      } else if (endpoint.includes("news")) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/news"] });
      } else if (endpoint.includes("admissions")) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/admissions"] });
      } else if (endpoint.includes("contact-messages")) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-messages"] });
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    },
  });

  const handleGenerateCards = () => {
    const count = prompt("How many scratch cards would you like to generate?", "10");
    const expiryMonths = prompt("Expiry period in months?", "3");
    
    if (count && expiryMonths) {
      generateCardsMutation.mutate({
        count: parseInt(count),
        expiryMonths: parseInt(expiryMonths),
      });
    }
  };

  const handleDelete = (endpoint: string, id: number, itemName: string) => {
    if (confirm(`Are you sure you want to delete this ${itemName}?`)) {
      deleteMutation.mutate({ endpoint, id });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'unread':
        return 'bg-blue-100 text-blue-800';
      case 'read':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-playfair text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.firstName || 'Admin'}</p>
          </div>
          <Button
            onClick={() => window.location.href = "/api/logout"}
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900">{students.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Results</p>
                  <p className="text-3xl font-bold text-gray-900">{results.length}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Scratch Cards</p>
                  <p className="text-3xl font-bold text-gray-900">{scratchCards.length}</p>
                </div>
                <CreditCard className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Messages</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {messages.filter((m: any) => m.status === 'unread').length}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="scratch-cards">Scratch Cards</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
            <TabsTrigger value="admissions">Admissions</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Students Management</CardTitle>
                <Button 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => onNavigate("add-student")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Student ID</th>
                        <th className="text-left p-4">Name</th>
                        <th className="text-left p-4">Grade</th>
                        <th className="text-left p-4">Email</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsLoading ? (
                        <tr>
                          <td colSpan={5} className="text-center p-8">Loading students...</td>
                        </tr>
                      ) : students.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center p-8 text-gray-500">No students found</td>
                        </tr>
                      ) : (
                        students.map((student: any) => (
                          <tr key={student.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">{student.studentId}</td>
                            <td className="p-4">{student.firstName} {student.lastName}</td>
                            <td className="p-4">{student.gradeLevel}</td>
                            <td className="p-4">{student.email}</td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => onNavigate("view-students")}
                                  title="Edit Student"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete ${student.firstName} ${student.lastName}?`)) {
                                      deleteStudentMutation.mutate(student.id);
                                    }
                                  }}
                                  title="Delete Student"
                                  disabled={deleteStudentMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Results Management</CardTitle>
                <Button 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    toast({
                      title: "Add Result",
                      description: "Result creation feature will be implemented",
                    });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Result
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Student ID</th>
                        <th className="text-left p-4">Session</th>
                        <th className="text-left p-4">Term</th>
                        <th className="text-left p-4">Average</th>
                        <th className="text-left p-4">GPA</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultsLoading ? (
                        <tr>
                          <td colSpan={6} className="text-center p-8">Loading results...</td>
                        </tr>
                      ) : results.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center p-8 text-gray-500">No results found</td>
                        </tr>
                      ) : (
                        results.map((result: any) => (
                          <tr key={result.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">{result.studentId}</td>
                            <td className="p-4">{result.session}</td>
                            <td className="p-4">{result.term}</td>
                            <td className="p-4">{result.average}%</td>
                            <td className="p-4">{result.gpa}/4.0</td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    toast({
                                      title: "View Result",
                                      description: `Viewing result for ${result.studentId}`,
                                    });
                                  }}
                                  title="View Result"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    toast({
                                      title: "Edit Result",
                                      description: "Result editing feature will be implemented",
                                    });
                                  }}
                                  title="Edit Result"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete this result?`)) {
                                      deleteMutation.mutate({ endpoint: "/api/admin/results", id: result.id });
                                    }
                                  }}
                                  title="Delete Result"
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scratch Cards Tab */}
          <TabsContent value="scratch-cards">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Scratch Cards Management</CardTitle>
                <Button 
                  onClick={handleGenerateCards}
                  disabled={generateCardsMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {generateCardsMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Generate Cards
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">PIN</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Usage</th>
                        <th className="text-left p-4">Expiry Date</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scratchCardsLoading ? (
                        <tr>
                          <td colSpan={5} className="text-center p-8">Loading scratch cards...</td>
                        </tr>
                      ) : scratchCards.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center p-8 text-gray-500">No scratch cards found</td>
                        </tr>
                      ) : (
                        scratchCards.map((card: any) => (
                          <tr key={card.id} className="border-b hover:bg-gray-50">
                            <td className="p-4 font-mono">{card.pin}</td>
                            <td className="p-4">
                              <Badge className={card.isUsed ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}>
                                {card.isUsed ? 'Used' : 'Active'}
                              </Badge>
                            </td>
                            <td className="p-4">{card.usageCount}/{card.usageLimit}</td>
                            <td className="p-4">{formatDate(card.expiryDate)}</td>
                            <td className="p-4">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDelete("/api/admin/scratch-cards", card.id, "scratch card")}
                                title="Delete Scratch Card"
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>News Management</CardTitle>
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add News
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Title</th>
                        <th className="text-left p-4">Category</th>
                        <th className="text-left p-4">Author</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Date</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newsLoading ? (
                        <tr>
                          <td colSpan={6} className="text-center p-8">Loading news...</td>
                        </tr>
                      ) : news.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center p-8 text-gray-500">No news articles found</td>
                        </tr>
                      ) : (
                        news.map((article: any) => (
                          <tr key={article.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">{article.title}</td>
                            <td className="p-4">{article.category}</td>
                            <td className="p-4">{article.author}</td>
                            <td className="p-4">
                              <Badge className={article.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                {article.published ? 'Published' : 'Draft'}
                              </Badge>
                            </td>
                            <td className="p-4">{formatDate(article.createdAt)}</td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleDelete("/api/admin/news", article.id, "news article")}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admissions Tab */}
          <TabsContent value="admissions">
            <Card>
              <CardHeader>
                <CardTitle>Admission Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Name</th>
                        <th className="text-left p-4">Grade Level</th>
                        <th className="text-left p-4">Email</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Date</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admissionsLoading ? (
                        <tr>
                          <td colSpan={6} className="text-center p-8">Loading applications...</td>
                        </tr>
                      ) : admissions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center p-8 text-gray-500">No admission applications found</td>
                        </tr>
                      ) : (
                        admissions.map((application: any) => (
                          <tr key={application.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">{application.firstName} {application.lastName}</td>
                            <td className="p-4">{application.gradeLevel}</td>
                            <td className="p-4">{application.guardianEmail}</td>
                            <td className="p-4">
                              <Badge className={getStatusBadgeColor(application.status)}>
                                {application.status || 'Pending'}
                              </Badge>
                            </td>
                            <td className="p-4">{formatDate(application.createdAt)}</td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleDelete("/api/admin/admissions", application.id, "admission application")}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Contact Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Name</th>
                        <th className="text-left p-4">Email</th>
                        <th className="text-left p-4">Subject</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Date</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messagesLoading ? (
                        <tr>
                          <td colSpan={6} className="text-center p-8">Loading messages...</td>
                        </tr>
                      ) : messages.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center p-8 text-gray-500">No contact messages found</td>
                        </tr>
                      ) : (
                        messages.map((message: any) => (
                          <tr key={message.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">{message.firstName} {message.lastName}</td>
                            <td className="p-4">{message.email}</td>
                            <td className="p-4">{message.subject}</td>
                            <td className="p-4">
                              <Badge className={getStatusBadgeColor(message.status)}>
                                {message.status || 'Unread'}
                              </Badge>
                            </td>
                            <td className="p-4">{formatDate(message.createdAt)}</td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleDelete("/api/admin/contact-messages", message.id, "contact message")}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

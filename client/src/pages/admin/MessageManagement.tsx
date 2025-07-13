import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Search, Eye, Trash2, Reply, Archive, Filter, Mail, Phone, User, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContactMessage {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  priority: 'low' | 'medium' | 'high';
  category: 'general' | 'admission' | 'academic' | 'complaint' | 'suggestion';
  submittedAt: string;
  repliedAt?: string;
  notes?: string;
}

export default function MessageManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

  // Mock data for demonstration
  const messages: ContactMessage[] = [
    {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@email.com",
      phone: "08123456789",
      subject: "Admission Inquiry",
      message: "I would like to know more about the admission process for JSS1. What are the requirements?",
      status: "new",
      priority: "high",
      category: "admission",
      submittedAt: "2025-01-12T10:30:00Z",
      notes: "Urgent inquiry"
    },
    {
      id: 2,
      firstName: "Mary",
      lastName: "Johnson",
      email: "mary.johnson@email.com",
      phone: "08123456790",
      subject: "Academic Performance",
      message: "I'm concerned about my child's performance in Mathematics. Can we schedule a meeting?",
      status: "replied",
      priority: "medium",
      category: "academic",
      submittedAt: "2025-01-10T14:15:00Z",
      repliedAt: "2025-01-11T09:00:00Z",
      notes: "Meeting scheduled for Jan 15"
    },
    {
      id: 3,
      firstName: "David",
      lastName: "Smith",
      email: "david.smith@email.com",
      phone: "08123456791",
      subject: "School Fees",
      message: "I need information about the payment plan for school fees.",
      status: "read",
      priority: "low",
      category: "general",
      submittedAt: "2025-01-08T16:45:00Z"
    },
    {
      id: 4,
      firstName: "Sarah",
      lastName: "Williams",
      email: "sarah.williams@email.com",
      phone: "08123456792",
      subject: "Transport Services",
      message: "Does the school provide transport services? If yes, what are the routes and fees?",
      status: "new",
      priority: "medium",
      category: "general",
      submittedAt: "2025-01-12T08:20:00Z"
    },
    {
      id: 5,
      firstName: "Michael",
      lastName: "Brown",
      email: "michael.brown@email.com",
      phone: "08123456793",
      subject: "Complaint about Facilities",
      message: "The library needs more books and better lighting. Students are struggling to study effectively.",
      status: "archived",
      priority: "high",
      category: "complaint",
      submittedAt: "2025-01-05T11:30:00Z",
      notes: "Forwarded to facilities management"
    }
  ];

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = `${msg.firstName} ${msg.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         msg.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || msg.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || msg.priority === priorityFilter;
    const matchesCategory = categoryFilter === "all" || msg.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-100 text-blue-800">New</Badge>;
      case 'read':
        return <Badge className="bg-yellow-100 text-yellow-800">Read</Badge>;
      case 'replied':
        return <Badge className="bg-green-100 text-green-800">Replied</Badge>;
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors = {
      general: "bg-gray-100 text-gray-800",
      admission: "bg-blue-100 text-blue-800",
      academic: "bg-purple-100 text-purple-800",
      complaint: "bg-red-100 text-red-800",
      suggestion: "bg-green-100 text-green-800"
    };
    return <Badge className={categoryColors[category as keyof typeof categoryColors] || "bg-gray-100 text-gray-800"}>
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </Badge>;
  };

  const updateMessageStatus = (id: number, status: ContactMessage['status']) => {
    toast({
      title: "Status Updated",
      description: `Message marked as ${status}`,
    });
  };

  const deleteMessage = (id: number) => {
    toast({
      title: "Message Deleted",
      description: "Message has been permanently deleted",
    });
  };

  const replyToMessage = (message: ContactMessage) => {
    // In real implementation, this would open email client or internal messaging system
    toast({
      title: "Reply Initiated",
      description: `Opening reply to ${message.email}`,
    });
  };

  const viewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsViewDialogOpen(true);
    // Mark as read if it's new
    if (message.status === 'new') {
      updateMessageStatus(message.id, 'read');
    }
  };

  const stats = {
    total: messages.length,
    new: messages.filter(m => m.status === 'new').length,
    read: messages.filter(m => m.status === 'read').length,
    replied: messages.filter(m => m.status === 'replied').length,
    archived: messages.filter(m => m.status === 'archived').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Message Management</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage contact messages and inquiries</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New</p>
                <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Read</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.read}</p>
              </div>
              <Eye className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Replied</p>
                <p className="text-2xl font-bold text-green-600">{stats.replied}</p>
              </div>
              <Reply className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Archived</p>
                <p className="text-2xl font-bold text-gray-600">{stats.archived}</p>
              </div>
              <Archive className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="admission">Admission</SelectItem>
            <SelectItem value="academic">Academic</SelectItem>
            <SelectItem value="complaint">Complaint</SelectItem>
            <SelectItem value="suggestion">Suggestion</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead className="hidden md:table-cell">Subject</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((message) => (
                  <TableRow key={message.id} className={message.status === 'new' ? 'bg-blue-50' : ''}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{message.firstName} {message.lastName}</div>
                        <div className="text-sm text-gray-500 md:hidden">{message.subject}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="max-w-xs truncate">{message.subject}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {getCategoryBadge(message.category)}
                    </TableCell>
                    <TableCell>{getPriorityBadge(message.priority)}</TableCell>
                    <TableCell>{getStatusBadge(message.status)}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {new Date(message.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewMessage(message)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => replyToMessage(message)}
                          className="hidden sm:inline-flex"
                        >
                          <Reply className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateMessageStatus(message.id, 'archived')}
                          className="hidden md:inline-flex"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMessage(message.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Message Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">From</span>
                  </div>
                  <p className="text-sm">{selectedMessage.firstName} {selectedMessage.lastName}</p>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <p className="text-sm">{selectedMessage.email}</p>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Phone</span>
                  </div>
                  <p className="text-sm">{selectedMessage.phone}</p>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Submitted</span>
                  </div>
                  <p className="text-sm">{new Date(selectedMessage.submittedAt).toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium">Subject</span>
                <p className="text-sm mt-1">{selectedMessage.subject}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <div>
                  <span className="text-sm font-medium">Category: </span>
                  {getCategoryBadge(selectedMessage.category)}
                </div>
                <div>
                  <span className="text-sm font-medium">Priority: </span>
                  {getPriorityBadge(selectedMessage.priority)}
                </div>
                <div>
                  <span className="text-sm font-medium">Status: </span>
                  {getStatusBadge(selectedMessage.status)}
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium">Message</span>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>
              
              {selectedMessage.notes && (
                <div>
                  <span className="text-sm font-medium">Notes</span>
                  <div className="mt-2 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm">{selectedMessage.notes}</p>
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 pt-4">
                <Button onClick={() => replyToMessage(selectedMessage)}>
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => updateMessageStatus(selectedMessage.id, 'archived')}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => deleteMessage(selectedMessage.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
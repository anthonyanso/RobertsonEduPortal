import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GraduationCap, Users, Settings, Eye, Edit, Trash2, Plus, Download, Search, Filter, CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const admissionSettingsSchema = z.object({
  isOpen: z.boolean(),
  startDate: z.string(),
  endDate: z.string(),
  maxApplications: z.number().min(1),
  applicationFee: z.number().min(0),
  requirements: z.string(),
  availableClasses: z.array(z.string()),
  contactEmail: z.string().email(),
  contactPhone: z.string(),
});

type AdmissionSettings = z.infer<typeof admissionSettingsSchema>;

interface AdmissionApplication {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  previousSchool: string;
  classApplying: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  notes?: string;
}

export default function AdmissionManagement() {
  const [activeTab, setActiveTab] = useState("applications");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<AdmissionApplication | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data for demonstration
  const applications: AdmissionApplication[] = [
    {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@email.com",
      phone: "08123456789",
      dateOfBirth: "2008-05-15",
      gender: "Male",
      address: "123 Main St, Lagos",
      guardianName: "Jane Doe",
      guardianPhone: "08123456790",
      guardianEmail: "jane.doe@email.com",
      previousSchool: "ABC Primary School",
      classApplying: "JSS 1",
      status: "pending",
      submittedAt: "2025-01-10T10:30:00Z",
      notes: "Good academic record"
    },
    {
      id: 2,
      firstName: "Mary",
      lastName: "Johnson",
      email: "mary.johnson@email.com",
      phone: "08123456791",
      dateOfBirth: "2007-08-20",
      gender: "Female",
      address: "456 Oak Ave, Abuja",
      guardianName: "Robert Johnson",
      guardianPhone: "08123456792",
      guardianEmail: "robert.johnson@email.com",
      previousSchool: "XYZ Secondary School",
      classApplying: "JSS 2",
      status: "approved",
      submittedAt: "2025-01-08T14:15:00Z",
      notes: "Excellent grades"
    }
  ];

  const admissionSettings: AdmissionSettings = {
    isOpen: true,
    startDate: "2025-01-01",
    endDate: "2025-03-31",
    maxApplications: 500,
    applicationFee: 5000,
    requirements: "Birth certificate, Previous school report, Passport photograph",
    availableClasses: ["JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2"],
    contactEmail: "info@robertsoneducation.com",
    contactPhone: "+2348146373297"
  };

  const form = useForm<AdmissionSettings>({
    resolver: zodResolver(admissionSettingsSchema),
    defaultValues: admissionSettings,
  });

  const filteredApplications = applications.filter(app => {
    const matchesSearch = `${app.firstName} ${app.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.classApplying.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateApplicationStatus = (id: number, status: 'approved' | 'rejected') => {
    // In real implementation, this would call the API
    toast({
      title: "Status Updated",
      description: `Application has been ${status}`,
    });
  };

  const onSubmitSettings = async (data: AdmissionSettings) => {
    try {
      // In real implementation, this would call the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Settings Updated",
        description: "Admission settings have been successfully updated",
      });
      setIsSettingsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const exportApplications = () => {
    // In real implementation, this would generate CSV/PDF
    toast({
      title: "Export Started",
      description: "Applications are being exported...",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <GraduationCap className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admission Management</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage student applications and admission settings</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            onClick={exportApplications}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Admission Settings</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitSettings)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="isOpen"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 md:col-span-2">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Admission Open</FormLabel>
                            <FormDescription>Enable or disable admission applications</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxApplications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Applications</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="applicationFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Application Fee (₦)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requirements</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="List admission requirements..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Settings</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold">{applications.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {applications.filter(app => app.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {applications.filter(app => app.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {applications.filter(app => app.status === 'rejected').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Class</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">
                      {application.firstName} {application.lastName}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{application.email}</TableCell>
                    <TableCell className="hidden sm:table-cell">{application.classApplying}</TableCell>
                    <TableCell>{getStatusBadge(application.status)}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {new Date(application.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedApplication(application);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {application.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateApplicationStatus(application.id, 'approved')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateApplicationStatus(application.id, 'rejected')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Application Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Student Name</Label>
                  <p className="text-sm">{selectedApplication.firstName} {selectedApplication.lastName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm">{selectedApplication.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm">{selectedApplication.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date of Birth</Label>
                  <p className="text-sm">{new Date(selectedApplication.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Gender</Label>
                  <p className="text-sm">{selectedApplication.gender}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Class Applying</Label>
                  <p className="text-sm">{selectedApplication.classApplying}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Address</Label>
                <p className="text-sm">{selectedApplication.address}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Guardian Name</Label>
                  <p className="text-sm">{selectedApplication.guardianName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Guardian Phone</Label>
                  <p className="text-sm">{selectedApplication.guardianPhone}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Guardian Email</Label>
                <p className="text-sm">{selectedApplication.guardianEmail}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Previous School</Label>
                <p className="text-sm">{selectedApplication.previousSchool}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
              </div>
              {selectedApplication.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="text-sm">{selectedApplication.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
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
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current admission settings from API
  const { data: currentSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['/api/admission-settings'],
    refetchOnWindowFocus: true,
    staleTime: 0,
    select: (data) => data || {
      isOpen: false,
      startDate: "2025-01-01",
      endDate: "2025-03-31",
      maxApplications: 500,
      applicationFee: 5000,
      requirements: "Birth certificate, Previous school report, Passport photograph",
      availableClasses: ["JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"],
      contactEmail: "info@robertsoneducation.com",
      contactPhone: "+2348146373297"
    }
  });

  const form = useForm<AdmissionSettings>({
    resolver: zodResolver(admissionSettingsSchema),
    defaultValues: currentSettings || {
      isOpen: true,
      startDate: "2025-01-01",
      endDate: "2025-03-31",
      maxApplications: 500,
      applicationFee: 5000,
      requirements: "Birth certificate, Previous school report, Passport photograph",
      availableClasses: ["JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"],
      contactEmail: "info@robertsoneducation.com",
      contactPhone: "+2348146373297"
    }
  });

  // Update form when current settings change
  useEffect(() => {
    if (currentSettings) {
      form.reset(currentSettings);
    }
  }, [currentSettings, form]);

  const onSubmitSettings = async (data: AdmissionSettings) => {
    try {
      const response = await fetch('/api/admin/school-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: 'admission_settings',
          value: JSON.stringify(data)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update admission settings');
      }

      // Invalidate the query cache to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/admission-settings'] });
      
      toast({
        title: "Settings Updated",
        description: "Admission settings have been successfully updated and published to the admission page",
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

  const publishAdmission = async () => {
    try {
      // Invalidate the query cache to refresh the data on the frontend
      queryClient.invalidateQueries({ queryKey: ['/api/admission-settings'] });
      
      toast({
        title: "Admission Published",
        description: "Admission details have been published to the website",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish admission details",
        variant: "destructive",
      });
    }
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
            onClick={publishAdmission}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <FileText className="h-4 w-4 mr-2" />
            Publish to Website
          </Button>
          <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Settings className="h-4 w-4 mr-2" />
                Edit Admission Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Admission Details Configuration</DialogTitle>
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
                    <Button type="submit">Save & Publish</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Current Settings Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Admission Status</p>
                <p className="text-lg font-bold text-green-600">
  {currentSettings?.isOpen ? "Open" : "Closed"}
                </p>
              </div>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                currentSettings?.isOpen ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {currentSettings?.isOpen ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Application Fee</p>
                <p className="text-lg font-bold">₦{currentSettings?.applicationFee?.toLocaleString() || '0'}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Classes</p>
                <p className="text-lg font-bold">{currentSettings?.availableClasses?.length || 0}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admission Details Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Admission Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">Application Period</h4>
                <p className="text-sm text-gray-600">
                  {currentSettings?.startDate ? new Date(currentSettings.startDate).toLocaleDateString() : 'N/A'} - {currentSettings?.endDate ? new Date(currentSettings.endDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Maximum Applications</h4>
                <p className="text-sm text-gray-600">{currentSettings?.maxApplications || 0} applications</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Contact Information</h4>
                <p className="text-sm text-gray-600">{currentSettings?.contactEmail || 'N/A'}</p>
                <p className="text-sm text-gray-600">{currentSettings?.contactPhone || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Available Classes</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {currentSettings?.availableClasses?.map((cls) => (
                    <Badge key={cls} variant="secondary" className="text-xs">
                      {cls}
                    </Badge>
                  )) || <span className="text-gray-500">No classes available</span>}
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Requirements</h4>
              <p className="text-sm text-gray-600 mt-1">{currentSettings?.requirements || 'No requirements specified'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
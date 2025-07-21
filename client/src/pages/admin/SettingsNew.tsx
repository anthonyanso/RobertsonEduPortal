import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Settings as SettingsIcon, School, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const schoolInfoSchema = z.object({
  schoolName: z.string().min(1, "School name is required"),
  address: z.string().min(1, "Address is required"),
  phone1: z.string().min(1, "Primary phone is required"),
  phone2: z.string().optional(),
  email: z.string().email("Invalid email address"),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  registrationNumber: z.string().min(1, "Registration number is required"),
  motto: z.string().optional(),
  vision: z.string().optional(),
  mission: z.string().optional(),
});

const systemSettingsSchema = z.object({
  enableResultChecker: z.boolean(),
  enableAdmissions: z.boolean(),
  enableNewsSystem: z.boolean(),
  maxScratchCardUsage: z.number().min(1).max(100),
  scratchCardExpiryDays: z.number().min(1).max(365),
  autoGenerateStudentId: z.boolean(),
  emailNotifications: z.boolean(),
  maintenanceMode: z.boolean(),
});

type SchoolInfoData = z.infer<typeof schoolInfoSchema>;
type SystemSettingsData = z.infer<typeof systemSettingsSchema>;

export default function SettingsNew() {
  const [activeTab, setActiveTab] = useState("school");
  const [isSaving, setIsSaving] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current settings from database
  const { data: currentSettings = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/school-info"],
  });

  // Create settings object from array
  const settingsMap = Array.isArray(currentSettings) ? currentSettings.reduce((acc: any, setting: any) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {}) : {};

  const schoolForm = useForm<SchoolInfoData>({
    resolver: zodResolver(schoolInfoSchema),
    defaultValues: {
      schoolName: "",
      address: "",
      phone1: "",
      phone2: "",
      email: "",
      website: "",
      registrationNumber: "",
      motto: "",
      vision: "",
      mission: "",
    },
  });

  const systemForm = useForm<SystemSettingsData>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      enableResultChecker: true,
      enableAdmissions: true,
      enableNewsSystem: true,
      maxScratchCardUsage: 30,
      scratchCardExpiryDays: 90,
      autoGenerateStudentId: true,
      emailNotifications: true,
      maintenanceMode: false,
    },
  });

  // Initialize forms only once when data loads
  useEffect(() => {
    if (Array.isArray(currentSettings) && currentSettings.length > 0 && !hasInitialized) {
      const schoolData = {
        schoolName: settingsMap.school_name || "Robertson Education",
        address: settingsMap.address || "1. Theo Okeke's Close, Ozuda Market Area, Obosi Anambra State",
        phone1: settingsMap.phone1 || "+2348146373297",
        phone2: settingsMap.phone2 || "+2347016774165",
        email: settingsMap.email || "info@robertsoneducation.com",
        website: settingsMap.website || "",
        registrationNumber: settingsMap.registration_number || "7779525",
        motto: settingsMap.motto || "Excellence in Education",
        vision: settingsMap.vision || "To be the leading educational institution in Nigeria",
        mission: settingsMap.mission || "To provide quality education and shape future leaders",
      };

      const systemData = {
        enableResultChecker: settingsMap.enable_result_checker === "true",
        enableAdmissions: settingsMap.enable_admissions === "true",
        enableNewsSystem: settingsMap.enable_news_system === "true",
        maxScratchCardUsage: parseInt(settingsMap.max_scratch_card_usage) || 30,
        scratchCardExpiryDays: parseInt(settingsMap.scratch_card_expiry_days) || 90,
        autoGenerateStudentId: settingsMap.auto_generate_student_id === "true",
        emailNotifications: settingsMap.email_notifications === "true",
        maintenanceMode: settingsMap.maintenance_mode === "true",
      };

      schoolForm.reset(schoolData);
      systemForm.reset(systemData);
      setHasInitialized(true);
    }
  }, [currentSettings, hasInitialized, settingsMap, schoolForm, systemForm]);

  const onSubmitSchoolInfo = async (data: SchoolInfoData) => {
    setIsSaving(true);
    try {
      const schoolInfoEntries = [
        { key: "school_name", value: data.schoolName },
        { key: "address", value: data.address },
        { key: "phone1", value: data.phone1 },
        { key: "phone2", value: data.phone2 || "" },
        { key: "email", value: data.email },
        { key: "website", value: data.website || "" },
        { key: "registration_number", value: data.registrationNumber },
        { key: "motto", value: data.motto || "" },
        { key: "vision", value: data.vision || "" },
        { key: "mission", value: data.mission || "" },
      ];

      for (const entry of schoolInfoEntries) {
        await apiRequest('POST', '/api/admin/school-info', entry);
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/admin/school-info"] });
      
      toast({
        title: "Success",
        description: "School information updated successfully!",
      });
    } catch (error) {
      console.error("Error updating school info:", error);
      toast({
        title: "Error",
        description: "Failed to update school information",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmitSystemSettings = async (data: SystemSettingsData) => {
    setIsSaving(true);
    try {
      const systemSettingsEntries = [
        { key: "enable_result_checker", value: data.enableResultChecker.toString() },
        { key: "enable_admissions", value: data.enableAdmissions.toString() },
        { key: "enable_news_system", value: data.enableNewsSystem.toString() },
        { key: "max_scratch_card_usage", value: data.maxScratchCardUsage.toString() },
        { key: "scratch_card_expiry_days", value: data.scratchCardExpiryDays.toString() },
        { key: "auto_generate_student_id", value: data.autoGenerateStudentId.toString() },
        { key: "email_notifications", value: data.emailNotifications.toString() },
        { key: "maintenance_mode", value: data.maintenanceMode.toString() },
      ];

      for (const entry of systemSettingsEntries) {
        await apiRequest('POST', '/api/admin/school-info', entry);
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/admin/school-info"] });
      
      toast({
        title: "Success",
        description: "System settings updated successfully!",
      });
    } catch (error) {
      console.error("Error updating system settings:", error);
      toast({
        title: "Error",
        description: "Failed to update system settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <SettingsIcon className="h-8 w-8 text-red-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings Management</h1>
          <p className="text-gray-600">Configure school information and system settings</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="school" className="flex items-center space-x-2">
            <School className="h-4 w-4" />
            <span>School Info</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center space-x-2">
            <SettingsIcon className="h-4 w-4" />
            <span>System</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="school" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>School Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...schoolForm}>
                <form onSubmit={schoolForm.handleSubmit(onSubmitSchoolInfo)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={schoolForm.control}
                      name="schoolName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>School Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter school name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={schoolForm.control}
                      name="registrationNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter registration number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={schoolForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address *</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter school address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={schoolForm.control}
                      name="phone1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Phone *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter primary phone" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={schoolForm.control}
                      name="phone2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Secondary Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter secondary phone" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={schoolForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={schoolForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter website URL" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={schoolForm.control}
                    name="motto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>School Motto</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter school motto" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={schoolForm.control}
                    name="vision"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vision Statement</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter vision statement" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={schoolForm.control}
                    name="mission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mission Statement</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter mission statement" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isSaving} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save School Information"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...systemForm}>
                <form onSubmit={systemForm.handleSubmit(onSubmitSystemSettings)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={systemForm.control}
                      name="enableResultChecker"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Result Checker</FormLabel>
                            <div className="text-sm text-gray-600">Allow students to check their results</div>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={systemForm.control}
                      name="enableAdmissions"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Admissions</FormLabel>
                            <div className="text-sm text-gray-600">Show admission information on website</div>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={systemForm.control}
                      name="enableNewsSystem"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable News System</FormLabel>
                            <div className="text-sm text-gray-600">Show news and updates on website</div>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={systemForm.control}
                      name="maintenanceMode"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Maintenance Mode</FormLabel>
                            <div className="text-sm text-gray-600">Temporarily disable public access</div>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={systemForm.control}
                      name="maxScratchCardUsage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Scratch Card Usage</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="100" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={systemForm.control}
                      name="scratchCardExpiryDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scratch Card Expiry (Days)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="365" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={isSaving} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save System Settings"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
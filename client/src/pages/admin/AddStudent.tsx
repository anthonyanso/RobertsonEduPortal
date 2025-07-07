import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { UserPlus, User } from "lucide-react";

// Form validation schema
const studentRegistrationSchema = z.object({
  studentId: z.string().min(3, "Student ID must be at least 3 characters"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender",
  }),
  gradeLevel: z.string().min(1, "Grade level is required"),
  parentGuardianName: z.string().min(2, "Parent/Guardian name is required"),
  parentGuardianPhone: z.string().min(10, "Parent/Guardian phone must be at least 10 digits"),
  parentGuardianEmail: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  address: z.string().min(10, "Address must be at least 10 characters"),
  medicalConditions: z.string().optional(),
  emergencyContact: z.string().min(10, "Emergency contact is required"),
  enrollmentDate: z.string().min(1, "Enrollment date is required"),
  status: z.enum(["active", "inactive", "graduated", "transferred"]).default("active"),
});

type StudentRegistrationData = z.infer<typeof studentRegistrationSchema>;

export default function AddStudent() {
  const { toast } = useToast();

  const form = useForm<StudentRegistrationData>({
    resolver: zodResolver(studentRegistrationSchema),
    defaultValues: {
      studentId: "",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      dateOfBirth: "",
      gender: "male",
      gradeLevel: "",
      parentGuardianName: "",
      parentGuardianPhone: "",
      parentGuardianEmail: "",
      address: "",
      medicalConditions: "",
      emergencyContact: "",
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: "active",
    },
  });

  // Register student mutation
  const registerStudentMutation = useMutation({
    mutationFn: async (data: StudentRegistrationData) => {
      const response = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/students'] });
      toast({
        title: "Student Registered",
        description: `${data.firstName} ${data.lastName} has been registered successfully.`,
      });
      form.reset({
        studentId: "",
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        dateOfBirth: "",
        gender: "male",
        gradeLevel: "",
        parentGuardianName: "",
        parentGuardianPhone: "",
        parentGuardianEmail: "",
        address: "",
        medicalConditions: "",
        emergencyContact: "",
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: "active",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: StudentRegistrationData) => {
    registerStudentMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <UserPlus className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Add Student</h1>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Register New Student
          </CardTitle>
          <CardDescription>
            Fill in the details to register a new student
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentId">Student ID *</Label>
                <Input
                  id="studentId"
                  placeholder="e.g., ST001"
                  {...form.register("studentId")}
                />
                {form.formState.errors.studentId && (
                  <p className="text-sm text-red-600">{form.formState.errors.studentId.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="gradeLevel">Grade Level *</Label>
                <Input
                  id="gradeLevel"
                  placeholder="e.g., Grade 10, JSS 1"
                  {...form.register("gradeLevel")}
                />
                {form.formState.errors.gradeLevel && (
                  <p className="text-sm text-red-600">{form.formState.errors.gradeLevel.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="Enter first name"
                  {...form.register("firstName")}
                />
                {form.formState.errors.firstName && (
                  <p className="text-sm text-red-600">{form.formState.errors.firstName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Enter last name"
                  {...form.register("lastName")}
                />
                {form.formState.errors.lastName && (
                  <p className="text-sm text-red-600">{form.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@example.com"
                  {...form.register("email")}
                />
              </div>

              <div>
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  placeholder="Enter phone number"
                  {...form.register("phoneNumber")}
                />
                {form.formState.errors.phoneNumber && (
                  <p className="text-sm text-red-600">{form.formState.errors.phoneNumber.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...form.register("dateOfBirth")}
                />
                {form.formState.errors.dateOfBirth && (
                  <p className="text-sm text-red-600">{form.formState.errors.dateOfBirth.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select onValueChange={(value) => form.setValue("gender", value as "male" | "female" | "other")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.gender && (
                  <p className="text-sm text-red-600">{form.formState.errors.gender.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                placeholder="Enter full address"
                {...form.register("address")}
                rows={3}
              />
              {form.formState.errors.address && (
                <p className="text-sm text-red-600">{form.formState.errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parentGuardianName">Parent/Guardian Name *</Label>
                <Input
                  id="parentGuardianName"
                  placeholder="Enter parent/guardian name"
                  {...form.register("parentGuardianName")}
                />
                {form.formState.errors.parentGuardianName && (
                  <p className="text-sm text-red-600">{form.formState.errors.parentGuardianName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="parentGuardianPhone">Parent/Guardian Phone *</Label>
                <Input
                  id="parentGuardianPhone"
                  placeholder="Enter parent/guardian phone"
                  {...form.register("parentGuardianPhone")}
                />
                {form.formState.errors.parentGuardianPhone && (
                  <p className="text-sm text-red-600">{form.formState.errors.parentGuardianPhone.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parentGuardianEmail">Parent/Guardian Email (Optional)</Label>
                <Input
                  id="parentGuardianEmail"
                  type="email"
                  placeholder="parent@example.com"
                  {...form.register("parentGuardianEmail")}
                />
              </div>

              <div>
                <Label htmlFor="emergencyContact">Emergency Contact *</Label>
                <Input
                  id="emergencyContact"
                  placeholder="Emergency contact number"
                  {...form.register("emergencyContact")}
                />
                {form.formState.errors.emergencyContact && (
                  <p className="text-sm text-red-600">{form.formState.errors.emergencyContact.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="enrollmentDate">Enrollment Date *</Label>
                <Input
                  id="enrollmentDate"
                  type="date"
                  {...form.register("enrollmentDate")}
                />
                {form.formState.errors.enrollmentDate && (
                  <p className="text-sm text-red-600">{form.formState.errors.enrollmentDate.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select onValueChange={(value) => form.setValue("status", value as "active" | "inactive" | "graduated" | "transferred")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="graduated">Graduated</SelectItem>
                    <SelectItem value="transferred">Transferred</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="medicalConditions">Medical Conditions (Optional)</Label>
              <Textarea
                id="medicalConditions"
                placeholder="Any medical conditions or allergies"
                {...form.register("medicalConditions")}
                rows={3}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={registerStudentMutation.isPending}
                className="flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                {registerStudentMutation.isPending ? "Registering..." : "Register Student"}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Reset Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
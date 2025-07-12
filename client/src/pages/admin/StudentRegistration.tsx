import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, UserPlus, Search, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

interface Student {
  id: number;
  studentId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  gradeLevel: string;
  parentGuardianName: string;
  parentGuardianPhone: string;
  parentGuardianEmail?: string;
  address: string;
  medicalConditions?: string;
  emergencyContact: string;
  enrollmentDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function StudentRegistration() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
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

  // Fetch students
  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ['/api/admin/students'],
  });

  // Register student mutation
  const registerStudentMutation = useMutation({
    mutationFn: async (data: StudentRegistrationData) => {
      const endpoint = editingStudent ? `/api/admin/students/${editingStudent.id}` : '/api/admin/students';
      const method = editingStudent ? 'PUT' : 'POST';
      
      // Exclude studentId from update data when editing
      const submitData = editingStudent ? 
        (({ studentId, ...rest }) => rest)(data) : 
        data;
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
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
        title: editingStudent ? "Student Updated" : "Student Registered",
        description: editingStudent 
          ? `${data.firstName} ${data.lastName} has been updated successfully.`
          : `${data.firstName} ${data.lastName} has been registered successfully.`,
      });
      form.reset();
      setEditingStudent(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete student mutation
  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId: number) => {
      const response = await fetch(`/api/admin/students/${studentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Delete failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/students'] });
      toast({
        title: "Student Deleted",
        description: "Student has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: StudentRegistrationData) => {
    registerStudentMutation.mutate(data);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    form.reset({
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email || "",
      phoneNumber: student.phoneNumber,
      dateOfBirth: student.dateOfBirth,
      gender: student.gender as "male" | "female" | "other",
      gradeLevel: student.gradeLevel,
      parentGuardianName: student.parentGuardianName,
      parentGuardianPhone: student.parentGuardianPhone,
      parentGuardianEmail: student.parentGuardianEmail || "",
      address: student.address,
      medicalConditions: student.medicalConditions || "",
      emergencyContact: student.emergencyContact,
      enrollmentDate: student.enrollmentDate,
      status: student.status as "active" | "inactive" | "graduated" | "transferred",
    });
  };

  const handleDelete = (studentId: number) => {
    if (confirm("Are you sure you want to delete this student?")) {
      deleteStudentMutation.mutate(studentId);
    }
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    form.reset();
  };

  const filteredStudents = students.filter(student =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      case "graduated": return "bg-blue-100 text-blue-800";
      case "transferred": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <UserPlus className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Student Registration</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {editingStudent ? "Edit Student" : "Register New Student"}
            </CardTitle>
            <CardDescription>
              {editingStudent ? "Update student information" : "Fill in the details to register a new student"}
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
                    disabled={editingStudent ? true : false}
                    className={editingStudent ? "bg-gray-50 text-gray-700 cursor-not-allowed" : ""}
                  />
                  {editingStudent && (
                    <p className="text-xs text-gray-500 mt-1">Student ID cannot be changed</p>
                  )}
                  {form.formState.errors.studentId && !editingStudent && (
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
                <Label htmlFor="medicalConditions">Medical Conditions/Allergies (Optional)</Label>
                <Textarea
                  id="medicalConditions"
                  placeholder="Any medical conditions or allergies"
                  {...form.register("medicalConditions")}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={registerStudentMutation.isPending}
                  className="flex-1"
                >
                  {registerStudentMutation.isPending
                    ? (editingStudent ? "Updating..." : "Registering...")
                    : (editingStudent ? "Update Student" : "Register Student")
                  }
                </Button>
                {editingStudent && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle>Registered Students</CardTitle>
            <CardDescription>
              Manage and view all registered students
            </CardDescription>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading students...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No students found</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredStudents.map((student) => (
                  <div key={student.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {student.firstName} {student.lastName}
                          </h3>
                          <Badge className={getStatusColor(student.status)}>
                            {student.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Student ID: {student.studentId} | Grade: {student.gradeLevel}
                        </p>
                        <p className="text-sm text-gray-600">
                          Phone: {student.phoneNumber}
                        </p>
                        <p className="text-sm text-gray-600">
                          Parent: {student.parentGuardianName} ({student.parentGuardianPhone})
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(student)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(student.id)}
                          disabled={deleteStudentMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
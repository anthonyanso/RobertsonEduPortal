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
import { queryClient } from "@/lib/queryClient";
import { UserCheck, Search, Edit, Trash2, ChevronLeft, ChevronRight, MoreHorizontal, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Form validation schema for editing
const studentEditSchema = z.object({
  studentId: z.string().min(3, "Student ID must be at least 3 characters"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
  gradeLevel: z.string().min(1, "Grade level is required"),
  parentGuardianName: z.string().min(2, "Parent/Guardian name is required"),
  parentGuardianPhone: z.string().min(10, "Parent/Guardian phone must be at least 10 digits"),
  parentGuardianEmail: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  address: z.string().min(10, "Address must be at least 10 characters"),
  medicalConditions: z.string().optional(),
  emergencyContact: z.string().min(10, "Emergency contact is required"),
  enrollmentDate: z.string().min(1, "Enrollment date is required"),
  status: z.enum(["active", "inactive", "graduated", "transferred"]),
});

type StudentEditData = z.infer<typeof studentEditSchema>;

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

export default function ViewStudents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50); // Show 50 students per page for performance
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<StudentEditData>({
    resolver: zodResolver(studentEditSchema),
  });

  // Fetch students
  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ['/api/admin/students'],
  });

  // Update student mutation
  const updateStudentMutation = useMutation({
    mutationFn: async (data: StudentEditData) => {
      if (!editingStudent) throw new Error("No student selected for editing");
      
      const response = await fetch(`/api/admin/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Update failed');
      }
      
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/students'] });
      toast({
        title: "Student Updated",
        description: `${data.firstName} ${data.lastName} has been updated successfully.`,
      });
      setEditingStudent(null);
      setEditDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
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

  // Filter and paginate students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      (student.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.studentId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    const matchesGrade = gradeFilter === "all" || student.gradeLevel.toLowerCase().includes(gradeFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesGrade;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  // Get unique grade levels for filter
  const uniqueGrades = Array.from(new Set(students.map(s => s.gradeLevel))).sort();

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
    setEditDialogOpen(true);
  };

  const handleView = (student: Student) => {
    setViewingStudent(student);
    setViewDialogOpen(true);
  };

  const handleDelete = (studentId: number) => {
    deleteStudentMutation.mutate(studentId);
  };

  const onSubmitEdit = (data: StudentEditData) => {
    updateStudentMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      case "graduated": return "bg-blue-100 text-blue-800";
      case "transferred": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <UserCheck className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">View Students</h1>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Students</CardTitle>
          <CardDescription>
            Find students by name, ID, or email. Use filters to narrow down results.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="graduated">Graduated</SelectItem>
                <SelectItem value="transferred">Transferred</SelectItem>
              </SelectContent>
            </Select>

            <Select value={gradeFilter} onValueChange={(value) => {
              setGradeFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {uniqueGrades.map(grade => (
                  <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Total: {filteredStudents.length}</span>
              {searchTerm && <span>| Filtered: {filteredStudents.length}</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students List</CardTitle>
          <CardDescription>
            Manage all registered students. Click on actions to edit, view details, or delete.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {studentsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Enrollment Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No students found. Try adjusting your search or filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.studentId}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{student.firstName} {student.lastName}</div>
                              {student.email && (
                                <div className="text-sm text-gray-500">{student.email}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{student.gradeLevel}</TableCell>
                          <TableCell>{student.phoneNumber}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(student.status)}>
                              {student.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(student.enrollmentDate)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleView(student)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(student)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Student</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete {student.firstName} {student.lastName}? 
                                        This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(student.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-4">
                  <div className="text-sm text-gray-700">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Student Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>
              Complete information for {viewingStudent?.firstName} {viewingStudent?.lastName}
            </DialogDescription>
          </DialogHeader>
          {viewingStudent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Student ID</Label>
                <p className="text-sm">{viewingStudent.studentId}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                <p className="text-sm">{viewingStudent.firstName} {viewingStudent.lastName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Email</Label>
                <p className="text-sm">{viewingStudent.email || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Phone Number</Label>
                <p className="text-sm">{viewingStudent.phoneNumber}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Date of Birth</Label>
                <p className="text-sm">{formatDate(viewingStudent.dateOfBirth)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Gender</Label>
                <p className="text-sm capitalize">{viewingStudent.gender}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Grade Level</Label>
                <p className="text-sm">{viewingStudent.gradeLevel}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Status</Label>
                <Badge className={getStatusColor(viewingStudent.status)}>
                  {viewingStudent.status}
                </Badge>
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-500">Address</Label>
                <p className="text-sm">{viewingStudent.address}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Parent/Guardian</Label>
                <p className="text-sm">{viewingStudent.parentGuardianName}</p>
                <p className="text-sm text-gray-600">{viewingStudent.parentGuardianPhone}</p>
                {viewingStudent.parentGuardianEmail && (
                  <p className="text-sm text-gray-600">{viewingStudent.parentGuardianEmail}</p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Emergency Contact</Label>
                <p className="text-sm">{viewingStudent.emergencyContact}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Enrollment Date</Label>
                <p className="text-sm">{formatDate(viewingStudent.enrollmentDate)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Registration Date</Label>
                <p className="text-sm">{formatDate(viewingStudent.createdAt)}</p>
              </div>
              {viewingStudent.medicalConditions && (
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Medical Conditions</Label>
                  <p className="text-sm">{viewingStudent.medicalConditions}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update information for {editingStudent?.firstName} {editingStudent?.lastName}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-studentId">Student ID *</Label>
                <Input
                  id="edit-studentId"
                  {...form.register("studentId")}
                />
                {form.formState.errors.studentId && (
                  <p className="text-sm text-red-600">{form.formState.errors.studentId.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-gradeLevel">Grade Level *</Label>
                <Input
                  id="edit-gradeLevel"
                  {...form.register("gradeLevel")}
                />
                {form.formState.errors.gradeLevel && (
                  <p className="text-sm text-red-600">{form.formState.errors.gradeLevel.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-firstName">First Name *</Label>
                <Input
                  id="edit-firstName"
                  {...form.register("firstName")}
                />
                {form.formState.errors.firstName && (
                  <p className="text-sm text-red-600">{form.formState.errors.firstName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-lastName">Last Name *</Label>
                <Input
                  id="edit-lastName"
                  {...form.register("lastName")}
                />
                {form.formState.errors.lastName && (
                  <p className="text-sm text-red-600">{form.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  {...form.register("email")}
                />
              </div>

              <div>
                <Label htmlFor="edit-phoneNumber">Phone Number *</Label>
                <Input
                  id="edit-phoneNumber"
                  {...form.register("phoneNumber")}
                />
                {form.formState.errors.phoneNumber && (
                  <p className="text-sm text-red-600">{form.formState.errors.phoneNumber.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-dateOfBirth">Date of Birth *</Label>
                <Input
                  id="edit-dateOfBirth"
                  type="date"
                  {...form.register("dateOfBirth")}
                />
                {form.formState.errors.dateOfBirth && (
                  <p className="text-sm text-red-600">{form.formState.errors.dateOfBirth.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-gender">Gender *</Label>
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
              </div>
            </div>

            <div>
              <Label htmlFor="edit-address">Address *</Label>
              <Textarea
                id="edit-address"
                {...form.register("address")}
                rows={3}
              />
              {form.formState.errors.address && (
                <p className="text-sm text-red-600">{form.formState.errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-parentGuardianName">Parent/Guardian Name *</Label>
                <Input
                  id="edit-parentGuardianName"
                  {...form.register("parentGuardianName")}
                />
                {form.formState.errors.parentGuardianName && (
                  <p className="text-sm text-red-600">{form.formState.errors.parentGuardianName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-parentGuardianPhone">Parent/Guardian Phone *</Label>
                <Input
                  id="edit-parentGuardianPhone"
                  {...form.register("parentGuardianPhone")}
                />
                {form.formState.errors.parentGuardianPhone && (
                  <p className="text-sm text-red-600">{form.formState.errors.parentGuardianPhone.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-parentGuardianEmail">Parent/Guardian Email</Label>
                <Input
                  id="edit-parentGuardianEmail"
                  type="email"
                  {...form.register("parentGuardianEmail")}
                />
              </div>

              <div>
                <Label htmlFor="edit-emergencyContact">Emergency Contact *</Label>
                <Input
                  id="edit-emergencyContact"
                  {...form.register("emergencyContact")}
                />
                {form.formState.errors.emergencyContact && (
                  <p className="text-sm text-red-600">{form.formState.errors.emergencyContact.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-enrollmentDate">Enrollment Date *</Label>
                <Input
                  id="edit-enrollmentDate"
                  type="date"
                  {...form.register("enrollmentDate")}
                />
                {form.formState.errors.enrollmentDate && (
                  <p className="text-sm text-red-600">{form.formState.errors.enrollmentDate.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-status">Status</Label>
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
              <Label htmlFor="edit-medicalConditions">Medical Conditions</Label>
              <Textarea
                id="edit-medicalConditions"
                {...form.register("medicalConditions")}
                rows={3}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={updateStudentMutation.isPending}
              >
                {updateStudentMutation.isPending ? "Updating..." : "Update Student"}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false);
                  setEditingStudent(null);
                  form.reset();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
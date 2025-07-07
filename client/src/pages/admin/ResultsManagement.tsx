import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Plus,
  GraduationCap,
  Calculator,
  Award,
  BookOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Swal from 'sweetalert2';

// Form schemas
const subjectSchema = z.object({
  subject: z.string().min(1, "Subject name is required"),
  score: z.number().min(0).max(100),
  grade: z.string().min(1, "Grade is required"),
  remark: z.string().min(1, "Remark is required")
});

const resultFormSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  session: z.string().min(1, "Session is required"),
  term: z.string().min(1, "Term is required"),
  subjects: z.array(subjectSchema).min(1, "At least one subject is required"),
  totalScore: z.number().optional(),
  average: z.number().optional(),
  gpa: z.number().optional(),
  position: z.number().optional(),
  remarks: z.string().optional()
});

type ResultFormData = z.infer<typeof resultFormSchema>;

const gradeOptions = ["A", "B", "C", "D", "E", "F"];
const remarkOptions = ["Excellent", "Very Good", "Good", "Fair", "Poor", "Fail"];
const sessionOptions = ["2023/2024", "2024/2025", "2025/2026"];
const termOptions = ["First Term", "Second Term", "Third Term"];

const commonSubjects = [
  "Mathematics",
  "English Language",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Geography",
  "History",
  "Literature",
  "Government",
  "Computer Science",
  "Agricultural Science",
  "Civic Education",
  "French",
  "Christian Religious Studies",
  "Islamic Religious Studies"
];

export default function ResultsManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [termFilter, setTermFilter] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch results
  const { data: results = [], isLoading: resultsLoading } = useQuery({
    queryKey: ["/api/admin/results"],
    retry: false,
  });

  // Fetch students for dropdown
  const { data: students = [] } = useQuery({
    queryKey: ["/api/admin/students"],
    retry: false,
  });

  // Create result mutation
  const createResultMutation = useMutation({
    mutationFn: async (data: ResultFormData) => {
      return await apiRequest("POST", "/api/admin/results", data);
    },
    onSuccess: () => {
      Swal.fire({
        title: 'Success!',
        text: 'Result has been created successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/results"] });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to create result. Please try again.',
        icon: 'error',
        confirmButtonColor: '#dc2626'
      });
    },
  });

  // Update result mutation
  const updateResultMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ResultFormData> }) => {
      return await apiRequest("PUT", `/api/admin/results/${id}`, data);
    },
    onSuccess: () => {
      Swal.fire({
        title: 'Updated!',
        text: 'Result has been updated successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/results"] });
      setIsEditDialogOpen(false);
    },
    onError: () => {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update result. Please try again.',
        icon: 'error',
        confirmButtonColor: '#dc2626'
      });
    },
  });

  // Delete result mutation
  const deleteResultMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/results/${id}`);
    },
    onSuccess: () => {
      Swal.fire({
        title: 'Deleted!',
        text: 'Result has been deleted successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/results"] });
    },
    onError: () => {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete result. Please try again.',
        icon: 'error',
        confirmButtonColor: '#dc2626'
      });
    },
  });

  // Form setup
  const form = useForm<ResultFormData>({
    resolver: zodResolver(resultFormSchema),
    defaultValues: {
      studentId: "",
      session: "",
      term: "",
      subjects: [{ subject: "", score: 0, grade: "", remark: "" }],
      totalScore: 0,
      average: 0,
      gpa: 0,
      position: undefined,
      remarks: ""
    }
  });

  // Calculate totals automatically
  const calculateTotals = (subjects: any[]) => {
    const validSubjects = subjects.filter(s => s.score > 0);
    const totalScore = validSubjects.reduce((sum, subject) => sum + subject.score, 0);
    const average = validSubjects.length > 0 ? totalScore / validSubjects.length : 0;
    const gpa = average >= 70 ? 4.0 : average >= 60 ? 3.0 : average >= 50 ? 2.0 : average >= 40 ? 1.0 : 0.0;
    
    return { totalScore, average: Number(average.toFixed(2)), gpa };
  };

  // Grade calculation
  const calculateGrade = (score: number): string => {
    if (score >= 70) return "A";
    if (score >= 60) return "B";
    if (score >= 50) return "C";
    if (score >= 40) return "D";
    if (score >= 30) return "E";
    return "F";
  };

  // Remark calculation
  const calculateRemark = (score: number): string => {
    if (score >= 70) return "Excellent";
    if (score >= 60) return "Very Good";
    if (score >= 50) return "Good";
    if (score >= 40) return "Fair";
    if (score >= 30) return "Poor";
    return "Fail";
  };

  // Add subject
  const addSubject = () => {
    const subjects = form.getValues("subjects");
    form.setValue("subjects", [...subjects, { subject: "", score: 0, grade: "", remark: "" }]);
  };

  // Remove subject
  const removeSubject = (index: number) => {
    const subjects = form.getValues("subjects");
    if (subjects.length > 1) {
      form.setValue("subjects", subjects.filter((_, i) => i !== index));
    }
  };

  // Handle form submission
  const onSubmit = (data: ResultFormData) => {
    // Auto-calculate grades and remarks
    const processedSubjects = data.subjects.map(subject => ({
      ...subject,
      grade: calculateGrade(subject.score),
      remark: calculateRemark(subject.score)
    }));

    const { totalScore, average, gpa } = calculateTotals(processedSubjects);

    const finalData = {
      ...data,
      subjects: processedSubjects,
      totalScore,
      average,
      gpa
    };

    if (selectedResult) {
      updateResultMutation.mutate({ id: selectedResult.id, data: finalData });
    } else {
      createResultMutation.mutate(finalData);
    }
  };

  // Handle view result
  const handleView = (result: any) => {
    setSelectedResult(result);
    setIsViewDialogOpen(true);
  };

  // Handle edit result
  const handleEdit = (result: any) => {
    setSelectedResult(result);
    form.reset({
      studentId: result.studentId,
      session: result.session,
      term: result.term,
      subjects: result.subjects || [{ subject: "", score: 0, grade: "", remark: "" }],
      totalScore: result.totalScore,
      average: result.average,
      gpa: result.gpa,
      position: result.position,
      remarks: result.remarks || ""
    });
    setIsEditDialogOpen(true);
  };

  // Handle delete result
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Delete Result?',
      text: 'Are you sure you want to delete this result? This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete result!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      deleteResultMutation.mutate(id);
    }
  };

  // Filter results
  const filteredResults = results.filter((result: any) => {
    const matchesSearch = result.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSession = !sessionFilter || result.session === sessionFilter;
    const matchesTerm = !termFilter || result.term === termFilter;
    return matchesSearch && matchesSession && matchesTerm;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Results Management</h1>
          <p className="text-gray-600">Manage student academic results and performance</p>
        </div>
        <Button 
          onClick={() => {
            form.reset();
            setSelectedResult(null);
            setIsAddDialogOpen(true);
          }}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Result
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search by Student ID</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Enter student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Filter by Session</label>
              <Select value={sessionFilter} onValueChange={setSessionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All sessions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All sessions</SelectItem>
                  {sessionOptions.map(session => (
                    <SelectItem key={session} value={session}>{session}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Filter by Term</label>
              <Select value={termFilter} onValueChange={setTermFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All terms</SelectItem>
                  {termOptions.map(term => (
                    <SelectItem key={term} value={term}>{term}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            All Results ({filteredResults.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>Average</TableHead>
                  <TableHead>GPA</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resultsLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                        <span className="ml-2">Loading results...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No results found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((result: any) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">{result.studentId}</TableCell>
                      <TableCell>{result.session}</TableCell>
                      <TableCell>{result.term}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {result.subjects?.length || 0} subjects
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calculator className="h-4 w-4 text-gray-400" />
                          {result.average}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-gray-400" />
                          {result.gpa}/4.0
                        </div>
                      </TableCell>
                      <TableCell>
                        {result.position ? `#${result.position}` : "-"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(result)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(result)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(result.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Result Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
          setSelectedResult(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedResult ? 'Edit Result' : 'Add New Result'}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student ID</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select student" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {students.map((student: any) => (
                            <SelectItem key={student.id} value={student.studentId}>
                              {student.studentId} - {student.firstName} {student.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="session"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select session" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sessionOptions.map(session => (
                            <SelectItem key={session} value={session}>{session}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="term"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Term</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select term" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {termOptions.map(term => (
                            <SelectItem key={term} value={term}>{term}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Subjects */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium">Subjects & Scores</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSubject}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subject
                  </Button>
                </div>

                <div className="space-y-4">
                  {form.watch("subjects").map((_, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                      <FormField
                        control={form.control}
                        name={`subjects.${index}.subject`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select subject" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {commonSubjects.map(subject => (
                                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`subjects.${index}.score`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Score</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                onBlur={() => {
                                  const score = field.value;
                                  form.setValue(`subjects.${index}.grade`, calculateGrade(score));
                                  form.setValue(`subjects.${index}.remark`, calculateRemark(score));
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`subjects.${index}.grade`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Grade</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly className="bg-gray-50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`subjects.${index}.remark`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Remark</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly className="bg-gray-50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-end">
                        {form.watch("subjects").length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeSubject(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Position (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 1, 2, 3..."
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Calculated Statistics</label>
                  <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                    <p className="text-sm">Total Score: <span className="font-medium">{calculateTotals(form.watch("subjects")).totalScore}</span></p>
                    <p className="text-sm">Average: <span className="font-medium">{calculateTotals(form.watch("subjects")).average}%</span></p>
                    <p className="text-sm">GPA: <span className="font-medium">{calculateTotals(form.watch("subjects")).gpa}/4.0</span></p>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>General Remarks (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter general remarks about the student's performance..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setIsEditDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createResultMutation.isPending || updateResultMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {createResultMutation.isPending || updateResultMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : null}
                  {selectedResult ? 'Update Result' : 'Create Result'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Result Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Result Details</DialogTitle>
          </DialogHeader>

          {selectedResult && (
            <div className="space-y-6">
              {/* Header Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-600">Student ID</label>
                  <p className="font-semibold">{selectedResult.studentId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Session</label>
                  <p className="font-semibold">{selectedResult.session}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Term</label>
                  <p className="font-semibold">{selectedResult.term}</p>
                </div>
              </div>

              {/* Subjects Table */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Subject Results
                </h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Remark</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedResult.subjects?.map((subject: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{subject.subject}</TableCell>
                          <TableCell>{subject.score}</TableCell>
                          <TableCell>
                            <Badge variant={subject.grade === 'F' ? 'destructive' : 'default'}>
                              {subject.grade}
                            </Badge>
                          </TableCell>
                          <TableCell>{subject.remark}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Summary Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Total Score</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{selectedResult.totalScore}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Average</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">{selectedResult.average}%</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-600">GPA</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">{selectedResult.gpa}/4.0</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-600">Position</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-900">
                    {selectedResult.position ? `#${selectedResult.position}` : "N/A"}
                  </p>
                </div>
              </div>

              {/* General Remarks */}
              {selectedResult.remarks && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">General Remarks</h3>
                  <p className="p-4 bg-gray-50 rounded-lg">{selectedResult.remarks}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
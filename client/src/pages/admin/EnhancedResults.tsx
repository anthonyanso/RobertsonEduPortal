import { useState, useEffect } from "react";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Edit, Trash2, Eye, X, FileText, Download, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Swal from 'sweetalert2';
import ResultTemplate from "@/components/ResultTemplate";

// Enhanced result schema for comprehensive academic reporting
const resultFormSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  session: z.string().min(1, "Session is required"),
  term: z.string().min(1, "Term is required"),
  subjects: z.array(z.object({
    subject: z.string().min(1, "Subject is required"),
    score: z.number().min(0).max(100),
    grade: z.string(),
    remark: z.string()
  })),
  totalScore: z.number().optional(),
  average: z.number().optional(),
  gpa: z.number().optional(),
  position: z.number().optional(),
  outOf: z.number().optional(), // Total number of students in class
  classTeacher: z.string().optional(),
  principalComment: z.string().optional(),
  nextTermBegins: z.string().optional(),
  attendance: z.object({
    present: z.number().optional(),
    absent: z.number().optional(),
    total: z.number().optional()
  }).optional(),
  conduct: z.object({
    punctuality: z.string().optional(),
    neatness: z.string().optional(),
    politeness: z.string().optional(),
    honesty: z.string().optional(),
    leadership: z.string().optional(),
    sportsmanship: z.string().optional()
  }).optional(),
  remarks: z.string().optional()
});

type ResultFormData = z.infer<typeof resultFormSchema>;

const sessionOptions = ["2023/2024", "2024/2025", "2025/2026"];
const termOptions = ["First Term", "Second Term", "Third Term"];
const commonSubjects = [
  "Mathematics", "English Language", "Physics", "Chemistry", "Biology",
  "Geography", "History", "Economics", "Literature", "Government",
  "Agricultural Science", "Computer Science", "Further Mathematics",
  "Technical Drawing", "French", "Civic Education", "Fine Arts",
  "Music", "Physical Education", "Religious Studies"
];

const conductOptions = ["Excellent", "Very Good", "Good", "Fair", "Poor"];

export default function EnhancedResults() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [subjects, setSubjects] = useState([{ subject: "", score: 0, grade: "", remark: "" }]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSession, setFilterSession] = useState("");
  const [filterTerm, setFilterTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch results
  const { data: results = [], isLoading: resultsLoading } = useQuery({
    queryKey: ["/api/admin/results"],
    retry: false,
  });

  // Fetch students
  const { data: students = [] } = useQuery({
    queryKey: ["/api/admin/students"],
    retry: false,
  });

  // Filter results based on search and filters
  const filteredResults = results.filter((result: any) => {
    const matchesSearch = result.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         students.find((s: any) => s.studentId === result.studentId)?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         students.find((s: any) => s.studentId === result.studentId)?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSession = !filterSession || result.session === filterSession;
    const matchesTerm = !filterTerm || result.term === filterTerm;
    
    return matchesSearch && matchesSession && matchesTerm;
  });

  // Create result mutation
  const createResultMutation = useMutation({
    mutationFn: async (data: ResultFormData) => {
      return await apiRequest("POST", "/api/admin/results", data);
    },
    onSuccess: () => {
      Swal.fire({
        title: 'Success!',
        text: 'Result created successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/results"] });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Create result error:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to create result.',
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
        text: 'Result deleted successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/results"] });
    },
    onError: () => {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete result.',
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
      outOf: undefined,
      classTeacher: "",
      principalComment: "",
      nextTermBegins: "",
      attendance: {
        present: 0,
        absent: 0,
        total: 0
      },
      conduct: {
        punctuality: "",
        neatness: "",
        politeness: "",
        honesty: "",
        leadership: "",
        sportsmanship: ""
      },
      remarks: ""
    }
  });

  // Reset form and subjects
  const resetForm = () => {
    form.reset();
    setSubjects([{ subject: "", score: 0, grade: "", remark: "" }]);
  };

  // Add subject
  const addSubject = () => {
    setSubjects([...subjects, { subject: "", score: 0, grade: "", remark: "" }]);
  };

  // Remove subject
  const removeSubject = (index: number) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  // Calculate grade based on score
  const calculateGrade = (score: number): string => {
    if (score >= 75) return "A";
    if (score >= 70) return "B+";
    if (score >= 65) return "B";
    if (score >= 60) return "C+";
    if (score >= 55) return "C";
    if (score >= 50) return "D+";
    if (score >= 45) return "D";
    if (score >= 40) return "E";
    return "F";
  };

  // Calculate remark based on score
  const calculateRemark = (score: number): string => {
    if (score >= 75) return "Excellent";
    if (score >= 70) return "Very Good";
    if (score >= 65) return "Good";
    if (score >= 60) return "Credit";
    if (score >= 55) return "Pass";
    if (score >= 50) return "Fair";
    if (score >= 45) return "Weak";
    if (score >= 40) return "Poor";
    return "Fail";
  };

  // Handle form submission
  const onSubmit = (data: ResultFormData) => {
    const validSubjects = subjects.filter(s => s.subject && s.score >= 0);
    const totalScore = validSubjects.reduce((sum, subject) => sum + subject.score, 0);
    const average = validSubjects.length > 0 ? totalScore / validSubjects.length : 0;
    
    // Calculate GPA on 4.0 scale
    const gpa = average >= 75 ? 4.0 : 
                average >= 70 ? 3.7 : 
                average >= 65 ? 3.3 : 
                average >= 60 ? 3.0 : 
                average >= 55 ? 2.7 : 
                average >= 50 ? 2.3 : 
                average >= 45 ? 2.0 : 
                average >= 40 ? 1.7 : 0.0;

    // Process subjects with auto-calculated grades
    const processedSubjects = validSubjects.map(subject => ({
      ...subject,
      grade: calculateGrade(subject.score),
      remark: calculateRemark(subject.score)
    }));

    const finalData = {
      ...data,
      subjects: processedSubjects,
      totalScore,
      average: Number(average.toFixed(2)),
      gpa: Number(gpa.toFixed(2))
    };

    createResultMutation.mutate(finalData);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Delete Result?',
      text: 'Are you sure you want to delete this result? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      deleteResultMutation.mutate(id);
    }
  };

  // View result details
  const viewResult = (result: any) => {
    setSelectedResult(result);
    setIsViewDialogOpen(true);
  };

  // Get student info
  const getStudentInfo = (studentId: string) => {
    return students.find((s: any) => s.studentId === studentId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Results Management</h1>
          <p className="text-gray-600">Comprehensive academic result management system</p>
        </div>
        <Button 
          onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Result
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search Student</label>
              <Input
                placeholder="Search by Student ID or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Filter by Session</label>
              <Select value={filterSession} onValueChange={setFilterSession}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sessions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Sessions</SelectItem>
                  {sessionOptions.map(session => (
                    <SelectItem key={session} value={session}>{session}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Filter by Term</label>
              <Select value={filterTerm} onValueChange={setFilterTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="All Terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Terms</SelectItem>
                  {termOptions.map(term => (
                    <SelectItem key={term} value={term}>{term}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilterSession("");
                  setFilterTerm("");
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Academic Results ({filteredResults.length})</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Info</TableHead>
                  <TableHead>Session/Term</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resultsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                        <span className="ml-2">Loading results...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No results found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((result: any) => {
                    const student = getStudentInfo(result.studentId);
                    return (
                      <TableRow key={result.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{result.studentId}</div>
                            <div className="text-sm text-gray-600">
                              {student ? `${student.firstName} ${student.lastName}` : 'Student not found'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {student?.gradeLevel || 'Grade not specified'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{result.session}</div>
                            <div className="text-xs text-gray-600">{result.term}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {result.subjects && result.subjects.slice(0, 3).map((subject: any, idx: number) => (
                              <div key={idx} className="text-xs">
                                <span className="font-medium">{subject.subject}:</span> {subject.score} ({subject.grade})
                              </div>
                            ))}
                            {result.subjects && result.subjects.length > 3 && (
                              <div className="text-xs text-gray-500">
                                +{result.subjects.length - 3} more subjects
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">Total: {result.totalScore}</div>
                            <div className="text-xs text-gray-600">Avg: {result.average}%</div>
                            <div className="text-xs text-gray-600">GPA: {result.gpa}/4.0</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {result.position && result.outOf ? 
                              `${result.position}/${result.outOf}` : 
                              result.position || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => viewResult(result)}
                              title="View Full Result"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                toast({
                                  title: "Edit Result",
                                  description: "Edit functionality will be implemented",
                                });
                              }}
                              title="Edit Result"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDelete(result.id)}
                              title="Delete Result"
                              disabled={deleteResultMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Result Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Academic Result</DialogTitle>
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
                      <FormLabel>Student *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
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
                      <FormLabel>Session *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
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
                      <FormLabel>Term *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
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

              {/* Subjects and Scores */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Subjects & Scores</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSubject}
                    className="bg-green-50 hover:bg-green-100 text-green-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subject
                  </Button>
                </div>

                {subjects.map((subject, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg relative">
                    {subjects.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSubject(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}

                    <div>
                      <label className="text-sm font-medium mb-2 block">Subject *</label>
                      <Select
                        value={subject.subject}
                        onValueChange={(value) => {
                          const newSubjects = [...subjects];
                          newSubjects[index].subject = value;
                          setSubjects(newSubjects);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {commonSubjects.map((subj) => (
                            <SelectItem key={subj} value={subj}>
                              {subj}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Score (0-100) *</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={subject.score}
                        onChange={(e) => {
                          const newSubjects = [...subjects];
                          newSubjects[index].score = Number(e.target.value);
                          setSubjects(newSubjects);
                        }}
                        placeholder="Enter score"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Grade</label>
                      <Input
                        value={calculateGrade(subject.score)}
                        disabled
                        className="bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Remark</label>
                      <Input
                        value={calculateRemark(subject.score)}
                        disabled
                        className="bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Points</label>
                      <Input
                        value={subject.score >= 40 ? "Pass" : "Fail"}
                        disabled
                        className="bg-gray-100"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Performance Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-gray-50">
                <div>
                  <label className="text-sm font-medium mb-2 block">Total Score</label>
                  <Input
                    value={subjects.filter(s => s.subject && s.score >= 0).reduce((sum, s) => sum + s.score, 0)}
                    disabled
                    className="bg-gray-100"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Average (%)</label>
                  <Input
                    value={(() => {
                      const validSubjects = subjects.filter(s => s.subject && s.score >= 0);
                      const total = validSubjects.reduce((sum, s) => sum + s.score, 0);
                      return validSubjects.length > 0 ? (total / validSubjects.length).toFixed(2) : '0.00';
                    })()}
                    disabled
                    className="bg-gray-100"
                  />
                </div>

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 1"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="outOf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Out of</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 45"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Attendance</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <FormField
                      control={form.control}
                      name="attendance.present"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Present</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="attendance.absent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Absent</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="attendance.total"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Behavioral Assessment</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['punctuality', 'neatness', 'politeness', 'honesty', 'leadership', 'sportsmanship'].map((trait) => (
                      <FormField
                        key={trait}
                        control={form.control}
                        name={`conduct.${trait}` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="capitalize">{trait}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {conductOptions.map(option => (
                                  <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="classTeacher"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Teacher</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Teacher's name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nextTermBegins"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Term Begins</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., January 8, 2025" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="principalComment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Principal's Comment</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Principal's comment on student's performance..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Remarks</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Any additional remarks or observations..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createResultMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {createResultMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : null}
                  Create Result
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Result Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Academic Result Sheet</DialogTitle>
          </DialogHeader>

          {selectedResult && (
            <div className="space-y-6">
              <ResultTemplate 
                result={selectedResult} 
                student={getStudentInfo(selectedResult.studentId)} 
              />
              
              <div className="flex justify-end space-x-4 border-t pt-4">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button variant="outline" onClick={() => window.print()}>
                  <FileText className="h-4 w-4 mr-2" />
                  Print Result
                </Button>
                <Button className="bg-red-600 hover:bg-red-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
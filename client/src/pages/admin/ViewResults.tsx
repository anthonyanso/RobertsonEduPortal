import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { Search, Eye, Edit, Trash2, Download, Filter, FileText, Printer, Calculator, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Swal from 'sweetalert2';
import NigerianResultTemplate from "./NigerianResultTemplate";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const editResultSchema = z.object({
  session: z.string().min(1, "Session is required"),
  term: z.string().min(1, "Term is required"),
  class: z.string().min(1, "Class is required"),
  subjects: z.array(z.object({
    subject: z.string().min(1, "Subject is required"),
    ca1: z.number().min(0).max(20),
    ca2: z.number().min(0).max(20),
    exam: z.number().min(0).max(60),
    total: z.number().min(0).max(100),
    grade: z.string(),
    remark: z.string(),
  })).min(1, "At least one subject is required"),
  classTeacher: z.string().optional(),
  principalComment: z.string().optional(),
  nextTermBegins: z.string().optional(),
});

export default function ViewResults() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSession, setFilterSession] = useState("all");
  const [filterTerm, setFilterTerm] = useState("all");
  const [filterClass, setFilterClass] = useState("all");
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sessionOptions = ["2023/2024", "2024/2025", "2025/2026"];
  const termOptions = ["First Term", "Second Term", "Third Term"];
  const classOptions = ["JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"];

  // Fetch results
  const { data: results = [], isLoading: resultsLoading, error: resultsError } = useQuery({
    queryKey: ["/api/admin/results"],
    retry: false,
  });

  // Fetch students
  const { data: students = [], error: studentsError } = useQuery({
    queryKey: ["/api/admin/students"],
    retry: false,
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

  // Filter results
  const filteredResults = results.filter((result: any) => {
    const student = students.find((s: any) => s.studentId === result.studentId);
    const matchesSearch = result.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSession = !filterSession || filterSession === "all" || result.session === filterSession;
    const matchesTerm = !filterTerm || filterTerm === "all" || result.term === filterTerm;
    const matchesClass = !filterClass || filterClass === "all" || result.class === filterClass;
    
    return matchesSearch && matchesSession && matchesTerm && matchesClass;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResults = filteredResults.slice(startIndex, endIndex);
  const totalResults = filteredResults.length;

  // Reset to first page when search/filter changes
  const resetToFirstPage = () => {
    if (currentPage > 1) {
      setCurrentPage(1);
    }
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);
      
      // Always include first page
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }
      
      // Add pages around current page
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Always include last page
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };



  // Get student info
  const getStudentInfo = (studentId: string) => {
    return students.find((s: any) => s.studentId === studentId);
  };

  // Edit result mutation
  const editResultMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      return await apiRequest("PUT", `/api/admin/results/${id}`, data);
    },
    onSuccess: () => {
      Swal.fire({
        title: 'Success!',
        text: 'Result updated successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/results"] });
      setIsEditDialogOpen(false);
      setEditingResult(null);
    },
    onError: () => {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update result.',
        icon: 'error',
        confirmButtonColor: '#dc2626'
      });
    },
  });

  // Recalculate positions mutation
  const recalculatePositionsMutation = useMutation({
    mutationFn: async ({ class: className, session, term }: { class: string, session: string, term: string }) => {
      return await apiRequest("POST", "/api/admin/results/recalculate-positions", {
        class: className,
        session,
        term
      });
    },
    onSuccess: () => {
      Swal.fire({
        title: 'Success!',
        text: 'Class positions recalculated successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/results"] });
    },
    onError: () => {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to recalculate positions.',
        icon: 'error',
        confirmButtonColor: '#dc2626'
      });
    },
  });

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

  // Handle recalculate positions
  const handleRecalculatePositions = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Recalculate Class Positions',
      html: `
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <select id="class" class="w-full p-2 border rounded-md">
              <option value="">Select Class</option>
              ${classOptions.map(cls => `<option value="${cls}">${cls}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Session</label>
            <select id="session" class="w-full p-2 border rounded-md">
              <option value="">Select Session</option>
              ${sessionOptions.map(sess => `<option value="${sess}">${sess}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Term</label>
            <select id="term" class="w-full p-2 border rounded-md">
              <option value="">Select Term</option>
              ${termOptions.map(term => `<option value="${term}">${term}</option>`).join('')}
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Recalculate',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3b82f6',
      preConfirm: () => {
        const classValue = (document.getElementById('class') as HTMLSelectElement).value;
        const sessionValue = (document.getElementById('session') as HTMLSelectElement).value;
        const termValue = (document.getElementById('term') as HTMLSelectElement).value;
        
        if (!classValue || !sessionValue || !termValue) {
          Swal.showValidationMessage('Please select all fields');
          return false;
        }
        
        return {
          class: classValue,
          session: sessionValue,
          term: termValue
        };
      }
    });

    if (formValues) {
      recalculatePositionsMutation.mutate(formValues);
    }
  };

  // View result
  const viewResult = (result: any) => {
    setSelectedResult(result);
    setIsViewDialogOpen(true);
  };

  // Edit result
  const editResult = (result: any) => {
    setEditingResult(result);
    setIsEditDialogOpen(true);
  };

  const getGradeColor = (grade: string) => {
    if (grade?.includes('A')) return 'bg-green-100 text-green-800';
    if (grade?.includes('B')) return 'bg-blue-100 text-blue-800';
    if (grade?.includes('C')) return 'bg-yellow-100 text-yellow-800';
    if (grade?.includes('D')) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getPerformanceLabel = (average: number) => {
    if (average >= 75) return 'Excellent';
    if (average >= 70) return 'Very Good';
    if (average >= 65) return 'Good';
    if (average >= 60) return 'Credit';
    if (average >= 50) return 'Pass';
    return 'Needs Improvement';
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search Student</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by ID or name..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Session</label>
              <Select value={filterSession} onValueChange={(value) => {
                setFilterSession(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sessions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  {sessionOptions.map(session => (
                    <SelectItem key={session} value={session}>{session}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Term</label>
              <Select value={filterTerm} onValueChange={(value) => {
                setFilterTerm(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terms</SelectItem>
                  {termOptions.map(term => (
                    <SelectItem key={term} value={term}>{term}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Class</label>
              <Select value={filterClass} onValueChange={(value) => {
                setFilterClass(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classOptions.map(cls => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilterSession("all");
                  setFilterTerm("all");
                  setFilterClass("all");
                  setCurrentPage(1);
                }}
                className="w-full"
              >
                Clear All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Academic Results ({totalResults})</CardTitle>
            <Button
              onClick={handleRecalculatePositions}
              disabled={recalculatePositionsMutation.isPending}
              className="flex items-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              {recalculatePositionsMutation.isPending ? 'Recalculating...' : 'Recalculate Positions'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Information</TableHead>
                  <TableHead>Class/Session</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Overall Grade</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resultsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Loading results...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center">
                        <FileText className="h-12 w-12 text-gray-400 mb-4" />
                        <p>No results found matching your criteria.</p>
                        <p className="text-sm">Try adjusting your search filters.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentResults.map((result: any) => {
                    const student = getStudentInfo(result.studentId);
                    const avgScore = Number(result.average) || 0;
                    const overallGrade = avgScore >= 75 ? 'A' : 
                                        avgScore >= 70 ? 'B' : 
                                        avgScore >= 65 ? 'C' : 
                                        avgScore >= 60 ? 'D' : 'F';
                    return (
                      <TableRow key={result.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{result.studentId}</div>
                            <div className="text-sm text-gray-600">
                              {student ? `${student.firstName} ${student.lastName}` : 'Student not found'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {student?.phoneNumber || 'No contact'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{result.class}</div>
                            <div className="text-xs text-gray-600">{result.session}</div>
                            <div className="text-xs text-gray-500">{result.term}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{result.subjects?.length || 0} subjects</div>
                            {result.subjects && result.subjects.slice(0, 2).map((subject: any, idx: number) => (
                              <div key={idx} className="text-xs text-gray-600">
                                {subject.subject}: {subject.total} ({subject.grade})
                              </div>
                            ))}
                            {result.subjects && result.subjects.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{result.subjects.length - 2} more subjects
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">Total: {result.totalScore || 0}</div>
                            <div className="text-xs text-gray-600">Avg: {avgScore}%</div>
                            <div className="text-xs text-gray-600">GPA: {Number(result.gpa) || 0}/4.0</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {result.position && result.outOf ? 
                              `${result.position}/${result.outOf}` : 
                              result.position || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getGradeColor(overallGrade)}>
                            {overallGrade} - {getPerformanceLabel(avgScore)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => viewResult(result)}
                              title="View Result"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => editResult(result)}
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

      {/* View Result Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nigerian Secondary School Result Sheet</DialogTitle>
          </DialogHeader>

          {selectedResult && (
            <div className="space-y-6">
              <NigerianResultTemplate 
                result={selectedResult} 
                student={getStudentInfo(selectedResult.studentId)} 
              />
              
              <div className="flex justify-end space-x-4 border-t pt-4">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button variant="outline" onClick={() => {
                  // Hide dialog content except the result template
                  const dialogContent = document.querySelector('.max-w-6xl');
                  if (dialogContent) {
                    dialogContent.classList.add('print:block');
                  }
                  
                  // Print the page
                  window.print();
                }}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Result
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Result Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Result</DialogTitle>
          </DialogHeader>
          {editingResult && (
            <EditResultForm
              result={editingResult}
              students={students}
              onSubmit={(data) => {
                editResultMutation.mutate({ id: editingResult.id, data });
              }}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingResult(null);
              }}
              isLoading={editResultMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Edit Result Form Component
function EditResultForm({ result, students, onSubmit, onCancel, isLoading }: {
  result: any;
  students: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [currentSubjects, setCurrentSubjects] = useState(result.subjects || []);
  const { toast } = useToast();
  const sessionOptions = ["2023/2024", "2024/2025", "2025/2026"];
  const termOptions = ["First Term", "Second Term", "Third Term"];
  const classOptions = ["JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"];

  const form = useForm({
    resolver: zodResolver(editResultSchema),
    defaultValues: {
      session: result.session || "",
      term: result.term || "",
      class: result.class || "",
      subjects: result.subjects || [],
      classTeacher: result.classTeacher || "",
      principalComment: result.principalComment || "",
      nextTermBegins: result.nextTermBegins || "",
    },
  });

  const calculateGrade = (score: number) => {
    if (score >= 75) return 'A';
    if (score >= 70) return 'B';
    if (score >= 65) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const getRemark = (score: number) => {
    if (score >= 75) return 'Excellent';
    if (score >= 70) return 'Very Good';
    if (score >= 65) return 'Good';
    if (score >= 60) return 'Credit';
    if (score >= 50) return 'Pass';
    return 'Needs Improvement';
  };

  const updateSubject = (index: number, field: string, value: any) => {
    const newSubjects = [...currentSubjects];
    newSubjects[index] = { ...newSubjects[index], [field]: value };
    
    // Recalculate total and grade when CA or exam scores change
    if (field === 'ca1' || field === 'ca2' || field === 'exam') {
      const ca1 = field === 'ca1' ? value : newSubjects[index].ca1 || 0;
      const ca2 = field === 'ca2' ? value : newSubjects[index].ca2 || 0;
      const exam = field === 'exam' ? value : newSubjects[index].exam || 0;
      const total = ca1 + ca2 + exam;
      
      newSubjects[index].total = total;
      newSubjects[index].grade = calculateGrade(total);
      newSubjects[index].remark = getRemark(total);
    }
    
    setCurrentSubjects(newSubjects);
    form.setValue('subjects', newSubjects);
  };

  const addSubject = () => {
    const newSubject = {
      subject: '',
      ca1: 0,
      ca2: 0,
      exam: 0,
      total: 0,
      grade: 'F',
      remark: 'Needs Improvement',
    };
    const newSubjects = [...currentSubjects, newSubject];
    setCurrentSubjects(newSubjects);
    form.setValue('subjects', newSubjects);
  };

  const removeSubject = (index: number) => {
    const newSubjects = currentSubjects.filter((_, i) => i !== index);
    setCurrentSubjects(newSubjects);
    form.setValue('subjects', newSubjects);
  };

  const handleSubmit = (data: any) => {
    console.log("Form data:", data);
    console.log("Current subjects:", currentSubjects);
    
    // Calculate overall performance
    const validSubjects = currentSubjects.filter(s => s.subject && s.total > 0);
    const totalScore = validSubjects.reduce((sum, subject) => sum + subject.total, 0);
    const average = validSubjects.length > 0 ? totalScore / validSubjects.length : 0;
    const gpa = average >= 75 ? 4.0 : 
                average >= 70 ? 3.5 : 
                average >= 65 ? 3.0 : 
                average >= 60 ? 2.5 : 
                average >= 55 ? 2.0 : 
                average >= 50 ? 1.5 : 
                average >= 45 ? 1.0 : 0.0;

    const finalData = {
      ...data,
      subjects: currentSubjects,
      totalScore,
      average: Number(average.toFixed(2)),
      gpa: Number(gpa.toFixed(2)),
      subjectCount: validSubjects.length
    };

    console.log("Final data to submit:", finalData);
    onSubmit(finalData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit, (errors) => {
        console.log("Form validation errors:", errors);
        toast({
          title: "Validation Error",
          description: "Please check all required fields",
          variant: "destructive"
        });
      })} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-3 gap-4">
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
          <FormField
            control={form.control}
            name="class"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {classOptions.map(cls => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Subjects */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Academic Subjects</h3>
            <Button type="button" onClick={addSubject} size="sm">
              Add Subject
            </Button>
          </div>
          
          {currentSubjects.map((subject, index) => (
            <Card key={index} className="p-4">
              <div className="grid grid-cols-7 gap-4 items-end">
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    value={subject.subject}
                    onChange={(e) => updateSubject(index, 'subject', e.target.value)}
                    placeholder="Subject name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">CA1 (20)</label>
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    value={subject.ca1}
                    onChange={(e) => updateSubject(index, 'ca1', Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">CA2 (20)</label>
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    value={subject.ca2}
                    onChange={(e) => updateSubject(index, 'ca2', Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Exam (60)</label>
                  <Input
                    type="number"
                    min="0"
                    max="60"
                    value={subject.exam}
                    onChange={(e) => updateSubject(index, 'exam', Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Total</label>
                  <Input value={subject.total} disabled />
                </div>
                <div>
                  <label className="text-sm font-medium">Grade</label>
                  <Input value={subject.grade} disabled />
                </div>
                <div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeSubject(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="classTeacher"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class Teacher</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter class teacher name" />
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
                  <Input {...field} placeholder="e.g., Monday, 15th January, 2024" />
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
                <Textarea {...field} placeholder="Enter principal's comment" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 border-t pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
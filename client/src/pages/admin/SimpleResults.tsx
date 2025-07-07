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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Swal from 'sweetalert2';

// Simple form schema
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
  remarks: z.string().optional()
});

type ResultFormData = z.infer<typeof resultFormSchema>;

const sessionOptions = ["2023/2024", "2024/2025", "2025/2026"];
const termOptions = ["First Term", "Second Term", "Third Term"];

export default function SimpleResults() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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
      subjects: [{ subject: "Mathematics", score: 0, grade: "", remark: "" }],
      totalScore: 0,
      average: 0,
      gpa: 0,
      position: undefined,
      remarks: ""
    }
  });

  // Handle form submission
  const onSubmit = (data: ResultFormData) => {
    // Simple calculation
    const validSubjects = data.subjects.filter(s => s.score > 0);
    const totalScore = validSubjects.reduce((sum, subject) => sum + subject.score, 0);
    const average = validSubjects.length > 0 ? totalScore / validSubjects.length : 0;
    const gpa = average >= 70 ? 4.0 : average >= 60 ? 3.0 : average >= 50 ? 2.0 : average >= 40 ? 1.0 : 0.0;

    // Auto-calculate grades
    const processedSubjects = data.subjects.map(subject => ({
      ...subject,
      grade: subject.score >= 70 ? "A" : subject.score >= 60 ? "B" : subject.score >= 50 ? "C" : subject.score >= 40 ? "D" : "F",
      remark: subject.score >= 70 ? "Excellent" : subject.score >= 60 ? "Very Good" : subject.score >= 50 ? "Good" : subject.score >= 40 ? "Fair" : "Poor"
    }));

    const finalData = {
      ...data,
      subjects: processedSubjects,
      totalScore,
      average: Number(average.toFixed(2)),
      gpa
    };

    createResultMutation.mutate(finalData);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Delete Result?',
      text: 'Are you sure you want to delete this result?',
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Results Management</h1>
          <p className="text-gray-600">Manage student academic results</p>
        </div>
        <Button 
          onClick={() => {
            form.reset();
            setIsAddDialogOpen(true);
          }}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Result
        </Button>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Results ({results.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Student ID</th>
                  <th className="text-left p-4">Session</th>
                  <th className="text-left p-4">Term</th>
                  <th className="text-left p-4">Average</th>
                  <th className="text-left p-4">GPA</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {resultsLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                        <span className="ml-2">Loading results...</span>
                      </div>
                    </td>
                  </tr>
                ) : results.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No results found. Click "Add Result" to create the first result.
                    </td>
                  </tr>
                ) : (
                  results.map((result: any) => (
                    <tr key={result.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{result.studentId}</td>
                      <td className="p-4">{result.session}</td>
                      <td className="p-4">{result.term}</td>
                      <td className="p-4">{result.average}%</td>
                      <td className="p-4">{result.gpa}/4.0</td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              toast({
                                title: "View Result",
                                description: `Viewing result for ${result.studentId}`,
                              });
                            }}
                            title="View Result"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              toast({
                                title: "Edit Result",
                                description: "Edit functionality will be added",
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Result Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Result</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

              {/* Simple subject entry */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Subject Score</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                  <FormField
                    control={form.control}
                    name="subjects.0.subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Mathematics" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subjects.0.score"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Score (0-100)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position (Optional)</FormLabel>
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
                </div>
              </div>

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
    </div>
  );
}
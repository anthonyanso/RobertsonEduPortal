import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus, X, Save, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Swal from 'sweetalert2';

// Schema for result creation
const createResultSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  session: z.string().min(1, "Session is required"),
  term: z.string().min(1, "Term is required"),
  classTeacher: z.string().optional(),
  nextTermBegins: z.string().optional(),
  principalComment: z.string().optional(),
  remarks: z.string().optional(),
  position: z.number().optional(),
  outOf: z.number().optional(),
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
});

type CreateResultData = z.infer<typeof createResultSchema>;

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

export default function CreateResult() {
  const [subjects, setSubjects] = useState([{ subject: "", score: 0 }]);
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch students
  const { data: students = [] } = useQuery({
    queryKey: ["/api/admin/students"],
    retry: false,
  });

  // Create result mutation
  const createResultMutation = useMutation({
    mutationFn: async (data: any) => {
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
      form.reset();
      setSubjects([{ subject: "", score: 0 }]);
      setCurrentStep(1);
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

  // Form setup
  const form = useForm<CreateResultData>({
    resolver: zodResolver(createResultSchema),
    defaultValues: {
      studentId: "",
      session: "",
      term: "",
      classTeacher: "",
      nextTermBegins: "",
      principalComment: "",
      remarks: "",
      position: undefined,
      outOf: undefined,
      attendance: {
        present: undefined,
        absent: undefined,
        total: undefined
      },
      conduct: {
        punctuality: "",
        neatness: "",
        politeness: "",
        honesty: "",
        leadership: "",
        sportsmanship: ""
      }
    }
  });

  // Calculate grade and remark
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

  // Subject management
  const addSubject = () => {
    setSubjects([...subjects, { subject: "", score: 0 }]);
  };

  const removeSubject = (index: number) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const updateSubject = (index: number, field: string, value: any) => {
    const newSubjects = [...subjects];
    newSubjects[index] = { ...newSubjects[index], [field]: value };
    setSubjects(newSubjects);
  };

  // Calculate performance metrics
  const calculateMetrics = () => {
    const validSubjects = subjects.filter(s => s.subject && s.score >= 0);
    const totalScore = validSubjects.reduce((sum, subject) => sum + subject.score, 0);
    const average = validSubjects.length > 0 ? totalScore / validSubjects.length : 0;
    const gpa = average >= 75 ? 4.0 : 
                average >= 70 ? 3.7 : 
                average >= 65 ? 3.3 : 
                average >= 60 ? 3.0 : 
                average >= 55 ? 2.7 : 
                average >= 50 ? 2.3 : 
                average >= 45 ? 2.0 : 
                average >= 40 ? 1.7 : 0.0;

    return { totalScore, average: Number(average.toFixed(2)), gpa: Number(gpa.toFixed(2)) };
  };

  const onSubmit = (data: CreateResultData) => {
    const validSubjects = subjects.filter(s => s.subject && s.score >= 0);
    const processedSubjects = validSubjects.map(subject => ({
      subject: subject.subject,
      score: subject.score,
      grade: calculateGrade(subject.score),
      remark: calculateRemark(subject.score)
    }));

    const metrics = calculateMetrics();
    
    const finalData = {
      ...data,
      subjects: processedSubjects,
      totalScore: metrics.totalScore,
      average: metrics.average,
      gpa: metrics.gpa
    };

    createResultMutation.mutate(finalData);
  };

  const steps = [
    { id: 1, title: "Basic Info", description: "Student and term details" },
    { id: 2, title: "Subjects", description: "Add subjects and scores" },
    { id: 3, title: "Additional", description: "Attendance and conduct" },
    { id: 4, title: "Review", description: "Review and submit" }
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep form={form} students={students} />;
      case 2:
        return <SubjectsStep subjects={subjects} onAdd={addSubject} onRemove={removeSubject} onUpdate={updateSubject} />;
      case 3:
        return <AdditionalInfoStep form={form} />;
      case 4:
        return <ReviewStep form={form} subjects={subjects} metrics={calculateMetrics()} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Result
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.id}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {renderStep()}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                
                <div className="flex space-x-2">
                  {currentStep < 4 ? (
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={createResultMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {createResultMutation.isPending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Create Result
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

// Step Components
function BasicInfoStep({ form, students }: { form: any, students: any[] }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Basic Information</h3>
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
    </div>
  );
}

function SubjectsStep({ subjects, onAdd, onRemove, onUpdate }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Subjects & Scores</h3>
        <Button type="button" variant="outline" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </Button>
      </div>
      
      {subjects.map((subject: any, index: number) => (
        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
          <div>
            <label className="text-sm font-medium mb-2 block">Subject</label>
            <Select
              value={subject.subject}
              onValueChange={(value) => onUpdate(index, 'subject', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {commonSubjects.map((subj) => (
                  <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Score</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={subject.score}
              onChange={(e) => onUpdate(index, 'score', Number(e.target.value))}
              placeholder="0-100"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Grade</label>
            <Input
              value={subject.score >= 75 ? "A" : subject.score >= 70 ? "B+" : subject.score >= 65 ? "B" : subject.score >= 60 ? "C+" : subject.score >= 55 ? "C" : subject.score >= 50 ? "D+" : subject.score >= 45 ? "D" : subject.score >= 40 ? "E" : "F"}
              disabled
              className="bg-gray-100"
            />
          </div>
          
          <div className="flex items-end">
            {subjects.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => onRemove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function AdditionalInfoStep({ form }: { form: any }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Additional Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium mb-3">Attendance</h4>
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
        
        <div>
          <h4 className="font-medium mb-3">Behavioral Assessment</h4>
          <div className="grid grid-cols-2 gap-2">
            {['punctuality', 'neatness', 'politeness', 'honesty'].map((trait) => (
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
    </div>
  );
}

function ReviewStep({ form, subjects, metrics }: any) {
  const watchedValues = form.watch();
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Review & Submit</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Total Subjects:</span>
              <span className="font-medium">{subjects.filter((s: any) => s.subject).length}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Score:</span>
              <span className="font-medium">{metrics.totalScore}</span>
            </div>
            <div className="flex justify-between">
              <span>Average:</span>
              <span className="font-medium">{metrics.average}%</span>
            </div>
            <div className="flex justify-between">
              <span>GPA:</span>
              <span className="font-medium">{metrics.gpa}/4.0</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Student Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Student ID:</span>
              <span className="font-medium">{watchedValues.studentId || 'Not selected'}</span>
            </div>
            <div className="flex justify-between">
              <span>Session:</span>
              <span className="font-medium">{watchedValues.session || 'Not selected'}</span>
            </div>
            <div className="flex justify-between">
              <span>Term:</span>
              <span className="font-medium">{watchedValues.term || 'Not selected'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
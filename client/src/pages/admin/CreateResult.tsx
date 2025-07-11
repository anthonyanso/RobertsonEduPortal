import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, X, Save, Calculator, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Swal from 'sweetalert2';

// Nigerian Secondary School Result Schema
const resultSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  session: z.string().min(1, "Session is required"),
  term: z.string().min(1, "Term is required"),
  class: z.string().min(1, "Class is required"),
  classTeacher: z.string().optional(),
  principalComment: z.string().optional(),
  nextTermBegins: z.string().optional(),
  position: z.number().optional(),
  outOf: z.number().optional(),
  attendance: z.object({
    present: z.number().optional(),
    absent: z.number().optional(),
    total: z.number().optional()
  }).optional(),
  psychomotor: z.object({
    handWriting: z.string().optional(),
    drawing: z.string().optional(),
    painting: z.string().optional(),
    sports: z.string().optional(),
    speaking: z.string().optional(),
    handling: z.string().optional()
  }).optional(),
  affective: z.object({
    punctuality: z.string().optional(),
    attendance: z.string().optional(),
    attentiveness: z.string().optional(),
    neatness: z.string().optional(),
    politeness: z.string().optional(),
    honesty: z.string().optional(),
    relationship: z.string().optional(),
    selfControl: z.string().optional(),
    leadership: z.string().optional()
  }).optional(),
});

type ResultFormData = z.infer<typeof resultSchema>;

const sessionOptions = ["2023/2024", "2024/2025", "2025/2026"];
const termOptions = ["First Term", "Second Term", "Third Term"];
const classOptions = ["JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"];

const nigerianSubjects = [
  "Mathematics", "English Language", "Physics", "Chemistry", "Biology",
  "Geography", "History", "Economics", "Government", "Literature in English",
  "Agricultural Science", "Computer Science", "Further Mathematics",
  "Technical Drawing", "French", "Civic Education", "Fine Arts",
  "Music", "Physical & Health Education", "Religious Studies",
  "Home Economics", "Basic Science", "Basic Technology", "Social Studies",
  "Yoruba", "Hausa", "Igbo", "Business Studies", "Commerce"
];

const assessmentOptions = ["5 - Excellent", "4 - Very Good", "3 - Good", "2 - Fair", "1 - Poor"];

export default function CreateResult() {
  const [subjects, setSubjects] = useState([{ subject: "", ca1: 0, ca2: 0, exam: 0, total: 0, grade: "", position: "" }]);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedClass, setSelectedClass] = useState("all");
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
        text: 'Student result created successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/results"] });
      form.reset();
      setSubjects([{ subject: "", ca1: 0, ca2: 0, exam: 0, total: 0, grade: "", position: "" }]);
      setCurrentStep(1);
    },
    onError: (error) => {
      console.error('Create result error:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to create result. Please try again.',
        icon: 'error',
        confirmButtonColor: '#dc2626'
      });
    },
  });

  // Form setup
  const form = useForm<ResultFormData>({
    resolver: zodResolver(resultSchema),
    defaultValues: {
      studentId: "",
      session: "",
      term: "",
      class: "",
      classTeacher: "",
      principalComment: "",
      nextTermBegins: "",
      position: undefined,
      outOf: undefined,
      attendance: {
        present: undefined,
        absent: undefined,
        total: undefined
      },
      psychomotor: {
        handWriting: "",
        drawing: "",
        painting: "",
        sports: "",
        speaking: "",
        handling: ""
      },
      affective: {
        punctuality: "",
        attendance: "",
        attentiveness: "",
        neatness: "",
        politeness: "",
        honesty: "",
        relationship: "",
        selfControl: "",
        leadership: ""
      }
    }
  });

  // Calculate grade based on total score
  const calculateGrade = (total: number): string => {
    if (total >= 75) return "A1";
    if (total >= 70) return "B2";
    if (total >= 65) return "B3";
    if (total >= 60) return "C4";
    if (total >= 55) return "C5";
    if (total >= 50) return "C6";
    if (total >= 45) return "D7";
    if (total >= 40) return "E8";
    return "F9";
  };

  const getRemark = (total: number): string => {
    if (total >= 75) return "Excellent";
    if (total >= 70) return "Very Good";
    if (total >= 65) return "Good";
    if (total >= 60) return "Credit";
    if (total >= 55) return "Pass";
    if (total >= 50) return "Fair";
    if (total >= 45) return "Poor";
    if (total >= 40) return "Very Poor";
    return "Fail";
  };

  // Subject management
  const addSubject = () => {
    setSubjects([...subjects, { subject: "", ca1: 0, ca2: 0, exam: 0, total: 0, grade: "", position: "" }]);
  };

  const removeSubject = (index: number) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const updateSubject = (index: number, field: string, value: any) => {
    const newSubjects = [...subjects];
    newSubjects[index] = { ...newSubjects[index], [field]: value };
    
    // Auto-calculate total if scores are updated
    if (field === 'ca1' || field === 'ca2' || field === 'exam') {
      const subject = newSubjects[index];
      const total = subject.ca1 + subject.ca2 + subject.exam;
      newSubjects[index].total = total;
      newSubjects[index].grade = calculateGrade(total);
    }
    
    setSubjects(newSubjects);
  };

  // Calculate overall performance
  const calculateOverallPerformance = () => {
    const validSubjects = subjects.filter(s => s.subject && s.total > 0);
    const totalScore = validSubjects.reduce((sum, subject) => sum + subject.total, 0);
    const average = validSubjects.length > 0 ? totalScore / validSubjects.length : 0;
    const gpa = average >= 75 ? 4.0 : 
                average >= 70 ? 3.5 : 
                average >= 65 ? 3.0 : 
                average >= 60 ? 2.5 : 
                average >= 55 ? 2.0 : 
                average >= 50 ? 1.5 : 
                average >= 45 ? 1.0 : 0.0;

    return { 
      totalScore, 
      average: Number(average.toFixed(2)), 
      gpa: Number(gpa.toFixed(2)),
      subjectCount: validSubjects.length
    };
  };

  const onSubmit = (data: ResultFormData) => {
    const validSubjects = subjects.filter(s => s.subject && s.total > 0);
    const processedSubjects = validSubjects.map((subject, index) => ({
      subject: subject.subject,
      ca1: subject.ca1,
      ca2: subject.ca2,
      exam: subject.exam,
      total: subject.total,
      grade: subject.grade,
      remark: getRemark(subject.total),
      position: subject.position || (index + 1).toString()
    }));

    const performance = calculateOverallPerformance();
    
    const finalData = {
      ...data,
      subjects: processedSubjects,
      totalScore: performance.totalScore,
      average: performance.average,
      gpa: performance.gpa,
      subjectCount: performance.subjectCount
    };

    createResultMutation.mutate(finalData);
  };

  const steps = [
    { id: 1, title: "Basic Information", description: "Student and session details" },
    { id: 2, title: "Academic Scores", description: "Subject scores and grades" },
    { id: 3, title: "Assessment", description: "Psychomotor and affective skills" },
    { id: 4, title: "Review & Submit", description: "Final review and submission" }
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInformationStep form={form} students={students} selectedClass={selectedClass} onClassChange={setSelectedClass} />;
      case 2:
        return <AcademicScoresStep subjects={subjects} onAdd={addSubject} onRemove={removeSubject} onUpdate={updateSubject} />;
      case 3:
        return <AssessmentStep form={form} />;
      case 4:
        return <ReviewStep form={form} subjects={subjects} performance={calculateOverallPerformance()} />;
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
            Create New Result - Nigerian Secondary School Format
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.id 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : currentStep > step.id 
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'border-gray-300 text-gray-400'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-20 mx-4 ${
                    currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {renderStep()}
              
              {/* Navigation */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
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
                      <ArrowRight className="h-4 w-4 ml-2" />
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
function BasicInformationStep({ form, students, selectedClass, onClassChange }: { 
  form: any, 
  students: any[], 
  selectedClass: string, 
  onClassChange: (className: string) => void 
}) {
  // Filter students by selected class
  const filteredStudents = selectedClass === "all" 
    ? students 
    : students.filter((student: any) => student.gradeLevel === selectedClass);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Basic Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Class Filter */}
          <div>
            <Label htmlFor="class-filter">Filter Students by Class</Label>
            <Select value={selectedClass} onValueChange={onClassChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select class to filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classOptions.map(cls => (
                  <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <FormField
            control={form.control}
            name="studentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student * {selectedClass !== "all" && `(${filteredStudents.length} students in ${selectedClass})`}</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Auto-set class when student is selected
                    const selectedStudent = students.find(s => s.studentId === value);
                    if (selectedStudent) {
                      form.setValue('class', selectedStudent.gradeLevel);
                    }
                  }} 
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student: any) => (
                        <SelectItem key={student.id} value={student.studentId}>
                          {student.studentId} - {student.firstName} {student.lastName} ({student.gradeLevel})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No students found in {selectedClass}
                      </SelectItem>
                    )}
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
                <FormLabel>Academic Session *</FormLabel>
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

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="class"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
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

          <FormField
            control={form.control}
            name="classTeacher"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class Teacher</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter class teacher's name" />
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
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}

function AcademicScoresStep({ subjects, onAdd, onRemove, onUpdate }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Academic Scores</h3>
        <Button type="button" variant="outline" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </Button>
      </div>
      
      <div className="space-y-4">
        {subjects.map((subject: any, index: number) => (
          <Card key={index} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              <div>
                <Label className="text-sm font-medium">Subject</Label>
                <Select
                  value={subject.subject}
                  onValueChange={(value) => onUpdate(index, 'subject', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {nigerianSubjects.map((subj) => (
                      <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">CA1 (20)</Label>
                <Input
                  type="number"
                  min="0"
                  max="20"
                  value={subject.ca1}
                  onChange={(e) => onUpdate(index, 'ca1', Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">CA2 (20)</Label>
                <Input
                  type="number"
                  min="0"
                  max="20"
                  value={subject.ca2}
                  onChange={(e) => onUpdate(index, 'ca2', Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Exam (60)</Label>
                <Input
                  type="number"
                  min="0"
                  max="60"
                  value={subject.exam}
                  onChange={(e) => onUpdate(index, 'exam', Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Total (100)</Label>
                <Input
                  value={subject.total}
                  disabled
                  className="mt-1 bg-gray-100 font-medium"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Grade</Label>
                <Input
                  value={subject.grade}
                  disabled
                  className="mt-1 bg-gray-100 font-medium"
                />
              </div>
              
              <div className="flex items-end">
                {subjects.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => onRemove(index)}
                    className="w-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AssessmentStep({ form }: { form: any }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Skills Assessment</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Psychomotor Skills */}
        <Card className="p-4">
          <h4 className="font-medium mb-4">Psychomotor Skills</h4>
          <div className="space-y-3">
            {['handWriting', 'drawing', 'painting', 'sports', 'speaking', 'handling'].map((skill) => (
              <FormField
                key={skill}
                control={form.control}
                name={`psychomotor.${skill}` as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="capitalize">{skill.replace(/([A-Z])/g, ' $1').trim()}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assessmentOptions.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </Card>

        {/* Affective Skills */}
        <Card className="p-4">
          <h4 className="font-medium mb-4">Affective Skills</h4>
          <div className="space-y-3">
            {['punctuality', 'attendance', 'attentiveness', 'neatness', 'politeness', 'honesty', 'relationship', 'selfControl', 'leadership'].map((skill) => (
              <FormField
                key={skill}
                control={form.control}
                name={`affective.${skill}` as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="capitalize">{skill.replace(/([A-Z])/g, ' $1').trim()}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assessmentOptions.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ReviewStep({ form, subjects, performance }: any) {
  const watchedValues = form.watch();
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Review & Submit</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Subjects</p>
                <p className="text-2xl font-bold">{performance.subjectCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Score</p>
                <p className="text-2xl font-bold">{performance.totalScore}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average %</p>
                <p className="text-2xl font-bold">{performance.average}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">GPA</p>
                <p className="text-2xl font-bold">{performance.gpa}/4.0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Student ID:</span>
              <span className="font-medium">{watchedValues.studentId || 'Not selected'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Session:</span>
              <span className="font-medium">{watchedValues.session || 'Not selected'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Term:</span>
              <span className="font-medium">{watchedValues.term || 'Not selected'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Class:</span>
              <span className="font-medium">{watchedValues.class || 'Not selected'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
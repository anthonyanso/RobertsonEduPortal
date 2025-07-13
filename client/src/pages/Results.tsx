import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, GraduationCap, CheckCircle, AlertTriangle, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const resultFormSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  pin: z.string().min(1, "Scratch card PIN is required"),
  session: z.string().min(1, "Session is required"),
  term: z.string().min(1, "Term is required"),
});

type ResultFormData = z.infer<typeof resultFormSchema>;

export default function Results() {
  const [resultData, setResultData] = useState<any>(null);
  const [showError, setShowError] = useState(false);
  const { toast } = useToast();

  const form = useForm<ResultFormData>({
    resolver: zodResolver(resultFormSchema),
    defaultValues: {
      studentId: "",
      pin: "",
      session: "",
      term: "",
    },
  });

  const checkResultMutation = useMutation({
    mutationFn: async (data: ResultFormData) => {
      const response = await apiRequest("POST", "/api/verify-scratch-card", {
        pin: data.pin,
        studentId: data.studentId
      });
      return response;
    },
    onSuccess: (data) => {
      console.log("API Response:", data);
      
      // Find the specific result matching the session and term
      const formValues = form.getValues();
      const selectedResult = data.results.find((result: any) => 
        result.session === formValues.session && 
        result.term === formValues.term
      );
      
      if (selectedResult) {
        setResultData({
          student: data.student,
          result: selectedResult
        });
        setShowError(false);
        toast({
          title: "Result Found",
          description: "Your academic results have been retrieved successfully.",
        });
      } else {
        setResultData(null);
        setShowError(true);
        toast({
          title: "No Result Found",
          description: `No result found for ${formValues.session} - ${formValues.term}`,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error("API Error:", error);
      setResultData(null);
      setShowError(true);
      toast({
        title: "Error",
        description: error.message || "Please check your Student ID and Scratch Card PIN and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ResultFormData) => {
    checkResultMutation.mutate(data);
  };

  const handlePrint = () => {
    window.print();
  };

  const getGradeColor = (grade: string) => {
    switch (grade?.toUpperCase()) {
      case 'A':
        return 'text-green-600';
      case 'B':
        return 'text-blue-600';
      case 'C':
        return 'text-yellow-600';
      case 'D':
        return 'text-orange-600';
      case 'F':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRemarkColor = (remark: string) => {
    switch (remark?.toLowerCase()) {
      case 'excellent':
        return 'text-green-600';
      case 'very good':
        return 'text-blue-600';
      case 'good':
        return 'text-yellow-600';
      case 'fair':
        return 'text-orange-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  useEffect(() => {
    // Initialize AOS
    const initAOS = async () => {
      const AOS = (await import('aos')).default;
      await import('aos/dist/aos.css');
      AOS.init({
        duration: 1000,
        easing: 'ease-in-out',
        once: true
      });
    };

    initAOS();
  }, []);

  return (
    <div className="min-h-screen">
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16" data-aos="fade-up">
            <h1 className="font-playfair text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Result Checker
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Check your academic results by entering your student ID and scratch card PIN below.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Result Checker Form */}
            <Card className="shadow-xl border border-gray-200 mb-8" data-aos="fade-up">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="font-playfair text-3xl font-bold text-gray-900 mb-2">
                  Student Result Portal
                </CardTitle>
                <p className="text-gray-600">Enter your details to access your results</p>
              </CardHeader>
              <CardContent className="p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="studentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">
                            Student ID / Registration Number *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your student ID (e.g., ROB-20250712-JKJO)"
                              {...field}
                              className="focus:ring-red-600 focus:border-red-600"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">
                            Scratch Card PIN *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your scratch card PIN"
                              {...field}
                              className="focus:ring-red-600 focus:border-red-600"
                            />
                          </FormControl>
                          <p className="text-sm text-gray-500 mt-1">
                            Scratch off the silver coating to reveal your PIN
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="session"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">
                            Session *
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="focus:ring-red-600 focus:border-red-600">
                                <SelectValue placeholder="Select Session" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="2024/2025">2024/2025</SelectItem>
                              <SelectItem value="2023/2024">2023/2024</SelectItem>
                              <SelectItem value="2022/2023">2022/2023</SelectItem>
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
                          <FormLabel className="text-sm font-semibold text-gray-700">
                            Term *
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="focus:ring-red-600 focus:border-red-600">
                                <SelectValue placeholder="Select Term" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="First Term">First Term</SelectItem>
                              <SelectItem value="Second Term">Second Term</SelectItem>
                              <SelectItem value="Third Term">Third Term</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={checkResultMutation.isPending}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg text-lg font-semibold"
                    >
                      {checkResultMutation.isPending ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Checking Results...
                        </div>
                      ) : (
                        <>
                          <Search className="h-5 w-5 mr-2" />
                          Check Results
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Result Display */}
            {resultData && (
              <Card className="shadow-xl border border-gray-200 mb-8" data-aos="fade-up">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="font-playfair text-2xl font-bold text-gray-900 mb-2">
                    Result Found!
                  </CardTitle>
                  <p className="text-gray-600">Academic performance report</p>
                </CardHeader>
                <CardContent className="p-8">
                  {/* Student Info Header */}
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Student Name</p>
                        <p className="font-semibold text-gray-900">
                          {resultData.student.firstName} {resultData.student.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Student ID</p>
                        <p className="font-semibold text-gray-900">{resultData.student.studentId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Grade Level</p>
                        <p className="font-semibold text-gray-900">{resultData.student.gradeLevel}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Session & Term</p>
                        <p className="font-semibold text-gray-900">
                          {resultData.result.session} - {resultData.result.term}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Subjects Table */}
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2 text-left">Subject</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">Score</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">Grade</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">Remark</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultData.result.subjects?.map((subject: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2 font-medium">
                              {subject.subject}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              {subject.score}
                            </td>
                            <td className={`border border-gray-300 px-4 py-2 text-center font-bold ${getGradeColor(subject.grade)}`}>
                              {subject.grade}
                            </td>
                            <td className={`border border-gray-300 px-4 py-2 text-center ${getRemarkColor(subject.remark)}`}>
                              {subject.remark}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary */}
                  <div className="bg-blue-50 rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Total Score</p>
                        <p className="text-2xl font-bold text-blue-600">{resultData.result.totalScore}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Average</p>
                        <p className="text-2xl font-bold text-green-600">{resultData.result.average}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">GPA</p>
                        <p className="text-2xl font-bold text-purple-600">{resultData.result.gpa}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Position</p>
                        <p className="text-2xl font-bold text-orange-600">{resultData.result.position || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Remarks */}
                  {resultData.result.remarks && (
                    <div className="bg-yellow-50 rounded-lg p-6 mb-6">
                      <h3 className="font-bold text-gray-900 mb-2">Teacher's Remarks</h3>
                      <p className="text-gray-700">{resultData.result.remarks}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={handlePrint}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                    >
                      <Printer className="h-5 w-5 mr-2" />
                      Print Result
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Display */}
            {showError && (
              <Card className="shadow-xl border border-red-200 mb-8" data-aos="fade-up">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="font-playfair text-2xl font-bold text-red-900 mb-2">
                    Result Not Found
                  </CardTitle>
                  <p className="text-red-600">Please check your credentials and try again</p>
                </CardHeader>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, GraduationCap, CheckCircle, AlertTriangle, Download, Printer } from "lucide-react";
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
  session: z.string().min(1, "Session/Term is required"),
});

type ResultFormData = z.infer<typeof resultFormSchema>;

interface ResultData {
  student: {
    name: string;
    studentId: string;
    gradeLevel: string;
  };
  result: {
    session: string;
    term: string;
    subjects: Array<{
      subject: string;
      score: number;
      grade: string;
      remark: string;
    }>;
    totalScore: number;
    average: number;
    gpa: number;
    position?: number;
    remarks?: string;
  };
}

export default function Results() {
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [showError, setShowError] = useState(false);
  const { toast } = useToast();

  const form = useForm<ResultFormData>({
    resolver: zodResolver(resultFormSchema),
    defaultValues: {
      studentId: "",
      pin: "",
      session: "",
    },
  });

  const checkResultMutation = useMutation({
    mutationFn: async (data: ResultFormData) => {
      const [session, term] = data.session.split('-');
      const response = await apiRequest("POST", "/api/verify-scratch-card", {
        pin: data.pin,
        studentId: data.studentId
      });
      return response;
    },
    onSuccess: (data) => {
      // Transform the response to match the expected format
      const transformedData = {
        student: {
          name: `${data.student.firstName} ${data.student.lastName}`,
          studentId: data.student.studentId,
          gradeLevel: data.student.gradeLevel,
        },
        result: data.results.length > 0 ? {
          session: data.results[0].session,
          term: data.results[0].term,
          subjects: data.results[0].subjects,
          totalScore: data.results[0].totalScore,
          average: data.results[0].average,
          gpa: data.results[0].gpa,
          position: data.results[0].position,
          remarks: data.results[0].remarks,
        } : null
      };
      setResultData(transformedData);
      setShowError(false);
      toast({
        title: "Result Found",
        description: "Your academic results have been retrieved successfully.",
      });
    },
    onError: (error) => {
      setResultData(null);
      setShowError(true);
      toast({
        title: "Result Not Found",
        description: "Please check your Student ID and Scratch Card PIN and try again.",
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

  const handleDownload = () => {
    // Implementation would generate PDF of results
    toast({
      title: "Download Started",
      description: "Your result PDF is being generated.",
    });
  };

  const getGradeColor = (grade: string) => {
    switch (grade.toUpperCase()) {
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
    switch (remark.toLowerCase()) {
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
                              placeholder="Enter your student ID"
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
                            Session/Term *
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="focus:ring-red-600 focus:border-red-600">
                                <SelectValue placeholder="Select Session/Term" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="2024-first">2024 - First Term</SelectItem>
                              <SelectItem value="2024-second">2024 - Second Term</SelectItem>
                              <SelectItem value="2024-third">2024 - Third Term</SelectItem>
                              <SelectItem value="2023-first">2023 - First Term</SelectItem>
                              <SelectItem value="2023-second">2023 - Second Term</SelectItem>
                              <SelectItem value="2023-third">2023 - Third Term</SelectItem>
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
                  <div className="bg-red-600 text-white p-6 rounded-lg mb-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <h4 className="font-playfair text-xl font-bold">{resultData.student.name}</h4>
                        <p className="text-yellow-400">Student ID: {resultData.student.studentId}</p>
                        <p className="text-yellow-400">Grade: {resultData.student.gradeLevel}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Session: {resultData.result.session} - {resultData.result.term}</p>
                        <p className="text-sm">Date: {new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Subjects Table */}
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Subject</th>
                          <th className="border border-gray-200 px-4 py-3 text-center font-semibold">Score</th>
                          <th className="border border-gray-200 px-4 py-3 text-center font-semibold">Grade</th>
                          <th className="border border-gray-200 px-4 py-3 text-center font-semibold">Remark</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultData.result.subjects.map((subject, index) => (
                          <tr key={index}>
                            <td className="border border-gray-200 px-4 py-3">{subject.subject}</td>
                            <td className="border border-gray-200 px-4 py-3 text-center">{subject.score}</td>
                            <td className={`border border-gray-200 px-4 py-3 text-center font-semibold ${getGradeColor(subject.grade)}`}>
                              {subject.grade}
                            </td>
                            <td className={`border border-gray-200 px-4 py-3 text-center ${getRemarkColor(subject.remark)}`}>
                              {subject.remark}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <h5 className="font-semibold text-green-700">Total Score</h5>
                      <p className="text-2xl font-bold text-green-800">
                        {resultData.result.totalScore}/{resultData.result.subjects.length * 100}
                      </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                      <h5 className="font-semibold text-blue-700">Average</h5>
                      <p className="text-2xl font-bold text-blue-800">{resultData.result.average}%</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                      <h5 className="font-semibold text-yellow-700">GPA</h5>
                      <p className="text-2xl font-bold text-yellow-800">{resultData.result.gpa}/4.0</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={handlePrint}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Printer Result
                    </Button>
                    <Button
                      onClick={handleDownload}
                      className="bg-yellow-500 hover:bg-yellow-400 text-white px-6 py-3 rounded-lg font-semibold"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Display */}
            {showError && (
              <Card className="bg-red-50 border border-red-200 mb-8" data-aos="fade-up">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-playfair text-2xl font-bold text-red-800 mb-2">Result Not Found</h3>
                  <p className="text-red-600 mb-4">Please check your Student ID and Scratch Card PIN and try again.</p>
                  <p className="text-sm text-red-500">If you continue to experience issues, please contact the school administration.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-16 max-w-4xl mx-auto" data-aos="fade-up">
            <h3 className="font-playfair text-2xl font-bold text-gray-900 mb-6 text-center">
              How to Check Your Results
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Get Your PIN",
                  description: "Purchase a scratch card from the school or authorized vendor and scratch off the silver coating to reveal your PIN."
                },
                {
                  step: "2",
                  title: "Enter Details",
                  description: "Fill in your Student ID, Scratch Card PIN, and select the appropriate session/term from the dropdown menu."
                },
                {
                  step: "3",
                  title: "View Results",
                  description: "Click 'Check Results' to view your academic performance. You can print or download your results for your records."
                }
              ].map((instruction, index) => (
                <div key={index} className="text-center">
                  <div className={`w-16 h-16 ${index % 2 === 0 ? 'bg-red-600' : 'bg-yellow-500'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-2xl font-bold text-white">{instruction.step}</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{instruction.title}</h4>
                  <p className="text-gray-600">{instruction.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

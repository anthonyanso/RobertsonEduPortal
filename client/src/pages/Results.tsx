import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, GraduationCap, CheckCircle, AlertTriangle, Printer, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import jsPDF from 'jspdf';
import logoUrl from "@assets/logo_1751823007371.png";

const resultFormSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  pin: z.string().min(1, "Scratch card PIN is required"),
  session: z.string().min(1, "Session is required"),
  term: z.string().min(1, "Term is required"),
});

type ResultFormData = z.infer<typeof resultFormSchema>;

// PDF Download Function
const downloadResultAsPDF = (result: any, student: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentY = 10;
  
  const checkPageSpace = (requiredHeight: number) => {
    if (currentY + requiredHeight > pageHeight - 20) {
      doc.addPage();
      currentY = 20;
      return true;
    }
    return false;
  };
  
  // Load logo and add to PDF
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = function() {
    // Header Border
    doc.setLineWidth(2);
    doc.rect(10, 5, pageWidth - 20, 50);
    
    // Add logo
    doc.addImage(img, "PNG", 15, 10, 32, 32);
    
    // Header section
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("ROBERTSON EDUCATION", pageWidth / 2, 18, { align: "center" });
    
    doc.setFontSize(11);
    doc.text("Excellence in Education - Nurturing Tomorrow's Leaders", pageWidth / 2, 26, { align: "center" });
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Tel: +234 XXX XXX XXXX | Email: info@robertsoneducation.edu", pageWidth / 2, 32, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text('"Knowledge • Character • Service"', pageWidth / 2, 38, { align: "center" });
    
    // Add passport photo
    if (student && student.passportPhoto) {
      try {
        doc.addImage(student.passportPhoto, "JPEG", pageWidth - 47, 10, 32, 32);
      } catch (e) {
        doc.rect(pageWidth - 47, 10, 32, 32);
        doc.setFontSize(7);
        doc.text("PASSPORT", pageWidth - 31, 23, { align: "center" });
        doc.text("PHOTO", pageWidth - 31, 29, { align: "center" });
      }
    } else {
      doc.rect(pageWidth - 47, 10, 32, 32);
      doc.setFontSize(7);
      doc.text("PASSPORT", pageWidth - 31, 23, { align: "center" });
      doc.text("PHOTO", pageWidth - 31, 29, { align: "center" });
    }
    
    // Result sheet title
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("CONTINUOUS ASSESSMENT REPORT SHEET", pageWidth / 2, 45, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Academic Session: ${result.session} | ${result.term}`, pageWidth / 2, 52, { align: "center" });
    
    currentY = 65;
    
    // Student Information
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Student's Name: ${student.firstName} ${student.lastName}`, 15, currentY);
    doc.text(`Session: ${result.session}`, pageWidth / 2 + 10, currentY);
    currentY += 6;
    doc.text(`Admission No: ${result.studentId}`, 15, currentY);
    doc.text(`Term: ${result.term}`, pageWidth / 2 + 10, currentY);
    currentY += 6;
    doc.text(`Class: ${result.class}`, 15, currentY);
    doc.text(`No. in Class: ${result.outOf || 'N/A'}`, pageWidth / 2 + 10, currentY);
    currentY += 10;
    
    // Subjects table
    const subjects = Array.isArray(result.subjects) ? result.subjects : [];
    if (subjects.length > 0) {
      // Table headers
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      const headers = ['Subject', 'CA1', 'CA2', 'Exam', 'Total', 'Grade', 'Remark', 'Position'];
      const colWidths = [40, 20, 20, 25, 25, 20, 30, 25];
      let startX = 15;
      
      headers.forEach((header, i) => {
        doc.rect(startX, currentY, colWidths[i], 8);
        doc.text(header, startX + colWidths[i]/2, currentY + 5, { align: "center" });
        startX += colWidths[i];
      });
      currentY += 8;
      
      // Table rows
      doc.setFont("helvetica", "normal");
      subjects.forEach((subject: any) => {
        startX = 15;
        const values = [
          subject.subject || 'N/A',
          String(subject.ca1 || 'N/A'),
          String(subject.ca2 || 'N/A'),
          String(subject.exam || 'N/A'),
          String(subject.total || subject.score || 'N/A'),
          String(subject.grade || 'N/A'),
          String(subject.remark || 'N/A'),
          String(subject.position || 'N/A')
        ];
        
        values.forEach((value, i) => {
          doc.rect(startX, currentY, colWidths[i], 8);
          doc.text(value, startX + colWidths[i]/2, currentY + 5, { align: "center" });
          startX += colWidths[i];
        });
        currentY += 8;
      });
    }
    
    currentY += 10;
    
    // Performance Summary
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("PERFORMANCE SUMMARY", 15, currentY);
    currentY += 8;
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Score: ${result.totalScore || 'N/A'}`, 15, currentY);
    doc.text(`Average: ${result.average || 'N/A'}%`, 70, currentY);
    doc.text(`GPA: ${result.gpa || 'N/A'}`, 125, currentY);
    doc.text(`Position: ${result.position || 'N/A'}`, 170, currentY);
    
    currentY += 15;
    
    // Comments section
    doc.text("Class Teacher's Comment:", 15, currentY);
    doc.rect(15, currentY + 3, pageWidth - 30, 15);
    doc.text(result.classTeacherComment || 'N/A', 20, currentY + 10);
    
    currentY += 25;
    doc.text("Principal's Comment:", 15, currentY);
    doc.rect(15, currentY + 3, pageWidth - 30, 15);
    doc.text(result.principalComment || 'N/A', 20, currentY + 10);
    
    // Save PDF
    doc.save(`${student.firstName}_${student.lastName}_${result.session}_${result.term}_Result.pdf`);
  };
  
  img.onerror = function() {
    console.error("Failed to load logo image");
    // Continue without logo
    doc.save(`${student.firstName}_${student.lastName}_${result.session}_${result.term}_Result.pdf`);
  };
  
  img.src = logoUrl;
};

export default function Results() {
  const [resultData, setResultData] = useState<any>(null);
  const [showError, setShowError] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
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
      try {
        const response = await fetch("/api/verify-scratch-card", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pin: data.pin,
            studentId: data.studentId
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to verify scratch card");
        }
        
        const result = await response.json();
        return result;
      } catch (error) {
        console.error("API request failed:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("API Response:", data);
      console.log("Data structure:", {
        hasData: !!data,
        hasResults: !!data?.results,
        resultsType: Array.isArray(data?.results) ? 'array' : typeof data?.results,
        resultsLength: data?.results?.length,
        resultsContent: data?.results,
        hasStudent: !!data?.student,
        studentContent: data?.student
      });
      
      // Check if we have valid data
      if (!data || !data.student) {
        console.error("Invalid data structure - no student data:", data);
        setResultData(null);
        setShowError(true);
        toast({
          title: "Error",
          description: "Student data not found.",
          variant: "destructive",
        });
        return;
      }
      
      // Check if we have results data
      if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
        console.error("No results found for student:", data.student);
        setResultData(null);
        setShowError(true);
        toast({
          title: "No Results Available",
          description: "No results found for this student. Please contact your school administrator.",
          variant: "destructive",
        });
        return;
      }
      
      // Find the specific result matching the session and term
      const formValues = form.getValues();
      console.log("Looking for result with:", {
        session: formValues.session,
        term: formValues.term,
        availableResults: data.results.map((r: any) => ({
          session: r.session,
          term: r.term,
          id: r.id
        }))
      });
      
      const selectedResult = data.results.find((result: any) => 
        result.session === formValues.session && 
        result.term === formValues.term
      );
      
      if (selectedResult) {
        console.log("Found matching result:", selectedResult);
        
        // Parse subjects if it's a string
        let parsedResult = { ...selectedResult };
        if (typeof selectedResult.subjects === 'string') {
          try {
            parsedResult.subjects = JSON.parse(selectedResult.subjects);
          } catch (error) {
            console.error("Error parsing subjects:", error);
            parsedResult.subjects = [];
          }
        }
        
        // Ensure subjects is always an array
        if (!Array.isArray(parsedResult.subjects)) {
          parsedResult.subjects = [];
        }
        
        setResultData({
          student: data.student,
          result: parsedResult
        });
        setShowError(false);
        setShowResultModal(true);
        toast({
          title: "Result Found",
          description: "Your academic results have been retrieved successfully.",
        });
      } else {
        console.log("No matching result found");
        setResultData(null);
        setShowError(true);
        toast({
          title: "No Result Found",
          description: `No result found for ${formValues.session} - ${formValues.term}. Available results: ${data.results.map((r: any) => `${r.session} ${r.term}`).join(', ')}`,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error("API Error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
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

            {/* Results Modal */}
            <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-center">
                    Robertson Education - Academic Result
                  </DialogTitle>
                  <p className="text-center text-gray-600">
                    {resultData?.result?.session} - {resultData?.result?.term}
                  </p>
                </DialogHeader>
                
                {resultData && (
                  <div className="space-y-6" id="printable-result">
                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4 mb-6">
                      <Button
                        onClick={() => window.print()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                      >
                        <Printer size={20} />
                        Print Result
                      </Button>
                      <Button
                        onClick={() => downloadResultAsPDF(resultData.result, resultData.student)}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                      >
                        <Download size={20} />
                        Download PDF
                      </Button>
                    </div>
                    
                    {/* Nigerian Result Template */}
                    <div className="bg-white p-4 font-serif print:p-2 print:bg-white" style={{ fontFamily: 'Times New Roman, serif' }}>
                      {/* Header */}
                      <div className="border-4 border-double border-black p-2 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="h-12 w-12 border-2 border-black flex items-center justify-center bg-white">
                            <img 
                              src={logoUrl} 
                              alt="Robertson Education Centre" 
                              className="h-12 w-12 object-contain"
                              style={{
                                width: '48px',
                                height: '48px',
                                objectFit: 'contain',
                                display: 'block',
                                opacity: 1,
                                visibility: 'visible'
                              }}
                            />
                          </div>
                          <div className="text-center flex-1">
                            <h1 className="text-lg font-bold text-blue-900">ROBERTSON EDUCATION</h1>
                            <p className="text-xs text-gray-600">Excellence in Education - Nurturing Tomorrow's Leaders</p>
                            <p className="text-xs text-gray-500">
                              Tel: +234 XXX XXX XXXX | Email: info@robertsoneducation.edu
                            </p>
                            <p className="text-xs font-semibold text-blue-800">"Knowledge • Character • Service"</p>
                          </div>
                          <div className="h-12 w-12 border-2 border-gray-300 flex items-center justify-center bg-gray-50">
                            <img 
                              src={`/api/student-photo/${resultData.student?.studentId}`}
                              alt="Student Passport" 
                              className="h-12 w-12 object-cover"
                              style={{
                                width: '48px',
                                height: '48px',
                                objectFit: 'cover',
                                display: 'block',
                                opacity: 1,
                                visibility: 'visible'
                              }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                                if (placeholder) {
                                  placeholder.style.display = 'flex';
                                }
                              }}
                            />
                            <span className="text-xs text-gray-400 w-full h-full flex items-center justify-center" style={{ display: 'none' }}>
                              PASSPORT
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-center border-t border-b py-1">
                          <h2 className="text-base font-bold">CONTINUOUS ASSESSMENT REPORT SHEET</h2>
                          <p className="text-xs">Academic Session: {resultData.result.session} | {resultData.result.term}</p>
                        </div>
                      </div>

                      {/* Student Information */}
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="space-y-1">
                          <div className="flex">
                            <span className="font-semibold text-xs w-24">Student's Name:</span>
                            <span className="border-b border-dotted border-gray-400 flex-1 pl-1 text-xs">
                              {resultData.student ? `${resultData.student.firstName} ${resultData.student.lastName}` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="font-semibold text-xs w-24">Admission No:</span>
                            <span className="border-b border-dotted border-gray-400 flex-1 pl-1 text-xs">
                              {resultData.result.studentId}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="font-semibold text-xs w-24">Class:</span>
                            <span className="border-b border-dotted border-gray-400 flex-1 pl-1 text-xs">
                              {resultData.result.class}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="font-semibold text-xs w-24">Age:</span>
                            <span className="border-b border-dotted border-gray-400 flex-1 pl-1 text-xs">
                              {resultData.student?.dateOfBirth ? new Date().getFullYear() - new Date(resultData.student.dateOfBirth).getFullYear() : 'N/A'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex">
                            <span className="font-semibold text-xs w-24">Session:</span>
                            <span className="border-b border-dotted border-gray-400 flex-1 pl-1 text-xs">
                              {resultData.result.session}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="font-semibold text-xs w-24">Term:</span>
                            <span className="border-b border-dotted border-gray-400 flex-1 pl-1 text-xs">
                              {resultData.result.term}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="font-semibold text-xs w-24">No. in Class:</span>
                            <span className="border-b border-dotted border-gray-400 flex-1 pl-1 text-xs">
                              {resultData.result.outOf || 'N/A'}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="font-semibold text-xs w-24">Position:</span>
                            <span className="border-b border-dotted border-gray-400 flex-1 pl-1 text-xs">
                              {resultData.result.position || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Subjects Table */}
                      <div className="mb-3">
                        <table className="w-full border-collapse border border-black text-xs">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-black px-2 py-1 text-left">SUBJECTS</th>
                              <th className="border border-black px-2 py-1 text-center">CA1 (20)</th>
                              <th className="border border-black px-2 py-1 text-center">CA2 (20)</th>
                              <th className="border border-black px-2 py-1 text-center">EXAM (60)</th>
                              <th className="border border-black px-2 py-1 text-center">TOTAL (100)</th>
                              <th className="border border-black px-2 py-1 text-center">GRADE</th>
                              <th className="border border-black px-2 py-1 text-center">REMARK</th>
                              <th className="border border-black px-2 py-1 text-center">POSITION</th>
                            </tr>
                          </thead>
                          <tbody>
                            {resultData.result.subjects && Array.isArray(resultData.result.subjects) && resultData.result.subjects.length > 0 ? (
                              resultData.result.subjects.map((subject: any, index: number) => (
                                <tr key={index}>
                                  <td className="border border-black px-2 py-1 font-medium">
                                    {String(subject.subject || 'N/A')}
                                  </td>
                                  <td className="border border-black px-2 py-1 text-center">
                                    {String(subject.ca1 || 'N/A')}
                                  </td>
                                  <td className="border border-black px-2 py-1 text-center">
                                    {String(subject.ca2 || 'N/A')}
                                  </td>
                                  <td className="border border-black px-2 py-1 text-center">
                                    {String(subject.exam || 'N/A')}
                                  </td>
                                  <td className="border border-black px-2 py-1 text-center font-bold">
                                    {String(subject.total || subject.score || 'N/A')}
                                  </td>
                                  <td className="border border-black px-2 py-1 text-center font-bold">
                                    {String(subject.grade || 'N/A')}
                                  </td>
                                  <td className="border border-black px-2 py-1 text-center">
                                    {String(subject.remark || 'N/A')}
                                  </td>
                                  <td className="border border-black px-2 py-1 text-center">
                                    {String(subject.position || 'N/A')}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={8} className="border border-black px-2 py-1 text-center text-gray-500">
                                  No subjects data available
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Performance Summary */}
                      <div className="grid grid-cols-4 gap-2 mb-3 text-xs">
                        <div className="border border-black p-2 text-center">
                          <p className="font-semibold">Total Score</p>
                          <p className="font-bold text-blue-600">{String(resultData.result.totalScore || 'N/A')}</p>
                        </div>
                        <div className="border border-black p-2 text-center">
                          <p className="font-semibold">Average</p>
                          <p className="font-bold text-green-600">{String(resultData.result.average || 'N/A')}%</p>
                        </div>
                        <div className="border border-black p-2 text-center">
                          <p className="font-semibold">GPA</p>
                          <p className="font-bold text-purple-600">{String(resultData.result.gpa || 'N/A')}</p>
                        </div>
                        <div className="border border-black p-2 text-center">
                          <p className="font-semibold">Position</p>
                          <p className="font-bold text-orange-600">{String(resultData.result.position || 'N/A')}</p>
                        </div>
                      </div>

                      {/* Comments */}
                      <div className="space-y-2 text-xs">
                        <div className="border border-black p-2">
                          <p className="font-semibold mb-1">Class Teacher's Comment:</p>
                          <p className="min-h-[20px]">{String(resultData.result.classTeacherComment || 'N/A')}</p>
                        </div>
                        <div className="border border-black p-2">
                          <p className="font-semibold mb-1">Principal's Comment:</p>
                          <p className="min-h-[20px]">{String(resultData.result.principalComment || 'N/A')}</p>
                        </div>
                      </div>

                      {/* Signatures */}
                      <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
                        <div className="text-center">
                          <div className="border-b border-black w-32 mx-auto mb-1"></div>
                          <p>Class Teacher's Signature</p>
                        </div>
                        <div className="text-center">
                          <div className="border-b border-black w-32 mx-auto mb-1"></div>
                          <p>Principal's Signature</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

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
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, GraduationCap, CheckCircle, AlertTriangle, Printer, Download, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

// Print function that only prints the result content
const printResult = (result: any, student: any) => {
  const printContent = document.getElementById('result-print-content');
  if (!printContent) return;
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Student Result - ${student.firstName} ${student.lastName}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: Arial, sans-serif;
          font-size: 10pt;
          line-height: 1.2;
          color: #000;
          background: white;
          padding: 10px;
        }
        
        .result-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
        }
        
        .header {
          text-align: center;
          border: 2px solid #000;
          padding: 10px;
          margin-bottom: 10px;
          position: relative;
          min-height: 80px;
        }
        
        .logo {
          position: absolute;
          left: 10px;
          top: 10px;
          width: 60px;
          height: 60px;
        }
        
        .passport {
          position: absolute;
          right: 10px;
          top: 10px;
          width: 60px;
          height: 60px;
          border: 1px solid #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8pt;
          background: #f9f9f9;
        }
        
        .school-name {
          font-size: 16pt;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .school-motto {
          font-size: 10pt;
          margin-bottom: 3px;
        }
        
        .school-contact {
          font-size: 8pt;
          margin-bottom: 5px;
        }
        
        .result-title {
          font-size: 12pt;
          font-weight: bold;
          text-decoration: underline;
          margin-top: 10px;
        }
        
        .student-info {
          margin: 10px 0;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 10px;
        }
        
        .info-item {
          display: flex;
          align-items: center;
          font-size: 9pt;
        }
        
        .info-label {
          font-weight: bold;
          min-width: 80px;
        }
        
        .info-value {
          border-bottom: 1px dotted #000;
          flex: 1;
          padding-left: 5px;
        }
        
        .subjects-table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
          font-size: 9pt;
        }
        
        .subjects-table th,
        .subjects-table td {
          border: 1px solid #000;
          padding: 4px;
          text-align: center;
        }
        
        .subjects-table th {
          background: #f0f0f0;
          font-weight: bold;
        }
        
        .subjects-table td:first-child {
          text-align: left;
        }
        
        .performance-summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 5px;
          margin: 10px 0;
        }
        
        .summary-item {
          border: 1px solid #000;
          padding: 5px;
          text-align: center;
          font-size: 9pt;
        }
        
        .summary-label {
          font-weight: bold;
          margin-bottom: 3px;
        }
        
        .summary-value {
          font-weight: bold;
        }
        
        .comments {
          margin: 10px 0;
        }
        
        .comment-box {
          border: 1px solid #000;
          padding: 8px;
          margin-bottom: 8px;
          min-height: 30px;
        }
        
        .comment-label {
          font-weight: bold;
          margin-bottom: 5px;
          font-size: 9pt;
        }
        
        .comment-text {
          font-size: 9pt;
          line-height: 1.3;
        }
        
        .signatures {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 20px;
        }
        
        .signature {
          text-align: center;
          font-size: 9pt;
        }
        
        .signature-line {
          border-bottom: 1px solid #000;
          width: 120px;
          margin: 0 auto 5px;
          height: 20px;
        }
        
        @media print {
          body { margin: 0; padding: 5px; }
          .result-container { margin: 0; }
        }
      </style>
    </head>
    <body>
      ${printContent.innerHTML}
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  
  // Wait for content to load then print
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};

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
    // Header Border - thin line
    doc.setLineWidth(0.3);
    doc.rect(10, 5, pageWidth - 20, 55);
    
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
    doc.text("Tel: +2348146373297, +2347016774165 | Email: robertsonvocational@gmail.com", pageWidth / 2, 32, { align: "center" });
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("1. Theo Okeke's Close, Ozuda Market Area, Obosi Anambra State. Reg No:7779525", pageWidth / 2, 38, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text('"Knowledge • Character • Service"', pageWidth / 2, 44, { align: "center" });
    
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
    doc.text("CONTINUOUS ASSESSMENT REPORT SHEET", pageWidth / 2, 50, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Academic Session: ${result.session} | ${result.term}`, pageWidth / 2, 57, { align: "center" });
    
    currentY = 70;
    
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
      // Set thin line width for table
      doc.setLineWidth(0.3);
      
      // Table headers
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      const headers = ['Subject', 'CA1', 'CA2', 'Exam', 'Total', 'Grade', 'Remark', 'Position'];
      const colWidths = [40, 20, 20, 25, 25, 20, 30, 25];
      let startX = 15;
      
      // Check if table header fits on current page
      checkPageSpace(8);
      
      headers.forEach((header, i) => {
        doc.rect(startX, currentY, colWidths[i], 8);
        doc.text(header, startX + colWidths[i]/2, currentY + 5, { align: "center" });
        startX += colWidths[i];
      });
      currentY += 8;
      
      // Table rows
      doc.setFont("helvetica", "normal");
      subjects.forEach((subject: any) => {
        // Check if row fits on current page
        if (checkPageSpace(8)) {
          // If new page added, redraw headers
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          startX = 15;
          headers.forEach((header, i) => {
            doc.rect(startX, currentY, colWidths[i], 8);
            doc.text(header, startX + colWidths[i]/2, currentY + 5, { align: "center" });
            startX += colWidths[i];
          });
          currentY += 8;
          doc.setFont("helvetica", "normal");
        }
        
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
    checkPageSpace(25);
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
    
    // Comments section with thin borders
    checkPageSpace(45);
    doc.setLineWidth(0.3);
    doc.text("Class Teacher's Comment:", 15, currentY);
    doc.rect(15, currentY + 3, pageWidth - 30, 15);
    const classTeacherComment = result.classTeacherComment || 'Excellent performance. Keep up the good work!';
    doc.text(classTeacherComment, 20, currentY + 10);
    
    currentY += 25;
    doc.text("Principal's Comment:", 15, currentY);
    doc.rect(15, currentY + 3, pageWidth - 30, 15);
    const principalComment = result.principalComment || 'Well done. Continue to strive for excellence.';
    doc.text(principalComment, 20, currentY + 10);
    
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
  const [dynamicSessions, setDynamicSessions] = useState<string[]>([]);
  const { toast } = useToast();

  // Check if result checker is enabled
  const { data: settings = [] } = useQuery({
    queryKey: ["/api/admin/school-info"],
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds cache
  });

  const settingsMap = settings.reduce((acc: any, setting: any) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});

  const isResultCheckerEnabled = settingsMap.enable_result_checker === 'true';
  const isAdmissionsEnabled = settingsMap.enable_admissions === 'true';
  const isNewsSystemEnabled = settingsMap.enable_news_system === 'true';

  // Generate dynamic sessions based on current calendar and academic year
  useEffect(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-11 (January = 0)
    
    const sessions = [];
    
    // Academic year runs from September to August
    // If current month is September to December, current academic year is currentYear/currentYear+1
    // If current month is January to August, current academic year is currentYear-1/currentYear
    
    let currentAcademicYear: number;
    if (currentMonth >= 8) { // September (8) to December (11)
      currentAcademicYear = currentYear;
    } else { // January (0) to August (7)
      currentAcademicYear = currentYear - 1;
    }
    
    // Generate sessions for past 2 years, current year, and next 2 years
    for (let i = -2; i <= 2; i++) {
      const sessionStartYear = currentAcademicYear + i;
      const sessionEndYear = sessionStartYear + 1;
      sessions.push(`${sessionStartYear}/${sessionEndYear}`);
    }
    
    setDynamicSessions(sessions);
  }, []);

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
        
        // Process subjects to replace N/A with meaningful defaults
        const processedSubjects = parsedResult.subjects.map((subject: any) => ({
          ...subject,
          subject: subject.subject || 'Mathematics',
          ca1: subject.ca1 || 0,
          ca2: subject.ca2 || 0,
          exam: subject.exam || 0,
          total: subject.total || subject.score || 0,
          grade: subject.grade || 'F',
          remark: subject.remark || 'Fair',
          position: subject.position || 'N/A'
        }));
        
        // Process result data with meaningful defaults
        const processedResult = {
          ...parsedResult,
          subjects: processedSubjects,
          totalScore: parsedResult.totalScore || 0,
          average: parsedResult.average || 0,
          gpa: parsedResult.gpa || '0.0',
          position: parsedResult.position || 'N/A',
          classTeacherComment: parsedResult.classTeacherComment || 'Good performance. Continue to work hard.',
          principalComment: parsedResult.principalComment || 'Keep up the good work. Strive for excellence.',
          attendance: parsedResult.attendance || 'Excellent',
          behavioralRating: parsedResult.behavioralRating || 'Good'
        };
        
        setResultData({
          student: data.student,
          result: processedResult
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
                {!isResultCheckerEnabled ? (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-800">Result Checker Disabled</AlertTitle>
                    <AlertDescription className="text-red-700">
                      The result checking system is currently disabled by the school administrator. 
                      Please contact the school office for assistance or check back later.
                    </AlertDescription>
                  </Alert>
                ) : (
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
                              {dynamicSessions.map((session) => (
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
                )}
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
                  <div className="space-y-6">
                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4 mb-6">
                      <Button
                        onClick={() => printResult(resultData.result, resultData.student)}
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
                    
                    {/* Student Information Card */}
                    <div className="border rounded-lg p-4 mb-6 bg-gray-50">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700">Student Name:</span>
                            <span className="text-gray-900">
                              {resultData.student ? `${resultData.student.firstName} ${resultData.student.lastName}` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700">Student ID:</span>
                            <span className="text-gray-900">{resultData.result.studentId}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700">Class:</span>
                            <span className="text-gray-900">{resultData.result.class}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700">Session:</span>
                            <span className="text-gray-900">{resultData.result.session}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700">Term:</span>
                            <span className="text-gray-900">{resultData.result.term}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700">Position:</span>
                            <span className="text-gray-900">{resultData.result.position || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Subjects Table */}
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left font-semibold text-gray-700">Subject</th>
                            <th className="px-4 py-2 text-center font-semibold text-gray-700">CA1</th>
                            <th className="px-4 py-2 text-center font-semibold text-gray-700">CA2</th>
                            <th className="px-4 py-2 text-center font-semibold text-gray-700">Exam</th>
                            <th className="px-4 py-2 text-center font-semibold text-gray-700">Total</th>
                            <th className="px-4 py-2 text-center font-semibold text-gray-700">Grade</th>
                            <th className="px-4 py-2 text-center font-semibold text-gray-700">Remark</th>
                            <th className="px-4 py-2 text-center font-semibold text-gray-700">Position</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {resultData.result.subjects && Array.isArray(resultData.result.subjects) && resultData.result.subjects.length > 0 ? (
                            resultData.result.subjects.map((subject: any, index: number) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-2 font-medium text-gray-900">{String(subject.subject || 'N/A')}</td>
                                <td className="px-4 py-2 text-center text-gray-700">{String(subject.ca1 || 'N/A')}</td>
                                <td className="px-4 py-2 text-center text-gray-700">{String(subject.ca2 || 'N/A')}</td>
                                <td className="px-4 py-2 text-center text-gray-700">{String(subject.exam || 'N/A')}</td>
                                <td className="px-4 py-2 text-center font-semibold text-gray-900">{String(subject.total || subject.score || 'N/A')}</td>
                                <td className={`px-4 py-2 text-center font-semibold ${getGradeColor(subject.grade)}`}>
                                  {String(subject.grade || 'N/A')}
                                </td>
                                <td className={`px-4 py-2 text-center ${getRemarkColor(subject.remark)}`}>
                                  {String(subject.remark || 'N/A')}
                                </td>
                                <td className="px-4 py-2 text-center text-gray-700">{String(subject.position || 'N/A')}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={8} className="px-4 py-8 text-center text-gray-500">No subjects data available</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Performance Summary */}
                    <div className="grid grid-cols-4 gap-4 mt-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{String(resultData.result.totalScore || 'N/A')}</div>
                        <div className="text-sm text-blue-700">Total Score</div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{String(resultData.result.average || 'N/A')}%</div>
                        <div className="text-sm text-green-700">Average</div>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">{String(resultData.result.gpa || 'N/A')}</div>
                        <div className="text-sm text-purple-700">GPA</div>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">{String(resultData.result.position || 'N/A')}</div>
                        <div className="text-sm text-orange-700">Position</div>
                      </div>
                    </div>

                    {/* Comments Section */}
                    <div className="grid grid-cols-1 gap-4 mt-6">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-700 mb-2">Class Teacher's Comment</h4>
                        <p className="text-gray-600">{String(resultData.result.classTeacherComment || 'Excellent performance. Keep up the good work!')}</p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-700 mb-2">Principal's Comment</h4>
                        <p className="text-gray-600">{String(resultData.result.principalComment || 'Well done. Continue to strive for excellence.')}</p>
                      </div>
                    </div>
                    
                    {/* Hidden Print Content */}
                    <div id="result-print-content" className="result-container" style={{ display: 'none' }}>
                      <div className="header">
                        <img src={logoUrl} alt="Robertson Education Centre" className="logo" />
                        <div className="passport">
                          <img 
                            src={`/api/student-photo/${resultData.student?.studentId}`}
                            alt="Student Passport" 
                            style={{
                              width: '60px',
                              height: '60px',
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
                        <div className="school-name">ROBERTSON EDUCATION</div>
                        <div className="school-motto">Excellence in Education - Nurturing Tomorrow's Leaders</div>
                        <div className="school-contact">
                          Tel: +2348146373297, +2347016774165 | Email: robertsonvocational@gmail.com
                        </div>
                        <div className="school-contact">1. Theo Okeke's Close, Ozuda Market Area, Obosi Anambra State. Reg No:7779525</div>
                        <div className="school-contact">"Knowledge • Character • Service"</div>
                        <div className="result-title">CONTINUOUS ASSESSMENT REPORT SHEET</div>
                        <div style={{ fontSize: '9pt', marginTop: '5px' }}>Academic Session: {resultData.result.session} | {resultData.result.term}</div>
                      </div>

                      <div className="student-info">
                        <div className="info-grid">
                          <div className="info-item">
                            <span className="info-label">Student's Name:</span>
                            <span className="info-value">
                              {resultData.student ? `${resultData.student.firstName} ${resultData.student.lastName}` : 'N/A'}
                            </span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Session:</span>
                            <span className="info-value">{resultData.result.session}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Admission No:</span>
                            <span className="info-value">{resultData.result.studentId}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Term:</span>
                            <span className="info-value">{resultData.result.term}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Class:</span>
                            <span className="info-value">{resultData.result.class || 'N/A'}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">No. in Class:</span>
                            <span className="info-value">{resultData.result.outOf || 'N/A'}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Position:</span>
                            <span className="info-value">{resultData.result.position || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <table className="subjects-table">
                        <thead>
                          <tr>
                            <th>SUBJECTS</th>
                            <th>CA1 (20)</th>
                            <th>CA2 (20)</th>
                            <th>EXAM (60)</th>
                            <th>TOTAL (100)</th>
                            <th>GRADE</th>
                            <th>REMARK</th>
                            <th>POSITION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resultData.result.subjects && Array.isArray(resultData.result.subjects) && resultData.result.subjects.length > 0 ? (
                            resultData.result.subjects.map((subject: any, index: number) => (
                              <tr key={index}>
                                <td style={{ textAlign: 'left' }}>{String(subject.subject || 'N/A')}</td>
                                <td>{String(subject.ca1 || 'N/A')}</td>
                                <td>{String(subject.ca2 || 'N/A')}</td>
                                <td>{String(subject.exam || 'N/A')}</td>
                                <td>{String(subject.total || subject.score || 'N/A')}</td>
                                <td>{String(subject.grade || 'N/A')}</td>
                                <td>{String(subject.remark || 'N/A')}</td>
                                <td>{String(subject.position || 'N/A')}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={8} style={{ textAlign: 'center', color: '#666' }}>No subjects data available</td>
                            </tr>
                          )}
                        </tbody>
                      </table>

                      <div className="performance-summary">
                        <div className="summary-item">
                          <div className="summary-label">Total Score</div>
                          <div className="summary-value">{String(resultData.result.totalScore || 'N/A')}</div>
                        </div>
                        <div className="summary-item">
                          <div className="summary-label">Average</div>
                          <div className="summary-value">{String(resultData.result.average || 'N/A')}%</div>
                        </div>
                        <div className="summary-item">
                          <div className="summary-label">GPA</div>
                          <div className="summary-value">{String(resultData.result.gpa || 'N/A')}</div>
                        </div>
                        <div className="summary-item">
                          <div className="summary-label">Position</div>
                          <div className="summary-value">{String(resultData.result.position || 'N/A')}</div>
                        </div>
                      </div>

                      <div className="comments">
                        <div className="comment-box">
                          <div className="comment-label">Class Teacher's Comment:</div>
                          <div className="comment-text">{String(resultData.result.classTeacherComment || 'N/A')}</div>
                        </div>
                        <div className="comment-box">
                          <div className="comment-label">Principal's Comment:</div>
                          <div className="comment-text">{String(resultData.result.principalComment || 'N/A')}</div>
                        </div>
                      </div>

                      <div className="signatures">
                        <div className="signature">
                          <div className="signature-line"></div>
                          <div>Class Teacher's Signature</div>
                        </div>
                        <div className="signature">
                          <div className="signature-line"></div>
                          <div>Principal's Signature</div>
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
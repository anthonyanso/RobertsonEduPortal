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
import jsPDF from 'jspdf';
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

  // Generate PDF function
  const generateResultPDF = (result: any, student: any) => {
    const doc = new jsPDF();
    
    // Set font
    doc.setFont('helvetica', 'normal');
    
    // Page border
    doc.setLineWidth(2);
    doc.rect(10, 10, 190, 277);
    doc.setLineWidth(1);
    doc.rect(12, 12, 186, 273);
    
    // Header section with logo and passport area
    let yPos = 20;
    
    // School logo (left side) - Use original logo
    // Since we can't easily embed PNG in jsPDF without conversion, use text representation
    doc.setFillColor(220, 38, 38); // Red color matching the original logo
    doc.rect(20, yPos, 25, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ROBERTSON', 32.5, yPos + 10, { align: 'center' });
    doc.text('EDUCATION', 32.5, yPos + 15, { align: 'center' });
    doc.text('CENTRE', 32.5, yPos + 20, { align: 'center' });
    
    // School header (center)
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('ROBERTSON EDUCATION', 105, yPos + 5, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Excellence in Education - Nurturing Tomorrow\'s Leaders', 105, yPos + 12, { align: 'center' });
    doc.text('Tel: +234 XXX XXX XXXX | Email: info@robertsoneducation.edu', 105, yPos + 17, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('"Knowledge • Character • Service"', 105, yPos + 22, { align: 'center' });
    
    // Passport placeholder (right side)
    doc.setLineWidth(1);
    doc.rect(155, yPos, 25, 25);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('PASSPORT', 167.5, yPos + 13, { align: 'center' });
    
    // Result title with border
    yPos += 35;
    doc.setLineWidth(1);
    doc.rect(20, yPos, 160, 15);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CONTINUOUS ASSESSMENT REPORT SHEET', 100, yPos + 5, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Academic Session: ${result.session} | ${result.term}`, 100, yPos + 11, { align: 'center' });
    
    // Student Information section
    yPos += 25;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Left column student info
    doc.text(`Student's Name:`, 20, yPos);
    doc.text(`${student ? student.firstName + ' ' + student.lastName : 'N/A'}`, 65, yPos);
    doc.line(65, yPos + 1, 145, yPos + 1);
    
    doc.text(`Admission No:`, 20, yPos + 8);
    doc.text(`${result.studentId}`, 65, yPos + 8);
    doc.line(65, yPos + 9, 145, yPos + 9);
    
    doc.text(`Class:`, 20, yPos + 16);
    doc.text(`${result.class}`, 65, yPos + 16);
    doc.line(65, yPos + 17, 145, yPos + 17);
    
    doc.text(`Age:`, 20, yPos + 24);
    doc.text(`${student?.dateOfBirth ? new Date().getFullYear() - new Date(student.dateOfBirth).getFullYear() : 'N/A'}`, 65, yPos + 24);
    doc.line(65, yPos + 25, 145, yPos + 25);
    
    // Right column student info
    doc.text(`Session:`, 150, yPos);
    doc.text(`${result.session}`, 170, yPos);
    doc.line(170, yPos + 1, 190, yPos + 1);
    
    doc.text(`Term:`, 150, yPos + 8);
    doc.text(`${result.term}`, 170, yPos + 8);
    doc.line(170, yPos + 9, 190, yPos + 9);
    
    doc.text(`No. in Class:`, 150, yPos + 16);
    doc.text(`${result.outOf || 'N/A'}`, 180, yPos + 16);
    doc.line(180, yPos + 17, 190, yPos + 17);
    
    doc.text(`Position:`, 150, yPos + 24);
    doc.text(`${result.position && result.outOf ? result.position + ' out of ' + result.outOf : 'N/A'}`, 170, yPos + 24);
    doc.line(170, yPos + 25, 190, yPos + 25);
    
    // Academic Performance Table
    yPos += 40;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ACADEMIC PERFORMANCE', 100, yPos, { align: 'center' });
    
    yPos += 10;
    
    // Table headers
    const headers = ['SUBJECTS', '1st CA\n(20)', '2nd CA\n(20)', 'EXAM\n(60)', 'TOTAL\n(100)', 'GRADE', 'REMARK', 'POSITION'];
    const colWidths = [40, 18, 18, 18, 18, 18, 32, 18];
    let xPos = 20;
    
    // Header row
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    headers.forEach((header, index) => {
      doc.rect(xPos, yPos, colWidths[index], 12);
      const lines = header.split('\n');
      if (lines.length > 1) {
        doc.text(lines[0], xPos + colWidths[index]/2, yPos + 4, { align: 'center' });
        doc.text(lines[1], xPos + colWidths[index]/2, yPos + 8, { align: 'center' });
      } else {
        doc.text(header, xPos + colWidths[index]/2, yPos + 7, { align: 'center' });
      }
      xPos += colWidths[index];
    });
    
    yPos += 12;
    doc.setFont('helvetica', 'normal');
    
    // Table data
    if (result.subjects && result.subjects.length > 0) {
      result.subjects.forEach((subject: any, index: number) => {
        xPos = 20;
        const rowData = [
          subject.subject || 'N/A',
          (subject.ca1 || 0).toString(),
          (subject.ca2 || 0).toString(),
          (subject.exam || 0).toString(),
          (subject.total || 0).toString(),
          subject.grade || 'N/A',
          subject.remark || (subject.grade?.includes('A') ? 'Excellent' : 
                           subject.grade?.includes('B') ? 'Good' : 
                           subject.grade?.includes('C') ? 'Credit' : 
                           subject.grade?.includes('D') ? 'Pass' : 'Fail'),
          (subject.position || (index + 1)).toString()
        ];
        
        rowData.forEach((data, colIndex) => {
          doc.rect(xPos, yPos, colWidths[colIndex], 10);
          if (colIndex === 0) {
            doc.text(data, xPos + 2, yPos + 6);
          } else {
            doc.text(data, xPos + colWidths[colIndex]/2, yPos + 6, { align: 'center' });
          }
          xPos += colWidths[colIndex];
        });
        
        yPos += 10;
      });
    }
    
    // Summary row
    xPos = 20;
    doc.setFont('helvetica', 'bold');
    
    // Total label
    const totalColWidth = colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3];
    doc.rect(xPos, yPos, totalColWidth, 10);
    doc.text('TOTAL', xPos + totalColWidth/2, yPos + 6, { align: 'center' });
    xPos += totalColWidth;
    
    // Total score
    doc.rect(xPos, yPos, colWidths[4], 10);
    doc.text((result.totalScore || 0).toString(), xPos + colWidths[4]/2, yPos + 6, { align: 'center' });
    xPos += colWidths[4];
    
    // Grade column
    doc.rect(xPos, yPos, colWidths[5], 10);
    doc.text('-', xPos + colWidths[5]/2, yPos + 6, { align: 'center' });
    xPos += colWidths[5];
    
    // Average and GPA
    doc.rect(xPos, yPos, colWidths[6] + colWidths[7], 10);
    doc.text(`AVG: ${result.average || 0}%`, xPos + (colWidths[6] + colWidths[7])/2 - 15, yPos + 6, { align: 'center' });
    doc.text(`GPA: ${result.gpa || 0}`, xPos + (colWidths[6] + colWidths[7])/2 + 15, yPos + 6, { align: 'center' });
    
    yPos += 20;
    
    // Performance Summary boxes
    const performanceBoxes = [
      { label: 'TOTAL SCORE', value: result.totalScore || 0 },
      { label: 'AVERAGE', value: `${result.average || 0}%` },
      { label: 'GRADE POINT', value: `${result.gpa || 0}/4.0` },
      { label: 'OVERALL GRADE', value: result.average >= 70 ? 'A' : result.average >= 60 ? 'B' : result.average >= 50 ? 'C' : result.average >= 40 ? 'D' : 'F' }
    ];
    
    xPos = 20;
    const boxWidth = 37.5;
    const boxHeight = 20;
    
    performanceBoxes.forEach((box) => {
      doc.rect(xPos, yPos, boxWidth, boxHeight);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(box.label, xPos + boxWidth/2, yPos + 6, { align: 'center' });
      doc.setFontSize(14);
      doc.text(box.value.toString(), xPos + boxWidth/2, yPos + 15, { align: 'center' });
      xPos += boxWidth;
    });
    
    yPos += 30;
    
    // Comments section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('COMMENTS', 100, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(10);
    doc.text('CLASS TEACHER\'S COMMENT:', 20, yPos);
    yPos += 5;
    doc.rect(20, yPos, 160, 15);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    const teacherComment = result.classTeacher ? 
      `${result.average >= 75 ? 'Excellent performance. Keep up the good work!' : 
        result.average >= 70 ? 'Very good performance. You can do better.' : 
        result.average >= 65 ? 'Good performance. Work harder.' : 
        result.average >= 60 ? 'Fair performance. You need to improve.' : 
        'Poor performance. You need serious improvement.'} - ${result.classTeacher}` : 
      (result.average >= 75 ? 'Excellent performance. Keep up the good work!' : 
       result.average >= 70 ? 'Very good performance. You can do better.' : 
       result.average >= 65 ? 'Good performance. Work harder.' : 
       result.average >= 60 ? 'Fair performance. You need to improve.' : 
       'Poor performance. You need serious improvement.');
    
    doc.text(teacherComment, 22, yPos + 5);
    
    yPos += 20;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('PRINCIPAL\'S COMMENT:', 20, yPos);
    yPos += 5;
    doc.rect(20, yPos, 160, 15);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(result.principalComment || 'Keep up the good work and continue to strive for excellence.', 22, yPos + 5);
    
    // Add new page for signatures if needed
    if (yPos > 240) {
      doc.addPage();
      yPos = 30;
    } else {
      yPos += 25;
    }
    
    // Signatures section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SIGNATURES', 100, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    // Three signature boxes
    const sigBoxWidth = 50;
    const sigBoxHeight = 30;
    xPos = 20;
    
    // Class Teacher
    doc.rect(xPos, yPos, sigBoxWidth, sigBoxHeight);
    doc.text('Class Teacher\'s Signature', xPos + sigBoxWidth/2, yPos + 20, { align: 'center' });
    doc.text('Date: ____________', xPos + sigBoxWidth/2, yPos + 25, { align: 'center' });
    
    // Principal
    xPos += sigBoxWidth + 10;
    doc.rect(xPos, yPos, sigBoxWidth, sigBoxHeight);
    doc.text('Principal\'s Signature', xPos + sigBoxWidth/2, yPos + 20, { align: 'center' });
    doc.text('Date: ____________', xPos + sigBoxWidth/2, yPos + 25, { align: 'center' });
    
    // Parent/Guardian
    xPos += sigBoxWidth + 10;
    doc.rect(xPos, yPos, sigBoxWidth, sigBoxHeight);
    doc.text('Parent/Guardian\'s Signature', xPos + sigBoxWidth/2, yPos + 20, { align: 'center' });
    doc.text('Date: ____________', xPos + sigBoxWidth/2, yPos + 25, { align: 'center' });
    
    yPos += 40;
    
    // Footer information
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Next Term Begins: ${result.nextTermBegins || 'Date to be announced'}`, 20, yPos);
    
    // Skills Assessment if available
    if (result.skillsAssessment && Object.keys(result.skillsAssessment).length > 0) {
      yPos += 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('SKILLS ASSESSMENT:', 20, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      
      Object.entries(result.skillsAssessment).forEach(([skill, rating]: [string, any]) => {
        doc.text(`${skill}: ${rating}`, 25, yPos);
        yPos += 4;
      });
    }
    
    // Attendance if available
    if (result.attendance) {
      yPos += 5;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('ATTENDANCE RECORD:', 20, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Days Present: ${result.attendance.present || 0}`, 25, yPos);
      doc.text(`Days Absent: ${result.attendance.absent || 0}`, 100, yPos);
      doc.text(`Times Late: ${result.attendance.late || 0}`, 150, yPos);
    }
    
    // Footer
    yPos += 15;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('This is a computer-generated result sheet from Robertson Education Management System.', 100, yPos, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString()}`, 100, yPos + 4, { align: 'center' });
    
    // Save the PDF
    const fileName = `Result_${student ? student.firstName + '_' + student.lastName : result.studentId}_${result.session}_${result.term}.pdf`;
    doc.save(fileName);
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
                  // Create a new window for printing
                  const printWindow = window.open('', '_blank', 'width=800,height=600');
                  if (printWindow && selectedResult) {
                    const student = getStudentInfo(selectedResult.studentId);
                    
                    // Create the print content
                    const printContent = `
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <title>Student Result - ${student ? student.firstName + ' ' + student.lastName : selectedResult.studentId}</title>
                          <style>
                            * {
                              margin: 0;
                              padding: 0;
                              box-sizing: border-box;
                            }
                            
                            body {
                              font-family: 'Times New Roman', serif;
                              font-size: 12pt;
                              line-height: 1.2;
                              color: #000;
                              background: #fff;
                            }
                            
                            .container {
                              max-width: 800px;
                              margin: 0 auto;
                              padding: 20px;
                            }
                            
                            .header {
                              border: 4px double #000;
                              padding: 20px;
                              margin-bottom: 20px;
                              text-align: center;
                            }
                            
                            .header-content {
                              display: flex;
                              align-items: center;
                              justify-content: space-between;
                              margin-bottom: 15px;
                            }
                            
                            .logo-section {
                              flex-shrink: 0;
                            }
                            
                            .school-logo {
                              width: 60px;
                              height: 60px;
                              object-fit: contain;
                            }
                            
                            .school-info {
                              flex-grow: 1;
                              text-align: center;
                              margin: 0 20px;
                            }
                            
                            .passport-section {
                              flex-shrink: 0;
                              width: 60px;
                              height: 60px;
                              border: 2px solid #999;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                            }
                            
                            .passport-placeholder {
                              font-size: 8pt;
                              color: #999;
                              text-align: center;
                            }
                            
                            .school-name {
                              font-size: 24pt;
                              font-weight: bold;
                              color: #1e3a8a;
                              margin-bottom: 5px;
                            }
                            
                            .school-address {
                              font-size: 12pt;
                              color: #666;
                              margin-bottom: 3px;
                            }
                            
                            .school-contact {
                              font-size: 10pt;
                              color: #666;
                              margin-bottom: 5px;
                            }
                            
                            .school-motto {
                              font-size: 10pt;
                              font-weight: bold;
                              color: #1e40af;
                            }
                            
                            .result-title {
                              border-top: 2px solid #000;
                              border-bottom: 2px solid #000;
                              padding: 10px;
                              margin-top: 15px;
                              font-size: 16pt;
                              font-weight: bold;
                            }
                            
                            .student-info {
                              display: grid;
                              grid-template-columns: 1fr 1fr;
                              gap: 30px;
                              margin: 20px 0;
                            }
                            
                            .info-row {
                              display: flex;
                              margin-bottom: 8px;
                            }
                            
                            .info-label {
                              font-weight: bold;
                              width: 120px;
                              flex-shrink: 0;
                            }
                            
                            .info-value {
                              border-bottom: 1px dotted #999;
                              flex-grow: 1;
                              padding-left: 8px;
                            }
                            
                            .section-title {
                              background: #f5f5f5;
                              padding: 10px;
                              text-align: center;
                              font-size: 14pt;
                              font-weight: bold;
                              margin: 20px 0 10px 0;
                            }
                            
                            .result-table {
                              width: 100%;
                              border-collapse: collapse;
                              margin-bottom: 20px;
                            }
                            
                            .result-table th,
                            .result-table td {
                              border: 1px solid #000;
                              padding: 8px;
                              text-align: center;
                            }
                            
                            .result-table th {
                              background: #f0f0f0;
                              font-weight: bold;
                            }
                            
                            .result-table .subject-name {
                              text-align: left;
                              font-weight: bold;
                            }
                            
                            .summary-row {
                              background: #f5f5f5;
                              font-weight: bold;
                            }
                            
                            .performance-summary {
                              display: grid;
                              grid-template-columns: 1fr 1fr 1fr 1fr;
                              gap: 10px;
                              margin: 20px 0;
                            }
                            
                            .performance-card {
                              border: 1px solid #000;
                              padding: 15px;
                              text-align: center;
                            }
                            
                            .performance-label {
                              font-size: 10pt;
                              font-weight: bold;
                              margin-bottom: 5px;
                            }
                            
                            .performance-value {
                              font-size: 18pt;
                              font-weight: bold;
                            }
                            
                            .comments {
                              margin: 20px 0;
                            }
                            
                            .comment-box {
                              border: 1px solid #000;
                              padding: 15px;
                              margin-bottom: 15px;
                              min-height: 60px;
                              background: #f9f9f9;
                            }
                            
                            .comment-title {
                              font-weight: bold;
                              margin-bottom: 8px;
                            }
                            
                            .signatures {
                              margin-top: 30px;
                            }
                            
                            .signature-table {
                              width: 100%;
                              border-collapse: collapse;
                            }
                            
                            .signature-table td {
                              border: 1px solid #000;
                              padding: 30px 10px 10px 10px;
                              text-align: center;
                              vertical-align: bottom;
                            }
                            
                            .signature-line {
                              border-top: 1px solid #000;
                              padding-top: 5px;
                              margin-top: 20px;
                            }
                            
                            .footer {
                              border-top: 2px solid #000;
                              padding-top: 15px;
                              margin-top: 30px;
                              text-align: center;
                            }
                            
                            .footer-info {
                              font-size: 10pt;
                              color: #666;
                              margin-top: 10px;
                            }
                            
                            @media print {
                              @page {
                                size: A4;
                                margin: 0.5in;
                              }
                              
                              body {
                                -webkit-print-color-adjust: exact;
                                color-adjust: exact;
                              }
                              
                              .container {
                                max-width: none;
                                margin: 0;
                                padding: 0;
                              }
                            }
                          </style>
                        </head>
                        <body>
                          <div class="container">
                            <div class="header">
                              <div class="header-content">
                                <div class="logo-section">
                                  <img src="/attached_assets/logo_1751823007371.png" alt="Robertson Education Centre Logo" style="width: 50px; height: 50px; object-fit: contain;" />
                                </div>
                                <div class="school-info">
                                  <div class="school-name">ROBERTSON EDUCATION</div>
                                  <div class="school-address">Excellence in Education - Nurturing Tomorrow's Leaders</div>
                                  <div class="school-contact">Tel: +234 XXX XXX XXXX | Email: info@robertsoneducation.edu</div>
                                  <div class="school-motto">"Knowledge • Character • Service"</div>
                                </div>
                                <div class="passport-section">
                                  <div class="passport-placeholder">PASSPORT</div>
                                </div>
                              </div>
                              <div class="result-title">
                                CONTINUOUS ASSESSMENT REPORT SHEET<br>
                                Academic Session: ${selectedResult.session} | ${selectedResult.term}
                              </div>
                            </div>
                            
                            <div class="student-info">
                              <div>
                                <div class="info-row">
                                  <span class="info-label">Student's Name:</span>
                                  <span class="info-value">${student ? student.firstName + ' ' + student.lastName : 'N/A'}</span>
                                </div>
                                <div class="info-row">
                                  <span class="info-label">Admission No:</span>
                                  <span class="info-value">${selectedResult.studentId}</span>
                                </div>
                                <div class="info-row">
                                  <span class="info-label">Class:</span>
                                  <span class="info-value">${selectedResult.class}</span>
                                </div>
                                <div class="info-row">
                                  <span class="info-label">Age:</span>
                                  <span class="info-value">${student?.dateOfBirth ? new Date().getFullYear() - new Date(student.dateOfBirth).getFullYear() : 'N/A'}</span>
                                </div>
                              </div>
                              
                              <div>
                                <div class="info-row">
                                  <span class="info-label">Session:</span>
                                  <span class="info-value">${selectedResult.session}</span>
                                </div>
                                <div class="info-row">
                                  <span class="info-label">Term:</span>
                                  <span class="info-value">${selectedResult.term}</span>
                                </div>
                                <div class="info-row">
                                  <span class="info-label">No. in Class:</span>
                                  <span class="info-value">${selectedResult.outOf || 'N/A'}</span>
                                </div>
                                <div class="info-row">
                                  <span class="info-label">Position:</span>
                                  <span class="info-value">${selectedResult.position && selectedResult.outOf ? selectedResult.position + ' out of ' + selectedResult.outOf : 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div class="section-title">ACADEMIC PERFORMANCE</div>
                            <table class="result-table">
                              <thead>
                                <tr>
                                  <th>SUBJECTS</th>
                                  <th>1st CA<br>(20)</th>
                                  <th>2nd CA<br>(20)</th>
                                  <th>EXAM<br>(60)</th>
                                  <th>TOTAL<br>(100)</th>
                                  <th>GRADE</th>
                                  <th>REMARK</th>
                                  <th>POSITION</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${selectedResult.subjects?.map((subject, index) => `
                                  <tr>
                                    <td class="subject-name">${subject.subject}</td>
                                    <td>${subject.ca1 || 0}</td>
                                    <td>${subject.ca2 || 0}</td>
                                    <td>${subject.exam || 0}</td>
                                    <td><strong>${subject.total || 0}</strong></td>
                                    <td><strong>${subject.grade || 'N/A'}</strong></td>
                                    <td>${subject.remark || (subject.grade?.includes('A') ? 'Excellent' : subject.grade?.includes('B') ? 'Good' : subject.grade?.includes('C') ? 'Credit' : subject.grade?.includes('D') ? 'Pass' : 'Fail')}</td>
                                    <td>${subject.position || (index + 1)}</td>
                                  </tr>
                                `).join('') || ''}
                                <tr class="summary-row">
                                  <td colspan="4" style="text-align: center;"><strong>TOTAL</strong></td>
                                  <td><strong>${selectedResult.totalScore || 0}</strong></td>
                                  <td>-</td>
                                  <td><strong>AVG: ${selectedResult.average || 0}%</strong></td>
                                  <td><strong>GPA: ${selectedResult.gpa || 0}</strong></td>
                                </tr>
                              </tbody>
                            </table>
                            
                            <div class="performance-summary">
                              <div class="performance-card">
                                <div class="performance-label">TOTAL SCORE</div>
                                <div class="performance-value">${selectedResult.totalScore || 0}</div>
                              </div>
                              <div class="performance-card">
                                <div class="performance-label">AVERAGE</div>
                                <div class="performance-value">${selectedResult.average || 0}%</div>
                              </div>
                              <div class="performance-card">
                                <div class="performance-label">GRADE POINT</div>
                                <div class="performance-value">${selectedResult.gpa || 0}/4.0</div>
                              </div>
                              <div class="performance-card">
                                <div class="performance-label">OVERALL GRADE</div>
                                <div class="performance-value">${selectedResult.average >= 70 ? 'A' : selectedResult.average >= 60 ? 'B' : selectedResult.average >= 50 ? 'C' : selectedResult.average >= 40 ? 'D' : 'F'}</div>
                              </div>
                            </div>
                            
                            <div class="section-title">COMMENTS</div>
                            <div class="comments">
                              <div class="comment-title">CLASS TEACHER'S COMMENT:</div>
                              <div class="comment-box">
                                ${selectedResult.classTeacher ? 
                                  `${selectedResult.average >= 75 ? 'Excellent performance. Keep up the good work!' : 
                                    selectedResult.average >= 70 ? 'Very good performance. You can do better.' : 
                                    selectedResult.average >= 65 ? 'Good performance. Work harder.' : 
                                    selectedResult.average >= 60 ? 'Fair performance. You need to improve.' : 
                                    'Poor performance. You need serious improvement.'} - ${selectedResult.classTeacher}` : 
                                  (selectedResult.average >= 75 ? 'Excellent performance. Keep up the good work!' : 
                                   selectedResult.average >= 70 ? 'Very good performance. You can do better.' : 
                                   selectedResult.average >= 65 ? 'Good performance. Work harder.' : 
                                   selectedResult.average >= 60 ? 'Fair performance. You need to improve.' : 
                                   'Poor performance. You need serious improvement.')}
                              </div>
                              
                              <div class="comment-title">PRINCIPAL'S COMMENT:</div>
                              <div class="comment-box">
                                ${selectedResult.principalComment || 'Keep up the good work and continue to strive for excellence.'}
                              </div>
                            </div>
                            
                            <div class="section-title">SIGNATURES</div>
                            <div class="signatures">
                              <table class="signature-table">
                                <tr>
                                  <td>
                                    <div class="signature-line">
                                      <strong>Class Teacher's Signature</strong><br>
                                      Date: _____________
                                    </div>
                                  </td>
                                  <td>
                                    <div class="signature-line">
                                      <strong>Principal's Signature</strong><br>
                                      Date: _____________
                                    </div>
                                  </td>
                                  <td>
                                    <div class="signature-line">
                                      <strong>Parent/Guardian's Signature</strong><br>
                                      Date: _____________
                                    </div>
                                  </td>
                                </tr>
                              </table>
                            </div>
                            
                            <div class="footer">
                              <div>
                                <strong>Next Term Begins:</strong> ${selectedResult.nextTermBegins || 'Date to be announced'}
                              </div>
                              <div class="footer-info">
                                This is a computer-generated result sheet from Robertson Education Management System.<br>
                                Generated on: ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        </body>
                      </html>
                    `;
                    
                    // Write content to print window
                    printWindow.document.write(printContent);
                    printWindow.document.close();
                    
                    // Wait for content to load then print
                    printWindow.onload = function() {
                      printWindow.print();
                      printWindow.close();
                    };
                  }
                }}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Result
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                  if (selectedResult) {
                    const student = getStudentInfo(selectedResult.studentId);
                    generateResultPDF(selectedResult, student);
                  }
                }}>
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
          
          <div className="space-y-3">
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
        <div className="flex justify-end space-x-4 border-t pt-4 mt-6">
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
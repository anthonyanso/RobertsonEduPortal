import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { Search, FileText, Printer, Trophy, TrendingUp, TrendingDown, Minus, Eye, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoUrl from "@assets/logo_1751823007371.png";

interface Student {
  id: number;
  studentId: string;
  firstName: string;
  lastName: string;
  gradeLevel: string;
}

interface Result {
  id: number;
  studentId: string;
  session: string;
  term: string;
  class: string;
  subjects: any[];
  totalScore: number;
  average: number;
  gpa: number;
  position: number;
  outOf: number;
  createdAt: string;
}

interface CumulativeStudentResult {
  student: Student;
  firstTerm: Result | null;
  secondTerm: Result | null;
  thirdTerm: Result | null;
  cumulativeAverage: number;
  cumulativeGPA: number;
  cumulativePosition: number;
  trend: "up" | "down" | "stable";
}

export default function CumulativeResults() {
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [cumulativeResults, setCumulativeResults] = useState<CumulativeStudentResult[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<CumulativeStudentResult | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch students
  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ['/api/admin/students'],
  });

  // Fetch results
  const { data: results = [] } = useQuery<Result[]>({
    queryKey: ['/api/admin/results'],
  });

  // Get available sessions and classes
  const availableSessions = [...new Set(results.map(r => r.session))].sort();
  const availableClasses = [...new Set(results.map(r => r.class))].sort();

  // Calculate cumulative results
  useEffect(() => {
    if (!selectedSession || !selectedClass) {
      setCumulativeResults([]);
      return;
    }

    const studentsInClass = students.filter(s => s.gradeLevel === selectedClass);
    const sessionResults = results.filter(r => r.session === selectedSession && r.class === selectedClass);

    const cumulative: CumulativeStudentResult[] = studentsInClass.map(student => {
      const firstTerm = sessionResults.find(r => r.studentId === student.studentId && r.term === "First Term") || null;
      const secondTerm = sessionResults.find(r => r.studentId === student.studentId && r.term === "Second Term") || null;
      const thirdTerm = sessionResults.find(r => r.studentId === student.studentId && r.term === "Third Term") || null;

      // Calculate cumulative average and GPA
      const validResults = [firstTerm, secondTerm, thirdTerm].filter(result => 
        result && typeof result.average === 'number' && typeof result.gpa === 'number'
      );
      const cumulativeAverage = validResults.length > 0 
        ? validResults.reduce((sum, result) => sum + result.average, 0) / validResults.length 
        : 0;
      
      const cumulativeGPA = validResults.length > 0 
        ? validResults.reduce((sum, result) => sum + result.gpa, 0) / validResults.length 
        : 0;

      // Determine trend
      let trend: "up" | "down" | "stable" = "stable";
      if (firstTerm && secondTerm && typeof firstTerm.average === 'number' && typeof secondTerm.average === 'number') {
        if (secondTerm.average > firstTerm.average) trend = "up";
        else if (secondTerm.average < firstTerm.average) trend = "down";
      }
      if (secondTerm && thirdTerm && typeof secondTerm.average === 'number' && typeof thirdTerm.average === 'number') {
        if (thirdTerm.average > secondTerm.average) trend = "up";
        else if (thirdTerm.average < secondTerm.average) trend = "down";
      }

      return {
        student,
        firstTerm,
        secondTerm,
        thirdTerm,
        cumulativeAverage: Number(cumulativeAverage.toFixed(2)),
        cumulativeGPA: Number(cumulativeGPA.toFixed(2)),
        cumulativePosition: 0, // Will be calculated after sorting
        trend
      };
    });

    // Sort by cumulative average and assign positions
    const sortedCumulative = cumulative
      .sort((a, b) => b.cumulativeAverage - a.cumulativeAverage)
      .map((item, index) => ({
        ...item,
        cumulativePosition: index + 1
      }));

    setCumulativeResults(sortedCumulative);
  }, [selectedSession, selectedClass, students, results]);

  // Filter results based on search term
  const filteredResults = cumulativeResults.filter(result =>
    result.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrintIndividual = (studentResult: CumulativeStudentResult) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cumulative Report - ${studentResult.student.firstName} ${studentResult.student.lastName}</title>
            <style>
              @page { 
                size: A4; 
                margin: 10mm; 
              }
              body { 
                font-family: Arial, sans-serif; 
                font-size: 10px; 
                line-height: 1.2; 
                margin: 0; 
                padding: 0; 
              }
              .header { 
                text-align: center; 
                margin-bottom: 15px; 
                border-bottom: 1px solid #000; 
                padding-bottom: 10px; 
              }
              .logo { 
                width: 40px; 
                height: 40px; 
                margin: 0 auto 5px; 
              }
              .header h1 { 
                font-size: 14px; 
                margin: 5px 0; 
                color: #d32f2f; 
              }
              .header h2 { 
                font-size: 12px; 
                margin: 3px 0; 
              }
              .student-info { 
                background: #f9f9f9; 
                padding: 8px; 
                margin-bottom: 15px; 
                border-radius: 4px; 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 10px; 
                font-size: 9px; 
              }
              .terms-container { 
                display: grid; 
                grid-template-columns: 1fr 1fr 1fr; 
                gap: 8px; 
                margin-bottom: 15px; 
              }
              .term-compact { 
                border: 1px solid #ccc; 
                padding: 6px; 
                border-radius: 4px; 
                font-size: 8px; 
              }
              .term-compact h4 { 
                margin: 0 0 6px 0; 
                font-size: 9px; 
                color: #d32f2f; 
                text-align: center; 
                background: #f0f0f0; 
                padding: 3px; 
                border-radius: 2px; 
              }
              .term-compact table { 
                width: 100%; 
                border-collapse: collapse; 
                font-size: 7px; 
                margin-bottom: 4px; 
              }
              .term-compact th, 
              .term-compact td { 
                border: 1px solid #ddd; 
                padding: 2px; 
                text-align: left; 
              }
              .term-compact th { 
                background: #f8f8f8; 
                font-weight: bold; 
              }
              .term-stats { 
                font-size: 8px; 
                text-align: center; 
                font-weight: bold; 
                background: #f9f9f9; 
                padding: 3px; 
                border-radius: 2px; 
                margin-top: 4px; 
              }
              .no-record { 
                text-align: center; 
                color: #666; 
                font-style: italic; 
                padding: 20px; 
              }
              .summary { 
                background: #f9f9f9; 
                padding: 10px; 
                border-radius: 4px; 
                margin-bottom: 15px; 
                font-size: 9px; 
              }
              .summary h3 { 
                margin: 0 0 8px 0; 
                font-size: 11px; 
                color: #d32f2f; 
                text-align: center; 
              }
              .summary-grid { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 8px; 
              }
              .grade-excellent { color: #2e7d32; font-weight: bold; }
              .grade-good { color: #1976d2; font-weight: bold; }
              .grade-fair { color: #f57c00; font-weight: bold; }
              .grade-poor { color: #d32f2f; font-weight: bold; }
              .trend-up { color: #2e7d32; font-weight: bold; }
              .trend-down { color: #d32f2f; font-weight: bold; }
              .trend-stable { color: #757575; font-weight: bold; }
              .signatures { 
                display: flex; 
                justify-content: space-between; 
                margin-top: 15px; 
              }
              .signature { 
                text-align: center; 
                width: 30%; 
                font-size: 8px; 
              }
              .signature-line { 
                border-bottom: 1px solid #000; 
                margin-bottom: 3px; 
                height: 25px; 
              }
              @media print {
                body { 
                  print-color-adjust: exact; 
                  -webkit-print-color-adjust: exact; 
                }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <img src="${logoUrl}" alt="Robertson Education Logo" class="logo" />
              <h1>ROBERTSON EDUCATION</h1>
              <h2>CUMULATIVE PERFORMANCE REPORT</h2>
            </div>
            
            <div class="student-info">
              <div>
                <p><strong>Name:</strong> ${studentResult.student.firstName} ${studentResult.student.lastName}</p>
                <p><strong>Student ID:</strong> ${studentResult.student.studentId}</p>
                <p><strong>Class:</strong> ${selectedClass}</p>
              </div>
              <div>
                <p><strong>Session:</strong> ${selectedSession}</p>
                <p><strong>Position:</strong> ${studentResult.cumulativePosition} of ${cumulativeResults.length}</p>
                <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div class="terms-container">
              ${studentResult.firstTerm ? `
              <div class="term-compact">
                <h4>FIRST TERM</h4>
                <table>
                  <thead>
                    <tr><th>Subject</th><th>Score</th><th>Grade</th></tr>
                  </thead>
                  <tbody>
                    ${studentResult.firstTerm.subjects.slice(0, 5).map(subject => `
                      <tr>
                        <td>${subject.subject}</td>
                        <td>${subject.score}</td>
                        <td>${subject.grade}</td>
                      </tr>
                    `).join('')}
                    ${studentResult.firstTerm.subjects.length > 5 ? '<tr><td colspan="3">... and more</td></tr>' : ''}
                  </tbody>
                </table>
                <div class="term-stats">
                  Avg: ${typeof studentResult.firstTerm.average === 'number' ? studentResult.firstTerm.average.toFixed(1) : 'N/A'}% | 
                  GPA: ${typeof studentResult.firstTerm.gpa === 'number' ? studentResult.firstTerm.gpa.toFixed(2) : 'N/A'} | 
                  Pos: ${studentResult.firstTerm.position}/${studentResult.firstTerm.outOf}
                </div>
              </div>
              ` : '<div class="term-compact"><h4>FIRST TERM</h4><div class="no-record">No record found</div></div>'}

              ${studentResult.secondTerm ? `
              <div class="term-compact">
                <h4>SECOND TERM</h4>
                <table>
                  <thead>
                    <tr><th>Subject</th><th>Score</th><th>Grade</th></tr>
                  </thead>
                  <tbody>
                    ${studentResult.secondTerm.subjects.slice(0, 5).map(subject => `
                      <tr>
                        <td>${subject.subject}</td>
                        <td>${subject.score}</td>
                        <td>${subject.grade}</td>
                      </tr>
                    `).join('')}
                    ${studentResult.secondTerm.subjects.length > 5 ? '<tr><td colspan="3">... and more</td></tr>' : ''}
                  </tbody>
                </table>
                <div class="term-stats">
                  Avg: ${typeof studentResult.secondTerm.average === 'number' ? studentResult.secondTerm.average.toFixed(1) : 'N/A'}% | 
                  GPA: ${typeof studentResult.secondTerm.gpa === 'number' ? studentResult.secondTerm.gpa.toFixed(2) : 'N/A'} | 
                  Pos: ${studentResult.secondTerm.position}/${studentResult.secondTerm.outOf}
                </div>
              </div>
              ` : '<div class="term-compact"><h4>SECOND TERM</h4><div class="no-record">No record found</div></div>'}

              ${studentResult.thirdTerm ? `
              <div class="term-compact">
                <h4>THIRD TERM</h4>
                <table>
                  <thead>
                    <tr><th>Subject</th><th>Score</th><th>Grade</th></tr>
                  </thead>
                  <tbody>
                    ${studentResult.thirdTerm.subjects.slice(0, 5).map(subject => `
                      <tr>
                        <td>${subject.subject}</td>
                        <td>${subject.score}</td>
                        <td>${subject.grade}</td>
                      </tr>
                    `).join('')}
                    ${studentResult.thirdTerm.subjects.length > 5 ? '<tr><td colspan="3">... and more</td></tr>' : ''}
                  </tbody>
                </table>
                <div class="term-stats">
                  Avg: ${typeof studentResult.thirdTerm.average === 'number' ? studentResult.thirdTerm.average.toFixed(1) : 'N/A'}% | 
                  GPA: ${typeof studentResult.thirdTerm.gpa === 'number' ? studentResult.thirdTerm.gpa.toFixed(2) : 'N/A'} | 
                  Pos: ${studentResult.thirdTerm.position}/${studentResult.thirdTerm.outOf}
                </div>
              </div>
              ` : '<div class="term-compact"><h4>THIRD TERM</h4><div class="no-record">No record found</div></div>'}
            </div>

            <div class="summary">
              <h3>CUMULATIVE SUMMARY</h3>
              <div class="summary-grid">
                <div>
                  <p><strong>Overall Average:</strong> <span class="${studentResult.cumulativeAverage >= 70 ? 'grade-excellent' : studentResult.cumulativeAverage >= 55 ? 'grade-good' : studentResult.cumulativeAverage >= 40 ? 'grade-fair' : 'grade-poor'}">${typeof studentResult.cumulativeAverage === 'number' ? studentResult.cumulativeAverage.toFixed(1) : 'N/A'}%</span></p>
                  <p><strong>Cumulative GPA:</strong> ${typeof studentResult.cumulativeGPA === 'number' ? studentResult.cumulativeGPA.toFixed(2) : 'N/A'}</p>
                  <p><strong>Class Position:</strong> ${studentResult.cumulativePosition} out of ${cumulativeResults.length}</p>
                </div>
                <div>
                  <p><strong>Performance Trend:</strong> 
                    <span class="trend-${studentResult.trend}">
                      ${studentResult.trend === 'up' ? 'IMPROVING ↑' : studentResult.trend === 'down' ? 'DECLINING ↓' : 'STABLE →'}
                    </span>
                  </p>
                  <p><strong>Overall Grade:</strong> 
                    <span class="${studentResult.cumulativeAverage >= 70 ? 'grade-excellent' : studentResult.cumulativeAverage >= 55 ? 'grade-good' : studentResult.cumulativeAverage >= 40 ? 'grade-fair' : 'grade-poor'}">
                      ${studentResult.cumulativeAverage >= 70 ? 'DISTINCTION' : studentResult.cumulativeAverage >= 55 ? 'CREDIT' : studentResult.cumulativeAverage >= 40 ? 'PASS' : 'FAIL'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div class="signatures">
              <div class="signature">
                <div class="signature-line"></div>
                <p>Class Teacher</p>
              </div>
              <div class="signature">
                <div class="signature-line"></div>
                <p>Principal</p>
              </div>
              <div class="signature">
                <div class="signature-line"></div>
                <p>Parent/Guardian</p>
              </div>
            </div>
            
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleViewDetails = (studentResult: CumulativeStudentResult) => {
    setSelectedStudent(studentResult);
    setDialogOpen(true);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down": return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getGradeColor = (average: number) => {
    if (average >= 70) return "bg-green-100 text-green-800";
    if (average >= 55) return "bg-blue-100 text-blue-800";
    if (average >= 40) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Trophy className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Cumulative Results</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="session">Session</Label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger>
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {availableSessions.map(session => (
                    <SelectItem key={session} value={session}>{session}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="class">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {availableClasses.map(cls => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="search">Search Students</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Select a session and class to view individual student cumulative reports. Each student's report can be printed separately.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      {selectedSession && selectedClass && (
        <Card>
          <CardHeader>
            <CardTitle>
              Cumulative Results - {selectedClass} ({selectedSession})
            </CardTitle>
            <p className="text-sm text-gray-600">
              Showing {filteredResults.length} students with their term-by-term performance
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Position</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-center">1st Term</TableHead>
                    <TableHead className="text-center">2nd Term</TableHead>
                    <TableHead className="text-center">3rd Term</TableHead>
                    <TableHead className="text-center">Cumulative Avg</TableHead>
                    <TableHead className="text-center">Cumulative GPA</TableHead>
                    <TableHead className="text-center">Trend</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((result) => (
                    <TableRow key={result.student.studentId}>
                      <TableCell className="text-center font-bold">
                        {result.cumulativePosition <= 3 ? (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                            {result.cumulativePosition}
                          </Badge>
                        ) : (
                          result.cumulativePosition
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {result.student.firstName} {result.student.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {result.student.studentId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {result.firstTerm && result.firstTerm.average && typeof result.firstTerm.average === 'number' ? (
                          <Badge className={getGradeColor(result.firstTerm.average)}>
                            {result.firstTerm.average.toFixed(1)}%
                          </Badge>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {result.secondTerm && result.secondTerm.average && typeof result.secondTerm.average === 'number' ? (
                          <Badge className={getGradeColor(result.secondTerm.average)}>
                            {result.secondTerm.average.toFixed(1)}%
                          </Badge>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {result.thirdTerm && result.thirdTerm.average && typeof result.thirdTerm.average === 'number' ? (
                          <Badge className={getGradeColor(result.thirdTerm.average)}>
                            {result.thirdTerm.average.toFixed(1)}%
                          </Badge>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="outline" 
                          className={`${getGradeColor(result.cumulativeAverage)} font-bold`}
                        >
                          {typeof result.cumulativeAverage === 'number' ? result.cumulativeAverage.toFixed(1) : 'N/A'}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {typeof result.cumulativeGPA === 'number' ? result.cumulativeGPA.toFixed(2) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-center">
                        {getTrendIcon(result.trend)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(result)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handlePrintIndividual(result)}
                          >
                            <Printer className="w-4 h-4 mr-1" />
                            Print
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {(!selectedSession || !selectedClass) && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Select Session and Class
            </h3>
            <p className="text-gray-600">
              Choose a session and class to view cumulative results for all students
            </p>
          </CardContent>
        </Card>
      )}

      {/* Individual Student Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Cumulative Performance Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Student Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><strong>Name:</strong> {selectedStudent.student.firstName} {selectedStudent.student.lastName}</p>
                    <p><strong>Student ID:</strong> {selectedStudent.student.studentId}</p>
                    <p><strong>Class:</strong> {selectedClass}</p>
                  </div>
                  <div>
                    <p><strong>Session:</strong> {selectedSession}</p>
                    <p><strong>Overall Position:</strong> {selectedStudent.cumulativePosition} of {cumulativeResults.length}</p>
                    <p><strong>Cumulative Average:</strong> 
                      <Badge className={`ml-2 ${getGradeColor(selectedStudent.cumulativeAverage)}`}>
                        {selectedStudent.cumulativeAverage.toFixed(1)}%
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>

              {/* Term-by-Term Performance */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* First Term */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">First Term</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedStudent.firstTerm && selectedStudent.firstTerm.average && typeof selectedStudent.firstTerm.average === 'number' ? (
                      <div className="space-y-2">
                        <p><strong>Average:</strong> {selectedStudent.firstTerm.average.toFixed(1)}%</p>
                        <p><strong>GPA:</strong> {typeof selectedStudent.firstTerm.gpa === 'number' ? selectedStudent.firstTerm.gpa.toFixed(2) : 'N/A'}</p>
                        <p><strong>Position:</strong> {selectedStudent.firstTerm.position}/{selectedStudent.firstTerm.outOf}</p>
                        <Badge className={getGradeColor(selectedStudent.firstTerm.average)}>
                          {selectedStudent.firstTerm.average >= 70 ? 'DISTINCTION' : 
                           selectedStudent.firstTerm.average >= 55 ? 'CREDIT' : 
                           selectedStudent.firstTerm.average >= 40 ? 'PASS' : 'FAIL'}
                        </Badge>
                      </div>
                    ) : (
                      <p className="text-gray-500">No record available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Second Term */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Second Term</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedStudent.secondTerm && selectedStudent.secondTerm.average && typeof selectedStudent.secondTerm.average === 'number' ? (
                      <div className="space-y-2">
                        <p><strong>Average:</strong> {selectedStudent.secondTerm.average.toFixed(1)}%</p>
                        <p><strong>GPA:</strong> {typeof selectedStudent.secondTerm.gpa === 'number' ? selectedStudent.secondTerm.gpa.toFixed(2) : 'N/A'}</p>
                        <p><strong>Position:</strong> {selectedStudent.secondTerm.position}/{selectedStudent.secondTerm.outOf}</p>
                        <Badge className={getGradeColor(selectedStudent.secondTerm.average)}>
                          {selectedStudent.secondTerm.average >= 70 ? 'DISTINCTION' : 
                           selectedStudent.secondTerm.average >= 55 ? 'CREDIT' : 
                           selectedStudent.secondTerm.average >= 40 ? 'PASS' : 'FAIL'}
                        </Badge>
                      </div>
                    ) : (
                      <p className="text-gray-500">No record available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Third Term */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Third Term</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedStudent.thirdTerm && selectedStudent.thirdTerm.average && typeof selectedStudent.thirdTerm.average === 'number' ? (
                      <div className="space-y-2">
                        <p><strong>Average:</strong> {selectedStudent.thirdTerm.average.toFixed(1)}%</p>
                        <p><strong>GPA:</strong> {typeof selectedStudent.thirdTerm.gpa === 'number' ? selectedStudent.thirdTerm.gpa.toFixed(2) : 'N/A'}</p>
                        <p><strong>Position:</strong> {selectedStudent.thirdTerm.position}/{selectedStudent.thirdTerm.outOf}</p>
                        <Badge className={getGradeColor(selectedStudent.thirdTerm.average)}>
                          {selectedStudent.thirdTerm.average >= 70 ? 'DISTINCTION' : 
                           selectedStudent.thirdTerm.average >= 55 ? 'CREDIT' : 
                           selectedStudent.thirdTerm.average >= 40 ? 'PASS' : 'FAIL'}
                        </Badge>
                      </div>
                    ) : (
                      <p className="text-gray-500">No record available</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Cumulative Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Cumulative Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Overall Average</p>
                      <p className="text-2xl font-bold text-blue-600">{typeof selectedStudent.cumulativeAverage === 'number' ? selectedStudent.cumulativeAverage.toFixed(1) : 'N/A'}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Cumulative GPA</p>
                      <p className="text-2xl font-bold text-blue-600">{typeof selectedStudent.cumulativeGPA === 'number' ? selectedStudent.cumulativeGPA.toFixed(2) : 'N/A'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Class Position</p>
                      <p className="text-2xl font-bold text-blue-600">{selectedStudent.cumulativePosition}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Performance Trend</p>
                      <div className="flex justify-center mt-1">
                        {getTrendIcon(selectedStudent.trend)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => handlePrintIndividual(selectedStudent)}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print Individual Report
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
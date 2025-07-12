import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Search, FileText, Printer, Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
      const validResults = [firstTerm, secondTerm, thirdTerm].filter(Boolean);
      const cumulativeAverage = validResults.length > 0 
        ? validResults.reduce((sum, result) => sum + (result?.average || 0), 0) / validResults.length 
        : 0;
      
      const cumulativeGPA = validResults.length > 0 
        ? validResults.reduce((sum, result) => sum + (result?.gpa || 0), 0) / validResults.length 
        : 0;

      // Determine trend
      let trend: "up" | "down" | "stable" = "stable";
      if (firstTerm && secondTerm) {
        if (secondTerm.average > firstTerm.average) trend = "up";
        else if (secondTerm.average < firstTerm.average) trend = "down";
      }
      if (secondTerm && thirdTerm) {
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

  const handlePrint = () => {
    if (!selectedSession || !selectedClass) {
      toast({
        title: "Selection Required",
        description: "Please select a session and class first",
        variant: "destructive",
      });
      return;
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cumulative Results - ${selectedClass} ${selectedSession}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .school-info { margin-bottom: 20px; }
              .class-info { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .position { text-align: center; font-weight: bold; }
              .trend-up { color: green; }
              .trend-down { color: red; }
              .trend-stable { color: gray; }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>ROBERTSON EDUCATION</h1>
              <h2>CUMULATIVE RESULTS REPORT</h2>
            </div>
            <div class="class-info">
              <p><strong>Class:</strong> ${selectedClass}</p>
              <p><strong>Session:</strong> ${selectedSession}</p>
              <p><strong>Total Students:</strong> ${filteredResults.length}</p>
              <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>1st Term Avg</th>
                  <th>2nd Term Avg</th>
                  <th>3rd Term Avg</th>
                  <th>Cumulative Avg</th>
                  <th>Cumulative GPA</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                ${filteredResults.map(result => `
                  <tr>
                    <td class="position">${result.cumulativePosition}</td>
                    <td>${result.student.studentId}</td>
                    <td>${result.student.firstName} ${result.student.lastName}</td>
                    <td>${result.firstTerm?.average?.toFixed(2) || 'N/A'}</td>
                    <td>${result.secondTerm?.average?.toFixed(2) || 'N/A'}</td>
                    <td>${result.thirdTerm?.average?.toFixed(2) || 'N/A'}</td>
                    <td><strong>${result.cumulativeAverage.toFixed(2)}</strong></td>
                    <td><strong>${result.cumulativeGPA.toFixed(2)}</strong></td>
                    <td class="trend-${result.trend}">
                      ${result.trend === 'up' ? '↑' : result.trend === 'down' ? '↓' : '→'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div style="margin-top: 30px;">
              <p><strong>Legend:</strong></p>
              <p>↑ = Improving Performance | ↓ = Declining Performance | → = Stable Performance</p>
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

          <div className="mt-4 flex gap-2">
            <Button onClick={handlePrint} disabled={!selectedSession || !selectedClass}>
              <Printer className="w-4 h-4 mr-2" />
              Print Report
            </Button>
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
                        {result.firstTerm ? (
                          <Badge className={getGradeColor(result.firstTerm.average)}>
                            {result.firstTerm.average.toFixed(1)}%
                          </Badge>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {result.secondTerm ? (
                          <Badge className={getGradeColor(result.secondTerm.average)}>
                            {result.secondTerm.average.toFixed(1)}%
                          </Badge>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {result.thirdTerm ? (
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
                          {result.cumulativeAverage.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {result.cumulativeGPA.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getTrendIcon(result.trend)}
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
    </div>
  );
}
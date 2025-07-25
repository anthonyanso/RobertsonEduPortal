import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ResultTemplateProps {
  result: any;
  student: any;
  schoolInfo?: any;
}

export default function ResultTemplate({ result, student, schoolInfo }: ResultTemplateProps) {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B+': case 'B': return 'bg-blue-100 text-blue-800';
      case 'C+': case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D+': case 'D': return 'bg-orange-100 text-orange-800';
      case 'E': case 'F': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceLevel = (average: number) => {
    if (average >= 75) return { level: 'EXCELLENT', color: 'text-green-600' };
    if (average >= 70) return { level: 'VERY GOOD', color: 'text-blue-600' };
    if (average >= 65) return { level: 'GOOD', color: 'text-yellow-600' };
    if (average >= 60) return { level: 'CREDIT', color: 'text-orange-600' };
    if (average >= 50) return { level: 'PASS', color: 'text-purple-600' };
    return { level: 'FAIL', color: 'text-red-600' };
  };

  const performance = getPerformanceLevel(result.average);

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white">
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-red-600 pb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {schoolInfo?.name || 'ROBERTSON EDUCATION'}
        </h1>
        <p className="text-gray-600 mb-2">
          {schoolInfo?.address || 'Excellence in Education'}
        </p>
        <p className="text-sm text-gray-500">
          {schoolInfo?.phone || 'Phone: +234 XXX XXX XXXX'} | {schoolInfo?.email || 'Email: info@robertsoneducation.edu'}
        </p>
        <div className="mt-4">
          <h2 className="text-xl font-semibold text-red-600">ACADEMIC RESULT SHEET</h2>
          <p className="text-gray-600">{result.session} Academic Session - {result.term}</p>
        </div>
      </div>

      {/* Student Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-700">Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Student ID:</span>
              <span className="text-red-600 font-bold">{result.studentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Name:</span>
              <span className="font-semibold">{student ? `${student.firstName} ${student.lastName}` : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Class:</span>
              <span>{student?.gradeLevel || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Gender:</span>
              <span className="capitalize">{student?.gender || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Position:</span>
              <span className="font-bold text-blue-600">
                {result.position && result.outOf ? `${result.position} out of ${result.outOf}` : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-700">Performance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Total Score:</span>
              <span className="font-bold text-2xl text-blue-600">{result.totalScore}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Average:</span>
              <span className="font-bold text-2xl text-green-600">{result.average}%</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">GPA:</span>
              <span className="font-bold text-2xl text-purple-600">{result.gpa}/4.0</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Performance Level:</span>
              <Badge className={`${performance.color} font-bold`}>
                {performance.level}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subjects Performance */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg text-gray-700">Subject Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-bold">Subject</TableHead>
                <TableHead className="font-bold text-center">Score</TableHead>
                <TableHead className="font-bold text-center">Grade</TableHead>
                <TableHead className="font-bold text-center">Remark</TableHead>
                <TableHead className="font-bold text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.subjects?.map((subject: any, index: number) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{subject.subject}</TableCell>
                  <TableCell className="text-center font-bold text-lg">{subject.score}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={getGradeColor(subject.grade)}>
                      {subject.grade}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{subject.remark}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={subject.score >= 40 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {subject.score >= 40 ? 'PASS' : 'FAIL'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Attendance */}
        {result.attendance && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-700">Attendance Record</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Days Present:</span>
                <span className="font-bold text-green-600">{result.attendance.present || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Days Absent:</span>
                <span className="font-bold text-red-600">{result.attendance.absent || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total Days:</span>
                <span className="font-bold">{result.attendance.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Attendance Rate:</span>
                <span className="font-bold text-blue-600">
                  {result.attendance.total > 0 ? 
                    `${((result.attendance.present / result.attendance.total) * 100).toFixed(1)}%` : 
                    'N/A'
                  }
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Behavioral Assessment */}
        {result.conduct && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-700">Behavioral Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(result.conduct).map(([trait, value]) => (
                <div key={trait} className="flex justify-between">
                  <span className="font-medium capitalize">{trait}:</span>
                  <Badge className={
                    value === 'Excellent' ? 'bg-green-100 text-green-800' :
                    value === 'Very Good' ? 'bg-blue-100 text-blue-800' :
                    value === 'Good' ? 'bg-yellow-100 text-yellow-800' :
                    value === 'Fair' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {value as string}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Comments Section */}
      <div className="space-y-6 mb-8">
        {result.principalComment && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-700">Principal's Comment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 italic border-l-4 border-red-600 pl-4">
                "{result.principalComment}"
              </p>
            </CardContent>
          </Card>
        )}

        {result.remarks && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-700">Additional Remarks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{result.remarks}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Signatures and Date */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="text-center">
          <div className="border-b-2 border-gray-400 mb-2 pb-1">
            <span className="text-sm text-gray-500">Class Teacher</span>
          </div>
          <p className="font-medium">{result.classTeacher || 'N/A'}</p>
          <p className="text-sm text-gray-500">Signature & Date</p>
        </div>
        <div className="text-center">
          <div className="border-b-2 border-gray-400 mb-2 pb-1">
            <span className="text-sm text-gray-500">Principal</span>
          </div>
          <p className="font-medium">Principal</p>
          <p className="text-sm text-gray-500">Signature & Date</p>
        </div>
        <div className="text-center">
          <div className="border-b-2 border-gray-400 mb-2 pb-1">
            <span className="text-sm text-gray-500">Parent/Guardian</span>
          </div>
          <p className="font-medium">Parent/Guardian</p>
          <p className="text-sm text-gray-500">Signature & Date</p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center border-t-2 border-gray-200 pt-6">
        <p className="text-sm text-gray-600">
          {result.nextTermBegins ? `Next Term Begins: ${result.nextTermBegins}` : 'Next Term Date: To be announced'}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          This is an official academic result sheet from Robertson Education. 
          For verification, please contact the school administration.
        </p>
      </div>
    </div>
  );
}
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import logoUrl from "@assets/logo_1751823007371.png";

interface NigerianResultTemplateProps {
  result: any;
  student: any;
  schoolInfo?: any;
}

export default function NigerianResultTemplate({ result, student, schoolInfo }: NigerianResultTemplateProps) {
  const defaultSchoolInfo = {
    name: "ROBERTSON EDUCATION",
    address: "Excellence in Education - Nurturing Tomorrow's Leaders",
    phone: "+234 XXX XXX XXXX",
    email: "info@robertsoneducation.edu",
    motto: "Knowledge • Character • Service",
    ...schoolInfo
  };

  const getGradeRemark = (grade: string) => {
    if (grade?.includes('A')) return 'Excellent';
    if (grade?.includes('B')) return 'Good';
    if (grade?.includes('C')) return 'Credit';
    if (grade?.includes('D')) return 'Pass';
    return 'Fail';
  };

  const getOverallComment = (average: number) => {
    if (average >= 75) return 'Excellent performance. Keep up the good work!';
    if (average >= 70) return 'Very good performance. You can do better.';
    if (average >= 65) return 'Good performance. Work harder.';
    if (average >= 60) return 'Fair performance. You need to improve.';
    return 'Poor performance. You need serious improvement.';
  };

  return (
    <div className="bg-white p-8 font-serif" style={{ fontFamily: 'Times New Roman, serif' }}>
      {/* Header */}
      <div className="border-4 border-double border-black p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <img src={logoUrl} alt="School Logo" className="h-16 w-16 object-contain" />
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold text-blue-900">{defaultSchoolInfo.name}</h1>
            <p className="text-sm text-gray-600">{defaultSchoolInfo.address}</p>
            <p className="text-xs text-gray-500">
              Tel: {defaultSchoolInfo.phone} | Email: {defaultSchoolInfo.email}
            </p>
            <p className="text-xs font-semibold text-blue-800 mt-1">"{defaultSchoolInfo.motto}"</p>
          </div>
          <div className="h-16 w-16 border-2 border-gray-300 flex items-center justify-center">
            <span className="text-xs text-gray-400">PASSPORT</span>
          </div>
        </div>
        
        <div className="text-center border-t border-b py-2">
          <h2 className="text-lg font-bold">CONTINUOUS ASSESSMENT REPORT SHEET</h2>
          <p className="text-sm">Academic Session: {result.session} | {result.term}</p>
        </div>
      </div>

      {/* Student Information */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div className="space-y-2">
          <div className="flex">
            <span className="font-semibold w-32">Student's Name:</span>
            <span className="border-b border-dotted border-gray-400 flex-1 pl-2">
              {student ? `${student.firstName} ${student.lastName}` : 'N/A'}
            </span>
          </div>
          <div className="flex">
            <span className="font-semibold w-32">Admission No:</span>
            <span className="border-b border-dotted border-gray-400 flex-1 pl-2">
              {result.studentId}
            </span>
          </div>
          <div className="flex">
            <span className="font-semibold w-32">Class:</span>
            <span className="border-b border-dotted border-gray-400 flex-1 pl-2">
              {result.class}
            </span>
          </div>
          <div className="flex">
            <span className="font-semibold w-32">Age:</span>
            <span className="border-b border-dotted border-gray-400 flex-1 pl-2">
              {student?.dateOfBirth ? new Date().getFullYear() - new Date(student.dateOfBirth).getFullYear() : 'N/A'}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex">
            <span className="font-semibold w-32">Session:</span>
            <span className="border-b border-dotted border-gray-400 flex-1 pl-2">
              {result.session}
            </span>
          </div>
          <div className="flex">
            <span className="font-semibold w-32">Term:</span>
            <span className="border-b border-dotted border-gray-400 flex-1 pl-2">
              {result.term}
            </span>
          </div>
          <div className="flex">
            <span className="font-semibold w-32">No. in Class:</span>
            <span className="border-b border-dotted border-gray-400 flex-1 pl-2">
              {result.outOf || 'N/A'}
            </span>
          </div>
          <div className="flex">
            <span className="font-semibold w-32">Position:</span>
            <span className="border-b border-dotted border-gray-400 flex-1 pl-2">
              {result.position && result.outOf ? `${result.position} out of ${result.outOf}` : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Academic Performance */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-3 bg-gray-100 p-2 text-center">ACADEMIC PERFORMANCE</h3>
        <div className="border border-gray-400">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-2 text-left">SUBJECTS</th>
                <th className="border border-gray-400 p-2 text-center">1st CA<br/>(20)</th>
                <th className="border border-gray-400 p-2 text-center">2nd CA<br/>(20)</th>
                <th className="border border-gray-400 p-2 text-center">EXAM<br/>(60)</th>
                <th className="border border-gray-400 p-2 text-center">TOTAL<br/>(100)</th>
                <th className="border border-gray-400 p-2 text-center">GRADE</th>
                <th className="border border-gray-400 p-2 text-center">REMARK</th>
                <th className="border border-gray-400 p-2 text-center">POSITION</th>
              </tr>
            </thead>
            <tbody>
              {result.subjects?.map((subject: any, index: number) => (
                <tr key={index}>
                  <td className="border border-gray-400 p-2 font-medium">{subject.subject}</td>
                  <td className="border border-gray-400 p-2 text-center">{subject.ca1 || 0}</td>
                  <td className="border border-gray-400 p-2 text-center">{subject.ca2 || 0}</td>
                  <td className="border border-gray-400 p-2 text-center">{subject.exam || 0}</td>
                  <td className="border border-gray-400 p-2 text-center font-semibold">{subject.total || 0}</td>
                  <td className="border border-gray-400 p-2 text-center">
                    <Badge className={subject.grade?.includes('A') ? 'bg-green-100 text-green-800' : 
                                    subject.grade?.includes('B') ? 'bg-blue-100 text-blue-800' : 
                                    subject.grade?.includes('C') ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-red-100 text-red-800'}>
                      {subject.grade}
                    </Badge>
                  </td>
                  <td className="border border-gray-400 p-2 text-center text-sm">{subject.remark || getGradeRemark(subject.grade)}</td>
                  <td className="border border-gray-400 p-2 text-center">{subject.position || (index + 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <h4 className="font-semibold text-sm">TOTAL SCORE</h4>
            <p className="text-2xl font-bold text-blue-600">{result.totalScore || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <h4 className="font-semibold text-sm">AVERAGE</h4>
            <p className="text-2xl font-bold text-green-600">{result.average || 0}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <h4 className="font-semibold text-sm">GRADE POINT</h4>
            <p className="text-2xl font-bold text-purple-600">{result.gpa || 0}/4.0</p>
          </CardContent>
        </Card>
      </div>

      {/* Skills Assessment */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Psychomotor Skills */}
        {result.psychomotor && (
          <div>
            <h3 className="text-lg font-bold mb-3 bg-gray-100 p-2 text-center">PSYCHOMOTOR SKILLS</h3>
            <div className="border border-gray-400">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-400 p-2 text-left">SKILL</th>
                    <th className="border border-gray-400 p-2 text-center">RATING</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.psychomotor).map(([skill, rating]) => (
                    <tr key={skill}>
                      <td className="border border-gray-400 p-2 capitalize">
                        {skill.replace(/([A-Z])/g, ' $1').trim()}
                      </td>
                      <td className="border border-gray-400 p-2 text-center">{rating as string}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Affective Skills */}
        {result.affective && (
          <div>
            <h3 className="text-lg font-bold mb-3 bg-gray-100 p-2 text-center">AFFECTIVE SKILLS</h3>
            <div className="border border-gray-400">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-400 p-2 text-left">TRAIT</th>
                    <th className="border border-gray-400 p-2 text-center">RATING</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.affective).map(([trait, rating]) => (
                    <tr key={trait}>
                      <td className="border border-gray-400 p-2 capitalize">
                        {trait.replace(/([A-Z])/g, ' $1').trim()}
                      </td>
                      <td className="border border-gray-400 p-2 text-center">{rating as string}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Attendance */}
      {result.attendance && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3 bg-gray-100 p-2 text-center">ATTENDANCE RECORD</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="font-semibold">Total Days</p>
              <p className="text-xl font-bold">{result.attendance.total || 0}</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">Present</p>
              <p className="text-xl font-bold text-green-600">{result.attendance.present || 0}</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">Absent</p>
              <p className="text-xl font-bold text-red-600">{result.attendance.absent || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="mb-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <h4 className="font-semibold mb-2">CLASS TEACHER'S COMMENT:</h4>
            <div className="border border-gray-400 p-3 min-h-[60px] bg-gray-50">
              {result.classTeacher ? 
                `${getOverallComment(result.average || 0)} - ${result.classTeacher}` : 
                getOverallComment(result.average || 0)
              }
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">PRINCIPAL'S COMMENT:</h4>
            <div className="border border-gray-400 p-3 min-h-[60px] bg-gray-50">
              {result.principalComment || 'Keep up the good work and continue to strive for excellence.'}
            </div>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-3 gap-8 mb-6">
        <div className="text-center">
          <div className="border-t border-gray-400 pt-2">
            <p className="font-semibold">Class Teacher's Signature</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-gray-400 pt-2">
            <p className="font-semibold">Principal's Signature</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-gray-400 pt-2">
            <p className="font-semibold">Parent/Guardian's Signature</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center border-t border-gray-400 pt-4">
        <p className="text-sm">
          <strong>Next Term Begins:</strong> {result.nextTermBegins || 'Date to be announced'}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          This is a computer-generated result sheet. No signature required.
        </p>
      </div>
    </div>
  );
}
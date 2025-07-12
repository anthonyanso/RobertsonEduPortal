import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// Red school logo SVG as inline component
const RedSchoolLogo = () => (
  <svg width="50" height="50" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="38" fill="#DC2626" stroke="#B91C1C" strokeWidth="2"/>
    <rect x="20" y="25" width="40" height="30" rx="2" fill="white"/>
    <rect x="22" y="27" width="36" height="26" rx="1" fill="#DC2626"/>
    <rect x="24" y="29" width="32" height="4" fill="white"/>
    <rect x="24" y="35" width="32" height="4" fill="white"/>
    <rect x="24" y="41" width="32" height="4" fill="white"/>
    <rect x="24" y="47" width="32" height="4" fill="white"/>
    <circle cx="40" cy="15" r="3" fill="#DC2626"/>
    <path d="M35 15 L40 10 L45 15 Z" fill="#DC2626"/>
    <text x="40" y="67" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontSize="8" fontWeight="bold">ROBERTSON</text>
    <text x="40" y="75" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontSize="6">EDUCATION</text>
  </svg>
);

interface NigerianResultTemplateProps {
  result: any;
  student: any;
  schoolInfo?: any;
}

export default function NigerianResultTemplate({ result, student, schoolInfo }: NigerianResultTemplateProps) {
  // Print-specific CSS
  const printStyles = `
    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      
      .print-page-break {
        page-break-before: always;
      }
      
      .print-no-break {
        page-break-inside: avoid;
      }
      
      .print-show {
        display: block !important;
      }
      
      .print-hide {
        display: none !important;
      }
      
      body {
        font-size: 12pt !important;
        line-height: 1.2 !important;
      }
      
      .print-table {
        width: 100% !important;
        border-collapse: collapse !important;
      }
      
      .print-table td, .print-table th {
        border: 1px solid #000 !important;
        padding: 4px !important;
        font-size: 10pt !important;
      }
      
      .print-border {
        border: 2px solid #000 !important;
      }
      
      .print-title {
        font-size: 14pt !important;
        font-weight: bold !important;
      }
      
      .print-subtitle {
        font-size: 12pt !important;
        font-weight: bold !important;
      }
      
      @page {
        size: A4;
        margin: 0.5in;
      }
    }
  `;

  // Add the print styles to the document
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = printStyles;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [printStyles]);
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
    <div className="bg-white p-8 font-serif print:p-4 print:bg-white print-no-break" style={{ fontFamily: 'Times New Roman, serif' }}>
      {/* Header */}
      <div className="border-4 border-double border-black p-4 mb-6 print-border print-no-break">
        <div className="flex items-center justify-between mb-4">
          <RedSchoolLogo />
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
      <div className="mb-6 print-no-break">
        <h3 className="text-lg font-bold mb-3 bg-gray-100 p-2 text-center print-subtitle">ACADEMIC PERFORMANCE</h3>
        <div className="border border-gray-400 print-border">
          <table className="w-full print-table">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-2 text-left print-subtitle">SUBJECTS</th>
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
                    <span className={`print:text-black ${subject.grade?.includes('A') ? 'font-bold' : ''}`}>
                      {subject.grade}
                    </span>
                  </td>
                  <td className="border border-gray-400 p-2 text-center text-sm">{subject.remark || getGradeRemark(subject.grade)}</td>
                  <td className="border border-gray-400 p-2 text-center">{subject.position || (index + 1)}</td>
                </tr>
              ))}
              
              {/* Summary Row */}
              <tr className="bg-gray-100 font-bold">
                <td className="border border-gray-400 p-2 text-center" colSpan={4}>TOTAL</td>
                <td className="border border-gray-400 p-2 text-center">{result.totalScore || 0}</td>
                <td className="border border-gray-400 p-2 text-center">-</td>
                <td className="border border-gray-400 p-2 text-center">AVERAGE: {result.average || 0}%</td>
                <td className="border border-gray-400 p-2 text-center">GPA: {result.gpa || 0}</td>
              </tr>
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
      <div className="grid grid-cols-2 gap-6 mb-6 print-no-break">
        {/* Psychomotor Skills */}
        {result.psychomotor && (
          <div className="print-no-break">
            <h3 className="text-lg font-bold mb-3 bg-gray-100 p-2 text-center print-subtitle">PSYCHOMOTOR SKILLS</h3>
            <div className="border border-gray-400 print-border">
              <table className="w-full print-table">
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
          <div className="print-no-break">
            <h3 className="text-lg font-bold mb-3 bg-gray-100 p-2 text-center print-subtitle">AFFECTIVE SKILLS</h3>
            <div className="border border-gray-400 print-border">
              <table className="w-full print-table">
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
        <div className="mb-6 print-no-break">
          <h3 className="text-lg font-bold mb-3 bg-gray-100 p-2 text-center print-subtitle">ATTENDANCE RECORD</h3>
          <div className="border border-gray-400 print-border">
            <table className="w-full print-table">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-400 p-2 text-center">TOTAL DAYS</th>
                  <th className="border border-gray-400 p-2 text-center">PRESENT</th>
                  <th className="border border-gray-400 p-2 text-center">ABSENT</th>
                  <th className="border border-gray-400 p-2 text-center">PERCENTAGE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-2 text-center font-bold">{result.attendance.total || 0}</td>
                  <td className="border border-gray-400 p-2 text-center font-bold">{result.attendance.present || 0}</td>
                  <td className="border border-gray-400 p-2 text-center font-bold">{result.attendance.absent || 0}</td>
                  <td className="border border-gray-400 p-2 text-center font-bold">
                    {result.attendance.total ? ((result.attendance.present / result.attendance.total) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grading Scale Reference */}
      <div className="mb-6 print-no-break">
        <h3 className="text-lg font-bold mb-3 bg-gray-100 p-2 text-center print-subtitle">GRADING SCALE</h3>
        <div className="border border-gray-400 print-border">
          <table className="w-full print-table">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-2 text-center">GRADE</th>
                <th className="border border-gray-400 p-2 text-center">MARKS</th>
                <th className="border border-gray-400 p-2 text-center">INTERPRETATION</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-400 p-2 text-center font-bold">A</td>
                <td className="border border-gray-400 p-2 text-center">70-100</td>
                <td className="border border-gray-400 p-2 text-center">Distinction</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 text-center font-bold">B</td>
                <td className="border border-gray-400 p-2 text-center">60-69</td>
                <td className="border border-gray-400 p-2 text-center">Credit</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 text-center font-bold">C</td>
                <td className="border border-gray-400 p-2 text-center">50-59</td>
                <td className="border border-gray-400 p-2 text-center">Credit</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 text-center font-bold">D</td>
                <td className="border border-gray-400 p-2 text-center">40-49</td>
                <td className="border border-gray-400 p-2 text-center">Pass</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 text-center font-bold">F</td>
                <td className="border border-gray-400 p-2 text-center">0-39</td>
                <td className="border border-gray-400 p-2 text-center">Fail</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Comments */}
      <div className="mb-6 print-no-break">
        <h3 className="text-lg font-bold mb-3 bg-gray-100 p-2 text-center print-subtitle">COMMENTS</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <h4 className="font-semibold mb-2 print-subtitle">CLASS TEACHER'S COMMENT:</h4>
            <div className="border border-gray-400 p-3 min-h-[60px] bg-gray-50 print-border">
              {result.classTeacher ? 
                `${getOverallComment(result.average || 0)} - ${result.classTeacher}` : 
                getOverallComment(result.average || 0)
              }
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2 print-subtitle">PRINCIPAL'S COMMENT:</h4>
            <div className="border border-gray-400 p-3 min-h-[60px] bg-gray-50 print-border">
              {result.principalComment || 'Keep up the good work and continue to strive for excellence.'}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="mb-6 print-no-break">
        <h3 className="text-lg font-bold mb-3 bg-gray-100 p-2 text-center print-subtitle">PERFORMANCE SUMMARY</h3>
        <div className="border border-gray-400 print-border">
          <table className="w-full print-table">
            <tbody>
              <tr>
                <td className="border border-gray-400 p-2 font-semibold">Total Subjects Offered:</td>
                <td className="border border-gray-400 p-2">{result.subjects?.length || 0}</td>
                <td className="border border-gray-400 p-2 font-semibold">Total Score:</td>
                <td className="border border-gray-400 p-2">{result.totalScore || 0}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 font-semibold">Average Score:</td>
                <td className="border border-gray-400 p-2">{result.average || 0}%</td>
                <td className="border border-gray-400 p-2 font-semibold">Grade Point Average:</td>
                <td className="border border-gray-400 p-2">{result.gpa || 0}/4.0</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 font-semibold">Position in Class:</td>
                <td className="border border-gray-400 p-2">{result.position && result.outOf ? `${result.position} out of ${result.outOf}` : 'N/A'}</td>
                <td className="border border-gray-400 p-2 font-semibold">Overall Grade:</td>
                <td className="border border-gray-400 p-2 font-bold">
                  {result.average >= 70 ? 'A (Distinction)' : 
                   result.average >= 60 ? 'B (Credit)' : 
                   result.average >= 50 ? 'C (Credit)' : 
                   result.average >= 40 ? 'D (Pass)' : 'F (Fail)'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Signatures */}
      <div className="mb-6 print-no-break">
        <h3 className="text-lg font-bold mb-3 bg-gray-100 p-2 text-center print-subtitle">SIGNATURES</h3>
        <div className="border border-gray-400 print-border">
          <table className="w-full print-table">
            <tbody>
              <tr>
                <td className="border border-gray-400 p-4 text-center">
                  <div className="mb-8"></div>
                  <div className="border-t border-gray-400 pt-2">
                    <p className="font-semibold">Class Teacher's Signature</p>
                    <p className="text-sm text-gray-600">Date: _____________</p>
                  </div>
                </td>
                <td className="border border-gray-400 p-4 text-center">
                  <div className="mb-8"></div>
                  <div className="border-t border-gray-400 pt-2">
                    <p className="font-semibold">Principal's Signature</p>
                    <p className="text-sm text-gray-600">Date: _____________</p>
                  </div>
                </td>
                <td className="border border-gray-400 p-4 text-center">
                  <div className="mb-8"></div>
                  <div className="border-t border-gray-400 pt-2">
                    <p className="font-semibold">Parent/Guardian's Signature</p>
                    <p className="text-sm text-gray-600">Date: _____________</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center border-t border-gray-400 pt-4 print-no-break">
        <div className="mb-4">
          <p className="text-sm font-semibold">
            <strong>Next Term Begins:</strong> {result.nextTermBegins || 'Date to be announced'}
          </p>
          <p className="text-sm">
            <strong>School Reopens:</strong> {result.resumptionDate || 'Date to be announced'}
          </p>
        </div>
        
        <div className="border-t border-gray-400 pt-2">
          <p className="text-xs text-gray-500">
            This is a computer-generated result sheet from Robertson Education Management System.
          </p>
          <p className="text-xs text-gray-500">
            Generated on: {new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}
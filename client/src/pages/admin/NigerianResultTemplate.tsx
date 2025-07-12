import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import logoUrl from "@assets/logo_1751823007371.png";



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
        font-size: 10pt !important;
        line-height: 1.1 !important;
      }
      
      .print-table {
        width: 100% !important;
        border-collapse: collapse !important;
      }
      
      .print-table td, .print-table th {
        border: 1px solid #000 !important;
        padding: 2px !important;
        font-size: 8pt !important;
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
        margin: 0.3in;
      }
      
      .print-header {
        margin-bottom: 8px !important;
      }
      
      .print-logo {
        width: 40px !important;
        height: 40px !important;
        display: block !important;
        opacity: 1 !important;
        visibility: visible !important;
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
        object-fit: contain !important;
        border: none !important;
        background: transparent !important;
      }
      
      /* Force all images to display in print */
      img[src*="logo"], img[alt*="Logo"], img[alt*="logo"] {
        display: block !important;
        opacity: 1 !important;
        visibility: visible !important;
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
        width: 40px !important;
        height: 40px !important;
        object-fit: contain !important;
        max-width: 40px !important;
        max-height: 40px !important;
        min-width: 40px !important;
        min-height: 40px !important;
      }
      
      /* Force specific logo class to display */
      .print-logo {
        display: block !important;
        opacity: 1 !important;
        visibility: visible !important;
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
        width: 40px !important;
        height: 40px !important;
        object-fit: contain !important;
        background-image: url('${logoUrl}') !important;
        background-size: contain !important;
        background-repeat: no-repeat !important;
        background-position: center !important;
      }
      
      /* Force logo container to display properly */
      .logo-container {
        display: block !important;
        opacity: 1 !important;
        visibility: visible !important;
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
        width: 40px !important;
        height: 40px !important;
        background-image: url('${logoUrl}') !important;
        background-size: contain !important;
        background-repeat: no-repeat !important;
        background-position: center !important;
        border: 1px solid #000 !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      /* Force background images to print */
      * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      /* SVG logo print styles */
      .print-logo-svg {
        display: block !important;
        opacity: 1 !important;
        visibility: visible !important;
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
        width: 48px !important;
        height: 48px !important;
      }
      
      /* Force SVG patterns to display in print */
      svg pattern image {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      /* Fallback logo text display */
      .logo-container .hidden {
        display: none !important;
      }
      
      /* Foolproof print logo using CSS content */
      @media print {
        .screen-logo {
          display: none !important;
        }
        
        .logo-container {
          position: relative !important;
          width: 48px !important;
          height: 48px !important;
          border: 2px solid #000 !important;
          background: #dc2626 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        .logo-container::before {
          content: "ROBERTSON" !important;
          position: absolute !important;
          top: 8px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          color: white !important;
          font-size: 6px !important;
          font-weight: bold !important;
          line-height: 1 !important;
          text-align: center !important;
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        .logo-container::after {
          content: "EDUCATION CENTRE" !important;
          position: absolute !important;
          bottom: 8px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          color: white !important;
          font-size: 5px !important;
          font-weight: bold !important;
          line-height: 1 !important;
          text-align: center !important;
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
      
      img {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .print-title {
        font-size: 11pt !important;
        margin: 4px 0 !important;
      }
      
      .print-student-info {
        font-size: 8pt !important;
        margin: 8px 0 !important;
      }
      
      .print-comments {
        font-size: 8pt !important;
        margin: 8px 0 !important;
      }
      
      .print-comment-box {
        min-height: 25px !important;
        padding: 3px !important;
      }
      
      .print-performance-summary {
        margin: 8px 0 !important;
      }
      
      .print-performance-box {
        padding: 4px !important;
        font-size: 8pt !important;
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
    <div className="bg-white p-4 font-serif print:p-2 print:bg-white print-no-break" style={{ fontFamily: 'Times New Roman, serif' }}>
      {/* Header */}
      <div className="border-4 border-double border-black p-2 mb-3 print-border print-no-break print-header">
        <div className="flex items-center justify-between mb-2">
          <div className="h-12 w-12 border-2 border-black flex items-center justify-center">
            <img 
              src={logoUrl} 
              alt="Robertson Education Centre" 
              className="h-12 w-12 object-contain" 
            />
          </div>
          <div className="text-center flex-1">
            <h1 className="text-lg font-bold text-blue-900 print-title">{defaultSchoolInfo.name}</h1>
            <p className="text-xs text-gray-600">{defaultSchoolInfo.address}</p>
            <p className="text-xs text-gray-500">
              Tel: {defaultSchoolInfo.phone} | Email: {defaultSchoolInfo.email}
            </p>
            <p className="text-xs font-semibold text-blue-800">"{defaultSchoolInfo.motto}"</p>
          </div>
          <div className="h-12 w-12 border-2 border-gray-300 flex items-center justify-center">
            <span className="text-xs text-gray-400">PASSPORT</span>
          </div>
        </div>
        
        <div className="text-center border-t border-b py-1 print-title">
          <h2 className="text-base font-bold">CONTINUOUS ASSESSMENT REPORT SHEET</h2>
          <p className="text-xs">Academic Session: {result.session} | {result.term}</p>
        </div>
      </div>

      {/* Student Information */}
      <div className="grid grid-cols-2 gap-4 mb-3 print-student-info">
        <div className="space-y-1">
          <div className="flex">
            <span className="font-semibold text-xs w-24">Student's Name:</span>
            <span className="border-b border-dotted border-gray-400 flex-1 pl-1 text-xs">
              {student ? `${student.firstName} ${student.lastName}` : 'N/A'}
            </span>
          </div>
          <div className="flex">
            <span className="font-semibold text-xs w-24">Admission No:</span>
            <span className="border-b border-dotted border-gray-400 flex-1 pl-1 text-xs">
              {result.studentId}
            </span>
          </div>
          <div className="flex">
            <span className="font-semibold text-xs w-24">Class:</span>
            <span className="border-b border-dotted border-gray-400 flex-1 pl-1 text-xs">
              {result.class}
            </span>
          </div>
          <div className="flex">
            <span className="font-semibold text-xs w-24">Age:</span>
            <span className="border-b border-dotted border-gray-400 flex-1 pl-1 text-xs">
              {student?.dateOfBirth ? new Date().getFullYear() - new Date(student.dateOfBirth).getFullYear() : 'N/A'}
            </span>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex">
            <span className="font-semibold text-xs w-24">Session:</span>
            <span className="border-b border-dotted border-gray-400 flex-1 pl-1 text-xs">
              {result.session}
            </span>
          </div>
          <div className="flex">
            <span className="font-semibold text-xs w-24">Term:</span>
            <span className="border-b border-dotted border-gray-400 flex-1 pl-1 text-xs">
              {result.term}
            </span>
          </div>
          <div className="flex">
            <span className="font-semibold text-xs w-24">No. in Class:</span>
            <span className="border-b border-dotted border-gray-400 flex-1 pl-1 text-xs">
              {result.outOf || 'N/A'}
            </span>
          </div>
          <div className="flex">
            <span className="font-semibold text-xs w-24">Position:</span>
            <span className="border-b border-dotted border-gray-400 flex-1 pl-1 text-xs">
              {result.position && result.outOf ? `${result.position} out of ${result.outOf}` : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Academic Performance */}
      <div className="mb-3 print-no-break">
        <h3 className="text-sm font-bold mb-1 bg-gray-100 p-1 text-center print-subtitle">ACADEMIC PERFORMANCE</h3>
        <div className="border border-gray-400 print-border">
          <table className="w-full print-table">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-1 text-left print-subtitle text-xs">SUBJECTS</th>
                <th className="border border-gray-400 p-1 text-center text-xs">1st CA<br/>(20)</th>
                <th className="border border-gray-400 p-1 text-center text-xs">2nd CA<br/>(20)</th>
                <th className="border border-gray-400 p-1 text-center text-xs">EXAM<br/>(60)</th>
                <th className="border border-gray-400 p-1 text-center text-xs">TOTAL<br/>(100)</th>
                <th className="border border-gray-400 p-1 text-center text-xs">GRADE</th>
                <th className="border border-gray-400 p-1 text-center text-xs">REMARK</th>
                <th className="border border-gray-400 p-1 text-center text-xs">POSITION</th>
              </tr>
            </thead>
            <tbody>
              {result.subjects?.map((subject: any, index: number) => (
                <tr key={index}>
                  <td className="border border-gray-400 p-1 font-medium text-xs">{subject.subject}</td>
                  <td className="border border-gray-400 p-1 text-center text-xs">{subject.ca1 || 0}</td>
                  <td className="border border-gray-400 p-1 text-center text-xs">{subject.ca2 || 0}</td>
                  <td className="border border-gray-400 p-1 text-center text-xs">{subject.exam || 0}</td>
                  <td className="border border-gray-400 p-1 text-center font-semibold text-xs">{subject.total || 0}</td>
                  <td className="border border-gray-400 p-1 text-center text-xs">
                    <span className={`print:text-black ${subject.grade?.includes('A') ? 'font-bold' : ''}`}>
                      {subject.grade}
                    </span>
                  </td>
                  <td className="border border-gray-400 p-1 text-center text-xs">{subject.remark || getGradeRemark(subject.grade)}</td>
                  <td className="border border-gray-400 p-1 text-center text-xs">{subject.position || (index + 1)}</td>
                </tr>
              ))}
              
              {/* Summary Row */}
              <tr className="bg-gray-100 font-bold">
                <td className="border border-gray-400 p-1 text-center text-xs" colSpan={4}>TOTAL</td>
                <td className="border border-gray-400 p-1 text-center text-xs">{result.totalScore || 0}</td>
                <td className="border border-gray-400 p-1 text-center text-xs">-</td>
                <td className="border border-gray-400 p-1 text-center text-xs">AVG: {result.average || 0}%</td>
                <td className="border border-gray-400 p-1 text-center text-xs">GPA: {result.gpa || 0}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>



      {/* Skills Assessment */}
      <div className="grid grid-cols-2 gap-2 mb-2 print-no-break">
        {/* Psychomotor Skills */}
        {result.psychomotor && (
          <div className="print-no-break">
            <h3 className="text-xs font-bold mb-1 bg-gray-100 p-1 text-center print-subtitle">PSYCHOMOTOR SKILLS</h3>
            <div className="border border-gray-400 print-border">
              <table className="w-full print-table">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-400 p-1 text-left text-xs">SKILL</th>
                    <th className="border border-gray-400 p-1 text-center text-xs">RATING</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.psychomotor).map(([skill, rating]) => (
                    <tr key={skill}>
                      <td className="border border-gray-400 p-1 capitalize text-xs">
                        {skill.replace(/([A-Z])/g, ' $1').trim()}
                      </td>
                      <td className="border border-gray-400 p-1 text-center text-xs">{rating as string}</td>
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
            <h3 className="text-xs font-bold mb-1 bg-gray-100 p-1 text-center print-subtitle">AFFECTIVE SKILLS</h3>
            <div className="border border-gray-400 print-border">
              <table className="w-full print-table">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-400 p-1 text-left text-xs">TRAIT</th>
                    <th className="border border-gray-400 p-1 text-center text-xs">RATING</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.affective).map(([trait, rating]) => (
                    <tr key={trait}>
                      <td className="border border-gray-400 p-1 capitalize text-xs">
                        {trait.replace(/([A-Z])/g, ' $1').trim()}
                      </td>
                      <td className="border border-gray-400 p-1 text-center text-xs">{rating as string}</td>
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
        <div className="mb-2 print-no-break">
          <h3 className="text-xs font-bold mb-1 bg-gray-100 p-1 text-center print-subtitle">ATTENDANCE RECORD</h3>
          <div className="border border-gray-400 print-border">
            <table className="w-full print-table">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-400 p-1 text-center text-xs">TOTAL DAYS</th>
                  <th className="border border-gray-400 p-1 text-center text-xs">PRESENT</th>
                  <th className="border border-gray-400 p-1 text-center text-xs">ABSENT</th>
                  <th className="border border-gray-400 p-1 text-center text-xs">PERCENTAGE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-1 text-center font-bold text-xs">{result.attendance.total || 0}</td>
                  <td className="border border-gray-400 p-1 text-center font-bold text-xs">{result.attendance.present || 0}</td>
                  <td className="border border-gray-400 p-1 text-center font-bold text-xs">{result.attendance.absent || 0}</td>
                  <td className="border border-gray-400 p-1 text-center font-bold text-xs">
                    {result.attendance.total ? ((result.attendance.present / result.attendance.total) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}



      {/* Comments */}
      <div className="mb-2 print-no-break print-comments">
        <h3 className="text-xs font-bold mb-1 bg-gray-100 p-1 text-center print-subtitle">COMMENTS</h3>
        <div className="grid grid-cols-1 gap-1">
          <div>
            <h4 className="font-semibold mb-1 print-subtitle text-xs">CLASS TEACHER'S COMMENT:</h4>
            <div className="border border-gray-400 p-2 min-h-[20px] bg-gray-50 print-border print-comment-box text-xs">
              {result.classTeacher ? 
                `${getOverallComment(result.average || 0)} - ${result.classTeacher}` : 
                getOverallComment(result.average || 0)
              }
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-1 print-subtitle text-xs">PRINCIPAL'S COMMENT:</h4>
            <div className="border border-gray-400 p-2 min-h-[20px] bg-gray-50 print-border print-comment-box text-xs">
              {result.principalComment || 'Keep up the good work and continue to strive for excellence.'}
            </div>
          </div>
        </div>
      </div>



      {/* Signatures */}
      <div className="mb-2 print-no-break">
        <h3 className="text-xs font-bold mb-1 bg-gray-100 p-1 text-center print-subtitle">SIGNATURES</h3>
        <div className="border border-gray-400 print-border">
          <table className="w-full print-table">
            <tbody>
              <tr>
                <td className="border border-gray-400 p-2 text-center text-xs">
                  <div className="mb-4"></div>
                  <div className="border-t border-gray-400 pt-1">
                    <p className="font-semibold text-xs">Class Teacher's Signature</p>
                    <p className="text-xs text-gray-600">Date: _______</p>
                  </div>
                </td>
                <td className="border border-gray-400 p-2 text-center text-xs">
                  <div className="mb-4"></div>
                  <div className="border-t border-gray-400 pt-1">
                    <p className="font-semibold text-xs">Principal's Signature</p>
                    <p className="text-xs text-gray-600">Date: _______</p>
                  </div>
                </td>
                <td className="border border-gray-400 p-2 text-center text-xs">
                  <div className="mb-4"></div>
                  <div className="border-t border-gray-400 pt-1">
                    <p className="font-semibold text-xs">Parent/Guardian's Signature</p>
                    <p className="text-xs text-gray-600">Date: _______</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center border-t border-gray-400 pt-1 print-no-break">
        <div className="mb-1">
          <p className="text-xs font-semibold">
            <strong>Next Term Begins:</strong> {result.nextTermBegins || 'Date to be announced'}
          </p>
        </div>
        <div className="border-t border-gray-400 pt-1">
          <p className="text-xs text-gray-500">
            Generated on: {new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}
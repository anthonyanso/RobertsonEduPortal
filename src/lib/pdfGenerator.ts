// Simple PDF generation utility for admission forms
// In a production environment, you would use libraries like jsPDF, PDFKit, or a server-side solution

export interface AdmissionFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  address: string;
  gradeLevel: string;
  preferredStartDate: string;
  previousSchool?: string;
  previousSchoolAddress?: string;
  lastGradeCompleted?: string;
  fatherName: string;
  motherName: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  guardianPhone: string;
  guardianEmail: string;
  medicalConditions?: string;
  specialNeeds?: string;
  heardAboutUs?: string;
}

export const generateAdmissionPDF = (formData: AdmissionFormData): void => {
  // Create a printable HTML document
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Robertson Education - Admission Application</title>
      <style>
        @page {
          margin: 1in;
          size: A4;
        }
        body {
          font-family: Arial, sans-serif;
          line-height: 1.4;
          color: #333;
          max-width: 8.5in;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #C41E3A;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          width: 80px;
          height: 80px;
          margin: 0 auto 15px;
        }
        .school-name {
          font-size: 28px;
          font-weight: bold;
          color: #C41E3A;
          margin-bottom: 5px;
        }
        .tagline {
          font-size: 14px;
          color: #DAA520;
          font-style: italic;
        }
        .form-title {
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 10px;
          color: #2C3E50;
        }
        .academic-year {
          text-align: center;
          color: #DAA520;
          font-weight: bold;
          margin-bottom: 30px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #C41E3A;
          border-bottom: 2px solid #DAA520;
          padding-bottom: 5px;
          margin-bottom: 15px;
        }
        .field-row {
          display: flex;
          margin-bottom: 12px;
          page-break-inside: avoid;
        }
        .field-label {
          font-weight: bold;
          width: 200px;
          flex-shrink: 0;
        }
        .field-value {
          flex: 1;
          border-bottom: 1px solid #ccc;
          min-height: 20px;
          padding-left: 10px;
        }
        .field-row.full-width .field-value {
          width: 100%;
        }
        .signature-section {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
        }
        .signature-box {
          width: 200px;
          text-align: center;
        }
        .signature-line {
          border-bottom: 1px solid #333;
          margin-bottom: 5px;
          height: 40px;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ccc;
          padding-top: 15px;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="school-name">ROBERTSON EDUCATION</div>
        <div class="tagline">Excellence in Learning</div>
      </div>

      <div class="form-title">ADMISSION APPLICATION FORM</div>
      <div class="academic-year">Academic Year 2024-2025</div>

      <div class="section">
        <div class="section-title">PERSONAL INFORMATION</div>
        <div class="field-row">
          <div class="field-label">First Name:</div>
          <div class="field-value">${formData.firstName}</div>
        </div>
        <div class="field-row">
          <div class="field-label">Last Name:</div>
          <div class="field-value">${formData.lastName}</div>
        </div>
        <div class="field-row">
          <div class="field-label">Date of Birth:</div>
          <div class="field-value">${formData.dateOfBirth}</div>
        </div>
        <div class="field-row">
          <div class="field-label">Gender:</div>
          <div class="field-value">${formData.gender}</div>
        </div>
        <div class="field-row">
          <div class="field-label">Nationality:</div>
          <div class="field-value">${formData.nationality}</div>
        </div>
        <div class="field-row full-width">
          <div class="field-label">Home Address:</div>
          <div class="field-value">${formData.address}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">ACADEMIC INFORMATION</div>
        <div class="field-row">
          <div class="field-label">Grade Level Applying For:</div>
          <div class="field-value">${formData.gradeLevel}</div>
        </div>
        <div class="field-row">
          <div class="field-label">Preferred Start Date:</div>
          <div class="field-value">${formData.preferredStartDate}</div>
        </div>
        <div class="field-row">
          <div class="field-label">Previous School:</div>
          <div class="field-value">${formData.previousSchool || ''}</div>
        </div>
        <div class="field-row">
          <div class="field-label">Previous School Address:</div>
          <div class="field-value">${formData.previousSchoolAddress || ''}</div>
        </div>
        <div class="field-row">
          <div class="field-label">Last Grade Completed:</div>
          <div class="field-value">${formData.lastGradeCompleted || ''}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">PARENT/GUARDIAN INFORMATION</div>
        <div class="field-row">
          <div class="field-label">Father's Full Name:</div>
          <div class="field-value">${formData.fatherName}</div>
        </div>
        <div class="field-row">
          <div class="field-label">Mother's Full Name:</div>
          <div class="field-value">${formData.motherName}</div>
        </div>
        <div class="field-row">
          <div class="field-label">Father's Occupation:</div>
          <div class="field-value">${formData.fatherOccupation || ''}</div>
        </div>
        <div class="field-row">
          <div class="field-label">Mother's Occupation:</div>
          <div class="field-value">${formData.motherOccupation || ''}</div>
        </div>
        <div class="field-row">
          <div class="field-label">Primary Contact Number:</div>
          <div class="field-value">${formData.guardianPhone}</div>
        </div>
        <div class="field-row">
          <div class="field-label">Email Address:</div>
          <div class="field-value">${formData.guardianEmail}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">ADDITIONAL INFORMATION</div>
        <div class="field-row full-width">
          <div class="field-label">Medical Conditions/Allergies:</div>
          <div class="field-value">${formData.medicalConditions || ''}</div>
        </div>
        <div class="field-row full-width">
          <div class="field-label">Special Needs/Accommodations:</div>
          <div class="field-value">${formData.specialNeeds || ''}</div>
        </div>
        <div class="field-row">
          <div class="field-label">How did you hear about us:</div>
          <div class="field-value">${formData.heardAboutUs || ''}</div>
        </div>
      </div>

      <div class="signature-section">
        <div class="signature-box">
          <div class="signature-line"></div>
          <div>Parent/Guardian Signature</div>
        </div>
        <div class="signature-box">
          <div class="signature-line"></div>
          <div>Date</div>
        </div>
        <div class="signature-box">
          <div class="signature-line"></div>
          <div>School Official</div>
        </div>
      </div>

      <div class="footer">
        <p><strong>Robertson Education</strong> | 123 Education Drive, Academic District | Phone: +1 (555) 123-4567</p>
        <p>Email: admissions@robertsoneducation.com | www.robertsoneducation.com</p>
        <p><em>Excellence in Learning</em></p>
      </div>
    </body>
    </html>
  `;

  // Create a new window with the HTML content
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };
  } else {
    // Fallback: create a temporary element and trigger print
    const printFrame = document.createElement('iframe');
    printFrame.style.display = 'none';
    document.body.appendChild(printFrame);
    
    const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
    if (frameDoc) {
      frameDoc.write(htmlContent);
      frameDoc.close();
      
      setTimeout(() => {
        printFrame.contentWindow?.print();
        document.body.removeChild(printFrame);
      }, 250);
    }
  }
};

// Alternative method for downloading as PDF (requires additional setup)
export const downloadAdmissionPDF = async (formData: AdmissionFormData): Promise<void> => {
  // This would require a library like jsPDF or a server-side PDF generation service
  // For now, we'll use the print method as a fallback
  generateAdmissionPDF(formData);
};

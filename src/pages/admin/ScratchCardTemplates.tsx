import { ScratchCard } from '@shared/schema';

export const generateProfessionalScratchCardTemplate = (cards: ScratchCard[], templateType: string) => {
  const getTemplateStyles = (type: string) => {
    const baseStyles = `
      @page { 
        margin: 10mm; 
        size: A4;
      }
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body { 
          margin: 0 !important; 
          padding: 0 !important; 
          background: white !important;
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        .card { 
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          margin: 5px !important;
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
        }
        .card-grid {
          page-break-inside: auto !important;
        }
        .card-grid .card:nth-child(6n) {
          page-break-after: always !important;
        }
      }
      body { 
        font-family: 'Georgia', serif; 
        margin: 0; 
        padding: 20px; 
        background: white; 
      }
      .page-header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 3px solid #d32f2f;
        padding-bottom: 20px;
      }
      .page-title {
        font-size: 28px;
        color: #d32f2f;
        font-weight: bold;
        margin: 0 0 10px 0;
        text-transform: uppercase;
        letter-spacing: 2px;
      }
      .page-subtitle {
        font-size: 16px;
        color: #666;
        margin: 0;
        font-style: italic;
      }
      .card-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        max-width: 100%;
        margin: 0 auto;
      }
      .card { 
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        border: 3px solid #d32f2f; 
        border-radius: 15px;
        padding: 18px; 
        width: 320px; 
        height: 200px; 
        box-shadow: 0 8px 20px rgba(211, 47, 47, 0.2);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
        print-color-adjust: exact;
      }
      .card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 12px;
        background: linear-gradient(90deg, #d32f2f, #ff5722, #d32f2f);
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
        print-color-adjust: exact;
      }
      .card-header {
        text-align: center;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 2px solid #e0e0e0;
      }
      .school-name {
        font-size: 18px;
        font-weight: bold;
        color: #d32f2f;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin: 0;
        text-shadow: 1px 1px 2px rgba(211, 47, 47, 0.1);
      }
      .card-type {
        font-size: 12px;
        color: #666;
        margin-top: 5px;
        font-style: italic;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .card-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .serial-section {
        margin-bottom: 15px;
      }
      .serial-label {
        font-size: 12px;
        color: #666;
        margin-bottom: 5px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .serial-number {
        font-size: 14px;
        font-weight: bold;
        color: #333;
        font-family: 'Courier New', monospace;
        background: linear-gradient(135deg, #f0f0f0, #e8e8e8);
        padding: 8px 12px;
        border-radius: 8px;
        border: 1px solid #ddd;
        text-align: center;
        letter-spacing: 1px;
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
        print-color-adjust: exact;
      }
      .pin-section {
        background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%);
        color: white;
        padding: 15px;
        border-radius: 12px;
        text-align: center;
        margin-top: 10px;
        border: 2px solid #b71c1c;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
        print-color-adjust: exact;
      }
      .pin-label {
        font-size: 11px;
        margin-bottom: 8px;
        color: #ffcccb;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .pin-code {
        font-size: 22px;
        font-weight: bold;
        font-family: 'Courier New', monospace;
        letter-spacing: 3px;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
      }
      .card-footer {
        text-align: center;
        font-size: 10px;
        color: #999;
        margin-top: 10px;
        font-style: italic;
      }
      .watermark {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 48px;
        color: rgba(211, 47, 47, 0.05);
        font-weight: bold;
        pointer-events: none;
        z-index: 1;
        text-transform: uppercase;
        letter-spacing: 2px;
      }
    `;

    return baseStyles;
  };

  const styles = getTemplateStyles(templateType);
  
  const cardsHtml = cards.map(card => `
    <div class="card">
      <div class="watermark">ROBERTSON</div>
      <div class="card-header">
        <div class="school-name">Robertson Education Centre</div>
        <div class="card-type">Student Result Access Card</div>
      </div>
      <div class="card-body">
        <div class="serial-section">
          <div class="serial-label">Serial Number</div>
          <div class="serial-number">${card.serialNumber}</div>
        </div>
        <div class="pin-section">
          <div class="pin-label">Access PIN</div>
          <div class="pin-code">${card.pin}</div>
        </div>
      </div>
      <div class="card-footer">
        Valid until: ${new Date(card.expiryDate).toLocaleDateString()}
      </div>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Robertson Education - Scratch Cards</title>
      <style>${styles}</style>
    </head>
    <body>
      <div class="page-header">
        <h1 class="page-title">Robertson Education Centre</h1>
        <p class="page-subtitle">Student Result Access Cards</p>
      </div>
      <div class="card-grid">
        ${cardsHtml}
      </div>
    </body>
    </html>
  `;
};
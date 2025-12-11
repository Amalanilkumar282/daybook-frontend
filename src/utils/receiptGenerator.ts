// Receipt Generation Utility
// Generates downloadable PDF receipts from daybook entry data

import { 
  ReceiptData, 
  ReceiptConfig, 
  DEFAULT_RECEIPT_CONFIG,
  TENANT_COMPANY_INFO,
  numberToWords,
  generateReceiptNumber
} from '../types/receipt';
import { DaybookEntry, PayType } from '../types/daybook';

// Format currency for display
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format date for display
export const formatReceiptDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

// Build Receipt Data from Daybook Entry
export const buildReceiptData = (
  entry: DaybookEntry,
  clientData?: any,
  nurseData?: any
): ReceiptData => {
  const company = TENANT_COMPANY_INFO[entry.tenant] || TENANT_COMPANY_INFO['Personal'];
  
  const payer = clientData ? {
    name: clientData.requestor_name || clientData.patient_name || 'N/A',
    phone: clientData.requestor_phone || clientData.patient_phone,
    email: clientData.email,
    address: clientData.address,
    patientName: clientData.patient_name,
    patientPhone: clientData.patient_phone,
  } : undefined;

  const nurseInfo = nurseData ? {
    name: nurseData.full_name || `${nurseData.first_name} ${nurseData.last_name}`.trim(),
    phone: nurseData.phone_number,
    regNo: nurseData.nurse_reg_no,
  } : undefined;

  return {
    receiptNumber: generateReceiptNumber(entry.id, entry.tenant, new Date(entry.created_at)),
    receiptDate: formatReceiptDate(entry.created_at),
    paymentDate: entry.custom_paid_date ? formatReceiptDate(entry.custom_paid_date) : undefined,
    company,
    tenant: entry.tenant,
    payer,
    amount: entry.amount,
    amountInWords: numberToWords(entry.amount),
    paymentType: entry.payment_type,
    paymentStatus: entry.pay_status,
    modeOfPayment: entry.mode_of_pay,
    paymentTypeSpecific: entry.payment_type_specific,
    description: entry.description || undefined,
    paymentDescription: entry.payment_description || undefined,
    referenceId: entry.id,
    createdBy: entry.created_by || undefined,
    nurseInfo,
  };
};

// Generate HTML for the receipt
export const generateReceiptHTML = (
  data: ReceiptData,
  config: ReceiptConfig = DEFAULT_RECEIPT_CONFIG
): string => {
  const isIncoming = data.paymentType === PayType.INCOMING;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt - ${data.receiptNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f5f5f5;
      padding: 20px;
      color: #333;
    }
    
    .receipt-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .receipt-header {
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      color: white;
      padding: 30px;
      text-align: center;
      position: relative;
    }
    
    .receipt-header::after {
      content: '';
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 25px solid transparent;
      border-right: 25px solid transparent;
      border-top: 20px solid #3b82f6;
    }
    
    .company-name {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 8px;
      letter-spacing: 1px;
    }
    
    .company-details {
      font-size: 13px;
      opacity: 0.9;
      line-height: 1.6;
    }
    
    .receipt-title {
      margin-top: 50px;
      text-align: center;
    }
    
    .receipt-title h2 {
      display: inline-block;
      background: ${isIncoming ? '#10b981' : '#ef4444'};
      color: white;
      padding: 12px 40px;
      border-radius: 25px;
      font-size: 18px;
      letter-spacing: 2px;
      text-transform: uppercase;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    
    .receipt-body {
      padding: 30px 40px;
    }
    
    .receipt-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px dashed #e5e7eb;
    }
    
    .receipt-info-item {
      text-align: left;
    }
    
    .receipt-info-item:last-child {
      text-align: right;
    }
    
    .info-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
    
    .info-value {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
    }
    
    .payer-section {
      background: #f8fafc;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 25px;
    }
    
    .section-title {
      font-size: 14px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .payer-name {
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 8px;
    }
    
    .payer-details {
      font-size: 14px;
      color: #6b7280;
    }
    
    .amount-section {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      border: 2px solid #10b981;
      border-radius: 12px;
      padding: 25px;
      text-align: center;
      margin-bottom: 25px;
    }
    
    .amount-label {
      font-size: 14px;
      color: #047857;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    
    .amount-value {
      font-size: 42px;
      font-weight: bold;
      color: #047857;
      margin-bottom: 10px;
    }
    
    .amount-words {
      font-size: 14px;
      color: #065f46;
      font-style: italic;
      background: white;
      padding: 8px 15px;
      border-radius: 20px;
      display: inline-block;
    }
    
    .payment-details {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 25px;
    }
    
    .detail-item {
      background: #f9fafb;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #3b82f6;
    }
    
    .detail-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    
    .detail-value {
      font-size: 15px;
      font-weight: 600;
      color: #1f2937;
    }
    
    .description-section {
      background: #fffbeb;
      border: 1px solid #fcd34d;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 25px;
    }
    
    .description-title {
      font-size: 13px;
      color: #92400e;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    
    .description-text {
      font-size: 14px;
      color: #78350f;
      line-height: 1.6;
    }
    
    .signature-section {
      display: flex;
      justify-content: space-between;
      margin-top: 50px;
      padding-top: 30px;
      border-top: 2px dashed #e5e7eb;
    }
    
    .signature-box {
      text-align: center;
      width: 200px;
    }
    
    .signature-line {
      border-top: 2px solid #1f2937;
      margin-bottom: 8px;
      margin-top: 60px;
    }
    
    .signature-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
    }
    
    .receipt-footer {
      background: #f8fafc;
      padding: 20px 40px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    
    .footer-note {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 10px;
    }
    
    .footer-thank {
      font-size: 16px;
      font-weight: 600;
      color: #1e3a8a;
    }
    
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 120px;
      color: rgba(0,0,0,0.03);
      font-weight: bold;
      text-transform: uppercase;
      pointer-events: none;
      z-index: 1;
    }
    
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .badge-success {
      background: #d1fae5;
      color: #047857;
    }
    
    .badge-warning {
      background: #fef3c7;
      color: #92400e;
    }
    
    .badge-primary {
      background: #dbeafe;
      color: #1e40af;
    }
    
    @media print {
      body {
        padding: 0;
        background: white;
      }
      
      .receipt-container {
        box-shadow: none;
        max-width: 100%;
      }
      
      .watermark {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="watermark">RECEIPT</div>
  
  <div class="receipt-container">
    <div class="receipt-header">
      <div class="company-name">${data.company.name}</div>
      ${config.showCompanyAddress && data.company.address ? `
      <div class="company-details">
        ${data.company.address}<br>
        ${data.company.phone ? `Phone: ${data.company.phone}` : ''}
        ${data.company.email ? ` | Email: ${data.company.email}` : ''}
        ${data.company.website ? `<br>${data.company.website}` : ''}
      </div>
      ` : ''}
    </div>
    
    <div class="receipt-title">
      <h2>${isIncoming ? 'Payment Receipt' : 'Payment Voucher'}</h2>
    </div>
    
    <div class="receipt-body">
      <div class="receipt-info">
        <div class="receipt-info-item">
          <div class="info-label">Receipt Number</div>
          <div class="info-value">${data.receiptNumber}</div>
        </div>
        <div class="receipt-info-item">
          <div class="info-label">Receipt Date</div>
          <div class="info-value">${data.receiptDate}</div>
        </div>
        ${data.paymentDate ? `
        <div class="receipt-info-item">
          <div class="info-label">Payment Date</div>
          <div class="info-value">${data.paymentDate}</div>
        </div>
        ` : ''}
        <div class="receipt-info-item">
          <div class="info-label">Reference ID</div>
          <div class="info-value">#${data.referenceId}</div>
        </div>
      </div>
      
      ${data.payer ? `
      <div class="payer-section">
        <div class="section-title">${isIncoming ? 'Received From' : 'Paid To'}</div>
        <div class="payer-name">${data.payer.name}</div>
        ${data.payer.patientName && data.payer.patientName !== data.payer.name ? `
        <div class="payer-details" style="margin-bottom: 8px;">
          <strong>Patient:</strong> ${data.payer.patientName}
          ${data.payer.patientPhone ? ` | Phone: ${data.payer.patientPhone}` : ''}
        </div>
        ` : ''}
        <div class="payer-details">
          ${data.payer.phone ? `Phone: ${data.payer.phone}` : ''}
          ${data.payer.email ? ` | Email: ${data.payer.email}` : ''}
          ${data.payer.address ? `<br>Address: ${data.payer.address}` : ''}
        </div>
      </div>
      ` : ''}
      
      ${data.nurseInfo ? `
      <div class="payer-section">
        <div class="section-title">Nurse Details</div>
        <div class="payer-name">${data.nurseInfo.name}</div>
        <div class="payer-details">
          ${data.nurseInfo.phone ? `Phone: ${data.nurseInfo.phone}` : ''}
          ${data.nurseInfo.regNo ? ` | Reg. No: ${data.nurseInfo.regNo}` : ''}
        </div>
      </div>
      ` : ''}
      
      <div class="amount-section">
        <div class="amount-label">${isIncoming ? 'Amount Received' : 'Amount Paid'}</div>
        <div class="amount-value">${formatCurrency(data.amount)}</div>
        <div class="amount-words">${data.amountInWords}</div>
      </div>
      
      <div class="payment-details">
        <div class="detail-item">
          <div class="detail-label">Payment Type</div>
          <div class="detail-value">
            <span class="badge ${isIncoming ? 'badge-success' : 'badge-warning'}">
              ${data.paymentType.toUpperCase()}
            </span>
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Payment Status</div>
          <div class="detail-value">
            <span class="badge ${data.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}">
              ${data.paymentStatus ? data.paymentStatus.replace('_', ' ').toUpperCase() : 'N/A'}
            </span>
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Mode of Payment</div>
          <div class="detail-value">${data.modeOfPayment ? data.modeOfPayment.replace('_', ' ').toUpperCase() : 'N/A'}</div>
        </div>
        ${data.paymentTypeSpecific ? `
        <div class="detail-item">
          <div class="detail-label">Payment Category</div>
          <div class="detail-value">${data.paymentTypeSpecific.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
        </div>
        ` : ''}
        <div class="detail-item">
          <div class="detail-label">Tenant/Branch</div>
          <div class="detail-value">
            <span class="badge badge-primary">${data.tenant}</span>
          </div>
        </div>
        ${data.createdBy ? `
        <div class="detail-item">
          <div class="detail-label">Processed By</div>
          <div class="detail-value">${data.createdBy}</div>
        </div>
        ` : ''}
      </div>
      
      ${data.description || data.paymentDescription ? `
      <div class="description-section">
        <div class="description-title">Description / Purpose</div>
        <div class="description-text">
          ${data.description || ''}
          ${data.description && data.paymentDescription ? '<br><br>' : ''}
          ${data.paymentDescription ? `<strong>Additional Notes:</strong> ${data.paymentDescription}` : ''}
        </div>
      </div>
      ` : ''}
      
      ${config.showSignatureArea ? `
      <div class="signature-section">
        <div class="signature-box">
          <div class="signature-line"></div>
          <div class="signature-label">${isIncoming ? "Receiver's Signature" : "Payer's Signature"}</div>
        </div>
        <div class="signature-box">
          <div class="signature-line"></div>
          <div class="signature-label">Authorized Signature</div>
        </div>
      </div>
      ` : ''}
    </div>
    
    <div class="receipt-footer">
      ${config.showTerms ? `
      <div class="footer-note">
        This is a computer-generated receipt. No signature required for amounts less than ₹5,000.
        <br>Please retain this receipt for your records.
      </div>
      ` : ''}
      <div class="footer-thank">Thank you for your business!</div>
    </div>
  </div>
</body>
</html>
`;
};

// Download receipt as PDF using browser print functionality
export const downloadReceiptAsPDF = (
  entry: DaybookEntry,
  clientData?: any,
  nurseData?: any,
  config: ReceiptConfig = DEFAULT_RECEIPT_CONFIG
): void => {
  const receiptData = buildReceiptData(entry, clientData, nurseData);
  const html = generateReceiptHTML(receiptData, config);
  
  // Create a new window for printing
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print dialog
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  } else {
    // Fallback: Create a blob and download as HTML
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt-${receiptData.receiptNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// Preview receipt in a modal/new tab
export const previewReceipt = (
  entry: DaybookEntry,
  clientData?: any,
  nurseData?: any,
  config: ReceiptConfig = DEFAULT_RECEIPT_CONFIG
): Window | null => {
  const receiptData = buildReceiptData(entry, clientData, nurseData);
  const html = generateReceiptHTML(receiptData, config);
  
  const previewWindow = window.open('', '_blank', 'width=850,height=700,scrollbars=yes');
  
  if (previewWindow) {
    previewWindow.document.write(html);
    previewWindow.document.close();
    previewWindow.document.title = `Receipt Preview - ${receiptData.receiptNumber}`;
  }
  
  return previewWindow;
};

// Get receipt HTML as string (for embedding in components)
export const getReceiptHTMLString = (
  entry: DaybookEntry,
  clientData?: any,
  nurseData?: any,
  config: ReceiptConfig = DEFAULT_RECEIPT_CONFIG
): string => {
  const receiptData = buildReceiptData(entry, clientData, nurseData);
  return generateReceiptHTML(receiptData, config);
};

// Export receipt data as JSON (for debugging or API purposes)
export const getReceiptData = (
  entry: DaybookEntry,
  clientData?: any,
  nurseData?: any
): ReceiptData => {
  return buildReceiptData(entry, clientData, nurseData);
};

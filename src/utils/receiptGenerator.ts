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

// Generate HTML for the receipt - Modern Invoice Style
export const generateReceiptHTML = (
  data: ReceiptData,
  config: ReceiptConfig = DEFAULT_RECEIPT_CONFIG
): string => {
  const isIncoming = data.paymentType === PayType.INCOMING;
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt - ${data.receiptNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
      color: #1a1a2e;
    }
    
    .invoice-wrapper {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .invoice {
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
    }
    
    /* Header */
    .invoice-header {
      background: linear-gradient(135deg, ${isIncoming ? '#059669 0%, #10b981 100%' : '#dc2626 0%, #ef4444 100%'});
      padding: 40px;
      color: white;
      position: relative;
      overflow: hidden;
    }
    
    .invoice-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 400px;
      height: 400px;
      background: rgba(255,255,255,0.1);
      border-radius: 50%;
    }
    
    .invoice-header::after {
      content: '';
      position: absolute;
      bottom: -60%;
      left: -10%;
      width: 300px;
      height: 300px;
      background: rgba(255,255,255,0.05);
      border-radius: 50%;
    }
    
    .header-content {
      position: relative;
      z-index: 1;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    
    .company-info h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    
    .company-info p {
      font-size: 14px;
      opacity: 0.9;
      line-height: 1.6;
    }
    
    .invoice-type {
      text-align: right;
    }
    
    .invoice-badge {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(10px);
      padding: 8px 20px;
      border-radius: 50px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    
    .invoice-number {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .invoice-number strong {
      display: block;
      font-size: 18px;
      margin-top: 4px;
    }
    
    /* Body */
    .invoice-body {
      padding: 40px;
    }
    
    /* Meta Info */
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 24px;
      padding: 24px;
      background: #f8fafc;
      border-radius: 12px;
      margin-bottom: 32px;
    }
    
    .meta-item {
      text-align: center;
    }
    
    .meta-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 6px;
      font-weight: 500;
    }
    
    .meta-value {
      font-size: 15px;
      font-weight: 600;
      color: #1e293b;
    }
    
    /* Parties Section */
    .parties-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 32px;
    }
    
    .party-card {
      padding: 24px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      background: #ffffff;
    }
    
    .party-card.highlight {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border-color: #86efac;
    }
    
    .party-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .party-label::before {
      content: '';
      width: 8px;
      height: 8px;
      background: ${isIncoming ? '#10b981' : '#ef4444'};
      border-radius: 50%;
    }
    
    .party-name {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 8px;
    }
    
    .party-details {
      font-size: 14px;
      color: #64748b;
      line-height: 1.6;
    }
    
    .party-details span {
      display: block;
    }
    
    /* Amount Section */
    .amount-section {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 32px;
      color: white;
      position: relative;
      overflow: hidden;
    }
    
    .amount-section::before {
      content: '₹';
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 120px;
      opacity: 0.05;
      font-weight: 700;
    }
    
    .amount-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .amount-label {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.7;
    }
    
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 50px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .status-paid {
      background: #059669;
      color: white;
    }
    
    .status-unpaid {
      background: #f59e0b;
      color: white;
    }
    
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    .amount-value {
      font-size: 48px;
      font-weight: 700;
      letter-spacing: -1px;
      margin-bottom: 12px;
    }
    
    .amount-words {
      font-size: 14px;
      opacity: 0.8;
      font-style: italic;
      padding: 12px 16px;
      background: rgba(255,255,255,0.1);
      border-radius: 8px;
      display: inline-block;
    }
    
    /* Details Table */
    .details-section {
      margin-bottom: 32px;
    }
    
    .section-title {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .section-title::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e2e8f0;
    }
    
    .details-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1px;
      background: #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
    }
    
    .detail-item {
      padding: 16px 20px;
      background: #ffffff;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .detail-item:nth-child(odd) {
      background: #f8fafc;
    }
    
    .detail-label {
      font-size: 13px;
      color: #64748b;
    }
    
    .detail-value {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
    }
    
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
    }
    
    .badge-green {
      background: #dcfce7;
      color: #166534;
    }
    
    .badge-red {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .badge-blue {
      background: #dbeafe;
      color: #1e40af;
    }
    
    .badge-purple {
      background: #f3e8ff;
      color: #7c3aed;
    }
    
    /* Description */
    .description-section {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 32px;
    }
    
    .description-title {
      font-size: 13px;
      font-weight: 600;
      color: #92400e;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .description-title svg {
      width: 16px;
      height: 16px;
    }
    
    .description-text {
      font-size: 14px;
      color: #78350f;
      line-height: 1.6;
    }
    
    /* Signature Section */
    .signature-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 48px;
      padding-top: 32px;
      border-top: 2px dashed #e2e8f0;
    }
    
    .signature-box {
      text-align: center;
    }
    
    .signature-line {
      width: 100%;
      height: 60px;
      border-bottom: 2px solid #cbd5e1;
      margin-bottom: 12px;
    }
    
    .signature-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .signature-date {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 4px;
    }
    
    /* Footer */
    .invoice-footer {
      background: #f8fafc;
      padding: 24px 40px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
    }
    
    .footer-note {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 12px;
      line-height: 1.6;
    }
    
    .footer-thanks {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }
    
    .footer-thanks span {
      color: ${isIncoming ? '#059669' : '#ef4444'};
    }
    
    /* Responsive */
    @media (max-width: 640px) {
      .parties-section {
        grid-template-columns: 1fr;
      }
      
      .header-content {
        flex-direction: column;
        gap: 20px;
      }
      
      .invoice-type {
        text-align: left;
      }
      
      .amount-value {
        font-size: 36px;
      }
      
      .signature-section {
        grid-template-columns: 1fr;
        gap: 32px;
      }
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .invoice {
        box-shadow: none;
        border-radius: 0;
      }
      
      .invoice-wrapper {
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-wrapper">
    <div class="invoice">
      <!-- Header -->
      <div class="invoice-header">
        <div class="header-content">
          <div class="company-info">
            <h1>${data.company.name}</h1>
            ${config.showCompanyAddress && data.company.address ? `
            <p>
              ${data.company.address}<br>
              ${data.company.phone ? `📞 ${data.company.phone}` : ''}
              ${data.company.email ? ` · ✉️ ${data.company.email}` : ''}
            </p>
            ` : ''}
          </div>
          <div class="invoice-type">
            <div class="invoice-badge">${isIncoming ? '💰 Payment Receipt' : '📤 Payment Voucher'}</div>
            <div class="invoice-number">
              Receipt Number
              <strong>${data.receiptNumber}</strong>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Body -->
      <div class="invoice-body">
        <!-- Meta Info -->
        <div class="meta-grid">
          <div class="meta-item">
            <div class="meta-label">Issue Date</div>
            <div class="meta-value">${data.receiptDate}</div>
          </div>
          ${data.paymentDate ? `
          <div class="meta-item">
            <div class="meta-label">Payment Date</div>
            <div class="meta-value">${data.paymentDate}</div>
          </div>
          ` : ''}
          <div class="meta-item">
            <div class="meta-label">Reference ID</div>
            <div class="meta-value">#${data.referenceId}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Branch</div>
            <div class="meta-value">${data.tenant}</div>
          </div>
        </div>
        
        <!-- Parties -->
        <div class="parties-section">
          <div class="party-card">
            <div class="party-label">From</div>
            <div class="party-name">${data.company.name}</div>
            <div class="party-details">
              ${data.company.address ? `<span>${data.company.address}</span>` : ''}
              ${data.company.email ? `<span>${data.company.email}</span>` : ''}
            </div>
          </div>
          <div class="party-card highlight">
            <div class="party-label">${isIncoming ? 'Received From' : 'Paid To'}</div>
            <div class="party-name">${data.payer?.name || data.nurseInfo?.name || 'N/A'}</div>
            <div class="party-details">
              ${data.payer?.patientName && data.payer.patientName !== data.payer?.name ? `<span>Patient: ${data.payer.patientName}</span>` : ''}
              ${data.payer?.phone || data.nurseInfo?.phone ? `<span>📞 ${data.payer?.phone || data.nurseInfo?.phone}</span>` : ''}
              ${data.payer?.address ? `<span>📍 ${data.payer.address}</span>` : ''}
              ${data.nurseInfo?.regNo ? `<span>Reg. No: ${data.nurseInfo.regNo}</span>` : ''}
            </div>
          </div>
        </div>
        
        <!-- Amount -->
        <div class="amount-section">
          <div class="amount-header">
            <div class="amount-label">${isIncoming ? 'Amount Received' : 'Amount Paid'}</div>
            <div class="status-pill ${data.paymentStatus === 'paid' ? 'status-paid' : 'status-unpaid'}">
              <span class="status-dot"></span>
              ${data.paymentStatus ? data.paymentStatus.replace('_', ' ').toUpperCase() : 'PENDING'}
            </div>
          </div>
          <div class="amount-value">${formatCurrency(data.amount)}</div>
          <div class="amount-words">${data.amountInWords}</div>
        </div>
        
        <!-- Payment Details -->
        <div class="details-section">
          <div class="section-title">Payment Details</div>
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">Transaction Type</span>
              <span class="badge ${isIncoming ? 'badge-green' : 'badge-red'}">${data.paymentType.toUpperCase()}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Payment Mode</span>
              <span class="detail-value">${data.modeOfPayment ? data.modeOfPayment.replace('_', ' ').toUpperCase() : 'CASH'}</span>
            </div>
            ${data.paymentTypeSpecific ? `
            <div class="detail-item">
              <span class="detail-label">Category</span>
              <span class="badge badge-purple">${data.paymentTypeSpecific.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            </div>
            ` : ''}
            <div class="detail-item">
              <span class="detail-label">Processed By</span>
              <span class="detail-value">${data.createdBy || 'System'}</span>
            </div>
          </div>
        </div>
        
        <!-- Description -->
        ${data.description || data.paymentDescription ? `
        <div class="description-section">
          <div class="description-title">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Description
          </div>
          <div class="description-text">
            ${data.description || ''}
            ${data.description && data.paymentDescription ? '<br><br>' : ''}
            ${data.paymentDescription ? `<strong>Notes:</strong> ${data.paymentDescription}` : ''}
          </div>
        </div>
        ` : ''}
        
        <!-- Signature -->
        ${config.showSignatureArea ? `
        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label">${isIncoming ? "Receiver's Signature" : "Payer's Signature"}</div>
            <div class="signature-date">Date: _____________</div>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label">Authorized Signatory</div>
            <div class="signature-date">${currentDate}</div>
          </div>
        </div>
        ` : ''}
      </div>
      
      <!-- Footer -->
      <div class="invoice-footer">
        ${config.showTerms ? `
        <div class="footer-note">
          This is a computer-generated receipt. Valid without signature for amounts less than ₹5,000.<br>
          Please retain this document for your records.
        </div>
        ` : ''}
        <div class="footer-thanks">Thank you for your <span>payment</span>! 🙏</div>
      </div>
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

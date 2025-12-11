import React, { useState, useRef, useEffect } from 'react';
import { DaybookEntry, PayType } from '../types/daybook';
import { ReceiptConfig, DEFAULT_RECEIPT_CONFIG, TENANT_COMPANY_INFO, CompanyInfo } from '../types/receipt';
import { downloadReceiptAsPDF, previewReceipt, getReceiptHTMLString } from '../utils/receiptGenerator';

interface PaymentReceiptProps {
  entry: DaybookEntry;
  clientData?: any;
  nurseData?: any;
  onClose?: () => void;
}

interface ReceiptSettingsModalProps {
  isOpen: boolean;
  config: ReceiptConfig;
  companyInfo: CompanyInfo;
  onConfigChange: (config: ReceiptConfig) => void;
  onCompanyInfoChange: (info: CompanyInfo) => void;
  onClose: () => void;
  onApply: () => void;
}

// Settings Modal Component
const ReceiptSettingsModal: React.FC<ReceiptSettingsModalProps> = ({
  isOpen,
  config,
  companyInfo,
  onConfigChange,
  onCompanyInfoChange,
  onClose,
  onApply,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-xl font-semibold text-neutral-900">Receipt Settings</h3>
          <p className="text-sm text-neutral-600 mt-1">Customize your receipt before downloading</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Company Information */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-800 mb-3 uppercase tracking-wide">Company Information</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={companyInfo.name}
                  onChange={(e) => onCompanyInfoChange({ ...companyInfo, name: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Address</label>
                <textarea
                  value={companyInfo.address || ''}
                  onChange={(e) => onCompanyInfoChange({ ...companyInfo, address: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={companyInfo.phone || ''}
                    onChange={(e) => onCompanyInfoChange({ ...companyInfo, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={companyInfo.email || ''}
                    onChange={(e) => onCompanyInfoChange({ ...companyInfo, email: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Website</label>
                <input
                  type="text"
                  value={companyInfo.website || ''}
                  onChange={(e) => onCompanyInfoChange({ ...companyInfo, website: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Display Options */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-800 mb-3 uppercase tracking-wide">Display Options</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showCompanyAddress}
                  onChange={(e) => onConfigChange({ ...config, showCompanyAddress: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700">Show company address</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showSignatureArea}
                  onChange={(e) => onConfigChange({ ...config, showSignatureArea: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700">Show signature area</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showTerms}
                  onChange={(e) => onConfigChange({ ...config, showTerms: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700">Show terms and notes</span>
              </label>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-neutral-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onApply}
            className="px-4 py-2 text-white bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Main PaymentReceipt Component
const PaymentReceipt: React.FC<PaymentReceiptProps> = ({
  entry,
  clientData,
  nurseData,
  onClose,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [config, setConfig] = useState<ReceiptConfig>(DEFAULT_RECEIPT_CONFIG);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(
    TENANT_COMPANY_INFO[entry.tenant] || TENANT_COMPANY_INFO['Personal']
  );
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isIncoming = entry.payment_type === PayType.INCOMING;

  // Update preview when settings change
  useEffect(() => {
    if (showPreview && iframeRef.current) {
      const modifiedConfig = { ...config };
      // Apply custom company info
      const html = getReceiptHTMLString(
        { ...entry },
        clientData,
        nurseData,
        modifiedConfig
      ).replace(
        TENANT_COMPANY_INFO[entry.tenant]?.name || '',
        companyInfo.name
      );
      
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [showPreview, config, companyInfo, entry, clientData, nurseData]);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      // Temporarily update TENANT_COMPANY_INFO with custom values
      const originalInfo = TENANT_COMPANY_INFO[entry.tenant];
      TENANT_COMPANY_INFO[entry.tenant] = companyInfo;
      
      downloadReceiptAsPDF(entry, clientData, nurseData, config);
      
      // Restore original info
      if (originalInfo) {
        TENANT_COMPANY_INFO[entry.tenant] = originalInfo;
      }
    } catch (error) {
      console.error('Error generating receipt:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewInNewTab = () => {
    // Temporarily update TENANT_COMPANY_INFO with custom values
    const originalInfo = TENANT_COMPANY_INFO[entry.tenant];
    TENANT_COMPANY_INFO[entry.tenant] = companyInfo;
    
    previewReceipt(entry, clientData, nurseData, config);
    
    // Restore original info
    if (originalInfo) {
      TENANT_COMPANY_INFO[entry.tenant] = originalInfo;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className={`px-6 py-4 ${isIncoming ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'} text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Payment Receipt</h3>
            <p className="text-sm opacity-90">
              {isIncoming ? 'Received payment confirmation' : 'Payment voucher'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatCurrency(entry.amount)}</div>
            <div className="text-sm opacity-90">Entry #{entry.id}</div>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-neutral-500">Type:</span>
            <span className={`ml-2 font-medium ${isIncoming ? 'text-green-600' : 'text-red-600'}`}>
              {entry.payment_type.toUpperCase()}
            </span>
          </div>
          <div>
            <span className="text-neutral-500">Status:</span>
            <span className="ml-2 font-medium text-neutral-800">
              {entry.pay_status?.replace('_', ' ').toUpperCase() || 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-neutral-500">Mode:</span>
            <span className="ml-2 font-medium text-neutral-800">
              {entry.mode_of_pay?.replace('_', ' ').toUpperCase() || 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-neutral-500">Tenant:</span>
            <span className="ml-2 font-medium text-neutral-800">{entry.tenant}</span>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {showPreview && (
        <div className="border-b border-neutral-200">
          <div className="p-4 bg-neutral-100 flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-700">Receipt Preview</span>
            <button
              onClick={handlePreviewInNewTab}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open in New Tab
            </button>
          </div>
          <div className="bg-neutral-200 p-4">
            <iframe
              ref={iframeRef}
              title="Receipt Preview"
              className="w-full h-[500px] bg-white rounded-lg shadow-inner"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-primary-500 text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {showPreview ? 'Hide Preview' : 'Preview Receipt'}
          </button>
          
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50 rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
          
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 ${
              isIncoming 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
            } text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isGenerating ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Receipt (PDF)
              </>
            )}
          </button>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="w-full mt-3 px-4 py-2 text-neutral-600 hover:text-neutral-800 text-sm font-medium transition-colors"
          >
            Close
          </button>
        )}
      </div>

      {/* Settings Modal */}
      <ReceiptSettingsModal
        isOpen={showSettings}
        config={config}
        companyInfo={companyInfo}
        onConfigChange={setConfig}
        onCompanyInfoChange={setCompanyInfo}
        onClose={() => setShowSettings(false)}
        onApply={() => setShowSettings(false)}
      />
    </div>
  );
};

// Simple Download Button Component (for use in tables/lists)
interface DownloadReceiptButtonProps {
  entry: DaybookEntry;
  clientData?: any;
  nurseData?: any;
  variant?: 'primary' | 'secondary' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DownloadReceiptButton: React.FC<DownloadReceiptButtonProps> = ({
  entry,
  clientData,
  nurseData,
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      downloadReceiptAsPDF(entry, clientData, nurseData);
    } catch (error) {
      console.error('Error generating receipt:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'border border-primary-500 text-primary-600 hover:bg-primary-50',
    icon: 'p-2 text-primary-600 hover:bg-primary-50 rounded-lg',
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className={`${variantClasses.icon} ${className} transition-colors disabled:opacity-50`}
        title="Download Payment Receipt"
      >
        {isGenerating ? (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className={`${variantClasses[variant]} ${sizeClasses[size]} ${className} rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2`}
    >
      {isGenerating ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generating...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Receipt
        </>
      )}
    </button>
  );
};

// Receipt Modal Component (for displaying receipt in a modal overlay)
interface ReceiptModalProps {
  isOpen: boolean;
  entry: DaybookEntry;
  clientData?: any;
  nurseData?: any;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  entry,
  clientData,
  nurseData,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <PaymentReceipt
          entry={entry}
          clientData={clientData}
          nurseData={nurseData}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default PaymentReceipt;

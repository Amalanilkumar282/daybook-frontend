import React, { useState, useEffect } from 'react';
import { DaybookFormData, DaybookEntry, PayType, PayStatus, ModeOfPay, Tenant } from '../types/daybook';
import { authUtils } from '../services/api';

interface DaybookFormProps {
  initialData?: DaybookEntry;
  onSubmit: (data: DaybookFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  mode: 'create' | 'edit';
}

const DaybookForm: React.FC<DaybookFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  mode,
}) => {
  const currentUser = authUtils.getUser();
  const isAdmin = authUtils.isAdmin();
  
  const [formData, setFormData] = useState<DaybookFormData>({
    amount: 0,
    payment_type: PayType.INCOMING,
    pay_status: PayStatus.PAID,
    mode_of_pay: ModeOfPay.CASH,
    tenant: currentUser?.tenant || Tenant.TATA_NURSING,
    description: '',
    nurse_id: '',
    client_id: '',
  });

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: initialData.amount,
        payment_type: initialData.payment_type,
        pay_status: initialData.pay_status,
        mode_of_pay: initialData.mode_of_pay,
        tenant: initialData.tenant,
        description: initialData.description || '',
        nurse_id: initialData.nurse_id || '',
        client_id: initialData.client_id || '',
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.mode_of_pay) {
      newErrors.mode_of_pay = 'Mode of payment is required';
    }

    if (!formData.tenant) {
      newErrors.tenant = 'Tenant is required';
    }

    // Validate nurse_id format if provided (must be empty or valid UUID)
    if (formData.payment_type === PayType.OUTGOING && formData.nurse_id && formData.nurse_id.trim() !== '') {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(formData.nurse_id.trim())) {
        newErrors.nurse_id = 'Nurse ID must be in UUID format or left empty';
      }
    }

    // Validate client_id format if provided (must be empty or valid UUID)
    if (formData.payment_type === PayType.INCOMING && formData.client_id && formData.client_id.trim() !== '') {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(formData.client_id.trim())) {
        newErrors.client_id = 'Client ID must be in UUID format or left empty';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      console.log('=== FORM SUBMIT DEBUG ===');
      console.log('Current user:', currentUser);
      console.log('User tenant:', currentUser?.tenant);
      console.log('Is admin:', isAdmin);
      console.log('Form data tenant:', formData.tenant);
      console.log('Token in localStorage:', localStorage.getItem('daybook_token')?.substring(0, 20) + '...');
      
      // Prepare submit data
      const submitData: DaybookFormData = {
        amount: formData.amount,
        payment_type: formData.payment_type,
        pay_status: formData.pay_status,
        mode_of_pay: formData.mode_of_pay,
        tenant: isAdmin ? formData.tenant : (currentUser?.tenant || formData.tenant),
        description: formData.description || undefined,
        receipt: receiptFile || undefined,
      };

      // Only add nurse_id if payment is outgoing AND it's not empty AND it's valid
      if (formData.payment_type === PayType.OUTGOING && formData.nurse_id && formData.nurse_id.trim() !== '') {
        submitData.nurse_id = formData.nurse_id.trim();
      }

      // Only add client_id if payment is incoming AND it's not empty AND it's valid
      if (formData.payment_type === PayType.INCOMING && formData.client_id && formData.client_id.trim() !== '') {
        submitData.client_id = formData.client_id.trim();
      }

      console.log('Tenant in submitData:', submitData.tenant);
      console.log('Full submitData:', {
        ...submitData,
        receipt: submitData.receipt ? 'FILE PRESENT' : undefined
      });

      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleReset = () => {
    setFormData({
      amount: 0,
      payment_type: PayType.INCOMING,
      pay_status: PayStatus.PAID,
      mode_of_pay: ModeOfPay.CASH,
      tenant: currentUser?.tenant || Tenant.TATA_NURSING,
      description: '',
      nurse_id: '',
      client_id: '',
    });
    setReceiptFile(null);
    setErrors({});
  };

  const handleInputChange = (field: keyof DaybookFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark-900 mb-4 sm:mb-6">
        {mode === 'create' ? 'Add New Entry' : 'Edit Entry'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 lg:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {/* Payment Type */}
          <div>
            <label htmlFor="payment_type" className="block text-sm font-medium text-dark-700 mb-2">
              Payment Type *
            </label>
            <select
              id="payment_type"
              value={formData.payment_type}
              onChange={(e) => handleInputChange('payment_type', e.target.value as PayType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value={PayType.INCOMING}>Incoming</option>
              <option value={PayType.OUTGOING}>Outgoing</option>
            </select>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-dark-700 mb-2">
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">₹</span>
              <input
                type="number"
                id="amount"
                step="0.01"
                min="0"
                value={formData.amount || ''}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={`w-full pl-8 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {/* Payment Status */}
          <div>
            <label htmlFor="pay_status" className="block text-sm font-medium text-dark-700 mb-2">
              Payment Status *
            </label>
            <select
              id="pay_status"
              value={formData.pay_status}
              onChange={(e) => handleInputChange('pay_status', e.target.value as PayStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value={PayStatus.PAID}>Paid</option>
              <option value={PayStatus.UNPAID}>Unpaid</option>
            </select>
          </div>

          {/* Mode of Payment */}
          <div>
            <label htmlFor="mode_of_pay" className="block text-sm font-medium text-dark-700 mb-2">
              Mode of Payment *
            </label>
            <select
              id="mode_of_pay"
              value={formData.mode_of_pay}
              onChange={(e) => handleInputChange('mode_of_pay', e.target.value as ModeOfPay)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.mode_of_pay ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value={ModeOfPay.CASH}>Cash</option>
              <option value={ModeOfPay.UPI}>UPI</option>
              <option value={ModeOfPay.ACCOUNT_TRANSFER}>Account Transfer</option>
            </select>
            {errors.mode_of_pay && <p className="mt-1 text-sm text-red-600">{errors.mode_of_pay}</p>}
          </div>
        </div>

        {/* Tenant - show only for admin */}
        {isAdmin && (
          <div>
            <label htmlFor="tenant" className="block text-sm font-medium text-dark-700 mb-2">
              Tenant *
            </label>
            <select
              id="tenant"
              value={formData.tenant}
              onChange={(e) => handleInputChange('tenant', e.target.value as Tenant)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.tenant ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value={Tenant.TATA_NURSING}>TATA Nursing</option>
              <option value={Tenant.DEARCARE}>Dearcare</option>
              <option value={Tenant.DEARCARE_ACADEMY}>Dearcare Academy</option>
            </select>
            {errors.tenant && <p className="mt-1 text-sm text-red-600">{errors.tenant}</p>}
          </div>
        )}

        {/* Conditional ID fields based on payment type */}
        {formData.payment_type === PayType.INCOMING ? (
          <div>
            <label htmlFor="client_id" className="block text-sm font-medium text-dark-700 mb-2">
              Client ID (Optional - UUID format required)
            </label>
            <input
              type="text"
              id="client_id"
              value={formData.client_id || ''}
              onChange={(e) => handleInputChange('client_id', e.target.value)}
              placeholder="Leave empty or enter UUID (e.g., 550e8400-e29b-41d4-a716-446655440000)"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.client_id ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.client_id && <p className="mt-1 text-sm text-red-600">{errors.client_id}</p>}
            <p className="mt-1 text-xs text-gray-500">
              ⚠️ Backend requires UUID format. Leave empty if not using client management system.
            </p>
          </div>
        ) : (
          <div>
            <label htmlFor="nurse_id" className="block text-sm font-medium text-dark-700 mb-2">
              Nurse ID (Optional - UUID format required)
            </label>
            <input
              type="text"
              id="nurse_id"
              value={formData.nurse_id || ''}
              onChange={(e) => handleInputChange('nurse_id', e.target.value)}
              placeholder="Leave empty or enter UUID (e.g., 550e8400-e29b-41d4-a716-446655440000)"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.nurse_id ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.nurse_id && <p className="mt-1 text-sm text-red-600">{errors.nurse_id}</p>}
            <p className="mt-1 text-xs text-gray-500">
              ⚠️ Backend requires UUID format. Leave empty if not using nurse management system.
            </p>
          </div>
        )}

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-dark-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter additional details (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Receipt Upload */}
        <div>
          <label htmlFor="receipt" className="block text-sm font-medium text-dark-700 mb-2">
            Receipt Upload (Optional)
          </label>
          <input
            type="file"
            id="receipt"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          {receiptFile && (
            <p className="mt-2 text-sm text-gray-600">
              Selected file: {receiptFile.name}
            </p>
          )}
          {initialData?.receipt && !receiptFile && (
            <p className="mt-2 text-sm text-blue-600">
              Current receipt: <a href={initialData.receipt} target="_blank" rel="noopener noreferrer" className="underline">View</a>
            </p>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Use "Incoming" for received payments (with optional Client ID) and "Outgoing" for made payments (with optional Nurse ID).
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white py-2 px-4 rounded-md font-medium transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {mode === 'create' ? 'Adding...' : 'Updating...'}
              </div>
            ) : (
              mode === 'create' ? 'Add Entry' : 'Update Entry'
            )}
          </button>
          
          {mode === 'create' && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-md font-medium transition-colors"
            >
              Reset
            </button>
          )}
          
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 bg-white hover:bg-gray-50 disabled:bg-gray-50 text-gray-700 border border-gray-300 py-2 px-4 rounded-md font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default DaybookForm;

import React, { useState, useEffect } from 'react';
import { DaybookFormData, DaybookEntry } from '../types/daybook';

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
  const [formData, setFormData] = useState<DaybookFormData>({
    date: new Date().toISOString().split('T')[0],
    particulars: '',
    voucherNumber: '',
    debit: 0,
    credit: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: new Date(initialData.date).toISOString().split('T')[0],
        particulars: initialData.particulars,
        voucherNumber: initialData.voucherNumber,
        debit: initialData.debit,
        credit: initialData.credit,
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.particulars.trim()) {
      newErrors.particulars = 'Particulars is required';
    }

    if (!formData.voucherNumber.trim()) {
      newErrors.voucherNumber = 'Voucher number is required';
    }

    if (formData.debit < 0) {
      newErrors.debit = 'Debit cannot be negative';
    }

    if (formData.credit < 0) {
      newErrors.credit = 'Credit cannot be negative';
    }

    if (formData.debit === 0 && formData.credit === 0) {
      newErrors.debit = 'Either debit or credit must be greater than 0';
      newErrors.credit = 'Either debit or credit must be greater than 0';
    }

    if (formData.debit > 0 && formData.credit > 0) {
      newErrors.debit = 'Cannot have both debit and credit amounts';
      newErrors.credit = 'Cannot have both debit and credit amounts';
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
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleReset = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      particulars: '',
      voucherNumber: '',
      debit: 0,
      credit: 0,
    });
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-dark-900 mb-6">
        {mode === 'create' ? 'Add New Entry' : 'Edit Entry'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-dark-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
          </div>

          {/* Voucher Number */}
          <div>
            <label htmlFor="voucherNumber" className="block text-sm font-medium text-dark-700 mb-2">
              Voucher Number *
            </label>
            <input
              type="text"
              id="voucherNumber"
              value={formData.voucherNumber}
              onChange={(e) => handleInputChange('voucherNumber', e.target.value)}
              placeholder="Enter voucher number"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.voucherNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.voucherNumber && <p className="mt-1 text-sm text-red-600">{errors.voucherNumber}</p>}
          </div>
        </div>

        {/* Particulars */}
        <div>
          <label htmlFor="particulars" className="block text-sm font-medium text-dark-700 mb-2">
            Particulars *
          </label>
          <textarea
            id="particulars"
            rows={3}
            value={formData.particulars}
            onChange={(e) => handleInputChange('particulars', e.target.value)}
            placeholder="Enter transaction details"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.particulars ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.particulars && <p className="mt-1 text-sm text-red-600">{errors.particulars}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Debit */}
          <div>
            <label htmlFor="debit" className="block text-sm font-medium text-dark-700 mb-2">
              Debit Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                id="debit"
                step="0.01"
                min="0"
                value={formData.debit}
                onChange={(e) => handleInputChange('debit', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={`w-full pl-8 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.debit ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.debit && <p className="mt-1 text-sm text-red-600">{errors.debit}</p>}
          </div>

          {/* Credit */}
          <div>
            <label htmlFor="credit" className="block text-sm font-medium text-dark-700 mb-2">
              Credit Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                id="credit"
                step="0.01"
                min="0"
                value={formData.credit}
                onChange={(e) => handleInputChange('credit', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={`w-full pl-8 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.credit ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.credit && <p className="mt-1 text-sm text-red-600">{errors.credit}</p>}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Enter either a debit amount OR a credit amount, not both. 
                At least one amount must be greater than 0.
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

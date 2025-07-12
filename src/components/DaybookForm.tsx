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
    <div className="panel-classic">
      <div className="panel-header-classic">
        <h2 className="text-classic-title font-bold text-tally-800">
          {mode === 'create' ? 'Add New Entry' : 'Edit Entry'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Date */}
          <div className="form-group-classic">
            <label htmlFor="date" className="label-classic">
              Date: <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={`input-classic ${errors.date ? 'border-red-500' : ''}`}
            />
            {errors.date && <p className="error-text-classic">{errors.date}</p>}
          </div>

          {/* Voucher Number */}
          <div className="form-group-classic">
            <label htmlFor="voucherNumber" className="label-classic">
              Voucher Number: <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="voucherNumber"
              value={formData.voucherNumber}
              onChange={(e) => handleInputChange('voucherNumber', e.target.value)}
              placeholder="Enter voucher number"
              className={`input-classic ${errors.voucherNumber ? 'border-red-500' : ''}`}
            />
            {errors.voucherNumber && <p className="error-text-classic">{errors.voucherNumber}</p>}
          </div>
        </div>

        {/* Particulars */}
        <div className="form-group-classic">
          <label htmlFor="particulars" className="label-classic">
            Particulars: <span className="text-red-600">*</span>
          </label>
          <textarea
            id="particulars"
            rows={3}
            value={formData.particulars}
            onChange={(e) => handleInputChange('particulars', e.target.value)}
            placeholder="Enter transaction details"
            className={`input-classic ${errors.particulars ? 'border-red-500' : ''}`}
          />
          {errors.particulars && <p className="error-text-classic">{errors.particulars}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Debit */}
          <div className="form-group-classic">
            <label htmlFor="debit" className="label-classic">
              Debit Amount:
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-tally-600 font-medium">$</span>
              <input
                type="number"
                id="debit"
                step="0.01"
                min="0"
                value={formData.debit}
                onChange={(e) => handleInputChange('debit', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={`input-classic pl-8 ${errors.debit ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.debit && <p className="error-text-classic">{errors.debit}</p>}
          </div>

          {/* Credit */}
          <div className="form-group-classic">
            <label htmlFor="credit" className="label-classic">
              Credit Amount:
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-tally-600 font-medium">$</span>
              <input
                type="number"
                id="credit"
                step="0.01"
                min="0"
                value={formData.credit}
                onChange={(e) => handleInputChange('credit', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={`input-classic pl-8 ${errors.credit ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.credit && <p className="error-text-classic">{errors.credit}</p>}
          </div>
        </div>

        {/* Information Box */}
        <div className="info-box-classic">
          <div className="flex items-start">
            <span className="text-tally-700 mr-2 mt-0.5">ℹ️</span>
            <div>
              <p className="text-classic-body text-tally-700 font-medium">
                <strong>Note:</strong> Enter either a debit amount OR a credit amount, not both. 
                At least one amount must be greater than 0.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-classic btn-primary flex-1"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <span className="mr-2">⏳</span>
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
              className="btn-classic btn-secondary flex-1"
            >
              Reset
            </button>
          )}
          
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="btn-classic btn-cancel flex-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default DaybookForm;

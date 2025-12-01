import React, { useState, useEffect } from 'react';
import { BankAccount, BankAccountFormData } from '../types/banking';
import { authUtils } from '../services/api';

interface BankAccountFormProps {
  initialData?: BankAccount;
  onSubmit: (data: BankAccountFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  mode: 'create' | 'edit';
}

const BankAccountForm: React.FC<BankAccountFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  mode,
}) => {
  const currentUser = authUtils.getUser();
  const isAdmin = authUtils.isAdmin();
  
  const [formData, setFormData] = useState<BankAccountFormData>({
    bank_name: '',
    account_name: '',
    shortform: '',
    account_number: '',
    ifsc: '',
    branch: '',
    balance: 0,
    tenant: currentUser?.tenant || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        bank_name: initialData.bank_name,
        account_name: initialData.account_name,
        shortform: initialData.shortform,
        account_number: initialData.account_number || '',
        ifsc: initialData.ifsc || '',
        branch: initialData.branch || '',
        balance: initialData.balance,
        tenant: initialData.tenant || '',
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.bank_name.trim()) {
      newErrors.bank_name = 'Bank name is required';
    }

    if (!formData.account_name.trim()) {
      newErrors.account_name = 'Account name is required';
    }

    if (!formData.shortform.trim()) {
      newErrors.shortform = 'Short form is required';
    }

    if (formData.balance !== undefined && formData.balance < 0) {
      newErrors.balance = 'Balance cannot be negative';
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

  const handleChange = (field: keyof BankAccountFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {mode === 'create' ? 'Create Bank Account' : 'Edit Bank Account'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bank Name */}
        <div>
          <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700 mb-2">
            Bank Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="bank_name"
            value={formData.bank_name}
            onChange={(e) => handleChange('bank_name', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.bank_name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., State Bank of India"
            disabled={isLoading}
          />
          {errors.bank_name && <p className="mt-1 text-sm text-red-500">{errors.bank_name}</p>}
        </div>

        {/* Account Name */}
        <div>
          <label htmlFor="account_name" className="block text-sm font-medium text-gray-700 mb-2">
            Account Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="account_name"
            value={formData.account_name}
            onChange={(e) => handleChange('account_name', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.account_name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Company Current Account"
            disabled={isLoading}
          />
          {errors.account_name && <p className="mt-1 text-sm text-red-500">{errors.account_name}</p>}
        </div>

        {/* Short Form */}
        <div>
          <label htmlFor="shortform" className="block text-sm font-medium text-gray-700 mb-2">
            Short Form <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="shortform"
            value={formData.shortform}
            onChange={(e) => handleChange('shortform', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.shortform ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., SBI-CURR"
            disabled={isLoading}
          />
          {errors.shortform && <p className="mt-1 text-sm text-red-500">{errors.shortform}</p>}
        </div>

        {/* Account Number */}
        <div>
          <label htmlFor="account_number" className="block text-sm font-medium text-gray-700 mb-2">
            Account Number
          </label>
          <input
            type="text"
            id="account_number"
            value={formData.account_number}
            onChange={(e) => handleChange('account_number', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 1234567890"
            disabled={isLoading}
          />
        </div>

        {/* IFSC Code */}
        <div>
          <label htmlFor="ifsc" className="block text-sm font-medium text-gray-700 mb-2">
            IFSC Code
          </label>
          <input
            type="text"
            id="ifsc"
            value={formData.ifsc}
            onChange={(e) => handleChange('ifsc', e.target.value.toUpperCase())}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., SBIN0001234"
            disabled={isLoading}
          />
        </div>

        {/* Branch */}
        <div>
          <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-2">
            Branch
          </label>
          <input
            type="text"
            id="branch"
            value={formData.branch}
            onChange={(e) => handleChange('branch', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Main Branch"
            disabled={isLoading}
          />
        </div>

        {/* Balance */}
        <div>
          <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-2">
            Initial Balance
          </label>
          <input
            type="number"
            id="balance"
            value={formData.balance}
            onChange={(e) => handleChange('balance', parseFloat(e.target.value) || 0)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.balance ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0.00"
            step="0.01"
            disabled={isLoading}
          />
          {errors.balance && <p className="mt-1 text-sm text-red-500">{errors.balance}</p>}
        </div>

        {/* Tenant - Only for Admin */}
        {isAdmin && (
          <div>
            <label htmlFor="tenant" className="block text-sm font-medium text-gray-700 mb-2">
              Tenant
            </label>
            <select
              id="tenant"
              value={formData.tenant}
              onChange={(e) => handleChange('tenant', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="">Select Tenant</option>
              <option value="TATANursing">TATA Nursing</option>
              <option value="Dearcare">Dearcare</option>
              <option value="DearcareAcademy">Dearcare Academy</option>
            </select>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : mode === 'create' ? 'Create Account' : 'Update Account'}
        </button>
      </div>
    </form>
  );
};

export default BankAccountForm;

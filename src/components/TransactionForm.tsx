import React, { useState, useEffect } from 'react';
import { TransactionType, TransactionStatus, BankAccount } from '../types/banking';
import { authUtils } from '../services/api';

interface TransactionFormProps {
  accounts: BankAccount[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  accounts,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const currentUser = authUtils.getUser();
  
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.DEPOSIT);
  const [formData, setFormData] = useState({
    bank_account_id: 0,
    from_account_id: 0,
    to_account_id: 0,
    amount: 0,
    cheque_number: '',
    reference: '',
    description: '',
    status: TransactionStatus.COMPLETED,
    tenant: currentUser?.tenant || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Reset form when transaction type changes
    setFormData(prev => ({
      ...prev,
      bank_account_id: 0,
      from_account_id: 0,
      to_account_id: 0,
      cheque_number: '',
    }));
    setErrors({});
  }, [transactionType]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (transactionType === TransactionType.DEPOSIT || transactionType === TransactionType.WITHDRAW || transactionType === TransactionType.CHEQUE) {
      if (!formData.bank_account_id) {
        newErrors.bank_account_id = 'Please select an account';
      }
    }

    if (transactionType === TransactionType.TRANSFER) {
      if (!formData.from_account_id) {
        newErrors.from_account_id = 'Please select source account';
      }
      if (!formData.to_account_id) {
        newErrors.to_account_id = 'Please select destination account';
      }
      if (formData.from_account_id === formData.to_account_id) {
        newErrors.to_account_id = 'Source and destination accounts must be different';
      }
    }

    if (transactionType === TransactionType.CHEQUE && !formData.cheque_number.trim()) {
      newErrors.cheque_number = 'Cheque number is required';
    }

    // Check sufficient balance for withdrawals and transfers
    if (transactionType === TransactionType.WITHDRAW || transactionType === TransactionType.CHEQUE) {
      const account = accounts.find(acc => acc.id === formData.bank_account_id);
      if (account && account.balance < formData.amount) {
        newErrors.amount = `Insufficient balance. Available: ₹${account.balance}`;
      }
    }

    if (transactionType === TransactionType.TRANSFER) {
      const fromAccount = accounts.find(acc => acc.id === formData.from_account_id);
      if (fromAccount && fromAccount.balance < formData.amount) {
        newErrors.amount = `Insufficient balance in source account. Available: ₹${fromAccount.balance}`;
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
      let payload: any = {};

      switch (transactionType) {
        case TransactionType.DEPOSIT:
          payload = {
            account_id: formData.bank_account_id,
            amount: formData.amount,
            description: formData.description,
            reference: formData.reference,
            tenant: formData.tenant,
          };
          break;

        case TransactionType.WITHDRAW:
          payload = {
            account_id: formData.bank_account_id,
            amount: formData.amount,
            description: formData.description,
            reference: formData.reference,
            tenant: formData.tenant,
          };
          break;

        case TransactionType.TRANSFER:
          payload = {
            from_account_id: formData.from_account_id,
            to_account_id: formData.to_account_id,
            amount: formData.amount,
            description: formData.description,
            reference: formData.reference,
            tenant: formData.tenant,
          };
          break;

        case TransactionType.CHEQUE:
          payload = {
            account_id: formData.bank_account_id,
            amount: formData.amount,
            cheque_number: formData.cheque_number,
            description: formData.description,
            reference: formData.reference,
            tenant: formData.tenant,
          };
          break;
      }

      await onSubmit({ type: transactionType, data: payload });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">New Transaction</h2>

      {/* Transaction Type Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Transaction Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.values(TransactionType).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTransactionType(type)}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                transactionType === type
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Selection for Deposit, Withdraw, Cheque */}
        {(transactionType === TransactionType.DEPOSIT || 
          transactionType === TransactionType.WITHDRAW || 
          transactionType === TransactionType.CHEQUE) && (
          <div className="md:col-span-2">
            <label htmlFor="bank_account_id" className="block text-sm font-medium text-gray-700 mb-2">
              Account <span className="text-red-500">*</span>
            </label>
            <select
              id="bank_account_id"
              value={formData.bank_account_id}
              onChange={(e) => handleChange('bank_account_id', parseInt(e.target.value))}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.bank_account_id ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            >
              <option value={0}>Select Account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.shortform} - {account.account_name} (Balance: ₹{account.balance.toFixed(2)})
                </option>
              ))}
            </select>
            {errors.bank_account_id && <p className="mt-1 text-sm text-red-500">{errors.bank_account_id}</p>}
          </div>
        )}

        {/* From and To Accounts for Transfer */}
        {transactionType === TransactionType.TRANSFER && (
          <>
            <div>
              <label htmlFor="from_account_id" className="block text-sm font-medium text-gray-700 mb-2">
                From Account <span className="text-red-500">*</span>
              </label>
              <select
                id="from_account_id"
                value={formData.from_account_id}
                onChange={(e) => handleChange('from_account_id', parseInt(e.target.value))}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.from_account_id ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              >
                <option value={0}>Select Source Account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.shortform} - {account.account_name} (₹{account.balance.toFixed(2)})
                  </option>
                ))}
              </select>
              {errors.from_account_id && <p className="mt-1 text-sm text-red-500">{errors.from_account_id}</p>}
            </div>

            <div>
              <label htmlFor="to_account_id" className="block text-sm font-medium text-gray-700 mb-2">
                To Account <span className="text-red-500">*</span>
              </label>
              <select
                id="to_account_id"
                value={formData.to_account_id}
                onChange={(e) => handleChange('to_account_id', parseInt(e.target.value))}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.to_account_id ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              >
                <option value={0}>Select Destination Account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.shortform} - {account.account_name} (₹{account.balance.toFixed(2)})
                  </option>
                ))}
              </select>
              {errors.to_account_id && <p className="mt-1 text-sm text-red-500">{errors.to_account_id}</p>}
            </div>
          </>
        )}

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="amount"
            value={formData.amount}
            onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.amount ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0.00"
            step="0.01"
            min="0"
            disabled={isLoading}
          />
          {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
        </div>

        {/* Cheque Number - Only for Cheque transactions */}
        {transactionType === TransactionType.CHEQUE && (
          <div>
            <label htmlFor="cheque_number" className="block text-sm font-medium text-gray-700 mb-2">
              Cheque Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="cheque_number"
              value={formData.cheque_number}
              onChange={(e) => handleChange('cheque_number', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.cheque_number ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., CHQ123456"
              disabled={isLoading}
            />
            {errors.cheque_number && <p className="mt-1 text-sm text-red-500">{errors.cheque_number}</p>}
          </div>
        )}

        {/* Reference */}
        <div>
          <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-2">
            Reference
          </label>
          <input
            type="text"
            id="reference"
            value={formData.reference}
            onChange={(e) => handleChange('reference', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Transaction reference"
            disabled={isLoading}
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add transaction notes..."
            rows={3}
            disabled={isLoading}
          />
        </div>
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
          {isLoading ? 'Processing...' : 'Submit Transaction'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;

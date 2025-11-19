import React, { useState, useEffect } from 'react';
import { PersonalEntry, PersonalEntryFormData } from '../types/personal';

interface PersonalFinanceFormProps {
  onSubmit: (data: PersonalEntryFormData) => Promise<void>;
  editEntry?: PersonalEntry | null;
  onCancel?: () => void;
}

const PersonalFinanceForm: React.FC<PersonalFinanceFormProps> = ({
  onSubmit,
  editEntry,
  onCancel
}) => {
  const [formData, setFormData] = useState<PersonalEntryFormData>({
    paytype: 'incoming',
    amount: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when editing
  useEffect(() => {
    if (editEntry) {
      setFormData({
        paytype: editEntry.paytype,
        amount: editEntry.amount.toString(),
        description: editEntry.description
      });
    } else {
      setFormData({
        paytype: 'incoming',
        amount: '',
        description: ''
      });
    }
  }, [editEntry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate amount
    const amount = parseFloat(formData.amount.toString());
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    // Validate description
    if (!formData.description.trim()) {
      setError('Please enter a description');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        amount: amount
      });
      
      // Reset form after successful submission (only if not editing)
      if (!editEntry) {
        setFormData({
          paytype: 'incoming',
          amount: '',
          description: ''
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      paytype: 'incoming',
      amount: '',
      description: ''
    });
    setError(null);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {editEntry ? 'Edit Entry' : 'Add New Entry'}
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Payment Type */}
        <div>
          <label htmlFor="paytype" className="block text-sm font-medium text-gray-700 mb-1">
            Transaction Type <span className="text-red-500">*</span>
          </label>
          <select
            id="paytype"
            value={formData.paytype}
            onChange={(e) =>
              setFormData({ ...formData, paytype: e.target.value as 'incoming' | 'outgoing' })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="incoming">↑ Incoming (Income)</option>
            <option value="outgoing">↓ Outgoing (Expense)</option>
          </select>
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">₹</span>
            <input
              type="number"
              id="amount"
              step="0.01"
              min="0.01"
              value={formData.amount === '' || formData.amount === 0 ? '' : formData.amount}
              onChange={(e) => {
                const value = e.target.value;
                // Allow only numbers with up to 2 decimals (e.g., 123, 123.4, 123.45)
                const allowed = /^(\d+(\.\d{0,2})?)?$/;
                if (value === '') {
                  setFormData({ ...formData, amount: '' });
                } else if (allowed.test(value)) {
                  setFormData({ ...formData, amount: value });
                }
              }}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1000.00"
              required
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Enter amount (decimals allowed, e.g., 1500.50)</p>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter transaction description..."
          required
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        {editEntry && onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </span>
          ) : editEntry ? (
            'Update Entry'
          ) : (
            'Add Entry'
          )}
        </button>
      </div>
    </form>
  );
};

export default PersonalFinanceForm;

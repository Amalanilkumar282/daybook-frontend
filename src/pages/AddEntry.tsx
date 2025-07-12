import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DaybookFormData } from '../types/daybook';
import { daybookApi } from '../services/api';
import DaybookForm from '../components/DaybookForm';

const AddEntry: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (data: DaybookFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await daybookApi.createEntry(data);
      setSuccess(true);
      
      // Show success message briefly, then redirect
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error: any) {
      console.error('Error creating entry:', error);
      setError(error.response?.data?.message || 'Failed to create entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (success) {
    return (
      <div className="container-narrow py-responsive">
        <div className="bg-green-50 border border-green-200 rounded-md p-6 sm:p-8 text-center">
          <div className="flex justify-center mb-4">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-green-800 mb-2">Entry Added Successfully!</h2>
          <p className="text-green-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-narrow-classic">
      <div className="mb-6">
        <h1 className="text-classic-title font-bold text-tally-800">Add New Entry</h1>
        <p className="text-classic-body text-tally-600 mt-2">Create a new daybook entry with transaction details</p>
      </div>

      {error && (
        <div className="panel-classic bg-red-50 border-red-200 p-4 mb-6">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">⚠️</span>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        </div>
      )}

      <DaybookForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        mode="create"
      />
    </div>
  );
};

export default AddEntry;

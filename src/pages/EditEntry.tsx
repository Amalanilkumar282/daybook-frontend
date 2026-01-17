import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DaybookEntry, DaybookFormData, PayStatus, PayType } from '../types/daybook';
import { daybookApi, bankingApi } from '../services/api';
import DaybookForm from '../components/DaybookForm';

const EditEntry: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [entry, setEntry] = useState<DaybookEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEntry, setIsLoadingEntry] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEntry(id);
    } else {
      setError('Entry ID is required');
      setIsLoadingEntry(false);
    }
  }, [id]);

  const fetchEntry = async (entryId: string) => {
    try {
      setIsLoadingEntry(true);
      const entryData = await daybookApi.getEntry(entryId);
      setEntry(entryData);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching entry:', error);
      if (error.response?.status === 404) {
        setError('Entry not found');
      } else {
        setError('Failed to load entry. Please try again.');
      }
    } finally {
      setIsLoadingEntry(false);
    }
  };

  const handleSubmit = async (data: DaybookFormData) => {
    if (!id || !entry) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Check if pay_status changed from unpaid to paid
      const originalPayStatus = entry.pay_status || PayStatus.PAID;
      const isUnpaidToPaid = originalPayStatus === PayStatus.UNPAID && data.pay_status === PayStatus.PAID;
      
      console.log('=== EDIT ENTRY SUBMISSION ===');
      console.log('Original pay status:', originalPayStatus);
      console.log('New pay status:', data.pay_status);
      console.log('Status changed from unpaid to paid:', isUnpaidToPaid);
      console.log('Bank account ID:', data.bank_account_id);
      console.log('Affects bank balance:', data.affects_bank_balance);
      
      // Update the daybook entry
      await daybookApi.updateEntry(id, data);
      
      // If status changed from unpaid to paid AND bank transaction should be created
      if (isUnpaidToPaid && data.bank_account_id && data.affects_bank_balance) {
        console.log('=== CREATING BANK TRANSACTION FOR STATUS CHANGE ===');
        
        try {
          const description = data.description || `Daybook Entry #${id}`;
          const reference = `DAYBOOK-${id}`;
          const tenant = data.tenant;
          
          if (data.payment_type === PayType.INCOMING) {
            // Create deposit transaction
            await bankingApi.deposit({
              account_id: data.bank_account_id,
              amount: data.amount,
              description: description,
              reference: reference,
              tenant: tenant,
            });
            console.log('✅ Deposit transaction created successfully');
          } else {
            // Create withdrawal transaction
            await bankingApi.withdraw({
              account_id: data.bank_account_id,
              amount: data.amount,
              description: description,
              reference: reference,
              tenant: tenant,
            });
            console.log('✅ Withdrawal transaction created successfully');
          }
        } catch (bankError: any) {
          console.error('⚠️ Failed to create bank transaction:', bankError);
          setError('Entry updated but failed to create bank transaction. You may need to create it manually.');
          setIsLoading(false);
          return;
        }
      }
      
      setSuccess(true);
      
      // Show success message briefly, then redirect
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error: any) {
      console.error('Error updating entry:', error);
      setError(error.response?.data?.message || 'Failed to update entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (isLoadingEntry) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !entry) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-800 mb-2">Error Loading Entry</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-green-50 border border-green-200 rounded-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Entry Updated Successfully!</h2>
          <p className="text-green-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-dark-900">Edit Entry</h1>
        <p className="text-dark-600 mt-2">Update the daybook entry details</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {entry && (
        <DaybookForm
          initialData={entry}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          mode="edit"
        />
      )}
    </div>
  );
};

export default EditEntry;

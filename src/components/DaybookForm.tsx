import React, { useState, useEffect } from 'react';
import { DaybookFormData, DaybookEntry, PayType, PayStatus, ModeOfPay, Tenant, PaymentTypeSpecific } from '../types/daybook';
import { authUtils, nursesClientsApi, bankingApi } from '../services/api';
import AutocompleteSelect, { AutocompleteOption } from './AutocompleteSelect';
import { BankAccount } from '../types/banking';

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
    payment_type_specific: undefined,
    payment_description: '',
    nurse_id: '',
    client_id: '',
    bank_account_id: undefined,
    affects_bank_balance: true, // Default to true for bank account transactions
    custom_paid_date: '', // Custom payment date
  });

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Nurses and Clients state
  const [nurses, setNurses] = useState<AutocompleteOption[]>([]);
  const [clients, setClients] = useState<AutocompleteOption[]>([]);
  const [isLoadingNurses, setIsLoadingNurses] = useState(false);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [selectedNurseId, setSelectedNurseId] = useState<number | string>('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  
  // Bank Accounts state
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoadingBankAccounts, setIsLoadingBankAccounts] = useState(false);

  // Fetch nurses and clients on component mount
  useEffect(() => {
    const fetchNurses = async () => {
      setIsLoadingNurses(true);
      try {
        const nursesData = await nursesClientsApi.getNurses();
        const nursesOptions: AutocompleteOption[] = nursesData.map(nurse => ({
          id: nurse.nurse_id,
          label: nurse.full_name || `${nurse.first_name} ${nurse.last_name}`,
          sublabel: `Status: ${nurse.status} | ${nurse.service_type} | ${nurse.shift_pattern}`,
          searchableFields: {
            regNo: nurse.nurse_reg_no || '',
            prevRegNo: nurse.nurse_prev_reg_no || '',
            phone: nurse.phone_number || '',
            city: nurse.city || '',
            status: nurse.status || '',
          },
        }));
        setNurses(nursesOptions);
      } catch (error) {
        console.error('Error fetching nurses:', error);
      } finally {
        setIsLoadingNurses(false);
      }
    };

    const fetchClients = async () => {
      setIsLoadingClients(true);
      try {
        const clientsData = await nursesClientsApi.getClients();
        const clientsOptions: AutocompleteOption[] = clientsData.map(client => {
          const patientName = client.patient_name?.trim();
          const requestorName = client.requestor_name?.trim();
          
          let displayName: string;
          // If no patient name, use requestor name
          if (!patientName) {
            displayName = requestorName || 'Unknown';
          }
          // If no requestor name, use patient name
          else if (!requestorName) {
            displayName = patientName;
          }
          // If both names are the same, show only once
          else if (patientName.toLowerCase() === requestorName.toLowerCase()) {
            displayName = patientName;
          }
          // If both names are different, show both
          else {
            displayName = `${patientName} (${requestorName})`;
          }
          
          return {
            id: client.client_id,
            label: displayName,
            sublabel: `Service: ${client.service_required} | Gender: ${client.preferred_caregiver_gender || 'N/A'}`,
            searchableFields: {
              regNo: client.client_id || '',
              phone: client.requestor_phone || client.patient_phone || '',
              city: client.patient_city || client.requestor_city || '',
              district: client.patient_district || client.requestor_district || '',
            },
          };
        });
        setClients(clientsOptions);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setIsLoadingClients(false);
      }
    };

    const fetchBankAccounts = async () => {
      setIsLoadingBankAccounts(true);
      try {
        const accountsData = await bankingApi.getAllAccounts();
        setBankAccounts(accountsData);
      } catch (error) {
        console.error('Error fetching bank accounts:', error);
      } finally {
        setIsLoadingBankAccounts(false);
      }
    };

    fetchNurses();
    fetchClients();
    fetchBankAccounts();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: initialData.amount,
        payment_type: initialData.payment_type,
        pay_status: initialData.pay_status || PayStatus.PAID,
        mode_of_pay: initialData.mode_of_pay || ModeOfPay.CASH,
        tenant: initialData.tenant,
        description: initialData.description || '',
        payment_type_specific: initialData.payment_type_specific || undefined,
        payment_description: initialData.payment_description || '',
        nurse_id: initialData.nurse_id || '',
        client_id: initialData.client_id || '',
        bank_account_id: initialData.bank_account_id || undefined,
        affects_bank_balance: initialData.affects_bank_balance ?? true,
        custom_paid_date: initialData.custom_paid_date ? initialData.custom_paid_date.split('T')[0] : '',
      });
      
      // Set selected IDs for autocomplete
      if (initialData.nurse_id) {
        setSelectedNurseId(initialData.nurse_id);
      }
      if (initialData.client_id) {
        setSelectedClientId(initialData.client_id);
      }
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
    
    // Validate bank account selection when mode is account_transfer
    if (formData.mode_of_pay === ModeOfPay.ACCOUNT_TRANSFER && !formData.bank_account_id) {
      newErrors.bank_account_id = 'Bank account is required for account transfer';
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
        payment_type_specific: formData.payment_type_specific || undefined,
        payment_description: formData.payment_description || undefined,
        receipt: receiptFile || undefined,
        bank_account_id: formData.bank_account_id || undefined,
        affects_bank_balance: formData.affects_bank_balance,
        custom_paid_date: formData.custom_paid_date || undefined,
      };

      // Add nurse_id if payment is outgoing and a nurse is selected
      if (formData.payment_type === PayType.OUTGOING && selectedNurseId) {
        submitData.nurse_id = selectedNurseId.toString();
      }

      // Add client_id if payment is incoming and a client is selected
      if (formData.payment_type === PayType.INCOMING && selectedClientId) {
        submitData.client_id = selectedClientId;
      }

      console.log('Tenant in submitData:', submitData.tenant);
      console.log('Full submitData:', {
        ...submitData,
        receipt: submitData.receipt ? 'FILE PRESENT' : undefined
      });
      console.log('=== BANK ACCOUNT INTEGRATION ===');
      console.log('Bank Account ID:', submitData.bank_account_id);
      console.log('Affects Bank Balance:', submitData.affects_bank_balance);
      console.log('Mode of Pay:', submitData.mode_of_pay);
      if (submitData.bank_account_id && submitData.affects_bank_balance) {
        console.log('✅ This entry SHOULD create a bank transaction and update account balance');
        console.log(`   Transaction type: ${submitData.payment_type === PayType.INCOMING ? 'DEPOSIT' : 'WITHDRAW'}`);
        console.log(`   Amount: ₹${submitData.amount}`);
      }

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
      payment_type_specific: undefined,
      payment_description: '',
      nurse_id: '',
      client_id: '',
      bank_account_id: undefined,
      affects_bank_balance: true,
      custom_paid_date: '',
    });
    setReceiptFile(null);
    setErrors({});
    setSelectedNurseId('');
    setSelectedClientId('');
  };

  const handleInputChange = (field: keyof DaybookFormData, value: DaybookFormData[keyof DaybookFormData]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value as any,
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
                value={formData.amount === 0 ? '' : formData.amount}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow only numbers with up to 2 decimals (e.g., 123, 123.4, 123.45)
                  const allowed = /^(\d+(\.\d{0,2})?)?$/;
                  if (value === '') {
                    handleInputChange('amount', 0);
                  } else if (allowed.test(value)) {
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue) && numValue >= 0) {
                      handleInputChange('amount', numValue);
                    }
                  }
                }}
                placeholder="1000.00"
                className={`w-full pl-8 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
            <p className="mt-1 text-xs text-gray-500">Enter amount (decimals allowed, e.g., 1500.50)</p>
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
              <option value={ModeOfPay.OTHERS}>Others</option>
              <option value={ModeOfPay.ACCOUNT_TRANSFER}>Account Transfer</option>
            </select>
            {errors.mode_of_pay && <p className="mt-1 text-sm text-red-600">{errors.mode_of_pay}</p>}
          </div>
        </div>

        {/* Payment Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          <div>
            <label htmlFor="custom_paid_date" className="block text-sm font-medium text-dark-700 mb-2">
              Payment Date
            </label>
            <input
              type="date"
              id="custom_paid_date"
              value={formData.custom_paid_date || ''}
              onChange={(e) => handleInputChange('custom_paid_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty to use current date. Use this to backdate or future-date entries.
            </p>
          </div>
        </div>

        {/* Bank Account Selection - Always show for all payment modes */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label htmlFor="bank_account_id" className="block text-sm font-medium text-dark-700 mb-2">
                Bank Account {formData.mode_of_pay === ModeOfPay.ACCOUNT_TRANSFER && <span className="text-red-500">*</span>}
              </label>
              <select
                id="bank_account_id"
                value={formData.bank_account_id || ''}
                onChange={(e) => handleInputChange('bank_account_id', e.target.value ? Number(e.target.value) : undefined)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.bank_account_id ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoadingBankAccounts}
              >
                <option value="">Select Bank Account</option>
                {bankAccounts.map(account => {
                  const balance = account.current_balance ?? account.balance ?? 0;
                  return (
                    <option key={account.id} value={account.id}>
                      {account.account_name} - {account.account_number} (₹{balance.toFixed(2)})
                    </option>
                  );
                })}
              </select>
              {errors.bank_account_id && <p className="mt-1 text-sm text-red-600">{errors.bank_account_id}</p>}
              {isLoadingBankAccounts && <p className="mt-1 text-xs text-gray-500">Loading accounts...</p>}
            </div>
            
            <div>
              <label htmlFor="affects_bank_balance" className="block text-sm font-medium text-dark-700 mb-2">
                Update Bank Balance
              </label>
              <div className="flex items-center h-10">
                <input
                  type="checkbox"
                  id="affects_bank_balance"
                  checked={formData.affects_bank_balance ?? true}
                  onChange={(e) => handleInputChange('affects_bank_balance', e.target.checked)}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                />
                <label htmlFor="affects_bank_balance" className="ml-2 text-sm text-gray-700">
                  Automatically update account balance
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                When enabled, this entry will create a corresponding bank transaction
              </p>
            </div>
          </div>
          
          {/* Visual Preview */}
          {formData.bank_account_id && formData.affects_bank_balance && formData.amount > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Bank Transaction Preview</p>
                  <p className="text-xs text-green-700 mt-1">
                    {formData.payment_type === PayType.INCOMING ? (
                      <>✓ Will create a <strong>DEPOSIT</strong> transaction of ₹{formData.amount.toFixed(2)}</>
                    ) : (
                      <>✓ Will create a <strong>WITHDRAWAL</strong> transaction of ₹{formData.amount.toFixed(2)}</>
                    )}
                  </p>
                  <p className="text-xs text-green-700">
                    {formData.payment_type === PayType.INCOMING ? (
                      <>✓ Account balance will <strong>increase</strong> by ₹{formData.amount.toFixed(2)}</>
                    ) : (
                      <>✓ Account balance will <strong>decrease</strong> by ₹{formData.amount.toFixed(2)}</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {/* Payment Type Specific */}
          <div>
            <label htmlFor="payment_type_specific" className="block text-sm font-medium text-dark-700 mb-2">
              Payment Category
            </label>
            <select
              id="payment_type_specific"
              value={formData.payment_type_specific || ''}
              onChange={(e) => handleInputChange('payment_type_specific', e.target.value as PaymentTypeSpecific)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select Category (Optional)</option>
              <option value={PaymentTypeSpecific.CLIENT_PAYMENT_RECEIVED}>Client Payment Received</option>
              <option value={PaymentTypeSpecific.NURSE_SALARY_PAID}>Nurse Salary Paid</option>
              <option value={PaymentTypeSpecific.OFFICE_EXPENSES_PAID}>Office Expenses Paid</option>
              <option value={PaymentTypeSpecific.STUDENT_FEE_RECEIVED}>Student Fee Received</option>
              <option value={PaymentTypeSpecific.COMMISSION}>Commission</option>
            </select>
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
        </div>

        {/* Payment Description */}
        <div>
          <label htmlFor="payment_description" className="block text-sm font-medium text-dark-700 mb-2">
            Payment Description
          </label>
          <textarea
            id="payment_description"
            rows={2}
            value={formData.payment_description || ''}
            onChange={(e) => handleInputChange('payment_description', e.target.value)}
            placeholder="Detailed payment description (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <p className="mt-1 text-xs text-gray-500">Provide additional context about this payment</p>
        </div>

        {/* Tenant - show only for admin when not already shown */}
        {isAdmin && (
          <div className="sm:hidden">
            <label htmlFor="tenant_mobile" className="block text-sm font-medium text-dark-700 mb-2">
              Tenant *
            </label>
            <select
              id="tenant_mobile"
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

        {/* Conditional ID fields based on payment type and category */}
        {formData.payment_type === PayType.INCOMING && formData.payment_type_specific === PaymentTypeSpecific.CLIENT_PAYMENT_RECEIVED && (
          <AutocompleteSelect
            options={clients}
            value={selectedClientId}
            onChange={(value) => {
              setSelectedClientId(value as string);
              setFormData(prev => ({ ...prev, client_id: value as string }));
            }}
            label="Select Client"
            placeholder="Search by name, ID, phone, or location..."
            error={errors.client_id}
            isLoading={isLoadingClients}
            maxVisibleOptions={8}
            enableSearchFilters={true}
            searchFilterLabel="Filter by"
          />
        )}
        
        {formData.payment_type === PayType.OUTGOING && formData.payment_type_specific === PaymentTypeSpecific.NURSE_SALARY_PAID && (
          <AutocompleteSelect
            options={nurses}
            value={selectedNurseId}
            onChange={(value) => {
              setSelectedNurseId(value);
              setFormData(prev => ({ ...prev, nurse_id: value.toString() }));
            }}
            label="Select Nurse"
            placeholder="Search by name, reg no (current/previous), phone..."
            error={errors.nurse_id}
            isLoading={isLoadingNurses}
            maxVisibleOptions={8}
            enableSearchFilters={true}
            searchFilterLabel="Filter by"
          />
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

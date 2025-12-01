import React, { useState } from 'react';
import { authApi, authUtils } from '../services/api';
import { UserRole, Tenant, User } from '../types/daybook';

interface UserFormData {
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  tenant: Tenant;
}

const UserManagement: React.FC = () => {
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    role: UserRole.ACCOUNTANT,
    tenant: Tenant.TATA_NURSING,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const user = authUtils.getUser();
  const isAdmin = user?.role === 'admin';

  // Redirect if not admin
  React.useEffect(() => {
    if (!isAdmin) {
      window.location.href = '/';
    }
  }, [isAdmin]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages on input change
    setError(null);
    setSuccess(null);
  };

  const validateForm = (): string | null => {
    if (!formData.email || !formData.email.includes('@')) {
      return 'Please enter a valid email address';
    }
    if (!formData.password || formData.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }
    if (!formData.role) {
      return 'Please select a role';
    }
    if (!formData.tenant) {
      return 'Please select a tenant';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authApi.registerUser({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
        tenant: formData.tenant,
      });

      setSuccess(`User created successfully: ${response.user.email}`);
      // Reset form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        role: UserRole.ACCOUNTANT,
        tenant: Tenant.TATA_NURSING,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      role: UserRole.ACCOUNTANT,
      tenant: Tenant.TATA_NURSING,
    });
    setError(null);
    setSuccess(null);
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen py-6 xs:py-8 sm:py-12">
      <div className="container-narrow">
        <div className="mb-6 xs:mb-8">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold font-display gradient-text mb-2">
            User Management
          </h1>
          <p className="text-neutral-600 text-sm xs:text-base">
            Create new users and assign roles and tenants
          </p>
        </div>

        <div className="glass-card">
          <div className="p-6 xs:p-8 sm:p-10">
            <h2 className="text-xl xs:text-2xl font-bold text-neutral-800 mb-6">
              Create New User
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-300 text-sm"
                  placeholder="user@example.com"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-neutral-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-300 text-sm"
                  placeholder="Minimum 6 characters"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-neutral-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-300 text-sm"
                  placeholder="Re-enter password"
                />
              </div>

              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-neutral-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-300 text-sm"
                >
                  <option value={UserRole.ACCOUNTANT}>Accountant</option>
                  <option value={UserRole.STAFF}>Staff</option>
                  <option value={UserRole.ADMIN}>Admin</option>
                </select>
                <p className="mt-2 text-xs text-neutral-500">
                  Accountants and Staff have limited permissions compared to Admins
                </p>
              </div>

              {/* Tenant */}
              <div>
                <label htmlFor="tenant" className="block text-sm font-semibold text-neutral-700 mb-2">
                  Tenant <span className="text-red-500">*</span>
                </label>
                <select
                  id="tenant"
                  name="tenant"
                  value={formData.tenant}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-300 text-sm"
                >
                  <option value={Tenant.TATA_NURSING}>TATA Nursing</option>
                  <option value={Tenant.DEARCARE}>Dearcare</option>
                  <option value={Tenant.DEARCARE_ACADEMY}>Dearcare Academy</option>
                  <option value={Tenant.PERSONAL}>Personal</option>
                </select>
                <p className="mt-2 text-xs text-neutral-500">
                  Users can only access data from their assigned tenant (except admins)
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col xs:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-3 rounded-xl font-semibold shadow-glow hover:shadow-glow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-sm xs:text-base"
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating User...</span>
                    </span>
                  ) : (
                    'Create User'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-sm xs:text-base"
                >
                  Reset Form
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Information Card */}
        <div className="mt-6 glass-card p-6">
          <h3 className="text-lg font-bold text-neutral-800 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            User Roles & Permissions
          </h3>
          <div className="space-y-3 text-sm text-neutral-600">
            <div className="flex items-start space-x-2">
              <span className="font-semibold text-primary-600 min-w-[100px]">Admin:</span>
              <span>Full access to all tenants and administrative functions including user management</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-semibold text-primary-600 min-w-[100px]">Accountant:</span>
              <span>Can manage daybook entries, reports, and financial data for their assigned tenant</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-semibold text-primary-600 min-w-[100px]">Staff:</span>
              <span>Limited access to view and create basic entries for their assigned tenant</span>
            </div>
          </div>
          
          <h3 className="text-lg font-bold text-neutral-800 mb-3 mt-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Available Tenants
          </h3>
          <div className="space-y-2 text-sm text-neutral-600">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
              <span><strong>TATA Nursing:</strong> Main nursing services division</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-accent-500 rounded-full"></span>
              <span><strong>Dearcare:</strong> Healthcare services division</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span><strong>Dearcare Academy:</strong> Training and education division</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span><strong>Personal:</strong> Personal finance tracking for designated users</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, authUtils } from '../services/api';

const DebugAuth: React.FC = () => {
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  
  const currentUser = authUtils.getUser();
  const tokenPayload = authUtils.decodeToken();
  const token = authUtils.getToken();

  const handleRefreshAuth = async () => {
    setRefreshing(true);
    try {
      // Call /me endpoint to get fresh user data
      const freshUser = await authApi.me();
      console.log('Fresh user data:', freshUser);
      
      // Update localStorage with fresh user data
      if (token) {
        authUtils.setAuth(token, freshUser);
      }
      
      alert('Authentication refreshed! User data updated.');
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to refresh auth:', error);
      alert('Failed to refresh authentication: ' + error.message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    authUtils.clearAuth();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Authentication Debug Information
          </h1>

          {/* Current User Info */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Current User (from localStorage)
            </h2>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
              {JSON.stringify(currentUser, null, 2)}
            </pre>
          </div>

          {/* JWT Token Payload */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              JWT Token Payload
            </h2>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
              {JSON.stringify(tokenPayload, null, 2)}
            </pre>
          </div>

          {/* Token String */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Token String (first 50 chars)
            </h2>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm break-all">
              {token?.substring(0, 50)}...
            </pre>
          </div>

          {/* Tenant Analysis */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Tenant Analysis
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <div className="space-y-2">
                <p>
                  <strong>User Tenant:</strong>{' '}
                  <span className={currentUser?.tenant ? 'text-green-600' : 'text-red-600'}>
                    {currentUser?.tenant || 'NOT SET ❌'}
                  </span>
                </p>
                <p>
                  <strong>Token Tenant:</strong>{' '}
                  <span className={tokenPayload?.tenant || tokenPayload?.user_metadata?.tenant ? 'text-green-600' : 'text-red-600'}>
                    {tokenPayload?.tenant || tokenPayload?.user_metadata?.tenant || 'NOT SET ❌'}
                  </span>
                </p>
                <p>
                  <strong>User Role:</strong> {currentUser?.role || 'NOT SET'}
                </p>
                <p>
                  <strong>Token Role:</strong> {tokenPayload?.role || tokenPayload?.user_metadata?.role || 'NOT SET'}
                </p>
              </div>
            </div>
          </div>

          {/* Issue Detection */}
          {!currentUser?.tenant && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded p-4">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                ⚠️ Issue Detected
              </h3>
              <p className="text-red-700 mb-3">
                Your user account does not have a tenant assigned. This will cause RLS (Row Level Security) 
                policy violations when creating entries.
              </p>
              <p className="text-red-700 font-semibold">
                Possible causes:
              </p>
              <ul className="list-disc list-inside text-red-700 mb-3">
                <li>Account created before tenant field was added to backend</li>
                <li>Account created without specifying tenant</li>
                <li>Backend migration issue</li>
              </ul>
              <p className="text-red-700 font-semibold">
                Solutions:
              </p>
              <ul className="list-disc list-inside text-red-700">
                <li>Re-register with a new account (specify tenant)</li>
                <li>Contact backend admin to update your user metadata</li>
                <li>Try refreshing authentication data (button below)</li>
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleRefreshAuth}
              disabled={refreshing}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {refreshing ? 'Refreshing...' : 'Refresh Auth Data from Backend'}
            </button>
            
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Logout & Re-login
            </button>

            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to Dashboard
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded p-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              📝 Instructions
            </h3>
            <ol className="list-decimal list-inside text-yellow-700 space-y-1">
              <li>Check if your user has a tenant assigned above</li>
              <li>If tenant is "NOT SET", this is causing your RLS errors</li>
              <li>Try clicking "Refresh Auth Data" to fetch latest user info from backend</li>
              <li>If that doesn't work, logout and register a new account with tenant specified</li>
              <li>Take a screenshot of this page to share with backend developers if issue persists</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugAuth;

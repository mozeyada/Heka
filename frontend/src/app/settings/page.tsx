'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { usersAPI } from '@/lib/api';
import { LoadingPage } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const handleExportData = async () => {
    try {
      setExporting(true);
      setError(null);
      const data = await usersAPI.exportData();
      
      // Create downloadable JSON file
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `heka-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSuccess('Your data has been exported successfully');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      setError('Please type DELETE to confirm account deletion');
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      await usersAPI.deleteAccount('DELETE');
      
      // Logout and redirect
      logout();
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete account');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-blue-600">Heka</h1>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your account and privacy</p>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorAlert message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Account Information */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium text-gray-900">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium text-gray-900">{user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Member since:</span>
              <span className="font-medium text-gray-900">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Data Export */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Export Your Data</h2>
          <p className="text-sm text-gray-600 mb-4">
            Download all your data in JSON format. This includes your profile, arguments, perspectives, 
            check-ins, goals, and subscription information.
          </p>
          <button
            onClick={handleExportData}
            disabled={exporting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
          >
            {exporting ? 'Exporting...' : 'Export My Data'}
          </button>
        </div>

        {/* Account Deletion */}
        <div className="bg-white shadow rounded-lg p-6 mb-6 border-2 border-red-200">
          <h2 className="text-lg sm:text-xl font-semibold text-red-900 mb-3">Delete Account</h2>
          <p className="text-sm text-gray-600 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
            Financial records may be retained for 7 years for legal compliance.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm sm:text-base"
            >
              Delete Account
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-semibold mb-2">Warning: This action cannot be undone</p>
                <p className="text-sm text-red-700 mb-4">
                  Type <strong>DELETE</strong> in the box below to confirm:
                </p>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteConfirmation !== 'DELETE'}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm sm:text-base"
                >
                  {deleting ? 'Deleting...' : 'Confirm Deletion'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmation('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Legal Documents */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Legal Documents</h2>
          <div className="space-y-2">
            <a
              href="/legal/terms"
              target="_blank"
              className="block text-blue-600 hover:text-blue-800 hover:underline"
            >
              Terms of Service
            </a>
            <a
              href="/legal/privacy"
              target="_blank"
              className="block text-blue-600 hover:text-blue-800 hover:underline"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}



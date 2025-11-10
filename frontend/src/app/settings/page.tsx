'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { usersAPI } from '@/lib/api';
import { LoadingPage } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';
import { PageHeading } from '@/components/PageHeading';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  if (!user) {
    return <LoadingPage />;
  }

  const handleExportData = async () => {
    try {
      setExporting(true);
      setError(null);
      const data = await usersAPI.exportData();

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

      logout();
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete account');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="bg-neutral-25 pb-20">
      <PageHeading
        title="Settings"
        description="Manage your account details, export your data, or delete your Heka profile."
        actions={
          <Link
            href="/dashboard"
            className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-600 transition-colors ease-soft-spring hover:border-neutral-300 hover:text-neutral-900"
          >
            Back to Dashboard
          </Link>
        }
      />

      <div className="app-container space-y-8">
        {error && (
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
        )}

        {success && (
          <div className="section-shell border border-success-100 bg-success-50/80 p-5">
            <p className="text-sm font-semibold text-success-600">{success}</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="section-shell p-6">
            <h2 className="text-lg font-semibold text-neutral-900">Account Overview</h2>
            <p className="mt-2 text-sm text-neutral-500">
              Joined {new Date(user.created_at).toLocaleDateString()} • {user.email}
            </p>
            <div className="mt-6 space-y-4 text-sm text-neutral-500">
              <div>
                <span className="font-semibold text-neutral-700">Legal Acceptance</span>
                <p className="mt-1">
                  Terms accepted on {user.terms_accepted_at ? new Date(user.terms_accepted_at).toLocaleDateString() : 'N/A'}
                </p>
                <p>
                  Privacy accepted on {user.privacy_accepted_at ? new Date(user.privacy_accepted_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <span className="font-semibold text-neutral-700">Need support?</span>
                <p className="mt-1">
                  Email <a className="font-semibold text-brand-600" href="mailto:hello@heka.app">hello@heka.app</a>
                </p>
              </div>
            </div>
          </div>

          <div className="section-shell p-6">
            <h2 className="text-lg font-semibold text-neutral-900">Export Your Data</h2>
            <p className="mt-2 text-sm text-neutral-500">
              Download a complete copy of your arguments, perspectives, and insights in JSON format.
            </p>
            <button
              onClick={handleExportData}
              disabled={exporting}
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition-transform ease-soft-spring hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              {exporting ? 'Preparing export…' : 'Export Data'}
            </button>
          </div>
        </div>

        <div className="section-shell border border-danger-100 bg-danger-50/70 p-6">
          <h2 className="text-lg font-semibold text-danger-600">Danger Zone</h2>
          <p className="mt-2 text-sm text-danger-600">
            Permanently delete your account, couple profile, and all stored insights. This action cannot be undone.
          </p>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="mt-6 inline-flex rounded-xl border border-danger-200 px-4 py-2 text-sm font-semibold text-danger-600 transition-colors ease-soft-spring hover:border-danger-300 hover:text-danger-700"
          >
            Delete Account
          </button>

          {showDeleteConfirm && (
            <div className="mt-6 rounded-2xl border border-white/40 bg-white/80 p-5">
              <p className="text-sm text-neutral-600">
                Type <span className="font-semibold text-neutral-900">DELETE</span> to confirm.
              </p>
              <input
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                placeholder="DELETE"
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="rounded-xl bg-danger-500 px-4 py-2 text-sm font-semibold text-white transition-transform ease-soft-spring hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-danger-300"
                >
                  {deleting ? 'Deleting…' : 'Confirm Deletion'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmation('');
                  }}
                  className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-600 transition-colors ease-soft-spring hover:border-neutral-300 hover:text-neutral-900"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



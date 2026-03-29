'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  Mail,
  ShieldCheck,
  TriangleAlert,
  UserRound,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { usersAPI } from '@/lib/api';
import { LoadingPage } from '@/components/LoadingSpinner';
import { ErrorAlert, SuccessAlert } from '@/components/ErrorAlert';
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

      setSuccess('Your data export is ready and has started downloading.');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      setError('Type DELETE exactly to confirm permanent account deletion.');
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
    <div className="min-h-screen pb-28 text-zinc-300">
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute left-[-12%] top-[12%] h-[40vh] w-[40vh] rounded-full bg-teal-900/18 blur-[135px]" />
        <div className="absolute right-[-10%] top-[22%] h-[45vh] w-[45vh] rounded-full bg-indigo-900/16 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[25%] h-[34vh] w-[34vh] rounded-full bg-rose-900/8 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <PageHeading
        title="Settings"
        description="Manage your Heka profile, privacy controls, and account data from one place."
        actions={
          <Link href="/dashboard" className="btn-secondary inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        }
      />

      <div className="app-container space-y-8">
        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
        {success && <SuccessAlert message={success} onDismiss={() => setSuccess(null)} />}

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="section-shell p-7 md:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white">
                <UserRound className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Account overview</p>
                <h2 className="mt-2 text-2xl font-medium tracking-tight text-white">{user.name}</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Joined {new Date(user.created_at).toLocaleDateString()} and currently using {user.email}.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.6rem] border border-white/10 bg-black/25 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Legal acceptance</p>
                <div className="mt-4 space-y-3 text-sm text-zinc-300">
                  <p>
                    <span className="font-semibold text-white">Terms:</span>{' '}
                    {user.terms_accepted_at ? new Date(user.terms_accepted_at).toLocaleDateString() : 'Not recorded'}
                  </p>
                  <p>
                    <span className="font-semibold text-white">Privacy:</span>{' '}
                    {user.privacy_accepted_at ? new Date(user.privacy_accepted_at).toLocaleDateString() : 'Not recorded'}
                  </p>
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-white/10 bg-black/25 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Support</p>
                <div className="mt-4 flex items-center gap-3 text-sm text-zinc-300">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10 text-teal-300">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Need help?</p>
                    <a className="text-teal-300 transition-colors hover:text-teal-200" href="mailto:hello@heka.app">
                      hello@heka.app
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="section-shell p-7 md:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Data portability</p>
                <h2 className="mt-2 text-2xl font-medium tracking-tight text-white">Export your relationship data</h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  Download your arguments, perspectives, and AI insights as JSON so your account remains portable and transparent.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-[1.6rem] border border-white/10 bg-black/25 p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                <p className="text-sm text-zinc-300">Your export is generated client-side after retrieval from the API.</p>
              </div>
            </div>

            <button
              onClick={handleExportData}
              disabled={exporting}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {exporting ? 'Preparing export…' : 'Export Data'}
            </button>
          </div>
        </div>

        <div className="section-shell border border-red-500/20 bg-red-500/[0.06] p-7 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-red-200">
                <TriangleAlert className="h-3.5 w-3.5" />
                Danger zone
              </div>
              <h2 className="mt-5 text-2xl font-medium tracking-tight text-white">Permanently delete your account</h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300/85">
                This removes your account, couple profile, and stored insights. It is irreversible and should stay visually distinct from every other action on this page.
              </p>
            </div>

            {!showDeleteConfirm && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-[0_0_24px_rgba(220,38,38,0.25)] transition-all hover:-translate-y-0.5 hover:bg-red-500"
              >
                Delete Account
              </button>
            )}
          </div>

          {showDeleteConfirm && (
            <div className="mt-8 rounded-[1.6rem] border border-white/10 bg-black/30 p-6">
              <p className="text-sm text-zinc-300">
                Type <span className="font-semibold text-white">DELETE</span> to confirm permanent account deletion.
              </p>
              <input
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="input-field mt-4"
                placeholder="DELETE"
              />
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting ? 'Deleting…' : 'Confirm Deletion'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmation('');
                  }}
                  className="btn-secondary"
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

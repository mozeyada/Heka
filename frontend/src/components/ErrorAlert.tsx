'use client';

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorAlert({ message, onRetry, onDismiss, className = '' }: ErrorAlertProps) {
  return (
    <div className={`rounded-2xl border border-red-500/20 bg-red-500/10 p-5 backdrop-blur-xl ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-100">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-xs font-semibold text-red-200 underline transition-colors hover:text-white"
            >
              Try again
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="inline-flex flex-shrink-0 text-red-300 transition-colors hover:text-white"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

interface SuccessAlertProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function SuccessAlert({ message, onDismiss, className = '' }: SuccessAlertProps) {
  return (
    <div className={`rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 backdrop-blur-xl ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-emerald-100">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="inline-flex flex-shrink-0 text-emerald-300 transition-colors hover:text-white"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

interface WarningAlertProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function WarningAlert({ message, actionLabel, onAction, onDismiss, className = '' }: WarningAlertProps) {
  return (
    <div className={`rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 backdrop-blur-xl ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-amber-300" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-50">{message}</p>
          {onAction && actionLabel && (
            <button
              onClick={onAction}
              className="mt-3 text-xs font-semibold text-amber-200 underline transition-colors hover:text-white"
            >
              {actionLabel}
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="inline-flex flex-shrink-0 text-amber-300 transition-colors hover:text-white"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

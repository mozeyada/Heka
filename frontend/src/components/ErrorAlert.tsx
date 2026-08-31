'use client';

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Maps technical error messages to warm, human-readable equivalents.
 * Users in emotional situations need reassurance, not technical alarms.
 */
function humanizeError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('network') || m.includes('fetch') || m.includes('offline') || m.includes('failed to fetch')) {
    return "It looks like you're offline right now. Come back when you're connected — everything will be waiting for you.";
  }
  if (m.includes('500') || m.includes('server') || m.includes('internal')) {
    return "We're having a moment on our end. Your data is safe — please try again in a few seconds.";
  }
  if (m.includes('rate limit') || m.includes('too many') || m.includes('429')) {
    return "You've been busy — give it a moment and try again. We'll be right here.";
  }
  if (m.includes('unauthorized') || m.includes('401') || m.includes('token')) {
    return "Your session expired. Log in again and you'll pick up right where you left off.";
  }
  if (m.includes('not found') || m.includes('404')) {
    return "We couldn't find what you were looking for. It may have been moved or removed.";
  }
  if (m.includes('load') || m.includes('failed to load')) {
    return "We're having trouble loading this right now. Your data is safe — try again in a moment.";
  }
  if (m.includes('save') || m.includes('create') || m.includes('submit')) {
    return "We couldn't save that just now. Don't worry, your words are still here — tap to try again.";
  }
  if (m.includes('limit') || m.includes('quota')) {
    return "You've reached your plan limit for this feature. Upgrade to keep going.";
  }
  return message;
}

export function ErrorAlert({ message, onRetry, onDismiss, className = '' }: ErrorAlertProps) {
  const humanMessage = humanizeError(message);

  return (
    <div className={`rounded-2xl border border-red-500/20 bg-red-500/[0.07] p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0 text-red-400">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm text-red-200 leading-relaxed">{humanMessage}</p>
          {onRetry && (
            <button onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/25 hover:text-white">
              Try again
            </button>
          )}
        </div>
        {onDismiss && (
          <button onClick={onDismiss}
            className="flex-shrink-0 text-red-400 transition hover:text-white"
            aria-label="Dismiss">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
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
    <div className={`rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0 text-emerald-400">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-emerald-100">{message}</p>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="flex-shrink-0 text-emerald-300 transition hover:text-white" aria-label="Dismiss">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
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
    <div className={`rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0 text-amber-300">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-50">{message}</p>
          {onAction && actionLabel && (
            <button onClick={onAction}
              className="mt-3 text-xs font-semibold text-amber-200 underline transition hover:text-white">
              {actionLabel}
            </button>
          )}
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="flex-shrink-0 text-amber-300 transition hover:text-white" aria-label="Dismiss">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

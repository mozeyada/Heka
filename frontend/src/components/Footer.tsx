'use client';

import Link from 'next/link';

const footerLinks = {
  product: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Subscription', href: '/subscription' },
    { label: 'Settings', href: '/settings' },
  ],
  company: [
    { label: 'Privacy Policy', href: '/legal/privacy' },
    { label: 'Terms of Service', href: '/legal/terms' },
  ],
};

export function Footer() {
  return (
    <footer className="mt-auto bg-neutral-900 text-neutral-200">
      <div className="app-container grid gap-10 py-14 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-brand-gradient shadow-elevated" />
            <span className="font-display text-xl font-semibold tracking-tight text-white">Heka</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-neutral-400">
            AI-powered mediation that helps couples resolve conflicts with empathy, clarity, and actionable guidance.
          </p>
          <p className="mt-6 text-xs text-neutral-500">
            Heka is not a substitute for professional therapy or crisis intervention. If you are in immediate danger, please contact emergency services.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-neutral-300">Product</h4>
          <ul className="mt-4 space-y-3 text-sm text-neutral-400">
            {footerLinks.product.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors ease-soft-spring hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-neutral-300">Company</h4>
          <ul className="mt-4 space-y-3 text-sm text-neutral-400">
            {footerLinks.company.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors ease-soft-spring hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-neutral-300">Stay in Touch</h4>
          <p className="mt-4 text-sm text-neutral-400">
            Questions or feedback? Email us at{' '}
            <a
              className="font-semibold text-neutral-200 underline-offset-4 transition-colors ease-soft-spring hover:text-white hover:underline"
              href="mailto:hello@heka.app"
            >
              hello@heka.app
            </a>
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="app-container flex flex-col gap-3 py-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Heka. All rights reserved.</p>
          <p>Crafted with care to help couples communicate better.</p>
        </div>
      </div>
    </footer>
  );
}



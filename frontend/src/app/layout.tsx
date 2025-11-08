import type { Metadata } from 'next';
import './globals.css';
import { AuthInitializer } from '@/components/AuthInitializer';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Heka - AI-Powered Couple Argument Resolution',
  description: 'Resolve arguments and build a stronger relationship with AI mediation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col min-h-screen">
        <AuthInitializer />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}


import { Metadata } from 'next';
import { SiteHeader } from '@/components/design-system/SiteHeader';

export const metadata: Metadata = {
  title: 'Authentication | FragranceDNA',
  description: 'Sign in or create your FragranceDNA account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-warm-900" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-warm/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gold/3 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Header with navigation - wrapped in client component */}
      <HeaderWrapper />

      {/* Main content wrapper */}
      <div className="relative flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xs">
          {children}
        </div>
      </div>
    </div>
  );
}

function HeaderWrapper() {
  // This is a simple server component wrapper for the client SiteHeader
  // Since SiteHeader is marked as 'use client', we can render it here
  return <SiteHeader />;
}

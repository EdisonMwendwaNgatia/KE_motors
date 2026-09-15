import React from 'react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { ToastProvider } from '@/lib/toastContext';
import { ToastContainer } from '@/components/ui/Toast';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-red-500 selection:text-white">
        <PublicHeader />
        <main className="flex-1 w-full">{children}</main>
        <PublicFooter />
        <ToastContainer />
      </div>
    </ToastProvider>
  );
}

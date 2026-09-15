import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient';
import { ToastProvider } from '@/lib/toastContext';
import { ToastContainer } from '@/components/ui/Toast';

export const metadata = {
  title: 'KE Motors — Admin Dashboard',
  description: 'Automotive Dealership Management System',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole = 'admin';
  if (user) {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data?.role) {
      userRole = data.role;
    }
  }

  return (
    <ToastProvider>
      <AdminLayoutClient userEmail={user?.email} userRole={userRole}>
        {children}
      </AdminLayoutClient>
      <ToastContainer />
    </ToastProvider>
  );
}

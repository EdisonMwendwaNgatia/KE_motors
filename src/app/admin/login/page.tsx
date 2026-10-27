'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/toastContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Verify role in user_roles table
        const { data: userRoleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (roleError) {
          console.error('Error fetching user role:', roleError);
        }

        const role = userRoleData?.role;
        if (role && role !== 'admin' && role !== 'manager') {
          await supabase.auth.signOut();
          setErrorMsg('Access denied. Your account does not have admin privileges.');
          showToast('Access Denied', 'Your account lacks admin permissions.', 'error');
          return;
        }

        showToast('Login Successful', 'Welcome back to KE Motors Admin.', 'success');
        router.push('/admin/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err.message || 'Invalid login credentials. Please try again.';
      setErrorMsg(msg);
      showToast('Authentication Failed', msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Brand Header without logo image */}
        <div className="text-center space-y-1.5 flex flex-col items-center">
          <h1 className="text-3xl font-black tracking-wider text-white">KE MOTORS</h1>
          <div className="inline-block px-2.5 py-0.5 text-[10px] font-extrabold rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60 uppercase tracking-widest">
            DEALERSHIP MANAGEMENT PORTAL
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-zinc-950 border border-red-900/60 text-red-300 text-xs font-medium space-y-1 animate-in fade-in">
            <div className="font-bold text-red-400">
              Authentication Error
            </div>
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@kemotors.co.ke"
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-zinc-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-zinc-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-zinc-950 bg-zinc-100 hover:bg-white shadow-md transition transform active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-zinc-950/40 border-t-zinc-950 rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to Admin Panel →</span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-800/80 text-center">
          <p className="text-[11px] text-zinc-500">
            Protected area. Authorized KE Motors personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}

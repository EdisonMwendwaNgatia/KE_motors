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
      {/* Subtle Background Radial Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/30 via-zinc-950 to-zinc-950 pointer-events-none" />

      <div className="relative w-full max-w-md bg-zinc-900/90 border border-zinc-800/90 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/images/KE_logoB.png"
            alt="KE Motors Logo"
            className="h-14 w-auto object-contain mb-1"
          />
          <h1 className="text-2xl font-black tracking-tight text-white">KE MOTORS</h1>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
            Dealership Administration Portal
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-950/70 border border-red-800/60 text-red-200 text-xs font-medium space-y-1 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-red-400">
              <span>⚠️</span>
              <span>Authentication Error</span>
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
              className="w-full px-4 py-3 rounded-xl bg-zinc-950/70 border border-zinc-800 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
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
              className="w-full px-4 py-3 rounded-xl bg-zinc-950/70 border border-zinc-800 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-red-600 via-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-xl shadow-red-950/60 transition transform active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
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

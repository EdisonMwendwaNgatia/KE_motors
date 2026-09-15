import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-800/60 text-red-400 flex items-center justify-center text-3xl mx-auto">
          🚫
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white">403 — Unauthorized Access</h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Your account does not have sufficient administrator privileges to access the KE Motors Management Console.
          </p>
        </div>
        <div className="pt-2 flex flex-col gap-3">
          <Link
            href="/admin/login"
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition"
          >
            Return to Login Page
          </Link>
        </div>
      </div>
    </div>
  );
}

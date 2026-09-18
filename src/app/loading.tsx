export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center space-y-4">
      <div className="flex items-center space-x-2">
        <div className="w-3.5 h-3.5 bg-red-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-3.5 h-3.5 bg-red-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-3.5 h-3.5 bg-red-600 rounded-full animate-bounce" />
      </div>
      <span className="text-xs font-black uppercase tracking-widest text-slate-400">
        Loading...
      </span>
    </div>
  );
}

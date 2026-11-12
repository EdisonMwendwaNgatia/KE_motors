export default function LoadingCarDetail() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center space-y-4 bg-white">
      <div className="flex items-center space-x-2" aria-hidden="true">
        <div className="h-3.5 w-3.5 animate-bounce rounded-full bg-red-600 [animation-delay:-0.3s]" />
        <div className="h-3.5 w-3.5 animate-bounce rounded-full bg-red-600 [animation-delay:-0.15s]" />
        <div className="h-3.5 w-3.5 animate-bounce rounded-full bg-red-600" />
      </div>
      <span className="text-xs font-black uppercase tracking-widest text-slate-400">
        Loading...
      </span>
    </div>
  );
}

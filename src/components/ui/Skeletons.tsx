import React from 'react';

export function CardSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 animate-pulse space-y-3">
      <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
      <div className="h-8 bg-zinc-800 rounded w-1/2"></div>
      <div className="h-3 bg-zinc-800 rounded w-1/4"></div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 animate-pulse space-y-4">
      <div className="h-8 bg-zinc-800 rounded w-full"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <div className="w-16 h-12 bg-zinc-800 rounded-lg shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
            <div className="h-3 bg-zinc-800 rounded w-1/4"></div>
          </div>
          <div className="w-20 h-6 bg-zinc-800 rounded"></div>
        </div>
      ))}
    </div>
  );
}

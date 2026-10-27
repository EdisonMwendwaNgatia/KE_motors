'use client';

import { useState, type ReactNode } from 'react';

export function MobileSearchDisclosure({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="quick-vehicle-search"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-900 shadow-sm sm:hidden"
      >
        <span>Quick Vehicle Search</span>
        <span aria-hidden="true" className="text-lg text-red-600">{open ? '−' : '+'}</span>
      </button>
      <div id="quick-vehicle-search" className={`${open ? 'block' : 'hidden'} sm:block`}>
        {children}
      </div>
    </div>
  );
}

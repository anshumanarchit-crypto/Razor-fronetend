import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useDemoStore } from '../../store/demoStore';

export const DataTransparencyBanner: React.FC<{ className?: string }> = ({ className }) => {
  const theme = useDemoStore((state) => state.theme);
  const isLight = theme === 'light';

  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-1.5 text-[11px] border-b transition-colors select-none",
      isLight 
        ? "bg-indigo-50/70 border-indigo-100 text-indigo-900" 
        : "bg-indigo-950/30 border-indigo-500/20 text-indigo-300",
      className
    )}>
      <div className="flex items-center gap-2">
        <span className={cn(
          "px-1.5 py-0.5 rounded font-mono font-bold text-[10px] tracking-wider uppercase border",
          isLight ? "bg-indigo-100 text-indigo-800 border-indigo-300" : "bg-indigo-500/20 text-indigo-300 border-indigo-400/30"
        )}>
          Synthetic Demonstration Data
        </span>
        <span className="hidden sm:inline text-slate-400">
          Deterministic seeded scenario data for Razorpay AI Buildathon 2026 evaluation.
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1 font-mono text-[10px] opacity-80">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>TEE Protected Execution Simulation</span>
        </span>
      </div>
    </div>
  );
};

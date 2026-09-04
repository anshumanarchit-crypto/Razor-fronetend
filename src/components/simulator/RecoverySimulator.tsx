import React from 'react';
import { Card, CardTitle } from '../ui/Card';
import { Slider } from '../ui/Slider';
import { RotateCcw, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/Tooltip';
import { useDemoStore } from '../../store/demoStore';
import { cn } from '../../lib/utils';

export const RecoverySimulator: React.FC = () => {
  const contacts = useDemoStore((state) => state.simulatorContacts);
  const retries = useDemoStore((state) => state.simulatorRetryBudget);
  const setContacts = useDemoStore((state) => state.setSimulatorContacts);
  const setRetries = useDemoStore((state) => state.setSimulatorRetryBudget);
  const resetSimulator = useDemoStore((state) => state.resetSimulator);
  const theme = useDemoStore((state) => state.theme);
  const isLight = theme === 'light';

  // Dynamic calculations based on slider inputs
  const contactFactor = contacts / 742;
  const retryFactor = retries / 1842;
  
  const estimatedRecoveryL = (
    7.82 * (1 + 0.15 * Math.log(Math.max(0.1, contactFactor)) + 0.12 * Math.log(Math.max(0.1, retryFactor)))
  ).toFixed(2);

  const increase20L = (Number(estimatedRecoveryL) * 1.063).toFixed(2);
  const increaseDiffL = (Number(increase20L) - Number(estimatedRecoveryL)).toFixed(2);

  const decrease20L = (Number(estimatedRecoveryL) * 0.889).toFixed(2);
  const decreaseDiffL = (Number(estimatedRecoveryL) - Number(decrease20L)).toFixed(2);

  return (
    <Card className={cn(
      "p-3.5 sm:p-4 rounded-2xl space-y-3 backdrop-blur-md h-full flex flex-col justify-between transition-colors border",
      isLight
        ? "bg-white border-slate-200 text-slate-900 shadow-sm"
        : "border-slate-800 bg-[#0B101D]/95 text-white shadow-2xl"
    )}>
      <div>
        {/* Header */}
        <div className={cn("pb-1.5 border-b", isLight ? "border-slate-100" : "border-slate-800/80")}>
          <div className="flex items-center justify-between">
            <CardTitle className={cn("text-xs sm:text-sm font-bold flex items-center gap-1.5", isLight ? "text-slate-900" : "text-white")}>
              <span>Recovery Simulator</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-900 border border-slate-700 text-xs">
                    <p>Counterfactual parameter simulation with diminishing returns</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </div>
          <p className={cn("text-[10.5px]", isLight ? "text-slate-500" : "text-slate-400")}>
            Adjust inputs to see potential impact
          </p>
        </div>

        <div className="space-y-2.5 mt-2.5">
          {/* Slider 1: Expected contacts */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className={cn("font-medium text-[10.5px]", isLight ? "text-slate-700" : "text-slate-300")}>
                Expected contacts
              </span>
              <span className={cn(
                "font-bold tabular-nums text-[11px] px-1.5 py-0.2 rounded border shadow-sm",
                isLight ? "bg-slate-100 text-slate-900 border-slate-300" : "bg-slate-900 text-white border-slate-800"
              )}>
                {contacts.toLocaleString()}
              </span>
            </div>
            <Slider
              min={200}
              max={2000}
              step={10}
              value={[contacts]}
              onValueChange={(val) => setContacts(val[0])}
              className="py-0.5 cursor-pointer"
            />
            <div className={cn("flex justify-between text-[9px] font-mono", isLight ? "text-slate-500 font-semibold" : "text-slate-500")}>
              <span>200</span>
              <span>2,000</span>
            </div>
          </div>

          {/* Slider 2: Expected retry budget */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className={cn("font-medium text-[10.5px]", isLight ? "text-slate-700" : "text-slate-300")}>
                Expected retry budget (Attempts)
              </span>
              <span className={cn(
                "font-bold tabular-nums text-[11px] px-1.5 py-0.2 rounded border shadow-sm",
                isLight ? "bg-slate-100 text-slate-900 border-slate-300" : "bg-slate-900 text-white border-slate-800"
              )}>
                {retries.toLocaleString()}
              </span>
            </div>
            <Slider
              min={500}
              max={4000}
              step={20}
              value={[retries]}
              onValueChange={(val) => setRetries(val[0])}
              className="py-0.5 cursor-pointer"
            />
            <div className={cn("flex justify-between text-[9px] font-mono", isLight ? "text-slate-500 font-semibold" : "text-slate-500")}>
              <span>500</span>
              <span>4,000</span>
            </div>
          </div>

          {/* Output Projected Recovery Card */}
          <div className={cn(
            "p-2.5 rounded-xl border text-center space-y-0.5 transition-colors shadow-sm",
            isLight
              ? "bg-purple-50/90 border-purple-200 text-purple-950"
              : "bg-[#090E1B] border-purple-500/30 text-white shadow-purple-950/20"
          )}>
            <span className={cn("text-[9.5px] uppercase font-extrabold tracking-wider block", isLight ? "text-purple-800" : "text-slate-400")}>
              EXPECTED RECOVERY (EST.)
            </span>
            <div className={cn(
              "text-xl sm:text-2xl font-black tabular-nums tracking-tight leading-tight",
              isLight ? "text-purple-700 font-black" : "text-purple-400"
            )}>
              ₹{estimatedRecoveryL}L
            </div>
          </div>

          {/* Positive Scenario Box (Green) */}
          <div className={cn(
            "p-2.5 rounded-xl border space-y-1 transition-colors shadow-sm",
            isLight
              ? "bg-emerald-50/90 border-emerald-200 text-emerald-950"
              : "bg-[#0F221A] border-emerald-500/30 text-emerald-300"
          )}>
            <div className="flex items-center justify-between">
              <span className={cn("text-[10.5px] font-bold", isLight ? "text-emerald-900" : "text-emerald-300")}>
                If contact volume increases by 20%
              </span>
              <div className="text-right">
                <span className={cn("text-[8.5px] block leading-none", isLight ? "text-emerald-700 font-medium" : "text-slate-400")}>
                  Projected Recovery
                </span>
                <span className={cn("text-[11.5px] font-black tabular-nums", isLight ? "text-emerald-800 font-extrabold" : "text-emerald-400")}>
                  ₹{increase20L}L
                </span>
              </div>
            </div>
            <div className={cn("flex items-center justify-between text-[9.5px] border-t pt-1", isLight ? "border-emerald-200 text-emerald-800" : "border-emerald-500/20 text-slate-300")}>
              <span className={isLight ? "text-emerald-800 font-medium" : "text-slate-400"}>Impact vs current:</span>
              <span className={cn("font-bold tabular-nums", isLight ? "text-emerald-800" : "text-emerald-400")}>
                +₹{increaseDiffL}L <strong className={cn("ml-0.5 font-black", isLight ? "text-emerald-800" : "text-emerald-400")}>▲ 6.3%</strong>
              </span>
            </div>
          </div>

          {/* Negative Scenario Box (Red) */}
          <div className={cn(
            "p-2.5 rounded-xl border space-y-1 transition-colors shadow-sm",
            isLight
              ? "bg-rose-50/90 border-rose-200 text-rose-950"
              : "bg-[#241113] border-rose-500/30 text-rose-300"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <span className={cn("text-[10.5px] font-bold mr-0.5", isLight ? "text-rose-900 font-extrabold" : "text-rose-400")}>But,</span>
                <span className={cn("text-[10px] font-semibold", isLight ? "text-rose-900" : "text-rose-300")}>
                  if contacts decrease by 20%
                </span>
              </div>
              <div className="text-right">
                <span className={cn("text-[8.5px] block leading-none", isLight ? "text-rose-700 font-medium" : "text-slate-400")}>
                  Projected Recovery
                </span>
                <span className={cn("text-[11.5px] font-black tabular-nums", isLight ? "text-rose-800 font-extrabold" : "text-rose-400")}>
                  ₹{decrease20L}L
                </span>
              </div>
            </div>
            <div className={cn("flex items-center justify-between text-[9.5px] border-t pt-1", isLight ? "border-rose-200 text-rose-800" : "border-rose-500/20 text-slate-300")}>
              <span className={isLight ? "text-rose-800 font-medium" : "text-slate-400"}>Impact vs current:</span>
              <span className={cn("font-bold tabular-nums", isLight ? "text-rose-800" : "text-rose-400")}>
                -₹{decreaseDiffL}L <strong className={cn("ml-0.5 font-black", isLight ? "text-rose-800" : "text-rose-400")}>▼ 11.1%</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Simulator Button */}
      <button
        onClick={resetSimulator}
        className={cn(
          "w-full mt-2 py-2 px-2.5 rounded-xl border text-[10.5px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm",
          isLight
            ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 hover:text-slate-900"
            : "bg-[#090D18] hover:bg-[#121B30] border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white"
        )}
      >
        <RotateCcw className={cn("w-3 h-3", isLight ? "text-slate-500" : "text-slate-400")} />
        <span>Reset Simulator</span>
      </button>
    </Card>
  );
};

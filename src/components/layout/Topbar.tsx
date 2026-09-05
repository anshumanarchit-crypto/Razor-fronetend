import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Filter, 
  Bell, 
  HelpCircle, 
  Search, 
  ChevronDown, 
  Download, 
  Share2, 
  Sparkles, 
  User, 
  Sliders,
  Sun,
  Moon,
  Activity,
  Zap
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useDemoStore } from '../../store/demoStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/Tooltip';
import { apiClient, BackendConnectionStatus, HealthStatusResponse } from '../../services/api/apiClient';

interface TopbarProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ title, subtitle, showSearch = true }) => {
  const toggleCopilot = useDemoStore((state) => state.toggleCopilot);
  const activeNotification = useDemoStore((state) => state.activeNotification);
  const clearNotification = useDemoStore((state) => state.clearNotification);
  const setUserProfileModalOpen = useDemoStore((state) => state.setUserProfileModalOpen);
  const setHelpModalOpen = useDemoStore((state) => state.setHelpModalOpen);
  const setDateRangeModalOpen = useDemoStore((state) => state.setDateRangeModalOpen);
  const setFiltersModalOpen = useDemoStore((state) => state.setFiltersModalOpen);
  const openHeroDemo = useDemoStore((state) => state.openHeroDemo);
  const openAutopilotModal = useDemoStore((state) => state.openAutopilotModal);
  const selectedDateRange = useDemoStore((state) => state.selectedDateRange);
  const activeFilterCount = useDemoStore((state) => state.activeFilterCount);
  const userProfile = useDemoStore((state) => state.userProfile);
  const theme = useDemoStore((state) => state.theme);
  const toggleTheme = useDemoStore((state) => state.toggleTheme);

  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [backendStatus, setBackendStatus] = useState<BackendConnectionStatus>(apiClient.getStatus());
  const [healthInfo, setHealthInfo] = useState<HealthStatusResponse | null>(apiClient.getLastHealth());

  useEffect(() => {
    const unsub = apiClient.onStatusChange((st) => {
      setBackendStatus(st);
      setHealthInfo(apiClient.getLastHealth());
    });

    const timer = setInterval(() => {
      apiClient.checkHealth().then((h) => {
        if (h) setHealthInfo(h);
      });
    }, 6000);

    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

  return (
    <header className="h-16 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left Title & Context */}
      <div className="flex items-center gap-4">
        {title && (
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              {title}
            </h1>
            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <TooltipProvider delayDuration={150}>
          {/* ⚡ Hero Demo Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={openHeroDemo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-emerald-500/20 border border-amber-500/40 text-xs font-bold text-amber-300 hover:text-white hover:border-amber-400 hover:bg-amber-500/30 transition-all shadow-sm shadow-amber-500/10 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>⚡ Hero Demo (₹8,999)</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-slate-900 border border-slate-700 text-xs">
              <p>Launch official 10-step judging demo sequence</p>
            </TooltipContent>
          </Tooltip>

          {/* 🚀 Batch Autopilot Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={openAutopilotModal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-xs font-bold text-indigo-300 hover:text-white hover:border-indigo-400 hover:bg-indigo-900/60 transition-all shadow-sm cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Run Autopilot</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-slate-900 border border-slate-700 text-xs">
              <p>Process 350 transactions with invariant verification</p>
            </TooltipContent>
          </Tooltip>

          {/* Date Selector */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => setDateRangeModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs font-medium text-slate-200 hover:border-indigo-500/50 hover:bg-slate-800/80 hover:text-white transition-all shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-mono text-slate-200">{selectedDateRange}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-slate-900 border border-slate-700 text-xs">
              <p>Click to customize analysis window & presets</p>
            </TooltipContent>
          </Tooltip>

          {/* Filter Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => setFiltersModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs font-medium text-slate-200 hover:border-indigo-500/50 hover:bg-slate-800/80 hover:text-white transition-all shadow-sm group"
              >
                <Filter className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                <span>Filters</span>
                <span className="min-w-[18px] h-4 px-1 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold shadow-sm shadow-indigo-600/40">
                  {activeFilterCount}
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-slate-900 border border-slate-700 text-xs">
              <p>{activeFilterCount} Active causal & policy filters — click to edit</p>
            </TooltipContent>
          </Tooltip>

          {/* Live Causal Engine Status Badge */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => apiClient.checkHealth()}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-sm cursor-pointer ${
                  backendStatus === 'LIVE'
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/50'
                    : backendStatus === 'STARTING'
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 hover:bg-amber-900/50'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-300 hover:bg-rose-900/50'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  {backendStatus === 'LIVE' && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      backendStatus === 'LIVE'
                        ? 'bg-emerald-400'
                        : backendStatus === 'STARTING'
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-rose-500'
                    }`}
                  />
                </span>
                <span className="hidden lg:inline text-[11px] font-medium tracking-tight">
                  {backendStatus === 'LIVE'
                    ? '🟢 Causal Engine Connected'
                    : backendStatus === 'STARTING'
                    ? '🟡 Backend Starting...'
                    : '🔴 Causal Engine Offline (Demo Mode)'}
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-slate-900 border border-slate-700 text-xs p-3 max-w-xs shadow-xl">
              {backendStatus === 'LIVE' ? (
                <div className="space-y-1">
                  <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> FastAPI Causal Engine Live
                  </p>
                  <p className="text-slate-300 text-[11px]">
                    T-Learner, X-Learner, Precedents, TreeSHAP & LinUCB Bandit loaded.
                  </p>
                  <p className="text-slate-400 text-[10px] font-mono">
                    Enclave PCR-0: {healthInfo?.tee_boundary?.enclave_measurement?.slice(0, 16) || 'attested'}...
                  </p>
                </div>
              ) : backendStatus === 'STARTING' ? (
                <p className="text-amber-300">FastAPI backend is bootstrapping causal models...</p>
              ) : (
                <div className="space-y-1">
                  <p className="font-bold text-rose-400">Backend Server Offline</p>
                  <p className="text-slate-300 text-[11px]">
                    Using resilient demo state. Run <code className="bg-slate-800 px-1 rounded text-white">npm run server</code> to start FastAPI.
                  </p>
                  <p className="text-indigo-400 text-[10px] font-semibold">Click badge to re-probe connection.</p>
                </div>
              )}
            </TooltipContent>
          </Tooltip>

          {/* Help Trigger */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setHelpModalOpen(true)}
                className="p-2 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-indigo-400" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-slate-900 border border-slate-700 text-xs">
              <p>Help & Causal Model Docs</p>
            </TooltipContent>
          </Tooltip>

          {/* Theme Toggle (Dark / Light) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600 transition-colors cursor-pointer"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-400 hover:-rotate-12 transition-transform" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-slate-900 border border-slate-700 text-xs">
              <p>Switch to {theme === 'dark' ? 'Light' : 'Dark'} theme</p>
            </TooltipContent>
          </Tooltip>

          {/* AI Copilot Quick Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleCopilot}
            className="gap-1.5 border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Ask AI</span>
          </Button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationMenu(!showNotificationMenu)}
              className="relative p-2 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0B0F19]" />
            </button>

            {showNotificationMenu && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#0F172A] border border-slate-700 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-white">Notifications</span>
                  <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                    2 New
                  </span>
                </div>
                <div className="mt-3 space-y-2 text-xs">
                  {activeNotification && (
                    <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-200">
                      <p className="font-semibold text-white">Demo State Update</p>
                      <p className="text-[11px] text-slate-300 mt-0.5">{activeNotification}</p>
                    </div>
                  )}
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    <p className="font-medium text-white">Recovery Engine Spike</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      HDFC recovery rate reached 72% (+14% uplift) in the 24h window.
                    </p>
                    <span className="text-[9px] text-slate-500 mt-1 block">10 mins ago</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    <p className="font-medium text-white">Policy Compliance Verification</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      100% of 128 autonomous actions passed NPCI and TRAI bounds.
                    </p>
                    <span className="text-[9px] text-slate-500 mt-1 block">1 hour ago</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive User Avatar (Top Header Rightmost Corner) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setUserProfileModalOpen(true)}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 border border-indigo-400/40 flex items-center justify-center font-bold text-xs text-white shadow-md hover:scale-105 transition-transform"
              >
                {userProfile.avatar}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-slate-900 border border-slate-700 text-xs">
              <p>Operator Profile ({userProfile.name})</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
};

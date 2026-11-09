import React from 'react';
import { Menu, Activity, ShieldCheck, User } from 'lucide-react';
import { NavTab } from './Sidebar';

interface NavbarProps {
  activeTab: NavTab;
  onOpenMobileSidebar: () => void;
  isBackendConnected: boolean;
}

const PAGE_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Security Operations Center',
    subtitle: 'Real-time telemetry, threat distribution & anomaly overview'
  },
  detection: {
    title: 'Traffic Intrusion Detection',
    subtitle: 'Upload network capture CSV and execute multi-model inference'
  },
  datasets: {
    title: 'Dataset Management',
    subtitle: 'KDD & CICIDS network packet traces ready for inference'
  },
  performance: {
    title: 'Model Performance & Benchmarks',
    subtitle: 'Comparative metrics between Random Forest, Decision Tree & SVM'
  },
  alerts: {
    title: 'Incident Response & Alerts',
    subtitle: 'Triage and mitigate high-confidence intrusion detections'
  },
  settings: {
    title: 'System Configuration',
    subtitle: 'Thresholds, API endpoints & model inference settings'
  }
};

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onOpenMobileSidebar,
  isBackendConnected
}) => {
  const current = PAGE_TITLES[activeTab];

  return (
    <header className="h-16 bg-[#0a0f1d]/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile trigger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <span>{current.title}</span>
          </h1>
          <p className="hidden sm:block text-[11px] text-slate-400">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Status Pill & Profile */}
      <div className="flex items-center gap-3">
        {/* Backend Connectivity Status */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-slate-400 text-[11px]">Backend:</span>
          {isBackendConnected ? (
            <span className="text-emerald-400 font-medium text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> FastAPI Connected
            </span>
          ) : (
            <span className="text-amber-400 font-medium text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> FastAPI Disconnected
            </span>
          )}
        </div>

        {/* Global Security Posture */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Defenses Operational</span>
        </div>

        {/* User Profile Placeholder */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-medium text-xs">
            <User className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-medium text-slate-200">Security Analyst</div>
          </div>
        </div>
      </div>
    </header>
  );
};

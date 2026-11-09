import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
  variant?: 'cyan' | 'success' | 'danger' | 'warning' | 'default';
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'cyan',
  trend,
}) => {
  const variantStyles = {
    cyan: {
      border: 'border-slate-800/80 hover:border-cyan-500/30',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      glow: 'shadow-cyan-950/20',
    },
    success: {
      border: 'border-slate-800/80 hover:border-emerald-500/30',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: 'shadow-emerald-950/20',
    },
    danger: {
      border: 'border-slate-800/80 hover:border-rose-500/30',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      glow: 'shadow-rose-950/20',
    },
    warning: {
      border: 'border-slate-800/80 hover:border-amber-500/30',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glow: 'shadow-amber-950/20',
    },
    default: {
      border: 'border-slate-800/80 hover:border-slate-700',
      iconBg: 'bg-slate-800 text-slate-300 border-slate-700',
      glow: 'shadow-slate-950/20',
    },
  }[variant];

  return (
    <div
      className={`p-4 rounded-xl bg-[#0f172a]/70 border transition-all duration-200 ${variantStyles.border} ${variantStyles.glow} shadow-sm`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        <div className={`p-2 rounded-lg border ${variantStyles.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold tracking-tight text-white font-mono">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {trend && (
          <span
            className={`text-[11px] font-medium ${
              trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtext && (
        <div className="mt-1 text-[11px] text-slate-400 truncate">
          {subtext}
        </div>
      )}
    </div>
  );
};

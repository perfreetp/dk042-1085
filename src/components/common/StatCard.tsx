import type { ReactNode } from 'react';
import { cn } from '../../utils/formatters';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color: 'coral' | 'teal' | 'sun' | 'indigo';
}

const colorMap = {
  coral: 'bg-coral-100 text-coral-600',
  teal: 'bg-teal-100 text-teal-600',
  sun: 'bg-sun-100 text-sun-600',
  indigo: 'bg-indigo-100 text-indigo-600',
};

const trendMap = {
  up: 'text-coral-500',
  down: 'text-teal-500',
  neutral: 'text-slate-500',
};

export default function StatCard({ label, value, subValue, icon, trend, trendValue, color }: StatCardProps) {
  return (
    <div className="card-base card-hover group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-2 font-serif">{value}</p>
          {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
          {trend && trendValue && (
            <p className={cn('text-xs mt-2 font-medium', trendMap[trend])}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </p>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110', colorMap[color])}>
          {icon}
        </div>
      </div>
    </div>
  );
}

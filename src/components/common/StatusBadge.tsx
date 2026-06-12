import { cn } from '../../utils/formatters';

interface StatusBadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

const variantMap = {
  success: 'bg-teal-100 text-teal-700 border-teal-200',
  warning: 'bg-sun-100 text-sun-700 border-sun-200',
  error: 'bg-coral-100 text-coral-700 border-coral-200',
  info: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
};

const sizeMap = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export default function StatusBadge({ label, variant = 'neutral', size = 'sm', pulse = false }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg font-medium border',
        variantMap[variant],
        sizeMap[size]
      )}
    >
      {pulse && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full animate-pulse-soft',
          variant === 'success' && 'bg-teal-500',
          variant === 'warning' && 'bg-sun-500',
          variant === 'error' && 'bg-coral-500',
          variant === 'info' && 'bg-indigo-500',
          variant === 'neutral' && 'bg-slate-500'
        )} />
      )}
      {label}
    </span>
  );
}

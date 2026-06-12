import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (dateStr: string, format: 'full' | 'date' | 'time' | 'month' = 'full'): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  switch (format) {
    case 'date':
      return `${year}-${month}-${day}`;
    case 'time':
      return `${hours}:${minutes}`;
    case 'month':
      return `${month}月${day}日`;
    default:
      return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
};

export const formatRelativeTime = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return formatDate(dateStr, 'date');
};

export const formatMoney = (amount: number): string => {
  return `¥${amount.toFixed(2)}`;
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 6) return '凌晨好';
  if (hour < 12) return '早上好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
};

export const getHealthMetricLabel = (type: string): string => {
  const labels: Record<string, string> = {
    blood_pressure: '血压',
    blood_sugar: '血糖',
    heart_rate: '心率',
    temperature: '体温',
  };
  return labels[type] || type;
};

export const getHealthMetricColor = (status: string): string => {
  const colors: Record<string, string> = {
    normal: 'text-emerald-600',
    high: 'text-rose-500',
    low: 'text-amber-500',
  };
  return colors[status] || 'text-slate-600';
};

export const getBookingStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消',
  };
  return labels[status] || status;
};

export const getBookingStatusStyle = (status: string): string => {
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
    in_progress: 'bg-purple-100 text-purple-700 border-purple-200',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
  };
  return styles[status] || 'bg-slate-100 text-slate-600';
};

export const getTransactionStyle = (type: string): { label: string; color: string; bgColor: string } => {
  const map: Record<string, { label: string; color: string; bgColor: string }> = {
    recharge: { label: '充值', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    deduct: { label: '扣费', color: 'text-rose-600', bgColor: 'bg-rose-50' },
    refund: { label: '退款', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  };
  return map[type] || { label: type, color: 'text-slate-600', bgColor: 'bg-slate-50' };
};

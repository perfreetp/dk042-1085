import { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Settings,
  Image,
  CheckCheck,
  Check,
  Star,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import Card from '../components/common/Card';
import StatusBadge from '../components/common/StatusBadge';
import {
  formatDate,
  formatRelativeTime,
  cn,
} from '../utils/formatters';
import type { NotificationType } from '../types';

const typeConfig: Record<NotificationType, { label: string; icon: any; color: string; borderColor: string; bg: string }> = {
  warning: {
    label: '异常预警',
    icon: AlertTriangle,
    color: 'text-coral-600',
    borderColor: 'border-l-coral-500',
    bg: 'bg-coral-50',
  },
  service: {
    label: '服务通知',
    icon: Bell,
    color: 'text-indigo-600',
    borderColor: 'border-l-indigo-500',
    bg: 'bg-indigo-50',
  },
  photo: {
    label: '照片回传',
    icon: Image,
    color: 'text-teal-600',
    borderColor: 'border-l-teal-500',
    bg: 'bg-teal-50',
  },
  system: {
    label: '系统消息',
    icon: Settings,
    color: 'text-slate-600',
    borderColor: 'border-l-slate-400',
    bg: 'bg-slate-50',
  },
};

const filters = [
  { key: 'all', label: '全部通知' },
  { key: 'warning', label: '异常预警' },
  { key: 'service', label: '服务通知' },
  { key: 'photo', label: '照片回传' },
  { key: 'system', label: '系统消息' },
];

export default function Notifications() {
  const notifications = useAppStore((s) => s.notifications);
  const unreadCount = useAppStore((s) => s.unreadCount);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useAppStore((s) => s.markAllNotificationsRead);

  const [activeFilter, setActiveFilter] = useState('all');
  const [ratingModal, setRatingModal] = useState<{ show: boolean; notifId: string | null }>({ show: false, notifId: null });
  const [ratingValue, setRatingValue] = useState(5);

  const filtered = notifications.filter(
    (n) => activeFilter === 'all' || n.type === activeFilter
  );

  const counts = {
    all: notifications.length,
    warning: notifications.filter((n) => n.type === 'warning').length,
    service: notifications.filter((n) => n.type === 'service').length,
    photo: notifications.filter((n) => n.type === 'photo').length,
    system: notifications.filter((n) => n.type === 'system').length,
  };

  const handleRate = () => {
    if (ratingModal.notifId) {
      markNotificationRead(ratingModal.notifId);
    }
    setRatingModal({ show: false, notifId: null });
    setRatingValue(5);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-800">消息通知</h2>
          <p className="text-slate-500 mt-1">
            {unreadCount > 0 ? `您有 ${unreadCount} 条未读消息` : '所有消息已阅读'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="btn-secondary"
          >
            <CheckCheck className="w-4 h-4" />
            全部标为已读
          </button>
        )}
      </div>

      <Card className="!p-2">
        <div className="flex flex-wrap gap-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={cn(
                'px-5 py-2.5 rounded-xl text-sm font-medium transition-all relative',
                activeFilter === f.key
                  ? 'bg-coral-500 text-white shadow-md'
                  : 'hover:bg-slate-100 text-slate-600'
              )}
            >
              {f.label}
              <span
                className={cn(
                  'ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold',
                  activeFilter === f.key
                    ? 'bg-white/25 text-white'
                    : 'bg-slate-100 text-slate-500'
                )}
              >
                {counts[f.key as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>
      </Card>

      <div className="space-y-4">
        {filtered.map((notif, idx) => {
          const cfg = typeConfig[notif.type];
          const Icon = cfg.icon;
          return (
            <Card
              key={notif.id}
              hover
              onClick={() => !notif.read && markNotificationRead(notif.id)}
              className={cn(
                '!p-0 overflow-hidden relative',
                cfg.borderColor,
                'border-l-4'
              )}
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <div className="flex gap-5 p-6">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', cfg.bg)}>
                  <Icon className={cn('w-6 h-6', cfg.color)} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-slate-800">{notif.title}</h4>
                      <StatusBadge label={cfg.label} variant={
                        notif.type === 'warning' ? 'error' :
                        notif.type === 'service' ? 'info' :
                        notif.type === 'photo' ? 'success' : 'neutral'
                      } />
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-coral-500 animate-pulse-soft shrink-0" />
                      )}
                    </div>
                    <span className="text-xs text-slate-400 shrink-0 whitespace-nowrap mt-1">
                      {formatRelativeTime(notif.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{notif.content}</p>

                  {notif.type === 'photo' && notif.metadata?.photos && (
                    <div className="mt-4 flex gap-2">
                      {Array(Math.min(4, notif.metadata.photos)).fill(0).map((_, i) => (
                        <div
                          key={i}
                          className="w-20 h-20 rounded-xl bg-gradient-to-br from-teal-100 via-indigo-100 to-coral-100 flex items-center justify-center overflow-hidden relative group cursor-pointer"
                        >
                          <Image className="w-6 h-6 text-white/60 group-hover:scale-110 transition-transform" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                            <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                              查看
                            </span>
                          </div>
                        </div>
                      ))}
                      {notif.metadata.photos > 4 && (
                        <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 text-sm font-medium">
                          +{notif.metadata.photos - 4}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    {notif.metadata?.ratingPending && notif.read === false && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRatingModal({ show: true, notifId: notif.id });
                        }}
                        className="px-4 py-2 rounded-lg bg-coral-500 text-white text-sm font-medium hover:bg-coral-600 transition-colors flex items-center gap-1.5"
                      >
                        <Star className="w-4 h-4" />
                        去评价
                      </button>
                    )}
                    {notif.type === 'warning' && (
                      <>
                        <button className="px-4 py-2 rounded-lg border border-coral-200 text-coral-600 text-sm font-medium hover:bg-coral-50 transition-colors">
                          呼叫联系人
                        </button>
                        <button className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                          我已知晓
                        </button>
                      </>
                    )}
                    <button className="px-4 py-2 rounded-lg text-slate-500 text-sm font-medium hover:bg-slate-100 transition-colors flex items-center gap-1 ml-auto">
                      查看详情
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {!notif.read && (
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotificationRead(notif.id);
                      }}
                      className="w-7 h-7 rounded-full bg-slate-100 hover:bg-coral-100 hover:text-coral-500 flex items-center justify-center transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Card className="text-center py-20">
            <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">暂无{activeFilter === 'all' ? '' : filters.find(f => f.key === activeFilter)?.label}消息</p>
          </Card>
        )}
      </div>

      {ratingModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <Card className="max-w-md w-full animate-fade-in-up">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-800">服务评价</h3>
                <p className="text-sm text-slate-500 mt-1">您的评价能帮助我们改进服务</p>
              </div>
              <button
                onClick={() => setRatingModal({ show: false, notifId: null })}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-6">
              <p className="text-sm text-slate-500 mb-3">请为本次服务打分</p>
              <div className="flex justify-center gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setRatingValue(s)}
                    className="text-4xl transition-all hover:scale-125"
                  >
                    <Star
                      className={cn(
                        'w-10 h-10',
                        s <= ratingValue
                          ? 'text-sun-400 fill-sun-400'
                          : 'text-slate-200'
                      )}
                      fill={s <= ratingValue ? 'currentColor' : 'none'}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm font-medium text-slate-700">
                {ratingValue === 5 ? '非常满意 😊' :
                 ratingValue === 4 ? '比较满意 🙂' :
                 ratingValue === 3 ? '一般 😐' :
                 ratingValue === 2 ? '不太满意 🙁' :
                 '非常不满意 😞'}
              </p>
            </div>

            <textarea
              placeholder="请输入您的评价内容（选填）..."
              className="w-full p-4 rounded-xl bg-cream-100 border border-transparent focus:border-coral-200 focus:bg-white focus:outline-none transition-all text-sm placeholder:text-slate-400 resize-none h-24 mb-5"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setRatingModal({ show: false, notifId: null })}
                className="flex-1 btn-secondary"
              >
                稍后再说
              </button>
              <button
                onClick={handleRate}
                className="flex-1 btn-primary"
              >
                提交评价
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

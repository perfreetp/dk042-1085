import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  HeartPulse,
  CalendarClock,
  Bell,
  Receipt,
  ShieldCheck,
  Heart,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const navItems = [
  { path: '/', label: '今日看板', icon: LayoutDashboard },
  { path: '/health', label: '健康记录', icon: HeartPulse },
  { path: '/services', label: '服务预约', icon: CalendarClock },
  { path: '/notifications', label: '消息通知', icon: Bell, badge: true },
  { path: '/billing', label: '账单明细', icon: Receipt },
  { path: '/authorization', label: '资料授权', icon: ShieldCheck },
];

export default function Sidebar() {
  const unreadCount = useAppStore((s) => s.unreadCount);
  const elderInfo = useAppStore((s) => s.elderInfo);

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-100 flex flex-col fixed left-0 top-0 z-30 shadow-soft">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-warm flex items-center justify-center shadow-float">
            <Heart className="w-6 h-6 text-white" fill="white" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold text-slate-800">暖心陪护</h1>
            <p className="text-xs text-slate-500">家属端管理平台</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-cream-100">
          <img
            src={elderInfo.avatar}
            alt={elderInfo.name}
            className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-soft"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 truncate">{elderInfo.name}</p>
            <p className="text-xs text-slate-500">{elderInfo.age}岁 · {elderInfo.location.split('区')[0]}区</p>
          </div>
          <div className={`w-3 h-3 rounded-full ${elderInfo.lastCheckIn.status === 'normal' ? 'bg-teal-400 animate-pulse-soft' : 'bg-sun-400 animate-pulse-soft'}`} />
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : ''} relative`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="flex-1">{item.label}</span>
            {item.badge && unreadCount > 0 && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[20px] h-5 px-1.5 rounded-full bg-white text-coral-500 text-xs font-bold flex items-center justify-center shadow-soft">
                {unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="p-4 rounded-2xl bg-gradient-warm text-white">
          <p className="text-sm font-medium opacity-90">需要帮助？</p>
          <p className="text-xs mt-1 opacity-80">客服热线 400-888-9999</p>
          <button className="mt-3 w-full py-2 rounded-xl bg-white/20 backdrop-blur-sm text-sm font-medium hover:bg-white/30 transition-colors">
            联系客服
          </button>
        </div>
      </div>
    </aside>
  );
}

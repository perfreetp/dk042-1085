import { Bell, Search, User, Settings } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { getGreeting } from '../../utils/formatters';
import { Link } from 'react-router-dom';

export default function Header() {
  const elderInfo = useAppStore((s) => s.elderInfo);
  const unreadCount = useAppStore((s) => s.unreadCount);

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-slate-100">
      <div className="px-8 py-4 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl font-semibold text-slate-800">
            {getGreeting()}，家人们 👋
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            今天是美好的一天，一起关注 <span className="text-coral-500 font-medium">{elderInfo.name}</span> 的生活吧
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索服务、记录..."
              className="w-64 pl-10 pr-4 py-2.5 rounded-xl bg-cream-100 border border-transparent focus:border-coral-200 focus:bg-white focus:outline-none transition-all text-sm placeholder:text-slate-400"
            />
          </div>

          <Link
            to="/notifications"
            className="relative w-11 h-11 rounded-xl bg-cream-100 hover:bg-coral-50 flex items-center justify-center transition-colors group"
          >
            <Bell className="w-5 h-5 text-slate-600 group-hover:text-coral-500 transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-coral-500 text-white text-xs font-bold flex items-center justify-center shadow-md">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          <button className="w-11 h-11 rounded-xl bg-cream-100 hover:bg-slate-100 flex items-center justify-center transition-colors">
            <Settings className="w-5 h-5 text-slate-600" />
          </button>

          <div className="flex items-center gap-3 pl-2 border-l border-slate-200 ml-1">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-700">王晓梅</p>
              <p className="text-xs text-slate-500">{elderInfo.name} 女儿</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-cool flex items-center justify-center shadow-soft">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

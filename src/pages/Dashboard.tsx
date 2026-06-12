import {
  MapPin,
  Users,
  Pill,
  Activity,
  Phone,
  CalendarPlus,
  MessageCircle,
  ChevronRight,
  TrendingUp,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import HealthTrendChart from '../components/charts/HealthTrendChart';
import {
  formatDate,
  formatRelativeTime,
  getHealthMetricColor,
} from '../utils/formatters';
import { Link } from 'react-router-dom';
import type { HealthMetric } from '../types';

export default function Dashboard() {
  const elderInfo = useAppStore((s) => s.elderInfo);
  const healthMetrics = useAppStore((s) => s.healthMetrics);
  const medicationRecords = useAppStore((s) => s.medicationRecords);
  const visitRecords = useAppStore((s) => s.visitRecords);
  const notifications = useAppStore((s) => s.notifications);
  const toggleMedication = useAppStore((s) => s.toggleMedication);
  const unreadCount = useAppStore((s) => s.unreadCount);

  const latestMetrics = {
    bloodPressure: healthMetrics.filter((m) => m.type === 'blood_pressure').slice(-1)[0],
    bloodSugar: healthMetrics.filter((m) => m.type === 'blood_sugar').slice(-1)[0],
    heartRate: healthMetrics.filter((m) => m.type === 'heart_rate').slice(-1)[0],
    temperature: healthMetrics.filter((m) => m.type === 'temperature').slice(-1)[0],
  };

  const completedMeds = medicationRecords.filter((m) => m.completed).length;
  const totalMeds = medicationRecords.length;
  const warnings = notifications.filter((n) => n.type === 'warning' && !n.read);

  const renderMetricValue = (metric: HealthMetric | undefined, label: string) => {
    if (!metric) return null;
    const value = metric.type === 'blood_pressure'
      ? `${metric.value}/${metric.value2}`
      : metric.value;
    return (
      <StatCard
      label={label}
      value={value}
      subValue={`${metric.unit} · ${formatRelativeTime(metric.timestamp)}`}
      icon={<Activity className="w-6 h-6" />}
      color={
        metric.status === 'normal' ? 'teal' : metric.status === 'high' ? 'coral' : 'sun'}
      />
    );
  };

  return (
    <div className="space-y-6">
      <Card className="!p-0 overflow-hidden bg-gradient-warm text-white">
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <img
                  src={elderInfo.avatar}
                  alt={elderInfo.name}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-white/30 shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-teal-400 border-3 border-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                </div>
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold">{elderInfo.name}</h3>
                <p className="text-white/80 mt-1">{elderInfo.age}岁 · 当前{elderInfo.location}</p>
                <div className="flex items-center gap-2 mt-3">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">
                    最后签到: {elderInfo.lastCheckIn.place} · {formatDate(elderInfo.lastCheckIn.time, 'time')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors font-medium">
                <Phone className="w-5 h-5" />
                一键呼叫
              </button>
              <Link
                to="/services"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-coral-600 hover:bg-white/90 transition-colors font-medium shadow-lg"
              >
                <CalendarPlus className="w-5 h-5" />
                预约服务
              </Link>
              <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors font-medium">
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
          {warnings.length > 0 && (
            <div className="mt-5 p-4 rounded-xl bg-white/15 backdrop-blur-sm flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium">{warnings[0].title}</p>
                <p className="text-sm text-white/80">{warnings[0].content}</p>
              </div>
              <Link to="/notifications" className="text-sm font-medium underline underline-offset-2 hover:opacity-80">
                查看详情
              </Link>
            </div>
          )}
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderMetricValue(latestMetrics.bloodPressure, '最近血压')}
        {renderMetricValue(latestMetrics.bloodSugar, '最近血糖')}
        {renderMetricValue(latestMetrics.heartRate, '最近心率')}
        {renderMetricValue(latestMetrics.temperature, '最近体温')}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" hover>
          <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-serif text-lg font-semibold text-slate-800">健康趋势</h3>
            <p className="text-sm text-slate-500 mt-0.5">近一周主要指标变化</p>
          </div>
          <div className="flex gap-2">
            {['血压', '血糖', '心率', '体温'].map((t, i) => (
              <button
              key={t}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                i === 0 ? 'bg-coral-50 text-coral-600' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {t}
            </button>
            ))}
          </div>
            <Link to="/health" className="text-coral-500 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
              查看全部 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <HealthTrendChart data={healthMetrics} type="blood_pressure" height={280} />
        </Card>

        <Card hover>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-serif text-lg font-semibold text-slate-800">今日用药</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                已完成 {completedMeds}/{totalMeds} 项
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-coral-50 flex items-center justify-center">
              <Pill className="w-6 h-6 text-coral-500" />
            </div>
          </div>

          <div className="h-2 w-full rounded-full bg-slate-100 mb-5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-warm transition-all duration-700"
              style={{ width: `${(completedMeds / totalMeds) * 100}%` }}
            />
          </div>

          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
            {medicationRecords.map((med) => (
              <div
                key={med.id}
                onClick={() => toggleMedication(med.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  med.completed
                    ? 'bg-teal-50 border-teal-100'
                    : 'bg-white border-slate-100 hover:border-coral-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      med.completed
                        ? 'bg-teal-500 border-teal-500'
                        : 'border-slate-300 hover:border-coral-400'
                    }`}
                  >
                    {med.completed && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${med.completed ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                      {med.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {med.dosage} · {med.time}
                    </p>
                  </div>
                  {!med.completed && <StatusBadge label="待服用" variant="warning" />}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card hover>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-slate-800">最近探访</h3>
                <p className="text-sm text-slate-500 mt-0.5">专业照护与家人探望记录</p>
              </div>
            </div>
            <button className="text-coral-500 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
              全部记录 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {visitRecords.slice(0, 4).map((visit, idx) => (
              <div
                key={visit.id}
                className={`flex items-center gap-4 p-3 rounded-xl hover:bg-cream-50 transition-colors ${
                  idx < visitRecords.length - 1 ? 'border-b border-slate-50 pb-4' : ''
                }`}
              >
                <img
                  src={visit.visitorAvatar}
                  alt={visit.visitorName}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-700">{visit.visitorName}</p>
                    <StatusBadge label={visit.visitorRole} variant="info" />
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{visit.notes}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-slate-600">{formatRelativeTime(visit.visitTime)}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{visit.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card hover className="!p-0 overflow-hidden">
          <div className="p-6 pb-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-sun-50 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-sun-500" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-slate-800">定位签到</h3>
                  <p className="text-sm text-slate-500 mt-0.5">今日活动轨迹</p>
                </div>
              </div>
              <StatusBadge label="实时在线" variant="success" pulse />
            </div>
            <div className="flex items-center gap-2 mb-4">
            </div>
          </div>
          <div className="relative h-56 bg-gradient-to-br from-coral-50 via-teal-50 to-indigo-50 rounded-t-none -mx-0 mt-4 overflow-hidden">
            <div className="absolute inset-0 p-4">
              <div className="h-full w-full rounded-xl bg-white/60 backdrop-blur-sm border border-white flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-8 left-8 w-32 h-32 rounded-full bg-coral-200 blur-2xl" />
                  <div className="absolute bottom-8 right-12 w-40 h-40 rounded-full bg-teal-200 blur-2xl" />
                </div>
                <div className="relative z-10 text-center">
                  <div className="relative inline-flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-coral-500 ring-4 ring-coral-200 animate-pulse-soft mb-3" />
                    <p className="font-semibold text-slate-700">{elderInfo.lastCheckIn.place}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {formatDate(elderInfo.lastCheckIn.time, 'time')} 签到
                    </p>
                  </div>
                </div>
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
                  <path
                    d="M 10 45 Q 25 30, 40 40 T 70 25 T 90 35"
                    fill="none"
                    stroke="#FF6B6B"
                    strokeWidth="0.5"
                    strokeDasharray="2 2"
                    className="opacity-60"
                  />
                  <circle cx="10" cy="45" r="1.5" fill="#4ECDC4" />
                  <circle cx="25" cy="30" r="1.5" fill="#4ECDC4" />
                  <circle cx="40" cy="40" r="1.5" fill="#4ECDC4" />
                  <circle cx="70" cy="25" r="1.5" fill="#4ECDC4" />
                  <circle cx="90" cy="35" r="2" fill="#FF6B6B" />
                </svg>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-teal-400" /> 已签到 5 次
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> 今日活动良好
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

import { useState } from 'react';
import {
  Phone,
  Shield,
  ShieldCheck,
  ShieldAlert,
  User,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  MapPin,
  FileText,
  Wallet,
  Heart,
  Star,
  Check,
  X,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import Card from '../components/common/Card';
import StatusBadge from '../components/common/StatusBadge';
import {
  formatDate,
  cn,
} from '../utils/formatters';
import type { CaregiverPermissions } from '../types';

interface PermissionItem {
  key: keyof CaregiverPermissions;
  label: string;
  desc: string;
  icon: any;
}

const permissionItems: PermissionItem[] = [
  { key: 'healthData', label: '健康数据', desc: '查看血压、血糖、用药等健康信息', icon: Heart },
  { key: 'location', label: '定位信息', desc: '查看老人实时位置和活动轨迹', icon: MapPin },
  { key: 'serviceRecords', label: '服务记录', desc: '查看预约服务和探访记录', icon: FileText },
  { key: 'billingInfo', label: '账单信息', desc: '查看消费记录和账户余额', icon: Wallet },
];

export default function Authorization() {
  const emergencyContacts = useAppStore((s) => s.emergencyContacts);
  const caregiverAuthorizations = useAppStore((s) => s.caregiverAuthorizations);
  const toggleContactEnabled = useAppStore((s) => s.toggleContactEnabled);
  const toggleCaregiverEnabled = useAppStore((s) => s.toggleCaregiverEnabled);
  const updateCaregiverPermission = useAppStore((s) => s.updateCaregiverPermission);

  const [showContactModal, setShowContactModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState<string | null>(null);

  const sortedContacts = [...emergencyContacts].sort((a, b) => a.priority - b.priority);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-slate-800">资料授权</h2>
        <p className="text-slate-500 mt-1">管理紧急联系人和照护人员的信息访问权限</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-coral-50 flex items-center justify-center">
                <Phone className="w-5 h-5 text-coral-500" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-slate-800">紧急联系人</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  按优先级顺序通知，建议至少设置2位联系人
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowContactModal(true)}
              className="btn-secondary"
            >
              <Plus className="w-4 h-4" />
              添加联系人
            </button>
          </div>

          <div className="space-y-3">
            {sortedContacts.map((contact, idx) => (
              <div
                key={contact.id}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all',
                  contact.enabled
                    ? 'bg-white border-slate-100 hover:border-coral-200'
                    : 'bg-slate-50 border-slate-100 opacity-70'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-cool flex items-center justify-center shadow-soft">
                      <User className="w-7 h-7 text-white" />
                    </div>
                    <span className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-coral-500 text-white text-xs font-bold flex items-center justify-center shadow-md">
                      {contact.priority}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-800 text-lg">{contact.name}</h4>
                      <StatusBadge
                        label={contact.relationship}
                        variant="info"
                      />
                      {contact.enabled ? (
                        <StatusBadge label="已启用" variant="success" size="sm" />
                      ) : (
                        <StatusBadge label="已停用" variant="neutral" size="sm" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">{contact.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleContactEnabled(contact.id)}
                      className={cn(
                        'relative w-12 h-7 rounded-full transition-all',
                        contact.enabled ? 'bg-coral-500' : 'bg-slate-300'
                      )}
                    >
                      <div
                        className={cn(
                          'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all',
                          contact.enabled ? 'left-[22px]' : 'left-0.5'
                        )}
                      />
                    </button>
                    <button className="w-9 h-9 rounded-xl hover:bg-coral-50 flex items-center justify-center text-coral-400 hover:text-coral-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 p-4 rounded-xl bg-sun-50 border border-sun-200 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-sun-600 shrink-0 mt-0.5" />
            <div className="text-sm text-slate-700">
              <p className="font-medium text-sun-700 mb-1">安全提示</p>
              <p className="text-slate-600">
                系统检测到异常时将按优先级依次拨打紧急联系人电话，建议将最常联系的家人设为1号联系人。
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-slate-800">隐私总览</h3>
              <p className="text-xs text-slate-500 mt-0.5">当前资料共享状态</p>
            </div>
          </div>

          <div className="space-y-3">
            {permissionItems.map((item, idx) => {
              const totalAuth = caregiverAuthorizations.length;
              const enabledAuth = caregiverAuthorizations.filter((a) => a.permissions[item.key] && a.enabled).length;
              const Icon = item.icon;
              return (
                <div key={item.key} className="p-3 rounded-xl bg-cream-100">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-slate-600" />
                      <span className="font-medium text-slate-700 text-sm">{item.label}</span>
                    </div>
                    <span className="text-xs font-medium text-indigo-600">
                      {enabledAuth}/{totalAuth} 人
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 pl-6">{item.desc}</p>
                  <div className="h-1.5 rounded-full bg-white mt-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-warm transition-all"
                      style={{ width: `${totalAuth > 0 ? (enabledAuth / totalAuth) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-slate-800">照护人员授权</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                管理照护人员可查看的资料范围，保护老人隐私
              </p>
            </div>
          </div>
          <button className="btn-secondary">
            <Plus className="w-4 h-4" />
            添加照护人员
          </button>
        </div>

        <div className="space-y-4">
          {caregiverAuthorizations.map((auth) => (
            <div
              key={auth.id}
              className={cn(
                'p-5 rounded-2xl border-2 transition-all',
                auth.enabled
                  ? 'bg-white border-slate-100'
                  : 'bg-slate-50 border-slate-100 opacity-70'
              )}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-5">
                <div className="flex items-center gap-4 md:w-64 shrink-0">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-200 to-indigo-200 flex items-center justify-center shadow-soft">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    {auth.enabled ? (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-teal-500 border-2 border-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-400 border-2 border-white flex items-center justify-center">
                        <X className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-lg">{auth.caregiverName}</h4>
                    <p className="text-sm text-slate-500">{auth.caregiverPhone}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                      <span>{formatDate(auth.validFrom, 'date')}</span>
                      <span>至</span>
                      <span>{formatDate(auth.validTo, 'date')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-3">
                  {permissionItems.map((item) => {
                    const enabled = auth.permissions[item.key];
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.key}
                        className={cn(
                          'p-3 rounded-xl border-2 transition-all cursor-pointer',
                          enabled
                            ? 'bg-teal-50 border-teal-200'
                            : 'bg-white border-slate-100'
                        )}
                        onClick={() => updateCaregiverPermission(auth.id, item.key, !enabled)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <Icon
                              className={cn(
                                'w-4 h-4',
                                enabled ? 'text-teal-600' : 'text-slate-400'
                              )}
                            />
                            <span
                              className={cn(
                                'font-medium text-sm',
                                enabled ? 'text-teal-700' : 'text-slate-600'
                              )}
                            >
                              {item.label}
                            </span>
                          </div>
                          {enabled ? (
                            <Eye className="w-4 h-4 text-teal-500" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-slate-300" />
                          )}
                        </div>
                        <p className="text-xs text-slate-400 pl-6">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex md:flex-col gap-2 shrink-0 md:w-24">
                  <button
                    onClick={() => setShowAuthModal(auth.id)}
                    className="flex-1 md:flex-none px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:border-coral-200 hover:text-coral-600 transition-colors"
                  >
                    详细设置
                  </button>
                  <button
                    onClick={() => toggleCaregiverEnabled(auth.id)}
                    className={cn(
                      'flex-1 md:flex-none px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                      auth.enabled
                        ? 'bg-coral-50 text-coral-600 hover:bg-coral-100'
                        : 'bg-teal-50 text-teal-600 hover:bg-teal-100'
                    )}
                  >
                    {auth.enabled ? '停用' : '启用'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <Card className="max-w-md w-full animate-fade-in-up">
            <div className="flex items-start justify-between mb-6">
              <h3 className="font-serif text-xl font-bold text-slate-800">添加紧急联系人</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">姓名</label>
                <input
                  type="text"
                  placeholder="请输入联系人姓名"
                  className="w-full px-4 py-3 rounded-xl bg-cream-100 border border-transparent focus:border-coral-200 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">关系</label>
                <select className="w-full px-4 py-3 rounded-xl bg-cream-100 border border-transparent focus:border-coral-200 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400">
                  <option>配偶</option>
                  <option>儿子</option>
                  <option>女儿</option>
                  <option>其他亲属</option>
                  <option>朋友</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">手机号码</label>
                <input
                  type="tel"
                  placeholder="请输入手机号码"
                  className="w-full px-4 py-3 rounded-xl bg-cream-100 border border-transparent focus:border-coral-200 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">优先级</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      className="flex-1 py-3 rounded-xl border-2 border-slate-200 hover:border-coral-300 font-medium transition-all relative"
                    >
                      <Star className="w-4 h-4 inline mr-1 text-sun-400 fill-sun-400" />
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowContactModal(false)}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={() => setShowContactModal(false)}
                className="flex-1 btn-primary"
              >
                确认添加
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

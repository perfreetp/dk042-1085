import { useState, useMemo } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCcw,
  CreditCard,
  Plus,
  FileText,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Users,
  Search,
  X,
  Check,
  Receipt,
  CalendarRange,
  Filter,
  Calendar,
  Clock,
  User,
  Timer,
  Tag,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import Card from '../components/common/Card';
import StatusBadge from '../components/common/StatusBadge';
import StatCard from '../components/common/StatCard';
import {
  formatDate,
  formatMoney,
  formatRelativeTime,
  getTransactionStyle,
  cn,
} from '../utils/formatters';
import type { TransactionType } from '../types';

const typeFilters = [
  { key: 'all', label: '全部' },
  { key: 'recharge', label: '充值' },
  { key: 'deduct', label: '扣费' },
  { key: 'refund', label: '退款' },
];

const rechargeOptions = [100, 300, 500, 1000, 2000, 5000];
const rechargeGifts: Record<number, number> = {
  500: 30,
  1000: 80,
  2000: 200,
  5000: 600,
};

export default function Billing() {
  const transactions = useAppStore((s) => s.transactions);
  const serviceBookings = useAppStore((s) => s.serviceBookings);
  const accountBalance = useAppStore((s) => s.accountBalance);
  const totalRecharge = useAppStore((s) => s.totalRecharge);
  const totalConsume = useAppStore((s) => s.totalConsume);
  const rechargeAccount = useAppStore((s) => s.rechargeAccount);

  const [activeFilter, setActiveFilter] = useState<TransactionType | 'all'>('all');
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [payMethod, setPayMethod] = useState('wechat');
  const [detailModal, setDetailModal] = useState<string | null>(null);
  const [filterService, setFilterService] = useState<string>('');
  const [filterDateStart, setFilterDateStart] = useState<string>('');
  const [filterDateEnd, setFilterDateEnd] = useState<string>('');
  const [filterMinAmount, setFilterMinAmount] = useState<string>('');
  const [filterMaxAmount, setFilterMaxAmount] = useState<string>('');
  const [filterCaregiver, setFilterCaregiver] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [summaryMonth, setSummaryMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [expandedService, setExpandedService] = useState<string | null>(null);

  const uniqueServiceNames = useMemo(() => {
    const names = new Set(serviceBookings.map((b) => b.serviceName));
    return Array.from(names);
  }, [serviceBookings]);

  const uniqueCaregiverNames = useMemo(() => {
    const names = new Set(
      serviceBookings
        .map((b) => b.caregiverName)
        .filter((n): n is string => !!n && n !== '待指派')
    );
    return Array.from(names);
  }, [serviceBookings]);

  const filtered = transactions.filter((t) => {
    if (activeFilter !== 'all' && t.type !== activeFilter) return false;
    if (searchKeyword && t.orderNo && !t.orderNo.includes(searchKeyword)) return false;
    if (t.type === 'deduct' || t.type === 'refund') {
      if (filterService) {
        const booking = serviceBookings.find((b) => b.id === t.bookingId);
        if (!booking || booking.serviceName !== filterService) return false;
      }
      if (filterCaregiver) {
        const booking = serviceBookings.find((b) => b.id === t.bookingId);
        if (!booking || booking.caregiverName !== filterCaregiver) return false;
      }
      if (filterDateStart) {
        const txDate = new Date(t.createdAt);
        const startDate = new Date(filterDateStart);
        if (txDate < startDate) return false;
      }
      if (filterDateEnd) {
        const txDate = new Date(t.createdAt);
        const endDate = new Date(filterDateEnd);
        endDate.setHours(23, 59, 59, 999);
        if (txDate > endDate) return false;
      }
      if (filterMinAmount) {
        const min = parseFloat(filterMinAmount);
        if (!isNaN(min) && t.amount < min) return false;
      }
      if (filterMaxAmount) {
        const max = parseFloat(filterMaxAmount);
        if (!isNaN(max) && t.amount > max) return false;
      }
    }
    return true;
  });

  const resetFilters = () => {
    setFilterService('');
    setFilterDateStart('');
    setFilterDateEnd('');
    setFilterMinAmount('');
    setFilterMaxAmount('');
    setFilterCaregiver('');
    setSearchKeyword('');
  };

  const countByType = {
    all: transactions.length,
    recharge: transactions.filter((t) => t.type === 'recharge').length,
    deduct: transactions.filter((t) => t.type === 'deduct').length,
    refund: transactions.filter((t) => t.type === 'refund').length,
  };

  const handleRecharge = () => {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (!amount || amount <= 0) return;
    const method = payMethod === 'wechat' ? '微信支付' : payMethod === 'alipay' ? '支付宝' : '银行卡';
    rechargeAccount(amount, method);
    setShowRechargeModal(false);
    setCustomAmount('');
  };

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;
  const gift = rechargeGifts[finalAmount] || 0;

  const currentDetail = detailModal ? transactions.find((t) => t.id === detailModal) : null;

  const monthlySummary = useMemo(() => {
    const monthTransactions = transactions.filter((t) => {
      if (t.type !== 'deduct' && t.type !== 'refund') return false;
      const txDate = new Date(t.createdAt);
      const monthStr = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
      return monthStr === summaryMonth;
    });

    const serviceMap = new Map<string, {
      serviceName: string;
      deducts: typeof transactions;
      refunds: typeof transactions;
    }>();

    monthTransactions.forEach((tx) => {
      const booking = tx.bookingId ? serviceBookings.find((b) => b.id === tx.bookingId) : null;
      const serviceName = booking?.serviceName || '其他';
      if (!serviceMap.has(serviceName)) {
        serviceMap.set(serviceName, { serviceName, deducts: [], refunds: [] });
      }
      const entry = serviceMap.get(serviceName)!;
      if (tx.type === 'deduct') entry.deducts.push(tx);
      else entry.refunds.push(tx);
    });

    const rows = Array.from(serviceMap.values()).map((entry) => {
      const originalTotal = entry.deducts.reduce((s, t) => s + (t.originalAmount ?? t.amount), 0);
      const discountTotal = entry.deducts.reduce((s, t) => s + (t.discountAmount ?? 0), 0);
      const deductTotal = entry.deducts.reduce((s, t) => s + t.amount, 0);
      const refundTotal = entry.refunds.reduce((s, t) => s + t.amount, 0);
      return {
        serviceName: entry.serviceName,
        originalTotal,
        discountTotal,
        deductTotal,
        refundTotal,
        netConsume: deductTotal - refundTotal,
        deducts: entry.deducts,
        refunds: entry.refunds,
      };
    });

    const totals = {
      originalTotal: rows.reduce((s, r) => s + r.originalTotal, 0),
      discountTotal: rows.reduce((s, r) => s + r.discountTotal, 0),
      deductTotal: rows.reduce((s, r) => s + r.deductTotal, 0),
      refundTotal: rows.reduce((s, r) => s + r.refundTotal, 0),
      netConsume: rows.reduce((s, r) => s + r.netConsume, 0),
    };

    return { rows, totals };
  }, [transactions, serviceBookings, summaryMonth]);

  const summaryMonthLabel = useMemo(() => {
    const [y, m] = summaryMonth.split('-');
    return `${y}年${parseInt(m)}月`;
  }, [summaryMonth]);

  const changeSummaryMonth = (delta: number) => {
    const [y, m] = summaryMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setSummaryMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-800">账单明细</h2>
          <p className="text-slate-500 mt-1">管理账户余额，查询交易流水</p>
        </div>
        <button onClick={() => setShowRechargeModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          立即充值
        </button>
      </div>

      <Card className="!p-0 overflow-hidden bg-gradient-warm text-white">
        <div className="p-6 md:p-8 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-white/70 text-sm">账户余额 (元)</p>
              <p className="text-5xl font-bold font-serif mt-2">
                {formatMoney(accountBalance).replace('¥', '')}
              </p>
              <div className="flex gap-4 mt-5">
                <button
                  onClick={() => setShowRechargeModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-white text-coral-600 font-medium hover:bg-white/90 transition-colors shadow-lg"
                >
                  <Plus className="w-4 h-4 inline mr-1.5" />
                  充值
                </button>
                <button className="px-5 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm font-medium hover:bg-white/30 transition-colors">
                  提现
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 md:gap-10">
              <div>
                <p className="text-white/70 text-xs mb-1">累计充值</p>
                <p className="text-2xl font-bold font-serif">{formatMoney(totalRecharge)}</p>
              </div>
              <div>
                <p className="text-white/70 text-xs mb-1">累计消费</p>
                <p className="text-2xl font-bold font-serif">{formatMoney(totalConsume)}</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 right-20 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="本月充值"
          value={formatMoney(900)}
          subValue="较上月 +12.5%"
          icon={<ArrowUpRight className="w-6 h-6" />}
          color="teal"
          trend="up"
          trendValue="+12.5%"
        />
        <StatCard
          label="本月消费"
          value={formatMoney(720)}
          subValue="较上月 -8.3%"
          icon={<ArrowDownLeft className="w-6 h-6" />}
          color="coral"
          trend="down"
          trendValue="-8.3%"
        />
        <StatCard
          label="退款笔数"
          value={3}
          subValue="累计退款 ¥420"
          icon={<RefreshCcw className="w-6 h-6" />}
          color="indigo"
        />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-serif text-lg font-bold text-slate-800">月度对账汇总</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => changeSummaryMonth(-1)}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-slate-700 min-w-[80px] text-center">{summaryMonthLabel}</span>
            <button
              onClick={() => changeSummaryMonth(1)}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-2 text-slate-500 font-medium">服务类型</th>
                <th className="text-right py-3 px-2 text-slate-500 font-medium">应扣金额</th>
                <th className="text-right py-3 px-2 text-slate-500 font-medium">优惠金额</th>
                <th className="text-right py-3 px-2 text-slate-500 font-medium">实扣金额</th>
                <th className="text-right py-3 px-2 text-slate-500 font-medium">退款金额</th>
                <th className="text-right py-3 px-2 text-slate-500 font-medium">净消费</th>
              </tr>
            </thead>
            <tbody>
              {monthlySummary.rows.map((row) => (
                <tr key={row.serviceName} className="border-b border-slate-100">
                  <td className="py-3 px-2">
                    <button
                      onClick={() => setExpandedService(expandedService === row.serviceName ? null : row.serviceName)}
                      className="flex items-center gap-1.5 text-slate-700 font-medium hover:text-coral-600 transition-colors"
                    >
                      {expandedService === row.serviceName ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      {row.serviceName}
                    </button>
                  </td>
                  <td className="text-right py-3 px-2 text-slate-600">{formatMoney(row.originalTotal)}</td>
                  <td className="text-right py-3 px-2 text-teal-600">-{formatMoney(row.discountTotal)}</td>
                  <td className="text-right py-3 px-2 text-coral-600">{formatMoney(row.deductTotal)}</td>
                  <td className="text-right py-3 px-2 text-indigo-600">{formatMoney(row.refundTotal)}</td>
                  <td className="text-right py-3 px-2 font-semibold text-slate-800">{formatMoney(row.netConsume)}</td>
                </tr>
              ))}
              {monthlySummary.rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">该月暂无交易记录</td>
                </tr>
              )}
              {monthlySummary.rows.length > 0 && (
                <tr className="bg-cream-50 font-semibold">
                  <td className="py-3 px-2 text-slate-700">合计</td>
                  <td className="text-right py-3 px-2 text-slate-700">{formatMoney(monthlySummary.totals.originalTotal)}</td>
                  <td className="text-right py-3 px-2 text-teal-600">-{formatMoney(monthlySummary.totals.discountTotal)}</td>
                  <td className="text-right py-3 px-2 text-coral-600">{formatMoney(monthlySummary.totals.deductTotal)}</td>
                  <td className="text-right py-3 px-2 text-indigo-600">{formatMoney(monthlySummary.totals.refundTotal)}</td>
                  <td className="text-right py-3 px-2 text-slate-800">{formatMoney(monthlySummary.totals.netConsume)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {expandedService && (() => {
          const row = monthlySummary.rows.find((r) => r.serviceName === expandedService);
          if (!row) return null;
          return (
            <div className="mt-4 p-4 rounded-xl bg-cream-50 border border-cream-100">
              <p className="text-sm font-semibold text-slate-700 mb-3">{row.serviceName} - 交易明细</p>
              <div className="space-y-2">
                {row.deducts.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-slate-500">{formatDate(tx.createdAt)}</span>
                    <span className="text-coral-600 font-medium">-{formatMoney(tx.amount)} (扣费)</span>
                    <span className="text-slate-400">{tx.orderNo || '-'}</span>
                  </div>
                ))}
                {row.refunds.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-slate-500">{formatDate(tx.createdAt)}</span>
                    <span className="text-indigo-600 font-medium">+{formatMoney(tx.amount)} (退款)</span>
                    <span className="text-slate-400">{tx.orderNo || '-'}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </Card>

      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="inline-flex p-1 rounded-xl bg-slate-100 w-fit">
            {typeFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key as any)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all relative',
                  activeFilter === f.key
                    ? 'bg-white text-coral-600 shadow-soft'
                    : 'text-slate-600 hover:text-slate-800'
                )}
              >
                {f.label}
                <span
                  className={cn(
                    'ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold',
                    activeFilter === f.key
                      ? 'bg-coral-100 text-coral-600'
                      : 'bg-slate-200 text-slate-500'
                  )}
                >
                  {countByType[f.key as keyof typeof countByType]}
                </span>
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索订单号..."
              className="w-56 pl-10 pr-4 py-2.5 rounded-xl bg-cream-100 border border-transparent focus:border-coral-200 focus:bg-white focus:outline-none transition-all text-sm placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3 mb-5 p-4 rounded-xl bg-cream-50 border border-cream-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-600">核对视图筛选：</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">服务名称</label>
              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white border border-slate-200 focus:border-coral-300 focus:outline-none text-sm text-slate-700 min-w-[140px]"
              >
                <option value="">全部服务</option>
                {uniqueServiceNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 flex items-center gap-1"><Users className="w-3 h-3" />照护人员</label>
              <select
                value={filterCaregiver}
                onChange={(e) => setFilterCaregiver(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white border border-slate-200 focus:border-coral-300 focus:outline-none text-sm text-slate-700 min-w-[140px]"
              >
                <option value="">全部人员</option>
                {uniqueCaregiverNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">预约日期</label>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="date"
                    value={filterDateStart}
                    onChange={(e) => setFilterDateStart(e.target.value)}
                    className="pl-8 pr-3 py-2 rounded-lg bg-white border border-slate-200 focus:border-coral-300 focus:outline-none text-sm text-slate-700"
                  />
                </div>
                <span className="text-slate-400">至</span>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="date"
                    value={filterDateEnd}
                    onChange={(e) => setFilterDateEnd(e.target.value)}
                    className="pl-8 pr-3 py-2 rounded-lg bg-white border border-slate-200 focus:border-coral-300 focus:outline-none text-sm text-slate-700"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">金额区间</label>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">¥</span>
                  <input
                    type="number"
                    value={filterMinAmount}
                    onChange={(e) => setFilterMinAmount(e.target.value)}
                    placeholder="最小"
                    className="pl-7 pr-3 py-2 rounded-lg bg-white border border-slate-200 focus:border-coral-300 focus:outline-none text-sm text-slate-700 w-24 placeholder:text-slate-400"
                  />
                </div>
                <span className="text-slate-400">-</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">¥</span>
                  <input
                    type="number"
                    value={filterMaxAmount}
                    onChange={(e) => setFilterMaxAmount(e.target.value)}
                    placeholder="最大"
                    className="pl-7 pr-3 py-2 rounded-lg bg-white border border-slate-200 focus:border-coral-300 focus:outline-none text-sm text-slate-700 w-24 placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-sm text-slate-600 flex items-center gap-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              重置筛选
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {filtered.map((tx) => {
            const style = getTransactionStyle(tx.type);
            const Icon =
              tx.type === 'recharge' ? ArrowUpRight : tx.type === 'deduct' ? ArrowDownLeft : RefreshCcw;
            return (
              <div
                key={tx.id}
                onClick={() => setDetailModal(tx.id)}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-cream-50 transition-all cursor-pointer group"
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                    style.bgColor
                  )}
                >
                  <Icon className={cn('w-5 h-5', style.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-slate-700 truncate">{tx.description}</p>
                    <StatusBadge
                      label={style.label}
                      variant={
                        tx.type === 'recharge'
                          ? 'success'
                          : tx.type === 'deduct'
                          ? 'error'
                          : 'info'
                      }
                      size="sm"
                    />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{formatDate(tx.createdAt)}</span>
                    {tx.orderNo && <span className="truncate">单号: {tx.orderNo}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-2 justify-end">
                    <p
                      className={cn(
                        'text-lg font-bold font-serif',
                        tx.type === 'recharge' || tx.type === 'refund'
                          ? 'text-teal-600'
                          : 'text-coral-600'
                      )}
                    >
                      {(tx.type === 'recharge' || tx.type === 'refund' ? '+' : '-') + formatMoney(tx.amount)}
                    </p>
                    {(tx.type === 'deduct' || tx.type === 'refund') && tx.bookingId && (() => {
                      const bk = serviceBookings.find((b) => b.id === tx.bookingId);
                      if (!bk) return null;
                      const statusConfig: Record<string, { label: string; color: string }> = {
                        completed: { label: '已完成', color: 'bg-emerald-100 text-emerald-700' },
                        cancelled: { label: '已取消', color: 'bg-red-100 text-red-700' },
                        in_progress: { label: '进行中', color: 'bg-amber-100 text-amber-700' },
                        pending: { label: '待确认', color: 'bg-blue-100 text-blue-700' },
                        confirmed: { label: '已确认', color: 'bg-sky-100 text-sky-700' },
                      };
                      const cfg = statusConfig[bk.status];
                      if (!cfg) return null;
                      return (
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap', cfg.color)}>
                          {cfg.label}
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    余额 {formatMoney(tx.balanceAfter)}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-coral-500 shrink-0 transition-colors" />
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">暂无交易记录</p>
            </div>
          )}
        </div>
      </Card>

      {showRechargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <Card className="max-w-lg w-full animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-800">账户充值</h3>
                <p className="text-sm text-slate-500 mt-1">当前余额 {formatMoney(accountBalance)}</p>
              </div>
              <button
                onClick={() => setShowRechargeModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">选择充值金额</p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {rechargeOptions.map((amt) => {
                  const isSelected = selectedAmount === amt && !customAmount;
                  const hasGift = rechargeGifts[amt];
                  return (
                    <button
                      key={amt}
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount('');
                      }}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all relative text-center',
                        isSelected
                          ? 'border-coral-500 bg-coral-50 shadow-md'
                          : 'border-slate-200 hover:border-coral-300 bg-white'
                      )}
                    >
                      <p className={cn('text-xl font-bold font-serif', isSelected ? 'text-coral-600' : 'text-slate-700')}>
                        ¥{amt}
                      </p>
                      {hasGift && (
                        <p className="text-xs text-coral-500 mt-1 font-medium">送¥{hasGift}</p>
                      )}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-coral-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-slate-700 mb-2 block">自定义金额</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">¥</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="请输入金额"
                    className="w-full pl-9 pr-4 py-3.5 rounded-xl bg-cream-100 border-2 border-transparent focus:border-coral-300 focus:bg-white focus:outline-none transition-all text-lg font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>

              <p className="text-sm font-medium text-slate-700 mb-3">支付方式</p>
              <div className="space-y-2 mb-6">
                {[
                  { key: 'wechat', label: '微信支付', color: 'bg-emerald-500' },
                  { key: 'alipay', label: '支付宝', color: 'bg-blue-500' },
                  { key: 'bank', label: '银行卡支付', color: 'bg-indigo-500' },
                ].map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setPayMethod(m.key)}
                    className={cn(
                      'w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3',
                      payMethod === m.key
                        ? 'border-coral-500 bg-coral-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    )}
                  >
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center text-white')}>
                      <CreditCard className="w-4 h-4" style={{ backgroundColor: m.color }} />
                    </div>
                    <span className="flex-1 text-left font-medium text-slate-700">{m.label}</span>
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                        payMethod === m.key ? 'border-coral-500' : 'border-slate-300'
                      )}
                    >
                      {payMethod === m.key && <div className="w-2.5 h-2.5 rounded-full bg-coral-500" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-cream-100 mb-5 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">充值金额</span>
                  <span className="font-medium text-slate-700">{formatMoney(finalAmount)}</span>
                </div>
                {gift > 0 && (
                  <div className="flex justify-between text-teal-600">
                    <span>赠送金额</span>
                    <span className="font-medium">+{formatMoney(gift)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-white">
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-600">实付金额</span>
                    <span className="text-2xl font-bold text-coral-500 font-serif">
                      {formatMoney(finalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleRecharge}
                disabled={finalAmount <= 0}
                className={cn(
                  'w-full py-3.5 rounded-xl font-medium transition-all',
                  finalAmount > 0 ? 'btn-primary !w-full' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                )}
              >
                确认支付 {formatMoney(finalAmount)}
              </button>
            </div>
          </Card>
        </div>
      )}

      {currentDetail && (() => {
        const booking = currentDetail.bookingId
          ? serviceBookings.find((b) => b.id === currentDetail.bookingId)
          : null;
        const presetGift = rechargeGifts[currentDetail.amount] || 0;
        const style = getTransactionStyle(currentDetail.type);
        const Icon =
          currentDetail.type === 'recharge'
            ? ArrowUpRight
            : currentDetail.type === 'deduct'
            ? ArrowDownLeft
            : RefreshCcw;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <Card className="max-w-md w-full animate-fade-in-up max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-11 h-11 rounded-xl flex items-center justify-center',
                      style.bgColor
                    )}
                  >
                    <Icon className={cn('w-5 h-5', style.color)} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-slate-800">交易详情</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{style.label}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDetailModal(null)}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-5">
                {currentDetail.type === 'deduct' && booking && (
                  <div className="p-4 rounded-xl bg-cream-50 border border-cream-100">
                    <div className="flex items-center gap-2 mb-3">
                      <CalendarRange className="w-4 h-4 text-coral-500" />
                      <p className="text-sm font-semibold text-slate-700">关联预约</p>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Tag className="w-3 h-3" />
                          服务名称
                        </span>
                        <span className="text-sm font-medium text-slate-700">{booking.serviceName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          预约日期
                        </span>
                        <span className="text-sm font-medium text-slate-700">{formatDate(booking.scheduledDate)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          预约时间
                        </span>
                        <span className="text-sm font-medium text-slate-700">{booking.scheduledTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 flex items-center gap-1.5">
                          <User className="w-3 h-3" />
                          照护人员
                        </span>
                        <span className="text-sm font-medium text-slate-700">{booking.caregiverName || '-'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Timer className="w-3 h-3" />
                          服务时长
                        </span>
                        <span className="text-sm font-medium text-slate-700">{booking.duration} 小时</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">预约状态</span>
                        <StatusBadge
                          label={
                            booking.status === 'pending' ? '待确认' :
                            booking.status === 'confirmed' ? '已确认' :
                            booking.status === 'in_progress' ? '进行中' :
                            booking.status === 'completed' ? '已完成' :
                            '已取消'
                          }
                          variant={
                            booking.status === 'completed' ? 'success' :
                            booking.status === 'cancelled' ? 'error' :
                            booking.status === 'in_progress' ? 'warning' : 'info'
                          }
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentDetail.type === 'refund' && booking && (
                  <div className="p-4 rounded-xl bg-cream-50 border border-cream-100">
                    <div className="flex items-center gap-2 mb-3">
                      <CalendarRange className="w-4 h-4 text-indigo-500" />
                      <p className="text-sm font-semibold text-slate-700">关联预约</p>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Tag className="w-3 h-3" />
                          服务名称
                        </span>
                        <span className="text-sm font-medium text-slate-700">{booking.serviceName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          预约日期
                        </span>
                        <span className="text-sm font-medium text-slate-700">{formatDate(booking.scheduledDate)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">预约状态</span>
                        <StatusBadge label="已取消" variant="error" size="sm" />
                      </div>
                    </div>
                  </div>
                )}

                {currentDetail.type === 'deduct' && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Receipt className="w-4 h-4 text-coral-500" />
                      <p className="text-sm font-semibold text-slate-700">费用构成</p>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">原价</span>
                        <span className="text-sm font-medium text-slate-700">
                          {formatMoney(currentDetail.originalAmount ?? currentDetail.amount)}
                        </span>
                      </div>
                      {currentDetail.discountAmount && currentDetail.discountAmount > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">优惠金额</span>
                          <span className="text-sm font-medium text-teal-600">
                            -{formatMoney(currentDetail.discountAmount)}
                          </span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 font-medium">实付金额</span>
                          <span className="text-2xl font-bold text-coral-500 font-serif">
                            -{formatMoney(currentDetail.amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentDetail.type === 'recharge' && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Receipt className="w-4 h-4 text-teal-500" />
                      <p className="text-sm font-semibold text-slate-700">充值信息</p>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">支付方式</span>
                        <span className="text-sm font-medium text-slate-700">
                          {currentDetail.paymentMethod === 'wechat' ? '微信支付' :
                           currentDetail.paymentMethod === 'alipay' ? '支付宝' :
                           currentDetail.paymentMethod === 'bank' ? '银行卡' : '-'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">充值金额</span>
                        <span className="text-sm font-medium text-slate-700">
                          {formatMoney(currentDetail.amount)}
                        </span>
                      </div>
                      {presetGift > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">赠送金额</span>
                          <span className="text-sm font-medium text-teal-600">
                            +{formatMoney(presetGift)}
                          </span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 font-medium">到账金额</span>
                          <span className="text-2xl font-bold text-teal-500 font-serif">
                            +{formatMoney(currentDetail.amount + presetGift)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentDetail.type === 'refund' && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Receipt className="w-4 h-4 text-indigo-500" />
                      <p className="text-sm font-semibold text-slate-700">退款信息</p>
                    </div>
                    <div className="space-y-2.5">
                      <div className="pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 font-medium">退款金额</span>
                          <span className="text-2xl font-bold text-teal-500 font-serif">
                            +{formatMoney(currentDetail.amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <p className="text-sm font-semibold text-slate-700">交易信息</p>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-50">
                      <span className="text-sm text-slate-500">当前余额</span>
                      <span className="text-sm font-medium text-slate-700">{formatMoney(currentDetail.balanceAfter)}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-50">
                      <span className="text-sm text-slate-500">交易说明</span>
                      <span className="text-sm font-medium text-slate-700 text-right max-w-[200px]">{currentDetail.description}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-50">
                      <span className="text-sm text-slate-500">订单编号</span>
                      <span className="text-sm font-medium text-slate-700">{currentDetail.orderNo || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-50">
                      <span className="text-sm text-slate-500">交易状态</span>
                      <StatusBadge label="交易成功" variant="success" size="sm" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">交易时间</span>
                      <span className="text-sm font-medium text-slate-700">{formatDate(currentDetail.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button className="flex-1 btn-secondary">
                  <FileText className="w-4 h-4" />
                  下载凭证
                </button>
                <button
                  onClick={() => setDetailModal(null)}
                  className="flex-1 btn-primary"
                >
                  我知道了
                </button>
              </div>
            </Card>
          </div>
        );
      })()}
    </div>
  );
}

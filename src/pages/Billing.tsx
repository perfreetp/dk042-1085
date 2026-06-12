import { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCcw,
  CreditCard,
  Plus,
  FileText,
  ChevronRight,
  Search,
  X,
  Check,
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

  const filtered = transactions.filter(
    (t) => activeFilter === 'all' || t.type === activeFilter
  );

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
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
              placeholder="搜索订单号..."
              className="w-56 pl-10 pr-4 py-2.5 rounded-xl bg-cream-100 border border-transparent focus:border-coral-200 focus:bg-white focus:outline-none transition-all text-sm placeholder:text-slate-400"
            />
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

      {currentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <Card className="max-w-md w-full animate-fade-in-up">
            <div className="flex items-start justify-between mb-6">
              <h3 className="font-serif text-xl font-bold text-slate-800">交易详情</h3>
              <button
                onClick={() => setDetailModal(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {[
                { label: '交易类型', value: getTransactionStyle(currentDetail.type).label },
                { label: '交易金额', value: (currentDetail.type === 'recharge' || currentDetail.type === 'refund' ? '+' : '-') + formatMoney(currentDetail.amount), highlight: true },
                { label: '当前余额', value: formatMoney(currentDetail.balanceAfter) },
                { label: '交易说明', value: currentDetail.description },
                { label: '订单编号', value: currentDetail.orderNo || '-' },
                { label: '支付方式', value: currentDetail.paymentMethod === 'wechat' ? '微信支付' : currentDetail.paymentMethod === 'alipay' ? '支付宝' : currentDetail.paymentMethod === 'bank' ? '银行卡' : '-' },
                { label: '交易状态', value: '交易成功' },
                { label: '交易时间', value: formatDate(currentDetail.createdAt) },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`flex justify-between items-center pb-4 ${
                    i < 7 ? 'border-b border-slate-50' : ''
                  }`}
                >
                  <span className="text-sm text-slate-500">{item.label}</span>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      item.highlight && 'text-xl text-coral-500 font-bold font-serif'
                    )}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
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
      )}
    </div>
  );
}

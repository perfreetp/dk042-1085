import { useState } from 'react';
import {
  Stethoscope,
  Dumbbell,
  ShowerHead,
  Sparkles,
  HeartHandshake,
  Users,
  ShoppingBag,
  Flower2,
  Clock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Tag,
  User,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import Card from '../components/common/Card';
import StatusBadge from '../components/common/StatusBadge';
import {
  formatDate,
  formatMoney,
  getBookingStatusLabel,
  getBookingStatusStyle,
  cn,
} from '../utils/formatters';
import type { ServiceItem, ServiceBookingRecord } from '../types';

const iconMap: Record<string, any> = {
  stethoscope: Stethoscope,
  dumbbell: Dumbbell,
  'shower-head': ShowerHead,
  sparkles: Sparkles,
  'heart-handshake': HeartHandshake,
  users: Users,
  'shopping-bag': ShoppingBag,
  'flower-2': Flower2,
};

const categoryConfig = {
  nursing: { label: '护理服务', color: 'coral' },
  rehabilitation: { label: '康复理疗', color: 'teal' },
  bathing: { label: '助浴保洁', color: 'sun' },
  companion: { label: '陪伴代办', color: 'indigo' },
  other: { label: '其他服务', color: 'neutral' },
};

const colorBgMap = {
  coral: 'bg-coral-100 text-coral-600',
  teal: 'bg-teal-100 text-teal-600',
  sun: 'bg-sun-100 text-sun-600',
  indigo: 'bg-indigo-100 text-indigo-600',
  neutral: 'bg-slate-100 text-slate-600',
};

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00',
  '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00',
];

const durationOptions = [1, 2, 3, 4, 6, 8];

export default function ServiceBooking() {
  const serviceItems = useAppStore((s) => s.serviceItems);
  const serviceBookings = useAppStore((s) => s.serviceBookings);
  const accountBalance = useAppStore((s) => s.accountBalance);
  const addBooking = useAppStore((s) => s.addBooking);
  const cancelBooking = useAppStore((s) => s.cancelBooking);

  const [activeTab, setActiveTab] = useState<'booking' | 'records'>('booking');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(2);
  const [bookingFilter, setBookingFilter] = useState<string>('all');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: (Date | null)[] = [];
    for (let i = 0; i < startPadding; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      if (date >= today) days.push(date);
      else days.push(null);
    }
    return days;
  };

  const handleConfirmBooking = () => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    const total = selectedService.pricePerHour * selectedDuration;
    addBooking({
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      scheduledDate: formatDate(selectedDate.toISOString(), 'date'),
      scheduledTime: selectedTime,
      duration: selectedDuration,
      totalAmount: total,
      status: 'confirmed',
    });

    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedDuration(2);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 2500);
  };

  const filteredBookings = serviceBookings.filter(
    (b) => bookingFilter === 'all' || b.status === bookingFilter
  );

  const totalAmount = selectedService ? selectedService.pricePerHour * selectedDuration : 0;
  const discount = totalAmount >= 500 ? totalAmount * 0.1 : 0;
  const finalAmount = totalAmount - discount;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-800">服务预约</h2>
          <p className="text-slate-500 mt-1">为家人预约专业贴心的照护服务</p>
        </div>
        <div className="inline-flex p-1 rounded-xl bg-slate-100">
          <button
            onClick={() => setActiveTab('booking')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'booking'
                ? 'bg-white text-coral-600 shadow-soft'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            预约服务
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'records'
                ? 'bg-white text-coral-600 shadow-soft'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            预约记录
            {serviceBookings.filter((b) => b.status === 'pending' || b.status === 'confirmed').length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-coral-500 text-white text-xs">
                {serviceBookings.filter((b) => b.status === 'pending' || b.status === 'confirmed').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed top-24 right-8 z-50 animate-fade-in-up">
          <Card className="!p-4 flex items-center gap-3 shadow-card border-teal-200">
            <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center">
              <Check className="w-5 h-5 text-white" strokeWidth={3} />
            </div>
            <div>
              <p className="font-semibold text-slate-800">预约成功！</p>
              <p className="text-xs text-slate-500">照护人员将按时上门服务</p>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'booking' ? (
        <>
          <div>
            <h3 className="font-medium text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-coral-500 text-white text-xs flex items-center justify-center font-bold">1</span>
              选择服务类型
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {serviceItems.map((svc) => {
                const Icon = iconMap[svc.icon] || Stethoscope;
                const cat = categoryConfig[svc.category];
                const isSelected = selectedService?.id === svc.id;
                return (
                  <Card
                    key={svc.id}
                    hover
                    onClick={() => setSelectedService(svc)}
                    className={cn(
                      '!p-5 cursor-pointer relative overflow-hidden transition-all',
                      isSelected && 'ring-2 ring-coral-400 shadow-card'
                    )}
                  >
                    <div className={`w-14 h-14 rounded-2xl ${colorBgMap[cat.color as keyof typeof colorBgMap]} flex items-center justify-center mb-4`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <h4 className="font-semibold text-slate-800">{svc.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 h-8">{svc.description}</p>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <p className="text-xs text-slate-400">起</p>
                        <p className="text-lg font-bold text-coral-500 font-serif">
                          ¥{svc.pricePerHour}
                          <span className="text-xs text-slate-400 font-normal">/小时</span>
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-7 h-7 rounded-full bg-coral-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {selectedService && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
              <Card className="lg:col-span-2">
                <h3 className="font-medium text-slate-700 mb-5 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-coral-500 text-white text-xs flex items-center justify-center font-bold">2</span>
                  选择服务时间
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-slate-600">
                        {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
                      </h4>
                      <div className="flex gap-1">
                        <button
                          onClick={() =>
                            setCurrentMonth(
                              new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                            )
                          }
                          className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setCurrentMonth(
                              new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                            )
                          }
                          className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
                        <div key={d} className="text-xs text-slate-400 py-2">
                          {d}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {generateCalendarDays().map((date, idx) => {
                        if (!date) return <div key={idx} />;
                        const isSelected =
                          selectedDate &&
                          date.toDateString() === selectedDate.toDateString();
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedDate(date)}
                            className={cn(
                              'aspect-square rounded-xl text-sm transition-all flex items-center justify-center',
                              isSelected
                                ? 'bg-gradient-warm text-white font-medium shadow-float'
                                : 'hover:bg-coral-50 text-slate-700'
                            )}
                          >
                            {date.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-600 mb-4">选择时段</h4>
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      {timeSlots.map((t) => {
                        const isFull = parseInt(t) >= 12 && parseInt(t) <= 13;
                        const isSelected = selectedTime === t;
                        return (
                          <button
                            key={t}
                            disabled={isFull}
                            onClick={() => setSelectedTime(t)}
                            className={cn(
                              'py-3 rounded-xl text-sm font-medium transition-all border',
                              isFull && 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed line-through',
                              !isFull && !isSelected && 'bg-white border-slate-200 text-slate-600 hover:border-coral-300 hover:text-coral-600',
                              isSelected && 'bg-coral-500 border-coral-500 text-white shadow-md'
                            )}
                          >
                            <Clock className="w-3.5 h-3.5 inline mr-1" />
                            {t}
                            {isFull && '满'}
                          </button>
                        );
                      })}
                    </div>

                    <h4 className="font-medium text-slate-600 mb-3">服务时长</h4>
                    <div className="grid grid-cols-6 gap-2">
                      {durationOptions.map((h) => (
                        <button
                          key={h}
                          onClick={() => setSelectedDuration(h)}
                          className={cn(
                            'py-3 rounded-xl text-sm font-medium transition-all border',
                            selectedDuration === h
                              ? 'bg-coral-500 border-coral-500 text-white shadow-md'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-coral-300'
                          )}
                        >
                          {h}小时
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="font-medium text-slate-700 mb-5 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-coral-500 text-white text-xs flex items-center justify-center font-bold">3</span>
                  费用确认
                </h3>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-cream-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl ${colorBgMap[categoryConfig[selectedService.category as keyof typeof categoryConfig].color as keyof typeof colorBgMap]} flex items-center justify-center`}>
                        {(() => { const Icon = iconMap[selectedService.icon] || Stethoscope; return <Icon className="w-5 h-5" />; })()}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-700">{selectedService.name}</p>
                        <p className="text-xs text-slate-500">
                          {selectedDate ? formatDate(selectedDate.toISOString(), 'date') : '未选择日期'}
                          {selectedTime ? ` ${selectedTime}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">服务单价</span>
                      <span className="font-medium text-slate-700">¥{selectedService.pricePerHour}/小时</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">服务时长</span>
                      <span className="font-medium text-slate-700">{selectedDuration} 小时</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">服务费用</span>
                      <span className="font-medium text-slate-700">{formatMoney(totalAmount)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-teal-600">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" />
                          满500减10%优惠
                        </span>
                        <span className="font-medium">-{formatMoney(discount)}</span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex justify-between items-baseline">
                        <span className="text-slate-600">应付金额</span>
                        <span className="text-2xl font-bold text-coral-500 font-serif">{formatMoney(finalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-indigo-600">账户余额</span>
                      <span className="font-bold text-indigo-700">{formatMoney(accountBalance)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmBooking}
                    disabled={!selectedDate || !selectedTime || finalAmount > accountBalance}
                    className={cn(
                      'w-full py-3.5 rounded-xl font-medium transition-all',
                      !selectedDate || !selectedTime || finalAmount > accountBalance
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'btn-primary !w-full'
                    )}
                  >
                    {!selectedDate
                      ? '请选择服务日期'
                      : !selectedTime
                      ? '请选择服务时段'
                      : finalAmount > accountBalance
                      ? '余额不足，请先充值'
                      : `确认预约 (余额支付 ${formatMoney(finalAmount)})`}
                  </button>

                  <p className="text-xs text-slate-400 text-center">
                    确认即表示同意《服务协议》和《隐私政策》
                  </p>
                </div>
              </Card>
            </div>
          )}
        </>
      ) : (
        <>
          <Card className="!p-3">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: '全部' },
                { key: 'pending', label: '待确认' },
                { key: 'confirmed', label: '已确认' },
                { key: 'in_progress', label: '进行中' },
                { key: 'completed', label: '已完成' },
                { key: 'cancelled', label: '已取消' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setBookingFilter(f.key)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    bookingFilter === f.key
                      ? 'bg-coral-500 text-white shadow-md'
                      : 'hover:bg-slate-100 text-slate-600'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </Card>

          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={() => cancelBooking(booking.id)}
              />
            ))}
            {filteredBookings.length === 0 && (
              <Card className="text-center py-16">
                <CalendarDays className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">暂无预约记录</p>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function BookingCard({ booking, onCancel }: { booking: ServiceBookingRecord; onCancel: () => void }) {
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

  return (
    <Card hover>
      <div className="flex flex-col md:flex-row md:items-center gap-5">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h4 className="font-semibold text-lg text-slate-800 font-serif">{booking.serviceName}</h4>
            <StatusBadge
              label={getBookingStatusLabel(booking.status)}
              variant={
                booking.status === 'completed'
                  ? 'success'
                  : booking.status === 'cancelled'
                  ? 'neutral'
                  : booking.status === 'in_progress'
                  ? 'info'
                  : booking.status === 'pending'
                  ? 'warning'
                  : 'info'
              }
              pulse={booking.status === 'in_progress'}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <CalendarDays className="w-4 h-4 text-slate-400" />
              {booking.scheduledDate}
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4 text-slate-400" />
              {booking.scheduledTime} · {booking.duration}小时
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <User className="w-4 h-4 text-slate-400" />
              {booking.caregiverName || '待指派'}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">费用</span>
              <span className="font-bold text-coral-500 font-serif">{formatMoney(booking.totalAmount)}</span>
            </div>
          </div>
          {booking.rating && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-slate-400">您的评价:</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    className={s <= (booking.rating || 0) ? 'text-sun-400' : 'text-slate-200'}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex md:flex-col gap-2 shrink-0">
          {booking.status === 'completed' && !booking.rating && (
            <button className="px-5 py-2.5 rounded-xl bg-coral-500 text-white text-sm font-medium hover:bg-coral-600 transition-colors">
              去评价
            </button>
          )}
          {(booking.status === 'completed' || booking.status === 'in_progress') && (
            <button className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:border-coral-200 hover:text-coral-600 transition-colors">
              查看详情
            </button>
          )}
          {canCancel && (
            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-medium hover:border-coral-200 hover:text-coral-500 transition-colors flex items-center gap-1.5"
            >
              <X className="w-4 h-4" /> 取消预约
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

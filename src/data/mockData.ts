import type {
  ElderInfo,
  HealthMetric,
  MedicationRecord,
  VisitRecord,
  ServiceItem,
  ServiceBookingRecord,
  Notification,
  Transaction,
  EmergencyContact,
  CaregiverAuthorization,
  BookingStatus,
} from '../types';

export const elderInfo: ElderInfo = {
  id: 'elder-001',
  name: '王秀兰',
  avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elderly%20asian%20woman%20portrait%20warm%20smile%20soft%20lighting&image_size=square',
  age: 78,
  location: '北京市朝阳区幸福小区3号楼',
  lastCheckIn: {
    time: '2026-06-12 07:30:00',
    place: '家中客厅',
    status: 'normal',
  },
};

const generateHealthMetrics = (): HealthMetric[] => {
  const metrics: HealthMetric[] = [];
  const now = new Date();

  for (let day = 29; day >= 0; day--) {
    for (let time = 0; time < 4; time++) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);
      date.setHours(6 + time * 4, 0, 0, 0);

      const baseSystolic = 125 + Math.sin(day * 0.3) * 8 + (Math.random() - 0.5) * 10;
      const baseDiastolic = 82 + Math.sin(day * 0.3) * 5 + (Math.random() - 0.5) * 6;
      const systolic = Math.round(baseSystolic);
      const diastolic = Math.round(baseDiastolic);

      metrics.push({
        id: `bp-${day}-${time}`,
        type: 'blood_pressure',
        value: systolic,
        value2: diastolic,
        unit: 'mmHg',
        timestamp: date.toISOString(),
        status: systolic > 140 || diastolic > 90 ? 'high' : systolic < 90 ? 'low' : 'normal',
      });

      const sugarBase = 5.8 + Math.sin(day * 0.2) * 0.8 + (Math.random() - 0.5) * 0.6;
      metrics.push({
        id: `bs-${day}-${time}`,
        type: 'blood_sugar',
        value: Number(sugarBase.toFixed(1)),
        unit: 'mmol/L',
        timestamp: date.toISOString(),
        status: sugarBase > 7.0 ? 'high' : sugarBase < 3.9 ? 'low' : 'normal',
      });

      const hrBase = 72 + Math.sin(day * 0.4) * 6 + (Math.random() - 0.5) * 8;
      metrics.push({
        id: `hr-${day}-${time}`,
        type: 'heart_rate',
        value: Math.round(hrBase),
        unit: '次/分',
        timestamp: date.toISOString(),
        status: hrBase > 100 ? 'high' : hrBase < 60 ? 'low' : 'normal',
      });

      const tempBase = 36.5 + (Math.random() - 0.5) * 0.4;
      metrics.push({
        id: `temp-${day}-${time}`,
        type: 'temperature',
        value: Number(tempBase.toFixed(1)),
        unit: '°C',
        timestamp: date.toISOString(),
        status: tempBase > 37.3 ? 'high' : tempBase < 36.0 ? 'low' : 'normal',
      });
    }
  }

  return metrics;
};

export const healthMetrics: HealthMetric[] = generateHealthMetrics();

export const medicationRecords: MedicationRecord[] = [
  { id: 'med-1', name: '硝苯地平缓释片', dosage: '30mg', time: '07:00', completed: true, imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200' },
  { id: 'med-2', name: '二甲双胍', dosage: '500mg', time: '08:00', completed: true, imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=200' },
  { id: 'med-3', name: '阿司匹林肠溶片', dosage: '100mg', time: '12:00', completed: false },
  { id: 'med-4', name: '复合维生素B', dosage: '1片', time: '18:00', completed: false },
  { id: 'med-5', name: '钙片', dosage: '600mg', time: '20:00', completed: false },
];

export const visitRecords: VisitRecord[] = [
  {
    id: 'visit-1',
    visitorName: '李护士',
    visitorRole: '专业照护',
    visitorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200',
    visitTime: '2026-06-12 09:00:00',
    duration: '2小时',
    notes: '今日状态良好，血压稳定，协助完成晨间护理，提醒按时服药。',
    photos: [
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
      'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400',
    ],
  },
  {
    id: 'visit-2',
    visitorName: '王阿姨',
    visitorRole: '志愿者',
    visitorAvatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200',
    visitTime: '2026-06-11 15:00:00',
    duration: '3小时',
    notes: '陪老人聊天、散步，帮忙做了晚饭，心情很好。',
    photos: ['https://images.unsplash.com/photo-1516307365426-bea591f05011?w=400'],
  },
  {
    id: 'visit-3',
    visitorName: '张医生',
    visitorRole: '家庭医生',
    visitorAvatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200',
    visitTime: '2026-06-11 10:00:00',
    duration: '1小时',
    notes: '每周例行检查，各项指标正常，调整了用药时间。',
    photos: ['https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400'],
  },
  {
    id: 'visit-4',
    visitorName: '小明',
    visitorRole: '孙子',
    visitorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    visitTime: '2026-06-10 18:00:00',
    duration: '4小时',
    notes: '周末回家探望，带了水果和新衣服。',
    photos: [
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400',
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400',
    ],
  },
  {
    id: 'visit-5',
    visitorName: '刘护工',
    visitorRole: '家政服务',
    visitorAvatar: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=200',
    visitTime: '2026-06-10 08:00:00',
    duration: '3小时',
    notes: '打扫卫生、洗衣做饭，家里整理得很干净。',
    photos: [],
  },
];

export const serviceItems: ServiceItem[] = [
  { id: 'svc-1', category: 'nursing', name: '上门护理', description: '专业护士上门，提供基础护理、伤口换药、生命体征监测等服务', pricePerHour: 120, minHours: 2, icon: 'stethoscope', available: true },
  { id: 'svc-2', category: 'rehabilitation', name: '康复训练', description: '康复治疗师上门，进行肢体康复、言语训练、理疗按摩等', pricePerHour: 180, minHours: 1, icon: 'dumbbell', available: true },
  { id: 'svc-3', category: 'bathing', name: '助浴服务', description: '专业助浴师携带设备上门，提供安全舒适的洗浴服务', pricePerHour: 150, minHours: 2, icon: 'shower-head', available: true },
  { id: 'svc-4', category: 'bathing', name: '居家保洁', description: '深度清洁、整理收纳、衣物清洗等家政服务', pricePerHour: 60, minHours: 2, icon: 'sparkles', available: true },
  { id: 'svc-5', category: 'companion', name: '陪诊服务', description: '专人陪同就医、代取药品、协助沟通、取报告等', pricePerHour: 100, minHours: 3, icon: 'heart-handshake', available: true },
  { id: 'svc-6', category: 'companion', name: '陪伴照料', description: '陪伴聊天、散步、读书读报、心理慰藉等', pricePerHour: 50, minHours: 2, icon: 'users', available: true },
  { id: 'svc-7', category: 'other', name: '代购代办', description: '代购生活用品、代缴费用、代办手续等', pricePerHour: 40, minHours: 1, icon: 'shopping-bag', available: true },
  { id: 'svc-8', category: 'rehabilitation', name: '中医理疗', description: '中医师上门，提供艾灸、拔罐、推拿按摩等理疗服务', pricePerHour: 200, minHours: 1, icon: 'flower-2', available: true },
];

const generateBookings = (): ServiceBookingRecord[] => {
  const bookings: ServiceBookingRecord[] = [];
  const now = new Date();
  const statuses: BookingStatus[] = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
  const caregiverNames = ['李护士', '王护士', '张治疗师', '刘护工', '陈阿姨'];

  for (let i = 0; i < 20; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + Math.floor((i - 5) * 1.5));
    const dateStr = date.toISOString().split('T')[0];
    const hours = 8 + (i % 8) * 2;
    const timeStr = `${hours.toString().padStart(2, '0')}:00`;

    const status = i < 5 ? statuses[i % 5] : 'completed';
    const duration = [1, 2, 2, 3, 4][i % 5];
    const svc = serviceItems[i % serviceItems.length];
    const amount = svc.pricePerHour * duration;

    bookings.push({
      id: `booking-${String(i + 1).padStart(4, '0')}`,
      serviceId: svc.id,
      serviceName: svc.name,
      scheduledDate: dateStr,
      scheduledTime: timeStr,
      duration,
      totalAmount: amount,
      status,
      caregiverName: status !== 'pending' && status !== 'cancelled' ? caregiverNames[i % caregiverNames.length] : undefined,
      createdAt: new Date(date.getTime() - 86400000 * 3).toISOString(),
      photos: status === 'completed' && i % 3 === 0 ? [
        `https://images.unsplash.com/photo-${1576091160399 + i * 1000}?w=400`,
      ] : undefined,
      rating: status === 'completed' && i % 2 === 0 ? 4 + (i % 2) : undefined,
    });
  }

  return bookings.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
};

export const serviceBookings: ServiceBookingRecord[] = generateBookings();

export const notifications: Notification[] = [
  { id: 'notif-1', type: 'warning', title: '⚠️ 血压偏高提醒', content: '王秀兰女士 14:30 测量血压为 148/95 mmHg，略高于正常范围，建议关注。', timestamp: '2026-06-12 14:35:00', read: false },
  { id: 'notif-2', type: 'service', title: '✅ 上门护理服务已完成', content: '李护士已于 11:00 完成今日上门护理服务，服务时长 2 小时。', timestamp: '2026-06-12 11:05:00', read: false, metadata: { ratingPending: true } },
  { id: 'notif-3', type: 'photo', title: '📷 服务现场照片已上传', content: '李护士上传了 2 张服务现场照片，点击查看详情。', timestamp: '2026-06-12 11:10:00', read: false, metadata: { photos: 2 } },
  { id: 'notif-4', type: 'system', title: '💊 午间用药提醒', content: '王秀兰女士需要在 12:00 服用阿司匹林肠溶片 100mg。', timestamp: '2026-06-12 11:45:00', read: true },
  { id: 'notif-5', type: 'warning', title: '⚠️ 未检测到活动', content: '过去 2 小时未检测到活动信号，请确认老人安全。', timestamp: '2026-06-12 10:00:00', read: true },
  { id: 'notif-6', type: 'service', title: '📅 预约确认通知', content: '您预约的 6月15日 10:00 康复训练服务已确认，由张治疗师提供服务。', timestamp: '2026-06-12 09:30:00', read: true },
  { id: 'notif-7', type: 'system', title: '💳 充值成功', content: '您已成功充值 ¥500.00，当前账户余额 ¥1,280.00。', timestamp: '2026-06-11 20:00:00', read: true },
  { id: 'notif-8', type: 'service', title: '✅ 陪诊服务已完成', content: '王阿姨已于昨日 16:30 完成陪诊服务，已代取所有药品。', timestamp: '2026-06-11 16:45:00', read: true, metadata: { ratingPending: false } },
  { id: 'notif-9', type: 'photo', title: '📷 家属探访照片', content: '小明上传了 3 张昨日家庭聚会照片，快去看看吧！', timestamp: '2026-06-10 21:00:00', read: true, metadata: { photos: 3 } },
  { id: 'notif-10', type: 'warning', title: '⚠️ 漏药提醒', content: '王秀兰女士 昨日20:00 的钙片尚未服用，请提醒老人。', timestamp: '2026-06-10 21:30:00', read: true },
  { id: 'notif-11', type: 'system', title: '🎂 生日祝福', content: '明天是父亲的生日，别忘了送上祝福哦！', timestamp: '2026-06-09 09:00:00', read: true },
  { id: 'notif-12', type: 'service', title: '🔄 服务取消通知', content: '您预约的 6月8日 助浴服务已按要求取消，费用已原路退回。', timestamp: '2026-06-07 15:00:00', read: true },
  { id: 'notif-13', type: 'system', title: '🏥 体检预约提醒', content: '您预约的 6月20日 年度体检服务，请提前做好准备。', timestamp: '2026-06-06 10:00:00', read: true },
  { id: 'notif-14', type: 'warning', title: '⚠️ 心率异常', content: '6月5日 凌晨 03:20 检测到心率 52次/分，略低。', timestamp: '2026-06-05 03:25:00', read: true },
  { id: 'notif-15', type: 'service', title: '⭐ 服务评价邀请', content: '您对最近一次康复训练服务满意吗？欢迎评价！', timestamp: '2026-06-04 18:00:00', read: true, metadata: { ratingPending: true } },
];

const generateTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  let balance = 780;
  const now = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const rand = Math.random();
    let type: 'recharge' | 'deduct' | 'refund';
    let amount: number;
    let description: string;
    let paymentMethod: string | undefined;

    if (rand < 0.2 || i === 7 || i === 21) {
      type = 'recharge';
      amount = [200, 500, 500, 1000][Math.floor(Math.random() * 4)];
      balance += amount;
      description = `账户充值 - ${['微信支付', '支付宝', '银行卡'][Math.floor(Math.random() * 3)]}`;
      paymentMethod = ['wechat', 'alipay', 'bank'][Math.floor(Math.random() * 3)];
    } else if (rand > 0.92) {
      type = 'refund';
      amount = [60, 120, 150, 200][Math.floor(Math.random() * 4)];
      balance += amount;
      description = `服务退款 - ${serviceItems[i % serviceItems.length].name}取消`;
    } else {
      type = 'deduct';
      const svc = serviceItems[i % serviceItems.length];
      const duration = [1, 2, 2, 3, 4][i % 5];
      amount = svc.pricePerHour * duration;
      balance = Math.max(0, balance - amount);
      description = `服务扣费 - ${svc.name}(${duration}小时)`;
    }

    transactions.push({
      id: `txn-${String(10000 - i).padStart(6, '0')}`,
      type,
      amount,
      balanceAfter: balance,
      description,
      orderNo: type !== 'recharge' ? `ORD${Date.now() - i * 86400000}` : undefined,
      paymentMethod,
      status: 'success',
      createdAt: date.toISOString(),
    });
  }

  return transactions;
};

export const transactions: Transaction[] = generateTransactions();

export const emergencyContacts: EmergencyContact[] = [
  { id: 'contact-1', name: '王晓梅', relationship: '女儿', phone: '138****1234', priority: 1, enabled: true },
  { id: 'contact-2', name: '王建国', relationship: '儿子', phone: '139****5678', priority: 2, enabled: true },
  { id: 'contact-3', name: '李明', relationship: '女婿', phone: '137****9012', priority: 3, enabled: true },
  { id: 'contact-4', name: '张医生', relationship: '家庭医生', phone: '136****3456', priority: 4, enabled: false },
];

export const caregiverAuthorizations: CaregiverAuthorization[] = [
  {
    id: 'auth-1',
    caregiverName: '李护士',
    caregiverPhone: '135****7890',
    permissions: {
      healthData: true,
      location: true,
      serviceRecords: true,
      billingInfo: false,
    },
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    enabled: true,
  },
  {
    id: 'auth-2',
    caregiverName: '王阿姨',
    caregiverPhone: '134****2345',
    permissions: {
      healthData: false,
      location: true,
      serviceRecords: true,
      billingInfo: false,
    },
    validFrom: '2026-03-15',
    validTo: '2026-09-15',
    enabled: true,
  },
];

export const accountBalance = 1280.00;
export const totalRecharge = 5800.00;
export const totalConsume = 4520.00;

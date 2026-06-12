export interface ElderInfo {
  id: string;
  name: string;
  avatar: string;
  age: number;
  location: string;
  lastCheckIn: {
    time: string;
    place: string;
    status: 'normal' | 'warning';
  };
}

export type HealthMetricType = 'blood_pressure' | 'blood_sugar' | 'heart_rate' | 'temperature';

export interface HealthMetric {
  id: string;
  type: HealthMetricType;
  value: number;
  value2?: number;
  unit: string;
  timestamp: string;
  status: 'normal' | 'high' | 'low';
}

export interface MedicationRecord {
  id: string;
  name: string;
  dosage: string;
  time: string;
  completed: boolean;
  imageUrl?: string;
}

export interface VisitRecord {
  id: string;
  visitorName: string;
  visitorRole: string;
  visitorAvatar: string;
  visitTime: string;
  duration: string;
  notes: string;
  photos: string[];
}

export type ServiceCategory = 'nursing' | 'rehabilitation' | 'bathing' | 'companion' | 'other';

export interface ServiceItem {
  id: string;
  category: ServiceCategory;
  name: string;
  description: string;
  pricePerHour: number;
  minHours: number;
  icon: string;
  available: boolean;
}

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface ServiceBookingRecord {
  id: string;
  serviceId: string;
  serviceName: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  totalAmount: number;
  originalAmount?: number;
  discountAmount?: number;
  status: BookingStatus;
  caregiverName?: string;
  createdAt: string;
  photos?: string[];
  rating?: number;
  transactionId?: string;
  refundTransactionId?: string;
}

export type NotificationType = 'warning' | 'service' | 'system' | 'photo';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  timestamp: string;
  read: boolean;
  metadata?: Record<string, any>;
}

export type TransactionType = 'recharge' | 'deduct' | 'refund';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  orderNo?: string;
  paymentMethod?: string;
  status: 'success' | 'pending' | 'failed';
  createdAt: string;
  bookingId?: string;
  originalAmount?: number;
  discountAmount?: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  priority: number;
  enabled: boolean;
}

export interface CaregiverPermissions {
  healthData: boolean;
  location: boolean;
  serviceRecords: boolean;
  billingInfo: boolean;
}

export interface CaregiverAuthorization {
  id: string;
  caregiverName: string;
  caregiverPhone: string;
  permissions: CaregiverPermissions;
  validFrom: string;
  validTo: string;
  enabled: boolean;
}

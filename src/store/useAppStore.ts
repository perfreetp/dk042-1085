import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  elderInfo as initialElderInfo,
  healthMetrics as initialHealthMetrics,
  medicationRecords as initialMedications,
  visitRecords as initialVisits,
  serviceItems as initialServiceItems,
  serviceBookings as initialBookings,
  notifications as initialNotifications,
  transactions as initialTransactions,
  emergencyContacts as initialContacts,
  caregiverAuthorizations as initialAuths,
  accountBalance as initialBalance,
  totalRecharge as initialTotalRecharge,
  totalConsume as initialTotalConsume,
} from '../data/mockData';
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
} from '../types';

interface AppState {
  elderInfo: ElderInfo;
  healthMetrics: HealthMetric[];
  medicationRecords: MedicationRecord[];
  visitRecords: VisitRecord[];
  serviceItems: ServiceItem[];
  serviceBookings: ServiceBookingRecord[];
  notifications: Notification[];
  transactions: Transaction[];
  emergencyContacts: EmergencyContact[];
  caregiverAuthorizations: CaregiverAuthorization[];
  accountBalance: number;
  totalRecharge: number;
  totalConsume: number;
  unreadCount: number;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  toggleMedication: (id: string) => void;
  addBooking: (booking: Omit<ServiceBookingRecord, 'id' | 'createdAt'> & { actualPayAmount?: number }) => void;
  cancelBooking: (id: string) => void;
  rateBooking: (id: string, rating: number) => void;
  toggleContactEnabled: (id: string) => void;
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  deleteEmergencyContact: (id: string) => void;
  toggleCaregiverEnabled: (id: string) => void;
  updateCaregiverPermission: (id: string, key: keyof CaregiverAuthorization['permissions'], value: boolean) => void;
  rechargeAccount: (amount: number, method: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      elderInfo: initialElderInfo,
      healthMetrics: initialHealthMetrics,
      medicationRecords: initialMedications,
      visitRecords: initialVisits,
      serviceItems: initialServiceItems,
      serviceBookings: initialBookings,
      notifications: initialNotifications,
      transactions: initialTransactions,
      emergencyContacts: initialContacts,
      caregiverAuthorizations: initialAuths,
      accountBalance: initialBalance,
      totalRecharge: initialTotalRecharge,
      totalConsume: initialTotalConsume,
      unreadCount: initialNotifications.filter((n) => !n.read).length,

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        })),

      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),

      toggleMedication: (id) =>
        set((state) => ({
          medicationRecords: state.medicationRecords.map((m) =>
            m.id === id ? { ...m, completed: !m.completed } : m
          ),
        })),

      addBooking: (booking) =>
        set((state) => {
          const actualPay = booking.actualPayAmount ?? booking.totalAmount;
          return {
            serviceBookings: [
              {
                ...booking,
                totalAmount: actualPay,
                id: `booking-${Date.now()}`,
                createdAt: new Date().toISOString(),
              },
              ...state.serviceBookings,
            ],
            transactions: [
              {
                id: `txn-${Date.now()}`,
                type: 'deduct' as const,
                amount: actualPay,
                balanceAfter: state.accountBalance - actualPay,
                description: `服务扣费 - ${booking.serviceName}(${booking.duration}小时)${booking.actualPayAmount !== undefined && booking.actualPayAmount < booking.totalAmount ? '（已享优惠）' : ''}`,
                orderNo: `ORD${Date.now()}`,
                status: 'success' as const,
                createdAt: new Date().toISOString(),
              },
              ...state.transactions,
            ],
            accountBalance: state.accountBalance - actualPay,
            totalConsume: state.totalConsume + actualPay,
          };
        }),

      cancelBooking: (id) =>
        set((state) => {
          const booking = state.serviceBookings.find((b) => b.id === id);
          if (!booking || booking.status === 'cancelled' || booking.status === 'completed') return state;
          return {
            serviceBookings: state.serviceBookings.map((b) =>
              b.id === id ? { ...b, status: 'cancelled' as const } : b
            ),
            transactions: [
              {
                id: `txn-${Date.now()}`,
                type: 'refund' as const,
                amount: booking.totalAmount,
                balanceAfter: state.accountBalance + booking.totalAmount,
                description: `服务退款 - ${booking.serviceName}取消`,
                orderNo: `REF${Date.now()}`,
                status: 'success' as const,
                createdAt: new Date().toISOString(),
              },
              ...state.transactions,
            ],
            accountBalance: state.accountBalance + booking.totalAmount,
            totalConsume: Math.max(0, state.totalConsume - booking.totalAmount),
          };
        }),

      rateBooking: (id, rating) =>
        set((state) => ({
          serviceBookings: state.serviceBookings.map((b) =>
            b.id === id ? { ...b, rating } : b
          ),
        })),

      toggleContactEnabled: (id) =>
        set((state) => ({
          emergencyContacts: state.emergencyContacts.map((c) =>
            c.id === id ? { ...c, enabled: !c.enabled } : c
          ),
        })),

      addEmergencyContact: (contact) =>
        set((state) => ({
          emergencyContacts: [
            ...state.emergencyContacts,
            { ...contact, id: `contact-${Date.now()}` },
          ],
        })),

      deleteEmergencyContact: (id) =>
        set((state) => ({
          emergencyContacts: state.emergencyContacts.filter((c) => c.id !== id),
        })),

      toggleCaregiverEnabled: (id) =>
        set((state) => ({
          caregiverAuthorizations: state.caregiverAuthorizations.map((a) =>
            a.id === id ? { ...a, enabled: !a.enabled } : a
          ),
        })),

      updateCaregiverPermission: (id, key, value) =>
        set((state) => ({
          caregiverAuthorizations: state.caregiverAuthorizations.map((a) =>
            a.id === id
              ? { ...a, permissions: { ...a.permissions, [key]: value } }
              : a
          ),
        })),

      rechargeAccount: (amount, method) =>
        set((state) => ({
          accountBalance: state.accountBalance + amount,
          totalRecharge: state.totalRecharge + amount,
          transactions: [
            {
              id: `txn-${Date.now()}`,
              type: 'recharge' as const,
              amount,
              balanceAfter: state.accountBalance + amount,
              description: `账户充值 - ${method}`,
              paymentMethod: method,
              status: 'success' as const,
              createdAt: new Date().toISOString(),
            },
            ...state.transactions,
          ],
        })),
    }),
    {
      name: 'elderly-care-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        medicationRecords: state.medicationRecords,
        serviceBookings: state.serviceBookings,
        notifications: state.notifications,
        transactions: state.transactions,
        emergencyContacts: state.emergencyContacts,
        caregiverAuthorizations: state.caregiverAuthorizations,
        accountBalance: state.accountBalance,
        totalRecharge: state.totalRecharge,
        totalConsume: state.totalConsume,
        unreadCount: state.unreadCount,
      }),
    }
  )
);

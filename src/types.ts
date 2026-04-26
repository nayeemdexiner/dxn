export type OrderStatus = 'pending' | 'delivered';
export type PaymentStatus = 'due' | 'paid';

export interface Order {
  id?: number;
  memoNo: string;
  orderDate: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  productDescription: string;
  quantity: number;
  rate: number;
  totalAmount: number;
  advanceAmount: number;
  dueAmount: number;
  seenDate: string;
  seenReminderTime: string;
  deliveryDate: string;
  deliveryReminderTime: string;
  note: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  id: number;
  shopName: string;
  shopLogo?: string;
  phoneNumbers: string;
  address: string;
  defaultSeenTime: string;
  defaultDeliveryTime: string;
  language: 'en' | 'bn';
  currency: string;
}

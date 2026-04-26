import Dexie, { type Table } from 'dexie';
import { Order, AppSettings } from '../types';

export class AppDatabase extends Dexie {
  orders!: Table<Order>;
  settings!: Table<AppSettings>;

  constructor() {
    super('DoorMemoDB');
    this.version(1).stores({
      orders: '++id, memoNo, customerPhone, customerName, orderDate, seenDate, deliveryDate, orderStatus, paymentStatus, createdAt',
      settings: 'id'
    });
  }
}

export const db = new AppDatabase();

// Initial settings
export const DEFAULT_SETTINGS: AppSettings = {
  id: 1,
  shopName: 'Chittagong Door Store',
  phoneNumbers: '01XXXXXXXXX',
  address: 'Chittagong, Bangladesh',
  defaultSeenTime: '09:00',
  defaultDeliveryTime: '09:00',
  language: 'bn',
  currency: '৳',
};

export async function initSettings() {
  const settings = await db.settings.get(1);
  if (!settings) {
    await db.settings.add(DEFAULT_SETTINGS);
  }
}

import { db } from './db';
import { Order } from '../types';

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  
  if (Notification.permission === 'granted') return true;
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function showNotification(title: string, body: string, data?: any) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: data?.memoNo || 'reminder',
    });
  }
}

export async function checkUpcomingReminders(onTrigger: (order: Order, type: 'seen' | 'delivery') => void) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

  const orders = await db.orders
    .where('orderStatus')
    .equals('pending')
    .toArray();

  orders.forEach(order => {
    // Check Seen Date
    if (order.seenDate === today && order.seenReminderTime <= currentTime) {
      const storageKey = `reminder_seen_${order.id}_${today}`;
      if (!localStorage.getItem(storageKey)) {
        onTrigger(order, 'seen');
        showNotification(
          `Seen Reminder: Memo #${order.memoNo}`,
          `Customer: ${order.customerName}\nItem: ${order.productDescription}`,
          order
        );
        localStorage.setItem(storageKey, 'true');
      }
    }

    // Check Delivery Date
    if (order.deliveryDate === today && order.deliveryReminderTime <= currentTime) {
      const storageKey = `reminder_delivery_${order.id}_${today}`;
      if (!localStorage.getItem(storageKey)) {
        onTrigger(order, 'delivery');
        showNotification(
          `Delivery Reminder: Memo #${order.memoNo}`,
          `Customer: ${order.customerName}\nItem: ${order.productDescription}`,
          order
        );
        localStorage.setItem(storageKey, 'true');
      }
    }
  });
}

export function playAlarmSound() {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  audio.loop = true;
  audio.play().catch(e => console.error("Audio play failed:", e));
  return audio;
}

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../lib/db';
import { Order } from '../types';
import { cn } from '../lib/utils';
import { Save, X, Calculator, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OrderForm({ orderId }: { orderId?: number }) {
  const { t, setCurrentPage, settings } = useApp();
  
  const [formData, setFormData] = useState<Partial<Order>>({
    memoNo: '',
    orderDate: new Date().toISOString().split('T')[0],
    customerName: '',
    customerAddress: '',
    customerPhone: '',
    productDescription: '',
    quantity: 1,
    rate: 0,
    totalAmount: 0,
    advanceAmount: 0,
    dueAmount: 0,
    seenDate: '',
    seenReminderTime: settings?.defaultSeenTime || '09:00',
    deliveryDate: '',
    deliveryReminderTime: settings?.defaultDeliveryTime || '09:00',
    note: '',
    paymentStatus: 'due',
    orderStatus: 'pending',
  });

  useEffect(() => {
    if (orderId) {
      db.orders.get(orderId).then(order => {
        if (order) setFormData(order);
      });
    }
  }, [orderId]);

  // Handle auto-calculations
  useEffect(() => {
    const total = (formData.quantity || 0) * (formData.rate || 0);
    const due = total - (formData.advanceAmount || 0);
    setFormData(prev => ({
      ...prev,
      totalAmount: total,
      dueAmount: Math.max(0, due),
      paymentStatus: due <= 0 ? 'paid' : 'due'
    }));
  }, [formData.quantity, formData.rate, formData.advanceAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    const orderData: Order = {
      ...formData as Order,
      createdAt: orderId ? formData.createdAt! : now,
      updatedAt: now,
    };

    if (orderId) {
      await db.orders.update(orderId, orderData);
    } else {
      await db.orders.add(orderData);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    setCurrentPage('allOrders');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const FormField = ({ label, name, type = "text", placeholder = "", required = false, icon: Icon }: any) => (
    <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
        {Icon && <Icon size={12} />}
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={(formData as any)[name] || ''}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-lg font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-300"
      />
    </div>
  );

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100 mb-8 border-t-8 border-t-blue-600">
      <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {orderId ? t.edit : t.newOrder}
          </h2>
          <p className="text-slate-400 text-sm font-medium">Digital Memo Generation</p>
        </div>
        <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl font-bold text-sm">
          #{formData.memoNo || '----'}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Basic Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label={t.memoNo} name="memoNo" placeholder="E.g. 1001" required />
          <FormField label={t.orderDate} name="orderDate" type="date" required />
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">{t.status}</label>
            <select 
              name="orderStatus" 
              value={formData.orderStatus} 
              onChange={handleChange}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-lg font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
            >
              <option value="pending">{t.pending}</option>
              <option value="delivered">{t.delivered}</option>
            </select>
          </div>
        </div>

        {/* Customer Section */}
        <div className="bg-slate-50/30 p-6 rounded-[2rem] border border-slate-100">
          <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
             Customer Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label={t.customerName} name="customerName" placeholder="Enter full name" required />
            <FormField label={t.phone} name="customerPhone" placeholder="Mobile number" required />
            <div className="md:col-span-2">
              <FormField label={t.address} name="customerAddress" placeholder="Customer location..." />
            </div>
          </div>
        </div>

        {/* Product Section */}
        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">{t.particulars}</label>
            <textarea
              name="productDescription"
              value={formData.productDescription}
              onChange={handleChange}
              rows={3}
              placeholder="Describe the items (e.g. 3.5ft x 7ft Segun Door)"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-lg font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-end">
            <FormField label={t.qty} name="quantity" type="number" />
            <FormField label={t.rate} name="rate" type="number" />
            <div className="space-y-1.5 opacity-60">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">{t.total}</label>
              <div className="bg-slate-100 border-2 border-slate-200 rounded-2xl px-4 py-3 text-lg font-bold text-slate-600">
                {formData.totalAmount}
              </div>
            </div>
            <FormField label={t.advance} name="advanceAmount" type="number" />
          </div>

          <div className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500 text-white rounded-2xl">
                <Calculator size={24} />
              </div>
              <div>
                <p className="text-rose-400 text-xs font-bold uppercase tracking-wider">{t.due}</p>
                <p className="text-3xl font-black text-rose-600">{formData.dueAmount}</p>
              </div>
            </div>
            <div className={cn(
              "px-6 py-2 rounded-full font-bold text-sm shadow-sm",
              formData.paymentStatus === 'paid' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
            )}>
              {formData.paymentStatus === 'paid' ? t.paid : t.due_status}
            </div>
          </div>
        </div>

        {/* Reminders Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
            <h4 className="flex items-center gap-2 text-slate-800 font-bold mb-4">
              <Calendar size={18} className="text-blue-500" />
              Seen Date & Time
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Date" name="seenDate" type="date" />
              <FormField label="Time" name="seenReminderTime" type="time" />
            </div>
          </div>
          <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
            <h4 className="flex items-center gap-2 text-slate-800 font-bold mb-4">
              <Calendar size={18} className="text-indigo-500" />
              Delivery Date & Time
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Date" name="deliveryDate" type="date" />
              <FormField label="Time" name="deliveryReminderTime" type="time" />
            </div>
          </div>
        </div>

        <div className="space-y-1.5 text-blue-600">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400">{t.note}</label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-lg font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>

        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={() => setCurrentPage('allOrders')}
            className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <X size={20} />
            {t.cancel}
          </button>
          <button
            type="submit"
            className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {t.save}
          </button>
        </div>
      </form>
    </div>
  );
}

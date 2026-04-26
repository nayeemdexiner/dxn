import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { 
  Search, 
  Filter, 
  Phone, 
  MapPin, 
  Calendar, 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { OrderStatus, PaymentStatus } from '../types';

export default function OrderList({ 
  initialStatus = 'all', 
  initialPayment = 'all' 
}: { 
  initialStatus?: OrderStatus | 'all' | 'todaySeen' | 'todayDelivery', 
  initialPayment?: PaymentStatus | 'all' 
}) {
  const { t, setCurrentPage } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<typeof initialStatus>(initialStatus);
  const [paymentFilter, setPaymentFilter] = useState<typeof initialPayment>(initialPayment);

  const orders = useLiveQuery(async () => {
    let collection = db.orders.orderBy('createdAt').reverse();
    const all = await collection.toArray();
    const today = new Date().toISOString().split('T')[0];
    
    return all.filter(o => {
      const matchesSearch = 
        o.memoNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerPhone.includes(searchTerm);
      
      let matchesStatus = true;
      if (statusFilter === 'todaySeen') {
        matchesStatus = o.seenDate === today;
      } else if (statusFilter === 'todayDelivery') {
        matchesStatus = o.deliveryDate === today;
      } else if (statusFilter !== 'all') {
        matchesStatus = o.orderStatus === statusFilter;
      }

      const matchesPayment = paymentFilter === 'all' || o.paymentStatus === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [searchTerm, statusFilter, paymentFilter]);

  const handleDelete = async (id: number) => {
    if (window.confirm(t.confirmDelete)) {
      await db.orders.delete(id);
    }
  };

  const toggleOrderStatus = async (id: number, currentStatus: OrderStatus) => {
    const newStatus = currentStatus === 'pending' ? 'delivered' : 'pending';
    await db.orders.update(id, { orderStatus: newStatus, updatedAt: Date.now() });
  };

  const markAsPaid = async (id: number) => {
    const order = await db.orders.get(id);
    if (order) {
      await db.orders.update(id, { 
        paymentStatus: 'paid', 
        dueAmount: 0, 
        advanceAmount: order.totalAmount, 
        updatedAt: Date.now() 
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Search & Filter Header */}
      <div className="bg-white p-4 lg:p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-4 sticky top-20 z-10">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-lg font-medium outline-none transition-all"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-100 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 outline-none border-2 border-transparent focus:border-blue-500 min-w-max"
          >
            <option value="all">{t.status}: {t.allOrders}</option>
            <option value="pending">{t.pending}</option>
            <option value="delivered">{t.delivered}</option>
            <option value="todaySeen">{t.todaySeen}</option>
            <option value="todayDelivery">{t.todayDelivery}</option>
          </select>
          <select 
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            className="bg-slate-100 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 outline-none border-2 border-transparent focus:border-blue-500 min-w-max"
          >
            <option value="all">{t.payment}: {t.allOrders}</option>
            <option value="due">{t.due_status}</option>
            <option value="paid">{t.paid}</option>
          </select>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
        {orders?.map((order) => (
          <div 
            key={order.id} 
            className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden group hover:shadow-xl hover:shadow-slate-100 transition-all duration-300"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 flex items-center justify-center rounded-2xl font-bold text-lg">
                    #{order.memoNo}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                      {order.customerName}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-slate-400 font-bold uppercase tracking-wider">
                      <Clock size={12} />
                      {new Date(order.orderDate).toLocaleDateString('bn-BD')}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <div className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter",
                    order.orderStatus === 'pending' ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                  )}>
                    {order.orderStatus === 'pending' ? t.pending : t.delivered}
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter",
                    order.paymentStatus === 'paid' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                  )}>
                    {order.paymentStatus === 'paid' ? t.paid : t.due_status}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Phone size={16} /></div>
                    <span className="font-bold">{order.customerPhone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><MapPin size={16} /></div>
                    <span className="text-sm">{order.customerAddress || 'No address provided'}</span>
                  </div>
                </div>

                <div className="space-y-3 border-l border-slate-100 lg:pl-6 px-0">
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-500"><Calendar size={16} /></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{t.seenDate}</p>
                      <span className="font-bold text-sm">{order.seenDate ? new Date(order.seenDate).toLocaleDateString('bn-BD') : '-'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500"><Calendar size={16} /></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{t.deliveryDate}</p>
                      <span className="font-bold text-sm">{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('bn-BD') : '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.due}</p>
                  <p className="text-3xl font-black text-rose-600">{formatCurrency(order.dueAmount)}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 lg:gap-3 pt-6 border-t border-slate-50">
                <button 
                  onClick={() => setCurrentPage(`viewMemo:${order.id}`)}
                  className="flex-1 min-w-[140px] bg-blue-600 text-white px-4 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-100 active:scale-95 transition-all"
                >
                  <Eye size={18} /> {t.print}
                </button>
                <button 
                  onClick={() => setCurrentPage(`editOrder:${order.id}`)}
                  className="bg-slate-100 text-slate-600 p-3 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(order.id!)}
                  className="bg-rose-50 text-rose-600 p-3 rounded-xl hover:bg-rose-100 transition-colors"
                >
                  <Trash2 size={18} />
                </button>

                <div className="flex-1 flex gap-2 ml-auto">
                    <button 
                      onClick={() => toggleOrderStatus(order.id!, order.orderStatus)}
                      className={cn(
                        "flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors",
                        order.orderStatus === 'pending' ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                      )}
                    >
                      {order.orderStatus === 'pending' ? t.delivered : t.pending}
                    </button>
                  {order.paymentStatus === 'due' && (
                    <button 
                      onClick={() => markAsPaid(order.id!)}
                      className="flex-1 bg-amber-50 text-amber-600 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-amber-100 transition-colors"
                    >
                      {t.paid}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {(!orders || orders.length === 0) && (
          <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-400">No orders found</h3>
            <p className="text-slate-300">Try adjusting your filters or search term</p>
          </div>
        )}
      </div>
    </div>
  );
}

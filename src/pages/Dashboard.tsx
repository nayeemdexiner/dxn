import React from 'react';
import { useApp } from '../context/AppContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  TrendingUp,
  Bell,
  Truck
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export default function Dashboard() {
  const { t, setCurrentPage } = useApp();
  const orders = useLiveQuery(() => db.orders.toArray());

  const today = new Date().toISOString().split('T')[0];

  const stats = React.useMemo(() => {
    if (!orders) return null;
    return {
      total: orders.length,
      pending: orders.filter(o => o.orderStatus === 'pending').length,
      delivered: orders.filter(o => o.orderStatus === 'delivered').length,
      due: orders.filter(o => o.paymentStatus === 'due').length,
      paid: orders.filter(o => o.paymentStatus === 'paid').length,
      todaySeen: orders.filter(o => o.seenDate === today).length,
      todayDelivery: orders.filter(o => o.deliveryDate === today).length,
      totalDue: orders.reduce((acc, o) => acc + o.dueAmount, 0),
      totalSale: orders.reduce((acc, o) => acc + o.totalAmount, 0),
    };
  }, [orders, today]);

  if (!stats) return null;

  const quickStats = [
    { label: t.totalOrders, value: stats.total, icon: Package, color: 'bg-indigo-500' },
    { label: t.pendingOrders, value: stats.pending, icon: Clock, color: 'bg-amber-500' },
    { label: t.deliveredOrders, value: stats.delivered, icon: CheckCircle2, color: 'bg-emerald-500' },
    { label: t.dueOrders, value: stats.due, icon: AlertCircle, color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{t.totalSale}</p>
            <h3 className="text-3xl font-bold text-slate-900">{formatCurrency(stats.totalSale)}</h3>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
            <TrendingUp size={28} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{t.totalDue}</p>
            <h3 className="text-3xl font-bold text-rose-600">{formatCurrency(stats.totalDue)}</h3>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <CreditCard size={28} />
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, i) => (
          <button 
            key={i} 
            onClick={() => {
              if (stat.label === t.totalOrders) setCurrentPage('allOrders:all:all');
              if (stat.label === t.pendingOrders) setCurrentPage('allOrders:pending:all');
              if (stat.label === t.deliveredOrders) setCurrentPage('allOrders:delivered:all');
              if (stat.label === t.dueOrders) setCurrentPage('allOrders:all:due');
            }}
            className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-3 text-left hover:border-blue-200 hover:shadow-md transition-all active:scale-95"
          >
            <div className={`w-10 h-10 ${stat.color} text-white rounded-xl flex items-center justify-center shadow-lg shadow-opacity-20`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Reminders Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={() => setCurrentPage('allOrders:todaySeen:all')} 
          className="bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-100 text-white flex items-center justify-between group overflow-hidden relative active:scale-95 transition-all text-left"
        >
          <div className="relative z-10">
            <p className="text-blue-100 font-medium mb-1">{t.todaySeen}</p>
            <h4 className="text-4xl font-bold">{stats.todaySeen}</h4>
          </div>
          <Bell size={64} className="text-white/20 absolute -right-4 -bottom-4 rotate-12 group-hover:scale-110 transition-transform" />
          <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
            {t.viewAll || 'View List'}
          </div>
        </button>

        <button 
          onClick={() => setCurrentPage('allOrders:todayDelivery:all')}
          className="bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-100 text-white flex items-center justify-between group overflow-hidden relative active:scale-95 transition-all text-left"
        >
          <div className="relative z-10">
            <p className="text-indigo-100 font-medium mb-1">{t.todayDelivery}</p>
            <h4 className="text-4xl font-bold">{stats.todayDelivery}</h4>
          </div>
          <Truck size={64} className="text-white/20 absolute -right-4 -bottom-4 rotate-12 group-hover:scale-110 transition-transform" />
          <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
            {t.viewAll || 'View List'}
          </div>
        </button>
      </div>

      {/* Call to Action */}
      <div className="pt-4">
        <button 
          onClick={() => setCurrentPage('newOrder')}
          className="w-full bg-slate-900 text-white py-6 rounded-3xl font-bold text-xl shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
        >
          <PlusSquare size={28} />
          {t.newOrder}
        </button>
      </div>
    </div>
  );
}

const PlusSquare = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

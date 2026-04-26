import React, { useEffect, useRef } from 'react';
import { Order } from '../types';
import { useApp } from '../context/AppContext';
import { Bell, MapPin, Phone, User, Clock, CheckCircle2 } from 'lucide-react';
import { db } from '../lib/db';
import { playAlarmSound } from '../lib/reminderService';
import { motion } from 'motion/react';

interface AlarmModalProps {
  order: Order;
  type: 'seen' | 'delivery';
  onClose: () => void;
}

export default function AlarmModal({ order, type, onClose }: AlarmModalProps) {
  const { t, setCurrentPage } = useApp();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = playAlarmSound();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const markAsDone = async () => {
    if (type === 'delivery') {
      await db.orders.update(order.id!, { orderStatus: 'delivered' });
    }
    onClose();
  };

  const handleSnooze = (minutes: number) => {
    console.log(`Snoozed for ${minutes} mins`);
    // In a real app we'd update a 'nextReminder' field, but for now we just clear the lock
    const today = new Date().toISOString().split('T')[0];
    localStorage.removeItem(`reminder_${type}_${order.id}_${today}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-rose-600/90 backdrop-blur-md animate-pulse" />
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 overflow-hidden border-4 border-white"
      >
        <div className="bg-slate-900 p-8 text-white text-center">
          <div className="bg-rose-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce shadow-lg shadow-rose-500/50">
            <Bell size={40} />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">
            {type === 'seen' ? 'Today Seen Alert!' : 'Delivery Alert!'}
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">Memo #{order.memoNo}</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
              <div className="p-3 bg-white text-blue-600 rounded-xl shadow-sm"><User size={24} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</p>
                <p className="text-xl font-bold text-slate-900">{order.customerName}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
              <div className="p-3 bg-white text-indigo-600 rounded-xl shadow-sm"><Phone size={24} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                <p className="text-xl font-bold text-slate-900">{order.customerPhone}</p>
              </div>
            </div>

            <div className="bg-blue-50 p-5 rounded-2xl border-2 border-blue-100">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Product Details</p>
              <p className="font-bold text-slate-700 leading-relaxed italic">"{order.productDescription}"</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <button 
              onClick={() => {
                setCurrentPage(`viewMemo:${order.id}`);
                onClose();
              }}
              className="bg-slate-900 text-white py-4 rounded-2xl font-bold active:scale-95 transition-transform"
             >
               View Details
             </button>
             <button 
              onClick={markAsDone}
              className="bg-emerald-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
             >
               <CheckCircle2 size={20} />
               Mark Done
             </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[10, 30, 60].map(mins => (
              <button 
                key={mins}
                onClick={() => handleSnooze(mins)}
                className="bg-slate-100 text-slate-600 py-3 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                {mins} m
              </button>
            ))}
            <button 
              onClick={onClose}
              className="bg-rose-100 text-rose-600 py-3 rounded-xl text-xs font-bold hover:bg-rose-200"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

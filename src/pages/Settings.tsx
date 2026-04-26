import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../lib/db';
import { 
  Store, 
  MapPin, 
  Phone, 
  Clock, 
  Globe, 
  Download, 
  Upload, 
  Database,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Settings() {
  const { settings, t, updateSettings, setLanguage } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!settings) return null;

  const handleExport = async () => {
    const orders = await db.orders.toArray();
    const backup = {
      orders,
      settings,
      version: '1.0',
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DoorMemo_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const backup = JSON.parse(event.target?.result as string);
        if (backup.orders && Array.isArray(backup.orders)) {
          if (window.confirm(`Warning: This will overwrite existing data with ${backup.orders.length} orders. Proceed?`)) {
            await db.orders.clear();
            await db.orders.bulkAdd(backup.orders);
            if (backup.settings) await db.settings.put(backup.settings);
            window.location.reload();
          }
        }
      } catch (err) {
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  const resetData = async () => {
    if (window.confirm('CRITICAL WARNING: This will delete ALL orders. This action cannot be undone.')) {
      await db.orders.clear();
      confetti({
        particleCount: 50,
        colors: ['#ff0000', '#000000']
      });
      alert('Database cleared');
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in slide-in-from-bottom-4 duration-500">
      <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <Store className="text-blue-600" /> {t.shopName}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 tracking-widest">{t.shopName}</label>
            <input 
              type="text" 
              value={settings.shopName}
              onChange={(e) => updateSettings({ shopName: e.target.value })}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-lg focus:bg-white focus:border-blue-600 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 tracking-widest">{t.phone}</label>
            <input 
              type="text" 
              value={settings.phoneNumbers}
              onChange={(e) => updateSettings({ phoneNumbers: e.target.value })}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-lg focus:bg-white focus:border-blue-600 outline-none transition-all"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 tracking-widest">{t.address}</label>
            <textarea 
              value={settings.address}
              onChange={(e) => updateSettings({ address: e.target.value })}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-lg focus:bg-white focus:border-blue-600 outline-none transition-all"
              rows={2}
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            < Globe className="text-indigo-600" /> {t.language}
          </h3>
          <div className="flex gap-2 p-2 bg-slate-100 rounded-2xl">
            <button 
              onClick={() => setLanguage('bn')}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${settings.language === 'bn' ? 'bg-white shadow-md text-blue-600 scale-100' : 'text-slate-400 scale-95 opacity-60'}`}
            >
              বাংলা (Bengali)
            </button>
            <button 
              onClick={() => setLanguage('en')}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${settings.language === 'en' ? 'bg-white shadow-md text-blue-600 scale-100' : 'text-slate-400 scale-95 opacity-60'}`}
            >
              English
            </button>
          </div>
        </section>

        <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <Clock className="text-amber-600" /> Default Reminder Times
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Seen Time</label>
              <input 
                type="time" 
                value={settings.defaultSeenTime}
                onChange={(e) => updateSettings({ defaultSeenTime: e.target.value })}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Delivery Time</label>
              <input 
                type="time" 
                value={settings.defaultDeliveryTime}
                onChange={(e) => updateSettings({ defaultDeliveryTime: e.target.value })}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
              />
            </div>
          </div>
        </section>
      </div>

      <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <Database className="text-emerald-600" /> Backup & Recovery
        </h3>
        <p className="text-slate-400 text-sm mb-8 bg-slate-50 p-4 rounded-xl italic">
          Your data is stored locally on this device. Regular backups are recommended to prevent data loss if the browser cache is cleared.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={handleExport}
            className="flex items-center justify-center gap-3 bg-indigo-600 text-white p-5 rounded-3xl font-bold text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95 transition-all"
          >
            <Download size={24} /> {t.backup} (Export JSON)
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-3 bg-emerald-600 text-white p-5 rounded-3xl font-bold text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-100 active:scale-95 transition-all"
          >
            <Upload size={24} /> {t.import} (Restore JSON)
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".json" 
            className="hidden" 
          />
        </div>
        
        <div className="mt-8 pt-8 border-t border-slate-50">
          <button 
            onClick={resetData}
            className="flex items-center justify-center gap-2 text-rose-500 hover:text-rose-700 font-bold transition-colors ml-auto"
          >
            <Trash2 size={18} /> Delete All Data
          </button>
        </div>
      </section>

      <div className="text-center text-slate-300 text-xs font-bold uppercase tracking-widest py-8">
        Door Memo Reminder v1.0.0
      </div>
    </div>
  );
}

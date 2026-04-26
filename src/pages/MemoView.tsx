import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../lib/db';
import { Order } from '../types';
import { Printer, Share2, ArrowLeft, Download } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { jsPDF } from 'jspdf';

export default function MemoView({ orderId }: { orderId: number }) {
  const { t, setCurrentPage, settings } = useApp();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    db.orders.get(orderId).then(setOrder);
  }, [orderId]);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${settings?.shopName} - Memo ${order.memoNo}`,
          text: `Memo No: ${order.memoNo}\nCustomer: ${order.customerName}\nTotal: ${order.totalAmount}\nDue: ${order.dueAmount}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      alert('Sharing not supported on this device/browser');
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const margin = 20;
    const width = 210;
    
    // Simple ASCII-ish PDF layout (Better to use html2canvas if we had it, but jspdf is fine for basic)
    doc.setFontSize(22);
    doc.text(settings?.shopName || 'Shop Name', width / 2, 30, { align: 'center' });
    doc.setFontSize(10);
    doc.text(settings?.address || 'Address', width / 2, 38, { align: 'center' });
    doc.text(`Phone: ${settings?.phoneNumbers || ''}`, width / 2, 43, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.line(margin, 50, width - margin, 50);

    doc.setFontSize(12);
    doc.text(`Memo No: ${order.memoNo}`, margin, 60);
    doc.text(`Date: ${new Date(order.orderDate).toLocaleDateString()}`, width - margin, 60, { align: 'right' });

    doc.text(`Customer: ${order.customerName}`, margin, 70);
    doc.text(`Phone: ${order.customerPhone}`, margin, 77);
    doc.text(`Address: ${order.customerAddress}`, margin, 84);

    // Table
    const tableTop = 100;
    doc.rect(margin, tableTop, width - 2 * margin, 80);
    doc.text('Particulars', margin + 5, tableTop + 10);
    doc.text(order.productDescription, margin + 5, tableTop + 20, { maxWidth: 100 });

    doc.text(`Total: ${order.totalAmount}`, margin + 5, 190);
    doc.text(`Advance: ${order.advanceAmount}`, margin + 5, 197);
    doc.text(`Due: ${order.dueAmount}`, margin + 5, 204);

    doc.text('Customer Signature', margin, 240);
    doc.text('Authorized Signature', width - margin, 240, { align: 'right' });

    doc.save(`Memo_${order.memoNo}.pdf`);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Action Toolbar */}
      <div className="flex items-center gap-3 no-print">
        <button 
          onClick={() => setCurrentPage('allOrders')}
          className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1" />
        <button 
          onClick={handlePrint}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2"
        >
          <Printer size={18} /> {t.print}
        </button>
        <button 
          onClick={handleShare}
          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2"
        >
          <Share2 size={18} /> {t.share}
        </button>
        <button 
          onClick={generatePDF}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2"
        >
          <Download size={18} /> PDF
        </button>
      </div>

      {/* Digital Memo */}
      <div className="memo-container bg-white shadow-2xl rounded-sm max-w-2xl mx-auto border-t-[12px] border-blue-600 p-8 lg:p-12 relative overflow-hidden text-slate-800">
        {/* Watermark bg */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] rotate-[-25deg] select-none pointer-events-none">
          <h1 className="text-8xl font-black">{settings?.shopName}</h1>
        </div>

        {/* Header */}
        <div className="text-center mb-10 border-b-2 border-slate-100 pb-8">
          <h1 className="text-4xl font-black text-blue-600 mb-2 uppercase tracking-tighter">{settings?.shopName}</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs mb-4">Quality Door & Frame Gallery</p>
          <div className="flex flex-col gap-1 items-center text-sm font-medium text-slate-400">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"/> {settings?.address}</span>
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"/> Phone: {settings?.phoneNumbers}</span>
          </div>
        </div>

        {/* Memo Meta */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="bg-slate-900 text-white px-3 py-1 text-sm font-black uppercase rounded-sm">MEMO NO:</span>
              <span className="text-xl font-bold border-b-2 border-dotted border-slate-300 px-4 min-w-[120px]">{order.memoNo}</span>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.customerName}:</label>
              <span className="text-lg font-bold border-b-2 border-dotted border-slate-200">{order.customerName}</span>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.address}:</label>
              <span className="text-md font-medium border-b-2 border-dotted border-slate-200">{order.customerAddress || '-'}</span>
            </div>
          </div>
          <div className="space-y-4 text-right">
            <div className="flex items-center justify-end gap-4">
              <span className="text-sm font-black uppercase text-slate-400">DATE:</span>
              <span className="text-lg font-bold border-b-2 border-dotted border-slate-300 px-4">{new Date(order.orderDate).toLocaleDateString('bn-BD')}</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.phone}:</label>
              <span className="text-lg font-bold border-b-2 border-dotted border-slate-200">{order.customerPhone}</span>
            </div>
          </div>
        </div>

        {/* Table content */}
        <div className="mb-10 min-h-[300px]">
          <table className="w-full border-2 border-slate-200">
            <thead className="bg-slate-50 border-b-2 border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-500 border-r-2 border-slate-200">{t.particulars}</th>
                <th className="px-4 py-3 text-center text-xs font-black uppercase text-slate-500 border-r-2 border-slate-200 w-20">{t.qty}</th>
                <th className="px-4 py-3 text-center text-xs font-black uppercase text-slate-500 border-r-2 border-slate-200 w-32">{t.rate}</th>
                <th className="px-4 py-3 text-right text-xs font-black uppercase text-slate-500 w-32">{t.total}</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              <tr className="h-[250px] align-top">
                <td className="px-4 py-4 text-lg font-semibold border-r-2 border-slate-200 whitespace-pre-line leading-relaxed">
                  {order.productDescription}
                </td>
                <td className="px-4 py-4 text-center font-bold border-r-2 border-slate-200">{order.quantity}</td>
                <td className="px-4 py-4 text-center font-bold border-r-2 border-slate-200">{order.rate}</td>
                <td className="px-4 py-4 text-right font-black text-lg">{order.totalAmount}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Totals */}
        <div className="flex justify-between items-start mb-20">
          <div className="max-w-[50%]">
             <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">In Words:</p>
             <p className="font-bold text-sm italic capitalize mb-6 border-b border-slate-200 inline-block">
               {/* Word conversion would be nice but a placeholder for now */}
               {order.totalAmount} Only.
             </p>

             <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.note}:</p>
                <p className="text-sm font-medium text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                  {order.note || 'None'}
                </p>
             </div>
          </div>
          
          <div className="w-64 space-y-3">
             <div className="flex justify-between items-center text-slate-500">
               <span className="font-bold uppercase text-xs">{t.total}:</span>
               <span className="text-xl font-bold">{order.totalAmount}</span>
             </div>
             <div className="flex justify-between items-center text-slate-500">
               <span className="font-bold uppercase text-xs">{t.advance}:</span>
               <span className="text-xl font-bold">{order.advanceAmount}</span>
             </div>
             <div className="flex justify-between items-center bg-blue-50 p-4 rounded-2xl border-2 border-blue-100">
               <span className="font-black uppercase text-blue-600 text-sm">{t.due}:</span>
               <span className="text-3xl font-black text-blue-600 underline decoration-double underline-offset-4">{order.dueAmount}</span>
             </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="flex justify-between pt-10 px-4">
          <div className="text-center w-48 border-t-2 border-slate-300 pt-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Customer's Signature</span>
          </div>
          <div className="text-center w-48 border-t-2 border-slate-900 pt-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-900">Proprietor / Authorized</span>
          </div>
        </div>

        <div className="mt-12 text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] select-none">
          Thank You For Choosing Us
        </div>
      </div>
      
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .memo-container, .memo-container * { visibility: visible; }
          .memo-container { position: absolute; left: 0; top: 0; width: 100%; border: none !important; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}

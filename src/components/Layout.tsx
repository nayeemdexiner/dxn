import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  PlusSquare, 
  ClipboardList, 
  Settings as SettingsIcon,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { currentPage, setCurrentPage, t } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'newOrder', label: t.newOrder, icon: PlusSquare },
    { id: 'allOrders', label: t.allOrders, icon: ClipboardList },
    { id: 'settings', label: t.settings, icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col z-30">
        <div className="p-6 border-bottom border-slate-100">
          <h1 className="text-xl font-bold text-blue-600 tracking-tight">Door Memo</h1>
          <p className="text-xs text-slate-400">Order Management</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                currentPage === item.id 
                  ? "bg-blue-50 text-blue-600 font-medium shadow-sm" 
                  : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 lg:left-64 z-20 flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button 
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <h2 className="text-lg font-semibold capitalize">
            {navItems.find(i => i.id === currentPage)?.label || 'Order Details'}
          </h2>
        </div>
        <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          {new Date().toLocaleDateString('bn-BD')}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-24 lg:pb-8 lg:pl-72 lg:pr-8 min-h-screen px-4">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 lg:hidden flex justify-around items-center h-20 px-2 z-30 pb-safe">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full h-full text-xs font-medium transition-colors",
              currentPage === item.id ? "text-blue-600" : "text-slate-400"
            )}
          >
            <item.icon size={22} className={cn(currentPage === item.id ? "scale-110" : "")} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-white z-50 lg:hidden p-6 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-xl font-bold text-blue-600">Door Memo</h1>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-3 flex-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentPage(item.id);
                      setIsSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-lg font-medium transition-all active:scale-95",
                      currentPage === item.id 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <item.icon size={24} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-auto pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-400 italic">Created by MN-DXN</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

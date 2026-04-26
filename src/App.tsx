import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import OrderForm from './pages/OrderForm';
import OrderList from './pages/OrderList';
import MemoView from './pages/MemoView';
import Settings from './pages/Settings';
import AlarmModal from './components/AlarmModal';
import { checkUpcomingReminders, requestNotificationPermission } from './lib/reminderService';
import { Order } from './types';

function AppContent() {
  const { currentPage } = useApp();
  const [activeAlarm, setActiveAlarm] = useState<{ order: Order, type: 'seen' | 'delivery' } | null>(null);

  useEffect(() => {
    requestNotificationPermission();
    
    // Check every minute
    const interval = setInterval(() => {
      checkUpcomingReminders((order, type) => {
        setActiveAlarm({ order, type });
      }).catch(console.error);
    }, 30000); // Check every 30 seconds for better responsiveness

    // Run once on load
    checkUpcomingReminders((order, type) => {
      setActiveAlarm({ order, type });
    });

    return () => clearInterval(interval);
  }, []);

  const renderPage = () => {
    if (currentPage === 'dashboard') return <Dashboard />;
    if (currentPage === 'newOrder') return <OrderForm />;
    if (currentPage.startsWith('editOrder:')) {
      const id = parseInt(currentPage.split(':')[1]);
      return <OrderForm orderId={id} />;
    }
    if (currentPage === 'allOrders' || currentPage.startsWith('allOrders:')) {
      const parts = currentPage.split(':');
      const statusFilter = parts[1] || 'all';
      const paymentFilter = parts[2] || 'all';
      return (
        <OrderList 
          initialStatus={statusFilter as any} 
          initialPayment={paymentFilter as any} 
        />
      );
    }
    if (currentPage.startsWith('viewMemo:')) {
      const id = parseInt(currentPage.split(':')[1]);
      return <MemoView orderId={id} />;
    }
    if (currentPage === 'settings') return <Settings />;
    return <Dashboard />;
  };

  return (
    <Layout>
      {renderPage()}
      {activeAlarm && (
        <AlarmModal 
          order={activeAlarm.order} 
          type={activeAlarm.type} 
          onClose={() => setActiveAlarm(null)} 
        />
      )}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

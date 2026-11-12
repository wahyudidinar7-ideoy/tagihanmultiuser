import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';

import { DashboardView } from './views/DashboardView';
import { StudentsView } from './views/StudentsView';
import { MasterFeesView } from './views/MasterFeesView';
import { NotificationSenderView } from './views/NotificationSenderView';
import { PaymentsView } from './views/PaymentsView';
import { OverdueView } from './views/OverdueView';
import { ReportsView } from './views/ReportsView';
import { NotificationHistoryView } from './views/NotificationHistoryView';
import { SchoolsManagementView } from './views/SchoolsManagementView';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedStudentForAction, setSelectedStudentForAction] = useState<string | undefined>(
    undefined
  );

  const handleSelectStudentForPayment = (studentId: string) => {
    setSelectedStudentForAction(studentId);
    setActiveTab('payments');
  };

  const handleSelectStudentForNotification = (studentId: string) => {
    setSelectedStudentForAction(studentId);
    setActiveTab('notifications');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Global Header */}
      <Header />

      {/* Main Container: 2-Column on Desktop (Sidebar 28% + Content 72%) */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Desktop Sidebar (hidden on mobile, visible on lg) */}
        <div className="hidden lg:block">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Content Area */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-24 lg:pb-12 min-w-0">
          {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}

          {activeTab === 'students' && (
            <StudentsView
              onSelectStudentForPayment={handleSelectStudentForPayment}
              onSelectStudentForNotification={handleSelectStudentForNotification}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'fees' && <MasterFeesView />}

          {activeTab === 'notifications' && (
            <NotificationSenderView initialStudentId={selectedStudentForAction} />
          )}

          {activeTab === 'payments' && (
            <PaymentsView initialStudentId={selectedStudentForAction} />
          )}

          {activeTab === 'overdue' && (
            <OverdueView
              setActiveTab={setActiveTab}
              onSelectStudentForPayment={handleSelectStudentForPayment}
            />
          )}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'history' && <NotificationHistoryView />}

          {activeTab === 'schools' && <SchoolsManagementView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation (fixed on mobile, hidden on lg) */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

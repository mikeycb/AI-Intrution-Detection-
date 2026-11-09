import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { Dashboard } from './pages/Dashboard';
import { TrafficDetection } from './pages/TrafficDetection';
import { Datasets } from './pages/Datasets';
import { ModelPerformance } from './pages/ModelPerformance';
import { SecurityAlerts } from './pages/SecurityAlerts';
import { Settings } from './pages/Settings';
import { apiService } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  useEffect(() => {
    // Check backend health on initial load
    apiService.checkBackendHealth().then((status) => {
      setIsBackendConnected(status.online);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex cyber-grid">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          isBackendConnected={isBackendConnected}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
          {activeTab === 'detection' && <TrafficDetection />}
          {activeTab === 'datasets' && <Datasets onNavigate={setActiveTab} />}
          {activeTab === 'performance' && <ModelPerformance />}
          {activeTab === 'alerts' && <SecurityAlerts />}
          {activeTab === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
};

export default App;

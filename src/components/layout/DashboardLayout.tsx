import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { AICopilotDrawer } from '../copilot/AICopilotDrawer';
import { CaseDrawer } from '../recovery/CaseDrawer';
import { MerchantModal } from './MerchantModal';
import { UserProfileModal } from './UserProfileModal';
import { HelpModal } from './HelpModal';
import { UserManagementModal } from './UserManagementModal';
import { DateRangeModal } from './DateRangeModal';
import { FiltersModal } from './FiltersModal';
import { useDemoStore } from '../../store/demoStore';
import { cn } from '../../lib/utils';

export const DashboardLayout: React.FC = () => {
  const isSidebarCollapsed = useDemoStore((state) => state.isSidebarCollapsed);

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 flex transition-colors duration-200">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Area (Dynamic margin based on sidebar state) */}
      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-all duration-300',
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        )}
      >
        <main className="flex-1 p-6 pb-16 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Interactive Global Drawers & Modals */}
      <AICopilotDrawer />
      <CaseDrawer />
      <MerchantModal />
      <UserProfileModal />
      <HelpModal />
      <UserManagementModal />
      <DateRangeModal />
      <FiltersModal />
    </div>
  );
};


import {
  Home,
  Truck,
  Receipt,
  CreditCard,
  Settings,
  Building2,
  Package,
  Users,
  Calendar,
  BarChart3,
  Building,
  ShoppingCart,
  Target,
  Database,
  FileText,
} from 'lucide-react';
import React, { useState } from 'react';

import { Dashboard } from './Dashboard';
import { Login } from './Login';
import { MainSidebar } from './MainSidebar';
import { ProjectActivity } from './ProjectActivity';
import { SaaSHomepage } from './SaaSHomepage';
import { ExpensesPage } from './expenses';
import { MaterialsPage } from './materials';
import { MastersPage } from './masters';
import { OrganizationPage } from './organization';
import { PaymentsPage } from './payments';
import { PurchasePage } from './purchase';
import { ReportsPage } from './reports';
import { SchedulingPage } from './scheduling';
import { SettingsPage } from './settings';
import { MaterialsProvider } from './shared/materialsContext';
import { SitesPage } from './sites';
import { TendersPage } from './tenders';
import { VehiclesPage } from './vehicles';
import { VendorsPage } from './vendors';
import { WorkProgressPage } from './work-progress';
import { Button } from './ui/button';
import { SidebarProvider, SidebarTrigger } from './ui/sidebar';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

import { useAuth } from '@/lib/auth-context';
import type { UserWithOrganization } from '@/types';

export type AppPage =
  | 'home'
  | 'dashboard'
  | 'expenses'
  | 'materials'
  | 'masters'
  | 'purchase'
  | 'work-progress'
  | 'project-activity'
  | 'sites'
  | 'tenders'
  | 'vehicles'
  | 'vendors'
  | 'payments'
  | 'scheduling'
  | 'reports'
  | 'organization'
  | 'settings'
  | 'login';

// Icon mapping for each page
const getPageIcon = (page: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    dashboard: Home,
    sites: Building2,
    tenders: FileText,
    materials: Package,
    masters: Database,
    purchase: ShoppingCart,
    'work-progress': Target,
    vehicles: Truck,
    vendors: Users,
    expenses: Receipt,
    payments: CreditCard,
    scheduling: Calendar,
    reports: BarChart3,
    organization: Building,
    settings: Settings,
  };

  return iconMap[page] || Home;
};

interface MainAppProps {
  initialPage?: AppPage;
}

// Mock data
const mockOrganizations = [
  {
    id: 'org1',
    name: 'Gavith Construction Pvt. Ltd.',
    subscription: 'premium' as const,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
  },
];

const mockUsers = [
  {
    id: 'user1',
    username: 'admin',
    email: 'admin@gavithconstruction.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin' as const,
    organizationId: 'org1',
    organizationRole: 'owner' as const,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    organization: mockOrganizations[0],
  },
];

export function MainApp({ initialPage = 'home' }: MainAppProps) {
  const [currentPage, setCurrentPage] = useState<AppPage>(initialPage);
  const [selectedSite, setSelectedSite] = useState<string>('1');
  const { isLoggedIn, login, logout } = useAuth();
  
  // Force cache bust with timestamp and random number
  const cacheBustTimestamp = new Date().toISOString();
  const randomId = Math.random().toString(36).substr(2, 9);
  console.log('🔥🔥🔥 MainApp component loaded at:', cacheBustTimestamp);
  console.log('🔥🔥🔥 Cache bust timestamp:', cacheBustTimestamp);
  console.log('🔥🔥🔥 Random ID:', randomId);
  console.log('🔥🔥🔥 Component version: 2.0.0-cache-bust');

  const handleLogin = (userData?: UserWithOrganization) => {
    if (userData) {
      login(userData);
    }
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('home');
  };

  const handleNavigate = (page: AppPage) => {
    console.log('🚀🚀🚀 Navigating to page:', page);
    console.log('🚀🚀🚀 Current page before navigation:', currentPage);
    setCurrentPage(page);
    console.log('🚀🚀🚀 Page set to:', page);
  };

  // Force re-render on mount
  React.useEffect(() => {
    console.log('🔥🔥🔥 MainApp useEffect triggered - forcing re-render');
    console.log('🔥🔥🔥 Current page in useEffect:', currentPage);
    
    // Just log the cache bust info without forcing reloads
    if (typeof window !== 'undefined') {
      (window as Record<string, unknown>)['mainAppCacheBust'] = cacheBustTimestamp;
      console.log('🔥🔥🔥 Set window.mainAppCacheBust to:', cacheBustTimestamp);
      
      // Listen for custom navigation events from Dashboard
      const handleCustomNavigate = (event: CustomEvent) => {
        console.log('🔥🔥🔥 Received custom navigate event:', event.detail);
        handleNavigate(event.detail as AppPage);
      };
      
      window.addEventListener('navigate', handleCustomNavigate as EventListener);
      
      return () => {
        window.removeEventListener('navigate', handleCustomNavigate as EventListener);
      };
    }
  }, [currentPage, cacheBustTimestamp, handleNavigate]);

  // Show homepage if not logged in and on home page
  if (!isLoggedIn && currentPage === 'home') {
    return (
      <SaaSHomepage
        onLogin={() => setCurrentPage('login')}
        onGetStarted={() => setCurrentPage('login')}
      />
    );
  }

  // Show login page
  if (!isLoggedIn && currentPage === 'login') {
    return <Login onLogin={handleLogin} onCreateOrganization={() => {}} isLoading={false} />;
  }

  // Show main application with sidebar
  if (isLoggedIn) {
    return (
      <MaterialsProvider key={`mainapp-${cacheBustTimestamp}-${randomId}`}>
        <SidebarProvider>
          <div className="flex h-screen w-full bg-gray-50">
            <MainSidebar
              currentPage={currentPage}
              onNavigate={(page: string) => handleNavigate(page as AppPage)}
              onLogout={handleLogout}
            />

            <main className="flex-1 overflow-auto w-full">
              <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-white to-gray-50/80 border-b border-gray-200/60">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="h-9 w-9 rounded-lg border border-gray-200/60 bg-white/80 hover:bg-gray-50/80 shadow-sm hover:shadow-md transition-all duration-200" />
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                      {React.createElement(getPageIcon(currentPage), {
                        className: 'h-4 w-4 text-white',
                      })}
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900 capitalize leading-tight">
                        {currentPage}
                      </h1>
                      <p className="text-sm text-gray-500 font-medium leading-tight">
                        Management Dashboard
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">JD</span>
                      </div>
                      <span className="font-medium">John Doe</span>
                    </div>
                    {currentPage === 'materials' && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 transition-all hover:shadow-md"
                            >
                              <Settings className="h-4 w-4" />
                              <span className="hidden sm:inline">Materials Settings</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Material settings and configuration</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span className="hidden sm:inline">Logout</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="min-h-full w-full max-w-none">
                {currentPage === 'dashboard' && (
                  <div className="p-6 w-full">
                    <Dashboard
                      key={`dashboard-${cacheBustTimestamp}-${randomId}`}
                      onNavigate={(section: string) => {
                        console.log('🚀🚀🚀 Dashboard onNavigate called with:', section);
                        console.log('🚀🚀🚀 Current page before navigation:', currentPage);
                        console.log('🚀🚀🚀 Calling handleNavigate...');
                        handleNavigate(section as AppPage);
                        console.log('🚀🚀🚀 handleNavigate completed');
                      }}
                    />
                  </div>
                )}
                {currentPage === 'expenses' && (
                  <div className="p-6 w-full">
                    <ExpensesPage />
                  </div>
                )}
                {currentPage === 'materials' && (
                  <div className="p-6 w-full">
                    <MaterialsPage />
                  </div>
                )}
                {currentPage === 'masters' && (
                  <div className="p-6 w-full">
                    <MastersPage />
                  </div>
                )}
                {currentPage === 'purchase' && (
                  <div className="p-6 w-full">
                    <PurchasePage />
                  </div>
                )}
                {currentPage === 'work-progress' && (
                  <div className="p-6 w-full">
                    <WorkProgressPage selectedSite={selectedSite} onSiteSelect={setSelectedSite} />
                  </div>
                )}
                {currentPage === 'project-activity' && (
                  <div className="p-6 w-full">
                    <ProjectActivity selectedSiteId={selectedSite} onSiteSelect={setSelectedSite} />
                  </div>
                )}
                {currentPage === 'sites' && (
                  <div className="p-6 w-full">
                    <SitesPage selectedSite={selectedSite} onSiteSelect={setSelectedSite} />
                  </div>
                )}
                {currentPage === 'tenders' && (
                  <div className="p-6 w-full">
                    <TendersPage />
                  </div>
                )}
                {currentPage === 'vehicles' && (
                  <div className="p-6 w-full">
                    <VehiclesPage />
                  </div>
                )}
                {currentPage === 'vendors' && (
                  <div className="p-6 w-full">
                    <VendorsPage />
                  </div>
                )}
                {currentPage === 'payments' && (
                  <div className="p-6 w-full">
                    <PaymentsPage />
                  </div>
                )}
                {currentPage === 'scheduling' && (
                  <div className="p-6 w-full">
                    <SchedulingPage />
                  </div>
                )}
                {currentPage === 'reports' && (
                  <div className="p-6 w-full">
                    <ReportsPage />
                  </div>
                )}
                {currentPage === 'organization' && (
                  <div className="p-6 w-full">
                    <OrganizationPage
                      currentUser={mockUsers[0]}
                      currentOrganization={mockOrganizations[0]}
                      onUpdateOrganization={() => {}}
                    />
                  </div>
                )}
                {currentPage === 'settings' && (
                  <div className="p-6 w-full">
                    <SettingsPage
                      user={{
                        username: mockUsers[0].username,
                        role: mockUsers[0].role,
                        companyName: mockUsers[0].organization.name,
                      }}
                      onUpdateUser={() => {}}
                    />
                  </div>
                )}
              </div>
            </main>
          </div>
        </SidebarProvider>
      </MaterialsProvider>
    );
  }

  // Fallback to homepage
  return (
    <SaaSHomepage
      onLogin={() => setCurrentPage('login')}
      onGetStarted={() => setCurrentPage('login')}
    />
  );
}

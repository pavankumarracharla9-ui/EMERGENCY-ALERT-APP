import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext.tsx';
import { AppLayout } from './components/layout/AppLayout.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { ReportEmergencyPage } from './pages/ReportEmergencyPage.tsx';
import { IncidentsPage } from './pages/IncidentsPage.tsx';
import { DispatchPage } from './pages/DispatchPage.tsx';
import { FleetPage } from './pages/FleetPage.tsx';
import { HospitalsPage } from './pages/HospitalsPage.tsx';
import { AnalyticsPage } from './pages/AnalyticsPage.tsx';
import { NotificationsPage } from './pages/NotificationsPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Handle browser popstate (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (currentPath) {
      case '/':
        return <LandingPage onNavigate={navigateTo} />;

      case '/dashboard':
        return (
          <AppLayout currentPath={currentPath} onNavigate={navigateTo}>
            <DashboardPage onNavigate={navigateTo} />
          </AppLayout>
        );

      case '/report-emergency':
        return (
          <AppLayout currentPath={currentPath} onNavigate={navigateTo}>
            <ReportEmergencyPage onNavigate={navigateTo} />
          </AppLayout>
        );

      case '/incidents':
        return (
          <AppLayout currentPath={currentPath} onNavigate={navigateTo}>
            <IncidentsPage onNavigate={navigateTo} />
          </AppLayout>
        );

      case '/dispatch':
        return (
          <AppLayout currentPath={currentPath} onNavigate={navigateTo}>
            <DispatchPage onNavigate={navigateTo} />
          </AppLayout>
        );

      case '/fleet':
        return (
          <AppLayout currentPath={currentPath} onNavigate={navigateTo}>
            <FleetPage onNavigate={navigateTo} />
          </AppLayout>
        );

      case '/hospitals':
        return (
          <AppLayout currentPath={currentPath} onNavigate={navigateTo}>
            <HospitalsPage onNavigate={navigateTo} />
          </AppLayout>
        );

      case '/analytics':
        return (
          <AppLayout currentPath={currentPath} onNavigate={navigateTo}>
            <AnalyticsPage onNavigate={navigateTo} />
          </AppLayout>
        );

      case '/notifications':
        return (
          <AppLayout currentPath={currentPath} onNavigate={navigateTo}>
            <NotificationsPage onNavigate={navigateTo} />
          </AppLayout>
        );

      case '/settings':
        return (
          <AppLayout currentPath={currentPath} onNavigate={navigateTo}>
            <SettingsPage onNavigate={navigateTo} />
          </AppLayout>
        );

      case '/about':
        return (
          <AppLayout currentPath={currentPath} onNavigate={navigateTo}>
            <AboutPage onNavigate={navigateTo} />
          </AppLayout>
        );

      default:
        return (
          <AppLayout currentPath={currentPath} onNavigate={navigateTo}>
            <DashboardPage onNavigate={navigateTo} />
          </AppLayout>
        );
    }
  };

  return (
    <AppProvider>
      {renderContent()}
    </AppProvider>
  );
}

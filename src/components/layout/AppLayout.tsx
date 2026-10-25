import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { BrandLogo } from '../common/BrandLogo.tsx';
import { UserRole } from '../../types/index.ts';
import {
  LayoutDashboard,
  AlertTriangle,
  Siren,
  MapPin,
  Truck,
  Building2,
  BarChart3,
  Bell,
  Settings,
  Info,
  Search,
  RefreshCw,
  PlusCircle,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

interface AppLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ currentPath, onNavigate, children }) => {
  const {
    notifications,
    currentRole,
    setCurrentRole,
    loadDemoScenario,
    addRandomDemoIncident,
    incidents,
    setActiveIncidentId,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Live Incidents', path: '/incidents', icon: AlertTriangle, badge: incidents.filter((i) => i.status !== 'Resolved').length },
    { label: 'Report Emergency', path: '/report-emergency', icon: Siren, highlight: true },
    { label: 'Map & Dispatch', path: '/dispatch', icon: MapPin },
    { label: 'Ambulance Fleet', path: '/fleet', icon: Truck },
    { label: 'Hospitals', path: '/hospitals', icon: Building2 },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { label: 'Settings', path: '/settings', icon: Settings },
    { label: 'About', path: '/about', icon: Info },
  ];

  const searchResults = searchQuery.trim()
    ? incidents.filter(
        (i) =>
          i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const roles: UserRole[] = ['Administrator', 'Dispatcher', 'Hospital Viewer', 'Public Reporter'];

  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-100 flex flex-col antialiased">
      {/* Top Demo Disclaimer Ribbon */}
      <div className="bg-[#111C30] border-b border-slate-800/80 px-4 py-1.5 text-[11px] text-slate-400 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
          <span className="font-medium text-slate-300">DEMO ENVIRONMENT:</span>
          <span className="truncate">
            Emergency dispatch and response telemetry are simulated for university hackathon demonstration. Not connected to real 911/112 services.
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('/')}
            className="text-slate-400 hover:text-white transition-colors"
          >
            Public Site
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Persistent Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-[#0B1220] border-r border-slate-800/80 shrink-0">
          {/* Brand header */}
          <div
            onClick={() => onNavigate('/')}
            className="p-5 border-b border-slate-800/80 cursor-pointer hover:bg-slate-900/40 transition-colors"
          >
            <BrandLogo size="md" variant="dark" showTagline={true} />
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-2">
              Operations Center
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    onNavigate(item.path);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    item.highlight
                      ? 'bg-[#E53945]/15 text-[#E53945] hover:bg-[#E53945]/25 border border-[#E53945]/30'
                      : isActive
                      ? 'bg-slate-800 text-white font-semibold border-l-2 border-[#18B6A4]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#18B6A4]' : item.highlight ? 'text-[#E53945]' : ''}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Quick Demo Actions */}
          <div className="p-3 border-t border-slate-800/80 space-y-2">
            <button
              onClick={loadDemoScenario}
              className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center justify-center gap-2 border border-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#18B6A4]" />
              <span>Load Demo Scenario</span>
            </button>
            <button
              onClick={addRandomDemoIncident}
              className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-[#18B6A4]/15 hover:bg-[#18B6A4]/25 text-[#18B6A4] transition-colors flex items-center justify-center gap-2 border border-[#18B6A4]/30"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Simulate Incident</span>
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[85%] bg-[#0B1220] border-r border-slate-800 flex flex-col z-10">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <BrandLogo size="sm" variant="dark" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-3 space-y-1 overflow-y-auto flex-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        onNavigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium ${
                        isActive
                          ? 'bg-slate-800 text-white font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Bar */}
          <header className="h-14 bg-[#111C30] border-b border-slate-800/80 px-4 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Global search */}
              <div className="relative max-w-md w-64 md:w-80">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search incidents, units, streets..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchOpen(true);
                    }}
                    onFocus={() => setSearchOpen(true)}
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#18B6A4]"
                  />
                </div>

                {/* Search Dropdown */}
                {searchOpen && searchQuery.trim() && (
                  <div className="absolute top-full mt-1.5 left-0 right-0 bg-[#0B1220] border border-slate-700 rounded-lg shadow-xl z-50 max-h-72 overflow-y-auto">
                    <div className="p-2 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{searchResults.length} incidents found</span>
                      <button
                        onClick={() => setSearchOpen(false)}
                        className="hover:text-white"
                      >
                        Close
                      </button>
                    </div>
                    {searchResults.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">
                        No incidents matched query
                      </div>
                    ) : (
                      searchResults.map((inc) => (
                        <div
                          key={inc.id}
                          onClick={() => {
                            setActiveIncidentId(inc.id);
                            onNavigate('/incidents');
                            setSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="p-2.5 hover:bg-slate-800/80 cursor-pointer border-b border-slate-800/40 text-xs"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-200">{inc.id} · {inc.type}</span>
                            <span className="text-[10px] text-slate-400">{inc.priority}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{inc.location.address}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Top Bar Controls */}
            <div className="flex items-center gap-3">
              {/* Role Switcher */}
              <div className="relative">
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#18B6A4]" />
                  <span className="hidden sm:inline text-slate-400 text-[11px]">Role:</span>
                  <span className="font-semibold text-xs">{currentRole}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {roleMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-48 bg-[#0B1220] border border-slate-700 rounded-lg shadow-xl py-1 z-50 text-xs">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-800">
                      Switch Demo Role
                    </div>
                    {roles.map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setCurrentRole(r);
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center justify-between ${
                          currentRole === r ? 'text-[#18B6A4] font-semibold' : 'text-slate-300'
                        }`}
                      >
                        <span>{r}</span>
                        {currentRole === r && <span className="w-1.5 h-1.5 rounded-full bg-[#18B6A4]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notification Bell */}
              <button
                onClick={() => onNavigate('/notifications')}
                className="relative p-2 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E53945] text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </header>

          {/* Main Viewport Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

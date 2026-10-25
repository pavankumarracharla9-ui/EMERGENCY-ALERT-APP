import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Bell,
  Check,
  CheckCheck,
  Filter,
  AlertTriangle,
  Radio,
  Building2,
  Cpu,
  Trash2,
  ChevronRight,
} from 'lucide-react';

interface NotificationsPageProps {
  onNavigate: (path: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setActiveIncidentId,
  } = useApp();

  const [filterType, setFilterType] = useState<'all' | 'unread' | 'critical'>('all');

  const filteredNotifications = notifications.filter((notif) => {
    if (filterType === 'unread' && notif.read) return false;
    if (filterType === 'critical' && notif.severity !== 'critical') return false;
    return true;
  });

  const getIcon = (type: string, severity: string) => {
    if (severity === 'critical') return <AlertTriangle className="w-4 h-4 text-[#E53945]" />;
    if (type === 'dispatch') return <Radio className="w-4 h-4 text-sky-400" />;
    if (type === 'hospital') return <Building2 className="w-4 h-4 text-indigo-400" />;
    return <Cpu className="w-4 h-4 text-[#18B6A4]" />;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1 flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#18B6A4]" />
            <span>Emergency Operations Notification Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Audit feed of all real-time triage evaluations, fleet dispatches, hospital alerts, and resolutions.
          </p>
        </div>

        <button
          onClick={markAllNotificationsRead}
          className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto border border-slate-700"
        >
          <CheckCheck className="w-4 h-4 text-[#18B6A4]" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 pb-2">
        {(['all', 'unread', 'critical'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterType(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
              filterType === tab
                ? 'bg-[#18B6A4] text-slate-950 font-bold'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {tab}
            {tab === 'unread' && (
              <span className="ml-1.5 font-mono text-[10px]">
                ({notifications.filter((n) => !n.read).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 rounded-2xl bg-[#111C30] border border-slate-800 text-xs">
            No notifications in this view.
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                if (!notif.read) markNotificationRead(notif.id);
                if (notif.relatedIncidentId) {
                  setActiveIncidentId(notif.relatedIncidentId);
                  onNavigate('/incidents');
                }
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                notif.read
                  ? 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70'
                  : 'bg-slate-900/90 border-[#18B6A4]/40 shadow-sm ring-1 ring-[#18B6A4]/20'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                  {getIcon(notif.type, notif.severity)}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white truncate">{notif.title}</span>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-[#18B6A4] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono pt-1">
                    <span>{notif.timestamp}</span>
                    {notif.relatedIncidentId && (
                      <span className="text-[#18B6A4]">Case: {notif.relatedIncidentId}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!notif.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markNotificationRead(notif.id);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                    title="Mark as read"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

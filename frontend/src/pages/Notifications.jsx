import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Eye, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data);
    } catch (err) {
      console.error(err);
      if (window.showToast) window.showToast('Failed to load notifications list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      if (window.showToast) window.showToast('Marked as read', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      if (window.showToast) window.showToast('All notifications marked read', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  // Filter notifications
  const displayedNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Alerts Inbox</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Review registration updates, storage limits, and media processing.
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="glow-btn inline-flex items-center gap-1.5 px-4 py-2 bg-teal-650/10 hover:bg-teal-650/20 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 rounded-xl text-xs font-bold"
          >
            <Check size={14} />
            Mark All Read
          </button>
        )}
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-dark-800 pb-px">
        {['all', 'unread', 'read'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-xs font-bold border-b-2 capitalize transition-all ${filter === tab ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main List */}
      <div className="bg-white dark:bg-dark-850 border border-slate-200/50 dark:border-dark-800 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayedNotifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No notifications found.
          </div>
        ) : (
          <div className="divide-y divide-slate-150 dark:divide-dark-800 text-xs font-semibold">
            {displayedNotifications.map((notif) => (
              <div
                key={notif._id}
                className={`p-5 flex items-start gap-4 transition-all ${!notif.isRead ? 'bg-teal-500/[0.02] dark:bg-teal-500/[0.01]' : ''}`}
              >
                {/* Icons */}
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${notif.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' : notif.type === 'warning' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400' : notif.type === 'error' ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400' : 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'}`}>
                  {notif.type === 'success' && <CheckCircle size={18} />}
                  {notif.type === 'warning' && <AlertTriangle size={18} />}
                  {notif.type === 'error' && <XCircle size={18} />}
                  {notif.type === 'info' && <Info size={18} />}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-xs font-bold ${!notif.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {notif.message}
                  </p>
                  
                  {/* Mark single read button */}
                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkRead(notif._id)}
                      className="mt-2 text-[10px] text-teal-600 dark:text-teal-400 font-bold hover:underline flex items-center gap-0.5"
                    >
                      <Eye size={11} />
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Notifications;

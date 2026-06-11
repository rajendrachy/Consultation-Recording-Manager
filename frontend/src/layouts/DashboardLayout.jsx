import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Video,
  BarChart3,
  Bell,
  User,
  Settings,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import api from '../services/api';
import { getMediaUrl } from '../config';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode, initTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Local notification stats
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Custom Toast State
  const [toasts, setToasts] = useState([]);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Initialize theme
  useEffect(() => {
    initTheme();
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data);
      setUnreadCount(response.data.data.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error('Failed to load notifications:', error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Expose toast internationally on window for easy call
  useEffect(() => {
    window.showToast = addToast;
    return () => {
      delete window.showToast;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      addToast('All notifications marked as read', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const markSingleRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'consultant', 'staff'] },
    { name: 'Clients', path: '/clients', icon: Users, roles: ['admin', 'consultant', 'staff'] },
    { name: 'Consultations', path: '/consultations', icon: CalendarDays, roles: ['admin', 'consultant', 'staff'] },
    { name: 'Recordings', path: '/recordings', icon: Video, roles: ['admin', 'consultant', 'staff'] },
    { name: 'Analytics', path: '/analytics', icon: BarChart3, roles: ['admin', 'consultant', 'staff'] },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-dark-950 text-slate-800 dark:text-slate-100">
      
      {/* Sidebar Backdrop Overlay on Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar for Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-dark-900 border-r border-slate-200 dark:border-dark-800 transform lg:transform-none lg:opacity-100 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-dark-800">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
              C
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-teal-600 to-cyan-500 bg-clip-text text-transparent">
              RecManager
            </span>
          </Link>
          <button className="lg:hidden text-slate-500 dark:text-slate-400" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem-12rem)]">
          {navItems
            .filter((item) => item.roles.includes(user?.role))
            .map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${isActive ? 'bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800 hover:text-slate-900 dark:hover:text-slate-100'}`
                }
              >
                <item.icon size={18} />
                {item.name}
              </NavLink>
            ))}
            
          {/* Admin Panels (Only for admin) */}
          {user?.role === 'admin' && (
            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-dark-800 space-y-1">
              <div className="px-4 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Management
              </div>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${isActive ? 'bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800 hover:text-slate-900 dark:hover:text-slate-100'}`
                }
              >
                <ShieldCheck size={18} />
                Admin Panel
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${isActive ? 'bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800 hover:text-slate-900 dark:hover:text-slate-100'}`
                }
              >
                <Settings size={18} />
                Settings
              </NavLink>
            </div>
          )}
        </nav>

        {/* User Footer Profile Card */}
        <div className="absolute bottom-0 inset-x-0 p-4 border-t border-slate-200 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-900/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold overflow-hidden">
              {user?.avatar ? (
                <img src={getMediaUrl(user.avatar)} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.name ? user.name[0].toUpperCase() : 'U'
              )}
            </div>
            <div className="truncate min-w-0 flex-1">
              <h4 className="font-semibold text-sm truncate">{user?.name}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-slate-200 dark:border-dark-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-medium text-sm transition-all duration-200"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 min-h-screen">
        
        {/* Header */}
        <header className="sticky top-0 z-40 h-16 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-slate-200 dark:border-dark-800 flex items-center justify-between px-6">
          <button className="lg:hidden text-slate-600 dark:text-slate-400" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>

          <div className="ml-auto flex items-center gap-3">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
              title="Toggle theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors relative"
                title="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-teal-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center ring-2 ring-white dark:ring-dark-900">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-850 rounded-2xl shadow-xl border border-slate-200/80 dark:border-dark-750 overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-100 dark:border-dark-800 flex justify-between items-center">
                    <span className="font-bold text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-dark-800">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        No system notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`p-4 hover:bg-slate-50 dark:hover:bg-dark-800/50 cursor-pointer transition-colors ${!n.isRead ? 'bg-teal-50/20 dark:bg-teal-950/10' : ''}`}
                          onClick={() => markSingleRead(n._id)}
                        >
                          <div className="flex gap-2.5">
                            <span className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${n.type === 'success' ? 'bg-emerald-500' : n.type === 'warning' ? 'bg-amber-500' : n.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`} />
                            <div>
                              <p className={`text-xs font-semibold ${!n.isRead ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                                {n.title}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {n.message}
                              </p>
                              <p className="text-[9px] text-slate-400 mt-1">
                                {new Date(n.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-sm overflow-hidden">
                  {user?.avatar ? (
                    <img src={getMediaUrl(user.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.name ? user.name[0].toUpperCase() : 'U'
                  )}
                </div>
                <ChevronDown size={14} className="text-slate-500" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-850 rounded-2xl shadow-xl border border-slate-200/80 dark:border-dark-750 py-1.5 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-dark-800">
                    <p className="text-xs font-bold truncate">{user?.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-850"
                  >
                    <User size={14} />
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-left"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Dashboard Pages Root Wrapper */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global Toast Alerts */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 p-4 rounded-2xl shadow-xl flex gap-3 animate-slide-in items-center justify-between"
          >
            <div className="flex gap-3 items-center">
              {t.type === 'success' && <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />}
              {t.type === 'warning' && <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />}
              {t.type === 'error' && <XCircle size={18} className="text-red-500 flex-shrink-0" />}
              {t.type === 'info' && <Info size={18} className="text-blue-500 flex-shrink-0" />}
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{t.message}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="text-slate-400 hover:text-slate-500 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default DashboardLayout;

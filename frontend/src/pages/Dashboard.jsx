import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Video,
  Users,
  HardDrive,
  ArrowUpRight,
  Play,
  Clock,
  FileAudio,
  UserCheck,
  Shield,
  UploadCloud,
  Plus,
  Terminal,
  FileText,
  Save,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Common stats state
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Admin Dashboard States
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminLogs, setAdminLogs] = useState([]);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);

  // Consultant Dashboard States
  const [consultantSessions, setConsultantSessions] = useState([]);
  const [scratchpad, setScratchpad] = useState(
    localStorage.getItem(`crm_scratchpad_${user?._id}`) || ''
  );
  const [scratchpadSaved, setScratchpadSaved] = useState(false);

  // Staff Dashboard States
  const [staffClients, setStaffClients] = useState([]);
  const [staffConsultants, setStaffConsultants] = useState([]);
  const [staffSessions, setStaffSessions] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadData, setUploadData] = useState({
    title: '',
    consultationId: '',
  });
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    client: '',
    consultant: '',
    consultationDate: '',
    duration: 30,
    status: 'scheduled',
    tags: '',
  });

  // Load stats and role-specific data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch common statistics
      const response = await api.get('/analytics/dashboard');
      setStats(response.data.stats);

      // 2. Fetch role-specific data
      if (user?.role === 'admin') {
        setAdminUsersLoading(true);
        const usersRes = await api.get('/admin/users');
        setAdminUsers(usersRes.data.data);
        const logsRes = await api.get('/admin/logs?limit=6');
        setAdminLogs(logsRes.data.data);
        setAdminUsersLoading(false);
      } else if (user?.role === 'consultant') {
        const sessionsRes = await api.get('/consultations?limit=6');
        setConsultantSessions(sessionsRes.data.data);
      } else if (user?.role === 'staff') {
        const clientsRes = await api.get('/clients?limit=100');
        setStaffClients(clientsRes.data.data);
        
        const usersRes = await api.get('/admin/users');
        const consUsers = usersRes.data.data.filter((u) =>
          ['consultant', 'admin'].includes(u.role)
        );
        setStaffConsultants(consUsers);

        const sessionsRes = await api.get('/consultations?limit=5&status=scheduled');
        setStaffSessions(sessionsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Admin Toggle User Status
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}`, { isActive: !currentStatus });
      if (window.showToast) window.showToast('User permissions updated successfully', 'success');
      // Refresh user lists
      const usersRes = await api.get('/admin/users');
      setAdminUsers(usersRes.data.data);
    } catch (err) {
      if (window.showToast) {
        window.showToast(err.response?.data?.message || 'Failed to toggle status', 'error');
      }
    }
  };

  // Consultant Scratchpad save
  const handleSaveScratchpad = () => {
    localStorage.setItem(`crm_scratchpad_${user?._id}`, scratchpad);
    setScratchpadSaved(true);
    setTimeout(() => setScratchpadSaved(false), 2000);
  };

  // Staff Schedule Consultation Handler
  const handleStaffScheduleSubmit = async (e) => {
    e.preventDefault();
    setScheduleLoading(true);
    const formattedData = {
      ...scheduleData,
      tags: scheduleData.tags.split(',').map((t) => t.trim()).filter((t) => t !== ''),
    };

    try {
      await api.post('/consultations', formattedData);
      if (window.showToast) window.showToast('Appointment successfully scheduled!', 'success');
      setScheduleData({
        client: '',
        consultant: '',
        consultationDate: '',
        duration: 30,
        status: 'scheduled',
        tags: '',
      });
      loadDashboardData();
    } catch (err) {
      if (window.showToast) {
        window.showToast(err.response?.data?.message || 'Scheduling failed', 'error');
      }
    } finally {
      setScheduleLoading(false);
    }
  };

  // Staff Audio Upload Handler
  const handleStaffUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadData.consultationId || !uploadData.title.trim()) {
      if (window.showToast) window.showToast('Please specify recording file, target session, and title', 'warning');
      return;
    }

    setUploadLoading(true);
    if (window.showToast) window.showToast('Uploading audio file and starting AI transcription...', 'info');

    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('consultationId', uploadData.consultationId);
    formData.append('recording', uploadFile);

    try {
      await api.post('/recordings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (window.showToast) window.showToast('Audio uploaded and AI transcript generated successfully!', 'success');
      setUploadFile(null);
      setUploadData({ title: '', consultationId: '' });
      loadDashboardData();
    } catch (err) {
      if (window.showToast) {
        window.showToast(err.response?.data?.message || 'Media upload failed', 'error');
      }
    } finally {
      setUploadLoading(false);
    }
  };

  // Helper: Format bytes to MB/GB
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Helper: Format seconds to MM:SS
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const mockLimitMB = 10240; // 10 GB Limit
  const storagePercentage = Math.min(
    100,
    Math.round(((stats?.storageUsage || 0) / (mockLimitMB * 1024 * 1024)) * 100)
  );

  // ----------------------------------------------------
  // ADMIN DASHBOARD LAYOUT
  // ----------------------------------------------------
  if (user?.role === 'admin') {
    const activeUsersCount = adminUsers.filter(u => u.isActive).length;
    return (
      <div className="space-y-8">
        {/* Title Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Administrator Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Global CRM metrics, database records access, and real-time security audits.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white dark:bg-dark-850 border border-slate-200/60 dark:border-dark-800 rounded-3xl shadow-sm flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Users</span>
              <h3 className="text-3xl font-extrabold">{adminUsers.length}</h3>
              <p className="text-[10px] text-emerald-500 font-bold">{activeUsersCount} Active accounts</p>
            </div>
            <div className="p-3 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 rounded-2xl">
              <Users size={20} />
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-dark-850 border border-slate-200/60 dark:border-dark-800 rounded-3xl shadow-sm flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Consultations</span>
              <h3 className="text-3xl font-extrabold">{stats?.totalConsultations || 0}</h3>
              <p className="text-[10px] text-slate-400">Scheduled in system</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-2xl">
              <CalendarDays size={20} />
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-dark-850 border border-slate-200/60 dark:border-dark-800 rounded-3xl shadow-sm flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Audio Uploads</span>
              <h3 className="text-3xl font-extrabold">{stats?.totalRecordings || 0}</h3>
              <p className="text-[10px] text-slate-400">AI Transcripts generated</p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 rounded-2xl">
              <Video size={20} />
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-dark-850 border border-slate-200/60 dark:border-dark-800 rounded-3xl shadow-sm flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cloud Storage</span>
              <h3 className="text-2xl font-extrabold truncate">{formatBytes(stats?.storageUsage || 0)}</h3>
              <div className="w-full bg-slate-100 dark:bg-dark-850 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-teal-600 h-full rounded-full" style={{ width: `${storagePercentage}%` }} />
              </div>
              <p className="text-[10px] text-slate-450">{storagePercentage}% of 10 GB limit</p>
            </div>
            <div className="p-3 bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 rounded-2xl ml-4">
              <HardDrive size={20} />
            </div>
          </div>
        </div>

        {/* Admin Widgets Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Account Access Controller */}
          <div className="lg:col-span-2 p-6 bg-white dark:bg-dark-850 border border-slate-200/60 dark:border-dark-800 rounded-3xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-dark-800 pb-3">
              <div>
                <h2 className="font-bold text-sm">Permissions Quick Manager</h2>
                <p className="text-[11px] text-slate-400">Activate or deactivate user accounts instantly.</p>
              </div>
              <Link to="/admin" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-0.5">
                Admin Panel <ArrowUpRight size={12} />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-dark-800 overflow-y-auto max-h-[350px] pr-2">
              {adminUsers.map((u) => {
                const isSelf = u._id === user?._id;
                return (
                  <div key={u._id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
                        {u.name[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs truncate">
                          {u.name} {isSelf && <span className="text-[9px] text-teal-500 font-bold ml-1">(You)</span>}
                        </p>
                        <p className="text-[10px] text-slate-400 capitalize">{u.role} • {u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${u.isActive ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400'}`}>
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                      {!isSelf && (
                        <button
                          onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                          className={`px-2 py-1 text-[9px] font-extrabold border rounded-lg transition-colors ${u.isActive ? 'border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/10' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/10'}`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audit Logs Quick Feed */}
          <div className="p-6 bg-white dark:bg-dark-850 border border-slate-200/60 dark:border-dark-800 rounded-3xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-dark-800 pb-3">
              <div>
                <h2 className="font-bold text-sm">System Security Logs</h2>
                <p className="text-[11px] text-slate-400">Recent events log.</p>
              </div>
              <Terminal size={16} className="text-slate-400" />
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[350px]">
              {adminLogs.map((log) => (
                <div key={log._id} className="p-3 bg-slate-50 dark:bg-dark-900 rounded-2xl space-y-2 border border-slate-100 dark:border-dark-800">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{log.user?.name || 'Deleted Account'}</span>
                    <span className="text-slate-400">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal truncate max-w-[140px]">{log.details}</p>
                    <span className="px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 text-[8px] font-bold uppercase tracking-wider">
                      {log.action}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Activity Analytics Chart */}
        <div className="p-6 bg-white dark:bg-dark-850 border border-slate-200/60 dark:border-dark-800 rounded-3xl shadow-sm space-y-4">
          <div>
            <h2 className="font-bold text-sm">Monthly Audio & Session Audit Volume</h2>
            <p className="text-[11px] text-slate-400">System growth statistics over the past 6 months.</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.monthlyStats || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRecAdmin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-dark-800" />
                <XAxis dataKey="month" className="text-[10px] fill-slate-400" tickLine={false} />
                <YAxis className="text-[10px] fill-slate-400" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="recordings" name="Audio Uploaded" stroke="#0d9488" fill="url(#colorRecAdmin)" strokeWidth={2} />
                <Area type="monotone" dataKey="consultations" name="Consultations Scheduled" stroke="#2563eb" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // CONSULTANT DASHBOARD LAYOUT
  // ----------------------------------------------------
  if (user?.role === 'consultant') {
    const completedSessions = consultantSessions.filter(s => s.status === 'completed');
    const assignedRecordingsCount = stats?.recentUploads?.filter(r => r.consultation?.consultant?._id === user?._id).length || 0;

    return (
      <div className="space-y-8">
        {/* Title Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Consultant Activity Portal</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Review assigned client consultation audio logs, write session notes, and check your schedule.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white dark:bg-dark-850 border border-slate-200/60 dark:border-dark-800 rounded-3xl shadow-sm flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">My Consultations</span>
              <h3 className="text-3xl font-extrabold">{consultantSessions.length}</h3>
              <p className="text-[10px] text-slate-400">{completedSessions.length} Completed sessions</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-2xl">
              <CalendarDays size={20} />
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-dark-850 border border-slate-200/60 dark:border-dark-800 rounded-3xl shadow-sm flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Audio Files</span>
              <h3 className="text-3xl font-extrabold">{assignedRecordingsCount}</h3>
              <p className="text-[10px] text-slate-400">Available for playback & AI</p>
            </div>
            <div className="p-3 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 rounded-2xl">
              <Video size={20} />
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-dark-850 border border-slate-200/60 dark:border-dark-800 rounded-3xl shadow-sm flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Compiled Summaries</span>
              <h3 className="text-3xl font-extrabold">{stats?.totalRecordings || 0}</h3>
              <p className="text-[10px] text-teal-500 font-bold">Transcribed & Synced</p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 rounded-2xl">
              <FileText size={20} />
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-dark-850 border border-slate-200/60 dark:border-dark-800 rounded-3xl shadow-sm flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Clients</span>
              <h3 className="text-3xl font-extrabold">{stats?.totalClients || 0}</h3>
              <p className="text-[10px] text-slate-400">Unique contacts catalogued</p>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <Users size={20} />
            </div>
          </div>
        </div>

        {/* Consultant Widgets Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Session Agenda */}
          <div className="lg:col-span-2 p-6 bg-white dark:bg-dark-850 border border-slate-200/60 dark:border-dark-800 rounded-3xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-dark-800 pb-3">
              <div>
                <h2 className="font-bold text-sm">Upcoming Consultation Agenda</h2>
                <p className="text-[11px] text-slate-400">Your scheduled reviews and meetings list.</p>
              </div>
              <Link to="/consultations" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-0.5">
                Full Agenda <ArrowUpRight size={12} />
              </Link>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {consultantSessions.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
                  No consultations scheduled yet.
                </div>
              ) : (
                consultantSessions.map((session) => (
                  <div key={session._id} className="p-4 bg-slate-50 dark:bg-dark-900 border border-slate-250/50 dark:border-dark-800 rounded-2xl flex items-center justify-between hover:shadow-sm transition-all duration-200">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{session.client?.name}</span>
                        <span className={`px-2 py-0.2 rounded-full text-[8px] font-bold uppercase tracking-wider ${session.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' : 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'}`}>
                          {session.status}
                        </span>
                      </div>
                      <div className="flex gap-3 text-[10px] text-slate-400">
                        <span className="flex items-center gap-0.5"><CalendarDays size={10} /> {new Date(session.consultationDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        <span className="flex items-center gap-0.5"><Clock size={10} /> {session.duration} mins</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => navigate('/consultations')}
                      className="px-3 py-1.5 bg-white dark:bg-dark-800 hover:bg-teal-600 hover:text-white rounded-xl text-[10px] font-bold shadow-sm transition-all text-slate-650"
                    >
                      Assess
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Persistent Notes Scratchpad */}
          <div className="p-6 bg-white dark:bg-dark-850 border border-slate-200/60 dark:border-dark-800 rounded-3xl shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-dark-800 pb-3">
                <div>
                  <h2 className="font-bold text-sm">Consultant Scratchpad</h2>
                  <p className="text-[11px] text-slate-400">Save quick session ideas here.</p>
                </div>
                <button
                  onClick={handleSaveScratchpad}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-dark-850 rounded-lg text-teal-600 dark:text-teal-400 transition-colors"
                  title="Save scratchpad"
                >
                  <Save size={15} />
                </button>
              </div>

              <textarea
                value={scratchpad}
                onChange={(e) => setScratchpad(e.target.value)}
                placeholder="Draft checklist assessment guidelines or write session reminder points..."
                className="w-full h-52 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl p-3 text-xs focus:outline-none focus:border-teal-500 text-slate-700 dark:text-slate-200 leading-relaxed font-medium"
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Saved locally in browser storage</span>
              {scratchpadSaved && (
                <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                  <CheckCircle size={10} /> Saved!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // STAFF MEMBER DASHBOARD LAYOUT
  // ----------------------------------------------------
  if (user?.role === 'staff') {
    return (
      <div className="space-y-8 font-sans">
        {/* Title Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Operations Center</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Coordinate upcoming reviews, register new clients, and upload consultation recordings directly.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white dark:bg-dark-850 border border-slate-200/60 dark:border-dark-800 rounded-3xl shadow-sm flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scheduled Sessions</span>
              <h3 className="text-3xl font-extrabold">{stats?.totalConsultations || 0}</h3>
              <p className="text-[10px] text-slate-400">Consultation calendar slots</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-2xl">
              <CalendarDays size={20} />
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-dark-850 border border-slate-200/60 dark:border-dark-800 rounded-3xl shadow-sm flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Uploaded Audio</span>
              <h3 className="text-3xl font-extrabold">{stats?.totalRecordings || 0}</h3>
              <p className="text-[10px] text-slate-400">Transcripts available</p>
            </div>
            <div className="p-3 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 rounded-2xl">
              <Video size={20} />
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-dark-850 border border-slate-200/60 dark:border-dark-800 rounded-3xl shadow-sm flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Client Contacts</span>
              <h3 className="text-3xl font-extrabold">{stats?.totalClients || 0}</h3>
              <p className="text-[10px] text-emerald-500 font-bold">Active Directory list</p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 rounded-2xl">
              <Users size={20} />
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-dark-850 border border-slate-200/60 dark:border-dark-800 rounded-3xl shadow-sm flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Storage Used</span>
              <h3 className="text-2xl font-extrabold truncate">{formatBytes(stats?.storageUsage || 0)}</h3>
              <div className="w-full bg-slate-100 dark:bg-dark-850 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-teal-600 h-full rounded-full" style={{ width: `${storagePercentage}%` }} />
              </div>
              <p className="text-[10px] text-slate-400">{storagePercentage}% of 10 GB capacity</p>
            </div>
            <div className="p-3 bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 rounded-2xl ml-4">
              <HardDrive size={20} />
            </div>
          </div>
        </div>

        {/* Staff Dashboard Split Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* UPLOAD PANEL WIDGET */}
          <div className="p-6 bg-white dark:bg-dark-850 border border-slate-200/60 dark:border-dark-800 rounded-3xl shadow-sm space-y-4">
            <div className="border-b border-slate-100 dark:border-dark-800 pb-3">
              <h2 className="font-bold text-sm">Direct Audio Uploader</h2>
              <p className="text-[11px] text-slate-400">Select an active scheduled consultation session and upload its media recording.</p>
            </div>

            {staffSessions.length === 0 ? (
              <div className="p-6 bg-slate-50 dark:bg-dark-900 border border-dashed border-slate-200 dark:border-dark-800 rounded-2xl text-center text-xs text-slate-400">
                No pending scheduled consultations available for uploads. Use the form on the right to schedule one.
              </div>
            ) : (
              <form onSubmit={handleStaffUploadSubmit} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-400 mb-1">Target Consultation Session</label>
                  <select
                    required
                    value={uploadData.consultationId}
                    onChange={(e) => setUploadData({ ...uploadData, consultationId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl py-2 px-3 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-teal-500 font-medium"
                  >
                    <option value="">Select session slot...</option>
                    {staffSessions.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.client?.name} (With {s.consultant?.name}) - {new Date(s.consultationDate).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Recording Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Session consultation audio log"
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl py-2 px-3 focus:outline-none focus:border-teal-500 font-medium"
                  />
                </div>

                <div className="relative border border-dashed border-slate-200 dark:border-dark-800 hover:bg-slate-50 dark:hover:bg-dark-900 rounded-2xl p-6 text-center cursor-pointer transition-colors">
                  <input
                    type="file"
                    required
                    accept="audio/*,video/*"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <UploadCloud size={28} className="mx-auto text-slate-400 mb-1.5" />
                  <span className="block text-xs text-slate-400 font-bold truncate">
                    {uploadFile ? uploadFile.name : 'Drag & drop or click to choose file'}
                  </span>
                  <span className="block text-[10px] text-slate-450 mt-1 uppercase">Supports MP3, WAV, M4A, MP4 (Max 10MB)</span>
                </div>

                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl font-bold shadow-md shadow-teal-500/10 transition-colors flex items-center justify-center gap-1.5 text-xs"
                >
                  <UploadCloud size={14} />
                  {uploadLoading ? 'Uploading & Transcribing...' : 'Upload Session Media'}
                </button>
              </form>
            )}
          </div>

          {/* QUICK SCHEDULER WIDGET */}
          <div className="p-6 bg-white dark:bg-dark-850 border border-slate-200/60 dark:border-dark-800 rounded-3xl shadow-sm space-y-4">
            <div className="border-b border-slate-100 dark:border-dark-800 pb-3">
              <h2 className="font-bold text-sm">Quick Appointment Scheduler</h2>
              <p className="text-[11px] text-slate-400">Book new review consultation slots immediately.</p>
            </div>

            <form onSubmit={handleStaffScheduleSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Client Contact</label>
                  <select
                    required
                    value={scheduleData.client}
                    onChange={(e) => setScheduleData({ ...scheduleData, client: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl py-2 px-3 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-teal-500 font-medium"
                  >
                    <option value="">Select client...</option>
                    {staffClients.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Consultant Handler</label>
                  <select
                    required
                    value={scheduleData.consultant}
                    onChange={(e) => setScheduleData({ ...scheduleData, consultant: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl py-2 px-3 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-teal-500 font-medium"
                  >
                    <option value="">Select consultant...</option>
                    {staffConsultants.map((u) => (
                      <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Schedule Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduleData.consultationDate}
                    onChange={(e) => setScheduleData({ ...scheduleData, consultationDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl py-2.5 px-4 focus:outline-none focus:border-teal-500 font-medium text-slate-700 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Session Duration (Mins)</label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={240}
                    value={scheduleData.duration}
                    onChange={(e) => setScheduleData({ ...scheduleData, duration: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl py-2.5 px-4 focus:outline-none focus:border-teal-500 font-medium text-slate-700 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tags (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. follow-up, medical review"
                  value={scheduleData.tags}
                  onChange={(e) => setScheduleData({ ...scheduleData, tags: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl py-2.5 px-4 focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={scheduleLoading}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl font-bold shadow-md shadow-teal-500/10 transition-colors flex items-center justify-center gap-1.5 text-xs"
              >
                <Plus size={14} />
                {scheduleLoading ? 'Scheduling...' : 'Schedule Appointment Slot'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Fallback default system dashboard rendering
  return null;
};

export default Dashboard;

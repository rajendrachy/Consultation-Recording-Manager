import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Video,
  Mic,
  Cpu,
  ShieldAlert,
  Users,
  CalendarDays,
  FileText,
  BarChart3,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Terminal,
  Activity,
  UploadCloud,
  Check,
  Sun,
  Moon,
} from 'lucide-react';
import useThemeStore from '../store/themeStore';

const Home = () => {
  const { darkMode, toggleDarkMode } = useThemeStore();
  const [activeRole, setActiveRole] = useState('admin');

  const rolesData = {
    admin: {
      id: 'admin',
      name: 'Administrator',
      badge: 'System Controller',
      icon: ShieldAlert,
      color: 'red',
      gradient: 'from-rose-500 to-red-650',
      shadowColor: 'shadow-rose-500/10 dark:shadow-rose-500/5',
      textColor: 'text-rose-500 dark:text-rose-450',
      bgColor: 'bg-rose-500/10 dark:bg-rose-950/20 border-rose-500/20',
      permissionLevel: 'Level 4: Root Administration & Telemetry',
      description: 'Complete operational jurisdiction. Administrators govern the entire environment lifecycle: user key activation, tenant status toggling, global database backups, and CDN configurations.',
      permissions: ['USER_WRITE', 'AUDIT_LOG_READ', 'ENV_CONFIG_ALL', 'DB_OVERRIDE'],
      features: [
        'Instantly active or suspend registration keys',
        'Audit complete event loops & system access logs',
        'Configure database connection strings & API parameters',
        'Override storage constraints and delete assets'
      ],
      demoLink: '/login?role=admin',
      previewComponent: (
        <div className="bg-dark-900/90 dark:bg-dark-950/90 border border-dark-700/50 rounded-2xl p-4 font-mono text-xs text-slate-300 space-y-3 shadow-inner w-full max-w-sm sm:max-w-md mx-auto">
          <div className="flex items-center justify-between border-b border-dark-850 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className="font-bold text-[10px] text-rose-400 uppercase tracking-wider">Root Console</span>
            </div>
            <span className="text-[10px] text-slate-500">status: secure</span>
          </div>
          <div className="space-y-1 text-[11px] leading-relaxed">
            <p className="text-slate-500 font-mono"># fetching system logs...</p>
            <p className="text-teal-400 font-medium">auth_service: JWT verified for admin@crm.com</p>
            <p className="text-amber-400">warn: duplicate schema index detected (suppressed)</p>
            <p className="text-emerald-400">cloudinary_engine: status connected (200 OK)</p>
            <p className="text-purple-400">mongodb_atlas: connection pool optimized</p>
          </div>
          <div className="pt-2 border-t border-dark-850 flex justify-between items-center text-[10px]">
            <span className="text-slate-400">Users: 14 Active / 2 Suspended</span>
            <span className="px-2 py-0.5 rounded-full bg-dark-800 text-slate-350">v1.4-stable</span>
          </div>
        </div>
      )
    },
    consultant: {
      id: 'consultant',
      name: 'Consultant',
      badge: 'Clinical Workspace',
      icon: Users,
      color: 'teal',
      gradient: 'from-teal-500 to-emerald-600',
      shadowColor: 'shadow-teal-500/10 dark:shadow-teal-500/5',
      textColor: 'text-teal-600 dark:text-teal-450',
      bgColor: 'bg-teal-500/10 dark:bg-teal-950/20 border-teal-500/20',
      permissionLevel: 'Level 2: Medical/Consultation Data Review',
      description: 'Specially structured workspace designed for consultants, advisors, and doctors. Read auto-generated clinical transcriptions, search by keywords, and save summary notes.',
      permissions: ['CONSULTATION_READ', 'TRANSCRIPT_SEARCH', 'NOTES_EDIT', 'AUDIO_PLAY'],
      features: [
        'Explore chronological consultation record logs',
        'Search for specific patient keywords in audio transcripts',
        'Compose formatted summary logs & discussion bullet-points',
        'Stream audio and video logs directly in high fidelity'
      ],
      demoLink: '/login?role=consultant',
      previewComponent: (
        <div className="bg-dark-900/90 dark:bg-dark-950/90 border border-dark-700/50 rounded-2xl p-4 text-xs text-slate-300 space-y-3 shadow-inner w-full max-w-sm sm:max-w-md mx-auto">
          <div className="flex items-center justify-between border-b border-dark-850 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
              <span className="font-bold text-[10px] text-teal-400 uppercase tracking-wider">AI Transcript Assistant</span>
            </div>
            <span className="text-[10px] text-teal-400 font-semibold bg-teal-955 px-2 py-0.5 rounded-full">98.4% accuracy</span>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
            <div className="p-2 bg-dark-850/80 rounded-lg">
              <p className="text-[10px] text-teal-450 font-semibold mb-0.5">01:42 - Client</p>
              <p className="italic text-slate-300 text-[11px]">"We need to outline the key metrics of the system, including API load times."</p>
            </div>
            <div className="p-2 bg-dark-850/80 rounded-lg">
              <p className="text-[10px] text-emerald-450 font-semibold mb-0.5">02:05 - Consultant</p>
              <p className="italic text-slate-300 text-[11px]">"Yes, our goals are to ensure database replication latency stays below 100ms."</p>
            </div>
          </div>
          <div className="border-t border-dark-850 pt-2 flex items-center gap-2">
            <span className="text-[9px] bg-teal-950/60 border border-teal-800/40 text-teal-300 px-2 py-0.5 rounded-full">AI Summary generated</span>
            <span className="text-[9px] bg-dark-800 text-slate-350 px-2 py-0.5 rounded-full font-mono">Word count: 840</span>
          </div>
        </div>
      )
    },
    staff: {
      id: 'staff',
      name: 'Staff Member',
      badge: 'Operations Desk',
      icon: CalendarDays,
      color: 'blue',
      gradient: 'from-blue-500 to-indigo-600',
      shadowColor: 'shadow-blue-500/10 dark:shadow-blue-500/5',
      textColor: 'text-blue-500 dark:text-blue-450',
      bgColor: 'bg-blue-500/10 dark:bg-blue-950/20 border-blue-500/20',
      permissionLevel: 'Level 1: Media Intake & Coordinator Access',
      description: 'Streamlined operational client-relations desk. Staff members intake new clients, setup booking calendars, drag-and-drop recording files, and monitor upload queue queues.',
      permissions: ['CLIENT_WRITE', 'RECORDING_WRITE', 'CALENDAR_EDIT', 'UPLOAD_QUEUE_MGMT'],
      features: [
        'Create and update customer profile index cards',
        'Drag-and-drop audio consultation records directly',
        'Coordinate booking schedules & assign doctors',
        'Track queue uploading statuses in real-time'
      ],
      demoLink: '/login?role=staff',
      previewComponent: (
        <div className="bg-dark-900/90 dark:bg-dark-950/90 border border-dark-700/50 rounded-2xl p-4 text-xs text-slate-300 space-y-4 shadow-inner w-full max-w-sm sm:max-w-md mx-auto">
          <div className="flex items-center justify-between border-b border-dark-850 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-550"></span>
              <span className="font-bold text-[10px] text-blue-400 uppercase tracking-wider">Intake Upload Queue</span>
            </div>
            <span className="text-[10px] text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded-full">Active upload (1)</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="font-semibold text-slate-200">Consultation_John_Doe_0611.mp3</span>
              <span className="text-slate-400 font-mono">74% of 42MB</span>
            </div>
            <div className="w-full bg-dark-850 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '74%' }}></div>
            </div>
            <p className="text-[9px] text-slate-500 leading-normal">Streaming bytes direct to secure Cloudinary bucket...</p>
          </div>
          <div className="border-t border-dark-850 pt-2 flex justify-between items-center text-[10px]">
            <span className="text-slate-400">Uploader: Active</span>
            <span className="text-emerald-450 font-semibold">SSL connection secure</span>
          </div>
        </div>
      )
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-teal-500/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-[400px] right-10 w-96 h-96 bg-purple-500/5 blur-3xl rounded-full pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-slate-200/60 dark:border-dark-800/80 bg-white/70 dark:bg-dark-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-teal-600/20">
              C
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-teal-600 to-cyan-500 bg-clip-text text-transparent">
              RecManager
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 bg-slate-100 dark:bg-dark-800 border border-slate-200/50 dark:border-dark-750 text-slate-500 dark:text-slate-400 hover:text-teal-650 dark:hover:text-teal-400 hover:bg-slate-200 dark:hover:bg-dark-700 rounded-xl transition-all shadow-sm flex items-center justify-center"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <Link
              to="/login?role=admin"
              className="px-3 py-1.5 border border-teal-500/30 hover:border-teal-500 text-xs font-extrabold text-teal-600 dark:text-teal-400 hover:bg-teal-500/5 rounded-xl transition-all flex items-center gap-1"
            >
              <Sparkles size={12} className="animate-pulse" />
              Demo Access
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="glow-btn px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl text-sm font-bold shadow-md shadow-teal-500/10 hover:shadow-lg transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 text-center space-y-8">
        
        {/* Glowing live system status badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-semibold backdrop-blur-md shadow-inner select-none animate-pulse">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="tracking-wide uppercase text-[10px] font-bold">System Nodes Active</span>
          <span className="text-slate-350 dark:text-slate-700">|</span>
          <span className="flex items-center gap-1 font-medium">
            <Sparkles size={12} className="animate-spin text-teal-500" style={{ animationDuration: '4s' }} />
            <span>AI Platform Online</span>
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          Enterprise-Grade{' '}
          <span className="bg-gradient-to-r from-teal-500 via-cyan-505 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
            Consultation Recording
          </span>{' '}
          Manager
        </h1>

        <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Unlock the value of your meetings. Store, transcribe, search, and analyze consultation recordings with role-based access control, secure storage, and smart summaries.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
          <Link
            to="/login?role=admin"
            className="relative group inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-600 text-white rounded-2xl text-base font-extrabold shadow-xl shadow-teal-500/20 transition-all duration-300 hover:shadow-teal-500/35 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
          >
            {/* Pulsing glow ring around the button */}
            <div className="absolute inset-0 border border-teal-300/30 rounded-2xl group-hover:scale-105 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Sparkles size={16} className="text-teal-200 animate-pulse" />
            <span>Launch Demo Portal</span>
            <span className="bg-teal-950/45 text-teal-300 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-teal-500/30">
              Admin Auto-fill
            </span>
          </Link>

          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 hover:bg-slate-50 dark:hover:bg-dark-800 hover:border-slate-350 dark:hover:border-dark-700 text-slate-700 dark:text-slate-200 rounded-2xl text-base font-bold shadow-sm transition-all active:scale-[0.98]"
          >
            Create Account
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Quick Demo Access Cards */}
        <div className="pt-8 max-w-4xl mx-auto space-y-4">
          <p className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            ⚡ Quick-Connect Sandbox Portals
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Admin Pill Card */}
            <Link 
              to="/login?role=admin"
              className="p-5 bg-white/40 dark:bg-dark-900/40 backdrop-blur-md border border-slate-200 dark:border-dark-800 hover:border-rose-500/30 dark:hover:border-rose-500/40 rounded-3xl flex flex-col items-center text-center space-y-3 transition-all duration-300 hover:scale-[1.03] group relative overflow-hidden shadow-sm hover:shadow-md dark:shadow-none"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 dark:text-rose-450 flex items-center justify-center font-black text-sm">
                A
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-rose-500 dark:group-hover:text-rose-450 transition-colors">System Administrator</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Manage users, audit trails & override DB</p>
              </div>
              <span className="px-3 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[9px] font-bold uppercase tracking-wider rounded-xl border border-rose-500/20">
                Connect
              </span>
            </Link>

            {/* Consultant Pill Card */}
            <Link 
              to="/login?role=consultant"
              className="p-5 bg-white/40 dark:bg-dark-900/40 backdrop-blur-md border border-slate-200 dark:border-dark-800 hover:border-teal-500/30 dark:hover:border-teal-500/40 rounded-3xl flex flex-col items-center text-center space-y-3 transition-all duration-300 hover:scale-[1.03] group relative overflow-hidden shadow-sm hover:shadow-md dark:shadow-none"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-500 dark:text-teal-450 flex items-center justify-center font-black text-sm">
                C
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-teal-500 dark:group-hover:text-teal-450 transition-colors">Clinical Consultant</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">View recordings, search transcripts & notes</p>
              </div>
              <span className="px-3 py-1 bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[9px] font-bold uppercase tracking-wider rounded-xl border border-teal-500/20">
                Connect
              </span>
            </Link>

            {/* Staff Pill Card */}
            <Link 
              to="/login?role=staff"
              className="p-5 bg-white/40 dark:bg-dark-900/40 backdrop-blur-md border border-slate-200 dark:border-dark-800 hover:border-blue-500/30 dark:hover:border-blue-500/40 rounded-3xl flex flex-col items-center text-center space-y-3 transition-all duration-300 hover:scale-[1.03] group relative overflow-hidden shadow-sm hover:shadow-md dark:shadow-none"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 dark:text-blue-450 flex items-center justify-center font-black text-sm">
                S
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-500 dark:group-hover:text-blue-450 transition-colors">Office Intake Staff</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Register clients, book slots & upload audio</p>
              </div>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-bold uppercase tracking-wider rounded-xl border border-blue-500/20">
                Connect
              </span>
            </Link>

          </div>
        </div>

        {/* Live Platform Metrics Bar */}
        <div className="pt-6 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-white/40 dark:bg-dark-900/40 border border-slate-200/50 dark:border-dark-800/85 backdrop-blur-md rounded-3xl shadow-lg dark:shadow-none animate-fade-in">
            <div className="text-center space-y-1">
              <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
                12,400+
              </p>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Records Synced
              </p>
            </div>
            <div className="text-center space-y-1 border-t sm:border-t-0 border-l-0 sm:border-l border-slate-200/60 dark:border-dark-800/80 pt-4 sm:pt-0">
              <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                450k+
              </p>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Transcribed Min
              </p>
            </div>
            <div className="text-center space-y-1 border-t sm:border-t-0 border-l-0 sm:border-l border-slate-200/60 dark:border-dark-800/80 pt-4 sm:pt-0">
              <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                99.99%
              </p>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                System Uptime
              </p>
            </div>
            <div className="text-center space-y-1 border-t sm:border-t-0 border-l-0 sm:border-l border-slate-200/60 dark:border-dark-800/80 pt-4 sm:pt-0">
              <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                &lt; 1.8s
              </p>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                API Response
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Graphic Mockup */}
        <div className="pt-16 max-w-5xl mx-auto">
          <div className="relative rounded-3xl border border-slate-200/80 dark:border-dark-800/80 bg-white dark:bg-dark-900 p-4 shadow-2xl overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 h-42 bg-gradient-to-t from-slate-50 dark:from-dark-950 to-transparent z-10 pointer-events-none" />
            <div className="w-full rounded-2xl overflow-hidden border border-slate-200/50 dark:border-dark-850/80 bg-slate-900 shadow-inner">
              
              {/* Browser Window Bar */}
              <div className="h-12 border-b border-slate-200/60 dark:border-dark-800 bg-white/70 dark:bg-[#0f172a]/70 px-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-500/80" />
                  <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80" />
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="w-72 h-6 bg-slate-100 dark:bg-dark-800/70 border border-slate-200/50 dark:border-dark-700/50 rounded-lg flex items-center justify-center text-[10px] text-slate-400 font-medium font-sans">
                  app.recmanager.com/dashboard
                </div>
                <div className="w-3.5 h-3.5" />
              </div>

              {/* Real Dashboard Image preview */}
              <img 
                src="/dashboard_preview.png" 
                alt="CRM Platform Dashboard Preview" 
                className="w-full h-auto object-cover max-h-[500px]"
              />

            </div>
          </div>
        </div>
      </section>

      {/* Core Pillars / Features Section */}
      <section className="bg-white dark:bg-dark-900/60 border-y border-slate-200/60 dark:border-dark-850/80 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight">Streamlined Architecture & Workflows</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm">
              Purpose-built solutions designed to enhance storage structure, automation, and analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Capture & Store */}
            <div className="bg-slate-50 dark:bg-dark-850 border border-slate-200/40 dark:border-dark-800 p-6 rounded-3xl space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="p-3.5 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 rounded-2xl w-fit">
                <Mic size={24} />
              </div>
              <h3 className="font-bold text-lg">Secure Uploads</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                Seamlessly upload audio and video recordings. Automatically saved using robust storage engines like Cloudinary.
              </p>
            </div>

            {/* Smart Transcription */}
            <div className="bg-slate-50 dark:bg-dark-850 border border-slate-200/40 dark:border-dark-800 p-6 rounded-3xl space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="p-3.5 bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 rounded-2xl w-fit">
                <Cpu size={24} />
              </div>
              <h3 className="font-bold text-lg">AI Transcription</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                Generate instant NLP transcripts, bulleted discussion summaries, and automatic action items checklists.
              </p>
            </div>

            {/* Rich Note Taking */}
            <div className="bg-slate-50 dark:bg-dark-850 border border-slate-200/40 dark:border-dark-800 p-6 rounded-3xl space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-2xl w-fit">
                <FileText size={24} />
              </div>
              <h3 className="font-bold text-lg">Rich Context Notes</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                Attach formatted summary logs, detailed consultation notes, and private reminders alongside each recording.
              </p>
            </div>

            {/* Metrics Dashboard */}
            <div className="bg-slate-50 dark:bg-dark-850 border border-slate-200/40 dark:border-dark-800 p-6 rounded-3xl space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-2xl w-fit">
                <BarChart3 size={24} />
              </div>
              <h3 className="font-bold text-lg">Visual Analytics</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                Review storage capacity, recent logs, monthly trends, and consultant performance indices on visual chart layouts.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Role Segmentation Section - Premium Interactive Role Portal Inspector */}
      <section className="max-w-7xl mx-auto px-6 py-24 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-650 text-teal-650 text-teal-600 dark:text-teal-400 rounded-full text-[10px] font-bold tracking-widest uppercase">
            RBAC Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Interactive Role Portal Inspector</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-xs sm:text-sm">
            Role-Based Access Control guarantees top-tier enterprise data isolation. Select a role profile below to preview permissions and test-drive live user layouts.
          </p>
        </div>

        {/* Tab Controllers */}
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-3 p-1.5 bg-slate-200/60 dark:bg-dark-900/60 backdrop-blur-sm border border-slate-300/40 dark:border-dark-800/80 rounded-2xl">
          {Object.values(rolesData).map((role) => {
            const IconComponent = role.icon;
            const isActive = activeRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 py-3 px-4 rounded-xl text-center sm:text-left transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-r ${role.gradient} text-white shadow-lg ${role.shadowColor} scale-[1.02]`
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-dark-800/60'
                }`}
              >
                <IconComponent size={18} className={`${isActive ? 'text-white' : 'text-slate-400'}`} />
                <div className="hidden sm:block">
                  <p className="text-xs font-bold leading-tight">{role.name}</p>
                  <p className={`text-[9px] ${isActive ? 'text-white/80' : 'text-slate-550 text-slate-500'} font-medium`}>{role.badge}</p>
                </div>
                <span className="sm:hidden text-[10px] font-bold">{role.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Preview Panel */}
        <div className="max-w-5xl mx-auto bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-dark-800/80 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-100/10 dark:shadow-none transition-all duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Info Column (Left side of layout container) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase border ${rolesData[activeRole].bgColor}`}>
                  <ShieldCheck size={11} className={rolesData[activeRole].textColor} />
                  <span>{rolesData[activeRole].permissionLevel}</span>
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
                  Operating as {rolesData[activeRole].name}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {rolesData[activeRole].description}
                </p>
              </div>

              {/* Scope Keys list */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Authorized Scopes</p>
                <div className="flex flex-wrap gap-1.5">
                  {rolesData[activeRole].permissions.map((perm) => (
                    <span key={perm} className="px-2 py-0.5 bg-slate-100 dark:bg-dark-800 border border-slate-200/50 dark:border-dark-750 text-slate-650 dark:text-slate-300 rounded font-mono text-[9px] uppercase tracking-wider font-bold">
                      {perm}
                    </span>
                  ))}
                </div>
              </div>

              {/* Features checklist */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Operational Capabilities</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {rolesData[activeRole].features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-slate-600 dark:text-slate-350 dark:text-slate-300">
                      <span className="mt-0.5 text-emerald-500 flex-shrink-0">
                        <CheckCircle2 size={14} className="fill-emerald-500/10" />
                      </span>
                      <span className="leading-snug text-[11px]">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <Link
                  to={rolesData[activeRole].demoLink}
                  className={`relative group inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r ${rolesData[activeRole].gradient} text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all duration-300 active:scale-[0.98] overflow-hidden`}
                >
                  <Sparkles size={13} className="text-white/80 animate-pulse" />
                  <span>Launch {rolesData[activeRole].name} Demo</span>
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-[200px] leading-tight font-medium">
                  Redirects to Sign In and auto-fills demo credentials.
                </p>
              </div>
            </div>

            {/* Interactive Preview Container (Right side of layout container) */}
            <div className="lg:col-span-5 flex items-center justify-center lg:border-l lg:border-slate-200/60 dark:lg:border-dark-800/80 lg:pl-8">
              <div className="w-full relative group">
                {/* Background glow behind container */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${rolesData[activeRole].gradient} rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000`} />
                <div className="relative">
                  {rolesData[activeRole].previewComponent}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Footer Wrapper */}
      <section className="bg-gradient-to-r from-teal-900 to-cyan-950 text-white py-20 px-6 border-t border-teal-800">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to Organize Your Consultations?</h2>
          <p className="text-teal-200 text-sm sm:text-base max-w-xl mx-auto">
            Get started immediately. Test user creation, try the demo logins, explore dark/light modes, and experience AI transcription.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3.5 bg-white text-teal-900 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors shadow-lg shadow-black/10"
            >
              Register Account
            </Link>
            <Link
              to="/login?role=admin"
              className="px-6 py-3.5 bg-transparent border border-teal-500 hover:bg-teal-850/50 text-white rounded-xl text-sm font-bold transition-all"
            >
              Sign In to Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Standard Footer */}
      <footer className="bg-slate-100 dark:bg-dark-950 border-t border-slate-200 dark:border-dark-900 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>Consultation Recording Manager © 2026. Production level portal setup.</div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-teal-500">Privacy Policy</a>
            <a href="#" className="hover:text-teal-500">Terms of Use</a>
            <span className="text-slate-300 dark:text-dark-800">|</span>
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-1.5 hover:text-teal-500 text-slate-500 dark:text-slate-400 transition-colors font-semibold"
              aria-label="Toggle Theme"
            >
              {darkMode ? (
                <>
                  <Sun size={12} className="text-amber-500" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon size={12} className="text-indigo-400" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;

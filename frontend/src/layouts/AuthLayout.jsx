import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row font-sans overflow-x-hidden relative">
      
      {/* Left Pane - Visual Tech Panel (Visible only on Desktop) */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-[#0a0f1d] via-[#020617] to-slate-950 items-center justify-center p-16 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-[150px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none animate-pulse" />
        
        {/* Main Background Image Visual */}
        <div 
          className="absolute inset-0 bg-center bg-no-repeat opacity-40 mix-blend-screen scale-110 pointer-events-none"
          style={{ 
            backgroundImage: "url('/auth_decoration.png')",
            backgroundSize: '80%'
          }} 
        />
        
        {/* Transparent visual overlay cards */}
        <div className="relative z-10 max-w-lg space-y-8 bg-slate-900/30 border border-white/5 backdrop-blur-md p-10 rounded-3xl shadow-2xl">
          <div className="space-y-3">
            <span className="px-3 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-full text-xs font-semibold">
              Platform Features
            </span>
            <h3 className="text-3xl font-extrabold text-white leading-tight">
              Unlock the Value of Your Professional Consultations
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Empower your staff, consultants, and management with advanced audio analysis, granular audit logging, and automated summaries.
            </p>
          </div>

          {/* Showcase Features Grid */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-1">
              <h4 className="text-teal-400 font-bold text-lg">99.9%</h4>
              <p className="text-slate-300 font-semibold text-xs">AI Audio Accuracy</p>
              <p className="text-[10px] text-slate-500 leading-normal">Smart NLP transcribing engine fallbacks.</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-1">
              <h4 className="text-cyan-400 font-bold text-lg">AES-256</h4>
              <p className="text-slate-300 font-semibold text-xs">Media Vaulting</p>
              <p className="text-[10px] text-slate-500 leading-normal">Granular role permission constraints.</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-1">
              <h4 className="text-blue-400 font-bold text-lg">Cloudinary</h4>
              <p className="text-slate-300 font-semibold text-xs">Multi-Engine Storage</p>
              <p className="text-[10px] text-slate-500 leading-normal">Local fallback storage directories active.</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-1">
              <h4 className="text-indigo-400 font-bold text-lg">RBAC</h4>
              <p className="text-slate-300 font-semibold text-xs">Audited Dashboards</p>
              <p className="text-[10px] text-slate-500 leading-normal">Dedicated Admin, Consultant, and Staff panels.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Core Auth Forms */}
      <div className="w-full lg:w-[650px] flex-shrink-0 flex items-center justify-center p-6 sm:p-12 md:p-16 relative min-h-screen overflow-y-auto bg-[#090d16] border-l border-white/5">
        {/* Decorative blurred backgrounds */}
        <div className="absolute top-10 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Auth Spaced Container - no double-nested card container */}
        <div className="w-full max-w-xl relative z-10 my-auto px-2">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-teal-500/20 mb-3">
              C
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Consultation Recording Manager
            </h2>
            <p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold mt-1">
              Secure Enterprise Portal
            </p>
          </div>

          {/* Render Page Contents */}
          {children}
        </div>
      </div>
      
    </div>
  );
};

export default AuthLayout;

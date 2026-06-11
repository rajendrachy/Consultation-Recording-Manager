import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Login = () => {
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);

  // Parse redirect path or defaults to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    clearError();
    // Check if redirected because of expired session
    if (location.search.includes('expired=true')) {
      setSessionExpired(true);
    }

    // Parse role query parameter for credentials auto-filling
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam) {
      if (roleParam === 'admin') {
        setEmail('admin@crm.com');
        setPassword('password123');
      } else if (roleParam === 'consultant') {
        setEmail('consultant@crm.com');
        setPassword('password123');
      } else if (roleParam === 'staff') {
        setEmail('staff@crm.com');
        setPassword('password123');
      }
    }
  }, [location, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSessionExpired(false);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      // Error handled by store state
    }
  };

  const handleDemoLogin = (role) => {
    let demoEmail = '';
    let demoPass = 'password123';
    
    if (role === 'admin') {
      demoEmail = 'admin@crm.com';
    } else if (role === 'consultant') {
      demoEmail = 'consultant@crm.com';
    } else {
      demoEmail = 'staff@crm.com';
    }
    
    setEmail(demoEmail);
    setPassword(demoPass);
    setSessionExpired(false);

    if (window.showToast) {
      window.showToast(`Autofilled credentials for ${role}. Click Sign In to enter.`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link to="/" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold">
          <ArrowLeft size={14} />
          Back to Home
        </Link>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">Welcome Back</h3>
        <p className="text-xs text-slate-400">Sign in to manage recordings and view transcripts.</p>
      </div>

      {sessionExpired && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-xs font-medium">
          Your session has expired. Please log in again to continue.
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Address Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
              <Mail size={16} />
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@crm.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-teal-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
              <Lock size={16} />
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-teal-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="text-center">
        <p className="text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-teal-400 hover:underline">
            Register now
          </Link>
        </p>
      </div>

      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-white/10"></div>
        <span className="flex-shrink mx-4 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Or Quick Demo Login</span>
        <div className="flex-grow border-t border-white/10"></div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => handleDemoLogin('admin')}
          className="flex flex-col items-center justify-center p-2.5 bg-white/5 border border-red-500/20 hover:border-red-500/50 hover:bg-red-500/5 rounded-xl transition-all active:scale-[0.98]"
        >
          <span className="text-[10px] font-bold text-red-400">Admin</span>
          <span className="text-[8px] text-slate-500 mt-0.5">Control Panel</span>
        </button>
        <button
          type="button"
          onClick={() => handleDemoLogin('consultant')}
          className="flex flex-col items-center justify-center p-2.5 bg-white/5 border border-teal-500/20 hover:border-teal-500/50 hover:bg-teal-500/5 rounded-xl transition-all active:scale-[0.98]"
        >
          <span className="text-[10px] font-bold text-teal-400">Consultant</span>
          <span className="text-[8px] text-slate-500 mt-0.5">Notes & Audio</span>
        </button>
        <button
          type="button"
          onClick={() => handleDemoLogin('staff')}
          className="flex flex-col items-center justify-center p-2.5 bg-white/5 border border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/5 rounded-xl transition-all active:scale-[0.98]"
        >
          <span className="text-[10px] font-bold text-blue-400">Staff</span>
          <span className="text-[8px] text-slate-500 mt-0.5">Media Upload</span>
        </button>
      </div>
    </div>
  );
};

export default Login;

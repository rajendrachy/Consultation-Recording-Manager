import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft, CheckCircle, ShieldCheck } from 'lucide-react';
import api from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = Email Input, 2 = OTP Code Verification
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mockOtp, setMockOtp] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMockOtp('');
    try {
      const response = await api.post('/auth/forgotpassword', { email });
      setSuccessMsg(response.data.message);
      // Capture the mock OTP returned from backend to show to user for local testing convenience
      if (response.data.otp) {
        setMockOtp(response.data.otp);
      }
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      const { resetToken } = response.data;
      
      // Navigate to the reset password page with the token
      navigate(`/reset-password/${resetToken}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please check the OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/login" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h3 className="text-lg font-semibold text-white">Reset Password</h3>
          <p className="text-xs text-slate-400">
            {step === 1 ? 'Enter your registered email.' : 'Enter the verification OTP.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium">
          {error}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Account Email
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
                placeholder="e.g. sarah@crm.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-teal-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Sending OTP...
              </>
            ) : (
              'Send OTP Code'
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex gap-3 text-emerald-400 text-xs mb-2">
            <CheckCircle size={20} className="flex-shrink-0" />
            <div>
              <p className="font-semibold">OTP Code Dispatched</p>
              <p className="mt-1 text-slate-300">
                {successMsg || 'Check your registered email address for the code.'}
              </p>
            </div>
          </div>

          {mockOtp && (
            <div className="p-4 bg-teal-500/10 border border-teal-500/30 rounded-2xl space-y-2 mb-2">
              <p className="text-xs text-slate-300">
                <strong>Local Test Mocking:</strong> We detected you don't have configured SMTP. Here is the OTP sent to email:
              </p>
              <div className="bg-teal-950/40 text-center py-2 rounded-lg font-mono text-teal-400 text-base tracking-widest font-extrabold border border-teal-500/20">
                {mockOtp}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Enter 6-Digit OTP Code
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                <ShieldCheck size={16} />
              </span>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 123456"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors tracking-widest font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-teal-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify OTP Code'
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-slate-400 hover:text-white hover:underline"
            >
              Change email address
            </button>
          </div>
        </form>
      )}

      <div className="text-center pt-2">
        <Link to="/login" className="text-xs font-semibold text-teal-400 hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;

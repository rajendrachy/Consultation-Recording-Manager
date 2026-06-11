import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, HelpCircle, ShieldAlert } from 'lucide-react';
import api from '../services/api';

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/admin/settings');
        setSettings(response.data.settings);
      } catch (err) {
        console.error('Failed to load system settings:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await api.put('/admin/settings', settings);
      setSettings(response.data.settings);
      if (window.showToast) window.showToast('System settings updated successfully', 'success');
    } catch (err) {
      if (window.showToast) window.showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
          Configure application variables, file upload rules, and transcription behaviors.
        </p>
      </div>

      <div className="bg-white dark:bg-dark-850 border border-slate-200/50 dark:border-dark-800 rounded-3xl shadow-sm p-6 space-y-6">
        <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon size={16} />
          Global Configuration
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs font-semibold">
          
          {/* Organization Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-slate-900 dark:text-white mb-0.5">Organization Name</label>
              <span className="block text-[10px] text-slate-400 font-medium">Used across email templates and logos.</span>
            </div>
            <input
              type="text"
              required
              value={settings?.organizationName || ''}
              onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
              className="bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-xl py-2.5 px-4 focus:outline-none focus:border-teal-500 text-xs font-medium"
            />
          </div>

          {/* Max File Size MB */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center border-t border-slate-100 dark:border-dark-800/50 pt-4">
            <div>
              <label className="block text-slate-900 dark:text-white mb-0.5">Maximum File Size Limit (MB)</label>
              <span className="block text-[10px] text-slate-400 font-medium">Refuses uploads exceeding this ceiling limit.</span>
            </div>
            <input
              type="number"
              required
              min={10}
              max={200}
              value={settings?.maxUploadSizeMB || 50}
              onChange={(e) => setSettings({ ...settings, maxUploadSizeMB: parseInt(e.target.value, 10) })}
              className="bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-xl py-2.5 px-4 focus:outline-none focus:border-teal-500 text-xs font-medium"
            />
          </div>

          {/* AI auto transcription trigger toggle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center border-t border-slate-100 dark:border-dark-800/50 pt-4">
            <div>
              <label className="block text-slate-900 dark:text-white mb-0.5">Automated AI Transcription</label>
              <span className="block text-[10px] text-slate-400 font-medium">
                Runs AI summaries and transcribing logs immediately upon upload.
              </span>
            </div>
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.enableAIAutoTranscription || false}
                  onChange={(e) => setSettings({ ...settings, enableAIAutoTranscription: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-dark-800 rounded-full peer peer-focus:ring-2 peer-focus:ring-teal-350 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-650" />
              </label>
            </div>
          </div>

          {/* Allowed upload file types info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center border-t border-slate-100 dark:border-dark-800/50 pt-4">
            <div>
              <label className="block text-slate-900 dark:text-white mb-0.5">Supported Media Extensions</label>
              <span className="block text-[10px] text-slate-400 font-medium">Verified by upload filters.</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {settings?.allowedUploadFormats?.map((fmt) => (
                <span
                  key={fmt}
                  className="px-2.5 py-1 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-lg text-[10px] uppercase font-bold text-slate-500"
                >
                  .{fmt}
                </span>
              ))}
            </div>
          </div>

          {/* Warning notice */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex gap-3 text-amber-500 text-[11px] font-medium leading-relaxed mt-6">
            <ShieldAlert size={20} className="flex-shrink-0" />
            <div>
              <p className="font-bold">Security & Performance</p>
              <p className="mt-0.5 text-slate-655 dark:text-slate-350">
                Updating system configuration flags will update server in-memory settings immediately. Please exercise caution when setting limits.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-1.5 px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-500/10 transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </form>
      </div>

    </div>
  );
};

export default Settings;

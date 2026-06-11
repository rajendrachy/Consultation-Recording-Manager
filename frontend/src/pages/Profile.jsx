import React, { useState } from 'react';
import { User, Mail, Shield, Key, Loader2, CheckCircle, Camera } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const Profile = () => {
  const { user, updateProfile } = useAuthStore();

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');

  const getMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('/uploads/')) {
      return `http://localhost:5000${url}`;
    }
    return url;
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // 2MB size limit check
      if (file.size > 2 * 1024 * 1024) {
        setProfileError('File is too large. Profile pictures must be under 2MB.');
        if (window.showToast) window.showToast('Profile picture must be under 2MB', 'error');
        return;
      }
      setProfileError('');
      setAvatarPreview(URL.createObjectURL(file));
      setProfileLoading(true);
      
      try {
        const formData = new FormData();
        formData.append('avatar', file);
        
        if (window.showToast) window.showToast('Uploading profile picture...', 'info');

        const response = await api.put('/auth/profile', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        updateProfile(response.data.data);
        setAvatarFile(null);
        if (window.showToast) window.showToast('Profile picture uploaded successfully', 'success');
      } catch (err) {
        setProfileError(err.response?.data?.message || 'Failed to upload profile picture.');
        if (window.showToast) window.showToast('Failed to upload profile picture', 'error');
        setAvatarPreview(user?.avatar || '');
      } finally {
        setProfileLoading(false);
      }
    }
  };

  // Password Change States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const response = await api.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      updateProfile(response.data.data);
      setAvatarFile(null); // Clear selected file once saved
      if (window.showToast) window.showToast('Profile updated successfully', 'success');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to save profile changes.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.put('/auth/changepassword', {
        currentPassword,
        newPassword,
      });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (window.showToast) window.showToast('Password changed successfully', 'success');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
          Review credentials, update information details, and secure passwords.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Details Box (2 Columns) */}
        <div className="md:col-span-2 bg-white dark:bg-dark-850 border border-slate-200/50 dark:border-dark-800 rounded-3xl shadow-sm p-6 space-y-6">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <User size={16} />
            Profile Details
          </h2>

          {profileError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
              {profileError}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs font-semibold">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-xl py-2.5 px-4 focus:outline-none focus:border-teal-500 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-xl py-2.5 px-4 focus:outline-none focus:border-teal-500 text-xs font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="px-6 py-2.5 bg-teal-650 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 hover:bg-teal-650/10 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
            >
              {profileLoading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* User Card Box (1 Column) */}
        <div className="md:col-span-1 bg-white dark:bg-dark-850 border border-slate-200/50 dark:border-dark-800 rounded-3xl shadow-sm p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-3xl bg-teal-650/10 border border-teal-200 dark:border-teal-850 text-teal-600 flex items-center justify-center font-black text-3xl shadow-sm overflow-hidden relative">
              {avatarPreview ? (
                <img src={getMediaUrl(avatarPreview)} alt="Profile Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.name ? user.name[0].toUpperCase() : 'U'
              )}
              
              {/* Spinner during update saving/uploading */}
              {profileLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs">
                  <Loader2 size={20} className="text-white animate-spin" />
                </div>
              )}
            </div>
            
            {/* Upload image trigger button overlay */}
            <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 rounded-3xl cursor-pointer transition-opacity text-white" title="Change Profile Picture">
              <Camera size={20} className="animate-pulse" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">{user?.name}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">{user?.email}</p>
            {avatarFile && (
              <p className="text-[9px] text-teal-500 font-bold mt-1.5 animate-pulse">
                Pending upload: {avatarFile.name.substring(0, 15)}...
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Shield size={10} />
            Role: {user?.role}
          </div>
        </div>

      </div>

      {/* Security & Password Reset Form */}
      <div className="bg-white dark:bg-dark-850 border border-slate-200/50 dark:border-dark-800 rounded-3xl shadow-sm p-6 space-y-6">
        <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Key size={16} />
          Change Password
        </h2>

        {passwordError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium">
            {passwordError}
          </div>
        )}

        {passwordSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-medium flex gap-2 items-center">
            <CheckCircle size={14} />
            Password updated successfully.
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 text-xs font-semibold max-w-xl">
          <div>
            <label className="block text-slate-400 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-xl py-2.5 px-4 focus:outline-none focus:border-teal-500 text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-xl py-2.5 px-4 focus:outline-none focus:border-teal-500 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-xl py-2.5 px-4 focus:outline-none focus:border-teal-500 text-xs font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="px-6 py-2.5 bg-teal-650 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 hover:bg-teal-650/10 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
          >
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

    </div>
  );
};

export default Profile;

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, ListFilter, Trash2, Edit2, Shield, Calendar, Terminal } from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const Admin = () => {
  const { user: currentUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState('users'); // users, logs
  
  // Users list state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  
  // Audit logs state
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logPage, setLogPage] = useState(1);
  const [totalLogPages, setTotalLogPages] = useState(1);

  // Fetch Users
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.data);
    } catch (err) {
      if (window.showToast) window.showToast('Failed to load user accounts', 'error');
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch Activity Logs
  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const response = await api.get(`/admin/logs?page=${logPage}&limit=15`);
      setLogs(response.data.data);
      setTotalLogPages(response.data.pagination.pages || 1);
    } catch (err) {
      if (window.showToast) window.showToast('Failed to load activity logs', 'error');
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchLogs();
    }
  }, [activeTab, logPage]);

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}`, { role: newRole });
      if (window.showToast) window.showToast('User role updated successfully', 'success');
      fetchUsers();
    } catch (err) {
      if (window.showToast) {
        window.showToast(err.response?.data?.message || 'Failed to update user', 'error');
      }
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}`, { isActive: !currentStatus });
      if (window.showToast) window.showToast('User status updated successfully', 'success');
      fetchUsers();
    } catch (err) {
      if (window.showToast) {
        window.showToast(err.response?.data?.message || 'Failed to update status', 'error');
      }
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to permanently delete the user account for "${userName}"?`)) {
      try {
        await api.delete(`/admin/users/${userId}`);
        if (window.showToast) window.showToast('User account deleted successfully', 'success');
        fetchUsers();
      } catch (err) {
        if (window.showToast) {
          window.showToast(err.response?.data?.message || 'Failed to delete user', 'error');
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Administrative Control Center</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
          Perform user role allocation, access verification, and inspect security audit logs.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-dark-800 pb-px">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-bold border-b-2 capitalize transition-all flex items-center gap-1.5 ${activeTab === 'users' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'}`}
        >
          <Users size={14} />
          User Permissions
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 text-xs font-bold border-b-2 capitalize transition-all flex items-center gap-1.5 ${activeTab === 'logs' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'}`}
        >
          <Terminal size={14} />
          System Activity Logs
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'users' ? (
        <div className="bg-white dark:bg-dark-850 border border-slate-200/50 dark:border-dark-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            {usersLoading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-dark-900 border-b border-slate-200/50 dark:border-dark-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Assigned Role</th>
                    <th className="px-6 py-4">Access Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-dark-800 text-xs font-medium">
                  {users.map((u) => {
                    const isSelf = u._id === currentUser?._id;
                    return (
                      <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-dark-800/20 transition-all">
                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                            {u.name[0].toUpperCase()}
                          </div>
                          {u.name} {isSelf && <span className="text-[9px] text-teal-500 font-bold ml-1.5">(You)</span>}
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{u.email}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-450">
                          {isSelf ? (
                            <span className="capitalize text-slate-400">{u.role}</span>
                          ) : (
                            <select
                              value={u.role}
                              onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                              className="text-xs bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-lg p-1 font-semibold text-slate-700 dark:text-slate-350"
                            >
                              <option value="admin">Admin</option>
                              <option value="consultant">Consultant</option>
                              <option value="staff">Staff</option>
                            </select>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${u.isActive ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400'}`}>
                            {u.isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end items-center gap-2">
                          {!isSelf && (
                            <>
                              <button
                                onClick={() => handleToggleStatus(u._id, u.isActive)}
                                className={`px-3 py-1 border text-[10px] rounded-lg font-bold transition-colors ${u.isActive ? 'border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20' : 'border-emerald-250 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'}`}
                              >
                                {u.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u._id, u.name)}
                                className="p-1.5 border border-slate-200 dark:border-dark-800 hover:border-red-200 rounded-lg text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 inline-flex items-center justify-center"
                                title="Delete User Account"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-850 border border-slate-200/50 dark:border-dark-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            {logsLoading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-dark-900 border-b border-slate-200/50 dark:border-dark-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">Audit Description</th>
                    <th className="px-6 py-4">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-dark-800 text-xs font-medium">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-dark-800/20 transition-all">
                      <td className="px-6 py-4 text-slate-400 dark:text-slate-500 font-medium">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-slate-900 dark:text-slate-200 font-bold">
                        {log.user?.name || 'Deleted Account'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase ${log.action === 'LOGIN' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400' : log.action.startsWith('DELETE') ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400' : 'bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 truncate max-w-xs">{log.details}</td>
                      <td className="px-6 py-4 text-slate-400 font-semibold">{log.ipAddress || 'Console'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Audit Logs Pagination */}
          {totalLogPages > 1 && (
            <div className="p-4 border-t border-slate-200/50 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-900/20 flex justify-between items-center text-xs">
              <button
                disabled={logPage === 1}
                onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-slate-200 dark:border-dark-800 rounded-xl disabled:opacity-40 hover:bg-white dark:hover:bg-dark-800 font-semibold"
              >
                Previous
              </button>
              <span className="text-slate-400 font-medium">
                Page {logPage} of {totalLogPages}
              </span>
              <button
                disabled={logPage === totalLogPages}
                onClick={() => setLogPage((p) => Math.min(totalLogPages, p + 1))}
                className="px-3 py-1.5 border border-slate-200 dark:border-dark-800 rounded-xl disabled:opacity-40 hover:bg-white dark:hover:bg-dark-800 font-semibold"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;

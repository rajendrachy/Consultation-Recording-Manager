import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, User } from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const Clients = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const isStaffOrAdmin = ['admin', 'staff'].includes(user?.role);

  // Client Data States
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modal Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [formError, setFormError] = useState('');

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/clients?search=${search}&page=${page}&limit=10`);
      setClients(response.data.data);
      setTotalPages(response.data.pagination.pages || 1);
    } catch (err) {
      console.error(err);
      if (window.showToast) window.showToast('Failed to load clients list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      fetchClients();
    }, 300); // 300ms search debounce

    return () => clearTimeout(delayDebounce);
  }, [search]);

  useEffect(() => {
    fetchClients();
  }, [page]);

  const openAddModal = () => {
    setEditClient(null);
    setFormData({ name: '', email: '', phone: '', address: '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (client) => {
    setEditClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Warning: Deleting this client will permanently remove all associated consultations and recording files. Proceed?')) {
      try {
        await api.delete(`/clients/${id}`);
        if (window.showToast) window.showToast('Client deleted successfully', 'success');
        fetchClients();
      } catch (err) {
        if (window.showToast) {
          window.showToast(err.response?.data?.message || 'Failed to delete client', 'error');
        }
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (editClient) {
        // Edit flow
        await api.put(`/clients/${editClient._id}`, formData);
        if (window.showToast) window.showToast('Client profile updated', 'success');
      } else {
        // Add flow
        await api.post('/clients', formData);
        if (window.showToast) window.showToast('New client registered', 'success');
      }
      setIsModalOpen(false);
      fetchClients();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error occurred while saving client.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Browse and manage customer registrations and demographic credentials.
          </p>
        </div>

        {isStaffOrAdmin && (
          <button
            onClick={openAddModal}
            className="glow-btn inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-500/10 self-start"
          >
            <Plus size={16} />
            Add Client
          </button>
        )}
      </div>

      {/* Filters Area */}
      <div className="flex items-center bg-white dark:bg-dark-850 p-4 border border-slate-200/50 dark:border-dark-800 rounded-2xl shadow-sm max-w-md">
        <Search size={18} className="text-slate-400 mr-2.5" />
        <input
          type="text"
          placeholder="Search by name, email, phone, or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm bg-transparent border-none focus:outline-none placeholder-slate-400"
        />
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-dark-850 border border-slate-200/50 dark:border-dark-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : clients.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              No clients found. Click Add Client to create one.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-dark-900 border-b border-slate-200/50 dark:border-dark-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4">Address</th>
                  {isStaffOrAdmin && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-dark-800 text-xs font-medium">
                {clients.map((client) => (
                  <tr
                    key={client._id}
                    className="hover:bg-slate-50/50 dark:hover:bg-dark-800/20 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                          <User size={14} />
                        </div>
                        {client.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{client.email}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{client.phone}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                      {client.address}
                    </td>
                    {isStaffOrAdmin && (
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(client)}
                          className="p-1.5 hover:bg-teal-50 dark:hover:bg-teal-950/30 text-teal-600 dark:text-teal-400 rounded-lg transition-colors inline-flex"
                          title="Edit Profile"
                        >
                          <Edit2 size={13} />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(client._id)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg transition-colors inline-flex"
                            title="Delete Client"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Panel */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200/50 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-900/20 flex justify-between items-center text-xs">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 border border-slate-200 dark:border-dark-800 rounded-xl disabled:opacity-40 hover:bg-white dark:hover:bg-dark-800 font-semibold"
            >
              Previous
            </button>
            <span className="text-slate-400 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 border border-slate-200 dark:border-dark-800 rounded-xl disabled:opacity-40 hover:bg-white dark:hover:bg-dark-800 font-semibold"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* CRUD MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-dark-850 border border-slate-200/80 dark:border-dark-750 shadow-2xl rounded-3xl overflow-hidden p-6 animate-scale-up space-y-4">
            
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-slate-950 dark:text-white">
                {editClient ? 'Edit Client Profile' : 'Register New Client'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Robert Downey"
                  className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-xl py-2.5 px-4 focus:outline-none focus:border-teal-500 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. robert@marvel.com"
                  className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-xl py-2.5 px-4 focus:outline-none focus:border-teal-500 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +1-555-0199"
                  className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-xl py-2.5 px-4 focus:outline-none focus:border-teal-500 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Residential Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street name, City, Zip"
                  className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-xl py-2.5 px-4 focus:outline-none focus:border-teal-500 text-xs font-medium"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold shadow-md shadow-teal-500/10 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;

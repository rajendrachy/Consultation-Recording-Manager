import React, { useState, useEffect, useRef } from 'react';
import {
  CalendarDays,
  Clock,
  Tag,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  X,
  FileText,
  Video,
  UploadCloud,
  ChevronRight,
  Bold,
  Italic,
  List,
} from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const Consultations = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const isStaffOrAdmin = ['admin', 'staff'].includes(user?.role);

  // States
  const [consultations, setConsultations] = useState([]);
  const [clients, setClients] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Selected Consultation Detail Drawer State
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [recordings, setRecordings] = useState([]);

  // Rich Text Editor State
  const [newNoteContent, setNewNoteContent] = useState('');
  const textareaRef = useRef(null);

  // Upload Recording File State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [recordingTitle, setRecordingTitle] = useState('');

  // Scheduling Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editConsultation, setEditConsultation] = useState(null);
  const [formData, setFormData] = useState({
    client: '',
    consultant: '',
    consultationDate: '',
    duration: 30,
    status: 'scheduled',
    tags: '',
  });
  const [formError, setFormError] = useState('');

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/consultations?search=${search}&status=${statusFilter}&tag=${tagFilter}&page=${page}&limit=10`
      );
      setConsultations(response.data.data);
      setTotalPages(response.data.pagination.pages || 1);
    } catch (err) {
      console.error(err);
      if (window.showToast) window.showToast('Failed to load consultations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const resClients = await api.get('/clients?limit=100');
      setClients(resClients.data.data);

      const resAdminLogs = await api.get('/admin/users');
      // Filter out users who can act as consultants (admin + consultant roles)
      const consUsers = resAdminLogs.data.data.filter((u) =>
        ['consultant', 'admin'].includes(u.role)
      );
      setConsultants(consUsers);
    } catch (err) {
      console.error('Failed to load dropdowns:', err.message);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      fetchConsultations();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, statusFilter, tagFilter]);

  useEffect(() => {
    fetchConsultations();
  }, [page]);

  // Load detailed notes & recordings for selected item
  const loadConsultationDetails = async (id) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/consultations/${id}`);
      setSelectedConsultation(res.data.data);
      setNotes(res.data.data.notes || []);
      setRecordings(res.data.data.recordings || []);
    } catch (err) {
      if (window.showToast) window.showToast('Failed to load session details', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSelectConsultation = (cons) => {
    loadConsultationDetails(cons._id);
  };

  // Custom Rich Text Tag Helper
  const insertRichText = (tagOpen, tagClose) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = tagOpen + selected + tagClose;

    setNewNoteContent(
      text.substring(0, start) + replacement + text.substring(end)
    );
    
    // Focus back and set selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + tagOpen.length,
        start + tagOpen.length + selected.length
      );
    }, 10);
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    try {
      const response = await api.post('/notes', {
        consultationId: selectedConsultation._id,
        content: newNoteContent,
      });
      setNotes([response.data.data, ...notes]);
      setNewNoteContent('');
      if (window.showToast) window.showToast('Note added successfully', 'success');
    } catch (err) {
      if (window.showToast) window.showToast('Failed to add note', 'error');
    }
  };

  const handleDeleteNote = async (id) => {
    if (window.confirm('Delete this note?')) {
      try {
        await api.delete(`/notes/${id}`);
        setNotes((prev) => prev.filter((n) => n._id !== id));
        if (window.showToast) window.showToast('Note deleted', 'success');
      } catch (err) {
        if (window.showToast) window.showToast('Failed to remove note', 'error');
      }
    }
  };

  // Upload Recording Handler
  const handleUploadRecording = async (e) => {
    e.preventDefault();
    if (!uploadFile || !recordingTitle.trim()) {
      if (window.showToast) window.showToast('Please specify file and title', 'warning');
      return;
    }

    setIsUploading(true);
    if (window.showToast) window.showToast('Processing recording & initiating AI transcription...', 'info');

    const uploadFormData = new FormData();
    uploadFormData.append('title', recordingTitle);
    uploadFormData.append('consultationId', selectedConsultation._id);
    uploadFormData.append('recording', uploadFile);

    try {
      const response = await api.post('/recordings', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setRecordings([...recordings, response.data.data]);
      setUploadFile(null);
      setRecordingTitle('');
      if (window.showToast) window.showToast('Audio uploaded and AI transcribed successfully!', 'success');
    } catch (err) {
      if (window.showToast) {
        window.showToast(err.response?.data?.message || 'Upload failed', 'error');
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Delete Consultation Handler
  const handleDeleteConsultation = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Warning: Deleting this consultation will delete all notes and recordings. Proceed?')) {
      try {
        await api.delete(`/consultations/${id}`);
        if (window.showToast) window.showToast('Consultation deleted successfully', 'success');
        if (selectedConsultation?._id === id) setSelectedConsultation(null);
        fetchConsultations();
      } catch (err) {
        if (window.showToast) window.showToast('Failed to delete consultation', 'error');
      }
    }
  };

  // Scheduling CRUD Operations
  const openScheduleModal = (cons = null) => {
    if (cons) {
      setEditConsultation(cons);
      setFormData({
        client: cons.client._id,
        consultant: cons.consultant._id,
        consultationDate: new Date(cons.consultationDate).toISOString().substring(0, 16),
        duration: cons.duration,
        status: cons.status,
        tags: cons.tags.join(', '),
      });
    } else {
      setEditConsultation(null);
      setFormData({
        client: '',
        consultant: '',
        consultationDate: '',
        duration: 30,
        status: 'scheduled',
        tags: '',
      });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const formattedData = {
      ...formData,
      tags: formData.tags.split(',').map((t) => t.trim()).filter((t) => t !== ''),
    };

    try {
      if (editConsultation) {
        await api.put(`/consultations/${editConsultation._id}`, formattedData);
        if (window.showToast) window.showToast('Consultation schedule updated', 'success');
      } else {
        await api.post('/consultations', formattedData);
        if (window.showToast) window.showToast('New consultation scheduled', 'success');
      }
      setIsModalOpen(false);
      fetchConsultations();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save appointment slot.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Consultations Log</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Manage scheduled customer reviews, medical updates, and audio uploads.
          </p>
        </div>

        {isStaffOrAdmin && (
          <button
            onClick={() => openScheduleModal(null)}
            className="glow-btn inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-500/10 self-start"
          >
            <Plus size={16} />
            Schedule Session
          </button>
        )}
      </div>

      {/* Filters & Searching Panel */}
      <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-dark-850 p-4 border border-slate-200/50 dark:border-dark-800 rounded-3xl shadow-sm">
        
        {/* Search */}
        <div className="flex items-center bg-slate-50 dark:bg-dark-900 px-3 py-2 border border-slate-200/50 dark:border-dark-800 rounded-2xl w-full sm:max-w-xs">
          <Search size={16} className="text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Search clients or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs bg-transparent border-none focus:outline-none placeholder-slate-400 w-full"
          />
        </div>

        {/* Status */}
        <div className="flex items-center bg-slate-50 dark:bg-dark-900 px-3 py-2 border border-slate-200/50 dark:border-dark-800 rounded-2xl">
          <Filter size={14} className="text-slate-400 mr-2" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-transparent border-none focus:outline-none text-slate-600 dark:text-slate-300 font-semibold"
          >
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

      </div>

      {/* Consultation Main List Grid Split Layout */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        
        {/* Table/List panel */}
        <div className="flex-1 w-full bg-white dark:bg-dark-850 border border-slate-200/50 dark:border-dark-800 rounded-3xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : consultations.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              No consultations match your search metrics.
            </div>
          ) : (
            <div className="divide-y divide-slate-150 dark:divide-dark-800">
              {consultations.map((cons) => (
                <div
                  key={cons._id}
                  onClick={() => handleSelectConsultation(cons)}
                  className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-dark-800/10 transition-colors ${selectedConsultation?._id === cons._id ? 'bg-teal-500/5 dark:bg-teal-500/5 border-l-4 border-teal-600' : ''}`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {cons.client?.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${cons.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' : cons.status === 'cancelled' ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400' : 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'}`}>
                        {cons.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={12} />
                        {new Date(cons.consultationDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {cons.duration} mins
                      </span>
                      {cons.tags?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Tag size={12} />
                          {cons.tags.slice(0, 2).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      By: {cons.consultant?.name}
                    </span>
                    {isStaffOrAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openScheduleModal(cons);
                        }}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-dark-850 rounded-lg text-slate-500"
                        title="Edit Slot"
                      >
                        <Edit2 size={12} />
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDeleteConsultation(cons._id, e)}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg"
                        title="Delete Session"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                    <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 hidden sm:block" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Consultation Sidebar / Drawer Details Panel */}
        {selectedConsultation && (
          <div className="w-full xl:w-96 bg-white dark:bg-dark-850 border border-slate-200/50 dark:border-dark-800 rounded-3xl shadow-sm p-6 space-y-6 animate-scale-up">
            
            <div className="flex justify-between items-start border-b border-slate-150 dark:border-dark-800 pb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Session Dashboard</h3>
                <p className="text-[10px] text-slate-400">Client: {selectedConsultation.client?.name}</p>
              </div>
              <button
                onClick={() => setSelectedConsultation(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-400"
              >
                <X size={16} />
              </button>
            </div>

            {detailLoading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* 1. Playable Recordings */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Video size={13} />
                    Session Media ({recordings.length})
                  </h4>

                  {recordings.length === 0 ? (
                    <div className="p-4 bg-slate-50 dark:bg-dark-900 rounded-2xl border border-dashed border-slate-200 dark:border-dark-800 text-center text-[10px] text-slate-400">
                      No recording linked to this consultation yet.
                    </div>
                  ) : (
                    recordings.map((rec) => (
                      <div key={rec._id} className="p-3 bg-slate-50 dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800 rounded-2xl flex items-center justify-between">
                        <div className="min-w-0 flex-1 truncate">
                          <p className="font-bold text-xs truncate text-slate-800 dark:text-slate-200">
                            {rec.title}
                          </p>
                          <p className="text-[9px] text-slate-400 mt-0.5 uppercase">
                            Format: {rec.fileType} • {(rec.fileSize / (1024 * 1024)).toFixed(2)}MB
                          </p>
                        </div>
                        <a
                          href={`/recordings?play=${rec._id}`}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-[10px] font-bold"
                        >
                          Play AI
                        </a>
                      </div>
                    ))
                  )}

                  {/* Upload Recording Form (Admin/Staff only, and if no recording exists) */}
                  {isStaffOrAdmin && recordings.length === 0 && (
                    <form onSubmit={handleUploadRecording} className="p-4 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl space-y-3">
                      <span className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        Upload Recording File
                      </span>
                      
                      <input
                        type="text"
                        required
                        placeholder="Recording Title (e.g. Session Audio)"
                        value={recordingTitle}
                        onChange={(e) => setRecordingTitle(e.target.value)}
                        className="w-full bg-white dark:bg-dark-850 border border-slate-200 dark:border-dark-800 rounded-xl py-2 px-3 text-[11px] font-medium"
                      />

                      <div className="relative border border-dashed border-slate-200 dark:border-dark-750 hover:bg-white dark:hover:bg-dark-800 rounded-xl p-4 text-center cursor-pointer transition-colors">
                        <input
                          type="file"
                          required
                          accept="audio/*,video/*"
                          onChange={(e) => setUploadFile(e.target.files[0])}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <UploadCloud size={20} className="mx-auto text-slate-400 mb-1" />
                        <span className="block text-[10px] text-slate-400 font-semibold truncate">
                          {uploadFile ? uploadFile.name : 'Select mp3, wav, m4a, mp4, webm'}
                        </span>
                      </div>

                      <button
                        type="submit"
                        disabled={isUploading}
                        className="w-full py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl text-[10px] font-bold"
                      >
                        {isUploading ? 'Uploading & Transcribing...' : 'Upload Audio'}
                      </button>
                    </form>
                  )}
                </div>

                {/* 2. Custom Rich Text Notes System */}
                <div className="space-y-3 border-t border-slate-150 dark:border-dark-800 pt-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText size={13} />
                    Consultation Notes ({notes.length})
                  </h4>

                  {/* Add Note Area */}
                  <form onSubmit={handleAddNote} className="space-y-2">
                    {/* Rich text helper bar */}
                    <div className="flex gap-1.5 p-1.5 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-t-xl border-b-none">
                      <button
                        type="button"
                        onClick={() => insertRichText('<strong>', '</strong>')}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-dark-800 rounded text-slate-500"
                        title="Bold"
                      >
                        <Bold size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertRichText('<em>', '</em>')}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-dark-800 rounded text-slate-500"
                        title="Italic"
                      >
                        <Italic size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertRichText('<li>', '</li>')}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-dark-800 rounded text-slate-500"
                        title="List bullet item"
                      >
                        <List size={11} />
                      </button>
                    </div>

                    <textarea
                      ref={textareaRef}
                      required
                      placeholder="Add audit assessment notes..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="w-full h-24 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-b-xl p-3 text-xs focus:outline-none focus:border-teal-500 text-slate-700 dark:text-slate-200 font-medium"
                    />

                    <button
                      type="submit"
                      className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-[10px] font-bold"
                    >
                      Save Note
                    </button>
                  </form>

                  {/* Notes Feed */}
                  <div className="space-y-3.5 max-h-64 overflow-y-auto pt-2">
                    {notes.map((note) => (
                      <div key={note._id} className="p-3 bg-slate-50 dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800 rounded-2xl relative group">
                        <div className="flex justify-between items-start mb-1.5">
                          <div>
                            <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">
                              {note.author?.name}
                            </span>
                            <span className="text-[9px] text-slate-400 ml-1.5">
                              {new Date(note.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {(note.author?._id === user?._id || isAdmin) && (
                            <button
                              onClick={() => handleDeleteNote(note._id)}
                              className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md"
                              title="Delete Note"
                            >
                              <Trash2 size={10} />
                            </button>
                          )}
                        </div>
                        {/* Note rich text display */}
                        <div
                          className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed break-words"
                          dangerouslySetInnerHTML={{ __html: note.content }}
                        />
                      </div>
                    ))}
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

      </div>

      {/* SCHEDULING DIALOG MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-dark-850 border border-slate-200/80 dark:border-dark-750 shadow-2xl rounded-3xl overflow-hidden p-6 animate-scale-up space-y-4">
            
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-slate-950 dark:text-white">
                {editConsultation ? 'Edit Consultation Slot' : 'Schedule Consultation'}
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

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-400 mb-1">Select Client</label>
                <select
                  required
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-xl py-2.5 px-4 focus:outline-none focus:border-teal-500 text-xs font-medium"
                >
                  <option value="">Choose client...</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Select Consultant</label>
                <select
                  required
                  value={formData.consultant}
                  onChange={(e) => setFormData({ ...formData, consultant: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-xl py-2.5 px-4 focus:outline-none focus:border-teal-500 text-xs font-medium"
                >
                  <option value="">Choose consultant...</option>
                  {consultants.map((con) => (
                    <option key={con._id} value={con._id}>
                      {con.name} ({con.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.consultationDate}
                    onChange={(e) => setFormData({ ...formData, consultationDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-xl py-2.5 px-4 focus:outline-none text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={240}
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-xl py-2.5 px-4 focus:outline-none text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-xl py-2.5 px-4 focus:outline-none text-xs font-medium"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Tags (Comma Sep)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g. medical, checkup"
                    className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-xl py-2.5 px-4 focus:outline-none text-xs font-medium"
                  />
                </div>
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
                  Confirm Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Consultations;

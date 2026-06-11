import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Video,
  FileAudio,
  Search,
  Filter,
  Download,
  Trash2,
  Calendar,
  User,
  Play,
  FileText,
  Sparkles,
  ClipboardList,
  Highlighter,
} from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { getMediaUrl } from '../config';

const Recordings = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const location = useLocation();

  // Filter States
  const [recordings, setRecordings] = useState([]);
  const [search, setSearch] = useState('');
  const [consultantFilter, setConsultantFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [consultants, setConsultants] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Active Play State
  const [activeRecording, setActiveRecording] = useState(null);
  
  // Smart Search inside transcript query state
  const [transcriptQuery, setTranscriptQuery] = useState('');

  // Helper: Format bytes to MB
  const formatBytes = (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Helper: Format seconds to MM:SS
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const fetchRecordings = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/recordings?search=${search}&consultant=${consultantFilter}&startDate=${startDate}&endDate=${endDate}&page=${page}&limit=8`
      );
      setRecordings(response.data.data);
      setTotalPages(response.data.pagination.pages || 1);

      // Check URL parameters for playing specific recording
      const params = new URLSearchParams(location.search);
      const playId = params.get('play');
      if (playId && response.data.data.length > 0) {
        const matching = response.data.data.find((r) => r._id === playId);
        if (matching) setActiveRecording(matching);
      } else if (!activeRecording && response.data.data.length > 0) {
        // Default to first item
        setActiveRecording(response.data.data[0]);
      }
    } catch (err) {
      console.error(err);
      if (window.showToast) window.showToast('Failed to load recordings list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchConsultantsList = async () => {
    try {
      const res = await api.get('/admin/users');
      const filtered = res.data.data.filter((u) =>
        ['consultant', 'admin'].includes(u.role)
      );
      setConsultants(filtered);
    } catch (err) {
      console.error('Failed to load consultants dropdown:', err.message);
    }
  };

  useEffect(() => {
    fetchConsultantsList();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      fetchRecordings();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, consultantFilter, startDate, endDate]);

  useEffect(() => {
    fetchRecordings();
  }, [page]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this recording file and its AI transcript data?')) {
      try {
        await api.delete(`/recordings/${id}`);
        if (window.showToast) window.showToast('Recording deleted successfully', 'success');
        if (activeRecording?._id === id) setActiveRecording(null);
        fetchRecordings();
      } catch (err) {
        if (window.showToast) window.showToast('Failed to delete recording', 'error');
      }
    }
  };

  // Highlight smart search words inside transcript text

  // Highlight smart search words inside transcript text
  const getHighlightedText = (text, query) => {
    if (!query || !text) return text;
    const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-teal-500/20 text-teal-600 dark:text-teal-400 font-bold px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audio & Video Recordings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
          Review consultation recordings, play audio/video content, and inspect AI-generated transcripts.
        </p>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Filter and List Panel */}
        <div className="xl:col-span-1 space-y-4">
          
          {/* Searching and Filters box */}
          <div className="p-4 bg-white dark:bg-dark-850 border border-slate-200/50 dark:border-dark-800 rounded-3xl shadow-sm space-y-3">
            
            {/* Search inputs */}
            <div className="flex items-center bg-slate-50 dark:bg-dark-900 px-3 py-2 border border-slate-200/50 dark:border-dark-800 rounded-xl">
              <Search size={14} className="text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Search titles or transcripts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-xs bg-transparent border-none focus:outline-none placeholder-slate-400 w-full"
              />
            </div>

            {/* Consultant Filter */}
            {user?.role !== 'consultant' && (
              <div className="flex items-center bg-slate-50 dark:bg-dark-900 px-3 py-2 border border-slate-200/50 dark:border-dark-800 rounded-xl">
                <User size={12} className="text-slate-400 mr-2" />
                <select
                  value={consultantFilter}
                  onChange={(e) => setConsultantFilter(e.target.value)}
                  className="text-xs bg-transparent border-none focus:outline-none text-slate-500 dark:text-slate-300 w-full"
                >
                  <option value="">All Consultants</option>
                  {consultants.map((con) => (
                    <option key={con._id} value={con._id}>
                      {con.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Filters */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-400">
              <div>
                <label className="block mb-0.5">Start Upload Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl p-2 focus:outline-none font-medium text-slate-700 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="block mb-0.5">End Upload Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl p-2 focus:outline-none font-medium text-slate-700 dark:text-slate-200"
                />
              </div>
            </div>

          </div>

          {/* Recordings Feed */}
          <div className="bg-white dark:bg-dark-850 border border-slate-200/50 dark:border-dark-800 rounded-3xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : recordings.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No recording logs found.
              </div>
            ) : (
              <div className="divide-y divide-slate-150 dark:divide-dark-800">
                {recordings.map((rec) => (
                  <div
                    key={rec._id}
                    onClick={() => {
                      setActiveRecording(rec);
                      setTranscriptQuery('');
                    }}
                    className={`p-4 flex gap-3 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-dark-800/10 transition-colors ${activeRecording?._id === rec._id ? 'bg-teal-500/5 dark:bg-teal-500/5 border-l-4 border-teal-600' : ''}`}
                  >
                    <div className="p-2.5 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 rounded-xl self-start">
                      {['mp4', 'webm'].includes(rec.fileType) ? <Video size={16} /> : <FileAudio size={16} />}
                    </div>
                    <div className="min-w-0 flex-1 truncate space-y-1.5">
                      <h4 className="font-bold text-xs truncate text-slate-900 dark:text-white">
                        {rec.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Client: {rec.consultation?.client?.name || 'General Client'}
                      </p>
                      <div className="flex items-center gap-2 text-[9px] text-slate-400">
                        <span>{formatDuration(rec.duration)}</span>
                        <span>•</span>
                        <span>{formatBytes(rec.fileSize)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-3 bg-slate-50/50 dark:bg-dark-900/10 border-t border-slate-200/50 dark:border-dark-800 flex justify-between items-center text-[10px]">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-2 py-1 border border-slate-200 dark:border-dark-800 rounded-lg disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-slate-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2 py-1 border border-slate-200 dark:border-dark-800 rounded-lg disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Active Media Viewer and Transcript Panel */}
        <div className="xl:col-span-2 space-y-6">
          {activeRecording ? (
            <div className="bg-white dark:bg-dark-850 border border-slate-200/50 dark:border-dark-800 rounded-3xl shadow-sm p-6 space-y-6">
              
              {/* Media Header */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="font-bold text-sm text-slate-950 dark:text-white">
                    {activeRecording.title}
                  </h2>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Uploaded on: {new Date(activeRecording.uploadDate).toLocaleDateString()} • By:{' '}
                    {activeRecording.consultation?.consultant?.name || 'Consultant'}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <a
                    href={getMediaUrl(activeRecording.recordingUrl)}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 border border-slate-200 dark:border-dark-800 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-dark-800 inline-flex"
                    title="Download Original Media File"
                  >
                    <Download size={14} />
                  </a>
                  {(isAdmin || user?.role === 'consultant' || user?.role === 'staff') && (
                    <button
                      onClick={(e) => handleDelete(activeRecording._id, e)}
                      className="p-2 border border-slate-200 dark:border-dark-800 hover:border-red-200 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 inline-flex"
                      title="Delete Recording Log"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Media Player element */}
              <div className="bg-slate-950 rounded-2xl overflow-hidden aspect-video max-h-72 flex items-center justify-center relative">
                {['mp4', 'webm'].includes(activeRecording.fileType) ? (
                  <video
                    src={getMediaUrl(activeRecording.recordingUrl)}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-teal-500/10 text-teal-500 flex items-center justify-center animate-pulse">
                      <FileAudio size={28} />
                    </div>
                    <audio
                      src={getMediaUrl(activeRecording.recordingUrl)}
                      controls
                      className="w-full max-w-md"
                    />
                  </div>
                )}
              </div>

              {/* AI INSIGHTS SPLIT TABS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-150 dark:border-dark-800">
                
                {/* Left Side: Summary & Actions */}
                <div className="space-y-5">
                  
                  {/* AI Summary card */}
                  <div className="p-4 bg-slate-50 dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800 rounded-2xl space-y-2.5">
                    <h3 className="font-bold text-xs uppercase text-slate-400 flex items-center gap-1.5">
                      <Sparkles size={12} className="text-amber-500" />
                      AI Summary Summary
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {activeRecording.summary || 'Summary processing complete.'}
                    </p>
                  </div>

                  {/* Discussion Points & Action Items list */}
                  <div className="p-4 bg-slate-50 dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800 rounded-2xl space-y-3">
                    <h3 className="font-bold text-xs uppercase text-slate-400 flex items-center gap-1.5">
                      <ClipboardList size={12} />
                      Action Items
                    </h3>
                    <ul className="space-y-2 text-[11px] text-slate-650 dark:text-slate-350">
                      {activeRecording.actionItems?.length === 0 ? (
                        <li className="text-[10px] text-slate-400">No specific action items listed.</li>
                      ) : (
                        activeRecording.actionItems?.map((act, index) => (
                          <li key={index} className="flex gap-2 items-start font-medium leading-relaxed">
                            <input
                              type="checkbox"
                              className="mt-0.5 rounded border-slate-300 dark:border-dark-700 text-teal-600 focus:ring-teal-500"
                              defaultChecked={index === 0}
                            />
                            <span>{act}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>

                </div>

                {/* Right Side: Transcript Reader with smart searching */}
                <div className="p-4 bg-slate-50 dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-xs uppercase text-slate-400 flex items-center gap-1.5">
                      <FileText size={12} />
                      Transcript
                    </h3>

                    {/* Smart query finder input */}
                    <div className="flex items-center bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-700 rounded-lg px-2 py-0.5 max-w-[150px]">
                      <Highlighter size={10} className="text-slate-400 mr-1.5" />
                      <input
                        type="text"
                        placeholder="Highlight word..."
                        value={transcriptQuery}
                        onChange={(e) => setTranscriptQuery(e.target.value)}
                        className="text-[10px] bg-transparent border-none focus:outline-none placeholder-slate-400 w-full"
                      />
                    </div>
                  </div>

                  <div className="h-60 overflow-y-auto pr-1 text-slate-600 dark:text-slate-300 leading-relaxed font-medium text-[11px] whitespace-pre-line space-y-4">
                    {activeRecording.transcript ? (
                      <div>
                        {getHighlightedText(activeRecording.transcript, transcriptQuery)}
                      </div>
                    ) : (
                      'Transcription text is currently loading.'
                    )}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center p-6 bg-white dark:bg-dark-850 border border-slate-200/50 dark:border-dark-800 rounded-3xl shadow-sm text-center text-slate-400 text-sm">
              <Sparkles size={36} className="text-slate-300 mb-3" />
              Select a recording to initiate playback.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Recordings;

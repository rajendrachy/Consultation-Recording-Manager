import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, Users } from 'lucide-react';
import api from '../services/api';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const response = await api.get('/analytics/reports');
        setData(response.data.data);
      } catch (err) {
        console.error('Failed to load full reports:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Color palettes for pie charts
  const PIE_COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8">
      
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Reports & Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
          Perform high-level audits, inspect workloads, and review data format distributions.
        </p>
      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Consultant Performance (Bar Chart) */}
        <div className="p-6 bg-white dark:bg-dark-850 border border-slate-200/60 dark:border-dark-800 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Users size={16} />
            </div>
            <div>
              <h2 className="font-bold text-sm">Consultant Workloads</h2>
              <p className="text-[10px] text-slate-400">Total consultation counts and linked media files.</p>
            </div>
          </div>
          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" h="100%">
              <BarChart data={data?.consultantPerformance || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-dark-800" />
                <XAxis dataKey="name" className="text-[9px] fill-slate-450" tickLine={false} />
                <YAxis className="text-[9px] fill-slate-450" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Bar dataKey="consultations" name="Consultations Scheduled" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recordings" name="Recordings Uploaded" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Consultation Statuses (Pie Chart) */}
        <div className="p-6 bg-white dark:bg-dark-850 border border-slate-200/60 dark:border-dark-800 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl">
              <PieIcon size={16} />
            </div>
            <div>
              <h2 className="font-bold text-sm">Consultation Status Breakdown</h2>
              <p className="text-[10px] text-slate-400">Total appointments segmented by progress tags.</p>
            </div>
          </div>
          <div className="h-64 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="w-full h-48 sm:w-1/2">
              <ResponsiveContainer width="100%" h="100%">
                <PieChart>
                  <Pie
                    data={data?.statusData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data?.statusData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} sessions`, 'Quantity']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Legend */}
            <div className="space-y-2.5 w-full sm:w-1/2 text-xs font-semibold">
              {data?.statusData?.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                    <span>{entry.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {entry.value} ({Math.round((entry.value / (data.statusData.reduce((acc, c) => acc + c.value, 0) || 1)) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Audio formats (Pie Chart / Radial) */}
        <div className="p-6 bg-white dark:bg-dark-850 border border-slate-200/60 dark:border-dark-800 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 rounded-xl">
              <TrendingUp size={16} />
            </div>
            <div>
              <h2 className="font-bold text-sm">Media Formats Distribution</h2>
              <p className="text-[10px] text-slate-400">Recording audio/video container allocations.</p>
            </div>
          </div>
          <div className="h-64 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="w-full h-48 sm:w-1/2">
              <ResponsiveContainer width="100%" h="100%">
                <PieChart>
                  <Pie
                    data={data?.formatsData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={65}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    {data?.formatsData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} files`, 'Quantity']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="space-y-2.5 w-full sm:w-1/2 text-xs font-semibold">
              {data?.formatsData?.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                    <span className="uppercase">{entry.name || 'Unknown'}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Analytics;

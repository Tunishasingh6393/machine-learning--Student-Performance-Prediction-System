/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  GraduationCap, 
  Search, 
  ChevronRight, 
  Info,
  Clock,
  BookOpen,
  Mail,
  Filter,
  RefreshCw,
  BrainCircuit
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Student, PredictionResult } from './types';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error("Failed to fetch students", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async (student: Student) => {
    setPredicting(true);
    setSelectedStudent(student);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student)
      });
      const data = await res.json();
      setPrediction(data);
    } catch (err) {
      console.error("Prediction failed", err);
    } finally {
      setPredicting(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  // Analytics Calculations
  const stats = useMemo(() => {
    if (students.length === 0) return null;
    const avgAttendance = students.reduce((acc, s) => acc + s.attendancePct, 0) / students.length;
    const avgGPA = students.reduce((acc, s) => acc + s.priorGPA, 0) / students.length;
    return {
      total: students.length,
      avgAttendance: Math.round(avgAttendance),
      avgGPA: avgGPA.toFixed(2),
    };
  }, [students]);

  const distributionData = useMemo(() => {
    const bins = [
      { name: '90-100', count: 0, color: '#22c55e' },
      { name: '80-89', count: 0, color: '#84cc16' },
      { name: '70-79', count: 0, color: '#eab308' },
      { name: '60-69', count: 0, color: '#f97316' },
      { name: '<60', count: 0, color: '#ef4444' },
    ];
    students.forEach(s => {
      if (s.quizAvg >= 90) bins[0].count++;
      else if (s.quizAvg >= 80) bins[1].count++;
      else if (s.quizAvg >= 70) bins[2].count++;
      else if (s.quizAvg >= 60) bins[3].count++;
      else bins[4].count++;
    });
    return bins;
  }, [students]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar Placeholder / Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <GraduationCap size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">EduGuard <span className="text-indigo-600">Analytics</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchStudents}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
            <div className="h-8 w-8 bg-slate-200 rounded-full border border-slate-300"></div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 grid grid-cols-12 gap-6">
        
        {/* TOP STATS */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard 
            title="Total Students" 
            value={stats?.total || 0} 
            icon={<Users className="text-indigo-600" />} 
            trend="+2 this month"
          />
          <StatCard 
            title="Avg. Attendance" 
            value={`${stats?.avgAttendance || 0}%`} 
            icon={<Clock className="text-amber-600" />} 
            trend="-3% trend"
            trendColor="text-rose-500"
          />
          <StatCard 
            title="Class GPA" 
            value={stats?.avgGPA || "0.0"} 
            icon={<BookOpen className="text-emerald-600" />} 
            trend="Stable"
          />
          <StatCard 
            title="System Alerts" 
            value="4" 
            icon={<AlertTriangle className="text-rose-600" />} 
            trend="Needs Review"
            trendColor="text-rose-500"
          />
        </div>

        {/* CHARTS SECTION */}
        <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Quiz Performance Distribution</h2>
              <p className="text-sm text-slate-500">Overview of academic health across all sections</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20">
              <ParameterOption label="Semester 1" />
              <ParameterOption label="Semester 2" />
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AT RISK LIST PIE */}
        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Risk Summary</h2>
          <p className="text-sm text-slate-500 mb-6">Real-time predictive flags</p>
          <div className="flex-1 flex flex-col items-center justify-center">
             <div className="w-full h-[200px] flex items-center justify-center relative">
               <div className="absolute inset-0 flex items-center justify-center flex-col">
                 <span className="text-4xl font-bold text-slate-800">12%</span>
                 <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold text-center">At High Risk</span>
               </div>
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[{value: 12}, {value: 88}]}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#ef4444" />
                      <Cell fill="#f1f5f9" />
                    </Pie>
                  </PieChart>
               </ResponsiveContainer>
             </div>
             <div className="w-full mt-6 space-y-3">
               <RiskFactor label="Low Attendance" count={5} color="bg-rose-500" />
               <RiskFactor label="Falling Quiz Scores" count={8} color="bg-amber-500" />
               <RiskFactor label="Submission Delays" count={3} color="bg-indigo-500" />
             </div>
          </div>
        </div>

        {/* STUDENT TABLE */}
        <div className="col-span-12 lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Student Directory</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search by name or ID..."
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 w-[240px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4 text-center">Attendance</th>
                  <th className="px-6 py-4 text-center">Quiz Avg</th>
                  <th className="px-6 py-4 text-center">GPA</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => (
                  <tr 
                    key={s.id} 
                    className={cn(
                      "hover:bg-slate-50/80 transition-colors group cursor-pointer",
                      selectedStudent?.id === s.id && "bg-indigo-50/50"
                    )}
                    onClick={() => handlePredict(s)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-medium text-xs border border-slate-200">
                          {s.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                          <p className="text-xs text-slate-400">{s.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "text-xs font-bold px-2 py-1 rounded-full",
                        s.attendancePct < 75 ? "text-rose-600 bg-rose-50" : "text-emerald-600 bg-emerald-50"
                      )}>
                        {Math.round(s.attendancePct)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-slate-600">
                      {Math.round(s.quizAvg)}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-slate-600">
                      {s.priorGPA}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PREDICTION PANEL */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {!selectedStudent ? (
              <motion.div 
                key="empty"
                initial={{opacity: 0, scale: 0.95}}
                animate={{opacity: 1, scale: 1}}
                exit={{opacity: 0, scale: 0.95}}
                className="flex-1 bg-white border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                  <Info size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-700">Predict Performance</h3>
                <p className="text-sm text-slate-400 max-w-[240px] mt-2">Select a student from the directory to run AI-powered risk analysis</p>
              </motion.div>
            ) : (
              <motion.div 
                key={selectedStudent.id}
                initial={{opacity: 0, x: 20}}
                animate={{opacity: 1, x: 0}}
                exit={{opacity: 0, x: -20}}
                className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
              >
                <div className="p-6 bg-indigo-600 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{selectedStudent.name}</h3>
                      <p className="text-indigo-100 text-sm opacity-80">{selectedStudent.id} • {selectedStudent.gender}</p>
                    </div>
                    <div className="p-2 bg-white/20 rounded-xl">
                      <BrainCircuit size={24} />
                    </div>
                  </div>
                </div>

                <div className="p-6 flex-1 overflow-y-auto space-y-8">
                  {predicting ? (
                    <div className="h-full flex flex-col items-center justify-center py-12 space-y-4">
                      <RefreshCw size={32} className="text-indigo-500 animate-spin" />
                      <p className="text-slate-500 font-medium animate-pulse">Running Gemini Inference...</p>
                    </div>
                  ) : prediction ? (
                    <div className="space-y-8">
                      {/* RISK SCORE HERO */}
                      <section>
                         <div className="flex items-center justify-between mb-2">
                           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Risk Assessment</h4>
                           <span className="text-xs font-bold text-indigo-600 px-2 py-1 bg-indigo-50 rounded-lg">{(prediction.confidence * 100).toFixed(0)}% Confidence</span>
                         </div>
                         <div className="flex items-end gap-4">
                            <span className={cn(
                              "text-6xl font-black tabular-nums",
                              prediction.riskScore > 60 ? "text-rose-500" : "text-emerald-500"
                            )}>{prediction.riskScore}%</span>
                            <div className="mb-2">
                               <p className={cn(
                                 "text-sm font-bold flex items-center gap-1",
                                 prediction.atRisk ? "text-rose-600" : "text-emerald-600"
                               )}>
                                 {prediction.atRisk ? <AlertTriangle size={16} /> : <TrendingUp size={16} />}
                                 {prediction.atRisk ? "High Risk" : "On Track"}
                               </p>
                               <p className="text-xs text-slate-400">Predicted Grade: <span className="font-bold text-slate-600">{prediction.gradeBand}</span></p>
                            </div>
                         </div>
                      </section>

                      {/* FACTORS */}
                      <section>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Core Influencers (SHAP)</h4>
                        <div className="flex flex-wrap gap-2">
                          {prediction.topFactors.map(f => (
                            <span key={f} className="text-xs font-semibold px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-600">
                              {f}
                            </span>
                          ))}
                        </div>
                      </section>

                      {/* EXPLANATION */}
                      <section className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                         <h4 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                           <BrainCircuit size={14} className="text-indigo-500" />
                           AI Insight
                         </h4>
                         <p className="text-sm text-slate-600 leading-relaxed italic">"{prediction.explanation}"</p>
                      </section>

                      {/* INTERVENTIONS */}
                      <section>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Recommended Actions</h4>
                        <div className="space-y-3">
                          {prediction.interventions.map((action, i) => (
                            <div key={i} className="flex gap-3 items-start group">
                              <div className="w-6 h-6 bg-emerald-100 rounded-full flex-shrink-0 flex items-center justify-center text-emerald-600 mt-0.5">
                                <CheckCircle size={14} />
                              </div>
                              <p className="text-sm font-medium text-slate-700 leading-tight group-hover:text-emerald-700 transition-colors">{action}</p>
                            </div>
                          ))}
                        </div>
                      </section>

                      <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                         <Mail size={18} />
                         Send Alert to Advisor
                      </button>
                    </div>
                  ) : null}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>
    </div>
  );
}

// Small Helper Components
function StatCard({ title, value, icon, trend, trendColor = "text-emerald-500" }: { title: string, value: string | number, icon: React.ReactNode, trend: string, trendColor?: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1 hover:border-indigo-200 transition-colors">
      <div className="flex justify-between items-start">
        <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-black text-slate-800 mt-2">{value}</p>
      <h3 className="text-sm font-semibold text-slate-500">{title}</h3>
      <p className={cn("text-xs font-bold mt-2", trendColor)}>{trend}</p>
    </div>
  );
}

function RiskFactor({ label, count, color }: { label: string, count: number, color: string }) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <div className={cn("w-2 h-2 rounded-full", color)}></div>
        <span className="text-sm font-medium text-slate-600">{label}</span>
      </div>
      <span className="text-xs font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg">{count}</span>
    </div>
  );
}

function ParameterOption({ label }: { label: string }) {
  return (
    <option value={label.toLowerCase()}>{label}</option>
  );
}

// Custom Lucide wrapper for missed icon
function CheckCircle({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}

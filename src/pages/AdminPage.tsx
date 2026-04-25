import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Download, Users, ScanLine, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { generateDoctorReport, type ScanRecord } from '../utils/generateDoctorReport';

const CLASS_NAMES: Record<string, string> = {
  akiec: 'Actinic Keratosis', bcc: 'Basal Cell Carcinoma',
  bkl: 'Benign Keratosis', df: 'Dermatofibroma',
  mel: 'Melanoma', nv: 'Melanocytic Nevus', vasc: 'Vascular Lesion',
};

const RISK: Record<string, string> = {
  mel: 'Critical', bcc: 'High', akiec: 'Moderate',
  bkl: 'Low', df: 'Low', nv: 'Low', vasc: 'Low',
};

const RISK_STYLE: Record<string, string> = {
  Critical: 'text-red-700 bg-red-50 border-red-200',
  High: 'text-orange-700 bg-orange-50 border-orange-200',
  Moderate: 'text-amber-700 bg-amber-50 border-amber-200',
  Low: 'text-emerald-700 bg-emerald-50 border-emerald-200',
};

const CLASS_COLORS: Record<string, string> = {
  akiec: '#0d9488', bcc: '#f59e0b', bkl: '#3b82f6',
  df: '#64748b', mel: '#ef4444', nv: '#10b981', vasc: '#ec4899',
};

export default function AdminPage() {
  const { user, role } = useAuth();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase || !user || role !== 'doctor') { setLoading(false); return; }
    (async () => {
      const { data, error: err } = await supabase
        .from('scan_history')
        .select(`*, profiles(email, full_name)`)
        .order('created_at', { ascending: false });
      if (err) { setError(err.message); }
      else {
        setScans((data ?? []).map((row: Record<string, unknown>) => ({
          ...row,
          patient_email: (row.profiles as { email?: string } | null)?.email ?? undefined,
          patient_name: (row.profiles as { full_name?: string } | null)?.full_name ?? undefined,
        } as ScanRecord)));
      }
      setLoading(false);
    })();
  }, [user, role]);

  const handleDownload = async () => {
    setGenerating(true);
    generateDoctorReport(scans, user?.email ?? 'admin');
    setGenerating(false);
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <AlertCircle size={40} className="text-slate-300 mx-auto mb-3" />
        <p className="text-slate-600 font-semibold">Please sign in to access this page.</p>
      </div>
    </div>
  );

  if (role !== 'doctor') return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center max-w-sm">
        <ShieldCheck size={40} className="text-slate-300 mx-auto mb-3" />
        <p className="text-slate-700 font-bold mb-1">Access Restricted</p>
        <p className="text-slate-500 text-sm">This page is only accessible to users with the <strong>Doctor</strong> role. Contact an administrator to get access.</p>
      </div>
    </div>
  );

  const totalScans = scans.length;
  const uniquePatients = new Set(scans.map((s) => s.user_id)).size;
  const classCounts: Record<string, number> = {};
  for (const s of scans) classCounts[s.predicted_class] = (classCounts[s.predicted_class] ?? 0) + 1;
  const sortedClasses = Object.entries(classCounts).sort((a, b) => b[1] - a[1]);
  const topCondition = sortedClasses[0] ? (CLASS_NAMES[sortedClasses[0][0]] ?? sortedClasses[0][0]) : '—';

  return (
    <div className="min-h-screen py-10 px-4 bg-slate-50">
      <div className="max-w-7xl mx-auto">

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Doctor Dashboard</h1>
              <p className="text-slate-500 text-sm">All patient scan history · Administrator view</p>
            </div>
          </div>
          <button
            onClick={handleDownload}
            disabled={generating || scans.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            {generating ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            Download Full Report
          </button>
        </motion.div>

        {/* Summary cards */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Scans', value: totalScans, icon: ScanLine, color: 'teal' },
            { label: 'Unique Patients', value: uniquePatients, icon: Users, color: 'indigo' },
            { label: 'Top Condition', value: topCondition, icon: TrendingUp, color: 'amber' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center gap-4`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-${color}-50 border border-${color}-100`}>
                <Icon size={20} className={`text-${color}-600`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
                <p className="text-sm text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Condition distribution */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Condition Distribution</p>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin text-slate-300" /></div>
            ) : sortedClasses.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No data yet</p>
            ) : (
              <div className="space-y-3">
                {sortedClasses.map(([cls, count]) => {
                  const pct = totalScans > 0 ? (count / totalScans) * 100 : 0;
                  return (
                    <div key={cls}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-slate-600 font-medium">{CLASS_NAMES[cls] ?? cls}</span>
                        <span className="text-xs font-bold text-slate-700">{count} ({pct.toFixed(1)}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: CLASS_COLORS[cls] ?? '#94a3b8' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Scan history table */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recent Scan History</p>
              <span className="text-xs text-slate-400">{totalScans} total</span>
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-slate-300" /></div>
            ) : error ? (
              <div className="p-5 text-sm text-red-600">{error}</div>
            ) : scans.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">No scans recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['#', 'Patient', 'Date', 'Condition', 'Confidence', 'Risk'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {scans.map((s, i) => {
                      const risk = RISK[s.predicted_class] ?? 'Low';
                      return (
                        <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3 text-slate-400 text-xs">{i + 1}</td>
                          <td className="px-4 py-3 text-slate-600 font-medium text-xs max-w-[130px] truncate">{s.patient_email ?? s.user_id.slice(0, 8) + '…'}</td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{new Date(s.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <div>
                              <span className="font-mono text-[10px] text-slate-400 mr-1">{s.predicted_class}</span>
                              <span className="text-slate-700 text-xs">{s.predicted_label}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-bold text-xs">{(s.confidence * 100).toFixed(1)}%</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border ${RISK_STYLE[risk]}`}>{risk}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

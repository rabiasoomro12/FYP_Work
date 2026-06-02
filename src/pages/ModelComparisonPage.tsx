import React from 'react';
import { motion } from 'framer-motion';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart2, Trophy, ShieldCheck } from 'lucide-react';

const fadeUp = { 
  hidden: { opacity: 0, y: 20 }, 
  show: (i = 0) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { delay: i * 0.1, duration: 0.45, ease: 'easeOut' } 
  }) 
};

const MODEL_COLORS = ['#0f172a', '#0d9488', '#14b8a6', '#f59e0b', '#3b82f6'];

const tooltipStyle = { 
  contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 12 }, 
  labelStyle: { color: '#64748b', fontWeight: 600 } 
};

// Data updated based on the HQE Framework Paper
const MODELS = [
  { model: 'HQE Ensemble',   accuracy: 91.00, precision: 90.0, recall: 88.0, f1: 88.0, auc: 98.2, color: '#0f172a', isEnsemble: true },
  { model: 'EfficientNet-B0', accuracy: 91.00, precision: 92.0, recall: 86.0, f1: 88.0, auc: 97.6, color: '#0d9488' },
  { model: 'EfficientNet-B3', accuracy: 90.00, precision: 87.0, recall: 83.0, f1: 85.0, auc: 96.1, color: '#14b8a6' },
  { model: 'MobileNetV3',     accuracy: 89.00, precision: 88.0, recall: 80.0, f1: 84.0, auc: 94.1, color: '#f59e0b' },
  { model: 'ResNet-50',       accuracy: 89.00, precision: 83.0, recall: 83.0, f1: 83.0, auc: 92.8, color: '#3b82f6' },
];

const SHORT = ['Ensemble', 'ENet-B0', 'ENet-B3', 'MobV3', 'ResNet-50'];

const BAR_DATA = MODELS.map((m, i) => ({ 
  name: SHORT[i], 
  Accuracy: m.accuracy, 
  'F1-Score': m.f1, 
  'AUC-ROC': m.auc 
}));

const RADAR_DATA = [
  { metric: 'Accuracy',  'Ensemble': 91.0, 'ENet-B0': 91.0, 'ENet-B3': 90.0, MobV3: 89.0, 'ResNet-50': 89.0 },
  { metric: 'Precision', 'Ensemble': 90.0, 'ENet-B0': 92.0, 'ENet-B3': 87.0, MobV3: 88.0, 'ResNet-50': 83.0 },
  { metric: 'Recall',    'Ensemble': 88.0, 'ENet-B0': 86.0, 'ENet-B3': 83.0, MobV3: 80.0, 'ResNet-50': 83.0 },
  { metric: 'F1-Score',  'Ensemble': 88.0, 'ENet-B0': 88.0, 'ENet-B3': 85.0, MobV3: 84.0, 'ResNet-50': 83.0 },
  { metric: 'AUC-ROC',   'Ensemble': 98.2, 'ENet-B0': 97.6, 'ENet-B3': 96.1, MobV3: 94.1, 'ResNet-50': 92.8 },
];

export default function ModelComparisonPage() {
  return (
    <div className="min-h-screen py-10 px-4 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center shadow-sm">
              <BarChart2 size={18} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">HQE Performance Analysis</h1>
          </div>
          <p className="text-slate-500 text-sm ml-12">
            Heterogeneous Quad-Ensemble vs. Individual Architectures on HAM10000
          </p>
        </motion.div>

        {/* Top Performer Card */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show" 
          className="mb-6 bg-slate-900 rounded-2xl p-5 flex items-center gap-4 shadow-lg border border-slate-800"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={20} className="text-teal-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Primary Architecture</p>
            <p className="text-lg font-bold text-white">
              HQE Ensemble — 91% Accuracy · 0.88 Macro F1-Score
            </p>
          </div>
        </motion.div>

        {/* Comparison Table */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show" 
          className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 mb-6"
        >
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Metrics Comparison</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/40">
                  <th className="text-left px-6 py-3 text-xs text-slate-500 font-semibold uppercase tracking-wider">Model</th>
                  {['Accuracy', 'Precision', 'Recall', 'F1-Score', 'AUC-ROC'].map((h) => (
                    <th key={h} className="text-right px-5 py-3 text-xs text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODELS.map((m, i) => (
                  <motion.tr key={m.model} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                    className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${m.isEnsemble ? 'bg-slate-50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: m.color }} />
                        <span className={`font-semibold ${m.isEnsemble ? 'text-slate-900' : 'text-slate-600'}`}>{m.model}</span>
                        {m.isEnsemble && <span className="text-[10px] px-2 py-0.5 bg-slate-900 text-white font-bold rounded-full uppercase">Ensemble</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-sm font-semibold text-slate-800">{m.accuracy.toFixed(2)}%</td>
                    <td className="px-5 py-4 text-right font-mono text-sm text-slate-600">{m.precision.toFixed(1)}%</td>
                    <td className="px-5 py-4 text-right font-mono text-sm text-slate-600">{m.recall.toFixed(1)}%</td>
                    <td className="px-5 py-4 text-right font-mono text-sm text-slate-600">{m.f1.toFixed(1)}%</td>
                    <td className="px-5 py-4 text-right font-mono text-sm text-slate-600">{(m.auc / 100).toFixed(3)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <motion.div custom={2} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">Metric Distribution</p>
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={BAR_DATA} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[75, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v) => [`${v.toFixed(2)}%`]} {...tooltipStyle} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12, paddingTop: 20 }} />
                <Bar dataKey="Accuracy" fill="#0f172a" radius={[3, 3, 0, 0]} />
                <Bar dataKey="F1-Score" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                <Bar dataKey="AUC-ROC" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div custom={3} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">Consensus Radar Analysis</p>
            <ResponsiveContainer width="100%" height={270}>
              <RadarChart data={RADAR_DATA} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[75, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                {SHORT.map((key, i) => (
                  <Radar key={key} name={key} dataKey={key} stroke={MODEL_COLORS[i]} fill={MODEL_COLORS[i]} fillOpacity={i === 0 ? 0.2 : 0.05} strokeWidth={i === 0 ? 3 : 1.5} />
                ))}
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 10, paddingTop: 10 }} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Model Feature Cards */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'EfficientNet-B0', params: '5.3M', weight: '0.20', feat: 'Inverse-frequency weighted loss[cite: 1]' },
            { name: 'EfficientNet-B3', params: '12.2M', weight: '1.23', feat: 'Compound-scaled resolution[cite: 1]' },
            { name: 'MobileNetV3',     params: '5.5M', weight: '9.46', feat: 'Inverted residuals & SE blocks[cite: 1]' },
            { name: 'ResNet-50',       params: '25.6M', weight: '1.21', feat: 'Deep skip connections[cite: 1]' },
          ].map((m, i) => (
            <div key={m.name} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:border-teal-200 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: MODEL_COLORS[i+1] }} />
                <span className="text-sm font-bold text-slate-700">{m.name}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-3">{m.feat}</p>
              <div className="flex gap-2">
                <span className="text-[10px] font-mono font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded-md">{m.params} params</span>
                <span className="text-[10px] font-mono font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">w={m.weight}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
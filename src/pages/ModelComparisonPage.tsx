import { motion } from 'framer-motion';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart2, Trophy } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.45, ease: 'easeOut' } }) };
const MODEL_COLORS = ['#0d9488', '#14b8a6', '#f59e0b', '#3b82f6'];
const tooltipStyle = { contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 12 }, labelStyle: { color: '#64748b', fontWeight: 600 } };

const MODELS = [
  { model: 'EfficientNet-B0', accuracy: 89.76, precision: 88.9, recall: 87.4, f1: 88.1, auc: 97.6, color: '#0d9488' },
  { model: 'EfficientNet-B3', accuracy: 87.43, precision: 86.1, recall: 85.8, f1: 85.9, auc: 96.1, color: '#14b8a6' },
  { model: 'MobileNetV3',     accuracy: 83.12, precision: 82.4, recall: 81.7, f1: 82.0, auc: 94.1, color: '#f59e0b' },
  { model: 'ResNet-50',       accuracy: 80.55, precision: 79.8, recall: 78.9, f1: 79.3, auc: 92.8, color: '#3b82f6' },
];

const SHORT = ['ENet-B0', 'ENet-B3', 'MobV3', 'ResNet-50'];
const BAR_DATA = MODELS.map((m, i) => ({ name: SHORT[i], Accuracy: m.accuracy, 'F1-Score': m.f1, 'AUC-ROC': m.auc }));
const RADAR_DATA = [
  { metric: 'Accuracy',  'ENet-B0': 89.76, 'ENet-B3': 87.43, MobV3: 83.12, 'ResNet-50': 80.55 },
  { metric: 'Precision', 'ENet-B0': 88.9,  'ENet-B3': 86.1,  MobV3: 82.4,  'ResNet-50': 79.8  },
  { metric: 'Recall',    'ENet-B0': 87.4,  'ENet-B3': 85.8,  MobV3: 81.7,  'ResNet-50': 78.9  },
  { metric: 'F1-Score',  'ENet-B0': 88.1,  'ENet-B3': 85.9,  MobV3: 82.0,  'ResNet-50': 79.3  },
  { metric: 'AUC-ROC',   'ENet-B0': 97.6,  'ENet-B3': 96.1,  MobV3: 94.1,  'ResNet-50': 92.8  },
];

export default function ModelComparisonPage() {
  return (
    <div className="min-h-screen py-10 px-4 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center shadow-sm"><BarChart2 size={18} className="text-white" /></div>
            <h1 className="text-2xl font-bold text-slate-800">Model Comparison</h1>
          </div>
          <p className="text-slate-500 text-sm ml-12">Benchmarking 4 deep learning architectures on the HAM10000 test set</p>
        </motion.div>

        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show" className="mb-6 bg-teal-600 rounded-2xl p-5 flex items-center gap-4 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0"><Trophy size={20} className="text-white" /></div>
          <div>
            <p className="text-xs text-teal-200 font-semibold uppercase tracking-wider mb-0.5">Best Performing Model</p>
            <p className="text-lg font-bold text-white">EfficientNet-B0 — 89.76% Accuracy · AUC-ROC 0.976</p>
          </div>
        </motion.div>

        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show" className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 mb-6">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Performance Metrics — Test Set</p>
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
                    className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${i === 0 ? 'bg-teal-50/40' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: m.color }} />
                        <span className={`font-semibold ${i === 0 ? 'text-teal-700' : 'text-slate-700'}`}>{m.model}</span>
                        {i === 0 && <span className="text-xs px-2 py-0.5 bg-teal-100 text-teal-700 font-bold rounded-full">Best</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-sm font-semibold text-slate-800">{m.accuracy}%</td>
                    <td className="px-5 py-4 text-right font-mono text-sm text-slate-600">{m.precision}%</td>
                    <td className="px-5 py-4 text-right font-mono text-sm text-slate-600">{m.recall}%</td>
                    <td className="px-5 py-4 text-right font-mono text-sm text-slate-600">{m.f1}%</td>
                    <td className="px-5 py-4 text-right font-mono text-sm text-slate-600">{(m.auc / 100).toFixed(3)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <motion.div custom={2} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">Grouped Performance Comparison</p>
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={BAR_DATA} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[75, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v: number) => [`${v.toFixed(2)}%`]} {...tooltipStyle} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                <Bar dataKey="Accuracy" fill="#0d9488" radius={[3, 3, 0, 0]} />
                <Bar dataKey="F1-Score" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                <Bar dataKey="AUC-ROC" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div custom={3} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">Multi-Dimensional Radar Analysis</p>
            <ResponsiveContainer width="100%" height={270}>
              <RadarChart data={RADAR_DATA} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[75, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                {['ENet-B0', 'ENet-B3', 'MobV3', 'ResNet-50'].map((key, i) => (
                  <Radar key={key} name={key} dataKey={key} stroke={MODEL_COLORS[i]} fill={MODEL_COLORS[i]} fillOpacity={0.1} strokeWidth={2} />
                ))}
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <motion.div custom={4} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'EfficientNet-B0', desc: 'Compound scaling across depth, width, and resolution. Optimal accuracy/efficiency tradeoff.', params: '5.3M params' },
            { name: 'EfficientNet-B3', desc: 'Scaled variant with higher capacity. Strong performance with increased compute budget.', params: '12M params' },
            { name: 'MobileNetV3',     desc: 'Mobile-optimized with inverted residuals and hard-swish activations for efficiency.', params: '5.4M params' },
            { name: 'ResNet-50',       desc: 'Classic 50-layer residual network. Reliable baseline with deep skip connections.', params: '25.6M params' },
          ].map((m, i) => (
            <div key={m.name} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 card-hover">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: MODEL_COLORS[i] }} />
                <span className="text-sm font-bold text-slate-700">{m.name}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">{m.desc}</p>
              <span className="text-xs font-mono font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">{m.params}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

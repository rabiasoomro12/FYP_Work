import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { GitBranch, ArrowRight } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.45, ease: 'easeOut' } }) };
const tooltipStyle = { contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 12 } };

const ORIGINAL = [
  { name: 'nv',    value: 6705, color: '#10b981' },
  { name: 'mel',   value: 1113, color: '#ef4444' },
  { name: 'bkl',   value: 1099, color: '#3b82f6' },
  { name: 'bcc',   value: 514,  color: '#f59e0b' },
  { name: 'akiec', value: 327,  color: '#0d9488' },
  { name: 'vasc',  value: 142,  color: '#ec4899' },
  { name: 'df',    value: 115,  color: '#64748b' },
];

// After stratified 80/20 split — training set only (8,013 total)
const WEIGHTED = [
  { name: 'nv',    value: 0.20, color: '#10b981' },
  { name: 'mel',   value: 1.21, color: '#ef4444' },
  { name: 'bkl',   value: 1.23, color: '#3b82f6' },
  { name: 'bcc',   value: 2.62, color: '#f59e0b' },
  { name: 'akiec', value: 4.11, color: '#0d9488' },
  { name: 'vasc',  value: 9.46, color: '#ec4899' },
  { name: 'df',    value: 11.74, color: '#64748b' },
];

const PIPELINE = [
  { label: 'Data Loading',      desc: 'HAM10000 — 10,015 images, 7 classes' },
  { label: 'Stratified Split',  desc: '80/20 train-val split, class-stratified' },
  { label: 'Augmentation',      desc: 'Flip, rotation, color jitter, normalize' },
  { label: 'Transfer Learning', desc: '4× pretrained CNNs — ImageNet weights' },
  { label: 'Training',          desc: '20 epochs, Adam, ReduceLROnPlateau' },
  { label: 'Ensemble',          desc: 'Soft-voting across 4 models (HQE)' },
  { label: 'CB-GradCAM',        desc: 'Consensus explainability — θ=3/4 models' },
];

const AUGS = [
  { name: 'Horizontal Flip', desc: 'Random horizontal reflection to increase spatial diversity.',                    code: 'RandomHorizontalFlip(p=0.5)' },
  { name: 'Vertical Flip',   desc: 'Random vertical reflection preventing orientation bias in the classifier.',       code: 'RandomVerticalFlip(p=0.5)' },
  { name: 'Random Rotation', desc: 'Up to ±30° rotation to simulate varying dermoscopy acquisition angles.',         code: 'RandomRotation(degrees=30)' },
  { name: 'Color Jitter',    desc: 'Brightness ±0.2, contrast ±0.2, saturation ±0.2, hue ±0.1 perturbations.',     code: 'ColorJitter(0.2, 0.2, 0.2, 0.1)' },
  { name: 'Random Affine',   desc: 'Affine geometric transformations for additional spatial invariance.',             code: 'RandomAffine(degrees=0, translate=0.1)' },
  { name: 'Normalization',   desc: 'ImageNet mean [0.485, 0.456, 0.406] and std [0.229, 0.224, 0.225].',            code: 'Normalize(mean, std)' },
];

export default function MethodologyPage() {
  return (
    <div className="min-h-screen py-10 px-4 bg-slate-100">
      <div className="max-w-7xl mx-auto">

        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-teal-600 flex items-center justify-center shadow-md">
              <GitBranch size={22} className="text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Methodology & Pipeline</h1>
          </div>
          <p className="text-slate-600 text-base font-medium ml-14">
            Complete end-to-end pipeline for the Heterogeneous Quad-Ensemble (HQE) framework on HAM10000
          </p>
        </motion.div>

        {/* Pipeline */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show" className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-slate-200">
          <p className="text-sm font-black text-slate-700 uppercase tracking-wider mb-5 border-l-4 border-teal-500 pl-3">End-to-End Pipeline</p>
          <div className="flex flex-wrap items-start gap-2">
            {PIPELINE.map((step, i) => (
              <div key={step.label} className="flex items-start gap-2">
                <div className="bg-teal-50 border border-teal-200 rounded-xl px-3 py-2.5 text-center min-w-[110px]">
                  <p className="text-xs font-black text-teal-800 mb-0.5">{step.label}</p>
                  <p className="text-[10px] text-slate-500 leading-tight font-medium">{step.desc}</p>
                </div>
                {i < PIPELINE.length - 1 && <ArrowRight size={14} className="text-slate-400 flex-shrink-0 mt-3" />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <motion.div custom={1} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <p className="text-sm font-black text-slate-700 uppercase tracking-wider mb-1 border-l-4 border-teal-500 pl-3">Original Dataset Distribution</p>
            <p className="text-sm text-slate-500 font-medium mb-5 ml-4">Severe class imbalance — nv dominates at 66.9% of samples</p>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={ORIGINAL} cx="50%" cy="50%" innerRadius={52} outerRadius={88} paddingAngle={3} dataKey="value">
                  {ORIGINAL.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v) => [v.toLocaleString(), 'Samples']} {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#475569' }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div custom={2} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <p className="text-sm font-black text-slate-700 uppercase tracking-wider mb-1 border-l-4 border-teal-500 pl-3">Inverse-Frequency Class Weights</p>
            <p className="text-sm text-slate-500 font-medium mb-5 ml-4">Rare classes (df, vasc) receive higher loss penalty — no synthetic oversampling</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={WEIGHTED} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#334155', fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 13]} tickFormatter={(v) => v.toFixed(0)} />
                <Tooltip formatter={(v) => [v.toFixed(2), 'Weight wc']} {...tooltipStyle} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>{WEIGHTED.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Augmentation */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-6">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Data Augmentation Strategies</h2>
          <p className="text-slate-500 text-sm font-medium mb-5">Applied during training only — inference uses deterministic resize, crop & normalize</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AUGS.map((aug, i) => (
              <motion.div key={aug.name} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
              >
                <h3 className="font-extrabold text-slate-800 text-base mb-2">{aug.name}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-3">{aug.desc}</p>
                <code className="text-xs font-mono text-teal-700 bg-teal-50 px-2.5 py-1.5 rounded-lg block border border-teal-100">{aug.code}</code>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Training Config */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Training Configuration</h2>
          <p className="text-slate-500 text-sm font-medium mb-5">Identical hyperparameters used across all four models for fair comparison</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              ['Optimizer',      'Adam'],
              ['Learning Rate',  '1×10⁻⁴'],
              ['LR Schedule',    'ReduceLROnPlateau'],
              ['LR Decay',       '×0.5, patience=3'],
              ['Epochs',         '20'],
              ['Early Stopping', 'Patience = 5'],
              ['Batch Size',     '32'],
              ['Loss Function',  'Inv-Freq Weighted CE'],
              ['Dropout',        '0.4'],
              ['Weight Decay',   '1×10⁻⁴'],
              ['Input Size',     '224 × 224'],
              ['Framework',      'PyTorch 2.x'],
              ['Pre-training',   'ImageNet (ILSVRC)'],
              ['Adam β₁ / β₂',   '0.9 / 0.999'],
            ].map(([label, value]) => (
              <div key={label} className="bg-slate-50 border border-slate-200 rounded-xl p-3 hover:border-teal-300 transition-colors">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wide mb-1">{label}</p>
                <p className="text-sm font-extrabold text-slate-800 font-mono">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Ensemble Models */}
        <motion.div custom={5} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-1">HQE Constituent Models</h2>
          <p className="text-slate-500 text-sm font-medium mb-5">Four architecturally distinct backbones — soft-voting over averaged softmax probabilities</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'MobileNetV3-Large', params: '~5.5M', feat: '960-d',  note: 'Hard-swish + SE attention. Best vasc precision (1.00). Efficient edge deployment.',  acc: '89%' },
              { name: 'ResNet-50',         params: '~25.6M', feat: '2048-d', note: 'Residual skip connections. Strongest mel & akiec recall among individual models.',     acc: '89%' },
              { name: 'EfficientNet-B0',   params: '~5.3M',  feat: '1280-d', note: 'NAS-optimised MBConv blocks. Highest individual accuracy and mel precision (0.99).',  acc: '92%' },
              { name: 'EfficientNet-B3',   params: '~12.2M', feat: '1536-d', note: 'Compound-scaled (φ=3). Best mel recall balance vs. B0. Trained at 224×224.',         acc: '90%' },
            ].map((m) => (
              <div key={m.name} className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-teal-300 transition-colors">
                <p className="text-sm font-black text-slate-800 mb-1">{m.name}</p>
                <div className="flex gap-2 mb-2 flex-wrap">
                  <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">{m.params}</span>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{m.feat}</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Val {m.acc}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{m.note}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
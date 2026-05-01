import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { GitBranch, ArrowRight } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.45, ease: 'easeOut' } }) };
const tooltipStyle = { contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 12 } };

const ORIGINAL = [
  { name: 'nv', value: 6705, color: '#10b981' }, { name: 'mel', value: 1113, color: '#ef4444' },
  { name: 'bkl', value: 1099, color: '#3b82f6' }, { name: 'bcc', value: 514, color: '#f59e0b' },
  { name: 'akiec', value: 327, color: '#0d9488' }, { name: 'vasc', value: 142, color: '#ec4899' },
  { name: 'df', value: 115, color: '#64748b' },
];
const BALANCED = ORIGINAL.map((d) => ({ ...d, value: 6700 }));

const PIPELINE = [
  { label: 'Data Loading',      desc: 'HAM10000 — 10,015 images, 7 classes' },
  { label: 'Oversampling',      desc: 'SMOTE + augmentation to 6,700/class' },
  { label: 'Augmentation',      desc: 'Flip, rotation, color jitter, normalize' },
  { label: 'Transfer Learning', desc: 'EfficientNet-B0 — ImageNet pretrained' },
  { label: 'Training',          desc: '50 epochs, AdamW, cosine LR' },
  { label: 'Ensemble',          desc: 'Soft-voting across top-3 models' },
  { label: 'Grad-CAM',          desc: 'Gradient activation explainability' },
];

const AUGS = [
  { name: 'Horizontal Flip', desc: 'p=0.5 random horizontal reflection to increase spatial diversity.',          code: 'RandomHorizontalFlip(p=0.5)' },
  { name: 'Vertical Flip',   desc: 'p=0.5 vertical reflection preventing orientation bias in the classifier.',   code: 'RandomVerticalFlip(p=0.5)' },
  { name: 'Random Rotation', desc: 'Up to ±30° rotation to simulate varying dermoscopy acquisition angles.',     code: 'RandomRotation(degrees=30)' },
  { name: 'Color Jitter',    desc: 'Brightness ±0.2, contrast ±0.2, saturation ±0.2, hue ±0.1 perturbations.', code: 'ColorJitter(0.2, 0.2, 0.2, 0.1)' },
  { name: 'Normalization',   desc: 'ImageNet mean [0.485, 0.456, 0.406] and std [0.229, 0.224, 0.225].',        code: 'Normalize(mean, std)' },
  { name: 'Resize & Crop',   desc: '256px resize with 224×224 center crop for EfficientNet input dimensions.',  code: 'CenterCrop(224)' },
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
          <p className="text-slate-600 text-base font-medium ml-14">Complete end-to-end pipeline from raw HAM10000 data to deployed model</p>
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
            <p className="text-sm text-slate-500 font-medium mb-5 ml-4">Severe class imbalance — nv dominates at 6,705 samples</p>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={ORIGINAL} cx="50%" cy="50%" innerRadius={52} outerRadius={88} paddingAngle={3} dataKey="value">
                  {ORIGINAL.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [v.toLocaleString(), 'Samples']} {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#475569' }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div custom={2} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <p className="text-sm font-black text-slate-700 uppercase tracking-wider mb-1 border-l-4 border-teal-500 pl-3">After Oversampling</p>
            <p className="text-sm text-slate-500 font-medium mb-5 ml-4">Balanced to ~6,700 samples per class via augmentation</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={BALANCED} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#334155', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 7000]} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [v.toLocaleString(), 'Samples']} {...tooltipStyle} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>{BALANCED.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Augmentation */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-6">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Data Augmentation Strategies</h2>
          <p className="text-slate-500 text-sm font-medium mb-5">Techniques applied to expand and balance the training dataset</p>
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
        <motion.div custom={4} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Training Configuration</h2>
          <p className="text-slate-500 text-sm font-medium mb-5">Hyperparameters and setup used for model training</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              ['Architecture', 'EfficientNet-B0'], ['Pretrained', 'ImageNet-1K'], ['Optimizer', 'AdamW'], ['Learning Rate', '1e-4 → 1e-6'],
              ['Epochs', '50'], ['Batch Size', '32'], ['LR Schedule', 'Cosine Annealing'], ['Loss Function', 'Cross-Entropy'],
              ['Dropout', '0.3'], ['Input Size', '224 × 224'], ['Framework', 'PyTorch 2.0'], ['GPU', 'NVIDIA T4'],
            ].map(([label, value]) => (
              <div key={label} className="bg-slate-50 border border-slate-200 rounded-xl p-3 hover:border-teal-300 transition-colors">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wide mb-1">{label}</p>
                <p className="text-sm font-extrabold text-slate-800 font-mono">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
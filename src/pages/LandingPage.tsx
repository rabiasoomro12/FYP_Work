import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, BarChart2, Brain, Database, Shield, Zap, ChevronRight } from 'lucide-react';

interface Props { onAuthClick: () => void; }

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.55, ease: 'easeOut' } }),
};

const STATS = [
  { value: '10,015', label: 'Training Images', icon: Database, color: 'bg-teal-50 text-teal-600 border-teal-100' },
  { value: '4',      label: 'DL Models',       icon: Brain,    color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { value: '7',      label: 'Disease Classes', icon: BarChart2, color: 'bg-violet-50 text-violet-600 border-violet-100' },
  { value: '89.76%', label: 'Best Accuracy',   icon: Zap,      color: 'bg-amber-50 text-amber-600 border-amber-100' },
];

const FEATURES = [
  { icon: Brain,    title: 'Transfer Learning',    desc: 'EfficientNet-B0 achieves 89.76% accuracy on 7 skin lesion classes, trained on the benchmark HAM10000 dataset with compound scaling.', color: 'bg-teal-50 text-teal-600' },
  { icon: Activity, title: 'Grad-CAM Explainability', desc: 'Gradient-weighted Class Activation Maps visually highlight the exact image regions driving each prediction for clinical transparency.', color: 'bg-blue-50 text-blue-600' },
  { icon: Shield,   title: 'Clinical-Grade Metrics',  desc: 'Full probability distribution, AUC-ROC 0.976, F1-Score, and per-class confidence for every analysis result.', color: 'bg-emerald-50 text-emerald-600' },
  { icon: BarChart2, title: '4-Model Ensemble',       desc: 'EfficientNet-B0/B3, MobileNetV3, and ResNet-50 vote on every prediction. Averaged probabilities improve robustness.', color: 'bg-amber-50 text-amber-600' },
];

const CLASSES = [
  { code: 'MEL',   name: 'Melanoma',            color: 'bg-red-50 text-red-700 border-red-200' },
  { code: 'NV',    name: 'Melanocytic Nevus',   color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { code: 'BCC',   name: 'Basal Cell Carcinoma', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { code: 'AKIEC', name: 'Actinic Keratosis',   color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { code: 'BKL',   name: 'Benign Keratosis',    color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { code: 'DF',    name: 'Dermatofibroma',      color: 'bg-slate-50 text-slate-700 border-slate-200' },
  { code: 'VASC',  name: 'Vascular Lesion',     color: 'bg-pink-50 text-pink-700 border-pink-200' },
];

export default function LandingPage({ onAuthClick }: Props) {
  return (
    <div className="overflow-x-hidden bg-white">
      {/* Hero */}
      <section className="relative pt-20 pb-24 px-4 overflow-hidden bg-gradient-to-br from-white via-teal-50/40 to-blue-50/30">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-100/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-100/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-teal-50 border border-teal-200 rounded-full text-xs text-teal-700 font-semibold mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            HAM10000 Dataset · EfficientNet-B0 · 89.76% Accuracy
          </motion.div>
          <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="show"
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-6"
          >
            Derm<span className="text-gradient">AI</span>
            <br />
            <span className="text-3xl sm:text-4xl font-semibold text-slate-500">Skin Disease Classification</span>
          </motion.h1>
          <motion.p custom={2} variants={fadeUp} initial="hidden" animate="show"
            className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Deep Learning on HAM10000 · 7 Lesion Types · 4-Model Ensemble · Grad-CAM Explainability. Clinical-grade AI for dermatological screening and research.
          </motion.p>
          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show" className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/classifier" className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all shadow-md group">
              Try Classifier <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <button onClick={onAuthClick} className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all border border-slate-200 shadow-sm">
              Create Free Account
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map(({ value, label, icon: Icon, color }, i) => (
              <motion.div key={label} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100 card-hover"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mx-auto mb-3 ${color}`}>
                  <Icon size={19} />
                </div>
                <div className="text-2xl font-bold text-slate-800 mb-1">{value}</div>
                <div className="text-xs text-slate-500 font-medium">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Disease Classes */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">7 Disease Classes</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm">Trained on the most clinically relevant pigmented skin lesions from the HAM10000 benchmark dataset.</p>
          </motion.div>
          <div className="flex flex-wrap gap-3 justify-center">
            {CLASSES.map(({ code, name, color }, i) => (
              <motion.div key={code} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold ${color}`}
              >
                <span className="font-mono text-xs opacity-60">{code}</span>
                <span>{name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">Research-Grade Capabilities</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm">Final Year Project at Sukkur IBA University — combining clinical accuracy with explainable, interpretable AI.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div key={title} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 flex gap-4 shadow-sm border border-slate-100 card-hover"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}><Icon size={19} /></div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1.5">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-3xl p-10 text-center shadow-xl"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
              <Activity size={28} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Ready to Analyze?</h2>
            <p className="text-teal-100 mb-8 max-w-lg mx-auto text-sm leading-relaxed">
              Sign up for a free account to access the complete clinical report, full probability metrics, per-model ensemble votes, and Grad-CAM explainability for every analysis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={onAuthClick} className="px-6 py-3 bg-white hover:bg-teal-50 text-teal-700 font-bold rounded-xl transition-all shadow-md">
                Create Free Account
              </button>
              <Link to="/classifier" className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-500/40 hover:bg-teal-500/60 text-white font-semibold rounded-xl transition-all border border-white/20">
                Try as Guest <ChevronRight size={15} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

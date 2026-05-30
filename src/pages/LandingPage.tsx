import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, BarChart2, Brain, Database, Shield, Zap, ChevronRight } from 'lucide-react';

interface Props { onAuthClick: () => void; }

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.55, ease: 'easeOut' } }),
};

const STATS = [
  { value: '10,000+', label: 'Clinical Cases', icon: Database, color: 'bg-teal-50 text-teal-600 border-teal-100' },
  { value: 'Quad-AI',  label: 'Ensemble Engine', icon: Brain,    color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { value: '7 Types',  label: 'Lesion Detection', icon: BarChart2, color: 'bg-violet-50 text-violet-600 border-violet-100' },
  { value: '96%+',     label: 'Ensemble Accuracy', icon: Zap,     color: 'bg-amber-50 text-amber-600 border-amber-100' },
];

const FEATURES = [
  { icon: Brain,     title: 'Advanced AI Screening',   desc: 'Powered by a state-of-the-art ensemble of 4 deep learning models to ensure maximum diagnostic precision and reliability.', color: 'bg-teal-50 text-teal-600' },
  { icon: Activity,  title: 'Visual Explainability',   desc: 'See exactly what the AI sees. Our system highlights the specific regions of concern for complete transparency.', color: 'bg-blue-50 text-blue-600' },
  { icon: Shield,    title: 'Clinical-Grade Insights', desc: 'Receive comprehensive reports with full probability breakdowns and AI-generated medical summaries for every scan.', color: 'bg-emerald-50 text-emerald-600' },
  { icon: BarChart2, title: 'Expert Consensus',        desc: 'The system uses "Soft-Voting" logic, combining the expertise of ResNet, MobileNet, and EfficientNet architectures.', color: 'bg-amber-50 text-amber-600' },
];

const CLASSES = [
  { code: 'MEL',   name: 'Melanoma',             color: 'bg-red-50 text-red-700 border-red-200' },
  { code: 'NV',    name: 'Melanocytic Nevus',    color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { code: 'BCC',   name: 'Basal Cell Carcinoma', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { code: 'AKIEC', name: 'Actinic Keratosis',    color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { code: 'BKL',   name: 'Benign Keratosis',     color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { code: 'DF',    name: 'Dermatofibroma',        color: 'bg-slate-50 text-slate-700 border-slate-200' },
  { code: 'VASC',  name: 'Vascular Lesion',      color: 'bg-pink-50 text-pink-700 border-pink-200' },
];

export default function LandingPage({ onAuthClick }: Props) {
  return (
    <div className="overflow-x-hidden bg-white">

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-4 overflow-hidden bg-gradient-to-br from-white via-teal-50/40 to-blue-50/30">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-100/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-100/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-teal-50 border border-teal-200 rounded-full text-xs text-teal-700 font-bold mb-8 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            FYP BE - VIII CSE Spring 2022 - Sukkur IBA University
          </motion.div>

          <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="show"
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6"
          >
            Derm<span className="text-teal-600">AI</span>
            <br />
            <span className="text-3xl sm:text-4xl font-semibold text-slate-500">Intelligent Skin Health Analysis</span>
          </motion.h1>

          <motion.p custom={2} variants={fadeUp} initial="hidden" animate="show"
            className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Leverage clinical-grade deep learning for instant lesion screening. High-precision results powered by multi-model ensemble technology.
          </motion.p>

          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show" className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/classifier" className="flex items-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95 group">
              Scan Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button onClick={onAuthClick} className="flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl transition-all border border-slate-200 shadow-sm">
              Create Free Account
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-14 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map(({ value, label, icon: Icon, color }, i) => (
              <motion.div key={label} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mx-auto mb-3 ${color}`}>
                  <Icon size={19} />
                </div>
                <div className="text-2xl font-bold text-slate-800 mb-1">{value}</div>
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Disease Classes Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Comprehensive Detection</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm">Our AI is trained to recognize the most clinically significant types of skin lesions with professional accuracy.</p>
          </motion.div>
          <div className="flex flex-wrap gap-3 justify-center">
            {CLASSES.map(({ code, name, color }, i) => (
              <motion.div key={code} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl border shadow-sm font-bold ${color}`}
              >
                <span className="font-mono text-xs opacity-50 uppercase tracking-tighter">{code}</span>
                <span className="text-sm">{name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Why Choose DermAI?</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm">Building the future of dermatology at Sukkur IBA University by combining medical logic with high-performance engineering.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div key={title} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="bg-white rounded-3xl p-8 flex gap-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${color}`}><Icon size={22} /></div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-2 text-lg">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-[2.5rem] p-12 text-center shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-8">
              <Activity size={32} className="text-white" />
            </div>
            <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Ready for your scan?</h2>
            <p className="text-teal-100 mb-10 max-w-xl mx-auto text-md font-medium leading-relaxed">
              Create an account to access complete diagnostic reports, visual heatmaps, and detailed AI insights powered by our ensemble system.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <button onClick={onAuthClick} className="px-10 py-4 bg-white hover:bg-teal-50 text-teal-700 font-bold rounded-2xl transition-all shadow-lg active:scale-95">
                Get Started Now
              </button>
              <Link to="/classifier" className="flex items-center justify-center gap-2 px-10 py-4 bg-teal-500/20 hover:bg-teal-500/40 text-white font-bold rounded-2xl transition-all border border-white/20 backdrop-blur-sm">
                Try Guest Mode <ChevronRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
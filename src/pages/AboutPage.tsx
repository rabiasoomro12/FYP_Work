import { motion } from 'framer-motion';
import { Users, GraduationCap, Award, Zap } from 'lucide-react';

// Import assets
import cseLogo from '../assets/cse.png';
import rabiaImg from '../assets/rabia.png';
import nimertaImg from '../assets/nimerta.png';
import waqarImg from '../assets/waqar.png';
import sattarImg from '../assets/sattar.jpg';
import umairImg from '../assets/umair.jpg';
import kashifImg from '../assets/kashif.png';

const fadeUp = { 
  hidden: { opacity: 0, y: 20 }, 
  show: (i = 0) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { delay: i * 0.1, duration: 0.45, ease: 'easeOut' } 
  }) 
};

const TEAM = [
  { name: 'Rabia Soomro', role: 'AI Developer', focus: 'Deep Learning · Model Training · Grad-CAM · HuggingFace', img: rabiaImg },
  { name: 'Nimerta Wadhwani', role: 'Full-Stack Developer', focus: 'React · Vite · Supabase · TypeScript · UI/UX', img: nimertaImg },
  { name: 'Waqar Abbas Khan', role: 'Data Specialist & Researcher', focus: 'Dataset Preprocessing · Statistical Analysis · Research · Testing', img: waqarImg },
];

const SUPERVISORS = [
  { name: 'Dr. Abdul Sattar Chan', title: 'Project Supervisor', org: 'Head of Department, Computer Systems Engineering — Sukkur IBA University', img: sattarImg },
  { name: 'Dr. Umair Ayaz Kamagar', title: 'Internal Examiner', org: 'FYP Coordinator & Lecturer, Computer Systems Engineering — Sukkur IBA University', img: umairImg },
  { name: 'Engr. Kashif Mujeeb', title: 'Industrial Supervisor', org: 'Assistant Manager Data Science & AI — United Bank Limited (UBL)', img: kashifImg },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen py-10 px-4 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 flex flex-col items-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-teal-100 rounded-full scale-110 blur-xl opacity-60"></div>
            <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white shadow-xl overflow-hidden border-2 border-white p-3 z-10">
              <img src={cseLogo} alt="CSE Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Sukkur IBA University</h1>
          <p className="text-slate-600 text-sm mb-5 max-w-xl">Department of Computer Systems Engineering · Final Year Project 2026</p>
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-teal-50 border border-teal-200 rounded-full text-sm text-teal-700 font-semibold shadow-inner">
            <Award size={16} /> DermAI — Deep Learning-based Skin Disease Classification System
          </div>
        </motion.div>

        {/* Project Overview Card */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-3xl p-8 mb-12 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="text-teal-300" size={24} /> Project Overview
            </h2>
            <p className="text-teal-50 leading-relaxed text-lg mb-4">
              DermAI is a high-performance skin disease classification system developed at Sukkur IBA University. 
              The system leverages transfer learning on the <strong>HAM10000 dataset</strong>, processing over <strong>10,000+ dermoscopic images</strong> across 7 clinically significant lesion classes.
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex-1 min-w-[200px]">
                <p className="text-teal-200 text-xs uppercase tracking-wider font-bold mb-1">Ensemble Accuracy</p>
                <p className="text-white text-3xl font-black">91%</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex-1 min-w-[200px]">
                <p className="text-teal-200 text-xs uppercase tracking-wider font-bold mb-1">Explainability</p>
                <p className="text-white text-xl font-bold italic">Grad-CAM Augmented</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        </motion.div>

        {/* Student Team Section */}
        <section className="mb-14">
          <motion.div custom={1} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-sm"><Users size={20} className="text-white" /></div>
            <h2 className="text-2xl font-bold text-slate-900">Student Team</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TEAM.map((m, i) => (
              <motion.div key={m.name} custom={i + 2} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="bg-white rounded-3xl p-7 text-center shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all group"
              >
                <div className="relative w-28 h-28 mx-auto mb-5">
                  <div className="absolute inset-0 rounded-3xl bg-teal-50 group-hover:bg-teal-100 group-hover:scale-105 transition-all"></div>
                  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-md border-4 border-white z-10">
                    <img src={m.img} alt={m.name} className="w-full h-full object-cover" />
                  </div>
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-1">{m.name}</h3>
                <p className="text-sm font-semibold text-teal-600 mb-3">{m.role}</p>
                <div className="h-px w-12 bg-slate-100 mx-auto mb-3 group-hover:w-20 transition-all"></div>
                <p className="text-xs text-slate-500 leading-relaxed px-2 h-10 flex items-center justify-center">{m.focus}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Supervisors Section - CENTER ALIGNED */}
        <section className="mb-14">
          <motion.div custom={5} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-sm"><GraduationCap size={20} className="text-white" /></div>
            <h2 className="text-2xl font-bold text-slate-900">Supervisory Committee</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUPERVISORS.map((s, i) => (
              <motion.div key={s.name} custom={i + 6} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="bg-white rounded-3xl p-7 text-center shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all group"
              >
                {/* HIGHLIGHTED PHOTO CONTAINER */}
                <div className="relative w-28 h-28 mx-auto mb-5">
                  <div className="absolute inset-0 rounded-3xl bg-teal-50 group-hover:bg-teal-100 group-hover:scale-105 transition-all"></div>
                  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-md border-4 border-white z-10">
                    <img src={s.img} alt={s.name} className="w-full h-full object-cover" />
                  </div>
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-1">{s.name}</h3>
                <p className="text-sm font-semibold text-teal-600 mb-3">{s.title}</p>
                <div className="h-px w-12 bg-slate-100 mx-auto mb-3 group-hover:w-20 transition-all"></div>
                <p className="text-xs text-slate-400 leading-relaxed px-2">{s.org}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <motion.div custom={9} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Technical Stack</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {['PyTorch 2.0', 'EfficientNet', 'HAM10000', 'Grad-CAM', 'HuggingFace', 'React + Vite', 'Tailwind CSS', 'Supabase', 'Framer Motion', 'Recharts'].map((tech) => (
              <div key={tech} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-center text-xs font-bold text-slate-600 hover:bg-teal-50 hover:border-teal-100 hover:text-teal-700 hover:scale-105 transition-all cursor-default shadow-inner">
                {tech}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
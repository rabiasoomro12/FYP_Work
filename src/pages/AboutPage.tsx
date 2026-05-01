import { motion } from 'framer-motion';
import { Users, GraduationCap, Award, Zap } from 'lucide-react';

// Team & Institution Assets
import cseLogo from '../assets/cse.png';
import rabiaImg from '../assets/rabia.png';
import nimertaImg from '../assets/nimerta.png';
import waqarImg from '../assets/waqar.png';
import sattarImg from '../assets/sattar.jpg';
import umairImg from '../assets/umair.jpg';
import kashifImg from '../assets/kashif.png';

// Tech Stack Assets
import reactLogo from '../assets/react.png';
import viteLogo from '../assets/vite.png';
import tailwindLogo from '../assets/tailwind.png';
import tsLogo from '../assets/typescript.png';
import fastapiLogo from '../assets/fastapi.png';
import pythonLogo from '../assets/python.png';
import supabaseLogo from '../assets/supabase.png';
import jspdfLogo from '../assets/jspdf.png';
import pytorchLogo from '../assets/pytorch.png';
import huggingfaceLogo from '../assets/huggingface.png';
import vercelLogo from '../assets/vercel.png';

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

const TECH_STACK = [
  { name: 'React', img: reactLogo },
  { name: 'Vite', img: viteLogo },
  { name: 'Tailwind CSS', img: tailwindLogo },
  { name: 'TypeScript', img: tsLogo },
  { name: 'FastAPI', img: fastapiLogo },
  { name: 'Python', img: pythonLogo },
  { name: 'Supabase', img: supabaseLogo },
  { name: 'JsPDF', img: jspdfLogo },
  { name: 'PyTorch', img: pytorchLogo },
  { name: 'HuggingFace', img: huggingfaceLogo },
  { name: 'Vercel', img: vercelLogo },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen py-10 px-4 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 flex flex-col items-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-teal-100 rounded-full scale-125 blur-2xl opacity-50"></div>
            <div className="relative inline-flex items-center justify-center w-32 h-32 rounded-3xl bg-white shadow-xl overflow-hidden border-2 border-white p-1 z-10">
              <img src={cseLogo} alt="CSE Logo" className="w-full h-full object-contain scale-110" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">Sukkur IBA University</h1>
          <p className="text-slate-900 text-base mb-6 max-w-xl font-bold">Department of Computer Systems Engineering · Final Year Project 2026[cite: 1]</p>
          <div className="inline-flex items-center gap-2.5 px-6 py-3 bg-teal-100 border-2 border-teal-600 rounded-full text-sm text-teal-900 font-black shadow-md">
            <Award size={18} className="text-teal-700" /> DermAI — Deep Learning-based Skin Disease Classification System[cite: 1]
          </div>
        </motion.div>

        {/* Project Overview Card */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="bg-gradient-to-br from-teal-700 to-teal-900 rounded-3xl p-10 mb-12 shadow-2xl relative overflow-hidden border-b-4 border-teal-950">
          <div className="relative z-10">
            <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
              <Zap className="text-teal-300" size={24} /> Project Overview
            </h2>
            <p className="text-white leading-relaxed text-lg mb-6 font-medium">
              DermAI is a high-performance skin disease classification system developed at Sukkur IBA University[cite: 1]. 
              The system leverages transfer learning on the <strong>HAM10000 dataset</strong>, processing over <strong>10,000+ dermoscopic images</strong> across 7 clinically significant lesion classes[cite: 1].
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl p-5 flex flex-col justify-center">
                <p className="text-teal-300 text-xs uppercase tracking-widest font-black mb-1">Ensemble Accuracy</p>
                <p className="text-white text-4xl font-black">91%[cite: 1]</p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl p-5 flex flex-col justify-center">
                <p className="text-teal-300 text-xs uppercase tracking-widest font-black mb-1">Explainability</p>
                <p className="text-white text-xl font-black italic">Grad-CAM Augmented[cite: 1]</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl"></div>
        </motion.div>

        {/* Student Team Section */}
        <section className="mb-16">
          <motion.div custom={1} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg"><Users size={24} className="text-white" /></div>
            <h2 className="text-3xl font-black text-slate-900">Student Team</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TEAM.map((m, i) => (
              <motion.div key={m.name} custom={i + 2} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="bg-white rounded-[2rem] p-8 text-center shadow-md border-2 border-slate-100 hover:border-teal-500 transition-all group"
              >
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-teal-100 group-hover:scale-110 transition-all"></div>
                  <div className="relative w-full h-full rounded-full overflow-hidden shadow-xl border-4 border-white z-10">
                    <img src={m.img} alt={m.name} className="w-full h-full object-cover" />
                  </div>
                </div>
                <h3 className="font-black text-slate-900 text-xl mb-1">{m.name}</h3>
                <p className="text-sm font-black text-teal-700 mb-4 uppercase tracking-tighter">{m.role}</p>
                <div className="h-1 w-16 bg-slate-900 mx-auto mb-4 rounded-full"></div>
                <p className="text-[13px] text-slate-900 font-bold leading-tight px-2">{m.focus}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Supervisors Section */}
        <section className="mb-16">
          <motion.div custom={5} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg"><GraduationCap size={24} className="text-white" /></div>
            <h2 className="text-3xl font-black text-slate-900">Supervisory Committee</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SUPERVISORS.map((s, i) => (
              <motion.div key={s.name} custom={i + 6} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="bg-white rounded-[2rem] p-8 text-center shadow-md border-2 border-slate-100 hover:border-teal-500 transition-all group"
              >
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-slate-100 group-hover:scale-110 transition-all"></div>
                  <div className="relative w-full h-full rounded-full overflow-hidden shadow-xl border-4 border-white z-10">
                    <img src={s.img} alt={s.name} className="w-full h-full object-cover" />
                  </div>
                </div>
                <h3 className="font-black text-slate-900 text-xl mb-1">{s.name}</h3>
                <p className="text-sm font-black text-teal-700 mb-4 uppercase tracking-tighter">{s.title}</p>
                <div className="h-1 w-16 bg-slate-900 mx-auto mb-4 rounded-full"></div>
                <p className="text-[13px] text-slate-800 font-black leading-snug">{s.org}[cite: 1]</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Technical Stack */}
        <motion.div custom={9} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="bg-white rounded-[2.5rem] p-10 shadow-xl border-2 border-slate-200">
          <h2 className="text-xl font-black text-slate-900 mb-8 text-center uppercase tracking-widest">Technical Stack</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {TECH_STACK.map((tech) => (
              <div key={tech.name} className="flex flex-col items-center justify-center bg-slate-50 border-2 border-slate-100 rounded-3xl p-5 hover:bg-white hover:border-teal-500 hover:shadow-xl transition-all group">
                <div className="w-14 h-14 mb-4 flex items-center justify-center transition-all">
                  <img src={tech.img} alt={tech.name} className="max-w-full max-h-full object-contain" />
                </div>
                <span className="text-[11px] font-black text-slate-900 uppercase tracking-tighter group-hover:text-teal-700">{tech.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
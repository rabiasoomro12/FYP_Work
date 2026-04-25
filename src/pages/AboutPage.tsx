import { motion } from 'framer-motion';
import { Users, GraduationCap, Building2, Award } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.45, ease: 'easeOut' } }) };

const TEAM = [
  { name: 'Rabia Soomro',     role: 'AI Developer',         focus: 'Deep Learning · Model Training · Grad-CAM · HuggingFace', initials: 'RS', bg: 'bg-teal-600' },
  { name: 'Nimerta Wadhwani', role: 'Full-Stack Developer',  focus: 'React · Vite · Supabase · TypeScript · UI/UX',            initials: 'NW', bg: 'bg-blue-600' },
  { name: 'Waqar Abbas Khan', role: 'Intern',                focus: 'Dataset Preprocessing · Research · Testing',              initials: 'WK', bg: 'bg-orange-500' },
];

const SUPERVISORS = [
  { name: 'Dr. Abdul Sattar Chan', title: 'Project Supervisor',   org: 'Head of Department, Computer Systems Engineering — Sukkur IBA University',  initials: 'AC', bg: 'bg-teal-700',   badge: 'Supervisor', badgeCls: 'text-teal-700 bg-teal-50 border-teal-200' },
  { name: 'Umair Ayaz Kamagar',    title: 'Internal Examiner',    org: 'FYP Coordinator & Lecturer, Computer Systems Engineering — Sukkur IBA University', initials: 'UK', bg: 'bg-blue-700',   badge: 'Internal',   badgeCls: 'text-blue-700 bg-blue-50 border-blue-200' },
  { name: 'Engr. Kashif Mujeeb',   title: 'Industrial Supervisor', org: 'Assistant Manager Data Science & AI — United Bank Limited (UBL)',            initials: 'KM', bg: 'bg-orange-600', badge: 'Industrial', badgeCls: 'text-orange-700 bg-orange-50 border-orange-200' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen py-10 px-4 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 mb-4 shadow-md"><Building2 size={28} className="text-white" /></div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Sukkur IBA University</h1>
          <p className="text-slate-500 text-sm mb-4">Department of Computer Systems Engineering · Final Year Project 2025</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200 rounded-full text-xs text-teal-700 font-semibold">
            <Award size={13} /> DermAI — Deep Learning-based Skin Disease Classification System
          </div>
        </motion.div>

        <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-7 mb-10 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-3">Project Overview</h2>
          <p className="text-teal-100 leading-relaxed text-sm mb-3">
            DermAI is a deep learning-based skin disease classification system developed as a Final Year Project at Sukkur IBA University.
            The system uses transfer learning on the HAM10000 dataset — 10,015 dermoscopic images across 7 clinically relevant lesion classes.
          </p>
          <p className="text-teal-200 text-sm leading-relaxed">
            A rigorous comparative study of four architectures (EfficientNet-B0/B3, MobileNetV3, ResNet-50) is augmented with Grad-CAM explainability.
            EfficientNet-B0 achieves 89.76% accuracy with AUC-ROC of 0.976. The model is deployed live on HuggingFace Spaces for real-time ensemble inference.
          </p>
        </motion.div>

        <section className="mb-10">
          <motion.div custom={1} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center shadow-sm"><Users size={15} className="text-white" /></div>
            <h2 className="text-xl font-bold text-slate-800">Student Team</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TEAM.map((m, i) => (
              <motion.div key={m.name} custom={i + 2} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100 card-hover"
              >
                <div className={`w-14 h-14 rounded-2xl ${m.bg} flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg shadow-sm`}>{m.initials}</div>
                <h3 className="font-bold text-slate-800 mb-1">{m.name}</h3>
                <p className="text-sm font-semibold text-teal-600 mb-2">{m.role}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{m.focus}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <motion.div custom={5} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center shadow-sm"><GraduationCap size={15} className="text-white" /></div>
            <h2 className="text-xl font-bold text-slate-800">Supervisory Committee</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {SUPERVISORS.map((s, i) => (
              <motion.div key={s.name} custom={i + 6} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm`}>{s.initials}</div>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${s.badgeCls}`}>{s.badge}</span>
                </div>
                <h3 className="font-bold text-slate-800 mb-0.5">{s.name}</h3>
                <p className="text-sm font-semibold text-teal-600 mb-2">{s.title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{s.org}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <motion.div custom={9} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Technical Stack</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {['PyTorch 2.0', 'EfficientNet', 'HAM10000', 'Grad-CAM', 'HuggingFace', 'React + Vite', 'Tailwind CSS', 'Supabase', 'Framer Motion', 'Recharts'].map((tech) => (
              <div key={tech} className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-center text-xs font-semibold text-slate-600">{tech}</div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

// ✅ IMPORT YOUR LOCAL IMAGES
import mel from '../assets/mel.jpg';
import nv from '../assets/nv.jpg';
import bcc from '../assets/bcc.jpg';
import akiec from '../assets/akiec.jpg';
import bkl from '../assets/bkl.jpg';
import df from '../assets/df.jpg';
import vasc from '../assets/vasc.jpg';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: 'easeOut' },
  }),
};

const DISEASES = [
  {
    code: 'MEL',
    key: 'mel',
    name: 'Melanoma',
    scientific: 'Malignant melanocytic neoplasm',
    risk: 'Critical',
    riskColor: 'text-red-700 bg-red-50 border-red-200',
    barColor: 'bg-red-500',
    desc: 'The most dangerous form of skin cancer, arising from melanocytes. Characterized by asymmetry, irregular border, color variation, and diameter >6mm.',
    features: ['Asymmetric', 'Irregular border', 'Multiple colors', 'Diameter >6mm'],
    imageUrl: mel,
  },
  {
    code: 'NV',
    key: 'nv',
    name: 'Melanocytic Nevus',
    scientific: 'Common mole',
    risk: 'Low',
    riskColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    barColor: 'bg-emerald-500',
    desc: 'A common benign mole. Usually symmetric, uniform in color, and stable over time.',
    features: ['Symmetric', 'Uniform color', 'Well-defined border', 'Stable'],
    imageUrl: nv,
  },
  {
    code: 'BCC',
    key: 'bcc',
    name: 'Basal Cell Carcinoma',
    scientific: 'BCC',
    risk: 'High',
    riskColor: 'text-orange-700 bg-orange-50 border-orange-200',
    barColor: 'bg-orange-500',
    desc: 'Most common skin cancer. Appears as pearly bumps or lesions on sun-exposed areas.',
    features: ['Pearly lesion', 'Rolled edges', 'May ulcerate', 'Sun-exposed areas'],
    imageUrl: bcc,
  },
  {
    code: 'AKIEC',
    key: 'akiec',
    name: 'Actinic Keratosis',
    scientific: 'Precancerous lesion',
    risk: 'Moderate',
    riskColor: 'text-amber-700 bg-amber-50 border-amber-200',
    barColor: 'bg-amber-500',
    desc: 'Rough, scaly patches caused by long-term sun exposure. Can progress to cancer.',
    features: ['Scaly patch', 'Red base', 'Sun damage', 'Precancerous'],
    imageUrl: akiec,
  },
  {
    code: 'BKL',
    key: 'bkl',
    name: 'Benign Keratosis',
    scientific: 'Seborrheic keratosis',
    risk: 'Low',
    riskColor: 'text-blue-700 bg-blue-50 border-blue-200',
    barColor: 'bg-blue-500',
    desc: 'Non-cancerous growth with a waxy, “stuck-on” appearance.',
    features: ['Waxy', 'Well-defined', 'Brown/black', 'Harmless'],
    imageUrl: bkl,
  },
  {
    code: 'DF',
    key: 'df',
    name: 'Dermatofibroma',
    scientific: 'Fibrous histiocytoma',
    risk: 'Low',
    riskColor: 'text-slate-700 bg-slate-50 border-slate-200',
    barColor: 'bg-slate-500',
    desc: 'Firm benign nodule often found on legs. Shows dimple when pinched.',
    features: ['Firm', 'Dimple sign', 'Brown color', 'Benign'],
    imageUrl: df,
  },
  {
    code: 'VASC',
    key: 'vasc',
    name: 'Vascular Lesion',
    scientific: 'Angioma / hemangioma',
    risk: 'Low',
    riskColor: 'text-pink-700 bg-pink-50 border-pink-200',
    barColor: 'bg-pink-500',
    desc: 'Benign blood vessel growths, usually red or purple.',
    features: ['Red/purple', 'Well-defined', 'Blanches', 'Benign'],
    imageUrl: vasc,
  },
];

export default function EncyclopediaPage() {
  return (
    <div className="min-h-screen py-10 px-4 bg-slate-50">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center shadow-sm">
              <BookOpen size={18} className="text-white" />
            </div>

            {/* ✅ UPDATED TITLE */}
            <h1 className="text-2xl font-bold text-slate-800">
              Skin Conditions
            </h1>
          </div>

          {/* ✅ UPDATED SUBHEADING */}
          <p className="text-slate-600 text-sm ml-12 mb-4">
            7 common skin lesion types with descriptions and images
          </p>

          <div className="ml-12 flex flex-wrap gap-2">
            {DISEASES.map((d) => (
              <a
                key={d.code}
                href={`#${d.key}`}
                className={`px-3 py-1 text-xs font-semibold rounded-full border ${d.riskColor} hover:opacity-80 transition-opacity`}
              >
                {d.code}
              </a>
            ))}
          </div>
        </motion.div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {DISEASES.map((disease, i) => (
            <motion.div
              key={disease.code}
              id={disease.key}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col group card-hover"
            >
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img
                  src={disease.imageUrl}
                  alt={disease.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />

                <div className="absolute top-3 left-3">
                  <span className="font-mono text-xs text-white/90 font-bold bg-black/30 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    {disease.code}
                  </span>
                </div>

                <div className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-0.5 rounded-full border ${disease.riskColor}`}>
                  {disease.risk}
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-slate-800 mb-0.5">
                    {disease.name}
                  </h3>
                  <p className="text-xs text-slate-400 italic">
                    {disease.scientific}
                  </p>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed mb-4 flex-1">
                  {disease.desc}
                </p>

                <div className="space-y-1.5 pt-3 border-t border-slate-50">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Key Features
                  </p>

                  {disease.features.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${disease.barColor}`} />
                      <span className="text-xs text-slate-600">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FOOTNOTE */}
        {/* FOOTNOTE */}
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{ once: true }}
  className="mt-8 p-4 bg-yellow-50 rounded-xl border border-yellow-200 shadow-sm flex items-start gap-3 text-sm text-yellow-800 font-medium"
>
  <span className="text-yellow-700 mt-0.5 text-base font-bold">*</span>
  <p>
    Reference images are for educational purposes only and do not replace professional medical diagnosis.
  </p>
</motion.div>

      </div>
    </div>
  );
}
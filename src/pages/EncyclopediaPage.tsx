import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.45, ease: 'easeOut' } }),
};

const DISEASES = [
  { code: 'MEL',   key: 'mel',   name: 'Melanoma',             scientific: 'Malignant melanocytic neoplasm',           risk: 'Critical', riskColor: 'text-red-700 bg-red-50 border-red-200',         barColor: 'bg-red-500',    desc: 'The most dangerous form of skin cancer, arising from melanocytes. Characterized by asymmetry, irregular border, color variation, and diameter >6mm. Early detection is critical — 5-year survival drops from 98% to 15% with metastasis.',              features: ['Asymmetric, irregular border', 'Multiple colors (tan, brown, black, red)', 'Diameter >6mm', 'Rapidly evolving'],       imageUrl: 'https://images.pexels.com/photos/5853941/pexels-photo-5853941.jpeg?auto=compress&cs=tinysrgb&w=500' },
  { code: 'NV',    key: 'nv',    name: 'Melanocytic Nevus',    scientific: 'Common mole (benign melanocytic nevus)',    risk: 'Low',      riskColor: 'text-emerald-700 bg-emerald-50 border-emerald-200', barColor: 'bg-emerald-500', desc: 'A benign proliferation of melanocytes — the most common pigmented lesion in adults. Most nevi are stable, symmetric, and uniformly pigmented. Atypical nevi require surveillance for melanoma transformation.',                                          features: ['Symmetric, round/oval', 'Uniform tan or brown', 'Sharp, well-defined border', 'Stable over time'],              imageUrl: 'https://images.pexels.com/photos/5853933/pexels-photo-5853933.jpeg?auto=compress&cs=tinysrgb&w=500' },
  { code: 'BCC',   key: 'bcc',   name: 'Basal Cell Carcinoma', scientific: 'Basal cell carcinoma (BCC)',                risk: 'High',     riskColor: 'text-orange-700 bg-orange-50 border-orange-200', barColor: 'bg-orange-500', desc: 'The most common malignant skin tumor, arising from basal keratinocytes. Rarely metastasizes but causes significant local tissue destruction. Presents as a pearly papule, ulcer, or plaque in UV-exposed areas.',                                   features: ['Pearly/translucent papule', 'Rolled telangiectatic border', 'Central ulceration', 'UV-exposed sites'],          imageUrl: 'https://images.pexels.com/photos/5853932/pexels-photo-5853932.jpeg?auto=compress&cs=tinysrgb&w=500' },
  { code: 'AKIEC', key: 'akiec', name: 'Actinic Keratosis',    scientific: 'Actinic keratosis / Intraepithelial carcinoma', risk: 'Moderate', riskColor: 'text-amber-700 bg-amber-50 border-amber-200', barColor: 'bg-amber-500',  desc: 'A precancerous epidermal lesion caused by chronic UV exposure. AK carries ~10% lifetime risk of progression to invasive squamous cell carcinoma. Early treatment is highly effective with field therapies.',                                         features: ['Rough, scaly patch', 'Erythematous base', 'UV-exposed regions', 'Precancerous potential'],                       imageUrl: 'https://images.pexels.com/photos/5853934/pexels-photo-5853934.jpeg?auto=compress&cs=tinysrgb&w=500' },
  { code: 'BKL',   key: 'bkl',   name: 'Benign Keratosis',     scientific: 'Seborrheic keratosis / Solar lentigo',     risk: 'Low',      riskColor: 'text-blue-700 bg-blue-50 border-blue-200',       barColor: 'bg-blue-500',   desc: 'A benign epidermal proliferation including seborrheic keratosis and solar lentigo. Very common in older adults. Appears "stuck on" with a waxy, keratotic surface. No malignant potential.',                                                     features: ['Waxy, "stuck-on" appearance', 'Well-defined borders', 'Variable pigmentation', 'No treatment required'],        imageUrl: 'https://images.pexels.com/photos/5853938/pexels-photo-5853938.jpeg?auto=compress&cs=tinysrgb&w=500' },
  { code: 'DF',    key: 'df',    name: 'Dermatofibroma',       scientific: 'Dermatofibroma (fibrous histiocytoma)',     risk: 'Low',      riskColor: 'text-slate-700 bg-slate-50 border-slate-200', barColor: 'bg-slate-500', desc: 'A common benign fibrohistiocytic skin nodule, typically found on the legs. Pathognomonic "dimple sign" upon lateral pinching. Often develops after minor trauma. Composed of interlacing fibroblast bundles.',                                    features: ['Firm, dermal nodule', 'Central dimple sign', 'Lower extremities', 'Brown surface pigmentation'],                 imageUrl: 'https://images.pexels.com/photos/5853939/pexels-photo-5853939.jpeg?auto=compress&cs=tinysrgb&w=500' },
  { code: 'VASC',  key: 'vasc',  name: 'Vascular Lesion',      scientific: 'Vascular lesions (angioma/hemangioma)',    risk: 'Low',      riskColor: 'text-pink-700 bg-pink-50 border-pink-200',       barColor: 'bg-pink-500',   desc: 'A heterogeneous group of benign vascular proliferations including cherry angiomas, angiokeratomas, and pyogenic granulomas. Characterized by their red/purple hue due to dermal blood vessel proliferation.',                                  features: ['Bright red/purple color', 'Well-demarcated border', 'Blanches with pressure', 'Benign vascular histology'],      imageUrl: 'https://images.pexels.com/photos/5853942/pexels-photo-5853942.jpeg?auto=compress&cs=tinysrgb&w=500' },
];

export default function EncyclopediaPage() {
  return (
    <div className="min-h-screen py-10 px-4 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center shadow-sm"><BookOpen size={18} className="text-white" /></div>
            <h1 className="text-2xl font-bold text-slate-800">Disease Encyclopedia</h1>
          </div>
          <p className="text-slate-500 text-sm ml-12 mb-4">7 HAM10000 lesion classes — clinical descriptions and visual reference</p>
          <div className="ml-12 flex flex-wrap gap-2">
            {DISEASES.map((d) => (
              <a key={d.code} href={`#${d.key}`} className={`px-3 py-1 text-xs font-semibold rounded-full border ${d.riskColor} hover:opacity-80 transition-opacity`}>{d.code}</a>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {DISEASES.map((disease, i) => (
            <motion.div key={disease.code} id={disease.key} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col group card-hover"
            >
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img src={disease.imageUrl} alt={disease.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/5853941/pexels-photo-5853941.jpeg?auto=compress&cs=tinysrgb&w=500'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="absolute top-3 left-3"><span className="font-mono text-xs text-white/90 font-bold bg-black/30 px-2 py-0.5 rounded-md backdrop-blur-sm">{disease.code}</span></div>
                <div className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-0.5 rounded-full border ${disease.riskColor}`}>{disease.risk}</div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-slate-800 mb-0.5">{disease.name}</h3>
                  <p className="text-xs text-slate-400 italic">{disease.scientific}</p>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4 flex-1">{disease.desc}</p>
                <div className="space-y-1.5 pt-3 border-t border-slate-50">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Key Features</p>
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

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-8 p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex items-start gap-3 text-xs text-slate-400">
          <span className="text-teal-600 mt-0.5">*</span>
          <p>Clinical descriptions based on HAM10000 dataset annotations (Tschandl et al., 2018). Reference images shown are illustrative only and do not substitute clinical diagnosis by a qualified dermatologist.</p>
        </motion.div>
      </div>
    </div>
  );
}

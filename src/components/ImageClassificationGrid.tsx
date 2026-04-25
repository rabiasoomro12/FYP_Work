import { useState } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, TrendingUp } from 'lucide-react';

export interface ClassificationImage {
  src: string;
  label: string;
  sublabel?: string;
  confidence?: number;
  classification?: string;
  accentColor?: string;
  tag?: string;
}

interface ImageClassificationGridProps {
  images: ClassificationImage[];
  probabilities?: { label: string; name: string; value: number; color: string }[];
  topClass?: string;
  columns?: 2 | 3 | 4;
}

// Single uniformly-framed image card
function ImageCard({ img, index }: { img: ClassificationImage; index: number }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const accent = img.accentColor ?? '#0d9488';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.10)' }}
      className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm"
      aria-label={`${img.label}${img.classification ? `, classified as ${img.classification}` : ''}`}
    >
      {/* Uniform 1:1 image frame */}
      <div className="relative w-full aspect-square bg-slate-100 overflow-hidden">
        {/* Skeleton while loading */}
        {!loaded && !errored && (
          <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center">
            <ImageIcon size={28} className="text-slate-300" />
          </div>
        )}

        {/* Error state */}
        {errored && (
          <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center gap-2">
            <ImageIcon size={28} className="text-slate-300" />
            <p className="text-xs text-slate-400">Failed to load</p>
          </div>
        )}

        <img
          src={img.src}
          alt={img.label}
          onLoad={() => setLoaded(true)}
          onError={() => { setErrored(true); setLoaded(true); }}
          className={`w-full h-full object-cover transition-opacity duration-300 ${loaded && !errored ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Confidence badge overlaid top-right */}
        {img.confidence != null && (
          <div
            className="absolute top-2 right-2 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow"
            style={{ background: accent }}
          >
            {img.confidence.toFixed(1)}%
          </div>
        )}

        {/* Tag badge overlaid top-left */}
        {img.tag && (
          <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
            {img.tag}
          </div>
        )}
      </div>

      {/* Label row */}
      <div className="px-3 py-2.5 border-t border-slate-100">
        <p className="text-[13px] font-semibold text-slate-700 leading-tight truncate">{img.label}</p>
        {img.sublabel && (
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">{img.sublabel}</p>
        )}
        {img.classification && (
          <span
            className="inline-block mt-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${accent}18`, color: accent }}
          >
            {img.classification}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// Horizontal probability bar row
function ProbabilityRow({
  label, name, value, color, isTop, index,
}: {
  label: string; name: string; value: number; color: string; isTop: boolean; index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
      className={`py-2 ${index > 0 ? 'border-t border-slate-50' : ''}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={`text-sm ${isTop ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
          {label} — {name}
        </span>
        <span className={`text-sm font-bold tabular-nums ${isTop ? 'text-slate-800' : 'text-slate-500'}`}>
          {value.toFixed(2)}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 0.6, delay: 0.2 + index * 0.05, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </motion.div>
  );
}

// Grid column classes
const GRID_COLS: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
};

export default function ImageClassificationGrid({
  images,
  probabilities,
  topClass,
  columns = 2,
}: ImageClassificationGridProps) {
  if (!images.length) return null;

  return (
    <div className="space-y-5">
      {/* Image grid */}
      <div className={`grid ${GRID_COLS[columns]} gap-3`} role="list" aria-label="Classification image comparison">
        {images.map((img, i) => (
          <div key={i} role="listitem">
            <ImageCard img={img} index={i} />
          </div>
        ))}
      </div>

      {/* Class probability list */}
      {probabilities && probabilities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
            <TrendingUp size={13} className="text-teal-600" />
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Class Probabilities</p>
          </div>
          <div className="px-4 pb-1">
            {probabilities.map((p, i) => (
              <ProbabilityRow
                key={p.label}
                label={p.label}
                name={p.name}
                value={p.value}
                color={p.color}
                isTop={p.label.toLowerCase() === topClass?.toLowerCase()}
                index={i}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

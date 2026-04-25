import { useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Lock, AlertCircle, CheckCircle2, Loader2, Image as ImageIcon, RefreshCw, FlaskConical, TrendingUp, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useScan } from '../context/ScanContext';
import { supabase } from '../lib/supabase';
import { generatePatientReport } from '../utils/generatePatientReport';

interface Props { onAuthClick: () => void; onPrediction?: (cls: string) => void; }

const HF_BASE = 'https://rabia12345-dermai.hf.space';
const CLASSES = ['akiec', 'bcc', 'bkl', 'df', 'mel', 'nv', 'vasc'];

const CLASS_INFO: Record<string, { name: string; color: string; risk: string; riskBg: string }> = {
  akiec: { name: 'Actinic Keratosis',    color: '#0d9488', risk: 'Moderate', riskBg: 'text-amber-700  bg-amber-50  border-amber-200' },
  bcc:   { name: 'Basal Cell Carcinoma', color: '#f59e0b', risk: 'High',     riskBg: 'text-orange-700 bg-orange-50 border-orange-200' },
  bkl:   { name: 'Benign Keratosis',     color: '#3b82f6', risk: 'Low',      riskBg: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  df:    { name: 'Dermatofibroma',       color: '#64748b', risk: 'Low',      riskBg: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  mel:   { name: 'Melanoma',             color: '#ef4444', risk: 'Critical', riskBg: 'text-red-700    bg-red-50    border-red-200' },
  nv:    { name: 'Melanocytic Nevus',    color: '#10b981', risk: 'Low',      riskBg: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  vasc:  { name: 'Vascular Lesion',      color: '#ec4899', risk: 'Low',      riskBg: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
};

interface ModelPrediction { model: string; predicted_class: string; confidence: number; probabilities: Record<string, number>; gradcam_image?: string; }

// API returns keys like "mel - Melanoma" → extract abbreviation "mel"
function extractAbbrev(key: string): string {
  return key.split(' - ')[0].trim().toLowerCase();
}

function normalizeProbabilities(raw: unknown): Record<string, number> {
  if (Array.isArray(raw)) {
    return Object.fromEntries(CLASSES.map((cls, i) => [cls, typeof raw[i] === 'number' ? raw[i] : 0]));
  }
  if (raw && typeof raw === 'object') {
    const result: Record<string, number> = {};
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      result[extractAbbrev(k)] = typeof v === 'number' ? v : 0;
    }
    const maxVal = Math.max(...Object.values(result), 0);
    if (maxVal > 1) {
      for (const k of Object.keys(result)) result[k] /= 100;
    }
    return result;
  }
  return {};
}

async function callModel(file: File, modelName: string): Promise<ModelPrediction> {
  const form = new FormData();
  form.append('file', file);
  form.append('model', modelName);
  const res = await fetch(`${HF_BASE}/predict`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`Model ${modelName} failed: ${res.status}`);
  const data = await res.json();
  // predicted_class comes as "mel - Melanoma" → extract abbreviation
  const predicted_class = extractAbbrev(data.predicted_class ?? '');
  const probabilities = normalizeProbabilities(data.all_probabilities ?? data.probabilities);
  const rawConf = typeof data.confidence === 'number' ? data.confidence : 0;
  const confidence = rawConf > 1 ? rawConf / 100 : rawConf;
  return { model: modelName, predicted_class, confidence, probabilities, gradcam_image: data.gradcam_image };
}

async function ensemblePredict(file: File) {
  const models = ['efficientnet_b0', 'efficientnet_b3', 'mobilenet_v3', 'resnet50'];
  const results = await Promise.allSettled(models.map((m) => callModel(file, m)));
  const successful = results.filter((r): r is PromiseFulfilledResult<ModelPrediction> => r.status === 'fulfilled').map((r) => r.value);
  if (successful.length === 0) throw new Error('All models failed to respond.');
  const averaged: Record<string, number> = {};
  for (const cls of CLASSES) {
    const vals = successful.map((p) => p.probabilities?.[cls] ?? 0);
    averaged[cls] = vals.reduce((a, b) => a + b, 0) / vals.length;
  }
  const predictedClass = Object.entries(averaged).sort((a, b) => b[1] - a[1])[0][0];
  // Use Grad-CAM from first model that returned one
  const gradcamImage = successful.find((p) => p.gradcam_image)?.gradcam_image ?? null;
  return { predictions: successful, ensemble: { predictedClass, confidence: averaged[predictedClass], probabilities: averaged }, gradcamImage };
}

const MODEL_NAMES: Record<string, string> = {
  efficientnet_b0: 'EfficientNet-B0',
  efficientnet_b3: 'EfficientNet-B3',
  mobilenet_v3: 'MobileNetV3',
  resnet50: 'ResNet-50',
};

export default function ClassifierPage({ onAuthClick, onPrediction }: Props) {
  const { user } = useAuth();
  const { setScanResult, scanResult } = useScan();
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [gradcamUrl, setGradcamUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [modelPredictions, setModelPredictions] = useState<ModelPrediction[]>([]);
  const [analyzeStep, setAnalyzeStep] = useState('');
  const [apiError, setApiError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setScanResult(null);
    setModelPredictions([]);
    setApiError('');
    setGradcamUrl(null);
  }, [setScanResult]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0]; if (file) handleFile(file);
  }, [handleFile]);

  const analyze = async () => {
    if (!selectedFile || !previewUrl) return;
    setAnalyzing(true); setApiError('');
    setAnalyzeStep('Processing...');
    try {
      const { predictions, ensemble, gradcamImage } = await ensemblePredict(selectedFile);
      setModelPredictions(predictions);
      const result = {
        imageUrl: previewUrl,
        predictedClass: ensemble.predictedClass,
        confidence: ensemble.confidence,
        probabilities: ensemble.probabilities,
      };
      setScanResult(result);
      onPrediction?.(ensemble.predictedClass);
      if (gradcamImage) setGradcamUrl(gradcamImage);

      if (user && supabase) {
        await supabase.from('scan_history').insert({
          user_id: user.id,
          image_url: previewUrl,
          predicted_class: result.predictedClass,
          predicted_label: CLASS_INFO[result.predictedClass]?.name ?? result.predictedClass,
          confidence: result.confidence,
          probabilities: result.probabilities,
        });
      }
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Prediction failed');
    } finally {
      setAnalyzing(false);
      setAnalyzeStep('');
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setGradcamUrl(null);
    setScanResult(null);
    setModelPredictions([]);
    setApiError('');
  };

  const info = scanResult ? CLASS_INFO[scanResult.predictedClass] : null;

  const gridProbabilities = useMemo(() => {
    if (!scanResult) return [];
    return CLASSES.map((c) => ({
      label: c,
      name: CLASS_INFO[c]?.name ?? c,
      value: parseFloat((scanResult.probabilities[c] * 100).toFixed(2)),
      color: CLASS_INFO[c]?.color ?? '#94a3b8',
    })).sort((a, b) => b.value - a.value);
  }, [scanResult]);

  return (
    <div className="min-h-screen py-10 px-4 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center shadow-sm">
              <FlaskConical size={18} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Skin Lesion Classifier</h1>
          </div>
          <p className="text-slate-500 text-sm ml-12">Upload a dermoscopic image — ensemble of 4 deep learning models via HuggingFace API</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left column: upload + model votes */}
          <div className="lg:col-span-2 space-y-4">
            {!selectedFile ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-2xl border-2 border-dashed transition-all cursor-pointer shadow-sm ${dragOver ? 'border-teal-400 bg-teal-50/50' : 'border-slate-200 hover:border-teal-300 hover:bg-teal-50/30'}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
              >
                <div className="p-10 flex flex-col items-center gap-4 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                    <Upload size={24} className="text-teal-600" />
                  </div>
                  <div>
                    <p className="text-slate-700 font-semibold mb-1">Drop image here or click to browse</p>
                    <p className="text-xs text-slate-400">PNG, JPG, JPEG — Dermoscopic images recommended</p>
                  </div>
                  <span className="px-4 py-1.5 bg-teal-600 text-white text-sm font-medium rounded-full shadow-sm">Select Image</span>
                </div>
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                <div className="relative aspect-square bg-slate-100">
                  <img src={previewUrl!} alt="Selected dermoscopic image" className="w-full h-full object-cover" />
                  <button
                    onClick={reset}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-slate-600 hover:text-slate-900"
                    aria-label="Remove image"
                  >
                    <X size={14} />
                  </button>
                  {scanResult && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-3">
                      <p className="text-xs text-teal-300 font-mono mb-0.5">Analysis complete</p>
                      <div className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 via-green-400 via-yellow-400 to-red-500" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-slate-400 truncate mb-3">{selectedFile.name}</p>
                  {apiError && (
                    <div className="flex items-start gap-2 mb-3 p-2.5 bg-red-50 border border-red-100 rounded-lg">
                      <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-600">{apiError}</p>
                    </div>
                  )}
                  {!scanResult ? (
                    <button
                      onClick={analyze}
                      disabled={analyzing}
                      className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      {analyzing
                        ? <><Loader2 size={15} className="animate-spin" /><span className="truncate max-w-[200px]">{analyzeStep || 'Analyzing...'}</span></>
                        : <><ImageIcon size={15} />Run Analysis</>
                      }
                    </button>
                  ) : (
                    <button
                      onClick={reset}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={14} /> Analyze New Image
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Per-model votes */}
            {modelPredictions.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Individual Model Votes</p>
                <div className="space-y-2.5">
                  {modelPredictions.map((p) => {
                    const cls = CLASS_INFO[p.predicted_class];
                    return (
                      <div key={p.model} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cls?.color ?? '#94a3b8' }} />
                          <span className="text-xs font-medium text-slate-600">{MODEL_NAMES[p.model] ?? p.model}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">{cls?.name ?? p.predicted_class}</span>
                          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">{(p.confidence * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {!user && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800 mb-0.5">Guest Mode</p>
                    <p className="text-xs text-amber-700">Results are restricted. Sign in for full clinical reports and scan history.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right column: results */}
          <div className="lg:col-span-3 space-y-5">
            <AnimatePresence mode="wait">
              {!scanResult && !analyzing && !apiError && (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[300px] shadow-sm border border-slate-200"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                    <ImageIcon size={24} className="text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">Upload an image to begin analysis</p>
                  <p className="text-xs text-slate-400 mt-1">Results will appear here</p>
                </motion.div>
              )}

              {analyzing && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[300px] shadow-sm border border-slate-200"
                >
                  <div className="relative w-14 h-14 mb-5">
                    <div className="absolute inset-0 rounded-full border-2 border-teal-100" />
                    <div className="absolute inset-0 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
                    <div className="absolute inset-2 rounded-full bg-teal-50 flex items-center justify-center">
                      <FlaskConical size={16} className="text-teal-600" />
                    </div>
                  </div>
                  <p className="text-slate-700 font-semibold mb-1">Start Analysis</p>
                  <p className="text-xs text-slate-400 max-w-xs">{analyzeStep}</p>
                </motion.div>
              )}

              {scanResult && !analyzing && (
                <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  {!user ? (
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                      <div className="p-5 border-b border-slate-100 bg-emerald-50/60">
                        <div className="flex items-center gap-2 text-emerald-700 mb-0.5">
                          <CheckCircle2 size={16} />
                          <span className="font-semibold text-sm">Analysis Complete</span>
                        </div>
                        <p className="text-xs text-slate-500">Sign in to view the full clinical report.</p>
                      </div>
                      <div className="relative p-8">
                        <div className="blur-sm select-none pointer-events-none space-y-4">
                          <div className="flex justify-between">
                            <div className="h-6 w-40 bg-slate-100 rounded-lg" />
                            <div className="h-6 w-16 bg-slate-100 rounded-full" />
                          </div>
                          <div className="h-32 bg-slate-50 rounded-xl border border-slate-100" />
                          <div className="h-20 bg-slate-50 rounded-xl border border-slate-100" />
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
                          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                            <Lock size={22} className="text-teal-600" />
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-slate-800 mb-1">Full Clinical Report Locked</p>
                            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                              Sign up or log in to access the complete diagnosis, confidence scores, probability distribution, and Grad-CAM explainability.
                            </p>
                          </div>
                          <button
                            onClick={onAuthClick}
                            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                          >
                            Sign Up or Login for Full Report
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Diagnosis header */}
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1.5">Detected Condition</p>
                            <span className={`inline-flex items-center text-sm font-bold px-3 py-1 rounded-full border ${info?.riskBg}`}>
                              {scanResult.predictedClass} — {info?.name}
                            </span>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Confidence</p>
                            <div className="text-3xl font-bold text-slate-800">
                              {(scanResult.confidence * 100).toFixed(1)}<span className="text-lg text-slate-400">%</span>
                            </div>
                          </div>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${scanResult.confidence * 100}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ background: info?.color }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <FlaskConical size={12} className="text-teal-600" />
                            <p className="text-xs text-slate-400">Ensemble average across {modelPredictions.length} model{modelPredictions.length !== 1 ? 's' : ''}</p>
                          </div>
                          <button
                            onClick={async () => {
                              setGeneratingReport(true);
                              await generatePatientReport({
                                patientEmail: user!.email ?? '',
                                predictedClass: scanResult.predictedClass,
                                predictedLabel: info?.name ?? scanResult.predictedClass,
                                confidence: scanResult.confidence,
                                risk: info?.risk ?? 'Low',
                                riskColor: info?.color ?? '#10b981',
                                probabilities: scanResult.probabilities,
                                previewUrl,
                                gradcamUrl,
                                modelCount: modelPredictions.length || 4,
                              });
                              setGeneratingReport(false);
                            }}
                            disabled={generatingReport}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                          >
                            {generatingReport
                              ? <><Loader2 size={12} className="animate-spin" />Generating…</>
                              : <><Download size={12} />Download Report</>}
                          </button>
                        </div>
                      </div>

                      {/* Image comparison: Original vs Grad-CAM */}
                      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2 mb-4">
                          <ImageIcon size={13} className="text-teal-600" />
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Image Comparison</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {/* Original */}
                          <div className="rounded-xl overflow-hidden border border-slate-200">
                            <div className="relative aspect-square bg-slate-100">
                              <img src={previewUrl!} alt="Original dermoscopic image" className="w-full h-full object-cover" />
                              <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
                                ORIGINAL
                              </div>
                            </div>
                            <div className="px-3 py-2 border-t border-slate-100 bg-white">
                              <p className="text-xs font-semibold text-slate-700">Original Image</p>
                              <p className="text-[11px] text-slate-400 truncate">{selectedFile?.name}</p>
                            </div>
                          </div>

                          {/* Grad-CAM */}
                          <div className="rounded-xl overflow-hidden border border-slate-200">
                            <div className="relative aspect-square bg-slate-100">
                              {gradcamUrl ? (
                                <>
                                  <img src={gradcamUrl} alt="Grad-CAM heatmap" className="w-full h-full object-cover" />
                                  <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
                                    GRAD-CAM
                                  </div>
                                  <div
                                    className="absolute top-2 right-2 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow"
                                    style={{ background: info?.color }}
                                  >
                                    {(scanResult.confidence * 100).toFixed(1)}%
                                  </div>
                                </>
                              ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center p-4">
                                  <ImageIcon size={24} className="text-slate-300" />
                                  <p className="text-xs text-slate-400 leading-relaxed">Grad-CAM unavailable</p>
                                </div>
                              )}
                            </div>
                            <div className="px-3 py-2 border-t border-slate-100 bg-white">
                              <p className="text-xs font-semibold text-slate-700">Grad-CAM Heatmap</p>
                              <p className="text-[11px] text-slate-400">EfficientNet-B0 · {info?.name ?? scanResult.predictedClass}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Probability Distribution */}
                      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2 mb-4">
                          <TrendingUp size={13} className="text-teal-600" />
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Probability Distribution</p>
                        </div>
                        <div className="space-y-0">
                          {gridProbabilities.map((p, i) => (
                            <div key={p.label} className={`py-2 ${i > 0 ? 'border-t border-slate-50' : ''}`}>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className={`text-sm ${p.label === scanResult.predictedClass ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
                                  <span className="font-mono text-[11px] mr-1.5 text-slate-400">{p.label}</span>{p.name}
                                </span>
                                <span className={`text-sm font-bold tabular-nums ${p.label === scanResult.predictedClass ? 'text-slate-800' : 'text-slate-400'}`}>
                                  {p.value.toFixed(2)}%
                                </span>
                              </div>
                              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(p.value, 100)}%` }}
                                  transition={{ duration: 0.6, delay: 0.1 + i * 0.06, ease: 'easeOut' }}
                                  className="h-full rounded-full"
                                  style={{ background: p.color }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Activity, Bot, Sparkles } from 'lucide-react';
import { useScan } from '../context/ScanContext';

const HF_BASE = 'https://rabia12345-dermai.hf.space';

interface Message { role: 'user' | 'assistant'; content: string; }

const CLASS_CONTEXT: Record<string, string> = {
  mel:   'Melanoma — a critical malignant melanocytic neoplasm. High risk. Early detection is essential.',
  nv:    'Melanocytic Nevus — a common benign mole. Low risk. Monitor for ABCDE changes.',
  bcc:   'Basal Cell Carcinoma — the most common skin cancer. High risk. Locally invasive.',
  akiec: 'Actinic Keratosis — UV-induced precancerous lesion. Moderate risk. ~10% SCC progression.',
  bkl:   'Benign Keratosis — seborrheic keratosis / solar lentigo. Low risk. No malignant potential.',
  df:    'Dermatofibroma — benign fibrohistiocytic nodule. Low risk. Dimple sign on pinching.',
  vasc:  'Vascular Lesion — cherry angioma/angiokeratoma. Low risk. Benign vascular proliferation.',
};

export default function Chatbot() {
  const { scanResult } = useScan();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const focusMode = !!scanResult?.predictedClass;

  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  useEffect(() => {
    if (focusMode && scanResult) {
      const clsInfo = CLASS_CONTEXT[scanResult.predictedClass] ?? scanResult.predictedClass.toUpperCase();
      setMessages([{
        role: 'assistant',
        content: `**Focus Mode activated.**\n\nDetected: **${clsInfo}** (${(scanResult.confidence * 100).toFixed(1)}% ensemble confidence)\n\nI'm now focused on this condition. Ask me about symptoms, risk factors, precautions, or next steps.`,
      }]);
    }
  }, [scanResult?.predictedClass]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const context = focusMode && scanResult
        ? `FOCUS MODE: The AI detected ${scanResult.predictedClass.toUpperCase()} with ${(scanResult.confidence * 100).toFixed(1)}% confidence. ${CLASS_CONTEXT[scanResult.predictedClass] ?? ''} Answer exclusively about this condition.`
        : 'You are the DermAI Clinical Assistant for a skin disease classification system built at Sukkur IBA University using EfficientNet-B0 on HAM10000. Answer general dermatology and project-related questions.';

      const res = await fetch(`${HF_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg].map(({ role, content }) => ({ role, content })), system: context }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      const content: string = data.response ?? data.content ?? data.message ?? data.text ?? (typeof data === 'string' ? data : 'Sorry, I could not generate a response.');
      setMessages((prev) => [...prev, { role: 'assistant', content }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error connecting to chat API: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
  const renderText = (t: string) => t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${open ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${focusMode ? 'bg-teal-500' : 'bg-teal-600'}`}
      >
        <MessageCircle size={22} className="text-white" />
        {focusMode && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-400 border-2 border-white animate-pulse" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-[375px] max-w-[calc(100vw-2rem)] h-[530px] flex flex-col rounded-2xl shadow-2xl overflow-hidden bg-white border border-slate-200"
          >
            <div className={`flex items-center justify-between px-4 py-3 border-b border-slate-100 ${focusMode ? 'bg-teal-50' : 'bg-white'}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center shadow-sm">
                  <Activity size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">DermAI Clinical Assistant</p>
                  <div className="flex items-center gap-1">
                    {focusMode ? (
                      <><span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" /><p className="text-[10px] font-semibold text-teal-600">Focus Mode — {scanResult?.predictedClass?.toUpperCase()}</p></>
                    ) : (
                      <><Sparkles size={9} className="text-slate-400" /><p className="text-[10px] text-slate-400">General Mode · HuggingFace API</p></>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide bg-slate-50/40">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                    <Bot size={22} className="text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-0.5">DermAI Clinical Assistant</p>
                    <p className="text-xs text-slate-400 max-w-[220px] leading-relaxed">Ask me about skin conditions, how the AI works, or anything dermatology-related.</p>
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-lg bg-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <Activity size={11} className="text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user' ? 'bg-teal-600 text-white rounded-br-md shadow-sm' : 'bg-white text-slate-700 rounded-bl-md shadow-sm border border-slate-100'
                    }`}
                    dangerouslySetInnerHTML={{ __html: renderText(msg.content) }}
                  />
                </div>
              ))}
              {loading && (
                <div className="flex gap-2 justify-start">
                  <div className="w-6 h-6 rounded-lg bg-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Activity size={11} className="text-white" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5 items-center shadow-sm border border-slate-100">
                    {[0, 1, 2].map((d) => (
                      <motion.span key={d} className="w-1.5 h-1.5 rounded-full bg-teal-400"
                        animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, delay: d * 0.15, repeat: Infinity }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="p-3 border-t border-slate-100 bg-white">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-teal-400 transition-colors">
                <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey}
                  placeholder={focusMode ? `Ask about ${scanResult?.predictedClass}...` : 'Ask DermAI anything...'}
                  className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
                <button onClick={send} disabled={!input.trim() || loading}
                  className="w-7 h-7 rounded-lg bg-teal-600 disabled:opacity-40 flex items-center justify-center hover:bg-teal-700 transition-colors flex-shrink-0 shadow-sm"
                >
                  {loading ? <Loader2 size={13} className="animate-spin text-white" /> : <Send size={13} className="text-white" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

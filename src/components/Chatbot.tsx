import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { ChatMessage } from '../types';

const KNOWLEDGE: Record<string, string> = {
  melanoma: 'Melanoma (mel) is the most dangerous type of skin cancer. It develops from melanocytes and can spread to other organs. Early detection is critical — look for asymmetry, irregular borders, multiple colors, diameter >6mm, and evolving changes (the ABCDEs).',
  mel: 'Melanoma (mel) is the most dangerous type of skin cancer. It develops from melanocytes and can spread to other organs. Early detection is critical — look for asymmetry, irregular borders, multiple colors, diameter >6mm, and evolving changes (the ABCDEs).',
  bcc: 'Basal Cell Carcinoma (bcc) is the most common skin cancer. It rarely spreads but can cause local tissue damage if untreated. Appears as a pearly bump, flat scar-like lesion, or bleeding sore. Highly treatable when caught early.',
  'basal cell': 'Basal Cell Carcinoma (bcc) is the most common skin cancer. It rarely spreads but can cause local tissue damage if untreated. Appears as a pearly bump, flat scar-like lesion, or bleeding sore. Highly treatable when caught early.',
  akiec: 'Actinic Keratosis (akiec) is a pre-cancerous rough, scaly patch caused by years of sun exposure. It can progress to squamous cell carcinoma if left untreated. Treatment includes cryotherapy, topical creams, or photodynamic therapy.',
  'actinic': 'Actinic Keratosis (akiec) is a pre-cancerous rough, scaly patch caused by years of sun exposure. It can progress to squamous cell carcinoma if left untreated. Treatment includes cryotherapy, topical creams, or photodynamic therapy.',
  bkl: 'Benign Keratosis (bkl) includes seborrheic keratoses — harmless, waxy, wart-like growths that appear with age. They are not cancerous and do not require treatment unless they are bothersome.',
  'benign keratosis': 'Benign Keratosis (bkl) includes seborrheic keratoses — harmless, waxy, wart-like growths that appear with age. They are not cancerous and do not require treatment unless they are bothersome.',
  df: 'Dermatofibroma (df) is a benign skin growth that appears as a small, firm bump, usually on the legs. It is harmless and typically does not require treatment unless it causes discomfort.',
  dermatofibroma: 'Dermatofibroma (df) is a benign skin growth that appears as a small, firm bump, usually on the legs. It is harmless and typically does not require treatment unless it causes discomfort.',
  nv: 'Melanocytic Nevus (nv) is a common mole — a benign cluster of pigmented cells. Most are harmless, but monitor for changes in size, shape, or color. Use the ABCDE rule; consult a dermatologist if you notice changes.',
  mole: 'Melanocytic Nevus (nv) is a common mole — a benign cluster of pigmented cells. Most are harmless, but monitor for changes in size, shape, or color. Use the ABCDE rule; consult a dermatologist if you notice changes.',
  nevus: 'Melanocytic Nevus (nv) is a common mole — a benign cluster of pigmented cells. Most are harmless, but monitor for changes in size, shape, or color. Use the ABCDE rule; consult a dermatologist if you notice changes.',
  vasc: 'Vascular Lesion (vasc) includes benign blood vessel abnormalities like hemangiomas and angiomas. Most are harmless. Hemangiomas in infants usually shrink over time.',
  vascular: 'Vascular Lesion (vasc) includes benign blood vessel abnormalities like hemangiomas and angiomas. Most are harmless. Hemangiomas in infants usually shrink over time.',
  treatment: 'Treatment depends on the specific condition. Benign lesions (nv, df, bkl, vasc) typically need no treatment. Actinic keratosis (akiec) can be treated with cryotherapy or topical creams. Skin cancers (mel, bcc) require surgical removal, and sometimes radiation or immunotherapy.',
  prevention: 'Skin cancer prevention tips: (1) Apply broad-spectrum SPF 30+ sunscreen daily, (2) Avoid tanning beds, (3) Wear protective clothing and hats, (4) Seek shade between 10am–4pm, (5) Perform monthly self-skin checks, (6) Get annual dermatologist exams.',
  sunscreen: 'Use a broad-spectrum sunscreen with SPF 30 or higher. Apply 15 minutes before sun exposure and reapply every 2 hours, or after swimming or sweating. Sunscreen is one of the best defenses against skin cancer.',
  symptoms: 'Common warning signs include: a sore that does not heal, a spot that bleeds or itches, a mole that changes in size/shape/color, a new growth, or a lesion with irregular borders. Use the ABCDE rule for moles: Asymmetry, Border, Color, Diameter, Evolving.',
  abcde: 'The ABCDE rule for evaluating moles: A = Asymmetry (one half doesn\'t match), B = Border (irregular, ragged edges), C = Color (multiple shades of brown, black, red), D = Diameter (larger than 6mm / pencil eraser), E = Evolving (changing over time). If any apply, see a dermatologist.',
  risk: 'Risk factors for skin cancer include: fair skin, history of sunburns, excessive sun/UV exposure, family history of skin cancer, many moles, weakened immune system, and exposure to radiation or certain chemicals.',
  doctor: 'You should see a dermatologist if you notice: a new or changing spot, a sore that does not heal, an unusual mole, or anything that concerns you. Early detection significantly improves outcomes for skin cancer.',
  confidence: 'The confidence percentage shown in DermAI represents how certain the AI ensemble is about its prediction. A higher confidence means the models agree more strongly. Always consult a doctor — AI is a screening tool, not a diagnosis.',
  gradcam: 'The Grad-CAM (Gradient-weighted Class Activation Mapping) image highlights the areas of your skin lesion that the AI model focused on when making its prediction. Brighter/redder areas indicate higher importance to the decision.',
  ham10000: 'DermAI was trained on the HAM10000 dataset — a collection of 10,015 dermatoscopic images covering 7 skin lesion categories. This dataset is widely used in dermatology AI research.',
  model: 'DermAI uses an ensemble of 4 deep learning models: EfficientNet-B0, EfficientNet-B3, MobileNetV3, and ResNet-50. Each model votes on the diagnosis, and results are averaged for more reliable predictions.',
  accuracy: 'The ensemble approach combines multiple models to improve accuracy and reduce individual model errors. The system was trained and validated on the HAM10000 dermatoscopy dataset.',
};

function getLocalResponse(message: string, context?: string): string {
  const lower = message.toLowerCase();

  if (/(hello|hi|hey|greet)/i.test(lower)) {
    return context
      ? `Hi! I can help you understand more about **${context}** or answer general skin disease questions. What would you like to know?`
      : 'Hello! I\'m the DermAI Assistant. I can answer questions about skin conditions, symptoms, prevention, and how DermAI works. What would you like to know?';
  }

  if (/(thank|thanks|great|awesome|perfect)/i.test(lower)) {
    return 'You\'re welcome! Remember, DermAI is a screening tool — always consult a licensed dermatologist for a proper diagnosis. Is there anything else I can help with?';
  }

  if (/(what is|tell me about|explain|describe|info about)\s+(dermai|this app|how it works)/i.test(lower)) {
    return 'DermAI is an AI-powered skin disease classifier that uses an ensemble of 4 deep learning models (EfficientNet-B0, B3, MobileNetV3, ResNet-50) trained on the HAM10000 dataset to classify 7 types of skin lesions. It also provides Grad-CAM visualizations and downloadable reports.';
  }

  for (const [keyword, response] of Object.entries(KNOWLEDGE)) {
    if (lower.includes(keyword)) return response;
  }

  if (context) {
    const contextResponse = KNOWLEDGE[context.toLowerCase()];
    if (contextResponse) {
      return `Based on your scan result (${context}): ${contextResponse}\n\nFor specific medical advice, please consult a qualified dermatologist.`;
    }
    return `You were diagnosed with **${context}**. I don't have detailed information on that specific variant right now, but I recommend consulting a dermatologist for a professional evaluation. Is there something specific you'd like to know?`;
  }

  return 'I can help with questions about skin conditions (melanoma, BCC, actinic keratosis, moles, etc.), prevention tips, Grad-CAM explanations, and how DermAI works. Could you rephrase your question or ask about a specific condition?';
}

interface ChatWidgetProps {
  predictedClass?: string;
}

export default function ChatWidget({ predictedClass }: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      text: 'Hello! I am DermAI Assistant. Ask me anything about skin diseases or upload an image to get started!',
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (predictedClass) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: `I can see your image was analyzed and detected as "${predictedClass}". Feel free to ask me anything about this condition!`,
        },
      ]);
    }
  }, [predictedClass]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setSending(true);

    await new Promise((r) => setTimeout(r, 400));

    const reply = getLocalResponse(text, predictedClass);
    setMessages((prev) => [...prev, { role: 'ai', text: reply }]);
    setSending(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '24px',
            width: '360px',
            height: '500px',
            background: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9999,
            border: '1px solid #e2e8f0',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: '#0f172a',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                background: 'rgba(13,148,136,0.2)',
                borderRadius: '10px',
                padding: '6px',
                display: 'flex',
              }}
            >
              <Bot size={18} color="#0d9488" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: 'white', fontWeight: 600, fontSize: '14px', margin: 0 }}>
                DermAI Assistant
              </p>
              <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>
                {predictedClass
                  ? `Discussing: ${predictedClass}`
                  : 'Ask about any skin condition'}
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '8px',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
              }}
            >
              <X size={16} color="white" />
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: '#f8fafc',
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '8px',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: msg.role === 'user' ? '#0d9488' : '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {msg.role === 'user' ? (
                    <User size={13} color="white" />
                  ) : (
                    <Bot size={13} color="#0d9488" />
                  )}
                </div>
                <div
                  style={{
                    maxWidth: '75%',
                    padding: '10px 14px',
                    borderRadius:
                      msg.role === 'user'
                        ? '18px 18px 4px 18px'
                        : '18px 18px 18px 4px',
                    background: msg.role === 'user' ? '#0d9488' : 'white',
                    color: msg.role === 'user' ? 'white' : '#1e293b',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    border: msg.role === 'ai' ? '1px solid #e2e8f0' : 'none',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {sending && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Bot size={13} color="#0d9488" />
                </div>
                <div
                  style={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '18px 18px 18px 4px',
                    padding: '12px 16px',
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center',
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: '#94a3b8',
                        animation: 'bounce 1s infinite',
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '8px',
              background: 'white',
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about skin conditions..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '13px',
                outline: 'none',
                background: '#f8fafc',
                color: '#1e293b',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              style={{
                background: input.trim() && !sending ? '#0d9488' : '#e2e8f0',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 14px',
                cursor: input.trim() && !sending ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
              }}
            >
              <Send size={16} color={input.trim() && !sending ? 'white' : '#94a3b8'} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: '#0d9488',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 25px rgba(13,148,136,0.4)',
          zIndex: 10000,
          transition: 'transform 0.2s',
        }}
      >
        {open ? <X size={24} color="white" /> : <MessageCircle size={24} color="white" />}
        {!open && (
          <span
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'rgba(13,148,136,0.3)',
              animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
            }}
          />
        )}
      </button>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </>
  );
}

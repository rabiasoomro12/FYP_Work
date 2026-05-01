import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();

  const handleNavClick = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center shadow-sm">
                <Activity size={14} className="text-white" />
              </div>
              <span className="font-bold text-slate-800">Derm<span className="text-teal-600">AI</span></span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Deep Learning-based skin disease classification. Final Year Project — Sukkur IBA University, Dept. of Computer Systems Engineering.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Navigation</h4>
            <div className="flex flex-col gap-2">
              {[['/', 'Home'], ['/classifier', 'Classifier'], ['/encyclopedia', 'Encyclopedia'], ['/models', 'Model Comparison'], ['/methodology', 'Methodology'], ['/about', 'About']].map(([to, label]) => (
                <a
                  key={to}
                  href={to}
                  onClick={handleNavClick(to)}
                  className="text-sm text-slate-500 hover:text-teal-600 transition-colors cursor-pointer"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Team</h4>
            <div className="flex flex-col gap-1.5 text-sm text-slate-500">
              <span>Rabia Soomro</span>
              <span>Nimerta Wadhwani</span>
              <span>Waqar Abbas Khan</span>
              <div className="pt-2 mt-1 border-t border-slate-100">
                <span className="text-xs text-slate-400">Supervised by Dr. Abdul Sattar Chan</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">© 2025 DermAI · Sukkur IBA University · Department of Computer Systems Engineering</p>
          <p className="text-xs text-slate-400">HAM10000 · 89.76% Accuracy · EfficientNet-B0</p>
        </div>
      </div>
    </footer>
  );
}

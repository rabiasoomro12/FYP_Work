import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Brand & Mission */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-teal-400 flex items-center justify-center shadow-lg shadow-teal-900/20">
                <Activity size={16} className="text-white" />
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">
                Derm<span className="text-teal-400">AI</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Advanced deep learning-based skin disease classification. A Final Year Project developed at Sukkur IBA University, Department of Computer Systems Engineering.
            </p>
          </div>

          {/* Navigation — matched to navbar */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-[0.15em] mb-6">Navigation</h4>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              {[
                ['/', 'Home'],
                ['/classifier', 'Smart Scan'],
                ['/encyclopedia', 'Disease Library'],
                ['/models', 'Models'],
                ['/methodology', 'How it Works'],
                ['/about', 'About'],
              ].map(([to, label]) => (
                <Link key={to} to={to} className="text-sm text-slate-300 hover:text-teal-400 transition-colors font-semibold">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Team */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-[0.15em] mb-6">Project Team</h4>
            <div className="flex flex-col gap-2 text-sm text-slate-300 font-bold">
              <span>Rabia Soomro</span>
              <span>Nimerta Wadhwani</span>
              <span>Waqar Abbas Khan</span>

              <div className="pt-4 mt-2 border-t border-slate-800 space-y-3">
                <div className="flex flex-col">
                  <span className="text-[11px] text-white uppercase font-black tracking-wider">Academic Supervisor</span>
                  <span className="text-teal-400 text-sm">Dr. Abdul Sattar Chan</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-white uppercase font-black tracking-wider">Industrial Supervisor</span>
                  <span className="text-teal-400 text-sm">Engr. Kashif Mujeeb</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar — centered, no tags */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex justify-center">
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider text-center">
            © 2025 DermAI · Sukkur IBA University · Department of Computer Systems Engineering
          </p>
        </div>
      </div>
    </footer>
  );
}
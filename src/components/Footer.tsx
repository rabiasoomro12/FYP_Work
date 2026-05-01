import { Link } from 'react-router-dom';

// IMPORT THE LOGO ASSET WITH CORRECT CASING
import logoImg from '../assets/dermai.png';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Brand & Mission */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              {/* LOGO CONTAINER: Set background to white, rounded-xl, and shadow. overflow-hidden handles the crop. */}
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-700/50 flex items-center justify-center shadow-xl shadow-teal-900/10 overflow-hidden p-0.5">
                {/* THE IMAGE: scale-[2.5] focuses the center and removes empty sides. object-contain keeps the aspect ratio true. transform-gpu uses the graphics processor for smoother scaling. */}
                <img 
                  src={logoImg} 
                  alt="DermAI Logo" 
                  className="w-full h-full object-contain scale-[2.5] transform-gpu" 
                />
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
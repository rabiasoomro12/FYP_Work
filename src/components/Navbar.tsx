import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Menu, X, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/classifier', label: 'Classifier' },
  { to: '/encyclopedia', label: 'Encyclopedia' },
  { to: '/models', label: 'Models' },
  { to: '/methodology', label: 'Methodology' },
  { to: '/about', label: 'About' },
];

interface NavbarProps { onAuthClick: () => void; }

export default function Navbar({ onAuthClick }: NavbarProps) {
  const { user, role, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center shadow-sm">
              <Activity className="text-white" size={17} />
            </div>
            <span className="font-bold text-slate-800 tracking-tight text-lg">
              Derm<span className="text-teal-600">AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => {
              const active = location.pathname === to;
              return (
                <Link key={to} to={to}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    active ? 'text-teal-700 bg-teal-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {role === 'doctor' && (
                  <Link to="/admin" className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                    <ShieldCheck size={13} /> Admin
                  </Link>
                )}
                <div className="flex items-center gap-1.5 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg">
                  <User size={14} />
                  <span className="font-medium">{user.email?.split('@')[0]}</span>
                </div>
                <button onClick={() => signOut()}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors px-2 py-1.5"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <button onClick={onAuthClick}
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
              >
                Sign In
              </button>
            )}
          </div>

          <button className="md:hidden text-slate-500 hover:text-slate-800 p-1" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 bg-white"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === to ? 'text-teal-700 bg-teal-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </Link>
              ))}
              <div className="pt-2 border-t border-slate-100 mt-1">
                {user ? (
                  <button onClick={() => { signOut(); setMobileOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-slate-500">
                    Logout ({user.email?.split('@')[0]})
                  </button>
                ) : (
                  <button onClick={() => { onAuthClick(); setMobileOpen(false); }} className="w-full px-3 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg">
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

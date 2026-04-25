import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Menu, X, LogOut, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/classifier', label: 'Smart Scan' },
  { to: '/encyclopedia', label: 'Disease Library' },
  { to: '/models', label: 'Models' },
  { to: '/methodology', label: 'How it Works' },
  { to: '/about', label: 'About' },
];

interface NavbarProps { onAuthClick: () => void; }

export default function Navbar({ onAuthClick }: NavbarProps) {
  const { user, role, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Scroll to top on navigation
  const handleNavClick = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-200/60 shadow-sm transition-all duration-300">
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-500" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Section */}
          <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-teal-400 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
              <Activity className="text-white" size={18} />
            </div>
            <span className="font-extrabold text-slate-800 tracking-tight text-xl">
              Derm<span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => {
              const active = location.pathname === to;
              return (
                <Link key={to} to={to}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    active 
                      ? 'text-teal-700 bg-teal-50/80 shadow-sm' 
                      : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {role === 'doctor' && (
                  <Link to="/admin"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100"
                  >
                    <ShieldCheck size={13} /> Admin
                  </Link>
                )}
                <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-100/50 border border-slate-200/50 px-3 py-1.5 rounded-lg">
                  <User size={14} className="text-teal-600" />
                  <span className="font-semibold">{user.email?.split('@')[0]}</span>
                </div>
                <button onClick={() => signOut()}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors px-2 py-1.5"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <button onClick={onAuthClick}
                className="px-5 py-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-95"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-slate-500 hover:text-slate-800 p-2 rounded-lg bg-slate-50" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-lg"
          >
            <div className="px-4 py-4 flex flex-col gap-2">
              {NAV_LINKS.map(({ to, label }) => (
                <Link key={to} to={to}
                  onClick={() => handleNavClick(to)}
                  className={`px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                    location.pathname === to 
                      ? 'text-teal-700 bg-teal-50' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </Link>
              ))}
              <div className="pt-3 border-t border-slate-100 mt-2">
                {user ? (
                  <button onClick={() => { signOut(); setMobileOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-red-500">
                    Logout ({user.email?.split('@')[0]})
                  </button>
                ) : (
                  <button onClick={() => { onAuthClick(); setMobileOpen(false); }} className="w-full px-4 py-3 bg-teal-600 text-white text-sm font-bold rounded-xl">
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
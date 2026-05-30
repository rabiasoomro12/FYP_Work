import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ScanProvider } from './context/ScanContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import Chatbot from './components/Chatbot';
import LandingPage from './pages/LandingPage';
import ClassifierPage from './pages/ClassifierPage';
import EncyclopediaPage from './pages/EncyclopediaPage';
import MethodologyPage from './pages/MethodologyPage';
import AboutPage from './pages/AboutPage';
import AdminPage from './pages/AdminPage';

/**
 * ScrollToTop Component
 * Ensures the window scrolls to the top whenever the route changes.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppLayout() {
  const [authOpen, setAuthOpen] = useState(false);
  const [predictedClass, setPredictedClass] = useState(undefined);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <ScrollToTop /> {/* Reset scroll position on route change */}
      <Navbar onAuthClick={() => setAuthOpen(true)} />
      
      <main className="flex-1 pt-16">
        <Routes>
          <Route path="/" element={<LandingPage onAuthClick={() => setAuthOpen(true)} />} />
          <Route path="/classifier" element={<ClassifierPage onAuthClick={() => setAuthOpen(true)} onPrediction={setPredictedClass} />} />
          <Route path="/encyclopedia" element={<EncyclopediaPage />} />
<Route path="/methodology" element={<MethodologyPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>

      <Footer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <Chatbot predictedClass={predictedClass} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScanProvider>
          <AppLayout />
        </ScanProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
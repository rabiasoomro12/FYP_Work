import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ScanProvider } from './context/ScanContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import Chatbot from './components/Chatbot';
import LandingPage from './pages/LandingPage';
import ClassifierPage from './pages/ClassifierPage';
import EncyclopediaPage from './pages/EncyclopediaPage';
import ModelComparisonPage from './pages/ModelComparisonPage';
import MethodologyPage from './pages/MethodologyPage';
import AboutPage from './pages/AboutPage';
import AdminPage from './pages/AdminPage';

function AppLayout() {
  const [authOpen, setAuthOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onAuthClick={() => setAuthOpen(true)} />
      <main className="flex-1 pt-16">
        <Routes>
          <Route path="/" element={<LandingPage onAuthClick={() => setAuthOpen(true)} />} />
          <Route path="/classifier" element={<ClassifierPage onAuthClick={() => setAuthOpen(true)} />} />
          <Route path="/encyclopedia" element={<EncyclopediaPage />} />
          <Route path="/models" element={<ModelComparisonPage />} />
          <Route path="/methodology" element={<MethodologyPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      <Footer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <Chatbot />
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

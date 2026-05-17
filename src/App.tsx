import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import {
  DashboardCandidate,
  ContactsCandidate,
  TagsCandidate,
  CampaignsCandidate,
  SettingsCandidate,
  DashboardAdmin,
  CandidatesAdmin,
} from './pages/management';

function MobileHeader({ onOpen }: { onOpen: () => void }) {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 h-14 sidebar-glass border-b border-white/10">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-base shadow-md shadow-primary/30">🚀</div>
        <span className="font-display font-bold text-sm">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Campanhas</span>
          <span className="text-primary italic">Já</span>
        </span>
      </div>
      <button
        onClick={onOpen}
        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Abrir menu"
      >
        <Menu size={20} className="text-white" />
      </button>
    </header>
  );
}

function CandidateLayout() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="flex h-screen overflow-hidden">
      <MobileHeader onOpen={() => setSidebarOpen(true)} />
      <Sidebar
        isAdmin={false}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="flex-1 overflow-y-auto no-scrollbar relative bg-mesh pt-14 lg:pt-0">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-500/5 blur-[120px] pointer-events-none" />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function AdminLayout() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/candidato/dashboard" replace />;

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="flex h-screen overflow-hidden">
      <MobileHeader onOpen={() => setSidebarOpen(true)} />
      <Sidebar
        isAdmin={true}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="flex-1 overflow-y-auto no-scrollbar relative bg-mesh pt-14 lg:pt-0">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-500/5 blur-[120px] pointer-events-none" />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function PublicRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/candidato/dashboard" replace />;
  }
  return <>{children}</>;
}

function AppContent() {
  return (
    <div className="min-h-screen text-white bg-bg-dark font-sans selection:bg-primary/30">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicRoute><LoginPage type="CANDIDATE" /></PublicRoute>} />
        <Route path="/admin/login" element={<PublicRoute adminOnly><LoginPage type="ADMIN" /></PublicRoute>} />

        <Route element={<CandidateLayout />}>
          <Route path="/candidato" element={<Navigate to="/candidato/dashboard" replace />} />
          <Route path="/candidato/dashboard" element={<DashboardCandidate />} />
          <Route path="/candidato/contatos" element={<ContactsCandidate />} />
          <Route path="/candidato/tags" element={<TagsCandidate />} />
          <Route path="/candidato/campanhas" element={<CampaignsCandidate />} />
          <Route path="/candidato/configuracoes" element={<SettingsCandidate />} />
        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<DashboardAdmin />} />
          <Route path="/admin/candidatos" element={<CandidatesAdmin />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';

interface SidebarProps {
  isAdmin?: boolean;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isAdmin = false, onLogout, isOpen = false, onClose }: SidebarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const candidateItems = [
    { path: '/candidato/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/candidato/contatos', label: 'Contatos', icon: '👥' },
    { path: '/candidato/tags', label: 'Tags', icon: '🏷️' },
    { path: '/candidato/campanhas', label: 'Campanhas', icon: '📩' },
    { path: '/candidato/configuracoes', label: 'Configurações', icon: '⚙️' },
  ];

  const adminItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/candidatos', label: 'Candidatos', icon: '👥' },
  ];

  const items = isAdmin ? adminItems : candidateItems;

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose?.();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`w-64 h-full sidebar-glass flex flex-col p-6 fixed lg:relative z-40 lg:z-auto transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Fechar menu"
        >
          <X size={18} className="text-white/60" />
        </button>

        <div className="p-4 flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-primary/30">🚀</div>
          <h1 className="text-xl font-bold tracking-tight font-display">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Campanhas</span>
            <span className="text-primary italic">Já</span>
            {isAdmin && <span className="block text-[10px] text-primary/80 uppercase tracking-widest">Admin</span>}
          </h1>
        </div>

        <nav className="flex-1 px-2 space-y-1 no-scrollbar overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer text-sm ${
                location.pathname === item.path
                  ? 'sidebar-item-active'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </div>
          ))}
        </nav>

        {user && (
          <div className="px-4 py-4 border-t border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{user.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            <div
              onClick={onLogout}
              className="flex items-center gap-3 text-sm text-red-400 hover:text-red-300 transition-colors cursor-pointer"
            >
              <span>🚪</span>
              <span className="font-medium">Sair da Conta</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

import { Contact, Tag, Campaign, Candidate } from './types';

export const MOCK_CONTACTS: Contact[] = [
  { id: '1', name: 'João Oliveira', phone: '(11) 98765-4321', email: 'joao@email.com', tags: ['Bairro Centro', 'Apoiador'], createdAt: '2026-01-15' },
  { id: '2', name: 'Maria Santos', phone: '(21) 99887-7665', email: 'maria@email.com', tags: ['Liderança', 'Voluntário'], createdAt: '2026-02-10' },
  { id: '3', name: 'Ricardo Pereira', phone: '(31) 91234-5678', email: 'ricardo@email.com', tags: ['Doador'], createdAt: '2026-03-05' },
  { id: '4', name: 'Ana Costa', phone: '(41) 95555-4444', email: 'ana@email.com', tags: ['Jovem', 'Apoiador'], createdAt: '2026-03-20' },
  { id: '5', name: 'Lucas Silva', phone: '(51) 94444-3333', email: 'lucas@email.com', tags: ['Bairro Centro', 'Voluntário'], createdAt: '2026-04-02' },
  { id: '6', name: 'Carla Souza', phone: '(61) 93333-2222', email: 'carla@email.com', tags: ['Idoso'], createdAt: '2026-04-15' },
  { id: '7', name: 'Marcos Lima', phone: '(71) 92222-1111', email: 'marcos@email.com', tags: ['Liderança', 'Apoiador'], createdAt: '2026-05-01' },
  { id: '8', name: 'Fernanda Rocha', phone: '(81) 91111-0000', email: 'fernanda@email.com', tags: ['Bairro Centro', 'Doador'], createdAt: '2026-05-10' },
];

export const MOCK_TAGS: Tag[] = [
  { id: '1', name: 'Apoiador', color: '#10b981', count: 450 },
  { id: '2', name: 'Bairro Centro', color: '#3b82f6', count: 120 },
  { id: '3', name: 'Voluntário', color: '#f59e0b', count: 85 },
  { id: '4', name: 'Liderança', color: '#8b5cf6', count: 32 },
  { id: '5', name: 'Doador', color: '#ef4444', count: 15 },
  { id: '6', name: 'Jovem', color: '#06b6d4', count: 210 },
  { id: '7', name: 'Idoso', color: '#ec4899', count: 95 },
  { id: '8', name: 'Empresário', color: '#64748b', count: 12 },
];

export const MOCK_CAMPAIGNS: Campaign[] = [
  { id: '1', name: 'Boas-vindas Bairro Centro', status: 'Concluída', recipients: 120, date: '2026-05-10' },
  { id: '2', name: 'Chamado Voluntários', status: 'Ativa', recipients: 85, date: '2026-05-15', progress: 65 },
  { id: '3', name: 'Agradecimento Doação', status: 'Pausada', recipients: 15, date: '2026-05-12' },
  { id: '4', name: 'Lançamento Candidatura', status: 'Agendada', recipients: 450, date: '2026-05-20' },
  { id: '5', name: 'Informativo Jovem', status: 'Rascunho', recipients: 210, date: '2026-05-17' },
];

export const MOCK_CANDIDATES: Candidate[] = [
  { id: '1', name: 'João Silva', email: 'joao.silva@email.com', phone: '(11) 98888-7777', plan: 'Profissional', campaignsCount: 12, contactsCount: 1245, status: 'Ativo', createdAt: '2026-01-10' },
  { id: '2', name: 'Maria Luíza', email: 'malu@email.com', phone: '(21) 97777-6666', plan: 'Enterprise', campaignsCount: 25, contactsCount: 5600, status: 'Ativo', createdAt: '2026-01-15' },
  { id: '3', name: 'Carlos Alberto', email: 'carlos@email.com', phone: '(31) 96666-5555', plan: 'Básico', campaignsCount: 5, contactsCount: 450, status: 'Inativo', createdAt: '2026-02-05' },
  { id: '4', name: 'Fernanda Lima', email: 'fernanda.lima@email.com', phone: '(41) 95555-4444', plan: 'Profissional', campaignsCount: 8, contactsCount: 890, status: 'Ativo', createdAt: '2026-03-01' },
];

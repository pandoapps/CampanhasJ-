export type Screen =
  | 'LANDING'
  | 'LOGIN_CANDIDATE'
  | 'LOGIN_ADMIN'
  | 'DASHBOARD_CANDIDATE'
  | 'CONTACTS_CANDIDATE'
  | 'TAGS_CANDIDATE'
  | 'CAMPAIGNS_CANDIDATE'
  | 'SETTINGS_CANDIDATE'
  | 'DASHBOARD_ADMIN'
  | 'CANDIDATES_ADMIN';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  tags: string[];
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'Rascunho' | 'Agendada' | 'Enviando' | 'Concluída' | 'Ativa' | 'Pausada';
  recipients: number;
  date: string;
  progress?: number;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: 'Básico' | 'Profissional' | 'Enterprise';
  campaignsCount: number;
  contactsCount: number;
  status: 'Ativo' | 'Inativo';
  createdAt: string;
}

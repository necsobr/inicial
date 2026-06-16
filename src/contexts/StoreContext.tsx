import React, { createContext, useContext, useState } from 'react';
import type {
  Usuario, Equipe, Membro, Evento, Palestrante,
  SolicitacaoPatrocinio, RequisicaoImpressao, ConfiguracaoIntegracao, Notificacao
} from '../types';
import {
  USUARIOS_PADRAO, EQUIPES_PADRAO, MEMBROS_PADRAO, EVENTOS_PADRAO,
  PALESTRANTES_PADRAO, SOLICITACOES_PADRAO, REQUISICOES_PADRAO,
  INTEGRACOES_PADRAO, NOTIFICACOES_PADRAO
} from '../services/mockData';

interface StoreContextType {
  usuarios: Usuario[];
  setUsuarios: (u: Usuario[]) => void;
  equipes: Equipe[];
  setEquipes: (e: Equipe[]) => void;
  membros: Membro[];
  setMembros: (m: Membro[]) => void;
  eventos: Evento[];
  setEventos: (e: Evento[]) => void;
  palestrantes: Palestrante[];
  setPalestrantes: (p: Palestrante[]) => void;
  solicitacoes: SolicitacaoPatrocinio[];
  setSolicitacoes: (s: SolicitacaoPatrocinio[]) => void;
  requisicoes: RequisicaoImpressao[];
  setRequisicoes: (r: RequisicaoImpressao[]) => void;
  integracoes: ConfiguracaoIntegracao[];
  setIntegracoes: (i: ConfiguracaoIntegracao[]) => void;
  notificacoes: Notificacao[];
  setNotificacoes: (n: Notificacao[]) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>(USUARIOS_PADRAO);
  const [equipes, setEquipes] = useState<Equipe[]>(EQUIPES_PADRAO);
  const [membros, setMembros] = useState<Membro[]>(MEMBROS_PADRAO);
  const [eventos, setEventos] = useState<Evento[]>(EVENTOS_PADRAO);
  const [palestrantes, setPalestrantes] = useState<Palestrante[]>(PALESTRANTES_PADRAO);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoPatrocinio[]>(SOLICITACOES_PADRAO);
  const [requisicoes, setRequisicoes] = useState<RequisicaoImpressao[]>(REQUISICOES_PADRAO);
  const [integracoes, setIntegracoes] = useState<ConfiguracaoIntegracao[]>(INTEGRACOES_PADRAO);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>(NOTIFICACOES_PADRAO);

  return (
    <StoreContext.Provider value={{
      usuarios, setUsuarios,
      equipes, setEquipes,
      membros, setMembros,
      eventos, setEventos,
      palestrantes, setPalestrantes,
      solicitacoes, setSolicitacoes,
      requisicoes, setRequisicoes,
      integracoes, setIntegracoes,
      notificacoes, setNotificacoes,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore deve ser usado dentro de StoreProvider');
  return ctx;
}

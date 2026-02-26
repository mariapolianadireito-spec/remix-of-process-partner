import React, { createContext, useContext } from 'react';
import { useProcessos, useClientes } from '@/store/useStore';
import type { Processo, Cliente } from '@/types/process';

interface AppContextType {
  processos: Processo[];
  addProcesso: (p: Processo) => void;
  updateProcesso: (p: Processo) => void;
  deleteProcesso: (id: string) => void;
  clientes: Cliente[];
  addCliente: (c: Cliente) => void;
  updateCliente: (c: Cliente) => void;
  deleteCliente: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const processosStore = useProcessos();
  const clientesStore = useClientes();

  return (
    <AppContext.Provider value={{ ...processosStore, ...clientesStore }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

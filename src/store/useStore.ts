import { useState, useEffect, useCallback } from 'react';
import type { Processo, Cliente } from '@/types/process';

const STORAGE_KEYS = {
  processos: 'jurispro_processos',
  clientes: 'jurispro_clientes',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function useProcessos() {
  const [processos, setProcessos] = useState<Processo[]>(() =>
    loadFromStorage(STORAGE_KEYS.processos, [])
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.processos, processos);
  }, [processos]);

  const addProcesso = useCallback((p: Processo) => {
    setProcessos(prev => [...prev, p]);
  }, []);

  const updateProcesso = useCallback((p: Processo) => {
    setProcessos(prev => prev.map(item => (item.id === p.id ? p : item)));
  }, []);

  const deleteProcesso = useCallback((id: string) => {
    setProcessos(prev => prev.filter(item => item.id !== id));
  }, []);

  return { processos, addProcesso, updateProcesso, deleteProcesso };
}

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>(() =>
    loadFromStorage(STORAGE_KEYS.clientes, [])
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.clientes, clientes);
  }, [clientes]);

  const addCliente = useCallback((c: Cliente) => {
    setClientes(prev => [...prev, c]);
  }, []);

  const updateCliente = useCallback((c: Cliente) => {
    setClientes(prev => prev.map(item => (item.id === c.id ? c : item)));
  }, []);

  const deleteCliente = useCallback((id: string) => {
    setClientes(prev => prev.filter(item => item.id !== id));
  }, []);

  return { clientes, addCliente, updateCliente, deleteCliente };
}

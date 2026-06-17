import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Processo, Cliente, Movimentacao, PecaProcessual, Jurisdicao, Relevancia } from '@/types/process';
import { toast } from 'sonner';

// ============= Row <-> Domain mappers =============
type ProcessoRow = {
  id: string;
  numero: string;
  titulo: string;
  cliente_id: string | null;
  jurisdicao: string;
  estado: string;
  relevancia: string;
  vara: string | null;
  contato_vara: string | null;
  telefone_vara: string | null;
  forma_acesso: string | null;
  senha_acesso: string | null;
  url_acesso: string | null;
  ultima_movimentacao: string | null;
  data_ultima_movimentacao: string | null;
  data_ultima_consulta: string | null;
  observacoes: string | null;
  movimentacoes: Movimentacao[] | null;
  pecas: PecaProcessual[] | null;
  criado_em: string;
  atualizado_em: string;
};

const rowToProcesso = (r: ProcessoRow): Processo => ({
  id: r.id,
  numero: r.numero,
  titulo: r.titulo,
  clienteId: r.cliente_id ?? '',
  jurisdicao: (r.jurisdicao as Jurisdicao) || 'estadual',
  estado: r.estado || '',
  relevancia: (r.relevancia as Relevancia) || 'normal',
  vara: r.vara ?? '',
  contatoVara: r.contato_vara ?? '',
  telefoneVara: r.telefone_vara ?? '',
  formaAcesso: r.forma_acesso ?? '',
  senhaAcesso: r.senha_acesso ?? '',
  urlAcesso: r.url_acesso ?? '',
  ultimaMovimentacao: r.ultima_movimentacao ?? '',
  dataUltimaMovimentacao: r.data_ultima_movimentacao ?? '',
  dataUltimaConsulta: r.data_ultima_consulta ?? '',
  observacoes: r.observacoes ?? '',
  movimentacoes: Array.isArray(r.movimentacoes) ? r.movimentacoes : [],
  pecas: Array.isArray(r.pecas) ? r.pecas : [],
  criadoEm: r.criado_em,
  atualizadoEm: r.atualizado_em,
});

const processoToRow = (p: Processo) => ({
  id: p.id,
  numero: p.numero,
  titulo: p.titulo,
  cliente_id: p.clienteId || null,
  jurisdicao: p.jurisdicao,
  estado: p.estado,
  relevancia: p.relevancia,
  vara: p.vara || null,
  contato_vara: p.contatoVara || null,
  telefone_vara: p.telefoneVara || null,
  forma_acesso: p.formaAcesso || null,
  senha_acesso: p.senhaAcesso || null,
  url_acesso: p.urlAcesso || null,
  ultima_movimentacao: p.ultimaMovimentacao || null,
  data_ultima_movimentacao: p.dataUltimaMovimentacao || null,
  data_ultima_consulta: p.dataUltimaConsulta || null,
  observacoes: p.observacoes || null,
  movimentacoes: p.movimentacoes ?? [],
  pecas: p.pecas ?? [],
});

type ClienteRow = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  documento: string | null;
  observacoes: string | null;
  criado_em: string;
};

const rowToCliente = (r: ClienteRow): Cliente => ({
  id: r.id,
  nome: r.nome,
  email: r.email ?? '',
  telefone: r.telefone ?? '',
  documento: r.documento ?? '',
  observacoes: r.observacoes ?? '',
  criadoEm: r.criado_em,
});

// ============= Hooks =============
export function useProcessos() {
  const qc = useQueryClient();

  const { data: processos = [] } = useQuery({
    queryKey: ['processos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('processos')
        .select('*')
        .order('atualizado_em', { ascending: false });
      if (error) throw error;
      return (data as unknown as ProcessoRow[]).map(rowToProcesso);
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['processos'] });

  const addMut = useMutation({
    mutationFn: async (p: Processo) => {
      const { error } = await supabase.from('processos').insert(processoToRow(p) as never);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success('Processo cadastrado'); },
    onError: (e: Error) => toast.error(`Erro ao salvar: ${e.message}`),
  });

  const updateMut = useMutation({
    mutationFn: async (p: Processo) => {
      const { id, ...rest } = processoToRow(p);
      const { error } = await supabase.from('processos').update(rest as never).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(),
    onError: (e: Error) => toast.error(`Erro ao atualizar: ${e.message}`),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('processos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success('Processo excluído'); },
    onError: (e: Error) => toast.error(`Erro ao excluir: ${e.message}`),
  });

  return {
    processos,
    addProcesso: (p: Processo) => addMut.mutate(p),
    updateProcesso: (p: Processo) => updateMut.mutate(p),
    deleteProcesso: (id: string) => deleteMut.mutate(id),
  };
}

export function useClientes() {
  const qc = useQueryClient();

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome', { ascending: true });
      if (error) throw error;
      return (data as ClienteRow[]).map(rowToCliente);
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['clientes'] });

  const addMut = useMutation({
    mutationFn: async (c: Cliente) => {
      const { error } = await supabase.from('clientes').insert({
        id: c.id,
        nome: c.nome,
        email: c.email || null,
        telefone: c.telefone || null,
        documento: c.documento || null,
        observacoes: c.observacoes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success('Cliente cadastrado'); },
    onError: (e: Error) => toast.error(`Erro ao salvar: ${e.message}`),
  });

  const updateMut = useMutation({
    mutationFn: async (c: Cliente) => {
      const { error } = await supabase.from('clientes').update({
        nome: c.nome,
        email: c.email || null,
        telefone: c.telefone || null,
        documento: c.documento || null,
        observacoes: c.observacoes || null,
      }).eq('id', c.id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(),
    onError: (e: Error) => toast.error(`Erro ao atualizar: ${e.message}`),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('clientes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success('Cliente excluído'); },
    onError: (e: Error) => toast.error(`Erro ao excluir: ${e.message}`),
  });

  return {
    clientes,
    addCliente: (c: Cliente) => addMut.mutate(c),
    updateCliente: (c: Cliente) => updateMut.mutate(c),
    deleteCliente: (id: string) => deleteMut.mutate(id),
  };
}

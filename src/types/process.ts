export type Jurisdicao = 'federal' | 'estadual' | 'trabalhista' | 'administrativo';
export type Relevancia = 'relevante' | 'normal';

export interface Movimentacao {
  id: string;
  data: string;
  descricao: string;
}

export interface PecaProcessual {
  id: string;
  nome: string;
  descricao: string;
  dataJuntada: string;
}

export interface Processo {
  id: string;
  numero: string;
  titulo: string;
  clienteId: string;
  jurisdicao: Jurisdicao;
  estado: string;
  relevancia: Relevancia;
  vara: string;
  contatoVara: string;
  telefoneVara: string;
  formaAcesso: string;
  senhaAcesso: string;
  urlAcesso: string;
  ultimaMovimentacao: string;
  dataUltimaMovimentacao: string;
  dataUltimaConsulta: string;
  observacoes: string;
  movimentacoes: Movimentacao[];
  pecas: PecaProcessual[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  documento: string;
  observacoes: string;
  criadoEm: string;
}

export const JURISDICAO_LABELS: Record<Jurisdicao, string> = {
  federal: 'Justiça Federal',
  estadual: 'Justiça Estadual',
  trabalhista: 'Justiça do Trabalho',
  administrativo: 'Processo Administrativo',
};

export const ESTADOS_BRASIL = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

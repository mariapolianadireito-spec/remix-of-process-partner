import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { JURISDICAO_LABELS } from '@/types/process';
import type { Jurisdicao, Processo } from '@/types/process';
import { Link } from 'react-router-dom';
import { Plus, Search, ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProcessFormDialog } from '@/components/ProcessFormDialog';
import { cn } from '@/lib/utils';

const ESTADO_NOME: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia',
  CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás',
  MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais',
  PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí',
  RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul',
  RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo',
  SE: 'Sergipe', TO: 'Tocantins',
};

function groupByEstado(processos: Processo[]): Record<string, Processo[]> {
  const groups: Record<string, Processo[]> = {};
  for (const p of processos) {
    const uf = p.estado || 'Outros';
    if (!groups[uf]) groups[uf] = [];
    groups[uf].push(p);
  }
  // Sort by state name
  const sorted: Record<string, Processo[]> = {};
  Object.keys(groups)
    .sort((a, b) => (ESTADO_NOME[a] || a).localeCompare(ESTADO_NOME[b] || b))
    .forEach(k => { sorted[k] = groups[k]; });
  return sorted;
}

function EstadoGroup({ uf, processos, clientes }: { uf: string; processos: Processo[]; clientes: { id: string; nome: string }[] }) {
  const [open, setOpen] = useState(true);
  const getClienteNome = (id: string) => clientes.find(c => c.id === id)?.nome || 'Sem cliente';

  const jurisdicaoColor: Record<Jurisdicao, string> = {
    federal: 'bg-navy text-primary-foreground',
    estadual: 'bg-success text-success-foreground',
    trabalhista: 'bg-warning text-warning-foreground',
    administrativo: 'bg-purple-600 text-primary-foreground',
  };

  return (
    <div className="space-y-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted"
      >
        {open ? <FolderOpen className="h-4 w-4 text-accent" /> : <Folder className="h-4 w-4 text-muted-foreground" />}
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        <span>{ESTADO_NOME[uf] || uf}</span>
        <Badge variant="secondary" className="ml-auto text-xs">{processos.length}</Badge>
      </button>
      {open && (
        <div className="ml-4 space-y-2 border-l-2 border-border pl-4">
          {processos.map(p => (
            <Link key={p.id} to={`/processos/${p.id}`}>
              <Card className="transition-all hover:shadow-md hover:border-accent/30 cursor-pointer">
                <CardContent className="flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-sm font-medium truncate">{p.titulo}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      <span>{p.numero}</span>
                      <span>•</span>
                      <span>{getClienteNome(p.clienteId)}</span>
                    </div>
                    {p.ultimaMovimentacao && (
                      <p className="text-xs text-muted-foreground truncate">Últ. mov.: {p.ultimaMovimentacao}</p>
                    )}
                  </div>
                  <Badge className={cn('shrink-0 text-xs', jurisdicaoColor[p.jurisdicao])}>
                    {JURISDICAO_LABELS[p.jurisdicao]}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const ProcessosList = () => {
  const { processos, clientes } = useApp();
  const [search, setSearch] = useState('');
  const [filterJurisdicao, setFilterJurisdicao] = useState<string>('all');
  const [filterCliente, setFilterCliente] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);

  const filtered = processos.filter(p => {
    const matchSearch =
      p.titulo.toLowerCase().includes(search.toLowerCase()) ||
      p.numero.toLowerCase().includes(search.toLowerCase());
    const matchJurisdicao = filterJurisdicao === 'all' || p.jurisdicao === filterJurisdicao;
    const matchCliente = filterCliente === 'all' || p.clienteId === filterCliente;
    return matchSearch && matchJurisdicao && matchCliente;
  });

  const relevantes = filtered.filter(p => p.relevancia === 'relevante');
  const normais = filtered.filter(p => p.relevancia === 'normal');

  const relevantesEstado = groupByEstado(relevantes);
  const normaisEstado = groupByEstado(normais);

  const clientesList = clientes.map(c => ({ id: c.id, nome: c.nome }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display">Processos</h1>
          <p className="text-muted-foreground mt-1">{processos.length} processos cadastrados</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="h-4 w-4" />
          Novo Processo
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por título ou número..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterJurisdicao} onValueChange={setFilterJurisdicao}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Jurisdição" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Jurisdições</SelectItem>
            <SelectItem value="federal">Justiça Federal</SelectItem>
            <SelectItem value="estadual">Justiça Estadual</SelectItem>
            <SelectItem value="trabalhista">Justiça do Trabalho</SelectItem>
            <SelectItem value="administrativo">Proc. Administrativo</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCliente} onValueChange={setFilterCliente}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Clientes</SelectItem>
            {clientes.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Two columns: Relevantes | Normal */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Relevantes */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3">
            <span className="text-lg">⚡</span>
            <h2 className="font-display text-lg font-bold">Mais Relevantes</h2>
            <Badge variant="destructive" className="ml-auto">{relevantes.length}</Badge>
          </div>
          {Object.keys(relevantesEstado).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhum processo relevante.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(relevantesEstado).map(([uf, procs]) => (
                <EstadoGroup key={uf} uf={uf} processos={procs} clientes={clientesList} />
              ))}
            </div>
          )}
        </div>

        {/* Normal */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg bg-info/10 px-4 py-3">
            <span className="text-lg">📁</span>
            <h2 className="font-display text-lg font-bold">Acompanhamento Normal</h2>
            <Badge className="ml-auto bg-info text-info-foreground">{normais.length}</Badge>
          </div>
          {Object.keys(normaisEstado).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhum processo normal.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(normaisEstado).map(([uf, procs]) => (
                <EstadoGroup key={uf} uf={uf} processos={procs} clientes={clientesList} />
              ))}
            </div>
          )}
        </div>
      </div>

      <ProcessFormDialog open={showForm} onOpenChange={setShowForm} />
    </div>
  );
};

export default ProcessosList;

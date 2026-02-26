import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { JURISDICAO_LABELS } from '@/types/process';
import type { Jurisdicao, Relevancia } from '@/types/process';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
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

const ProcessosList = () => {
  const { processos, clientes } = useApp();
  const [search, setSearch] = useState('');
  const [filterJurisdicao, setFilterJurisdicao] = useState<string>('all');
  const [filterRelevancia, setFilterRelevancia] = useState<string>('all');
  const [filterCliente, setFilterCliente] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);

  const filtered = processos.filter(p => {
    const matchSearch =
      p.titulo.toLowerCase().includes(search.toLowerCase()) ||
      p.numero.toLowerCase().includes(search.toLowerCase());
    const matchJurisdicao = filterJurisdicao === 'all' || p.jurisdicao === filterJurisdicao;
    const matchRelevancia = filterRelevancia === 'all' || p.relevancia === filterRelevancia;
    const matchCliente = filterCliente === 'all' || p.clienteId === filterCliente;
    return matchSearch && matchJurisdicao && matchRelevancia && matchCliente;
  });

  const getClienteNome = (id: string) => clientes.find(c => c.id === id)?.nome || 'Sem cliente';

  const jurisdicaoColor: Record<Jurisdicao, string> = {
    federal: 'bg-navy text-primary-foreground',
    estadual: 'bg-success text-success-foreground',
    trabalhista: 'bg-warning text-warning-foreground',
    administrativo: 'bg-purple-600 text-primary-foreground',
  };

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
        <Select value={filterRelevancia} onValueChange={setFilterRelevancia}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Relevância" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="relevante">Relevantes</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
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

      {/* List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Filter className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Nenhum processo encontrado.</p>
            <Button variant="link" onClick={() => setShowForm(true)} className="mt-2 text-accent">
              Cadastrar novo processo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <Link key={p.id} to={`/processos/${p.id}`}>
              <Card className="transition-all hover:shadow-md hover:border-accent/30 cursor-pointer">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold truncate">{p.titulo}</h3>
                      <Badge variant={p.relevancia === 'relevante' ? 'destructive' : 'secondary'}>
                        {p.relevancia === 'relevante' ? '⚡ Relevante' : 'Normal'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                      <span>{p.numero}</span>
                      <span>•</span>
                      <span>{getClienteNome(p.clienteId)}</span>
                      <span>•</span>
                      <span>{p.estado}</span>
                    </div>
                    {p.ultimaMovimentacao && (
                      <p className="text-xs text-muted-foreground truncate">
                        Última mov.: {p.ultimaMovimentacao}
                      </p>
                    )}
                  </div>
                  <Badge className={jurisdicaoColor[p.jurisdicao]}>
                    {JURISDICAO_LABELS[p.jurisdicao]}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <ProcessFormDialog open={showForm} onOpenChange={setShowForm} />
    </div>
  );
};

export default ProcessosList;

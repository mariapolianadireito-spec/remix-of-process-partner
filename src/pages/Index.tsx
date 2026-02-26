import { useApp } from '@/contexts/AppContext';
import { JURISDICAO_LABELS } from '@/types/process';
import type { Jurisdicao } from '@/types/process';
import { Scale, Users, AlertTriangle, Clock, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard = () => {
  const { processos, clientes } = useApp();

  const totalProcessos = processos.length;
  const relevantes = processos.filter(p => p.relevancia === 'relevante').length;
  const porJurisdicao = (['federal', 'estadual', 'trabalhista', 'administrativo'] as Jurisdicao[]).map(j => ({
    key: j,
    label: JURISDICAO_LABELS[j],
    count: processos.filter(p => p.jurisdicao === j).length,
  }));

  const recentProcessos = [...processos]
    .sort((a, b) => new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime())
    .slice(0, 5);

  const naoConsultados = [...processos]
    .filter(p => p.dataUltimaConsulta)
    .sort((a, b) => new Date(a.dataUltimaConsulta).getTime() - new Date(b.dataUltimaConsulta).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display text-foreground">Painel</h1>
        <p className="text-muted-foreground mt-1">Visão geral do seu escritório</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Processos
            </CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display">{totalProcessos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mais Relevantes
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display text-destructive">{relevantes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display">{clientes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Acompanhamento Normal
            </CardTitle>
            <Clock className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display text-info">{totalProcessos - relevantes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Por jurisdição */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {porJurisdicao.map(j => (
          <Card key={j.key} className="border-l-4" style={{ borderLeftColor: `hsl(var(--badge-${j.key}))` }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{j.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display">{j.count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent processes */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Últimas Atualizações</CardTitle>
          </CardHeader>
          <CardContent>
            {recentProcessos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum processo cadastrado.</p>
            ) : (
              <div className="space-y-3">
                {recentProcessos.map(p => (
                  <Link
                    key={p.id}
                    to={`/processos/${p.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.titulo}</p>
                      <p className="text-xs text-muted-foreground">{p.numero}</p>
                    </div>
                    <Badge variant={p.relevancia === 'relevante' ? 'destructive' : 'secondary'} className="ml-2 shrink-0">
                      {p.relevancia === 'relevante' ? 'Relevante' : 'Normal'}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Pendentes de Consulta
            </CardTitle>
          </CardHeader>
          <CardContent>
            {naoConsultados.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todos os processos estão em dia.</p>
            ) : (
              <div className="space-y-3">
                {naoConsultados.map(p => (
                  <Link
                    key={p.id}
                    to={`/processos/${p.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.titulo}</p>
                      <p className="text-xs text-muted-foreground">
                        Consultado {formatDistanceToNow(new Date(p.dataUltimaConsulta), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

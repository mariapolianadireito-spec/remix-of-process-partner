import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Scale, AlertTriangle, CheckCircle2, FileText, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard = () => {
  const { processos, clientes } = useApp();

  const clienteById = useMemo(
    () => Object.fromEntries(clientes.map(c => [c.id, c])),
    [clientes]
  );

  const total = processos.length;
  const prioritarios = processos.filter(p => p.relevancia === 'relevante').length;
  const normais = processos.filter(p => p.relevancia === 'normal').length;
  const administrativos = processos.filter(p => p.jurisdicao === 'administrativo').length;

  const esferas = [
    { label: 'Justiça Estadual MS', count: processos.filter(p => p.jurisdicao === 'estadual' && p.estado === 'MS').length },
    { label: 'Justiça Estadual MT', count: processos.filter(p => p.jurisdicao === 'estadual' && p.estado === 'MT').length },
    { label: 'Justiça Federal', count: processos.filter(p => p.jurisdicao === 'federal').length },
    { label: 'Justiça do Trabalho', count: processos.filter(p => p.jurisdicao === 'trabalhista').length },
    { label: 'Processo Administrativo', count: processos.filter(p => p.jurisdicao === 'administrativo').length },
  ];
  const maxEsfera = Math.max(1, ...esferas.map(e => e.count));

  const prioritariosRecentes = useMemo(
    () => [...processos]
      .filter(p => p.relevancia === 'relevante')
      .sort((a, b) => new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime())
      .slice(0, 5),
    [processos]
  );

  const ultimasMov = useMemo(() => {
    const all = processos.flatMap(p =>
      (p.movimentacoes || []).map(m => ({
        ...m,
        processoId: p.id,
        processoNumero: p.numero,
      }))
    );
    return all
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 5);
  }, [processos]);

  return (
    <div className="space-y-6">
      {/* Faixa 1 — métricas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total de Processos Ativos"
          value={total}
          icon={<Scale className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          label="Processos Prioritários"
          value={prioritarios}
          valueClassName="text-[hsl(var(--priority))]"
          icon={<AlertTriangle className="h-4 w-4 text-[hsl(var(--priority))]" />}
          accent="hsl(var(--priority))"
        />
        <MetricCard
          label="Acompanhamento Normal"
          value={normais}
          valueClassName="text-[hsl(var(--normal))]"
          icon={<CheckCircle2 className="h-4 w-4 text-[hsl(var(--normal))]" />}
          accent="hsl(var(--normal))"
        />
        <MetricCard
          label="Processos Administrativos"
          value={administrativos}
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Faixa 2 — distribuição por esfera */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg">Distribuição por Esfera</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {esferas.map(e => (
            <div key={e.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground/80">{e.label}</span>
                <span className="font-medium tabular-nums">{e.count}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(e.count / maxEsfera) * 100}%` }}
                />
              </div>
            </div>
          ))}
          {total === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum processo cadastrado.</p>
          )}
        </CardContent>
      </Card>

      {/* Faixa 3 — dois painéis */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[hsl(var(--priority))]" />
              Processos Prioritários Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prioritariosRecentes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum processo prioritário no momento.</p>
            ) : (
              <ul className="divide-y divide-border">
                {prioritariosRecentes.map(p => (
                  <li key={p.id}>
                    <Link
                      to={`/processos/${p.id}`}
                      className="flex items-center justify-between gap-3 py-2.5 transition-colors hover:bg-muted/50 -mx-2 px-2 rounded"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{p.numero}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {clienteById[p.clienteId]?.nome || '—'}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-[hsl(var(--priority))]/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[hsl(var(--priority))]">
                        Prioritário
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Últimas Movimentações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ultimasMov.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma movimentação registrada.</p>
            ) : (
              <ul className="divide-y divide-border">
                {ultimasMov.map(m => (
                  <li key={m.id}>
                    <Link
                      to={`/processos/${m.processoId}`}
                      className="block py-2.5 transition-colors hover:bg-muted/50 -mx-2 px-2 rounded"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-xs font-mono text-muted-foreground">{m.processoNumero}</p>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {format(new Date(m.data), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-sm text-foreground/90">{m.descricao}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  valueClassName?: string;
  accent?: string;
}

function MetricCard({ label, value, icon, valueClassName = '', accent }: MetricCardProps) {
  return (
    <Card
      className="border-l-4"
      style={accent ? { borderLeftColor: accent } : { borderLeftColor: 'hsl(var(--primary))' }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`font-display text-3xl font-bold ${valueClassName}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

export default Dashboard;

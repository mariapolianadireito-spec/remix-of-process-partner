import { useMemo, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Scale, User } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface SidebarSearchProps {
  onNavigate?: () => void;
}

export function SidebarSearch({ onNavigate }: SidebarSearchProps) {
  const { processos, clientes } = useApp();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setFocused(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { processos: [], clientes: [] };
    return {
      processos: processos
        .filter(p => p.numero.toLowerCase().includes(q) || p.titulo.toLowerCase().includes(q))
        .slice(0, 5),
      clientes: clientes
        .filter(c => c.nome.toLowerCase().includes(q))
        .slice(0, 5),
    };
  }, [query, processos, clientes]);

  const showResults = focused && query.trim().length > 0;
  const empty = showResults && results.processos.length === 0 && results.clientes.length === 0;

  const handleClick = () => {
    setQuery('');
    setFocused(false);
    onNavigate?.();
  };

  return (
    <div ref={containerRef} className="relative px-3 pb-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/50" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Buscar processo ou cliente…"
          className="h-9 w-full rounded-md border border-sidebar-border bg-sidebar-accent/40 pl-8 pr-3 text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none focus:ring-2 focus:ring-sidebar-ring"
        />
      </div>

      {showResults && (
        <div className="absolute left-3 right-3 top-full z-50 mt-1 max-h-80 overflow-auto rounded-md border border-border bg-popover text-popover-foreground shadow-lg">
          {empty && (
            <p className="px-3 py-3 text-xs text-muted-foreground">Nenhum resultado.</p>
          )}
          {results.processos.length > 0 && (
            <div className="py-1">
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Processos</p>
              {results.processos.map(p => (
                <Link
                  key={p.id}
                  to={`/processos/${p.id}`}
                  onClick={handleClick}
                  className="flex items-start gap-2 px-3 py-2 text-sm hover:bg-muted"
                >
                  <Scale className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.numero}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.titulo}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {results.clientes.length > 0 && (
            <div className="border-t border-border py-1">
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Clientes</p>
              {results.clientes.map(c => (
                <Link
                  key={c.id}
                  to="/clientes"
                  onClick={handleClick}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                >
                  <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{c.nome}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

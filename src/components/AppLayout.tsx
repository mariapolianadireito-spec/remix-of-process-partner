import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Scale, Users, Menu, LogOut } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { SidebarSearch } from '@/components/SidebarSearch';

const navItems = [
  { title: 'Painel', url: '/', icon: LayoutDashboard },
  { title: 'Processos', url: '/processos', icon: Scale },
  { title: 'Clientes', url: '/clientes', icon: Users },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const displayName = (user?.user_metadata?.nome_exibicao as string) || user?.email || '';
  const hoje = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  const hojeCapitalized = hoje.charAt(0).toUpperCase() + hoje.slice(1);

  return (
    <div className="flex min-h-screen w-full">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-sidebar-primary font-display text-base font-bold text-sidebar-primary-foreground">
            P&amp;L
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold leading-tight">Pithan &amp; Loubet</p>
            <p className="truncate text-[11px] text-sidebar-foreground/60">Gestão Processual</p>
          </div>
        </div>

        <SidebarSearch onNavigate={() => setSidebarOpen(false)} />

        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.url ||
              (item.url !== '/' && location.pathname.startsWith(item.url));
            return (
              <Link
                key={item.url}
                to={item.url}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border px-5 py-3">
          <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50">
            Sistema interno
          </p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-12 items-center gap-4 border-b bg-card px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4 text-xs">
            <span className="hidden text-muted-foreground md:inline">{hojeCapitalized}</span>
            {user && (
              <>
                <span className="hidden h-3 w-px bg-border md:inline-block" />
                <span className="text-foreground/80">{displayName}</span>
                <Button variant="ghost" size="sm" onClick={signOut} className="h-7 gap-1.5 px-2 text-xs">
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}

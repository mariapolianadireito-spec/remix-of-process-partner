import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import ProcessosList from "./pages/ProcessosList";
import ProcessoDetail from "./pages/ProcessoDetail";
import ClientesList from "./pages/ClientesList";
import AuthPage from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Carregando…
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return (
    <AppProvider>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/processos" element={<ProcessosList />} />
          <Route path="/processos/:id" element={<ProcessoDetail />} />
          <Route path="/clientes" element={<ClientesList />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </AppProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

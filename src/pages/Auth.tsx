import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPass, setSignupPass] = useState('');
  const [signupNome, setSignupNome] = useState('');

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPass,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : error.message);
      return;
    }
    toast.success('Bem-vindo(a)!');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: signupEmail.trim(),
      password: signupPass,
      options: {
        emailRedirectTo: window.location.origin,
        data: { nome_exibicao: signupNome.trim() || signupEmail.split('@')[0] },
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Conta criada! Você já pode entrar.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-md bg-primary font-display text-xl font-bold text-primary-foreground shadow-sm">
            P&amp;L
          </div>
          <h1 className="font-display text-2xl font-bold leading-tight">Pithan &amp; Loubet</h1>
          <p className="text-sm text-muted-foreground">Gestão Processual</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Acesso do escritório</CardTitle>
            <CardDescription>Entre com seu e-mail e senha para acessar os processos.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar conta</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-mail</Label>
                    <Input id="login-email" type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-pass">Senha</Label>
                    <Input id="login-pass" type="password" required value={loginPass} onChange={e => setLoginPass(e.target.value)} />
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    {submitting ? 'Entrando…' : 'Entrar'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-nome">Nome de exibição</Label>
                    <Input id="signup-nome" value={signupNome} onChange={e => setSignupNome(e.target.value)} placeholder="Ex: Dra. Maria Silva" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">E-mail</Label>
                    <Input id="signup-email" type="email" required value={signupEmail} onChange={e => setSignupEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-pass">Senha (mínimo 6 caracteres)</Label>
                    <Input id="signup-pass" type="password" required minLength={6} value={signupPass} onChange={e => setSignupPass(e.target.value)} />
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    {submitting ? 'Criando…' : 'Criar conta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Sistema interno do escritório · Acesso restrito a usuários autorizados
        </p>
      </div>
    </div>
  );
}

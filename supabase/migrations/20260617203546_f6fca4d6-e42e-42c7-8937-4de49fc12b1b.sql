
-- ============ ENUM ============
CREATE TYPE public.app_role AS ENUM ('admin', 'membro');

-- ============ UPDATED_AT helper ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_exibicao TEXT,
  oab TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados podem ver perfis" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuário edita seu próprio perfil" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Usuário cria seu próprio perfil" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados podem ver papéis" ON public.user_roles
  FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- ============ SIGNUP TRIGGER: create profile + role ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
  novo_papel public.app_role;
BEGIN
  INSERT INTO public.profiles (id, nome_exibicao)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome_exibicao', split_part(NEW.email, '@', 1)));

  SELECT COUNT(*) INTO user_count FROM auth.users;
  IF user_count <= 1 THEN
    novo_papel := 'admin';
  ELSE
    novo_papel := 'membro';
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, novo_papel);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ CLIENTES ============
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  documento TEXT,
  observacoes TEXT,
  criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clientes TO authenticated;
GRANT ALL ON public.clientes TO service_role;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados acessam clientes" ON public.clientes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER clientes_updated_at BEFORE UPDATE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ PROCESSOS ============
CREATE TABLE public.processos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL,
  titulo TEXT NOT NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  jurisdicao TEXT NOT NULL DEFAULT 'estadual',
  estado TEXT NOT NULL DEFAULT 'SP',
  relevancia TEXT NOT NULL DEFAULT 'normal',
  vara TEXT,
  contato_vara TEXT,
  telefone_vara TEXT,
  forma_acesso TEXT,
  senha_acesso TEXT,
  url_acesso TEXT,
  ultima_movimentacao TEXT,
  data_ultima_movimentacao TIMESTAMPTZ,
  data_ultima_consulta TIMESTAMPTZ,
  observacoes TEXT,
  movimentacoes JSONB NOT NULL DEFAULT '[]'::jsonb,
  pecas JSONB NOT NULL DEFAULT '[]'::jsonb,
  criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.processos TO authenticated;
GRANT ALL ON public.processos TO service_role;
ALTER TABLE public.processos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados acessam processos" ON public.processos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER processos_updated_at BEFORE UPDATE ON public.processos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_processos_cliente ON public.processos(cliente_id);
CREATE INDEX idx_processos_relevancia ON public.processos(relevancia);
CREATE INDEX idx_processos_estado ON public.processos(estado);

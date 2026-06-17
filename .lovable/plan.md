
## Passo a passo para conectar o backend

No Lovable, o jeito mais simples de ter banco de dados + autenticação é ativar o **Lovable Cloud** — ele provisiona um projeto Supabase automaticamente, sem você precisar criar conta externa nem colar URL/chaves. (Se preferir conectar uma conta Supabase própria, me diga antes de aprovar.)

### Etapa 1 — Ativar o backend (faço agora ao aprovar)
Habilito o Lovable Cloud. Isso cria o banco PostgreSQL, sistema de auth e storage prontos para uso.

### Etapa 2 — Criar as tabelas
- **clientes** — nome, documento, e-mail, telefone, observações.
- **processos** — número, título, `cliente_id`, jurisdição, estado, relevância, vara, contatos da vara, forma/URL/senha de acesso, última movimentação, datas, observações.
- **movimentacoes** — histórico (`processo_id`, data, descrição).
- **pecas** — peças/manifestações (`processo_id`, nome, descrição, data de juntada). Upload de arquivos fica para depois.
- **profiles** — dados do usuário (nome, OAB), criada via trigger no signup.
- **user_roles** + função `has_role()` para controle de admin/membro.

Todas com RLS ativa e `GRANT`s explícitos para usuários autenticados.

### Etapa 3 — Regras de acesso
Como é um sistema interno do escritório: qualquer **usuário autenticado** pode ler e editar processos, clientes, movimentações e peças. O primeiro a se cadastrar vira `admin` automaticamente.

### Etapa 4 — Login por e-mail e senha
- Página `/auth` com abas **Entrar** / **Criar conta**.
- Todas as outras rotas ficam protegidas (sem login → redireciona pra `/auth`).
- Cabeçalho mostra o usuário logado e botão **Sair**.
- Cadastro fica aberto nesta fase para você registrar os 3–5 colegas; depois posso restringir.

### Etapa 5 — Migrar do localStorage para o banco
- Reescrevo `AppContext` usando React Query + cliente Supabase.
- Atualizo `Index`, `ProcessosList`, `ProcessoDetail`, `ClientesList` e os diálogos para ler/gravar no banco — **a UI permanece idêntica** (colunas Relevante/Normal lado a lado, pastas por Estado, etc.).
- Adiciono um botão **"Importar dados locais"** no painel para você subir os processos já cadastrados, se houver.

### Resultado
Ao final, você e seus colegas acessam o mesmo banco de qualquer dispositivo após login, sem nada mudar visualmente.

Aprovando, começo pela Etapa 1 e sigo até o fim.

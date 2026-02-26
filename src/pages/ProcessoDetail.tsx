import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';
import { JURISDICAO_LABELS } from '@/types/process';
import type { Movimentacao, PecaProcessual } from '@/types/process';
import { ArrowLeft, Pencil, Trash2, Plus, Eye, Key, Phone, Globe, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ProcessFormDialog } from '@/components/ProcessFormDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ProcessoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { processos, updateProcesso, deleteProcesso, clientes } = useApp();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showSenha, setShowSenha] = useState(false);

  // Movimentação form
  const [novaMovDesc, setNovaMovDesc] = useState('');

  // Peça form
  const [novaPecaNome, setNovaPecaNome] = useState('');
  const [novaPecaDesc, setNovaPecaDesc] = useState('');

  const processo = processos.find(p => p.id === id);
  if (!processo) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Processo não encontrado.</p>
        <Button variant="link" onClick={() => navigate('/processos')}>Voltar</Button>
      </div>
    );
  }

  const cliente = clientes.find(c => c.id === processo.clienteId);

  const marcarConsulta = () => {
    updateProcesso({ ...processo, dataUltimaConsulta: new Date().toISOString(), atualizadoEm: new Date().toISOString() });
  };

  const addMovimentacao = () => {
    if (!novaMovDesc.trim()) return;
    const mov: Movimentacao = {
      id: crypto.randomUUID(),
      data: new Date().toISOString(),
      descricao: novaMovDesc.trim(),
    };
    updateProcesso({
      ...processo,
      movimentacoes: [mov, ...processo.movimentacoes],
      ultimaMovimentacao: novaMovDesc.trim(),
      dataUltimaMovimentacao: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    });
    setNovaMovDesc('');
  };

  const addPeca = () => {
    if (!novaPecaNome.trim()) return;
    const peca: PecaProcessual = {
      id: crypto.randomUUID(),
      nome: novaPecaNome.trim(),
      descricao: novaPecaDesc.trim(),
      dataJuntada: new Date().toISOString(),
    };
    updateProcesso({
      ...processo,
      pecas: [peca, ...processo.pecas],
      atualizadoEm: new Date().toISOString(),
    });
    setNovaPecaNome('');
    setNovaPecaDesc('');
  };

  const removePeca = (pecaId: string) => {
    updateProcesso({
      ...processo,
      pecas: processo.pecas.filter(p => p.id !== pecaId),
      atualizadoEm: new Date().toISOString(),
    });
  };

  const formatDate = (d: string) => {
    if (!d) return '—';
    try { return format(new Date(d), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }); } catch { return d; }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/processos')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-display">{processo.titulo}</h1>
            <p className="text-sm text-muted-foreground">{processo.numero}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={marcarConsulta} className="gap-2">
            <Eye className="h-4 w-4" />
            Marcar Consulta
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowEdit(true)} className="gap-2">
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowDelete(true)} className="gap-2 text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Jurisdição</p>
            <Badge className="bg-navy text-primary-foreground">{JURISDICAO_LABELS[processo.jurisdicao]}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Relevância</p>
            <Badge variant={processo.relevancia === 'relevante' ? 'destructive' : 'secondary'}>
              {processo.relevancia === 'relevante' ? '⚡ Mais Relevante' : 'Acompanhamento Normal'}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Cliente</p>
            <p className="font-medium">{cliente?.nome || '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Estado</p>
            <p className="font-medium">{processo.estado || '—'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Dates */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Última Movimentação</p>
              <p className="text-sm font-medium">{formatDate(processo.dataUltimaMovimentacao)}</p>
              {processo.ultimaMovimentacao && (
                <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">{processo.ultimaMovimentacao}</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Eye className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Última Consulta</p>
              <p className="text-sm font-medium">{formatDate(processo.dataUltimaConsulta)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Contato da Vara</p>
              <p className="text-sm font-medium">{processo.vara || '—'}</p>
              {processo.telefoneVara && <p className="text-xs text-muted-foreground">{processo.telefoneVara}</p>}
              {processo.contatoVara && <p className="text-xs text-muted-foreground">{processo.contatoVara}</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Access info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Key className="h-4 w-4" />
            Dados de Acesso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Forma de Acesso</p>
              <p className="text-sm">{processo.formaAcesso || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">URL de Acesso</p>
              {processo.urlAcesso ? (
                <a href={processo.urlAcesso} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Acessar
                </a>
              ) : <p className="text-sm">—</p>}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Senha</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono">{showSenha ? processo.senhaAcesso || '—' : '••••••••'}</p>
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setShowSenha(!showSenha)}>
                  {showSenha ? 'Ocultar' : 'Mostrar'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="movimentacoes">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="movimentacoes">Movimentações ({processo.movimentacoes.length})</TabsTrigger>
          <TabsTrigger value="pecas">Peças ({processo.pecas.length})</TabsTrigger>
          <TabsTrigger value="observacoes">Observações</TabsTrigger>
        </TabsList>

        <TabsContent value="movimentacoes" className="mt-4 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Descreva a movimentação..."
              value={novaMovDesc}
              onChange={e => setNovaMovDesc(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addMovimentacao()}
            />
            <Button onClick={addMovimentacao} className="shrink-0 bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {processo.movimentacoes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma movimentação registrada.</p>
          ) : (
            <div className="space-y-2">
              {processo.movimentacoes.map(m => (
                <div key={m.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">{m.descricao}</p>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">{formatDate(m.data)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pecas" className="mt-4 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nome da peça..."
              value={novaPecaNome}
              onChange={e => setNovaPecaNome(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Descrição (opcional)"
              value={novaPecaDesc}
              onChange={e => setNovaPecaDesc(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addPeca} className="shrink-0 bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {processo.pecas.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma peça registrada.</p>
          ) : (
            <div className="space-y-2">
              {processo.pecas.map(p => (
                <div key={p.id} className="rounded-lg border p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{p.nome}</p>
                    {p.descricao && <p className="text-xs text-muted-foreground">{p.descricao}</p>}
                    <span className="text-xs text-muted-foreground">{formatDate(p.dataJuntada)}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removePeca(p.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="observacoes" className="mt-4">
          <Textarea
            placeholder="Adicione observações sobre o processo..."
            value={processo.observacoes}
            onChange={e => updateProcesso({ ...processo, observacoes: e.target.value, atualizadoEm: new Date().toISOString() })}
            className="min-h-[200px]"
          />
        </TabsContent>
      </Tabs>

      <ProcessFormDialog open={showEdit} onOpenChange={setShowEdit} processo={processo} />

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir processo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{processo.titulo}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { deleteProcesso(processo.id); navigate('/processos'); }}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProcessoDetail;

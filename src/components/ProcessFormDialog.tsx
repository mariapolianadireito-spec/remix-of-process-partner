import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import type { Processo, Jurisdicao, Relevancia } from '@/types/process';
import { ESTADOS_BRASIL } from '@/types/process';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  processo?: Processo;
}

const emptyProcesso = (): Omit<Processo, 'id' | 'criadoEm' | 'atualizadoEm'> => ({
  numero: '',
  titulo: '',
  clienteId: '',
  jurisdicao: 'estadual',
  estado: 'SP',
  relevancia: 'normal',
  vara: '',
  contatoVara: '',
  telefoneVara: '',
  formaAcesso: '',
  senhaAcesso: '',
  urlAcesso: '',
  ultimaMovimentacao: '',
  dataUltimaMovimentacao: '',
  dataUltimaConsulta: '',
  observacoes: '',
  movimentacoes: [],
  pecas: [],
});

export function ProcessFormDialog({ open, onOpenChange, processo }: Props) {
  const { addProcesso, updateProcesso, clientes } = useApp();
  const [form, setForm] = useState(emptyProcesso());

  useEffect(() => {
    if (processo) {
      const { id, criadoEm, atualizadoEm, ...rest } = processo;
      setForm(rest);
    } else {
      setForm(emptyProcesso());
    }
  }, [processo, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    if (processo) {
      updateProcesso({ ...processo, ...form, atualizadoEm: now });
    } else {
      addProcesso({
        ...form,
        id: crypto.randomUUID(),
        criadoEm: now,
        atualizadoEm: now,
      } as Processo);
    }
    onOpenChange(false);
  };

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {processo ? 'Editar Processo' : 'Novo Processo'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input id="titulo" value={form.titulo} onChange={e => set('titulo', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero">Número do Processo *</Label>
              <Input id="numero" value={form.numero} onChange={e => set('numero', e.target.value)} required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={form.clienteId} onValueChange={v => set('clienteId', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {clientes.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Jurisdição</Label>
              <Select value={form.jurisdicao} onValueChange={v => set('jurisdicao', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="federal">Justiça Federal</SelectItem>
                  <SelectItem value="estadual">Justiça Estadual</SelectItem>
                  <SelectItem value="trabalhista">Justiça do Trabalho</SelectItem>
                  <SelectItem value="administrativo">Proc. Administrativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={form.estado} onValueChange={v => set('estado', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ESTADOS_BRASIL.map(uf => (
                    <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Relevância</Label>
            <Select value={form.relevancia} onValueChange={v => set('relevancia', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="relevante">⚡ Mais Relevante</SelectItem>
                <SelectItem value="normal">Acompanhamento Normal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="vara">Vara</Label>
              <Input id="vara" value={form.vara} onChange={e => set('vara', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contatoVara">Contato/Assessoria</Label>
              <Input id="contatoVara" value={form.contatoVara} onChange={e => set('contatoVara', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefoneVara">Telefone da Vara</Label>
              <Input id="telefoneVara" value={form.telefoneVara} onChange={e => set('telefoneVara', e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="formaAcesso">Forma de Acesso</Label>
              <Input id="formaAcesso" value={form.formaAcesso} onChange={e => set('formaAcesso', e.target.value)} placeholder="Ex: PJe, e-SAJ, SEI..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="urlAcesso">URL de Acesso</Label>
              <Input id="urlAcesso" value={form.urlAcesso} onChange={e => set('urlAcesso', e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senhaAcesso">Senha de Acesso</Label>
              <Input id="senhaAcesso" type="password" value={form.senhaAcesso} onChange={e => set('senhaAcesso', e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ultimaMovimentacao">Última Movimentação</Label>
            <Textarea id="ultimaMovimentacao" value={form.ultimaMovimentacao} onChange={e => set('ultimaMovimentacao', e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
              {processo ? 'Salvar Alterações' : 'Cadastrar Processo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

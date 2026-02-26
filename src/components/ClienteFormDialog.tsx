import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import type { Cliente } from '@/types/process';
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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente?: Cliente | null;
}

export function ClienteFormDialog({ open, onOpenChange, cliente }: Props) {
  const { addCliente, updateCliente } = useApp();
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', documento: '', observacoes: '' });

  useEffect(() => {
    if (cliente) {
      setForm({ nome: cliente.nome, email: cliente.email, telefone: cliente.telefone, documento: cliente.documento, observacoes: cliente.observacoes });
    } else {
      setForm({ nome: '', email: '', telefone: '', documento: '', observacoes: '' });
    }
  }, [cliente, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cliente) {
      updateCliente({ ...cliente, ...form });
    } else {
      addCliente({
        ...form,
        id: crypto.randomUUID(),
        criadoEm: new Date().toISOString(),
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {cliente ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="documento">CPF/CNPJ</Label>
              <Input id="documento" value={form.documento} onChange={e => setForm(f => ({ ...f, documento: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="obs">Observações</Label>
            <Textarea id="obs" value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
              {cliente ? 'Salvar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

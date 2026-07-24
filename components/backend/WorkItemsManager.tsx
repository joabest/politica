"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, CircleDashed, Clock3, Loader2, Plus, Search, Trash2, X } from "lucide-react";
import { createWorkItem, deleteWorkItem, listWorkItems, updateWorkItem, type WorkItem } from "@/lib/data-store";
import { createClient } from "@/lib/supabase/client";

const statuses: Array<{ key: WorkItem["status"]; label: string; icon: typeof CircleDashed }> = [
  { key: "backlog", label: "Backlog", icon: CircleDashed },
  { key: "em_andamento", label: "Em andamento", icon: Clock3 },
  { key: "revisao", label: "Em revisão", icon: Search },
  { key: "concluido", label: "Concluído", icon: CheckCircle2 },
];

export default function WorkItemsManager() {
  const connected = Boolean(createClient());
  const [items, setItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try { setItems(await listWorkItems()); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Não foi possível carregar as tarefas."); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    queueMicrotask(()=>void load());
    const handler = () => void load();
    window.addEventListener("arcanum:campaign-changed", handler);
    return () => window.removeEventListener("arcanum:campaign-changed", handler);
  }, []);

  const filtered = useMemo(() => items.filter((item) =>
    `${item.title} ${item.description} ${item.category} ${item.assignee}`.toLowerCase().includes(query.toLowerCase()),
  ), [items, query]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await createWorkItem({
        title: String(form.get("title")),
        description: String(form.get("description") || ""),
        status: String(form.get("status")) as WorkItem["status"],
        priority: String(form.get("priority")) as WorkItem["priority"],
        due_date: String(form.get("due_date") || "") || null,
        assignee: String(form.get("assignee") || "Equipe"),
        category: String(form.get("category") || "Planejamento"),
      });
      setOpen(false);
      await load();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Erro ao salvar."); }
    finally { setSaving(false); }
  }

  async function move(id: string, status: WorkItem["status"]) {
    try {
      await updateWorkItem(id, { status });
      setItems((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Erro ao atualizar tarefa."); }
  }

  async function remove(id: string) {
    if (!confirm("Excluir esta tarefa?")) return;
    try {
      await deleteWorkItem(id);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Erro ao excluir tarefa."); }
  }

  return <>
    <section className="page-hero mb-6">
      <div><span className="eyebrow">OPERAÇÃO</span><h1>Planejamento e execução</h1><p>Tarefas vinculadas automaticamente à campanha selecionada no topo.</p></div>
      <div className="flex gap-2 flex-wrap"><span className="badge">{connected ? "Supabase conectado" : "Persistência local"}</span><button className="btn flex items-center gap-2" onClick={()=>setOpen(true)}><Plus size={17}/> Nova tarefa</button></div>
    </section>
    <div className="card p-4 mb-5 flex items-center gap-3"><Search size={18} className="muted"/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Buscar tarefa, categoria ou responsável..." className="flex-1 bg-transparent outline-none"/><span className="badge">{filtered.length} itens</span></div>
    {error && <div className="error-banner mb-5">{error}</div>}
    {loading ? <div className="card p-14 grid place-items-center"><Loader2 className="animate-spin"/></div> :
      <div className="kanban-grid">{statuses.map(({key,label,icon:Icon})=><section className="kanban-column" key={key}>
        <header><div className="flex items-center gap-2"><Icon size={17}/><b>{label}</b></div><span>{filtered.filter((item)=>item.status===key).length}</span></header>
        <div className="space-y-3">{filtered.filter((item)=>item.status===key).map((item)=><article className="work-card" key={item.id}>
          <div className="flex justify-between gap-2"><span className={`priority priority-${item.priority}`}>{item.priority}</span><button className="delete-mini" onClick={()=>void remove(item.id)} aria-label="Excluir"><Trash2 size={14}/></button></div>
          <h3>{item.title}</h3><p>{item.description || "Sem descrição."}</p>
          <div className="work-meta"><span>{item.category}</span><span>{item.assignee}</span></div>
          <select value={item.status} onChange={(e)=>void move(item.id,e.target.value as WorkItem["status"])}>{statuses.map((status)=><option key={status.key} value={status.key}>{status.label}</option>)}</select>
        </article>)}</div>
      </section>)}</div>}
    {open && <div className="modal-backdrop" onMouseDown={()=>setOpen(false)}><form className="modal-card" onSubmit={submit} onMouseDown={(e)=>e.stopPropagation()}>
      <div className="flex items-start justify-between"><div><h2>Nova tarefa</h2><p>A tarefa será vinculada à campanha ativa.</p></div><button type="button" className="icon-btn" onClick={()=>setOpen(false)}><X size={18}/></button></div>
      <label>Título<input name="title" required placeholder="Ex.: Preparar roteiro de entrevista"/></label>
      <label>Descrição<textarea name="description" rows={3} placeholder="Contexto, entrega esperada e observações."/></label>
      <div className="form-grid"><label>Status<select name="status" defaultValue="backlog">{statuses.map((status)=><option key={status.key} value={status.key}>{status.label}</option>)}</select></label><label>Prioridade<select name="priority" defaultValue="media"><option value="baixa">Baixa</option><option value="media">Média</option><option value="alta">Alta</option><option value="critica">Crítica</option></select></label></div>
      <div className="form-grid"><label>Responsável<input name="assignee" defaultValue="Equipe"/></label><label>Categoria<input name="category" defaultValue="Planejamento"/></label></div>
      <label>Prazo<input name="due_date" type="date"/></label>
      <button disabled={saving} className="btn flex items-center justify-center gap-2">{saving&&<Loader2 className="animate-spin" size={17}/>} Salvar tarefa</button>
    </form></div>}
  </>;
}

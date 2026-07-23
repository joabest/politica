import { createClient } from "@/lib/supabase/client";

export type WorkItem = {
  id: string;
  title: string;
  description: string;
  status: "backlog" | "em_andamento" | "revisao" | "concluido";
  priority: "baixa" | "media" | "alta" | "critica";
  due_date: string | null;
  assignee: string;
  category: string;
  created_at: string;
};

const STORAGE_KEY = "arcanum-work-items-v1";
const demoItems: WorkItem[] = [
  { id: "demo-1", title: "Revisar calendário editorial", description: "Validar temas, formatos e responsáveis da próxima semana.", status: "em_andamento", priority: "alta", due_date: null, assignee: "Equipe de conteúdo", category: "Conteúdo", created_at: new Date().toISOString() },
  { id: "demo-2", title: "Preparar briefing de entrevista", description: "Organizar evidências, mensagens-chave e perguntas críticas.", status: "revisao", priority: "media", due_date: null, assignee: "Comunicação", category: "Imprensa", created_at: new Date().toISOString() },
  { id: "demo-3", title: "Atualizar radar de temas", description: "Reavaliar cobertura, risco e oportunidades temáticas.", status: "backlog", priority: "media", due_date: null, assignee: "Estratégia", category: "Análise", created_at: new Date().toISOString() },
];

function localItems() {
  if (typeof window === "undefined") return demoItems;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoItems));
    return demoItems;
  }
  try { return JSON.parse(stored) as WorkItem[]; } catch { return demoItems; }
}

export async function listWorkItems(): Promise<WorkItem[]> {
  const supabase = createClient();
  if (!supabase) return localItems();
  const { data, error } = await supabase.from("work_items").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as WorkItem[];
}

export async function createWorkItem(input: Omit<WorkItem, "id" | "created_at">) {
  const supabase = createClient();
  if (!supabase) {
    const item: WorkItem = { ...input, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([item, ...localItems()]));
    return item;
  }
  const { data, error } = await supabase.from("work_items").insert(input).select().single();
  if (error) throw error;
  return data as WorkItem;
}

export async function updateWorkItem(id: string, changes: Partial<WorkItem>) {
  const supabase = createClient();
  if (!supabase) {
    const next = localItems().map((item) => item.id === id ? { ...item, ...changes } : item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return;
  }
  const { error } = await supabase.from("work_items").update(changes).eq("id", id);
  if (error) throw error;
}

export async function deleteWorkItem(id: string) {
  const supabase = createClient();
  if (!supabase) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localItems().filter((item) => item.id !== id)));
    return;
  }
  const { error } = await supabase.from("work_items").delete().eq("id", id);
  if (error) throw error;
}

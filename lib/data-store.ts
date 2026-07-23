import { createClient } from "@/lib/supabase/client";
import { getActiveCampaignId } from "@/lib/campaign-store";

export type WorkItem = {
  id: string;
  campaign_id: string;
  title: string;
  description: string;
  status: "backlog" | "em_andamento" | "revisao" | "concluido";
  priority: "baixa" | "media" | "alta" | "critica";
  due_date: string | null;
  assignee: string;
  category: string;
  created_at: string;
};

const STORAGE_KEY = "arcanum-work-items-v2";
const active = () => getActiveCampaignId() || "demo-campaign-1";

function localItems(): WorkItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as WorkItem[]; }
  catch { return []; }
}

function saveLocal(items: WorkItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function listWorkItems(): Promise<WorkItem[]> {
  const campaign_id = active();
  const supabase = createClient();
  if (!supabase) return localItems().filter((item) => item.campaign_id === campaign_id);
  const { data, error } = await supabase.from("work_items").select("*").eq("campaign_id", campaign_id).order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as WorkItem[];
}

export async function createWorkItem(input: Omit<WorkItem, "id" | "created_at" | "campaign_id">) {
  const campaign_id = active();
  const supabase = createClient();
  if (!supabase) {
    const item: WorkItem = { ...input, id: crypto.randomUUID(), campaign_id, created_at: new Date().toISOString() };
    saveLocal([item, ...localItems()]);
    return item;
  }
  const { data, error } = await supabase.from("work_items").insert({ ...input, campaign_id }).select().single();
  if (error) throw error;
  return data as WorkItem;
}

export async function updateWorkItem(id: string, changes: Partial<Omit<WorkItem, "campaign_id">>) {
  const supabase = createClient();
  if (!supabase) {
    saveLocal(localItems().map((item) => item.id === id ? { ...item, ...changes } : item));
    return;
  }
  const { error } = await supabase.from("work_items").update(changes).eq("id", id);
  if (error) throw error;
}

export async function deleteWorkItem(id: string) {
  const supabase = createClient();
  if (!supabase) {
    saveLocal(localItems().filter((item) => item.id !== id));
    return;
  }
  const { error } = await supabase.from("work_items").delete().eq("id", id);
  if (error) throw error;
}

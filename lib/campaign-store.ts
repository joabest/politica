import { createClient } from "@/lib/supabase/client";

export type CampaignStatus = "planejamento" | "ativa" | "pausada" | "encerrada";

export type Campaign = {
  id: string;
  name: string;
  candidate_name: string;
  office: string;
  party: string;
  city: string;
  state: string;
  election_year: number;
  slogan: string;
  status: CampaignStatus;
  primary_color: string;
  secondary_color: string;
  created_at: string;
  updated_at?: string;
};

const STORAGE_KEY = "arcanum-campaigns-v1";
const ACTIVE_KEY = "arcanum-active-campaign-v1";

const demoCampaigns: Campaign[] = [
  {
    id: "demo-campaign-1",
    name: "Projeto Santo André 2028",
    candidate_name: "Ana Carolina Serra",
    office: "Prefeita",
    party: "",
    city: "Santo André",
    state: "SP",
    election_year: 2028,
    slogan: "Cuidar da nossa gente",
    status: "planejamento",
    primary_color: "#6d5dfc",
    secondary_color: "#13c6b3",
    created_at: new Date().toISOString(),
  },
];

function localCampaigns(): Campaign[] {
  if (typeof window === "undefined") return demoCampaigns;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoCampaigns));
    return demoCampaigns;
  }
  try { return JSON.parse(stored) as Campaign[]; } catch { return demoCampaigns; }
}

export function getActiveCampaignId() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveCampaignId(id: string) {
  if (typeof window !== "undefined") localStorage.setItem(ACTIVE_KEY, id);
  window.dispatchEvent(new CustomEvent("arcanum:campaign-changed", { detail: id }));
}

export async function listCampaigns(): Promise<Campaign[]> {
  const supabase = createClient();
  if (!supabase) return localCampaigns();
  const { data, error } = await supabase.from("campaigns").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as Campaign[];
}

export async function createCampaign(input: Omit<Campaign, "id" | "created_at" | "updated_at">) {
  const supabase = createClient();
  if (!supabase) {
    const item: Campaign = { ...input, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([item, ...localCampaigns()]));
    return item;
  }
  const { data, error } = await supabase.from("campaigns").insert(input).select().single();
  if (error) throw error;
  return data as Campaign;
}

export async function updateCampaign(id: string, changes: Partial<Campaign>) {
  const supabase = createClient();
  if (!supabase) {
    const next = localCampaigns().map((item) => item.id === id ? { ...item, ...changes, updated_at: new Date().toISOString() } : item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return;
  }
  const { error } = await supabase.from("campaigns").update(changes).eq("id", id);
  if (error) throw error;
}

export async function deleteCampaign(id: string) {
  const supabase = createClient();
  if (!supabase) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localCampaigns().filter((item) => item.id !== id)));
    return;
  }
  const { error } = await supabase.from("campaigns").delete().eq("id", id);
  if (error) throw error;
}

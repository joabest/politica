import { createClient } from "@/lib/supabase/client";
import { getActiveCampaignId } from "@/lib/campaign-store";

export type CalendarEventType = "agenda" | "prazo" | "conteudo" | "reuniao" | "evento";
export type CalendarEventStatus = "planejado" | "confirmado" | "concluido" | "cancelado";
export type CalendarEvent = {
  id:string; campaign_id:string; title:string; description:string; event_type:CalendarEventType;
  status:CalendarEventStatus; starts_at:string; ends_at:string|null; location:string; responsible:string;
  created_at:string;
};

const KEY="arcanum-calendar-events-v1";
const active=()=>getActiveCampaignId()||"demo-campaign-1";
function read():CalendarEvent[]{if(typeof window==="undefined")return[];try{return JSON.parse(localStorage.getItem(KEY)||"[]") as CalendarEvent[]}catch{return[]}}
function write(data:CalendarEvent[]){localStorage.setItem(KEY,JSON.stringify(data))}

export async function listCalendarEvents(){const campaign_id=active();const s=createClient();if(!s)return read().filter(x=>x.campaign_id===campaign_id).sort((a,b)=>a.starts_at.localeCompare(b.starts_at));const{data,error}=await s.from("campaign_events").select("*").eq("campaign_id",campaign_id).order("starts_at",{ascending:true});if(error)throw error;return(data||[]) as CalendarEvent[]}
export async function saveCalendarEvent(input:Omit<CalendarEvent,"id"|"campaign_id"|"created_at">,id?:string){const campaign_id=active();const s=createClient();if(!s){const all=read();if(id)write(all.map(x=>x.id===id?{...x,...input}:x));else write([...all,{...input,id:crypto.randomUUID(),campaign_id,created_at:new Date().toISOString()}]);return}const payload={...input,campaign_id};const q=id?s.from("campaign_events").update(payload).eq("id",id):s.from("campaign_events").insert(payload);const{error}=await q;if(error)throw error}
export async function deleteCalendarEvent(id:string){const s=createClient();if(!s){write(read().filter(x=>x.id!==id));return}const{error}=await s.from("campaign_events").delete().eq("id",id);if(error)throw error}

import { createClient } from "@/lib/supabase/client";
import { getActiveCampaignId } from "@/lib/campaign-store";

export type CandidateStatus = "pre_candidato" | "candidato" | "mandato" | "inativo";
export type Candidate = { id:string; campaign_id:string; full_name:string; public_name:string; office:string; party:string; number:string; city:string; state:string; bio:string; slogan:string; instagram:string; phone:string; email:string; status:CandidateStatus; photo_url:string; strengths:string; risks:string; created_at:string };
export type TeamMember = { id:string; campaign_id:string; full_name:string; role:string; area:string; email:string; phone:string; status:"ativo"|"convidado"|"inativo"; notes:string; created_at:string };

const CANDIDATES_KEY="arcanum-candidates-v1", TEAM_KEY="arcanum-team-v1";
const active=()=>getActiveCampaignId()||"demo-campaign-1";
function read<T>(key:string):T[]{ if(typeof window==="undefined")return[]; try{return JSON.parse(localStorage.getItem(key)||"[]") as T[]}catch{return[]} }
function write<T>(key:string,data:T[]){localStorage.setItem(key,JSON.stringify(data))}

export async function listCandidates(){const campaign_id=active();const s=createClient();if(!s)return read<Candidate>(CANDIDATES_KEY).filter(x=>x.campaign_id===campaign_id);const {data,error}=await s.from("candidates").select("*").eq("campaign_id",campaign_id).order("created_at",{ascending:false});if(error)throw error;return(data||[]) as Candidate[]}
export async function saveCandidate(input:Omit<Candidate,"id"|"created_at"|"campaign_id">,id?:string){const campaign_id=active();const s=createClient();if(!s){const all=read<Candidate>(CANDIDATES_KEY);if(id)write(CANDIDATES_KEY,all.map(x=>x.id===id?{...x,...input}:x));else write(CANDIDATES_KEY,[{...input,id:crypto.randomUUID(),campaign_id,created_at:new Date().toISOString()},...all]);return}const payload={...input,campaign_id};const q=id?s.from("candidates").update(payload).eq("id",id):s.from("candidates").insert(payload);const {error}=await q;if(error)throw error}
export async function deleteCandidate(id:string){const s=createClient();if(!s){write(CANDIDATES_KEY,read<Candidate>(CANDIDATES_KEY).filter(x=>x.id!==id));return}const{error}=await s.from("candidates").delete().eq("id",id);if(error)throw error}

export async function listTeam(){const campaign_id=active();const s=createClient();if(!s)return read<TeamMember>(TEAM_KEY).filter(x=>x.campaign_id===campaign_id);const {data,error}=await s.from("campaign_team").select("*").eq("campaign_id",campaign_id).order("created_at",{ascending:false});if(error)throw error;return(data||[]) as TeamMember[]}
export async function saveTeamMember(input:Omit<TeamMember,"id"|"created_at"|"campaign_id">,id?:string){const campaign_id=active();const s=createClient();if(!s){const all=read<TeamMember>(TEAM_KEY);if(id)write(TEAM_KEY,all.map(x=>x.id===id?{...x,...input}:x));else write(TEAM_KEY,[{...input,id:crypto.randomUUID(),campaign_id,created_at:new Date().toISOString()},...all]);return}const payload={...input,campaign_id};const q=id?s.from("campaign_team").update(payload).eq("id",id):s.from("campaign_team").insert(payload);const{error}=await q;if(error)throw error}
export async function deleteTeamMember(id:string){const s=createClient();if(!s){write(TEAM_KEY,read<TeamMember>(TEAM_KEY).filter(x=>x.id!==id));return}const{error}=await s.from("campaign_team").delete().eq("id",id);if(error)throw error}

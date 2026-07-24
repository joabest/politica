"use client";
import {useEffect,useState} from "react";
import {EyeOff,KeyRound,Plus,Save,ShieldCheck,Trash2,Users} from "lucide-react";

export type Permission="all_modules"|"manage_users"|"view_logs"|"settings"|"radar"|"library"|"reports"|"content";
type Member={id:string;email:string;name:string;active:boolean;permissions:Permission[]};
const KEY="arcanum:access-control";
const ADMIN="joab@admin.com";
const options:[Permission,string][]=[["all_modules","Acessar todos os módulos"],["manage_users","Editar usuários e permissões"],["view_logs","Visualizar logs de atividade"],["settings","Acessar configurações administrativas"],["radar","Acessar Radar Político"],["library","Acessar Biblioteca"],["reports","Acessar Relatórios"],["content","Editar conteúdo e marketing"]];
function read():Member[]{if(typeof window==="undefined")return[];try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return[]}}
export function getCurrentAccess(email?:string|null){if((email||"").toLowerCase()===ADMIN)return{admin:true,permissions:["all_modules","manage_users","view_logs","settings","radar","library","reports","content"] as Permission[]};const all=read(),member=all.find(x=>x.email.toLowerCase()===(email||"").toLowerCase());if(!member)return{admin:false,permissions:["all_modules"] as Permission[]};return{admin:false,permissions:member.active?member.permissions:[]}}

export default function AccessManager(){
 const[members,setMembers]=useState<Member[]>([]),[email,setEmail]=useState(""),[name,setName]=useState(""),[saved,setSaved]=useState("");
 useEffect(()=>setMembers(read()),[]);
 function persist(next:Member[]){setMembers(next);localStorage.setItem(KEY,JSON.stringify(next));window.dispatchEvent(new Event("arcanum:permissions-changed"));setSaved("Permissões atualizadas.");setTimeout(()=>setSaved(""),1800)}
 function add(){if(!email.trim())return;persist([...members,{id:crypto.randomUUID(),email:email.trim().toLowerCase(),name:name.trim()||email.split("@")[0],active:true,permissions:["radar"]}]);setEmail("");setName("")}
 function toggle(id:string,p:Permission){persist(members.map(m=>m.id===id?{...m,permissions:m.permissions.includes(p)?m.permissions.filter(x=>x!==p):[...m.permissions,p]}:m))}
 return <div className="space-y-5">
  <section className="card p-6"><div className="flex items-start gap-4"><div className="metric-icon"><ShieldCheck/></div><div><h2 className="font-black text-xl">Controle de acesso</h2><p className="muted text-sm mt-1">O administrador <b>{ADMIN}</b> decide quais módulos e funções cada usuário pode utilizar.</p></div></div><div className="mt-5 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm flex gap-3"><EyeOff size={18} className="shrink-0"/><p>Senhas nunca podem ser visualizadas. O Supabase armazena hashes irreversíveis. O administrador pode enviar redefinição de senha, bloquear acesso e consultar logs, mas não ler a senha atual.</p></div></section>
  <section className="card p-6"><div className="flex items-center gap-2 mb-4"><Plus size={18}/><h3 className="font-bold">Adicionar usuário à equipe</h3></div><div className="grid md:grid-cols-[1fr_1fr_auto] gap-3"><input className="input" placeholder="Nome" value={name} onChange={e=>setName(e.target.value)}/><input className="input" type="email" placeholder="email@dominio.com" value={email} onChange={e=>setEmail(e.target.value)}/><button className="primary-btn justify-center" onClick={add}><Users size={17}/> Adicionar</button></div>{saved&&<p className="text-emerald-500 text-sm mt-3">{saved}</p>}</section>
  <section className="space-y-4">{members.map(member=><article className="card p-5" key={member.id}><div className="flex flex-col md:flex-row md:items-center justify-between gap-3"><div><h3 className="font-bold">{member.name}</h3><p className="muted text-sm">{member.email}</p></div><div className="flex gap-2"><button className="secondary-btn" onClick={()=>persist(members.map(m=>m.id===member.id?{...m,active:!m.active}:m))}>{member.active?"Bloquear":"Reativar"}</button><button className="icon-btn danger" onClick={()=>persist(members.filter(m=>m.id!==member.id))}><Trash2 size={16}/></button></div></div><div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-2 mt-5">{options.map(([key,label])=><label key={key} className="permission-option"><input type="checkbox" checked={member.permissions.includes(key)} onChange={()=>toggle(member.id,key)}/><span>{label}</span></label>)}</div><div className="flex flex-wrap gap-2 mt-4"><button className="secondary-btn"><KeyRound size={16}/> Enviar redefinição de senha</button><button className="secondary-btn"><Save size={16}/> Registrar alteração</button></div></article>)}{!members.length&&<div className="card p-10 text-center muted">Nenhum usuário adicional configurado.</div>}</section>
 </div>
}

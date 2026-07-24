"use client";

import {ChangeEvent,useEffect,useMemo,useRef,useState} from "react";
import {AlertTriangle,BarChart3,Clock3,Download,ExternalLink,FileUp,Lightbulb,Loader2,Plus,Radio,ScanSearch,Star,Trash2,Upload} from "lucide-react";

type Candidate={id:string;name:string;party:string;office:string;city:string;state:string;aliases:string[];keywords:string[];isPrimary:boolean};
type Tone="positivo"|"neutro"|"negativo"|"não analisado";
type NewsItem={id:string;candidateId:string;title:string;description:string;source:string;url:string;publishedAt:string;tone:Tone;confidence:number;summary:string;theme:string;reason:string};
type RadarNotification={id:string;type:"radar-negative";title:string;message:string;createdAt:string;read:boolean;href:string;newsId:string;candidateId:string};
type Period="1h"|"24h"|"3d"|"7d";

const CANDIDATES_KEY="arcanum:radar:candidates";
const NEWS_KEY="arcanum:radar:news";
const NOTIFICATIONS_KEY="arcanum:notifications";
const periods:[Period,string][]=[["1h","Última hora"],["24h","24 horas"],["3d","3 dias"],["7d","7 dias"]];
const emptyCandidate:Candidate={id:"",name:"",party:"",office:"",city:"",state:"SP",aliases:[],keywords:[],isPrimary:false};

function split(value:string){return value.split(/[;,]/).map(x=>x.trim()).filter(Boolean)}
function uid(){return crypto.randomUUID()}
function date(value:string){return new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short"}).format(new Date(value))}
function toneClass(tone:Tone){return tone==="positivo"?"text-emerald-600":tone==="negativo"?"text-red-600":tone==="neutro"?"text-amber-600":"muted"}
function loadNotifications():RadarNotification[]{try{return JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY)||"[]")}catch{return[]}}

export default function PoliticalRadar(){
 const[candidates,setCandidates]=useState<Candidate[]>([]),[news,setNews]=useState<NewsItem[]>([]),[form,setForm]=useState(emptyCandidate),[period,setPeriod]=useState<Period>("7d"),[selected,setSelected]=useState("all"),[loading,setLoading]=useState(false),[error,setError]=useState(""),[status,setStatus]=useState("");
 const fileRef=useRef<HTMLInputElement>(null);
 useEffect(()=>{try{setCandidates(JSON.parse(localStorage.getItem(CANDIDATES_KEY)||"[]"));setNews(JSON.parse(localStorage.getItem(NEWS_KEY)||"[]"))}catch{}},[]);
 useEffect(()=>{localStorage.setItem(CANDIDATES_KEY,JSON.stringify(candidates))},[candidates]);
 useEffect(()=>{localStorage.setItem(NEWS_KEY,JSON.stringify(news))},[news]);
 const primary=candidates.find(x=>x.isPrimary);
 const filtered=useMemo(()=>news.filter(x=>selected==="all"||x.candidateId===selected),[news,selected]);
 const stats=useMemo(()=>candidates.map(c=>{const items=news.filter(n=>n.candidateId===c.id);return{...c,total:items.length,positive:items.filter(n=>n.tone==="positivo").length,neutral:items.filter(n=>n.tone==="neutro").length,negative:items.filter(n=>n.tone==="negativo").length}}),[candidates,news]);

 function saveCandidate(){
  if(!form.name.trim())return setError("Informe o nome do candidato.");
  if(candidates.length>=21)return setError("Limite de 1 candidato principal e 20 monitorados atingido.");
  const isFirst=candidates.length===0;
  const item={...form,id:uid(),name:form.name.trim(),isPrimary:isFirst||form.isPrimary};
  setCandidates(prev=>[...prev.map(x=>item.isPrimary?{...x,isPrimary:false}:x),item]);setForm(emptyCandidate);setError("");
 }
 function removeCandidate(id:string){setCandidates(x=>x.filter(c=>c.id!==id));setNews(x=>x.filter(n=>n.candidateId!==id))}
 function makePrimary(id:string){setCandidates(x=>x.map(c=>({...c,isPrimary:c.id===id})))}
 function parseImport(text:string){
  const lines=text.replace(/^\uFEFF/,"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean);if(!lines.length)return[];
  const delimiter=lines[0].includes(";")?";":lines[0].includes(",")?",":"|";
  const header=lines[0].toLowerCase();const hasHeader=header.includes("nome")||header.includes("name");
  return lines.slice(hasHeader?1:0).map(line=>{const p=line.split(delimiter).map(x=>x.replace(/^"|"$/g,"").trim());return{id:uid(),name:p[0]||"",party:p[1]||"",office:p[2]||"",city:p[3]||"",state:p[4]||"",aliases:split(p[5]||""),keywords:split(p[6]||""),isPrimary:false} as Candidate}).filter(x=>x.name);
 }
 async function importFile(e:ChangeEvent<HTMLInputElement>){const file=e.target.files?.[0];if(!file)return;const imported=parseImport(await file.text());const available=Math.max(0,21-candidates.length);setCandidates(prev=>[...prev,...imported.slice(0,available)]);setStatus(`${Math.min(imported.length,available)} candidato(s) importado(s).`);e.target.value=""}
 function createCompetitorAlerts(items:NewsItem[],oldIds:Set<string>){
  const competitorIds=new Set(candidates.filter(c=>!c.isPrimary).map(c=>c.id));
  const negatives=items.filter(n=>n.tone==="negativo"&&competitorIds.has(n.candidateId)&&!oldIds.has(n.id));
  if(!negatives.length)return 0;
  const existing=loadNotifications();const existingNews=new Set(existing.map(n=>n.newsId));
  const created=negatives.filter(n=>!existingNews.has(n.id)).map(n=>{const candidate=candidates.find(c=>c.id===n.candidateId);return{id:`radar-${n.id}`,type:"radar-negative" as const,title:`Alerta sobre ${candidate?.name||"concorrente"}`,message:`Cobertura negativa detectada: ${n.title}`,createdAt:new Date().toISOString(),read:false,href:`/clipping?news=${encodeURIComponent(n.id)}`,newsId:n.id,candidateId:n.candidateId}});
  if(created.length){localStorage.setItem(NOTIFICATIONS_KEY,JSON.stringify([...created,...existing].slice(0,100)));window.dispatchEvent(new Event("arcanum:notifications-changed"));}
  return created.length;
 }
 async function scan(){
  if(!candidates.length)return setError("Cadastre ou importe candidatos antes de escanear.");
  setLoading(true);setError("");setStatus("Buscando e analisando notícias...");
  try{const targets=selected==="all"?candidates:candidates.filter(x=>x.id===selected);const response=await fetch("/api/radar/scan",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({candidates:targets,period})});const data=await response.json();if(!response.ok)throw new Error(data.error||"Falha no scan.");const items=(data.items||[]) as NewsItem[];const oldIds=new Set(news.map(x=>x.id));const ids=new Set(targets.map(x=>x.id));setNews(prev=>[...items,...prev.filter(x=>!ids.has(x.candidateId))]);const alerts=createCompetitorAlerts(items,oldIds);setStatus(`${items.length} notícia(s) encontradas. ${data.analyzed?"Análise por IA concluída.":"Configure GROQ_API_KEY para ativar a análise por IA."}${alerts?` ${alerts} alerta(s) novo(s) criado(s).`:""}`)}catch(e){setError(e instanceof Error?e.message:"Erro ao executar o scan.")}finally{setLoading(false)}
 }
 function exportCsv(){const rows=[["Candidato","Título","Fonte","Data","Tom","Confiança","Resumo","Tema","URL"],...filtered.map(n=>[candidates.find(c=>c.id===n.candidateId)?.name||"",n.title,n.source,n.publishedAt,n.tone,n.confidence,n.summary,n.theme,n.url])];const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(";")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}));a.download="radar-politico.csv";a.click();URL.revokeObjectURL(a.href)}
 function contrastText(n:NewsItem){const subject=n.theme||"o tema citado";return `Pauta sugerida: explicar, com propostas e dados verificáveis, como ${primary?.name||"o candidato principal"} pretende agir de forma diferente em ${subject}. Evite repetir acusações não confirmadas, ataques pessoais ou conclusões que a matéria não sustente.`}

 return <div className="space-y-6">
  <section className="page-hero flex flex-col xl:flex-row xl:items-center justify-between gap-5"><div><span className="eyebrow">INTELIGÊNCIA DE MÍDIA</span><h1>Radar Político</h1><p>Monitore seu candidato e compare a cobertura de até 20 concorrentes.</p></div><div className="flex flex-wrap gap-2"><button className="secondary-btn" onClick={()=>fileRef.current?.click()}><FileUp size={17}/> Importar CSV/TXT</button><input ref={fileRef} type="file" accept=".csv,.txt,text/csv,text/plain" className="hidden" onChange={importFile}/><button className="secondary-btn" onClick={exportCsv}><Download size={17}/> Exportar</button><button className="primary-btn" onClick={scan} disabled={loading}>{loading?<Loader2 className="animate-spin" size={17}/>:<ScanSearch size={17}/>} Escanear</button></div></section>
  {error&&<div className="error-banner">{error}</div>}{status&&<div className="card p-4 text-sm">{status}</div>}
  <section className="card p-5"><div className="flex flex-col lg:flex-row lg:items-end gap-4"><div className="flex-1"><label className="metric-label">Período do scan</label><div className="flex flex-wrap gap-2 mt-2">{periods.map(([value,label])=><button key={value} className={period===value?"primary-btn":"secondary-btn"} onClick={()=>setPeriod(value)}><Clock3 size={16}/>{label}</button>)}</div></div><div className="min-w-64"><label className="metric-label">Escanear</label><select className="input mt-2" value={selected} onChange={e=>setSelected(e.target.value)}><option value="all">Todos os candidatos</option>{candidates.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div></div></section>
  <section className="grid xl:grid-cols-[360px_1fr] gap-5"><div className="space-y-5"><div className="card p-5"><div className="flex items-center gap-2 mb-4"><Plus size={19}/><h2>Novo candidato</h2></div><div className="space-y-3"><input className="input" placeholder="Nome completo" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><div className="grid grid-cols-2 gap-3"><input className="input" placeholder="Partido" value={form.party} onChange={e=>setForm({...form,party:e.target.value})}/><input className="input" placeholder="Cargo" value={form.office} onChange={e=>setForm({...form,office:e.target.value})}/></div><div className="grid grid-cols-[1fr_80px] gap-3"><input className="input" placeholder="Cidade" value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/><input className="input" placeholder="UF" maxLength={2} value={form.state} onChange={e=>setForm({...form,state:e.target.value.toUpperCase()})}/></div><input className="input" placeholder="Apelidos separados por ;" onChange={e=>setForm({...form,aliases:split(e.target.value)})}/><input className="input" placeholder="Palavras-chave separadas por ;" onChange={e=>setForm({...form,keywords:split(e.target.value)})}/><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isPrimary} onChange={e=>setForm({...form,isPrimary:e.target.checked})}/> Este é meu candidato</label><button className="primary-btn w-full justify-center" onClick={saveCandidate}><Plus size={17}/> Adicionar</button></div></div>
   <div className="card p-5"><div className="flex justify-between items-center mb-4"><h2>Candidatos</h2><span className="badge">{candidates.length}/21</span></div><div className="space-y-2">{candidates.map(c=><div key={c.id} className="border border-[var(--border)] rounded-xl p-3"><div className="flex justify-between gap-2"><div><strong>{c.name}</strong><p className="muted text-xs">{[c.party,c.office,c.city,c.state].filter(Boolean).join(" • ")}</p></div><button title="Excluir" onClick={()=>removeCandidate(c.id)}><Trash2 size={16}/></button></div><div className="flex gap-2 mt-3">{c.isPrimary?<span className="badge"><Star size={12}/> Meu candidato</span>:<button className="text-xs muted" onClick={()=>makePrimary(c.id)}>Definir como principal</button>}</div></div>)}{!candidates.length&&<p className="muted text-sm">Cadastre manualmente ou importe um CSV/TXT.</p>}</div></div></div>
   <div className="space-y-5"><section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4"><div className="metric-card"><span className="metric-label">Monitorados</span><strong>{candidates.length}</strong><small>{primary?`Principal: ${primary.name}`:"Sem candidato principal"}</small></div><div className="metric-card"><span className="metric-label">Notícias</span><strong>{news.length}</strong><small>no último scan</small></div><div className="metric-card"><span className="metric-label">Positivas</span><strong>{news.filter(x=>x.tone==="positivo").length}</strong><small>cobertura favorável</small></div><div className="metric-card"><span className="metric-label">Negativas</span><strong>{news.filter(x=>x.tone==="negativo").length}</strong><small>pontos de atenção</small></div></section>
    <section className="card p-5"><div className="flex items-center gap-2 mb-4"><BarChart3 size={20}/><h2>Comparativo</h2></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left muted"><th className="p-3">Candidato</th><th>Notícias</th><th>Positivas</th><th>Neutras</th><th>Negativas</th></tr></thead><tbody>{stats.map(s=><tr key={s.id} className="border-t border-[var(--border)]"><td className="p-3 font-semibold">{s.name}{s.isPrimary&&<Star size={13} className="inline ml-2"/>}</td><td>{s.total}</td><td className="text-emerald-600">{s.positive}</td><td className="text-amber-600">{s.neutral}</td><td className="text-red-600">{s.negative}</td></tr>)}</tbody></table>{!stats.length&&<p className="muted p-3">Nenhum candidato para comparar.</p>}</div></section>
    <section className="card p-5"><div className="flex items-center gap-2 mb-4"><Radio size={20}/><h2>Notícias encontradas</h2></div><div className="space-y-3">{filtered.map(n=>{const candidate=candidates.find(c=>c.id===n.candidateId);const isNegativeCompetitor=n.tone==="negativo"&&!candidate?.isPrimary;return <article id={`news-${n.id}`} key={n.id} className="border border-[var(--border)] rounded-xl p-4"><div className="flex flex-col sm:flex-row sm:justify-between gap-2"><div><span className={`text-xs font-bold uppercase ${toneClass(n.tone)}`}>{n.tone}{n.confidence?` • ${n.confidence}%`:""}</span><h3 className="mt-1"><a href={n.url} target="_blank" rel="noreferrer" className="hover:underline">{n.title}</a></h3><p className="muted text-xs mt-1">{candidate?.name} • {n.source} • {date(n.publishedAt)}</p></div>{n.theme&&<span className="badge h-fit">{n.theme}</span>}</div><p className="text-sm mt-3">{n.summary||n.description}</p>{n.reason&&<p className="muted text-xs mt-2">Análise: {n.reason}</p>}{isNegativeCompetitor&&<div className="mt-4 rounded-xl border border-amber-400/40 bg-amber-400/10 p-4"><div className="flex items-center gap-2 font-semibold text-sm"><AlertTriangle size={17}/> Oportunidade de contraste factual</div><p className="text-sm mt-2">{contrastText(n)}</p><div className="flex flex-wrap gap-2 mt-3"><a className="secondary-btn" href={n.url} target="_blank" rel="noreferrer"><ExternalLink size={15}/> Conferir fonte</a><button className="secondary-btn" onClick={()=>navigator.clipboard.writeText(contrastText(n))}><Lightbulb size={15}/> Copiar pauta</button></div></div>}</article>})}{!filtered.length&&<div className="py-12 text-center muted"><Upload className="mx-auto mb-3"/><p>Nenhuma notícia encontrada. Selecione o período e clique em Escanear.</p></div>}</div></section></div>
  </section>
 </div>
}

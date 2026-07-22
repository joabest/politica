"use client";
import {useMemo,useState} from "react";
import Shell from "./Shell";
import {strategies,studySummaries} from "@/data/strategies";
import {BookOpen,CheckCircle2,ChevronRight,Lightbulb,ShieldAlert,Target,Search} from "lucide-react";

export default function StrategyHub(){
 const [category,setCategory]=useState("Todas"); const [query,setQuery]=useState(""); const [selected,setSelected]=useState(strategies[0]);
 const categories=["Todas",...Array.from(new Set(strategies.map(s=>s.category)))];
 const filtered=useMemo(()=>strategies.filter(s=>(category==="Todas"||s.category===category)&&`${s.title} ${s.objective} ${s.category}`.toLowerCase().includes(query.toLowerCase())),[category,query]);
 return <Shell title="Central Estratégica">
  <section className="strategy-hero"><div><span className="eyebrow">INTELIGÊNCIA APLICADA</span><h1>Estratégias transformadas em planos executáveis</h1><p>Síntese prática dos estudos enviados, organizada para planejamento. Recomendações não representam garantia de resultado.</p></div><div className="hero-stat"><b>{strategies.length}</b><span>estratégias estruturadas</span></div></section>
  <div className="strategy-toolbar"><div className="search-inline"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar estratégia..."/></div><div className="filter-pills">{categories.map(c=><button className={category===c?"active":""} onClick={()=>setCategory(c)} key={c}>{c}</button>)}</div></div>
  <div className="strategy-layout"><div className="strategy-list">{filtered.map(s=><button key={s.id} onClick={()=>setSelected(s)} className={`strategy-item ${selected.id===s.id?"selected":""}`}><div><span className={`priority ${s.priority.toLowerCase()}`}>{s.priority}</span><h3>{s.title}</h3><p>{s.objective}</p><small>{s.category}</small></div><ChevronRight size={18}/></button>)}</div>
   <article className="strategy-detail"><div className="detail-head"><div><span className="badge">{selected.category}</span><h2>{selected.title}</h2><p>{selected.objective}</p></div><Target size={28}/></div>
    <div className="evidence-box"><BookOpen size={18}/><div><b>Fundamento resumido</b><p>{selected.rationale}</p><small>{selected.source}</small></div></div>
    <div className="detail-grid"><div><h4><CheckCircle2 size={17}/> Plano de ação</h4><ol>{selected.actions.map((a,i)=><li key={a}><span>{i+1}</span>{a}</li>)}</ol></div><div><h4><Lightbulb size={17}/> Indicadores</h4><ul>{selected.indicators.map(x=><li key={x}>{x}</li>)}</ul><h4 className="mt-5"><ShieldAlert size={17}/> Riscos e limites</h4><ul className="risk-list">{selected.risks.map(x=><li key={x}>{x}</li>)}</ul></div></div>
   </article></div>
  <section className="knowledge-strip"><div className="section-heading"><div><span className="eyebrow">BASE DE CONHECIMENTO</span><h2>O que os estudos acrescentam ao Arcanum</h2></div></div><div className="knowledge-grid">{studySummaries.map(x=><article className="knowledge-card" key={x.id}><span>{x.category}</span><h3>{x.title}</h3><p>{x.summary}</p><ul>{x.applications.slice(0,3).map(a=><li key={a}>{a}</li>)}</ul><small>Limite: {x.caution}</small></article>)}</div></section>
 </Shell>
}

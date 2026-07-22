"use client";
import {useEffect,useMemo,useState} from "react";
import {useRouter} from "next/navigation";
import {Search,ArrowRight,Command} from "lucide-react";
import {menu} from "@/data/content";
export default function CommandPalette(){
 const [open,setOpen]=useState(false);const [q,setQ]=useState("");const router=useRouter();
 useEffect(()=>{const h=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setOpen(v=>!v)}if(e.key==='Escape')setOpen(false)};window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h)},[]);
 const results=useMemo(()=>menu.filter(([,l])=>l.toLowerCase().includes(q.toLowerCase())),[q]);
 if(!open)return <button className="search-trigger" onClick={()=>setOpen(true)}><Search size={17}/><span className="hidden lg:block">Buscar no Arcanum</span><kbd><Command size={12}/>K</kbd></button>;
 return <><button className="search-trigger" onClick={()=>setOpen(true)}><Search size={17}/><span className="hidden lg:block">Buscar no Arcanum</span><kbd><Command size={12}/>K</kbd></button><div className="command-backdrop" onClick={()=>setOpen(false)}><div className="command-box" onClick={e=>e.stopPropagation()}><div className="command-input"><Search size={19}/><input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar páginas, módulos e conteúdos..."/><kbd>ESC</kbd></div><div className="command-label">NAVEGAÇÃO RÁPIDA</div><div className="command-results">{results.map(([href,label])=><button key={href} onClick={()=>{router.push(href);setOpen(false);setQ("")}}><span>{label}</span><ArrowRight size={16}/></button>)}{results.length===0&&<div className="command-empty">Nenhum resultado encontrado.</div>}</div></div></div></>
}

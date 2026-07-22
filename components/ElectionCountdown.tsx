"use client";
import {useEffect,useState} from "react";
import {ArrowRight, CalendarDays, Flag, TimerReset} from "lucide-react";
const target=new Date("2026-10-04T08:00:00-03:00").getTime();
export default function ElectionCountdown(){
 const [d,setD]=useState({days:0,hours:0,minutes:0});
 useEffect(()=>{const calc=()=>{const x=Math.max(0,target-Date.now());setD({days:Math.floor(x/86400000),hours:Math.floor(x/3600000)%24,minutes:Math.floor(x/60000)%60})};calc();const i=setInterval(calc,60000);return()=>clearInterval(i)},[]);
 return <div className="election-hero">
   <div className="hero-orb hero-orb-one"/><div className="hero-orb hero-orb-two"/>
   <div className="relative z-10 grid lg:grid-cols-[1.15fr_.85fr] gap-8 items-center">
    <div>
      <div className="hero-kicker"><Flag size={15}/> Eleições Gerais 2026</div>
      <h2 className="text-3xl md:text-4xl font-black tracking-tight mt-4">Inteligência para cada etapa da jornada.</h2>
      <p className="text-white/70 mt-3 max-w-xl">Organize prioridades, conteúdo e marcos estratégicos em uma visão única e preparada para evoluir com dados reais.</p>
      <div className="flex flex-wrap gap-3 mt-6"><button className="hero-btn">Abrir calendário <ArrowRight size={16}/></button><button className="hero-btn ghost">Ver planejamento</button></div>
    </div>
    <div className="countdown-panel">
      <div className="flex items-center justify-between"><div><div className="text-xs text-white/60">PRIMEIRO TURNO</div><div className="font-semibold mt-1">4 de outubro de 2026</div></div><TimerReset size={22}/></div>
      <div className="grid grid-cols-3 gap-2 mt-5">{[[d.days,"dias"],[d.hours,"horas"],[d.minutes,"min"]].map(([v,l])=><div key={l} className="count-box"><div className="text-2xl md:text-3xl font-black">{v}</div><div className="text-[10px] uppercase tracking-widest text-white/55">{l}</div></div>)}</div>
      <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-3 text-sm text-white/70"><CalendarDays size={17}/><span>Segundo turno: 25 de outubro, onde houver</span></div>
    </div>
   </div>
 </div>
}

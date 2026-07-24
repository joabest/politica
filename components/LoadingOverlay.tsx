"use client";
import {FileText,X} from "lucide-react";

export default function LoadingOverlay({open,title="Processando...",subtitle="Aguarde enquanto concluímos esta operação.",progress}:{open:boolean;title?:string;subtitle?:string;progress?:number}){
 if(!open)return null;
 const value=Math.max(8,Math.min(96,progress??68));
 return <div className="loading-backdrop" role="status" aria-live="polite">
  <div className="loading-panel">
   <button className="loading-close" aria-label="Operação em andamento" disabled><X size={22}/></button>
   <div className="loading-file"><FileText size={42}/><span>DATA</span></div>
   <div className="min-w-0"><h2>{title}</h2><p>{subtitle}</p></div>
   <div className="loading-progress-card">
    <div className="flex items-center justify-between gap-4"><span className="flex items-center gap-3"><i className="loading-spinner"/>{title}</span><strong>{value}%</strong></div>
    <div className="loading-track"><div className="loading-bar" style={{width:`${value}%`}}/></div>
   </div>
  </div>
 </div>
}

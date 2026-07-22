import { ArrowUpRight, Sparkles } from "lucide-react";

export function Metric({title,value,note,trend="+4,2%",icon}:{title:string,value:string,note:string,trend?:string,icon?:React.ReactNode}){
  return <div className="metric-card group">
    <div className="flex items-start justify-between gap-3">
      <div className="metric-icon">{icon ?? <Sparkles size={18}/>}</div>
      <span className="trend-pill"><ArrowUpRight size={12}/>{trend}</span>
    </div>
    <div className="text-[13px] muted mt-5">{title}</div>
    <div className="text-3xl font-black tracking-tight mt-1">{value}</div>
    <div className="text-xs muted mt-2">{note}</div>
    <div className="sparkline mt-5"><i/><i/><i/><i/><i/><i/><i/><i/></div>
  </div>
}
export function Section({title,children,action}:{title:string,children:React.ReactNode,action?:React.ReactNode}){return <section className="card p-5 md:p-6"><div className="flex justify-between items-center mb-5"><div><h2 className="font-bold text-lg tracking-tight">{title}</h2><p className="text-xs muted mt-1">Dados locais para visualização</p></div>{action??<span className="badge">Demonstração</span>}</div>{children}</section>}
export function Progress({label,value}:{label:string,value:number}){return <div><div className="flex justify-between text-sm mb-2"><span>{label}</span><b>{value}%</b></div><div className="h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden"><div className="h-full rounded-full progress-fill" style={{width:value+'%'}}/></div></div>}

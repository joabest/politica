import Shell from "@/components/Shell";
import AccessManager from "@/components/AccessManager";
import { CheckCircle2, Database, KeyRound, Server, ShieldCheck } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function SettingsPage() {
  const connected = isSupabaseConfigured();
  return <Shell title="Configurações"><section className="page-hero mb-6"><div><span className="eyebrow">AMBIENTE E SEGURANÇA</span><h1>Configuração do sistema</h1><p>Backend, usuários, permissões e controles administrativos do Arcanum.</p></div><span className="badge">{connected ? "Backend conectado" : "Modo demonstração"}</span></section>
  <div className="grid lg:grid-cols-2 gap-5 mb-6">
    <section className="card p-6"><div className="flex items-center gap-3"><div className="metric-icon"><Database/></div><div><h2 className="font-black text-xl">Supabase</h2><p className="muted text-sm">Banco, autenticação e políticas de acesso.</p></div></div><div className="mt-6 space-y-3">
      <Status icon={Server} title="URL do projeto" ok={Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)}/>
      <Status icon={KeyRound} title="Chave publicável" ok={Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)}/>
      <Status icon={ShieldCheck} title="Proteção por sessão" ok={connected}/>
    </div></section>
    <section className="card p-6"><h2 className="font-black text-xl">Regras administrativas</h2><ul className="mt-5 space-y-3 text-sm muted"><li>• Apenas o administrador principal pode conceder permissões.</li><li>• Módulos não autorizados devem ficar ocultos no menu.</li><li>• Alterações administrativas devem gerar registro de auditoria.</li><li>• Senhas não são exibidas; use redefinição segura.</li></ul></section>
  </div>
  <AccessManager/></Shell>;
}
function Status({icon:Icon,title,ok}:{icon:typeof Server;title:string;ok:boolean}){return <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-3"><Icon size={18}/><span className="flex-1 text-sm">{title}</span>{ok?<span className="text-green-600 flex items-center gap-1 text-xs"><CheckCircle2 size={15}/> Configurado</span>:<span className="badge">Pendente</span>}</div>}

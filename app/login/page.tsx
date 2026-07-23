"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("mkt2026");
  const [password, setPassword] = useState("mkt2026");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (supabase) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
      } else {
        const response = await fetch("/auth/demo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Não foi possível entrar.");
      }
      router.replace("/dashboard");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Credenciais inválidas.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      <section className="hidden lg:flex bg-gradient-to-br from-[#24113f] via-[#482274] to-[#7651ad] text-white p-16 flex-col justify-between">
        <div className="text-2xl font-black tracking-[.15em]">ARCANUM</div>
        <div>
          <span className="inline-flex gap-2 items-center rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs"><ShieldCheck size={15}/> Ambiente estratégico protegido</span>
          <h1 className="text-5xl font-black max-w-xl mt-6">Dados, planejamento e comunicação em um só lugar.</h1>
          <p className="text-white/70 mt-5 max-w-lg">A Fase 5 adiciona autenticação real e persistência com Supabase, mantendo um modo demonstrativo para instalação imediata.</p>
        </div>
        <span className="text-sm text-white/60">Arcanum Strategy OS • Fase 5</span>
      </section>
      <section className="grid place-items-center p-6">
        <form className="card p-8 w-full max-w-md" onSubmit={submit}>
          <div className="w-12 h-12 rounded-2xl bg-[color-mix(in_srgb,var(--primary)_12%,var(--card))] text-[var(--primary)] grid place-items-center mb-5"><LockKeyhole/></div>
          <div className="text-3xl font-black">Acessar Arcanum</div>
          <p className="muted mt-2">{supabase ? "Entre com o usuário cadastrado no Supabase." : "Supabase não configurado: modo demonstração ativo."}</p>
          {supabase ? (
            <label className="block mt-7 text-sm">E-mail
              <input required type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="usuario@equipe.com" className="mt-2 w-full p-3 rounded-xl border border-[var(--border)] bg-transparent"/>
            </label>
          ) : (
            <label className="block mt-7 text-sm">Usuário
              <input required value={username} onChange={(e)=>setUsername(e.target.value)} className="mt-2 w-full p-3 rounded-xl border border-[var(--border)] bg-transparent"/>
            </label>
          )}
          <label className="block mt-4 text-sm">Senha
            <div className="flex mt-2 relative">
              <input required type={show ? "text" : "password"} value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full p-3 pr-12 rounded-xl border border-[var(--border)] bg-transparent"/>
              <button type="button" aria-label={show ? "Ocultar senha" : "Mostrar senha"} className="absolute right-2 top-2 icon-btn" onClick={()=>setShow(!show)}>{show ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
            </div>
          </label>
          {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <button disabled={loading} className="btn w-full mt-6 flex justify-center items-center gap-2">{loading && <Loader2 className="animate-spin" size={18}/>} Entrar</button>
          {!supabase && <p className="text-xs muted mt-4 text-center">Demonstração: mkt2026 / mkt2026</p>}
        </form>
      </section>
    </main>
  );
}

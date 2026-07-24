"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true);
    const supabase = createClient();
    if (supabase) await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha`,
    });
    setSent(true); setLoading(false);
  }
  return <main className="min-h-screen grid place-items-center p-6"><section className="card w-full max-w-md p-8" aria-labelledby="title">
    <h1 id="title" className="text-3xl font-black">Recuperar senha</h1>
    {sent ? <div role="status" className="mt-5"><p>Se existir uma conta para esse e-mail, você receberá as instruções em instantes.</p><Link className="btn inline-flex mt-6" href="/login">Voltar ao login</Link></div> :
      <form onSubmit={submit}><p className="muted mt-2">Enviaremos um link seguro para redefinir sua senha.</p><label className="block mt-6 text-sm">E-mail<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full p-3 rounded-xl border border-[var(--border)] bg-transparent" /></label><button disabled={loading} className="btn w-full mt-6">{loading ? "Enviando…" : "Enviar instruções"}</button></form>}
  </section></main>;
}

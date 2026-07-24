"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter(); const [password,setPassword]=useState(""); const [confirm,setConfirm]=useState("");
  const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  async function submit(event:FormEvent){event.preventDefault();setError("");if(password.length<12){setError("Use pelo menos 12 caracteres.");return}if(password!==confirm){setError("As senhas não coincidem.");return}setLoading(true);const supabase=createClient();const result=supabase?await supabase.auth.updateUser({password}):{error:new Error("Serviço de autenticação indisponível.")};setLoading(false);if(result.error){setError("O link expirou ou é inválido. Solicite uma nova recuperação.");return}router.replace("/login?senha=alterada")}
  return <main className="min-h-screen grid place-items-center p-6"><form onSubmit={submit} className="card w-full max-w-md p-8"><h1 className="text-3xl font-black">Definir nova senha</h1><p className="muted mt-2">Escolha uma senha exclusiva com pelo menos 12 caracteres.</p><label className="block mt-6 text-sm">Nova senha<input required minLength={12} type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full p-3 rounded-xl border border-[var(--border)] bg-transparent" /></label><label className="block mt-4 text-sm">Confirmar senha<input required minLength={12} type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} className="mt-2 w-full p-3 rounded-xl border border-[var(--border)] bg-transparent" /></label>{error&&<p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}<button disabled={loading} className="btn w-full mt-6">{loading?"Atualizando…":"Atualizar senha"}</button></form></main>
}

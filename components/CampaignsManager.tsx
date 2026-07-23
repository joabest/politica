"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, MapPin, Pencil, Plus, Search, Trash2, UserRound, X } from "lucide-react";
import { Campaign, CampaignStatus, createCampaign, deleteCampaign, getActiveCampaignId, listCampaigns, setActiveCampaignId, updateCampaign } from "@/lib/campaign-store";

const emptyForm = {
  name: "",
  candidate_name: "",
  office: "",
  party: "",
  city: "",
  state: "SP",
  election_year: 2028,
  slogan: "",
  status: "planejamento" as CampaignStatus,
  primary_color: "#6d5dfc",
  secondary_color: "#13c6b3",
};

export default function CampaignsManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    try {
      setLoading(true);
      const data = await listCampaigns();
      setCampaigns(data);
      const stored = getActiveCampaignId();
      const valid = stored && data.some((c) => c.id === stored) ? stored : data[0]?.id || null;
      setActiveId(valid);
      if (valid) setActiveCampaignId(valid);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível carregar as campanhas.");
    } finally { setLoading(false); }
  }

  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => campaigns.filter((c) => [c.name, c.candidate_name, c.city, c.office].join(" ").toLowerCase().includes(query.toLowerCase())), [campaigns, query]);

  function startCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function startEdit(c: Campaign) {
    setEditing(c.id);
    setForm({
      name: c.name, candidate_name: c.candidate_name, office: c.office, party: c.party,
      city: c.city, state: c.state, election_year: c.election_year, slogan: c.slogan,
      status: c.status, primary_color: c.primary_color, secondary_color: c.secondary_color,
    });
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (editing) await updateCampaign(editing, form);
      else {
        const created = await createCampaign(form);
        setActiveCampaignId(created.id);
      }
      setOpen(false);
      await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Erro ao salvar campanha."); }
  }

  async function remove(c: Campaign) {
    if (!confirm(`Excluir a campanha “${c.name}”?`)) return;
    try { await deleteCampaign(c.id); await refresh(); } catch (e) { setError(e instanceof Error ? e.message : "Erro ao excluir campanha."); }
  }

  function activate(id: string) {
    setActiveId(id);
    setActiveCampaignId(id);
  }

  return <div className="space-y-6">
    <section className="page-hero flex flex-col lg:flex-row lg:items-center justify-between gap-5">
      <div><div className="eyebrow">NÚCLEO DO SISTEMA</div><h2 className="text-3xl font-black mt-2">Campanhas</h2><p className="muted mt-2 max-w-2xl">Organize candidatos, eleições e toda a operação estratégica em ambientes separados.</p></div>
      <button className="primary-btn" onClick={startCreate}><Plus size={18}/> Nova campanha</button>
    </section>

    <section className="grid md:grid-cols-3 gap-4">
      <div className="metric-card"><span className="metric-label">Total</span><strong>{campaigns.length}</strong><small>campanhas cadastradas</small></div>
      <div className="metric-card"><span className="metric-label">Ativas</span><strong>{campaigns.filter(c=>c.status==="ativa").length}</strong><small>em execução</small></div>
      <div className="metric-card"><span className="metric-label">Campanha selecionada</span><strong className="text-lg">{campaigns.find(c=>c.id===activeId)?.name || "Nenhuma"}</strong><small>contexto atual do Arcanum</small></div>
    </section>

    <div className="card p-4 flex items-center gap-3"><Search size={18} className="muted"/><input className="plain-input" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por campanha, candidato, cargo ou cidade..."/></div>
    {error && <div className="error-banner">{error}</div>}

    {loading ? <div className="card p-8 muted">Carregando campanhas...</div> : filtered.length === 0 ? <div className="card p-10 text-center"><h3 className="font-bold text-lg">Nenhuma campanha encontrada</h3><p className="muted mt-2">Crie a primeira campanha para começar.</p></div> :
    <div className="grid xl:grid-cols-2 gap-5">{filtered.map(c=><article key={c.id} className={`campaign-card ${activeId===c.id?"selected":""}`}>
      <div className="campaign-accent" style={{background:`linear-gradient(90deg, ${c.primary_color}, ${c.secondary_color})`}}/>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><span className={`status-pill ${c.status}`}>{c.status.replace("_"," ")}</span>{activeId===c.id&&<span className="active-pill"><CheckCircle2 size={13}/> Selecionada</span>}</div><h3 className="text-xl font-black mt-3">{c.name}</h3><p className="muted mt-1">{c.slogan || "Sem slogan definido"}</p></div><div className="flex gap-1"><button className="icon-btn" onClick={()=>startEdit(c)}><Pencil size={16}/></button><button className="icon-btn danger" onClick={()=>remove(c)}><Trash2 size={16}/></button></div></div>
        <div className="campaign-details mt-5"><span><UserRound size={16}/>{c.candidate_name || "Candidato não definido"}</span><span><CalendarDays size={16}/>{c.office || "Cargo"} • {c.election_year}</span><span><MapPin size={16}/>{c.city || "Cidade"}/{c.state}</span></div>
        <div className="mt-6 flex items-center justify-between gap-3"><span className="text-xs muted">{c.party ? `Partido: ${c.party}` : "Partido não informado"}</span><button className={activeId===c.id?"secondary-btn":"primary-btn"} onClick={()=>activate(c.id)}>{activeId===c.id?"Campanha atual":"Selecionar campanha"}</button></div>
      </div>
    </article>)}</div>}

    {open&&<div className="modal-backdrop" onMouseDown={()=>setOpen(false)}><div className="modal-card" onMouseDown={e=>e.stopPropagation()}><div className="flex items-center justify-between mb-5"><div><div className="eyebrow">{editing?"EDITAR":"NOVA"}</div><h3 className="text-2xl font-black">Campanha</h3></div><button className="icon-btn" onClick={()=>setOpen(false)}><X size={18}/></button></div>
      <form onSubmit={save} className="grid md:grid-cols-2 gap-4">
        <label className="field md:col-span-2"><span>Nome da campanha *</span><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Ex.: Projeto Santo André 2028"/></label>
        <label className="field"><span>Candidato *</span><input required value={form.candidate_name} onChange={e=>setForm({...form,candidate_name:e.target.value})}/></label>
        <label className="field"><span>Cargo *</span><input required value={form.office} onChange={e=>setForm({...form,office:e.target.value})} placeholder="Prefeito, Vereador..."/></label>
        <label className="field"><span>Partido</span><input value={form.party} onChange={e=>setForm({...form,party:e.target.value})}/></label>
        <label className="field"><span>Ano da eleição</span><input type="number" min="2024" max="2100" value={form.election_year} onChange={e=>setForm({...form,election_year:Number(e.target.value)})}/></label>
        <label className="field"><span>Cidade</span><input value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/></label>
        <label className="field"><span>UF</span><input maxLength={2} value={form.state} onChange={e=>setForm({...form,state:e.target.value.toUpperCase()})}/></label>
        <label className="field md:col-span-2"><span>Slogan</span><input value={form.slogan} onChange={e=>setForm({...form,slogan:e.target.value})}/></label>
        <label className="field"><span>Status</span><select value={form.status} onChange={e=>setForm({...form,status:e.target.value as CampaignStatus})}><option value="planejamento">Planejamento</option><option value="ativa">Ativa</option><option value="pausada">Pausada</option><option value="encerrada">Encerrada</option></select></label>
        <div className="grid grid-cols-2 gap-3"><label className="field"><span>Cor principal</span><input type="color" value={form.primary_color} onChange={e=>setForm({...form,primary_color:e.target.value})}/></label><label className="field"><span>Cor secundária</span><input type="color" value={form.secondary_color} onChange={e=>setForm({...form,secondary_color:e.target.value})}/></label></div>
        <div className="md:col-span-2 flex justify-end gap-3 mt-2"><button type="button" className="secondary-btn" onClick={()=>setOpen(false)}>Cancelar</button><button className="primary-btn" type="submit">Salvar campanha</button></div>
      </form>
    </div></div>}
  </div>;
}

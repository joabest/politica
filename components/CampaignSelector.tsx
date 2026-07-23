"use client";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Campaign, getActiveCampaignId, listCampaigns, setActiveCampaignId } from "@/lib/campaign-store";

export default function CampaignSelector(){
  const [items,setItems]=useState<Campaign[]>([]);
  const [active,setActive]=useState("");
  useEffect(()=>{listCampaigns().then(data=>{setItems(data);const id=getActiveCampaignId()||data[0]?.id||"";setActive(id);if(id)setActiveCampaignId(id);}).catch(()=>{});const handler=(e:Event)=>setActive((e as CustomEvent<string>).detail);window.addEventListener("arcanum:campaign-changed",handler);return()=>window.removeEventListener("arcanum:campaign-changed",handler)},[]);
  if(!items.length)return null;
  return <label className="campaign-selector"><span className="sr-only">Campanha ativa</span><select value={active} onChange={e=>{setActive(e.target.value);setActiveCampaignId(e.target.value)}}>{items.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><ChevronDown size={14}/></label>
}

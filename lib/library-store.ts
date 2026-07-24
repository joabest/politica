import { createClient } from "@/lib/supabase/client";
import { getActiveCampaignId } from "@/lib/campaign-store";

export type LibraryDocument = {
  id:string; campaign_id:string; name:string; description:string; category:string; tags:string[];
  file_path:string; file_type:string; file_size:number; created_at:string;
};

const active=()=>getActiveCampaignId()||"demo-campaign-1";
const KEY="arcanum-library-v1";
function localRead():LibraryDocument[]{if(typeof window==="undefined")return[];try{return JSON.parse(localStorage.getItem(KEY)||"[]") as LibraryDocument[]}catch{return[]}}
function localWrite(items:LibraryDocument[]){localStorage.setItem(KEY,JSON.stringify(items))}

export async function listDocuments(){const campaign_id=active();const s=createClient();if(!s)return localRead().filter(x=>x.campaign_id===campaign_id);const{data,error}=await s.from("library_documents").select("*").eq("campaign_id",campaign_id).order("created_at",{ascending:false});if(error)throw error;return(data||[]) as LibraryDocument[]}

export async function uploadDocument(file:File,meta:{description:string;category:string;tags:string[]}){const campaign_id=active();const s=createClient();if(!s){const doc:LibraryDocument={id:crypto.randomUUID(),campaign_id,name:file.name,description:meta.description,category:meta.category,tags:meta.tags,file_path:"",file_type:file.type||"application/octet-stream",file_size:file.size,created_at:new Date().toISOString()};localWrite([doc,...localRead()]);return doc}
 const{data:userData,error:userError}=await s.auth.getUser();if(userError||!userData.user)throw new Error("Sessão inválida. Entre novamente.");
 const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"-");const path=`${userData.user.id}/${campaign_id}/${crypto.randomUUID()}-${safe}`;
 const{error:uploadError}=await s.storage.from("campaign-documents").upload(path,file,{upsert:false,contentType:file.type||undefined});if(uploadError)throw uploadError;
 const{data,error}=await s.from("library_documents").insert({campaign_id,name:file.name,description:meta.description,category:meta.category,tags:meta.tags,file_path:path,file_type:file.type||"application/octet-stream",file_size:file.size}).select().single();
 if(error){await s.storage.from("campaign-documents").remove([path]);throw error}return data as LibraryDocument}

export async function downloadDocument(doc:LibraryDocument){const s=createClient();if(!s||!doc.file_path)throw new Error("Arquivo indisponível no modo local.");const{data,error}=await s.storage.from("campaign-documents").createSignedUrl(doc.file_path,60);if(error)throw error;window.open(data.signedUrl,"_blank","noopener,noreferrer")}

export async function deleteDocument(doc:LibraryDocument){const s=createClient();if(!s){localWrite(localRead().filter(x=>x.id!==doc.id));return}if(doc.file_path){const{error:storageError}=await s.storage.from("campaign-documents").remove([doc.file_path]);if(storageError)throw storageError}const{error}=await s.from("library_documents").delete().eq("id",doc.id);if(error)throw error}

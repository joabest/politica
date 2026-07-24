import {NextResponse} from "next/server";

export const runtime="nodejs";
export const maxDuration=60;

type Candidate={id:string;name:string;party?:string;office?:string;city?:string;state?:string;aliases?:string[];keywords?:string[]};
type Period="1h"|"24h"|"3d"|"7d";
type RawNews={id:string;candidateId:string;title:string;description:string;source:string;url:string;publishedAt:string;tone:string;confidence:number;summary:string;theme:string;reason:string};

const periodQuery:Record<Period,string>={"1h":"when:1h","24h":"when:1d","3d":"when:3d","7d":"when:7d"};
const maxPerCandidate=15;

function decode(value:string){return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1").replace(/<[^>]+>/g," ").replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\s+/g," ").trim()}
function tag(xml:string,name:string){return decode(xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`,`i`))?.[1]||"")}
function link(xml:string){return tag(xml,"link")||decode(xml.match(/<link[^>]+href=["']([^"']+)/i)?.[1]||"")}
function hash(value:string){let h=0;for(let i=0;i<value.length;i++)h=(h*31+value.charCodeAt(i))|0;return Math.abs(h).toString(36)}
function buildQuery(c:Candidate,period:Period){const identity=[`"${c.name}"`,c.party,c.city,c.state,c.office].filter(Boolean).join(" ");const alias=(c.aliases||[]).slice(0,2).map(x=>`OR "${x}"`).join(" ");const keywords=(c.keywords||[]).slice(0,3).join(" ");return `${identity} ${alias} ${keywords} ${periodQuery[period]}`.trim()}

async function fetchCandidate(c:Candidate,period:Period):Promise<RawNews[]>{
 const q=buildQuery(c,period);const endpoint=`https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
 const response=await fetch(endpoint,{headers:{"User-Agent":"Mozilla/5.0 ArcanumRadar/1.0"},next:{revalidate:0}});if(!response.ok)throw new Error(`Google News respondeu ${response.status}`);
 const xml=await response.text();const items=[...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0,maxPerCandidate);
 return items.map(match=>{const item=match[1],title=tag(item,"title"),description=tag(item,"description"),url=link(item),published=tag(item,"pubDate"),source=tag(item,"source")||"Google News";return{id:`${c.id}-${hash(url||title)}`,candidateId:c.id,title,description,source,url,publishedAt:new Date(published||Date.now()).toISOString(),tone:"não analisado",confidence:0,summary:description,theme:"",reason:""}}).filter(x=>x.title&&x.url);
}

async function analyzeWithGroq(items:RawNews[],candidates:Candidate[]){
 const key=process.env.GROQ_API_KEY;if(!key||!items.length)return{items,analyzed:false};
 const model=process.env.GROQ_MODEL||"llama-3.1-8b-instant";const candidateMap=Object.fromEntries(candidates.map(c=>[c.id,c.name]));
 const batches=[];for(let i=0;i<items.length;i+=8)batches.push(items.slice(i,i+8));
 const analyzed:RawNews[]=[];
 for(const batch of batches){
  const payload=batch.map(x=>({id:x.id,candidato:candidateMap[x.candidateId],titulo:x.title,descricao:x.description,fonte:x.source}));
  try{
   const response=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model,temperature:0.1,response_format:{type:"json_object"},messages:[{role:"system",content:"Você é um analista neutro de mídia política. Classifique o TOM DA COBERTURA em relação ao candidato, nunca a qualidade moral do candidato. Responda somente JSON válido no formato {\"analises\":[{\"id\":\"\",\"tom\":\"positivo|neutro|negativo\",\"confianca\":0,\"resumo\":\"até 45 palavras\",\"tema\":\"até 3 palavras\",\"motivo\":\"até 25 palavras\"}]}. Use apenas o conteúdo fornecido. Quando houver informação insuficiente, use neutro e confiança baixa."},{role:"user",content:JSON.stringify(payload)}]})});
   if(!response.ok)throw new Error(`Groq ${response.status}`);const json=await response.json();const parsed=JSON.parse(json.choices?.[0]?.message?.content||"{}");const map=new Map((parsed.analises||[]).map((a:{id:string})=>[a.id,a]));
   analyzed.push(...batch.map(item=>{const a=map.get(item.id) as {tom?:string;confianca?:number;resumo?:string;tema?:string;motivo?:string}|undefined;return a?{...item,tone:["positivo","neutro","negativo"].includes(a.tom||"")?a.tom!:"neutro",confidence:Math.max(0,Math.min(100,Number(a.confianca)||0)),summary:a.resumo||item.description,theme:a.tema||"",reason:a.motivo||""}:item}));
  }catch{analyzed.push(...batch)}
 }
 return{items:analyzed,analyzed:analyzed.some(x=>x.tone!=="não analisado")};
}

export async function POST(request:Request){
 try{const body=await request.json();const candidates=(body.candidates||[]) as Candidate[];const period=(body.period||"7d") as Period;if(!candidates.length)return NextResponse.json({error:"Nenhum candidato informado."},{status:400});if(candidates.length>21)return NextResponse.json({error:"O limite é de 21 candidatos por scan."},{status:400});if(!periodQuery[period])return NextResponse.json({error:"Período inválido."},{status:400});
  const results=await Promise.allSettled(candidates.map(c=>fetchCandidate(c,period)));const items=results.flatMap(r=>r.status==="fulfilled"?r.value:[]);const unique=[...new Map(items.map(x=>[x.url,x])).values()];const output=await analyzeWithGroq(unique,candidates);return NextResponse.json({...output,failedSources:results.filter(x=>x.status==="rejected").length});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Erro interno no radar."},{status:500})}
}

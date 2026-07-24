"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {menu} from "@/data/content";
import {House,PanelsTopLeft,UsersRound,ChartColumnIncreasing,Brain,ScanSearch,Sparkles,Radio,Palette,Send,LibraryBig,ListChecks,CalendarDays,ChartLine,SlidersHorizontal,Sun,Moon,LogOut,Bell,CheckCheck,ExternalLink} from "lucide-react";
import {useEffect,useMemo,useRef,useState} from "react";
import {useTheme} from "next-themes";
import CommandPalette from "./CommandPalette";
import CampaignSelector from "./CampaignSelector";
import {createClient} from "@/lib/supabase/client";
import {getCurrentAccess,Permission} from "./AccessManager";

const icons=[House,PanelsTopLeft,UsersRound,ChartColumnIncreasing,Brain,ScanSearch,Sparkles,Radio,Palette,Send,LibraryBig,ScanSearch,ListChecks,CalendarDays,ChartLine,Sparkles,SlidersHorizontal];
const groups=[
 {label:"Visão",paths:["/dashboard","/campanhas","/candidatos","/comparativo"]},
 {label:"Inteligência",paths:["/estrategia","/radar","/clipping","/relatorios","/ia"]},
 {label:"Comunicação",paths:["/conteudo","/marketing","/branding","/redes-sociais"]},
 {label:"Operação",paths:["/biblioteca","/planejamento","/calendario-eleitoral"]},
 {label:"Sistema",paths:["/configuracoes"]}
] as const;
type AppNotification={id:string;title:string;message:string;createdAt:string;read:boolean;href?:string};
const NOTIFICATIONS_KEY="arcanum:notifications",NAV_SCROLL_KEY="arcanum:sidebar-scroll";
function readNotifications():AppNotification[]{try{return JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY)||"[]")}catch{return[]}}
function when(value:string){const diff=Math.max(0,Date.now()-new Date(value).getTime()),minutes=Math.floor(diff/60000);if(minutes<1)return"agora";if(minutes<60)return`há ${minutes} min`;const hours=Math.floor(minutes/60);if(hours<24)return`há ${hours}h`;return`há ${Math.floor(hours/24)}d`}
function requiredPermission(href:string):Permission|undefined{if(href==="/configuracoes")return"settings";if(href==="/clipping")return"radar";if(href==="/biblioteca")return"library";if(href==="/relatorios")return"reports";if(["/conteudo","/marketing","/branding","/redes-sociais"].includes(href))return"content"}

export default function Shell({children,title}:{children:React.ReactNode,title:string}){
 const p=usePathname(),navRef=useRef<HTMLElement>(null);
 const[mobile,setMobile]=useState(false),[notificationOpen,setNotificationOpen]=useState(false),[notifications,setNotifications]=useState<AppNotification[]>([]),[email,setEmail]=useState<string|null>(null),[permissionTick,setPermissionTick]=useState(0);
 const{resolvedTheme,setTheme}=useTheme();const supabase=createClient();
 async function logout(){if(supabase)await supabase.auth.signOut();await fetch("/auth/logout",{method:"POST"});window.location.href="/login"}
 useEffect(()=>{const load=()=>setNotifications(readNotifications());load();window.addEventListener("arcanum:notifications-changed",load);window.addEventListener("storage",load);return()=>{window.removeEventListener("arcanum:notifications-changed",load);window.removeEventListener("storage",load)}},[]);
 useEffect(()=>{void supabase?.auth.getUser().then(({data})=>setEmail(data.user?.email||null));const h=()=>setPermissionTick(x=>x+1);window.addEventListener("arcanum:permissions-changed",h);return()=>window.removeEventListener("arcanum:permissions-changed",h)},[supabase]);
 useEffect(()=>{const nav=navRef.current;if(!nav)return;nav.scrollTop=Number(sessionStorage.getItem(NAV_SCROLL_KEY)||0);const saveScroll=()=>sessionStorage.setItem(NAV_SCROLL_KEY,String(nav.scrollTop));nav.addEventListener("scroll",saveScroll,{passive:true});return()=>nav.removeEventListener("scroll",saveScroll)},[]);
 const access=useMemo(()=>getCurrentAccess(email),[email,permissionTick]);
 const visibleMenu=useMemo(()=>menu.filter(([href])=>{const required=requiredPermission(href);return !required||access.admin||access.permissions.includes("all_modules")||access.permissions.includes(required)}),[access]);
 const unread=useMemo(()=>notifications.filter(n=>!n.read).length,[notifications]);
 function save(next:AppNotification[]){setNotifications(next);localStorage.setItem(NOTIFICATIONS_KEY,JSON.stringify(next));window.dispatchEvent(new Event("arcanum:notifications-changed"))}
 function markAll(){save(notifications.map(n=>({...n,read:true})))}
 function openNotification(item:AppNotification){save(notifications.map(n=>n.id===item.id?{...n,read:true}:n));setNotificationOpen(false)}
 function item(href:string,label:string,mobileItem=false){const i=menu.findIndex(x=>x[0]===href),Icon=icons[i];return <Link key={href} href={href} title={label} scroll={false} onClick={()=>mobileItem&&setMobile(false)} className={`nav-item ${p===href?'active':''}`}><span className="nav-icon"><Icon size={19} strokeWidth={1.65}/></span><span className="nav-copy">{label}</span></Link>}
 function groupedNav(mobileItem=false){return groups.map(group=>{const items=visibleMenu.filter(([href])=>(group.paths as readonly string[]).includes(href));if(!items.length)return null;return <div className="nav-group" key={group.label}><div className="sidebar-label">{group.label}</div>{items.map(([href,label])=>item(href,label,mobileItem))}</div>})}
 return <div className="min-h-screen flex app-frame">
  <aside className="app-sidebar hidden md:flex"><div className="sidebar-shell h-full flex flex-col"><div className="sidebar-brand"><div className="logo-mark">A</div><div className="brand-copy"><div className="font-black tracking-[.16em]">ARCANUM</div><div className="text-[10px] muted">STRATEGY OS</div></div></div><nav ref={navRef} className="sidebar-nav">{groupedNav()}</nav><div className="sidebar-user"><div className="avatar">{access.admin?"JA":"MK"}</div><div className="user-copy"><div className="text-sm font-semibold truncate">{access.admin?"Administrador":"Marketing 2026"}</div><div className="text-xs muted truncate">{email||"Supabase conectado"}</div></div></div></div></aside>
  {mobile&&<div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-md md:hidden" onClick={()=>setMobile(false)}><div className="mobile-sidebar" onClick={e=>e.stopPropagation()}><div className="sidebar-brand"><div className="logo-mark">A</div><div><b>ARCANUM</b><div className="text-[10px] muted">STRATEGY OS</div></div></div><nav className="sidebar-nav">{groupedNav(true)}</nav></div></div>}
  <main className="app-main flex-1 min-w-0"><header className="topbar"><div className="flex gap-3 items-center min-w-0"><button className="md:hidden icon-btn" aria-label="Abrir navegação" onClick={()=>setMobile(true)}><PanelsTopLeft size={19}/></button><div className="min-w-0"><h1 className="text-xl font-semibold tracking-tight truncate">{title}</h1><p className="text-xs muted truncate">Inteligência estratégica <span className="mx-1">•</span> Ambiente operacional</p></div></div><div className="flex gap-2 items-center"><CampaignSelector/><CommandPalette/><div className="relative"><button className="icon-btn relative" aria-label="Notificações" onClick={()=>setNotificationOpen(v=>!v)}><Bell size={18}/>{unread>0&&<span className="notification-count">{unread>9?"9+":unread}</span>}</button>{notificationOpen&&<div className="notification-popover"><div className="p-4 border-b border-[var(--border)] flex items-center justify-between"><div><strong>Notificações</strong><p className="text-xs muted">Alertas do Radar Político</p></div><button className="text-xs flex items-center gap-1 muted" onClick={markAll}><CheckCheck size={15}/> Marcar como lidas</button></div><div className="max-h-[420px] overflow-auto">{notifications.map(item=><Link key={item.id} href={item.href||"/clipping"} onClick={()=>openNotification(item)} className={`notification-item ${item.read?"opacity-65":""}`}><span className={`notification-dot ${item.read?"read":""}`}/><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><strong className="text-sm">{item.title}</strong><ExternalLink size={14} className="shrink-0 muted"/></div><p className="text-xs mt-1 line-clamp-2">{item.message}</p><span className="text-[11px] muted mt-2 block">{when(item.createdAt)}</span></div></Link>)}{!notifications.length&&<div className="p-10 text-center muted"><Bell className="mx-auto mb-3"/><p className="text-sm">Nenhuma notificação.</p></div>}</div></div>}</div><button className="icon-btn" aria-label="Alternar tema" onClick={()=>setTheme(resolvedTheme==='dark'?'light':'dark')}>{resolvedTheme==='dark'?<Sun size={18}/>:<Moon size={18}/>}</button><button onClick={logout} className="icon-btn" aria-label="Sair"><LogOut size={18}/></button></div></header><div className="app-content p-4 md:p-8 max-w-[1680px] mx-auto">{children}</div></main>
 </div>
}
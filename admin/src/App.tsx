import { useEffect, useMemo, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LayoutDashboard, Users, GraduationCap, BookOpen, CalendarCheck, Wallet, Inbox, LogOut, ShieldCheck, Search, RefreshCw } from 'lucide-react';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const db: SupabaseClient | null = url && key ? createClient(url, key) : null;
type Role = 'admin' | 'manager' | 'accountant' | 'teacher' | 'student';
type Tab = 'overview' | 'students' | 'teachers' | 'courses' | 'study_groups' | 'attendance' | 'payments' | 'applications';
const labels: Record<Tab,string> = { overview:'Обзор', students:'Ученики', teachers:'Преподаватели', courses:'Курсы', study_groups:'Группы', attendance:'Посещаемость', payments:'Платежи', applications:'Заявки' };
const roleNames: Record<Role,string> = { admin:'Главный администратор', manager:'Менеджер', accountant:'Бухгалтер', teacher:'Преподаватель', student:'Ученик' };
const icons: Record<Tab,any> = { overview:LayoutDashboard, students:Users, teachers:GraduationCap, courses:BookOpen, study_groups:Users, attendance:CalendarCheck, payments:Wallet, applications:Inbox };
const access: Record<Role,Tab[]> = {
 admin:['overview','students','teachers','courses','study_groups','attendance','payments','applications'],
 manager:['overview','students','teachers','courses','study_groups','attendance','applications'],
 accountant:['overview','students','payments'],
 teacher:['overview','study_groups','attendance'],
 student:['overview']
};
export default function App() {
 const [session,setSession] = useState<any>(null), [role,setRole] = useState<Role|null>(null), [email,setEmail] = useState(''), [password,setPassword] = useState(''), [error,setError] = useState(''), [tab,setTab] = useState<Tab>('overview'), [rows,setRows] = useState<any[]>([]), [loading,setLoading] = useState(false), [query,setQuery] = useState('');
 useEffect(()=>{ if(!db) return; db.auth.getSession().then(({data})=>setSession(data.session)); const {data:{subscription}}=db.auth.onAuthStateChange((_event,s)=>setSession(s)); return ()=>subscription.unsubscribe(); },[]);
 useEffect(()=>{ let alive=true; async function loadRole(){ if(!db||!session?.user) {setRole(null);return;} const {data,error}=await db.from('profiles').select('role').eq('id',session.user.id).maybeSingle(); if(!alive)return; if(error){setError('Не удалось проверить роль: '+error.message);setRole(null);return;} setRole((data?.role as Role)||null); } loadRole(); return ()=>{alive=false}; },[session]);
 const allowed = role ? access[role] : [];
 useEffect(()=>{ if(!db||!session||!role||!allowed.includes(tab)||tab==='overview') {setRows([]);return;} let alive=true; setLoading(true); db.from(tab).select('*').order('created_at',{ascending:false}).limit(100).then(({data,error})=>{if(!alive)return;setRows(data||[]);setError(error?.message||'');setLoading(false);}); return ()=>{alive=false}; },[session,role,tab]);
 const visible = useMemo(()=>rows.filter(r=>JSON.stringify(r).toLowerCase().includes(query.toLowerCase())),[rows,query]);
 async function signIn(e:React.FormEvent){e.preventDefault();if(!db){setError('Добавь VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в Vercel.');return;}const {error}=await db.auth.signInWithPassword({email,password});setError(error?.message||'');}
 async function signOut(){await db?.auth.signOut();setRole(null);}
 if(!db) return <main className="center"><section className="login"><h1>Zehin dag</h1><p>Добавь переменные окружения Supabase в настройках Vercel.</p><code>VITE_SUPABASE_URL</code><code>VITE_SUPABASE_ANON_KEY</code></section></main>;
 if(!session) return <main className="center"><form className="login" onSubmit={signIn}><div className="mark">ZD</div><small>OKUW MERKEZI</small><h1>Вход в админ-панель</h1><p>Только для авторизованных сотрудников.</p><input type="email" placeholder="Рабочая почта" value={email} onChange={e=>setEmail(e.target.value)} required/><input type="password" placeholder="Пароль" value={password} onChange={e=>setPassword(e.target.value)} required/><button>Войти</button>{error&&<p className="error">{error}</p>}</form></main>;
 if(!role) return <main className="center"><section className="login"><ShieldCheck size={34}/><h1>Доступ не назначен</h1><p>Для этого аккаунта не найдена разрешённая роль. Попроси главного администратора назначить роль в профиле Supabase.</p><button onClick={signOut}>Выйти</button>{error&&<p className="error">{error}</p>}</section></main>;
 return <div className="layout"><aside><div className="brand"><div className="mark">ZD</div><div><b>Zehin dag</b><small>Okuw Merkezi</small></div></div><div className="role">{roleNames[role]}</div><nav>{allowed.map(k=>{const Icon=icons[k];return <button className={tab===k?'active':''} onClick={()=>setTab(k)} key={k}><Icon size={18}/>{labels[k]}</button>})}</nav><button className="logout" onClick={signOut}><LogOut size={18}/>Выйти</button></aside><main className="content"><header><div><small>ZEHIN DAG / CONTROL PANEL</small><h1>{labels[tab]}</h1></div><div className="user">{session.user.email}<span>{roleNames[role]}</span></div></header>{error&&<div className="notice">{error}</div>}{tab==='overview'?<section className="welcome"><ShieldCheck size={30}/><h2>Добро пожаловать</h2><p>Ваш уровень доступа: <b>{roleNames[role]}</b>. В меню отображаются только разрешённые разделы.</p><p>Для изменения ролей сотрудников обратитесь к главному администратору.</p></section>:<section className="panel"><div className="panelHead"><div><h2>{labels[tab]}</h2><small>{visible.length} записей</small></div><div className="tools"><label><Search size={17}/><input placeholder="Поиск" value={query} onChange={e=>setQuery(e.target.value)}/></label><button className="refresh" onClick={()=>setTab(tab)}><RefreshCw size={17}/></button></div></div>{loading?<p>Загрузка…</p>:visible.length?<div className="tableWrap"><table><thead><tr>{Object.keys(visible[0]).slice(0,6).map(k=><th key={k}>{k}</th>)}</tr></thead><tbody>{visible.map((r,i)=><tr key={r.id||i}>{Object.keys(visible[0]).slice(0,6).map(k=><td key={k}>{String(r[k]??'—')}</td>)}</tr>)}</tbody></table></div>:<p className="empty">Нет доступных записей или данных.</p>}</section>}</main></div>;
}
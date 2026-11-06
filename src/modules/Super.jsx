import {useState} from 'react'
import {useS,PLANS} from '../store'
import {Sheet,Field,Btn,Badge,Kpis,Seg,f,tzs} from '../ui'
const NAVS=[['overview','📊','Overview'],['tenants','🏢','Tenants'],['plans','💳','Plans'],['activity','🛡️','Activity']]
const rev=t=>t.branches.reduce((a,b)=>a+b.data.sales.reduce((q,s)=>q+s.kg*s.price,0),0)
export default function Super(){
const {db,x}=useS();const [t,setT]=useState('overview');const [o,setO]=useState(null);const [pin,setPin]=useState('');const [q,setQ]=useState('')
const pr=id=>PLANS.find(p=>p.id===id)?.price||0,act=db.tenants.filter(z=>z.status!=='suspended'),mrr=act.reduce((a,z)=>a+pr(z.plan),0)
const tn=o&&db.tenants.find(z=>z.id===o),col={active:'green',trial:'blue',suspended:'red'}
const mon={};db.tenants.forEach(z=>{const k=z.created.slice(0,7);mon[k]=(mon[k]||0)+1});const mm=Math.max(1,...Object.values(mon))
const list=db.tenants.filter(z=>z.name.toLowerCase().includes(q.toLowerCase()))
return <div className="app"><aside className="side"><div className="logo"><span>🛰️</span>Platform</div>{NAVS.map(n=><button key={n[0]} className={t===n[0]?'on':''} onClick={()=>setT(n[0])}><span>{n[1]}</span>{n[2]}</button>)}<div className="sp"/><button onClick={x.logout}><span>⏻</span>Logout</button></aside>
<div className="col"><header><div><small>🐟 FishTrade platform</small><h1>{NAVS.find(n=>n[0]===t)[2]}</h1></div><div className="me"><span><b>Super Admin</b><small>Full control</small></span><button className="back lo" onClick={x.logout}>Logout</button></div></header>
<main><div className="pg">
{t==='overview'&&<><Kpis a={[['Companies',db.tenants.length+' ('+act.length+' live)','🏢'],['Monthly revenue (MRR)',tzs(mrr),'💳'],['Branches',db.tenants.reduce((a,z)=>a+z.branches.length,0),'🏬'],['Users',db.tenants.reduce((a,z)=>a+z.staff.length,0),'👥'],['Platform sales volume',tzs(db.tenants.reduce((a,z)=>a+rev(z),0)),'💰'],['Suspended',db.tenants.filter(z=>z.status==='suspended').length,'⛔']]}/>
<div className="card"><h4>New companies by month</h4>{Object.entries(mon).sort().map(([k,v])=><div className="barx" key={k}><div className="bl"><span>{k}</span><b>{v}</b></div><div className="tr"><i style={{width:v/mm*100+'%'}}/></div></div>)}</div>
<div className="card"><h4>Top companies by sales</h4>{[...db.tenants].sort((a,b)=>rev(b)-rev(a)).map(z=><div className="row" key={z.id}><span>{z.name}</span><b>{tzs(rev(z))}</b></div>)}</div>
<div className="card"><h4>Plan mix</h4>{PLANS.map(p=><div className="row" key={p.id}><span>{p.id}</span><b>{db.tenants.filter(z=>z.plan===p.id).length} companies</b></div>)}</div></>}
{t==='tenants'&&<><div className="card wide"><Field label="Search company"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Type a company name"/></Field></div>
{list.map(z=><div className="card" key={z.id}><div className="row"><b>🏢 {z.name}</b><Badge c={col[z.status]}>{z.status}</Badge></div><div className="row mut"><span>{z.plan} · {z.branches.length} branches · {z.staff.length} users</span><span>since {z.created}</span></div>
<div className="row"><span>Sales {tzs(rev(z))}</span><Btn c="sm" onClick={()=>setO(z.id)}>Manage</Btn></div></div>)}</>}
{t==='plans'&&PLANS.map(p=><div className="card" key={p.id}><div className="row"><b>{p.id}</b><b>{tzs(p.price)}/month</b></div><div className="mut">{p.note}</div><div className="row"><span>Up to {p.branches>50?'unlimited':p.branches} branches · {p.users>500?'unlimited':p.users} users</span><Badge c="blue">{db.tenants.filter(z=>z.plan===p.id).length} companies</Badge></div></div>)}
{t==='activity'&&(db.plat.log.length?db.plat.log.map(l=><div className="card" key={l.id}><b>{l.m}</b><div className="mut">{l.t}</div></div>):<p className="mut">No platform activity yet.</p>)}
</div></main>
<nav className="bnav">{NAVS.map(n=><button key={n[0]} className={t===n[0]?'on':''} onClick={()=>setT(n[0])}><span>{n[1]}</span>{n[2]}</button>)}</nav></div>
{tn&&<Sheet title={tn.name} onClose={()=>setO(null)}><p className="mut">{tn.sector} · {tn.region} · owner @{(tn.staff.find(y=>y.role==='Owner')||tn.staff[0]).username}</p>
<Field label="Plan"><select value={tn.plan} onChange={e=>x.setTenant(tn.id,{plan:e.target.value},'Plan of '+tn.name+' set to '+e.target.value)}>{PLANS.map(p=><option key={p.id}>{p.id}</option>)}</select></Field>
<h4>Branches</h4>{tn.branches.map(b=><div className="row" key={b.id}><span>{b.name}</span><b>{tzs(b.data.sales.reduce((a,s)=>a+s.kg*s.price,0))}</b></div>)}
<div className="two" style={{marginTop:12}}>{tn.status==='suspended'?<Btn c="pri" onClick={()=>x.setTenant(tn.id,{status:'active'},'Activated '+tn.name)}>Activate</Btn>:<Btn c="pri" style={{background:'#d1432f'}} onClick={()=>x.setTenant(tn.id,{status:'suspended'},'Suspended '+tn.name)}>Suspend</Btn>}<Btn c="pri" onClick={()=>{x.impersonate(tn.id);setO(null)}}>Open as owner</Btn></div>
<Field label="Reset owner PIN"><input type="password" inputMode="numeric" value={pin} onChange={e=>setPin(e.target.value)} placeholder="New 4-6 digit PIN"/></Field><Btn c="ghost" disabled={!/^\d{4,6}$/.test(pin)} onClick={()=>{x.resetPin(tn.id,pin);setPin('')}}>Reset PIN</Btn></Sheet>}</div>}

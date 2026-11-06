import {useState} from 'react'
import {useS,ROLES} from './store'
import Home from './modules/Home'
import Buy from './modules/Buy'
import Stock from './modules/Stock'
import Sales from './modules/Sales'
import Suppliers from './modules/Suppliers'
import Quality from './modules/Quality'
import Payments from './modules/Payments'
import Transport from './modules/Transport'
import Expenses from './modules/Expenses'
import Compliance from './modules/Compliance'
import Audit from './modules/Audit'
import Reports from './modules/Reports'
import Staff from './modules/Staff'
import Hq from './modules/Hq'
import Super from './modules/Super'
import Landing from './modules/Landing'
import Register from './modules/Register'
import Login from './modules/Login'
const M={home:['Business overview','🏠',Home],hq:['HQ analytics','🏛️',Hq],buy:['Fish purchases','🎣',Buy],stock:['Stock & batches','🧊',Stock],sales:['Sales to industry','🚚',Sales],
suppliers:['Fishermen & suppliers','🧑‍🌾',Suppliers],quality:['Quality inspection','🔍',Quality],payments:['Supplier payments','💵',Payments],transport:['Transport & costs','🚛',Transport],expenses:['Expenses & profit','📊',Expenses],compliance:['Licences & permits','📜',Compliance],audit:['Audit log','🛡️',Audit],reports:['Reports','📈',Reports],staff:['Staff & access','👥',Staff]}
const LAB={home:'Home',hq:'HQ',buy:'Purchases',stock:'Stock',sales:'Sales',quality:'Quality',suppliers:'Suppliers',payments:'Payments',transport:'Transport',expenses:'Expenses',reports:'Reports',compliance:'Licences',audit:'Audit',staff:'Staff'}
const NAV=[['home','Home'],['buy','Buy'],['stock','Stock'],['sales','Sales'],['more','More']]
const MORE=['hq','staff','reports','suppliers','quality','payments','transport','expenses','compliance','audit']
const SIDE=['home','hq','buy','stock','sales','quality','suppliers','payments','transport','expenses','reports','compliance','audit','staff']
export default function App(){
const {s,db,T,B,me,x,ses,a}=useS();const [t,setT]=useState('home');const [view,setView]=useState(()=>location.hash.replace('#/','')||'')
const nav=v=>{location.hash=v?'#/'+v:'';setView(v);setT('home')}
if(ses&&ses.kind==='super')return <Super/>
if(!s){return view==='login'?<Login go={nav}/>:view==='register'?<Register go={nav}/>:<Landing go={nav}/>}
const hq=!me.branch||me.branch==='all'
const ok=k=>!ROLES[s.role]||ROLES[s.role].includes(k),more=MORE.filter(ok)
const tab=t==='more'||ok(t)?t:'home',sub=MORE.includes(tab),Cur=M[tab]?.[2]
const soon=new Date(Date.now()+30*864e5).toISOString().slice(0,10)
const bd={quality:s.batches.filter(b=>b.st==='pending').length,compliance:s.comp.filter(c=>c.exp<soon).length}
const out=()=>{x.logout();nav('')}
return <div className="app">
<aside className="side"><div className="logo"><span>🐟</span>FishTrade</div>
{SIDE.filter(ok).map(k=><button key={k} className={tab===k?'on':''} onClick={()=>setT(k)}><span>{M[k][1]}</span>{LAB[k]}{bd[k]>0&&<i className="bdg">{bd[k]}</i>}</button>)}
<div className="sp"/><button onClick={out}><span>⏻</span>Logout</button></aside>
<div className="col">{ses.imp&&<div className="impb">Support view of {T.name} <button onClick={x.exitImp}>Exit</button></div>}
<header><div>{sub?<button className="back mb" onClick={()=>setT('more')}>‹ More</button>:<small>🐟 {T.name}</small>}<h1>{tab==='more'?'More modules':M[tab][0]}</h1></div>
<div className="me">{hq&&T.branches.length>1?<select className="role" value={B.id} onChange={e=>{x.switchBranch(e.target.value);setT('home')}}>{T.branches.map(b=><option key={b.id} value={b.id}>🏬 {b.name}</option>)}</select>:<span className="role br">🏬 {B.name}</span>}
<span><b>{me.name.split(' ')[0]}</b><small>{s.role}</small></span><button className="back lo" onClick={out}>Logout</button></div></header>
<main key={B.id} className={s.role==='Auditor'?'ro':''}>{tab==='more'?<div className="pg grid2">{more.map(k=><button className="card tile" key={k} onClick={()=>setT(k)}><span>{M[k][1]}</span>{M[k][0]}</button>)}</div>:<Cur go={setT}/>}</main>
<nav className="bnav">{NAV.filter(([k])=>k==='more'?more.length>0:ok(k)).map(([k,l])=>{const on=tab===k||(k==='more'&&sub);return <button key={k} className={on?'on':''} onClick={()=>setT(k)}><span>{k==='more'?'☰':M[k][1]}</span>{l}</button>})}</nav></div></div>}

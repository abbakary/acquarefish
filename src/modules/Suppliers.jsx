import {useState} from 'react'
import {useS,SITES,supBal,tot} from '../store'
import {Sheet,Field,Btn,Fab,Empty,Kpis,f,tzs} from '../ui'
export default function Suppliers(){
const {s,a}=useS();const [open,setOpen]=useState(false);const [v,setV]=useState(null)
const [d,setD]=useState({name:'',phone:'',site:SITES[0],cat:'Fisherman'});const set=k=>e=>setD({...d,[k]:e.target.value})
const sv=v&&s.suppliers.find(x=>x.id===v)
return <div className="pg"><Kpis a={[['Suppliers',s.suppliers.length,'🧑‍🌾'],['Kg supplied',f(s.batches.reduce((t,b)=>t+b.kg,0))+' kg','🎣'],['Owed',tzs(s.suppliers.reduce((t,x)=>t+supBal(s,x.id),0)),'💵']]}/>{s.suppliers.length===0&&<Empty t="No suppliers yet."/>}
{s.suppliers.map(x=>{const kg=s.batches.filter(b=>b.sup===x.id).reduce((t,b)=>t+b.kg,0);const bal=supBal(s,x.id)
return <div className="card" key={x.id} onClick={()=>setV(x.id)}><div className="row"><b>🧑‍🌾 {x.name}</b><span className="mut">{x.cat}</span></div>
<div className="row mut"><span>{x.phone} · {x.site}</span><span>{f(kg)} kg</span></div>
<div className="row"><span>Owed</span><b className={bal>0?'neg':''}>{tzs(bal)}</b></div></div>})}
<Fab onClick={()=>setOpen(true)}>＋ Supplier</Fab>
{open&&<Sheet title="New supplier" onClose={()=>setOpen(false)}>
<Field label="Name"><input value={d.name} onChange={set('name')}/></Field><Field label="Phone"><input type="tel" value={d.phone} onChange={set('phone')}/></Field>
<div className="two"><Field label="Landing site"><select value={d.site} onChange={set('site')}>{SITES.map(x=><option key={x}>{x}</option>)}</select></Field>
<Field label="Type"><select value={d.cat} onChange={set('cat')}>{['Fisherman','Group','Agent','Dealer'].map(x=><option key={x}>{x}</option>)}</select></Field></div>
<Btn c="pri" disabled={!d.name} onClick={()=>{a.addSup(d);setOpen(false);setD({...d,name:'',phone:''})}}>Save supplier</Btn></Sheet>}
{sv&&<Sheet title={sv.name} onClose={()=>setV(null)}><p className="mut">{sv.phone} · {sv.site}</p>
<h4>Deliveries</h4>{s.batches.filter(b=>b.sup===sv.id).map(b=><div className="row" key={b.id}><span>{b.date} · {b.sp} {f(b.kg)} kg</span><b>{tzs(tot(b))}</b></div>)}
<h4>Payments</h4>{s.pays.filter(p=>p.sup===sv.id).map(p=><div className="row" key={p.id}><span>{p.date} · {p.m}</span><b>{tzs(p.amt)}</b></div>)}
<div className="total">Balance owed <b>{tzs(supBal(s,sv.id))}</b></div></Sheet>}</div>}

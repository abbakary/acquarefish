import {useState} from 'react'
import {useS} from '../store'
import {Sheet,Field,Btn,Fab,Badge} from '../ui'
const T=['Fish dealer licence','Landing site licence','Movement permit','Transport certificate','Sanitary certificate','Export permit']
export default function Compliance(){
const {s,a}=useS();const [o,setO]=useState(false);const [d,setD]=useState({type:T[0],ref:'',who:'',exp:''});const set=k=>e=>setD({...d,[k]:e.target.value})
return <div className="pg"><p className="mut">Records only. Official permits are issued through FiRCIS / the Ministry.</p>
{[...s.comp].sort((x,y)=>x.exp.localeCompare(y.exp)).map(c=>{const n=Math.ceil((new Date(c.exp)-new Date())/864e5)
return <div className="card" key={c.id}><div className="row"><b>📜 {c.type}</b><Badge c={n<0?'red':n<=30?'orange':'green'}>{n<0?'Expired':n<=30?n+' days left':'Valid'}</Badge></div>
<div className="row mut"><span>{c.ref} · {c.who}</span><span>Expires {c.exp}</span></div></div>})}
<Fab onClick={()=>setO(true)}>＋ Licence / permit</Fab>
{o&&<Sheet title="Add document" onClose={()=>setO(false)}><Field label="Type"><select value={d.type} onChange={set('type')}>{T.map(x=><option key={x}>{x}</option>)}</select></Field>
<Field label="Reference number"><input value={d.ref} onChange={set('ref')}/></Field><Field label="Holder / vehicle / supplier"><input value={d.who} onChange={set('who')}/></Field>
<Field label="Expiry date"><input type="date" value={d.exp} onChange={set('exp')}/></Field>
<Btn c="pri" disabled={!d.ref||!d.exp} onClick={()=>{a.addComp(d);setO(false);setD({...d,ref:'',who:'',exp:''})}}>Save</Btn></Sheet>}</div>}

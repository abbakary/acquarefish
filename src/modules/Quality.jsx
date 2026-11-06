import {useState} from 'react'
import {useS} from '../store'
import {Sheet,Field,Btn,Empty,Badge,FishImg,Kpis,f} from '../ui'
export default function Quality(){
const {s,a}=useS();const [b,setB]=useState(null);const [d,setD]=useState({acc:'',temp:'',reason:''})
const pend=s.batches.filter(x=>x.st==='pending'),done=s.batches.filter(x=>x.st!=='pending')
const set=k=>e=>setD({...d,[k]:e.target.value})
const acc=d.acc===''?b?.kg:+d.acc
return <div className="pg"><Kpis a={[['Awaiting',pend.length,'⏳'],['Accepted',f(done.reduce((t,x)=>t+x.kg-x.rej,0))+' kg','✅'],['Rejected',f(done.reduce((t,x)=>t+x.rej,0))+' kg','❌'],['Inspected',done.length,'🔍']]}/><h4 className="sec">Waiting for inspection</h4>
{pend.length===0&&<Empty t="All deliveries inspected."/>}
{pend.map(x=><div className="card" key={x.id}><div className="row"><b>{x.no}</b><span className="fc"><FishImg sp={x.sp} s={34}/>{x.sp} · {x.grade}</span></div>
<div className="row"><span className="mut">{f(x.kg)} kg from {s.suppliers.find(y=>y.id===x.sup)?.name}</span><Btn c="sm" onClick={()=>{setB(x);setD({acc:'',temp:'',reason:''})}}>Inspect</Btn></div></div>)}
<h4 className="sec">Inspection history</h4>
{done.map(x=><div className="card" key={x.id}><div className="row"><b>{x.no}</b><Badge c={x.st==='accepted'?'green':'red'}>{x.st}</Badge></div><div className="row mut"><span>Rejected {f(x.rej)} kg · {x.temp??'-'}°C</span><span>{x.reason||''}</span></div></div>)}
{b&&<Sheet title={'Inspect '+b.no} onClose={()=>setB(null)}>
<div className="two"><Field label={`Accepted kg (of ${b.kg})`}><input type="number" value={d.acc} placeholder={b.kg} onChange={set('acc')}/></Field>
<Field label="Temperature °C"><input type="number" value={d.temp} onChange={set('temp')}/></Field></div>
{acc<b.kg&&<Field label="Rejection reason"><input value={d.reason} onChange={set('reason')} placeholder="e.g. spoiled, too warm"/></Field>}
<p className="mut">Rejected fish never enter saleable stock.</p>
<Btn c="pri" disabled={!(acc>=0&&acc<=b.kg)} onClick={()=>{a.inspect(b.id,acc,d.temp===''?null:+d.temp,d.reason);setB(null)}}>Save inspection</Btn></Sheet>}</div>}

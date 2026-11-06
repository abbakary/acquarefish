import {useState} from 'react'
import {useS,stock,landed} from '../store'
import {Sheet,Field,Btn,Badge,Empty,FishImg,f} from '../ui'
export default function Stock(){
const {s,a}=useS();const [open,setOpen]=useState(null);const [m,setM]=useState(null);const [d,setD]=useState({b:'',to:'',kg:'',why:''})
const st=Object.entries(stock(s)),live=s.batches.filter(b=>b.rem>0),W=b=>b.wh||s.wh[0]
const bid=d.b||live[0]?.id,bb=s.batches.find(x=>x.id===bid),to=d.to&&d.to!==W(bb||{})?d.to:s.wh.find(w=>w!==W(bb||{}))
const set=k=>e=>setD({...d,[k]:e.target.value})
return <div className="pg">
<div className="two tb"><Btn c="pri" onClick={()=>setM('tr')}>⇄ Transfer</Btn><Btn c="pri" onClick={()=>setM('ws')}>🗑 Write-off</Btn></div>
<div className="grid2">{s.wh.map(w=><div className="card kpi" key={w}><span>❄️</span><small>{w}</small><b>{f(live.filter(b=>W(b)===w&&b.st==='accepted').reduce((t,b)=>t+b.rem,0))} kg</b></div>)}</div>
<div className="card"><h4>By fish &amp; grade</h4>{st.length===0&&<p className="mut">No saleable stock. Inspect new purchases to release them.</p>}{st.map(([k,v])=><div className="row" key={k}><span className="fc"><FishImg sp={k} s={34}/>{k.replace('|',' · Grade ')}</span><b>{f(v)} kg</b></div>)}</div>
<h4 className="sec">Batches &amp; traceability</h4>
{[...s.batches].reverse().map(b=>{const sup=s.suppliers.find(x=>x.id===b.sup),sold=s.sales.filter(x=>x.alloc.some(l=>l.b===b.id))
return <div className="card" key={b.id} onClick={()=>setOpen(open===b.id?null:b.id)}>
<div className="row"><b>{b.no}</b><Badge c={b.st==='accepted'?'green':b.st==='rejected'?'red':'orange'}>{b.st}</Badge></div>
<div className="row"><span className="fc"><FishImg sp={b.sp} s={38}/>{b.sp} · {b.grade} · ❄️ {W(b)}</span><b>{f(b.rem)} / {f(b.kg)} kg</b></div>
<div className="tr"><i style={{width:b.kg?b.rem/b.kg*100+'%':0}}/></div>
{open===b.id&&<div className="trace">
<p>📍 Bought at <b>{b.site}</b> on {b.date} from <b>{sup?.name}</b></p>
<p>💲 Landed cost <b>TZS {f(landed(s,b))}/kg</b> (fish {f(b.price)} + transport {f(landed(s,b)-b.price)})</p>
<p>🔍 {b.st==='pending'?'Not inspected yet':`Inspected ${b.insp||''}: ${b.temp??'-'}°C, rejected ${f(b.rej)} kg${b.reason?' ('+b.reason+')':''}`}</p>
{b.waste>0&&<p>🗑 Written off {f(b.waste)} kg</p>}
<p>🚚 {sold.length?sold.map(x=>`${x.no} → ${s.customers.find(c=>c.id===x.cus)?.name} (${x.alloc.find(l=>l.b===b.id).kg} kg)`).join('; '):'Not sold yet'}</p></div>}</div>})}
{m&&<Sheet title={m==='tr'?'Transfer stock':'Write off spoiled fish'} onClose={()=>setM(null)}>
{live.length===0?<p>No stock to move.</p>:<>
<Field label="Batch"><select value={bid} onChange={set('b')}>{live.map(b=><option key={b.id} value={b.id}>{b.no} · {b.sp} · {f(b.rem)} kg · {W(b)}</option>)}</select></Field>
{m==='tr'?<><Field label="Move to"><select value={to} onChange={set('to')}>{s.wh.filter(w=>w!==W(bb)).map(w=><option key={w}>{w}</option>)}</select></Field>
<Btn c="pri" disabled={!to} onClick={()=>{a.transfer(bid,to);setM(null)}}>Move batch</Btn></>
:<><Field label="Kilograms lost"><input type="number" value={d.kg} onChange={set('kg')}/></Field><Field label="Reason"><input value={d.why} onChange={set('why')} placeholder="spoilage, damage, ice melt"/></Field>
<Btn c="pri" disabled={!(+d.kg>0&&+d.kg<=bb.rem)} onClick={()=>{a.waste(bid,+d.kg,d.why);setM(null);setD({...d,kg:'',why:''})}}>Record loss</Btn></>}</>}</Sheet>}
</div>}

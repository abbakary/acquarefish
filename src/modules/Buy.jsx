import {useState} from 'react'
import {useS,SPECIES,tot,supBal,nowL} from '../store'
import {Sheet,Field,Badge,Empty,Fab,Btn,Receipt,FishImg,f,tzs,fmtT,atOf} from '../ui'
const init={sup:'',sp:SPECIES[0],grade:'A',kg:'',price:'',paid:'',method:'Cash',manual:false,when:''}
export default function Buy(){
const {s,a}=useS();const [open,setOpen]=useState(false);const [rc,setRc]=useState(null);const [step,setStep]=useState(0);const [d,setD]=useState(init)
const set=k=>e=>setD({...d,[k]:e.target.value})
const total=(+d.kg||0)*(+d.price||0),sup=d.sup||s.suppliers[0]?.id,sx=s.suppliers.find(x=>x.id===sup),paid=Math.min(+d.paid||0,total)
const ok2=+d.kg>0&&+d.price>0&&!(d.manual&&(!d.when||d.when>nowL()))
const save=()=>{const at=d.manual&&d.when?d.when:nowL();a.buy({at,date:at.slice(0,10),manual:!!(d.manual&&d.when),sup,sp:d.sp,grade:d.grade,kg:+d.kg,price:+d.price,paid,method:d.method,site:sx.site});setOpen(false);setStep(0);setD(init)}
const col={pending:'orange',accepted:'green',rejected:'red'}
return <div className="pg">
{s.batches.length===0&&<Empty t="No purchases yet. Tap + to weigh and buy fish."/>}
{[...s.batches].reverse().map(b=><div className="card pc" key={b.id}><FishImg sp={b.sp} s={64}/><div className="pcb">
<div className="row"><b>{b.pur}</b><Badge c={col[b.st]}>{b.st==='pending'?'Awaiting inspection':b.st}</Badge></div>
<div className="row"><span>{b.sp} · Grade {b.grade}</span><b>{f(b.kg)} kg</b></div>
<div className="row mut"><span>{s.suppliers.find(x=>x.id===b.sup)?.name} · {b.site}</span><span>@ {f(b.price)}</span></div>
<div className="row"><span className="mut">🕒 {fmtT(atOf(b))}{b.manual?' ✍':''}</span><b>{tzs(tot(b))}</b></div>
<div className="row"><span className="mut">🔒 Locked</span><Btn c="sm" onClick={()=>setRc(b)}>Receipt</Btn></div></div></div>)}
<Fab onClick={()=>setOpen(true)}>＋ New purchase</Fab>
{open&&<Sheet title="New purchase" onClose={()=>{setOpen(false);setStep(0)}}>
<div className="steps">{['Supplier','Fish details','Confirm'].map((x,i)=><div key={x} className={'st'+(i<=step?' on':'')}><i>{i+1}</i>{x}</div>)}</div>
{s.suppliers.length===0?<p>Add a supplier first (More → Suppliers).</p>:<>
{step===0&&<>{s.suppliers.map(x=><div key={x.id} className={'opt'+(x.id===sup?' sel':'')} onClick={()=>setD({...d,sup:x.id})}><span>🧑‍🌾</span><div><b>{x.name}</b><div className="mut">{x.site} · {x.phone}</div></div></div>)}<Btn c="pri" onClick={()=>setStep(1)}>Next: Fish details →</Btn></>}
{step===1&&<><div className="fgrid">{SPECIES.map(x=><div key={x} className={'opt col'+(x===d.sp?' sel':'')} onClick={()=>setD({...d,sp:x})}><FishImg sp={x} s={70}/><b>{x}</b></div>)}</div>
<div className="two"><Field label="Quality"><select value={d.grade} onChange={set('grade')}>{['A','B','C'].map(x=><option key={x} value={x}>Grade {x}</option>)}</select></Field>
<Field label="Quantity (kg)"><input type="number" inputMode="decimal" value={d.kg} onChange={set('kg')}/></Field></div>
<Field label="Price per kg (TZS)"><input type="number" inputMode="numeric" value={d.price} onChange={set('price')}/></Field>
<div className="total blue">Total Amount <b>{tzs(total)}</b></div>
<label className="chk"><input type="checkbox" checked={d.manual} onChange={e=>setD({...d,manual:e.target.checked,when:d.when||nowL()})}/> Enter date &amp; time manually</label>
{d.manual?<Field label="Purchase date &amp; time"><input type="datetime-local" max={nowL()} value={d.when} onChange={set('when')}/></Field>:<p className="mut">🕒 Time is recorded automatically when you save.</p>}
<div className="two"><Btn c="ghost" onClick={()=>setStep(0)}>← Back</Btn><Btn c="pri" disabled={!ok2} onClick={()=>setStep(2)}>Next: Confirm →</Btn></div></>}
{step===2&&<><div className="rcpt"><div className="row"><FishImg sp={d.sp} s={56}/><b>{d.sp} · Grade {d.grade}</b></div><div>Supplier: {sx?.name} ({sx?.site})</div><div>{f(d.kg)} kg × TZS {f(d.price)}</div><div>🕒 {fmtT(d.manual&&d.when?d.when:nowL())}{d.manual?' (manual)':' (automatic)'}</div><b>Total: {tzs(total)}</b></div>
<div className="two"><Field label="Pay now (TZS)"><input type="number" inputMode="numeric" value={d.paid} onChange={set('paid')}/></Field><Field label="Method"><select value={d.method} onChange={set('method')}>{['Cash','Mobile money','Bank'].map(x=><option key={x}>{x}</option>)}</select></Field></div>
<p className="mut">Balance owed to supplier: {tzs(total-paid)}</p>
<div className="two"><Btn c="ghost" onClick={()=>setStep(1)}>← Back</Btn><Btn c="pri" onClick={save}>✓ Save purchase</Btn></div></>}</>}
</Sheet>}
{rc&&<Receipt title={'Receipt '+rc.pur} onClose={()=>setRc(null)} lines={['Supplier: '+s.suppliers.find(x=>x.id===rc.sup)?.name,rc.sp+' Grade '+rc.grade,f(rc.kg)+' kg x '+f(rc.price),'Total: '+tzs(tot(rc)),'Site: '+rc.site+' · '+fmtT(atOf(rc)),'Supplier balance: '+tzs(supBal(s,rc.sup))]}/>}</div>}

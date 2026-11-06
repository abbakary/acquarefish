import {useState} from 'react'
import {useS,stock,cusBal} from '../store'
import {Sheet,Field,Btn,Fab,Seg,Badge,Empty,Receipt,Kpis,f,tzs} from '../ui'
export default function Sales(){
const {s,a}=useS();const [v,setV]=useState('Sales');const [o,setO]=useState(null);const [rc,setRc]=useState(null);const [amt,setAmt]=useState('');const [inv,setInv]=useState(null)
const st=stock(s),keys=Object.keys(st)
const [d,setD]=useState({cus:'',key:'',kg:'',price:'',paid:''});const set=k=>e=>setD({...d,[k]:e.target.value})
const cus=d.cus||s.customers[0]?.id,key=d.key||keys[0]||'|',[sp,grade]=key.split('|'),av=st[key]||0,total=(+d.kg||0)*(+d.price||0)
const [n,setN]=useState({name:'',phone:'',limit:''})
const lim=s.customers.find(c=>c.id===cus)?.limit||Infinity,over=cus&&cusBal(s,cus)+total-(+d.paid||0)>lim
const okS=cus&&+d.kg>0&&+d.kg<=av&&+d.price>0&&!over
return <div className="pg"><div className="toolbar"><Seg v={v} set={setV} items={['Sales','Customers']}/><Fab onClick={()=>setO(v==='Sales'?'sale':'cus')}>{v==='Sales'?'＋ New sale':'＋ Customer'}</Fab></div>
<Kpis a={[['Revenue',tzs(s.sales.reduce((t,x)=>t+x.kg*x.price,0)),'💰'],['Kg sold',f(s.sales.reduce((t,x)=>t+x.kg,0))+' kg','🚚'],['Outstanding',tzs(s.customers.reduce((t,c)=>t+cusBal(s,c.id),0)),'🏭'],['To dispatch',s.sales.filter(x=>x.dis.st!=='Delivered').length,'📦']]}/>
{v==='Sales'?<>{s.sales.length===0&&<Empty t="No sales yet."/>}
{[...s.sales].reverse().map(x=>{const bal=x.kg*x.price-x.paid;return <div className="card" key={x.id}>
<div className="row"><b>{x.no}</b><Badge c={bal>0?'orange':'green'}>{bal>0?'Owing':'Paid'}</Badge></div>
<div className="row"><span>{s.customers.find(c=>c.id===x.cus)?.name}</span><b>{f(x.kg)} kg</b></div>
<div className="row mut"><span>{x.sp} · {x.grade} @ {f(x.price)}</span><b>{tzs(x.kg*x.price)}</b></div>
<div className="row"><span className="mut">Batches: {x.alloc.map(l=>s.batches.find(b=>b.id===l.b)?.no).join(', ')}</span><span><Btn c="sm" onClick={()=>setInv(x)}>Invoice</Btn>{bal>0&&<Btn c="sm" onClick={()=>{setRc(x);setAmt('')}}>Receive</Btn>}</span></div></div>})}
</>
:<>{s.customers.map(c=><div className="card" key={c.id}><div className="row"><b>🏭 {c.name}</b><span className="mut">{c.phone}</span></div>
<div className="row"><span>Owes (limit {tzs(c.limit)})</span><b className="pos">{tzs(cusBal(s,c.id))}</b></div></div>)}
</>}
{o==='sale'&&<Sheet title="Sell to industry" onClose={()=>setO(null)}>
{keys.length===0||s.customers.length===0?<p>You need saleable stock and a customer first.</p>:<>
<Field label="Customer"><select value={cus} onChange={set('cus')}>{s.customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
<Field label="Fish in stock"><select value={key} onChange={set('key')}>{keys.map(k=><option key={k} value={k}>{k.replace('|',' · Grade ')} — {f(st[k])} kg</option>)}</select></Field>
<div className="two"><Field label="Quantity (kg)"><input type="number" value={d.kg} onChange={set('kg')}/></Field><Field label="Price per kg"><input type="number" value={d.price} onChange={set('price')}/></Field></div>
{over&&<p className="neg">Credit limit exceeded.</p>}{+d.kg>av&&<p className="neg">Only {f(av)} kg available.</p>}
<div className="total">Total <b>{tzs(total)}</b></div>
<Field label="Payment received now"><input type="number" value={d.paid} onChange={set('paid')}/></Field>
<Btn c="pri" disabled={!okS} onClick={()=>{a.sell({cus,sp,grade,kg:+d.kg,price:+d.price,paid:Math.min(+d.paid||0,total)});setO(null);setD({...d,kg:'',price:'',paid:''})}}>Confirm sale</Btn></>}</Sheet>}
{o==='cus'&&<Sheet title="New customer" onClose={()=>setO(null)}><Field label="Industry name"><input value={n.name} onChange={e=>setN({...n,name:e.target.value})}/></Field>
<Field label="Phone"><input value={n.phone} onChange={e=>setN({...n,phone:e.target.value})}/></Field>
<Field label="Credit limit (TZS)"><input type="number" value={n.limit} onChange={e=>setN({...n,limit:e.target.value})}/></Field>
<Btn c="pri" disabled={!n.name} onClick={()=>{a.addCus({...n,limit:+n.limit||0});setO(null);setN({name:'',phone:'',limit:''})}}>Save customer</Btn></Sheet>}
{rc&&<Sheet title={'Receive payment '+rc.no} onClose={()=>setRc(null)}><p>Outstanding: <b>{tzs(rc.kg*rc.price-rc.paid)}</b></p>
<Field label="Amount (TZS)"><input type="number" value={amt} onChange={e=>setAmt(e.target.value)}/></Field>
<Btn c="pri" disabled={!(+amt>0&&+amt<=rc.kg*rc.price-rc.paid)} onClick={()=>{a.receive(rc.id,+amt);setRc(null)}}>Record payment</Btn></Sheet>}
{inv&&<Receipt title={'Invoice '+inv.no} onClose={()=>setInv(null)} lines={['Customer: '+s.customers.find(c=>c.id===inv.cus)?.name,inv.sp+' Grade '+inv.grade,f(inv.kg)+' kg x '+f(inv.price),'Total: '+tzs(inv.kg*inv.price),'Paid: '+tzs(inv.paid),'Balance: '+tzs(inv.kg*inv.price-inv.paid),'Date: '+inv.date]}/>}</div>}

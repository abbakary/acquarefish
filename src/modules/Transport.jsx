import {useState} from 'react'
import {useS,SITES,trCost,refLabel,nowL} from '../store'
import {Sheet,Field,Btn,Fab,Badge,Empty,Kpis,Seg,f,tzs,fmtT,atOf} from '../ui'
const MODES={'Boda boda':'🏍️',Pickup:'🛻',Truck:'🚛',Boat:'⛵','Bus / other':'🚌'}
const TYPES=['Collection','Delivery','Internal']
const TL={Collection:'📥 Collection (site → operation)',Delivery:'📤 Delivery to customers',Internal:'🔁 Internal moves'}
const col={Pending:'orange','In transit':'blue',Delivered:'green'}
const blank={type:'Collection',mode:'Boda boda',from:'',to:'',ref:'',cost:'',veh:'',note:'',method:'Cash',manual:false,when:''}
export default function Transport(){
const {s,a}=useS();const [v,setV]=useState('Deliveries');const [x,setX]=useState(null);const [d,setD]=useState({});const [c,setC]=useState(null);const [fl,setFl]=useState('All')
const T=s.trips||[],tot=trCost(s),kg=s.batches.reduce((t,b)=>t+b.kg,0)
const sum=l=>l.reduce((t,y)=>t+y.cost,0),cn=id=>s.customers.find(z=>z.id===id)?.name||''
const set=k=>e=>setC({...c,[k]:e.target.value})
const setRef=e=>{const id=e.target.value,b=s.batches.find(y=>y.id===id),sl=s.sales.find(y=>y.id===id);let r={ref:id};if(b)r={...r,from:b.site,to:b.wh||s.wh[0]};if(sl)r={...r,from:s.wh[0],to:cn(sl.cus),veh:sl.dis.veh||c.veh};setC({...c,...r})}
const ok=c&&+c.cost>0&&c.from&&c.to&&!(c.manual&&(!c.when||c.when>nowL()))
const save=()=>{const at=c.manual&&c.when?c.when:nowL();a.addTrip({type:c.type,mode:c.mode,from:c.from,to:c.to,ref:c.ref,cost:+c.cost,veh:c.veh,note:c.note,method:c.method,at,date:at.slice(0,10),manual:!!(c.manual&&c.when)});setC(null)}
const list=T.filter(t=>fl==='All'||t.type===fl).sort((p,q)=>atOf(q).localeCompare(atOf(p)))
return <div className="pg"><div className="toolbar"><Seg v={v} set={setV} items={['Deliveries','Costs']}/><Fab onClick={()=>setC({...blank,type:v==='Deliveries'?'Delivery':'Collection',mode:v==='Deliveries'?'Truck':'Boda boda'})}>＋ Transport cost</Fab></div>
<Kpis a={[['Transport cost',tzs(tot),'🚚'],['Cost per kg bought',tzs(kg?tot/kg:0),'⚖️'],['Trips recorded',T.length,'🧾'],['Deliveries pending',s.sales.filter(y=>y.dis.st!=='Delivered').length,'⏳']]}/>
{v==='Deliveries'?<>{s.sales.length===0&&<Empty t="Sales appear here for dispatch."/>}
{[...s.sales].reverse().map(y=><div className="card" key={y.id}><div className="row"><b>{y.no}</b><Badge c={col[y.dis.st]}>{y.dis.st}</Badge></div>
<div className="row"><span>{cn(y.cus)}</span><b>{f(y.kg)} kg</b></div>
<div className="row"><span className="mut">🚛 {y.dis.veh||'No vehicle'} · {y.dis.drv||'No driver'}</span>{y.dis.st!=='Delivered'&&<Btn c="sm" onClick={()=>{setX(y);setD(y.dis)}}>Update</Btn>}</div>
<div className="row"><span className="mut">💰 Transport cost: {tzs(sum(T.filter(t=>t.ref===y.id)))}</span><Btn c="sm" onClick={()=>setC({...blank,type:'Delivery',mode:'Truck',ref:y.id,from:s.wh[0],to:cn(y.cus),veh:y.dis.veh||''})}>＋ Cost</Btn></div></div>)}</>
:<><div className="card"><h4>Where transport money goes</h4>{TYPES.map(k=>{const n=sum(T.filter(t=>t.type===k));return <div className="barx" key={k}><div className="bl"><span>{TL[k]}</span><b>{tzs(n)}</b></div><div className="tr"><i style={{width:(tot?n/tot*100:0)+'%'}}/></div></div>})}
<div>{Object.keys(MODES).map(k=>{const n=sum(T.filter(t=>t.mode===k));return n>0&&<span className="chp" key={k}>{MODES[k]} {k}: {f(n)}</span>})}</div></div>
<div className="chips">{['All',...TYPES].map(k=><button key={k} className={'chip'+(fl===k?' on':'')} onClick={()=>setFl(k)}>{k}</button>)}</div>
{list.length===0&&<Empty t="No transport costs recorded."/>}
{list.map(t=><div className="card pc" key={t.id}><div className="av sq">{MODES[t.mode]||'🚚'}</div><div className="pcb">
<div className="row"><b>{t.from} → {t.to}</b><b>{tzs(t.cost)}</b></div>
<div className="row mut"><span>{t.type} · {t.mode}{t.veh?' · '+t.veh:''}</span><span>{refLabel(s,t)}</span></div>
<div className="row mut"><span>🕒 {fmtT(atOf(t))}{t.manual?' ✍':''}</span><span>{t.method||''}</span></div>{t.note&&<div className="mut">{t.note}</div>}</div></div>)}</>}
{x&&<Sheet title={'Dispatch '+x.no} onClose={()=>setX(null)}>
<Field label="Vehicle plate"><input value={d.veh} onChange={e=>setD({...d,veh:e.target.value})}/></Field>
<Field label="Driver"><input value={d.drv} onChange={e=>setD({...d,drv:e.target.value})}/></Field>
<Field label="Status"><select value={d.st} onChange={e=>setD({...d,st:e.target.value})}>{['Pending','In transit','Delivered'].map(z=><option key={z}>{z}</option>)}</select></Field>
<Btn c="pri" onClick={()=>{a.dispatch(x.id,d);setX(null)}}>Save dispatch</Btn></Sheet>}
{c&&<Sheet title="Transport cost" onClose={()=>setC(null)}>
<Field label="Type"><select value={c.type} onChange={e=>setC({...c,type:e.target.value,ref:'',from:'',to:''})}><option value="Collection">Collection: landing site → operation site</option><option value="Delivery">Delivery: to customer</option><option value="Internal">Internal move</option></select></Field>
<div className="fgrid">{Object.entries(MODES).map(([k,e])=><div key={k} className={'opt col'+(c.mode===k?' sel':'')} onClick={()=>setC({...c,mode:k})}><span>{e}</span><b>{k}</b></div>)}</div>
<Field label={c.type==='Delivery'?'For sale':'For purchase batch (optional)'}><select value={c.ref} onChange={setRef}><option value="">None</option>{c.type==='Delivery'?s.sales.map(y=><option key={y.id} value={y.id}>{y.no} · {cn(y.cus)}</option>):s.batches.map(b=><option key={b.id} value={b.id}>{b.no} · {b.sp} · {b.site}</option>)}</select></Field>
<datalist id="places">{[...SITES,...s.wh,...s.customers.map(z=>z.name)].map(z=><option key={z} value={z}/>)}</datalist>
<div className="two"><Field label="From"><input list="places" value={c.from} onChange={set('from')}/></Field><Field label="To"><input list="places" value={c.to} onChange={set('to')}/></Field></div>
<div className="two"><Field label="Cost (TZS)"><input type="number" inputMode="numeric" value={c.cost} onChange={set('cost')}/></Field><Field label="Paid by"><select value={c.method} onChange={set('method')}>{['Cash','Mobile money','Bank'].map(z=><option key={z}>{z}</option>)}</select></Field></div>
<Field label="Vehicle plate / rider name"><input value={c.veh} onChange={set('veh')}/></Field><Field label="Note"><input value={c.note} onChange={set('note')}/></Field>
<label className="chk"><input type="checkbox" checked={c.manual} onChange={e=>setC({...c,manual:e.target.checked,when:c.when||nowL()})}/> Enter date &amp; time manually</label>
{c.manual?<Field label="Date &amp; time"><input type="datetime-local" max={nowL()} value={c.when} onChange={set('when')}/></Field>:<p className="mut">🕒 Recorded automatically when you save.</p>}
<Btn c="pri" disabled={!ok} onClick={save}>Save transport cost</Btn></Sheet>}</div>}

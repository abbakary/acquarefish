import {useS,stock,supBal,cusBal,ROLES,nowL,trCost} from '../store'
import {f,tzs,Badge,Btn,Scene,FishImg,fmtT,atOf} from '../ui'
const PLAN={full:['hero','al','kpi','stock','money','act'],'Purchasing Officer':['today','al','recent'],'Quality Inspector':['al','qc','insp'],Storekeeper:['al','kpi','wh','stock'],Accountant:['hero','money','pays'],'Sales Officer':['al','sk','stock','disp'],'Transport Officer':['disp'],Auditor:['hero','al','kpi','money','act']}
const KP=a=><div className="grid2">{a.map(k=><div className="card kpi" key={k[0]}><span>{k[2]}</span><small>{k[0]}</small><b>{k[1]}</b></div>)}</div>
export default function Home({go}){
const {s}=useS();const role=s.role,plan=PLAN[role]||PLAN.full,can=k=>!ROLES[role]||ROLES[role].includes(k)
const day=nowL().slice(0,10),st=stock(s),max=Math.max(1,...Object.values(st))
const bought=s.batches.reduce((a,b)=>a+b.kg,0),sold=s.sales.reduce((a,x)=>a+x.kg,0),inStock=Object.values(st).reduce((a,b)=>a+b,0)
const rev=s.sales.reduce((a,x)=>a+x.kg*x.price,0),cogs=s.sales.reduce((a,x)=>a+x.cogs,0),exp0=s.exps.reduce((a,e)=>a+e.amt,0)+s.batches.reduce((a,b)=>a+(b.waste||0)*b.price,0),tr=trCost(s),exp=exp0+tr
const due=s.suppliers.reduce((a,x)=>a+supBal(s,x.id),0),debt=s.customers.reduce((a,x)=>a+cusBal(s,x.id),0)
const pend=s.batches.filter(b=>b.st==='pending'),td=s.batches.filter(b=>atOf(b).slice(0,10)===day)
const insp=s.batches.filter(b=>b.st!=='pending'),acc=insp.reduce((a,b)=>a+b.kg-b.rej,0),rej=insp.reduce((a,b)=>a+b.rej,0)
const lim=new Date(Date.now()+30*864e5).toISOString().slice(0,10),expiring=s.comp.filter(c=>c.exp<lim).length
const dis=s.sales.filter(x=>x.dis.st!=='Delivered')
const Row=({l,r})=><div className="row"><span>{l}</span>{r}</div>
const V={
hero:<div className="hero" key="hero"><small>Net profit after transport, expenses &amp; wastage</small><b>{tzs(rev-cogs-exp)}</b><div className="waves"/></div>,
al:<div key="al">{can('quality')&&pend.length>0&&<div className="alert" onClick={()=>go('quality')}>🔍 {pend.length} delivery waiting for inspection <b>Inspect</b></div>}{can('compliance')&&expiring>0&&<div className="alert" style={{marginTop:8}} onClick={()=>go('compliance')}>📜 Licence or permit expiring soon <b>Review</b></div>}</div>,
kpi:<div key="kpi">{KP([['Bought',f(bought)+' kg','🎣'],['Sold',f(sold)+' kg','🚚'],['In stock',f(inStock)+' kg','🧊'],['Gross profit',tzs(rev-cogs),'💰']])}</div>,
today:<div className="pg" style={{padding:0}} key="today">{KP([['Bought today',f(td.reduce((a,b)=>a+b.kg,0))+' kg','🎣'],['Value today',tzs(td.reduce((a,b)=>a+b.kg*b.price,0)),'💵'],['Purchases today',td.length,'🧾'],['Awaiting inspection',pend.length,'🔍']])}<Btn c="pri" onClick={()=>go('buy')}>＋ Record a purchase</Btn></div>,
recent:<div className="card" key="recent"><h4>Latest purchases</h4>{[...s.batches].sort((x,y)=>atOf(y).localeCompare(atOf(x))).slice(0,6).map(b=><Row key={b.id} l={<>{b.pur} · {f(b.kg)} kg {b.sp}<br/><small className="mut">{fmtT(atOf(b))}</small></>} r={<b>{tzs(b.kg*b.price)}</b>}/>)}</div>,
qc:<div key="qc">{KP([['Awaiting',pend.length,'⏳'],['Accepted',f(acc)+' kg','✅'],['Rejected',f(rej)+' kg','❌'],['Rejection rate',(acc+rej?Math.round(rej/(acc+rej)*100):0)+'%','📉']])}</div>,
insp:<div className="card" key="insp"><h4>To inspect</h4>{pend.length===0&&<p className="mut">Nothing waiting.</p>}{pend.map(b=><Row key={b.id} l={<>{b.no} · {b.sp} {f(b.kg)} kg<br/><small className="mut">{fmtT(atOf(b))}</small></>} r={<Btn c="sm" onClick={()=>go('quality')}>Inspect</Btn>}/>)}</div>,
wh:<div key="wh">{KP(s.wh.map(w=>[w,f(s.batches.filter(b=>(b.wh||s.wh[0])===w&&b.st==='accepted').reduce((a,b)=>a+b.rem,0))+' kg','❄️']))}</div>,
stock:<div className="card" key="stock"><h4>Stock by fish</h4>{Object.keys(st).length===0&&<p className="mut">No saleable fish yet.</p>}{Object.entries(st).map(([k,v])=><div className="bar" key={k}><div className="bl"><span className="fc"><FishImg sp={k} s={34}/>{k.replace('|',' · Grade ')}</span><b>{f(v)} kg</b></div><div className="tr"><i style={{width:v/max*100+'%'}}/></div></div>)}</div>,
money:<div className="card" key="money"><h4>Money</h4><Row l="Sales revenue" r={<b>{tzs(rev)}</b>}/><Row l="Owed to fishermen" r={<b className="neg">{tzs(due)}</b>}/><Row l="Customer debts" r={<b className="pos">{tzs(debt)}</b>}/><Row l="Transport costs" r={<b>{tzs(tr)}</b>}/><Row l="Expenses &amp; wastage" r={<b>{tzs(exp0)}</b>}/></div>,
sk:<div key="sk">{KP([['Revenue',tzs(rev),'💰'],['Kg sold',f(sold)+' kg','🚚'],['Customer debts',tzs(debt),'🏭'],['To dispatch',dis.length,'📦']])}</div>,
disp:<div className="card" key="disp"><h4>Deliveries</h4>{dis.length===0&&<p className="mut">All delivered.</p>}{dis.slice(0,6).map(x=><Row key={x.id} l={<>{x.no} · {f(x.kg)} kg<br/><small className="mut">{x.dis.veh||'No vehicle yet'}</small></>} r={<Badge c={x.dis.st==='Pending'?'orange':'blue'}>{x.dis.st}</Badge>}/>)}{can('transport')&&<Btn c="sm" onClick={()=>go('transport')}>Open transport</Btn>}</div>,
pays:<div className="card" key="pays"><h4>Recent payments</h4>{[...s.pays].reverse().slice(0,6).map(p=><Row key={p.id} l={(s.suppliers.find(x=>x.id===p.sup)?.name||'')+' · '+p.m} r={<b>{tzs(p.amt)}</b>}/>)}</div>,
act:<div className="card" key="act"><h4>Recent activity</h4>{s.audit.slice(0,5).map(x=><div className="row" key={x.id}><span>{x.m}</span></div>)}{s.audit.length===0&&<p className="mut">No activity yet.</p>}</div>}
const h=new Date().getHours(),greet=h<12?'Good morning':h<17?'Good afternoon':'Good evening'
const Q=[['buy','🎣','Purchase Fish'],['stock','🧊','View Stock'],['sales','🤝','Sales'],['payments','💵','Payments'],['quality','🔍','Inspection'],['transport','🚛','Transport'],['reports','📈','Reports']].filter(q=>can(q[0])).slice(0,6)
return <div className="pg"><div className="banner"><Scene/><div className="bt"><h2>{greet}, {s.staff.find(x=>x.id===s.me)?.name.split(' ')[0]||role} 👋</h2><p>{role} · Manage your fish business easily</p></div></div>
<div className="grid2">{Q.map(q=><button key={q[0]} className="card tile qk" onClick={()=>go(q[0])}><span>{q[1]}</span>{q[2]}</button>)}</div>{plan.map(k=>V[k])}</div>}

import {useState} from 'react'
import {useS,PLANS,SPECIES,supBal,cusBal,stock} from '../store'
import {Seg,Btn,Fab,Sheet,Field,Kpis,FishImg,f,tzs} from '../ui'
const COL=['#1f78e0','#f28c28','#1f9e6b','#8b5cf6','#e11d48','#0891b2'],SC=['#5f747b','#d98b73','#8fa8ba','#6b6258']
const dAgo=n=>{const x=new Date();x.setDate(x.getDate()-n);return x.toISOString().slice(0,10)}
const sm=(l,g)=>l.reduce((t,x)=>t+g(x),0)
const met=(d,from)=>{const ok=x=>!from||(x.date||'')>=from,bs=d.batches.filter(ok),ss=d.sales.filter(ok)
const rev=sm(ss,x=>x.kg*x.price),cogs=sm(ss,x=>x.cogs),tr=sm((d.trips||[]).filter(ok),x=>x.cost),ex=sm(d.exps.filter(ok),x=>x.amt),ws=sm(d.batches,b=>(b.waste||0)*b.price),gp=rev-cogs
return {rev,cogs,gp,tr,ex,ws,net:gp-tr-ex-ws,mg:rev?gp/rev*100:0,bkg:sm(bs,b=>b.kg),skg:sm(ss,x=>x.kg),stk:sm(Object.values(stock(d)),v=>v),debt:sm(d.customers,c=>cusBal(d,c.id)),owed:sm(d.suppliers,y=>supBal(d,y.id)),pend:d.batches.filter(b=>b.st==='pending').length}}
const Line=({days,ser})=>{const W=640,H=190,mx=Math.max(1,...ser.flat()),X=i=>24+i*(W-36)/Math.max(1,days.length-1),Y=v=>H-24-v/mx*(H-44)
return <svg viewBox={`0 0 ${W} ${H}`} className="chart">{[0,.5,1].map(g=><g key={g}><line x1="24" x2={W-8} y1={Y(mx*g)} y2={Y(mx*g)} stroke="#dbe6f5"/><text x="0" y={Y(mx*g)+3} fontSize="9" fill="#7d93b3">{f(mx*g/1e6)}M</text></g>)}
{ser.map((q,k)=><polyline key={k} fill="none" stroke={COL[k%6]} strokeWidth="2.6" strokeLinejoin="round" points={q.map((v,i)=>X(i)+','+Y(v)).join(' ')}/>)}
<text x="24" y={H-6} fontSize="10" fill="#7d93b3">{days[0].slice(5)}</text><text x={W-40} y={H-6} fontSize="10" fill="#7d93b3">{days[days.length-1].slice(5)}</text></svg>}
const Stk=({p})=><div className="stk">{p.map(([v,c,l])=>v>0&&<i key={l} title={l} style={{flex:v,background:c}}/>)}</div>
export default function Hq({go}){
const {T,x,B}=useS();const [p,setP]=useState('30 days');const [o,setO]=useState(false);const [nb,setNb]=useState({name:'',region:''})
const n=p==='7 days'?7:p==='30 days'?30:0,from=n?dAgo(n):'',lim=PLANS.find(q=>q.id===T.plan)?.branches||1
const rows=T.branches.map((b,i)=>({b,c:COL[i%6],m:met(b.data,from)})),tot=k=>sm(rows,r=>r.m[k])
const days=Array.from({length:n||30},(_,i)=>dAgo((n||30)-1-i)),ser=rows.map(r=>days.map(d=>sm(r.b.data.sales.filter(s=>s.date===d),s=>s.kg*s.price)))
const top=k=>[...rows].sort((a,b)=>b.m[k]-a.m[k])[0],mx=Math.max(1,...rows.map(r=>Math.max(r.m.rev,r.m.cogs+r.m.tr+r.m.ex+r.m.ws)))
const tpk=[...rows].sort((a,b)=>b.m.tr/(b.m.bkg||1)-a.m.tr/(a.m.bkg||1))[0]
const ins=[`🏆 ${top('rev').b.name} leads on revenue (${tzs(top('rev').m.rev)}).`,`📈 Best gross margin: ${top('mg').b.name} at ${top('mg').m.mg.toFixed(1)}%.`,`🚚 Highest transport cost per kg bought: ${tpk.b.name} (TZS ${f(tpk.m.tr/(tpk.m.bkg||1))}/kg).`,`🔍 ${tot('pend')} deliveries awaiting inspection across branches.`]
return <div className="pg"><div className="toolbar"><Seg v={p} set={setP} items={['7 days','30 days','All']}/><Fab onClick={()=>setO(true)}>＋ Branch</Fab></div>
<Kpis a={[['Group revenue',tzs(tot('rev')),'💰'],['Group net profit',tzs(tot('net')),'📊'],['Kg bought',f(tot('bkg'))+' kg','🎣'],['Kg sold',f(tot('skg'))+' kg','🚚'],['Stock on hand',f(tot('stk'))+' kg','🧊'],['Transport cost',tzs(tot('tr')),'🛻'],['Customer debts',tzs(tot('debt')),'🏭'],['Owed to suppliers',tzs(tot('owed')),'💵']]}/>
<div className="card"><h4>Insights</h4>{ins.map(t=><div key={t} className="ins">{t}</div>)}</div>
<div className="card wide"><h4>Revenue trend by branch</h4><Line days={days} ser={ser}/><div>{rows.map(r=><span className="chp" key={r.b.id}><i className="dot" style={{background:r.c}}/>{r.b.name}</span>)}</div></div>
<div className="card"><h4>Revenue vs costs</h4>{rows.map(r=>{const c=r.m.cogs+r.m.tr+r.m.ex+r.m.ws;return <div className="barx" key={r.b.id}><div className="bl"><b>{r.b.name}</b><span className={r.m.net>=0?'pos':'neg'}>Net {tzs(r.m.net)}</span></div>
<div className="tr"><i style={{width:r.m.rev/mx*100+'%',background:r.c}}/></div><div className="tr gy"><i style={{width:c/mx*100+'%'}}/></div></div>})}<p className="mut">Colour = revenue · grey = total costs</p></div>
<div className="card"><h4>Cost structure</h4>{rows.map(r=><div className="barx" key={r.b.id}><div className="bl"><span>{r.b.name}</span><span className="mut">margin {r.m.mg.toFixed(1)}%</span></div><Stk p={[[r.m.cogs,'#1f78e0','Fish cost'],[r.m.tr,'#f28c28','Transport'],[r.m.ex,'#8b5cf6','Expenses'],[r.m.ws,'#e11d48','Wastage']]}/></div>)}<div><span className="chp"><i className="dot" style={{background:'#1f78e0'}}/>Fish</span><span className="chp"><i className="dot" style={{background:'#f28c28'}}/>Transport</span><span className="chp"><i className="dot" style={{background:'#8b5cf6'}}/>Expenses</span><span className="chp"><i className="dot" style={{background:'#e11d48'}}/>Wastage</span></div></div>
<div className="card"><h4>Species mix (kg bought)</h4>{rows.map(r=><div className="barx" key={r.b.id}><div className="bl"><span>{r.b.name}</span></div><Stk p={SPECIES.map((s,i)=>[sm(r.b.data.batches.filter(b=>b.sp===s&&(!from||b.date>=from)),b=>b.kg),SC[i],s])}/></div>)}<div className="fcrow">{SPECIES.map(s=><span key={s} className="fc"><FishImg sp={s} s={26}/>{s.split(' (')[0]}</span>)}</div></div>
<div className="card wide"><h4>Branch comparison</h4><div className="tbl"><table><thead><tr>{['Branch','Revenue','Gross margin','Net profit','Kg bought','Kg sold','Stock kg','Transport','Debts',''].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>
{rows.map(r=><tr key={r.b.id}><td><b>{r.b.name}</b>{r.b.id===B.id&&' ●'}</td><td>{f(r.m.rev)}</td><td>{r.m.mg.toFixed(1)}%</td><td className={r.m.net>=0?'pos':'neg'}>{f(r.m.net)}</td><td>{f(r.m.bkg)}</td><td>{f(r.m.skg)}</td><td>{f(r.m.stk)}</td><td>{f(r.m.tr)}</td><td>{f(r.m.debt)}</td><td><Btn c="sm" onClick={()=>{x.switchBranch(r.b.id);go('home')}}>Open</Btn></td></tr>)}</tbody>
<tfoot><tr><th>Group</th><th>{f(tot('rev'))}</th><th>{(tot('rev')?tot('gp')/tot('rev')*100:0).toFixed(1)}%</th><th>{f(tot('net'))}</th><th>{f(tot('bkg'))}</th><th>{f(tot('skg'))}</th><th>{f(tot('stk'))}</th><th>{f(tot('tr'))}</th><th>{f(tot('debt'))}</th><th/></tr></tfoot></table></div></div>
{o&&<Sheet title="Add branch" onClose={()=>setO(false)}>{T.branches.length>=lim?<p className="neg">Your {T.plan} plan allows {lim} branch(es). Upgrade to add more.</p>:<><Field label="Branch name"><input value={nb.name} onChange={e=>setNb({...nb,name:e.target.value})}/></Field><Field label="Region / landing site"><input value={nb.region} onChange={e=>setNb({...nb,region:e.target.value})}/></Field><Btn c="pri" disabled={!nb.name||!nb.region} onClick={()=>{x.addBranch(nb.name,nb.region);setO(false);setNb({name:'',region:''})}}>Create branch</Btn></>}</Sheet>}</div>}

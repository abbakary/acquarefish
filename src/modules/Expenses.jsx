import {useState} from 'react'
import {useS,trCost} from '../store'
import {Sheet,Field,Btn,Fab,f,tzs} from '../ui'
const CATS=['Ice & packaging','Loading','Fuel','Salaries','Electricity','Storage','Other']
export default function Expenses({go}){
const {s,a}=useS();const [o,setO]=useState(false);const [d,setD]=useState({cat:CATS[0],amt:''})
const rev=s.sales.reduce((t,x)=>t+x.kg*x.price,0),cogs=s.sales.reduce((t,x)=>t+x.cogs,0),loss=s.batches.reduce((t,b)=>t+(b.waste||0)*b.price,0),exp=s.exps.reduce((t,e)=>t+e.amt,0)+loss,tr=trCost(s)
return <div className="pg"><div className="card"><h4>Profit report</h4>
<div className="row"><span>Sales</span><b>{tzs(rev)}</b></div><div className="row"><span>Cost of fish sold</span><b>- {tzs(cogs)}</b></div>
<div className="row"><span>Gross profit</span><b className="pos">{tzs(rev-cogs)}</b></div><div className="row"><span>Transport costs</span><b>- {tzs(tr)}</b></div><div className="row"><span>Expenses &amp; wastage</span><b>- {tzs(exp)}</b></div>
<div className="total">Net profit <b>{tzs(rev-cogs-exp-tr)}</b></div></div>
<div className="card"><div className="row"><span className="mut">🚚 Transport costs (boda, trucks, boats) are managed in the Transport module and counted in profit.</span><Btn c="sm" onClick={()=>go('transport')}>Open</Btn></div></div>
{[...s.exps].reverse().map(e=><div className="card row" key={e.id}><span>{e.cat} · {e.date}</span><b>{tzs(e.amt)}</b></div>)}
<Btn c="ghost" onClick={()=>confirm('Reset all demo data?')&&a.reset()}>Reset demo data</Btn>
<Fab onClick={()=>setO(true)}>＋ Expense</Fab>
{o&&<Sheet title="Add expense" onClose={()=>setO(false)}><Field label="Category"><select value={d.cat} onChange={e=>setD({...d,cat:e.target.value})}>{CATS.map(c=><option key={c}>{c}</option>)}</select></Field>
<Field label="Amount (TZS)"><input type="number" value={d.amt} onChange={e=>setD({...d,amt:e.target.value})}/></Field>
<Btn c="pri" disabled={!(+d.amt>0)} onClick={()=>{a.addExp({cat:d.cat,amt:+d.amt});setO(false);setD({...d,amt:''})}}>Save expense</Btn></Sheet>}</div>}

import {useState} from 'react'
import {useS,supBal} from '../store'
import {Sheet,Field,Btn,f,tzs} from '../ui'
export default function Payments(){
const {s,a}=useS();const [x,setX]=useState(null);const [amt,setAmt]=useState('');const [m,setM]=useState('Mobile money')
const bal=x?supBal(s,x.id):0
return <div className="pg"><div className="card hero2"><small>Total owed to suppliers</small><b>{tzs(s.suppliers.reduce((t,y)=>t+supBal(s,y.id),0))}</b></div>
{s.suppliers.map(y=>{const b=supBal(s,y.id);return <div className="card" key={y.id}><div className="row"><b>{y.name}</b><b className={b>0?'neg':'pos'}>{tzs(b)}</b></div>
<div className="row mut"><span>{y.site}</span>{b>0&&<Btn c="sm" onClick={()=>{setX(y);setAmt('')}}>Pay</Btn>}</div></div>})}
<h4 className="sec">Recent payments</h4>
{[...s.pays].reverse().slice(0,8).map(p=><div className="row card" key={p.id}><span>{s.suppliers.find(y=>y.id===p.sup)?.name} · {p.m}</span><b>{tzs(p.amt)}</b></div>)}
{x&&<Sheet title={'Pay '+x.name} onClose={()=>setX(null)}><p>Outstanding: <b>{tzs(bal)}</b></p>
<Field label="Amount (TZS)"><input type="number" inputMode="numeric" value={amt} onChange={e=>setAmt(e.target.value)}/></Field>
<Field label="Method"><select value={m} onChange={e=>setM(e.target.value)}>{['Cash','Mobile money','Bank'].map(z=><option key={z}>{z}</option>)}</select></Field>
<Btn c="pri" disabled={!(+amt>0&&+amt<=bal)} onClick={()=>{a.pay(x.id,+amt,m);setX(null)}}>Confirm payment</Btn></Sheet>}</div>}

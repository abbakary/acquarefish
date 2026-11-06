import {useS} from '../store'
import {Empty} from '../ui'
export default function Audit(){
const {s}=useS()
return <div className="pg"><p className="mut">Every purchase, payment, stock change and role switch is recorded here. Completed purchases cannot be edited or deleted.</p>
{s.audit.length===0&&<Empty t="No activity logged yet."/>}
{s.audit.map(x=><div className="card" key={x.id}><div className="row"><b>{x.m}</b></div><div className="mut">{x.t} · {x.u}</div></div>)}</div>}

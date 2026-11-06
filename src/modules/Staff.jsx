import {useState} from 'react'
import {useS,ROLES} from '../store'
import {Sheet,Field,Btn,Fab,Badge,Seg,fmtT} from '../ui'
const LBL={home:'Home',buy:'Purchases',stock:'Stock',sales:'Sales',suppliers:'Suppliers',quality:'Quality',payments:'Payments',transport:'Transport',expenses:'Expenses',compliance:'Licences',audit:'Audit log',reports:'Reports',staff:'Staff'}
const access=r=>ROLES[r]?ROLES[r]:Object.keys(LBL)
const Chips=({r})=><div>{access(r).map(k=><span className="chp" key={k}>{LBL[k]}</span>)}</div>
export default function Staff(){
const {s,a,T,db}=useS();const me=s.staff.find(x=>x.id===s.me),owner=me?.role==='Owner'
const [v,setV]=useState('Staff');const [d,setD]=useState(null)
const assignable=Object.keys(ROLES).filter(r=>owner||(r!=='Owner'&&r!=='General Manager'))
const canEdit=u=>owner||(u.role!=='Owner'&&u.role!=='General Manager')
const set=k=>e=>setD({...d,[k]:e.target.value})
const isNew=d&&!d.id,owners=s.staff.filter(x=>x.role==='Owner'&&x.active).length
let err=''
if(d){if(!d.name.trim())err='Enter the full name.';else if(isNew&&!/^[a-z0-9._]{3,}$/.test(d.username))err='Username: 3+ letters/numbers, lowercase.';else if(isNew&&db.tenants.some(t=>t.staff.some(x=>x.username===d.username)))err='That username is already used.';else if((isNew||d.pin)&&!/^\d{4,6}$/.test(d.pin))err='PIN must be 4 to 6 digits.';else if(d.id===me.id&&!d.active)err='You cannot disable your own account.';else if(d.was==='Owner'&&(d.role!=='Owner'||!d.active)&&owners<=1)err='There must be at least one active Owner.'}
const save=()=>{const {id,was,username,...r}=d;id?a.updStaff(id,{...r,pin:d.pin||undefined}):a.addStaff({...r,username});setD(null)}
return <div className="pg"><div className="toolbar"><Seg v={v} set={setV} items={['Staff','Roles & access']}/>{v==='Staff'&&<Fab onClick={()=>setD({name:'',phone:'',username:'',role:assignable.find(r=>r==='Purchasing Officer')||assignable[0],pin:'',active:true,branch:'all'})}>＋ Add staff</Fab>}</div>
{v==='Staff'?<>{s.staff.map(u=><div className="card pc" key={u.id}><div className="av">{u.name[0]}</div><div className="pcb">
<div className="row"><b>{u.name}{u.id===me.id?' (you)':''}</b><Badge c={u.active?'green':'red'}>{u.active?'Active':'Disabled'}</Badge></div>
<div className="row"><span>{u.role}</span><span className="mut">@{u.username} · {u.branch&&u.branch!=='all'?T.branches.find(b=>b.id===u.branch)?.name:'All branches'}</span></div>
<div className="row"><span className="mut">{u.last?'Last login '+fmtT(u.last):'Never signed in'}</span>{canEdit(u)&&<Btn c="sm" onClick={()=>setD({...u,was:u.role,pin:''})}>Edit</Btn>}</div></div></div>)}
</>
:Object.keys(ROLES).map(r=><div className="card" key={r}><div className="row"><b>{r}</b><span className="mut">{s.staff.filter(x=>x.role===r).length} staff</span></div><Chips r={r}/></div>)}
{d&&<Sheet title={isNew?'New staff account':'Edit '+d.name} onClose={()=>setD(null)}>
<Field label="Full name"><input value={d.name} onChange={set('name')}/></Field>
<div className="two"><Field label="Phone"><input type="tel" value={d.phone} onChange={set('phone')}/></Field>
<Field label="Username"><input value={d.username} disabled={!isNew} autoCapitalize="none" onChange={e=>setD({...d,username:e.target.value.toLowerCase()})}/></Field></div>
<Field label="Role"><select value={d.role} onChange={set('role')}>{assignable.map(r=><option key={r}>{r}</option>)}</select></Field>
<Field label="Branch access"><select value={d.branch||'all'} onChange={set('branch')}><option value="all">All branches (HQ)</option>{T.branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></Field>
<p className="mut">This role can open:</p><Chips r={d.role}/>
<Field label={isNew?'PIN (4-6 digits)':'New PIN (leave empty to keep)'}><input type="password" inputMode="numeric" value={d.pin} onChange={set('pin')}/></Field>
{!isNew&&<label className="chk"><input type="checkbox" checked={d.active} onChange={e=>setD({...d,active:e.target.checked})}/> Account active (can sign in)</label>}
{err&&<p className="neg">{err}</p>}<Btn c="pri" disabled={!!err} onClick={save}>{isNew?'Create account':'Save changes'}</Btn></Sheet>}</div>}

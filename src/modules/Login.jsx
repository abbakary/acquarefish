import {useState} from 'react'
import {useS} from '../store'
import {Field,Btn,Scene} from '../ui'
export default function Login({go}){
const {x}=useS();const [u,setU]=useState('');const [p,setP]=useState('');const [err,setErr]=useState('')
const sub=()=>{const r=x.login(u,p);if(r.err)setErr(r.err);else go('')}
const key=e=>e.key==='Enter'&&sub()
return <div className="pub auth"><div className="authL"><Scene/><div className="authT"><h2>🐟 FishTrade ERP</h2><p>One sign-in for every company, branch and platform admin.</p><ul><li>Companies go to their own workspace</li><li>HQ owners switch between branches</li><li>Platform admins manage all tenants</li></ul></div></div>
<div className="authR"><div className="authC"><button className="lk" onClick={()=>go('')}>← Back to website</button><h2>Sign in</h2>
<Field label="Username"><input value={u} autoCapitalize="none" onChange={e=>{setU(e.target.value);setErr('')}} onKeyDown={key}/></Field>
<Field label="PIN / password"><input type="password" value={p} onChange={e=>{setP(e.target.value);setErr('')}} onKeyDown={key}/></Field>
{err&&<p className="neg">{err}</p>}<Btn c="pri" onClick={sub}>Sign in</Btn>
<p className="mut">New company? <button className="lk" onClick={()=>go('register')}>Create an account</button></p>
<div className="card"><h4>Demo accounts</h4><p className="mut">Platform admin: admin / admin123<br/>Company owner (3 branches): owner / 1234<br/>Second company: pwani / 1234<br/>Branch staff: juma / 1111 (Mwanza), neema / 2222 (Kigoma), hamisi / 3333</p></div></div></div></div>}

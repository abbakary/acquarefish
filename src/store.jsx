import {createContext,useContext,useEffect,useState} from 'react'
const KEY='fishtrade.v2'
const today=()=>new Date().toISOString().slice(0,10)
export const SPECIES=['Nile Perch','Tilapia','Dagaa (Sardines)','Catfish']
export const ROLES={Owner:0,'General Manager':0,'Purchasing Officer':['home','buy','stock','transport','reports'],'Quality Inspector':['home','quality','stock','reports'],Storekeeper:['home','stock','quality','reports'],Accountant:['home','payments','expenses','suppliers','sales','transport','reports'],'Sales Officer':['home','sales','transport','stock','reports'],'Transport Officer':['home','transport'],Auditor:['home','buy','stock','sales','suppliers','quality','payments','transport','expenses','compliance','audit','reports']}
export const SITES=['Mwanza','Kigoma','Musoma','Ukerewe','Kagera']
export const uid=p=>p+Math.random().toString(36).slice(2,8)
export const nowL=()=>{const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,16)}
export const tot=b=>b.kg*b.price
export const trCost=s=>(s.trips||[]).reduce((t,x)=>t+x.cost,0)
export const landed=(s,b)=>b.price+(s.trips||[]).filter(t=>t.ref===b.id).reduce((a,t)=>a+t.cost,0)/(b.kg||1)
export const refLabel=(s,t)=>s.batches.find(x=>x.id===t.ref)?.no||s.sales.find(x=>x.id===t.ref)?.no||'-'
export const supBal=(s,id)=>s.batches.filter(b=>b.sup===id).reduce((a,b)=>a+tot(b),0)-s.pays.filter(p=>p.sup===id).reduce((a,p)=>a+p.amt,0)
export const cusBal=(s,id)=>s.sales.filter(x=>x.cus===id).reduce((a,x)=>a+x.kg*x.price-x.paid,0)
export const stock=s=>{const m={};s.batches.filter(b=>b.st==='accepted'&&b.rem>0).forEach(b=>{const k=b.sp+'|'+b.grade;m[k]=(m[k]||0)+b.rem});return m}
export const H=s=>{let h=5381;for(const c of 'ft'+s)h=((h<<5)+h+c.charCodeAt(0))|0;return String(h)}
const d0=n=>{const x=new Date();x.setDate(x.getDate()-n);return x.toISOString().slice(0,10)}
const RN=s=>{let x=s;return()=>(x=(x*9301+49297)%233280)/233280}
export const PLANS=[{id:'Starter',price:49000,branches:1,users:5,note:'One branch, core modules'},{id:'Business',price:149000,branches:5,users:25,note:'Multi-branch + HQ analytics'},{id:'Enterprise',price:399000,branches:99,users:999,note:'Unlimited branches, priority support'}]
export const mkBranch=(site,k,demo)=>{const d={wh:['Main cold room','Landing store'],audit:[],seq:{pur:1,sal:1},suppliers:[],batches:[],pays:[],customers:[],sales:[],exps:[],trips:[],comp:[]}
if(!demo)return d
const r=RN(Math.round(k*11)+site.length)
d.suppliers=['Mussa','Neema','Ziwa Group'].map((n,i)=>({id:'s'+i,name:n+' '+site,phone:'0755 '+(100000+Math.floor(r()*899999)),site,cat:i===2?'Group':'Fisherman'}))
d.customers=[{id:'c0',name:site+' Fish Processing Ltd',phone:'0222 000 111',limit:30000000},{id:'c1',name:'Lake Exporters '+site,phone:'0222 000 222',limit:20000000}]
const base={'Nile Perch':8000,Tilapia:5000,'Dagaa (Sardines)':2500,Catfish:4500}
for(let i=0;i<10;i++){const sp=SPECIES[i%4],kg=Math.round((250+r()*600)*k),price=Math.round(base[sp]*(0.9+r()*0.25)),dt=d0(29-i*3),sup=d.suppliers[i%3],sold=Math.round(kg*(0.35+r()*0.4)),pend=i===9
d.batches.push({id:'b'+i,no:'BATCH-'+String(i+1).padStart(3,'0'),pur:'PUR-'+String(i+1).padStart(6,'0'),sup:sup.id,sp,grade:'A',kg,rem:pend?0:kg-sold,price,date:dt,at:dt+'T0'+(7+i%3)+':30',site,wh:d.wh[i%2],st:pend?'pending':'accepted',rej:0,temp:2,insp:dt})
d.pays.push({id:'p'+i,sup:sup.id,amt:Math.round(kg*price*(0.6+r()*0.4)),m:'Cash',date:dt})
if(!pend){const sp2=Math.round(price*(1.22+r()*0.2)),dt2=d0(27-i*3),paid=Math.round(sold*sp2*(0.5+r()*0.5))
d.sales.push({id:'x'+i,no:'SAL-'+String(i+1).padStart(6,'0'),cus:'c'+(i%2),sp,grade:'A',kg:sold,price:sp2,paid,cogs:sold*price,date:dt2,at:dt2+'T15:00',alloc:[{b:'b'+i,kg:sold}],dis:{st:i%4?'Delivered':'In transit',veh:'T '+(100+i)+' ABC',drv:'Driver '+i}})
d.trips.push({id:'t'+i,type:'Delivery',mode:'Truck',from:d.wh[0],to:site,cost:Math.round(60000*k),date:dt2,at:dt2+'T16:00',ref:'x'+i,veh:'T '+(100+i)+' ABC',method:'Bank'})}
d.trips.push({id:'tc'+i,type:'Collection',mode:'Boda boda',from:site,to:d.wh[0],cost:Math.round(8000+r()*12000),date:dt,at:dt+'T09:00',ref:'b'+i,veh:'Rider',method:'Cash'})}
d.seq={pur:11,sal:11};d.exps=[{id:'e0',cat:'Ice & packaging',amt:Math.round(150000*k),date:d0(5)},{id:'e1',cat:'Salaries',amt:Math.round(900000*k),date:d0(3)}]
d.comp=[{id:'k0',type:'Fish dealer licence',ref:'FD-'+site.slice(0,2).toUpperCase()+'-26',who:site,exp:'2027-03-31'}];return d}
const ST=(n,u,role,br,pin='1234')=>({id:uid('u'),name:n,phone:'',username:u,pin:H(pin),role,active:true,branch:br})
const seedDb=()=>({v:2,ses:null,plat:{admin:{username:'admin',pin:H('admin123'),name:'Platform Admin'},log:[]},tenants:[
{id:'t1',name:'Ziwa Fish Traders Ltd',plan:'Business',status:'active',created:d0(120),sector:'Fish trading',region:'Mwanza',staff:[ST('John Mwangi','owner','Owner','all'),ST('Asha Komba','manager','General Manager','all'),ST('Juma Said','juma','Purchasing Officer','br1','1111'),ST('Neema Paul','neema','Quality Inspector','br2','2222'),ST('Hamisi Ally','hamisi','Accountant','br1','3333')],
branches:[{id:'br1',name:'Mwanza HQ',region:'Mwanza',data:mkBranch('Mwanza',1.2,1)},{id:'br2',name:'Kigoma Branch',region:'Kigoma',data:mkBranch('Kigoma',0.8,1)},{id:'br3',name:'Musoma Branch',region:'Musoma',data:mkBranch('Musoma',0.6,1)}]},
{id:'t2',name:'Pwani Seafoods Co',plan:'Starter',status:'active',created:d0(35),sector:'Fish export',region:'Dar es Salaam',staff:[ST('Rehema Salim','pwani','Owner','all')],branches:[{id:'br4',name:'Dar HQ',region:'Dar es Salaam',data:mkBranch('Dar',0.7,1)}]}]})
const C=createContext()
export const useS=()=>useContext(C)
const L=(p,m)=>{const me=(p.staff||[]).find(x=>x.id===p.me);p.audit.unshift({id:uid('a'),t:new Date().toLocaleString('en-GB'),u:(me?me.name+' · ':'')+p.role,m})}
export function Store({children}){
const [db,setDb]=useState(()=>{try{const v=JSON.parse(localStorage.getItem(KEY));if(v&&v.v===2)return v}catch(e){}return seedDb()})
useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){}},[db])
const ses=db.ses||{},T=db.tenants.find(t=>t.id===ses.tid),B=T&&T.branches.find(b=>b.id===ses.bid),me=T&&T.staff.find(x=>x.id===ses.uid)
const s=ses.kind==='tenant'&&T&&B&&me?{...B.data,staff:T.staff,me:me.id,role:me.role}:null
const up=f=>setDb(d=>{const n=structuredClone(d),t=n.tenants.find(x=>x.id===n.ses.tid),b=t.branches.find(x=>x.id===n.ses.bid),u=t.staff.find(x=>x.id===n.ses.uid);const p=f({...b.data,staff:t.staff,me:u.id,role:u.role});const {staff,me:_m,role:_r,...data}=p;b.data=data;t.staff=staff;return n})
const mut=f=>setDb(d=>{const n=structuredClone(d);f(n);return n})
const pl=(n,m)=>n.plat.log.unshift({id:uid('l'),t:new Date().toLocaleString('en-GB'),m})
const tn=(n,id)=>n.tenants.find(z=>z.id===id)
const a={
addSup:d=>up(p=>{p.suppliers.push({id:uid('s'),...d});L(p,'Added supplier '+d.name);return p}),
addCus:d=>up(p=>{p.customers.push({id:uid('c'),...d});L(p,'Added customer '+d.name);return p}),
buy:d=>up(p=>{const {paid,method,...b}=d;const n='PUR-'+String(p.seq.pur++).padStart(6,'0')
p.batches.push({id:uid('b'),no:'BATCH-'+String(p.batches.length+1).padStart(3,'0'),pur:n,st:'pending',rej:0,rem:0,date:today(),wh:p.wh[0],...b})
if(paid>0)p.pays.push({id:uid('p'),sup:b.sup,amt:paid,m:method,date:today()});L(p,`${n}: bought ${b.kg} kg ${b.sp} @ ${b.price}${b.manual?' [manual time '+b.at+']':''}`);return p}),
inspect:(id,acc,temp,reason)=>up(p=>{const b=p.batches.find(x=>x.id===id);b.rem=acc;b.rej=b.kg-acc;b.temp=temp;b.reason=reason;b.st=acc>0?'accepted':'rejected';b.insp=today();L(p,`${b.no} inspected: accepted ${acc}, rejected ${b.rej} kg`);return p}),
transfer:(id,to)=>up(p=>{const b=p.batches.find(x=>x.id===id);L(p,`${b.no} moved ${b.wh||p.wh[0]} → ${to}`);b.wh=to;return p}),
waste:(id,kg,why)=>up(p=>{const b=p.batches.find(x=>x.id===id);b.rem-=kg;b.waste=(b.waste||0)+kg;L(p,`${b.no} write-off ${kg} kg (${why||'no reason'})`);return p}),
pay:(sup,amt,m)=>up(p=>{p.pays.push({id:uid('p'),sup,amt,m,date:today()});L(p,`Paid ${amt} to supplier (${m})`);return p}),
sell:d=>up(p=>{let need=d.kg,cogs=0;const alloc=[]
p.batches.filter(b=>b.st==='accepted'&&b.sp===d.sp&&b.grade===d.grade&&b.rem>0).sort((x,y)=>x.date.localeCompare(y.date)).forEach(b=>{if(need<=0)return;const t=Math.min(need,b.rem);b.rem-=t;need-=t;cogs+=t*b.price;alloc.push({b:b.id,kg:t})})
const no='SAL-'+String(p.seq.sal++).padStart(6,'0');p.sales.push({id:uid('x'),no,...d,cogs,alloc,date:today(),at:nowL(),dis:{st:'Pending',veh:'',drv:''}});L(p,`${no}: sold ${d.kg} kg ${d.sp}`);return p}),
receive:(id,amt)=>up(p=>{const x=p.sales.find(y=>y.id===id);x.paid+=amt;L(p,`Received ${amt} on ${x.no}`);return p}),
dispatch:(id,dis)=>up(p=>{const x=p.sales.find(y=>y.id===id);x.dis=dis;L(p,`${x.no} dispatch: ${dis.st}, ${dis.veh}`);return p}),
addExp:d=>up(p=>{p.exps.push({id:uid('e'),date:today(),...d});L(p,`Expense ${d.cat} ${d.amt}`);return p}),
addComp:d=>up(p=>{p.comp.push({id:uid('k'),...d});L(p,`Added ${d.type} ${d.ref}`);return p}),
addTrip:d=>up(p=>{p.trips.push({id:uid('t'),...d});L(p,`Transport cost ${d.cost} (${d.type}, ${d.mode}) ${d.from} to ${d.to}`);return p}),
addStaff:d=>up(p=>{p.staff.push({id:uid('u'),active:true,...d,pin:H(d.pin)});L(p,'Created staff account '+d.username+' ('+d.role+')');return p}),
updStaff:(id,d)=>up(p=>{const u=p.staff.find(x=>x.id===id);const {pin,...r}=d;Object.assign(u,r);if(pin)u.pin=H(pin);if(id===p.me)p.role=u.role;L(p,'Updated staff '+u.username+(pin?' (PIN reset)':'')+(d.active===false?' (disabled)':''));return p}),
reset:()=>up(p=>Object.assign(p,mkBranch(p.suppliers[0]?.site||'Branch',1,1)))}
const x={
login:(u,pin)=>{u=u.trim().toLowerCase();const h=H(pin)
if(u===db.plat.admin.username&&h===db.plat.admin.pin){mut(n=>{n.ses={kind:'super'};pl(n,'Super admin signed in')});return {ok:1}}
for(const t of db.tenants){const m=t.staff.find(y=>y.username===u&&y.pin===h);if(m){if(t.status==='suspended')return {err:'This company account is suspended. Contact support.'};if(!m.active)return {err:'This account is disabled. Contact your administrator.'}
mut(n=>{const t2=tn(n,t.id);t2.staff.find(z=>z.id===m.id).last=nowL();n.ses={kind:'tenant',tid:t.id,uid:m.id,bid:m.branch&&m.branch!=='all'&&t.branches.some(b=>b.id===m.branch)?m.branch:t.branches[0].id}});return {ok:1}}}
return {err:'Wrong username or PIN.'}},
logout:()=>mut(n=>{n.ses=null}),
switchBranch:id=>mut(n=>{n.ses.bid=id}),
addBranch:(name,region)=>mut(n=>{tn(n,n.ses.tid).branches.push({id:uid('br'),name,region,data:mkBranch(region,1,0)})}),
register:f=>mut(n=>{const id=uid('t'),o=ST(f.name,f.username,'Owner','all',f.pin);o.phone=f.phone;o.email=f.email
n.tenants.push({id,name:f.company,plan:f.plan,status:'trial',created:today(),sector:f.sector,region:f.region,staff:[o],branches:f.branches.map((b,i)=>({id:uid('br'),name:b.name,region:b.region||f.region,data:mkBranch(b.region||f.region,1,f.demo&&i===0?1:0)}))})
n.ses={kind:'tenant',tid:id,uid:o.id,bid:n.tenants.find(z=>z.id===id).branches[0].id};pl(n,'New company registered: '+f.company+' ('+f.plan+')')}),
setTenant:(id,p,m)=>mut(n=>{Object.assign(tn(n,id),p);pl(n,m||'Updated tenant '+tn(n,id).name)}),
resetPin:(id,pin)=>mut(n=>{const t=tn(n,id);(t.staff.find(y=>y.role==='Owner')||t.staff[0]).pin=H(pin);pl(n,'Owner PIN reset for '+t.name)}),
impersonate:id=>mut(n=>{const t=tn(n,id),o=t.staff.find(y=>y.role==='Owner')||t.staff[0];n.ses={kind:'tenant',tid:id,uid:o.id,bid:t.branches[0].id,imp:1};pl(n,'Support opened '+t.name)}),
exitImp:()=>mut(n=>{n.ses={kind:'super'}})}
return <C.Provider value={{s,a,db,T,B,me,x,ses}}>{children}</C.Provider>}

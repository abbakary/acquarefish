export const f=n=>Math.round(+n||0).toLocaleString('en-US')
export const tzs=n=>'TZS '+f(n)
export const Sheet=({title,onClose,children})=><div className="ov" onClick={onClose}><div className="sheet" onClick={e=>e.stopPropagation()}><div className="grab"/><h3>{title}</h3>{children}</div></div>
export const Field=({label,children})=><label className="fld"><span>{label}</span>{children}</label>
export const Badge=({c='blue',children})=><span className={'bd '+c}>{children}</span>
export const Empty=({t})=><div className="empty"><div>🐟</div><p>{t}</p></div>
export const Fab=({onClick,children})=><button className="fab" onClick={onClick}>{children}</button>
export const Seg=({v,set,items})=><div className="seg">{items.map(i=><button key={i} className={v===i?'on':''} onClick={()=>set(i)}>{i}</button>)}</div>
export const Btn=({c='',...p})=><button {...p} className={'btn '+c}/>
export const Receipt=({title,lines,onClose})=><Sheet title={title} onClose={onClose}><div className="rcpt"><b>FishTrade ERP</b>{lines.map((l,i)=><div key={i}>{l}</div>)}</div>
<a className="btn pri" style={{display:'block',textAlign:'center',textDecoration:'none',marginBottom:8}} href={'https://wa.me/?text='+encodeURIComponent(title+'\n'+lines.join('\n'))} target="_blank" rel="noreferrer">Send on WhatsApp</a><Btn c="ghost" onClick={()=>window.print()}>Print receipt</Btn></Sheet>
export const atOf=b=>b.at||(b.date||'')+'T00:00'
export const fmtT=t=>new Date(t).toLocaleString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})
export const Scene=()=><svg className="scene" viewBox="0 0 400 140" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1b4fa8"/><stop offset=".55" stopColor="#f2a65a"/><stop offset="1" stopColor="#f7d29a"/></linearGradient><linearGradient id="wt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a86c9"/><stop offset="1" stopColor="#0b2d6b"/></linearGradient></defs>
<rect width="400" height="140" fill="url(#sk)"/><circle cx="300" cy="74" r="34" fill="#ffe3a8" opacity=".3"/><circle cx="300" cy="74" r="20" fill="#ffe9b8"/><rect y="80" width="400" height="60" fill="url(#wt)"/>
<path d="M0 84 Q50 77 100 84 T200 84 T300 84 T400 84" stroke="#fff" strokeOpacity=".35" fill="none"/><path d="M270 92 h60 M280 100 h40" stroke="#ffe9b8" strokeOpacity=".5" strokeWidth="2"/>
<g fill="#0f2250"><path d="M30 96 h80 l-12 13 h-56z"/><rect x="66" y="64" width="2.5" height="32"/><path d="M68.5 66 l26 24 h-26z" fill="#f6e7c9"/></g>
<g fill="#0f2250" transform="translate(150 8) scale(.75)"><path d="M30 96 h80 l-12 13 h-56z"/><rect x="66" y="64" width="2.5" height="32"/><path d="M68.5 66 l26 24 h-26z" fill="#f6e7c9"/></g></svg>
const FC={'Nile Perch':['#aebdc2','#5f747b',13,0],Tilapia:['#f0c4ae','#b4705f',15,1],'Dagaa (Sardines)':['#eaf1f6','#8fa8ba',8,0],Catfish:['#7a7066','#3d3731',11,2]}
const fk=sp=>Object.keys(FC).find(x=>(sp||'').startsWith(x))||'Nile Perch'
export const Fish=({sp,s=44})=>{const k=fk(sp),[a,b,ry,x]=FC[k],id='fg'+k.length+ry
return <svg width={s} height={s*.62} viewBox="0 0 64 40"><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={b}/><stop offset=".6" stopColor={a}/><stop offset="1" stopColor="#fff"/></linearGradient></defs>
<path d="M50 20 L63 8 Q58 20 63 32z" fill={b}/><path d="M22 9 Q30 1 41 9z" fill={b}/><ellipse cx="30" cy="20" rx="24" ry={ry} fill={`url(#${id})`}/>
{x===1&&[22,30,38].map(i=><path key={i} d={`M${i} ${22-ry} Q${i+2} 20 ${i} ${18+ry}`} stroke={b} strokeWidth="1.6" fill="none" opacity=".5"/>)}
{x===2&&<g stroke={b} strokeWidth="1.2" fill="none"><path d="M8 22 Q2 26 0 31"/><path d="M8 24 Q3 30 4 37"/></g>}
<circle cx="12" cy="18" r="2.2" fill="#10244f"/><circle cx="11.4" cy="17.4" r=".7" fill="#fff"/><path d="M19 12 Q22 20 19 28" stroke={b} fill="none" strokeWidth="1"/></svg>}
export const FishImg=({sp,s=44})=>{const slug=fk(sp).toLowerCase().replace(/[^a-z]+/g,'-').replace(/-$/,'')
return <span className="fimg" style={{width:s,height:s*.72}}><Fish sp={sp} s={s*.9}/><img src={'fish/'+slug+'.jpg'} alt="" onError={e=>{e.currentTarget.style.display='none'}}/></span>}
export const Kpis=({a})=><div className="grid2">{a.map(k=><div className="card kpi" key={k[0]}><span>{k[2]}</span><small>{k[0]}</small><b>{k[1]}</b></div>)}</div>

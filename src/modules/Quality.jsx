import React, { useState } from 'react'
import {
  ShieldCheck,
  ShieldAlert,
  Thermometer,
  CheckCircle2,
  XCircle,
  FileCheck,
  Search,
  AlertTriangle,
  Info
} from 'lucide-react'
import { useS } from '../store'
import { Modal, Field, Badge, FishPhoto, f, fmtT } from '../ui'

export default function Quality() {
  const { s, a, me } = useS()
  const [b, setB] = useState(null)
  const [d, setD] = useState({
    acc: '',
    temp: '2.2',
    reason: 'High core temperature',
    checklist: {
      eyes: true,
      gills: true,
      flesh: true,
      smell: true
    }
  })

  const pend = s.batches.filter(x => x.st === 'pending')
  const done = s.batches.filter(x => x.st !== 'pending')
  const totalAcc = done.reduce((t, x) => t + (x.kg - x.rej), 0)
  const totalRej = done.reduce((t, x) => t + x.rej, 0)
  const totalInspectedKg = totalAcc + totalRej
  const rejRate = totalInspectedKg ? Math.round((totalRej / totalInspectedKg) * 100) : 0

  const accKg = d.acc === '' ? (b ? b.kg : 0) : +d.acc
  const rejKg = b ? Math.max(0, b.kg - accKg) : 0

  const submitInspection = () => {
    if (!b) return
    a.inspect(b.id, accKg, d.temp === '' ? null : +d.temp, rejKg > 0 ? d.reason : '')
    setB(null)
  }

  return (
    <div className="page-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 m-0">Quality Control &amp; Fish Inspection</h2>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Strict cold chain reception compliance: organoleptic testing, temperature logging, and rejection segregation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-600" /> TMDA / EU Standard: &le; 4.0°C Core Temp
          </span>
        </div>
      </div>

      {/* Visual Quality Lab Header */}
      <div className="panel p-0 overflow-hidden flex flex-col md:flex-row items-center border border-slate-200">
        <div className="w-full md:w-56 h-28 shrink-0 bg-slate-900 relative">
          <img
            src="/photos/quality-inspection.png"
            alt="Factory Quality Inspection"
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-1.5 left-1.5 bg-slate-950/80 text-blue-300 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold backdrop-blur-sm">
            HACCP LAB
          </span>
        </div>
        <div className="p-3.5 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 m-0">Sensory &amp; Temperature Inspection Protocols</h3>
            <p className="text-xs text-slate-500 m-0 mt-0.5">
              Verify gill color (bright red), firm elasticity, clear eyes, fresh cucumber odor, and core temperature &le; 4.0°C.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1.5 whitespace-nowrap shrink-0">
            <ShieldCheck size={14} className="text-blue-600" /> FiRCIS Grade Classification
          </span>
        </div>
      </div>

      {/* Quality KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap">
            <FileCheck size={22} />
          </div>
          <div className="kpi-content">
            <small>Deliveries Inspected</small>
            <b>{done.length} <span className="text-xs font-sans text-slate-400">lots</span></b>
            <span className="kpi-sub">{pend.length} pending review</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap green">
            <CheckCircle2 size={22} />
          </div>
          <div className="kpi-content">
            <small>Accepted Prime Seafood</small>
            <b>{f(totalAcc)} <span className="text-xs font-sans text-slate-400">kg</span></b>
            <span className="kpi-sub text-emerald-600 font-semibold">Saleable inventory</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap amber">
            <XCircle size={22} />
          </div>
          <div className="kpi-content">
            <small>Rejected / Substandard</small>
            <b>{f(totalRej)} <span className="text-xs font-sans text-slate-400">kg</span></b>
            <span className="kpi-sub text-rose-600 font-semibold">Segregated from chain</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap purple">
            <Thermometer size={22} />
          </div>
          <div className="kpi-content">
            <small>Defect / Rejection Rate</small>
            <b>{rejRate}%</b>
            <span className="kpi-sub">Tolerance threshold: &lt; 5%</span>
          </div>
        </div>
      </div>

      {/* Authentic Food Safety & Inspection Lab Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inspection Protocols Guide with Real Image */}
        <div className="panel lg:col-span-1 p-0 overflow-hidden">
          <div className="relative h-44 bg-slate-900">
            <img
              src="/assets/aistudio/image_da307d78.png"
              alt="Quality Inspectors checking fresh fish"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent p-4 flex flex-col justify-end">
              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">HACCP &amp; FiRCIS Inspection</span>
              <h4 className="text-base font-bold text-white m-0">Freshness Verification Lab</h4>
            </div>
          </div>
          <div className="p-4 flex flex-col gap-3 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Eyes:</strong> Convex, clear cornea, black pupils (no cloudiness).</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Gills:</strong> Bright crimson/red, free of sticky slime or brown mucus.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Flesh &amp; Skin:</strong> Firm, elastic to pressure; scales intact and glistening.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Temperature:</strong> Core probe must measure between 0.0°C and 4.0°C.</span>
            </div>
          </div>
        </div>

        {/* Batches Awaiting Inspection */}
        <div className="panel lg:col-span-2">
          <div className="panel-header">
            <div>
              <h3>Arrival Batches Awaiting Quality Sign-Off</h3>
              <p>Fish landed at dock and held in chiller pending inspector approval</p>
            </div>
            <Badge variant={pend.length > 0 ? 'amber' : 'green'}>
              {pend.length} Pending
            </Badge>
          </div>

          {pend.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
              <ShieldCheck size={36} className="text-emerald-600 mx-auto mb-2" />
              <b className="text-sm text-slate-800 block">All Deliveries Inspected &amp; Certified</b>
              <p className="text-xs text-slate-500 m-0">No incoming fish batches waiting for inspection.</p>
            </div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Batch Lot</th>
                    <th>Fish &amp; Grade</th>
                    <th>Supplier / Landing</th>
                    <th>Arrived Weight</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pend.map(x => {
                    const supObj = s.suppliers.find(y => y.id === x.sup)
                    return (
                      <tr key={x.id}>
                        <td>
                          <b className="font-mono text-blue-700">{x.no}</b>
                          <small className="block font-mono text-slate-400">{x.pur}</small>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <FishPhoto sp={x.sp} size={32} />
                            <div>
                              <b className="text-slate-900 block">{x.sp}</b>
                              <small className="text-slate-500">Grade {x.grade}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="text-slate-800 font-medium block">{supObj?.name || x.sup}</span>
                          <small className="text-slate-400">{x.site}</small>
                        </td>
                        <td>
                          <b className="font-mono text-slate-900">{f(x.kg)} kg</b>
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => {
                              setB(x)
                              setD({
                                acc: String(x.kg),
                                temp: '2.1',
                                reason: 'High core temperature',
                                checklist: { eyes: true, gills: true, flesh: true, smell: true }
                              })
                            }}
                            className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-700"
                          >
                            <ShieldCheck size={14} /> Inspect &amp; Grade
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Inspection History Log */}
      <div className="panel p-0 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 m-0">Inspection Log &amp; Quality Certifications</h3>
          <p className="text-xs text-slate-500 m-0">Verified audit records of fish lots approved for industrial processing</p>
        </div>
        <div className="data-table-wrap border-0 rounded-none">
          <table className="data-table">
            <thead>
              <tr>
                <th>Batch #</th>
                <th>Fish Species</th>
                <th>Supplier</th>
                <th>Core Temp</th>
                <th>Accepted (kg)</th>
                <th>Rejected (kg)</th>
                <th>Rejection Reason</th>
                <th>Inspection Date</th>
                <th>Verdict</th>
              </tr>
            </thead>
            <tbody>
              {done.map(x => {
                const supObj = s.suppliers.find(y => y.id === x.sup)
                return (
                  <tr key={x.id}>
                    <td>
                      <b className="font-mono text-slate-800">{x.no}</b>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <FishPhoto sp={x.sp} size={28} />
                        <span className="font-medium text-slate-900">{x.sp} ({x.grade})</span>
                      </div>
                    </td>
                    <td>{supObj?.name || x.sup}</td>
                    <td>
                      <span className="font-mono font-semibold text-emerald-700">
                        {x.temp ? `${x.temp}°C` : '2.1°C'}
                      </span>
                    </td>
                    <td>
                      <b className="font-mono text-emerald-700">{f(x.kg - (x.rej || 0))} kg</b>
                    </td>
                    <td>
                      <span className={`font-mono ${x.rej > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                        {f(x.rej || 0)} kg
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-slate-500">{x.reason || 'None (Prime Quality)'}</span>
                    </td>
                    <td>
                      <span className="text-xs font-mono text-slate-600">{x.insp || x.date}</span>
                    </td>
                    <td>
                      <Badge variant={x.st === 'accepted' ? 'green' : 'red'}>
                        {x.st === 'accepted' ? 'Certified' : 'Rejected'}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Batch Modal */}
      {b && (
        <Modal
          title={`Quality Inspection: ${b.no}`}
          subtitle={`Arrived: ${f(b.kg)} kg ${b.sp} from ${s.suppliers.find(y => y.id === b.sup)?.name}`}
          onClose={() => setB(null)}
          maxWidth="max-w-xl"
        >
          <div className="flex flex-col gap-4">
            {/* Checklist */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2 text-xs">
              <span className="font-bold text-slate-900 uppercase tracking-wide">
                Organoleptic Quality Checklist (HACCP):
              </span>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={d.checklist.eyes}
                    onChange={e => setD({ ...d, checklist: { ...d.checklist, eyes: e.target.checked } })}
                  />
                  <span>Eyes: Clear &amp; Convex</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={d.checklist.gills}
                    onChange={e => setD({ ...d, checklist: { ...d.checklist, gills: e.target.checked } })}
                  />
                  <span>Gills: Bright Red / Pink</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={d.checklist.flesh}
                    onChange={e => setD({ ...d, checklist: { ...d.checklist, flesh: e.target.checked } })}
                  />
                  <span>Flesh: Firm &amp; Elastic</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={d.checklist.smell}
                    onChange={e => setD({ ...d, checklist: { ...d.checklist, smell: e.target.checked } })}
                  />
                  <span>Odor: Fresh Neutral Lake</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Reception Temp (°C)" hint="Target: 0°C to 4°C">
                <input
                  type="number"
                  step="0.1"
                  value={d.temp}
                  onChange={e => setD({ ...d, temp: e.target.value })}
                  className="input-field font-mono font-bold"
                />
              </Field>
              <Field label={`Accepted Weight (of ${b.kg} kg)`}>
                <input
                  type="number"
                  value={d.acc}
                  onChange={e => setD({ ...d, acc: e.target.value })}
                  className="input-field font-mono font-bold text-emerald-700"
                />
              </Field>
            </div>

            {rejKg > 0 && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs text-rose-900 font-bold">
                  <span>Rejected Substandard Fish:</span>
                  <span className="font-mono text-sm">{f(rejKg)} kg</span>
                </div>
                <Field label="Reason for Rejection">
                  <select
                    value={d.reason}
                    onChange={e => setD({ ...d, reason: e.target.value })}
                    className="input-field bg-white"
                  >
                    <option value="High core temperature (>4.0°C)">High core temperature (&gt;4.0°C)</option>
                    <option value="Belly burst & organ degradation">Belly burst &amp; organ degradation</option>
                    <option value="Mechanical crushed crate damage">Mechanical crushed crate damage</option>
                    <option value="Foul stale odor / discoloration">Foul stale odor / discoloration</option>
                    <option value="Undersized juvenile fish">Undersized juvenile fish</option>
                  </select>
                </Field>
                <p className="text-[11px] text-rose-700 m-0">
                  Notice: Rejected fish is blocked from entering saleable inventory and cannot be sold to factories.
                </p>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <button type="button" onClick={() => setB(null)} className="btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={submitInspection}
                disabled={!(accKg >= 0 && accKg <= b.kg)}
                className="btn-primary bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 size={16} /> Sign &amp; Authorize Batch
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

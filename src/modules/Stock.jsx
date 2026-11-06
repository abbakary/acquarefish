import React, { useState } from 'react'
import {
  Warehouse,
  ArrowRightLeft,
  Trash2,
  QrCode,
  Search,
  Filter,
  CheckCircle,
  Thermometer,
  Boxes,
  TrendingDown,
  ChevronRight
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts'
import { useS, stock, landed } from '../store'
import { Modal, Field, Badge, FishPhoto, TraceabilityModal, f, tzs } from '../ui'

export default function Stock() {
  const { s, a } = useS()
  const [m, setM] = useState(null)
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [traceBatch, setTraceBatch] = useState(null)
  const [d, setD] = useState({ b: '', to: '', kg: '', why: '' })
  const [tab, setTab] = useState('live') // 'live' or 'batches'

  const live = s.batches.filter(b => b.rem > 0 && b.st === 'accepted')
  const W = b => b.wh || s.wh[0]
  const bid = d.b || live[0]?.id
  const bb = s.batches.find(x => x.id === bid)
  const to = d.to && d.to !== W(bb || {}) ? d.to : s.wh.find(w => w !== W(bb || {}))
  const set = k => e => setD({ ...d, [k]: e.target.value })

  // SRS Section 2 Module 3 Aggregated Table data
  const speciesRows = [
    { sp: 'Nile Perch', grade: 'A' },
    { sp: 'Nile Perch', grade: 'B' },
    { sp: 'Tilapia', grade: 'A' },
    { sp: 'Dagaa (Sardines)', grade: 'Standard' },
    { sp: 'Catfish', grade: 'A' }
  ].map(spec => {
    const batches = s.batches.filter(b => b.sp === spec.sp && b.grade === spec.grade)
    const received = batches.reduce((acc, b) => acc + b.kg, 0)
    const available = batches.filter(b => b.st === 'accepted').reduce((acc, b) => acc + b.rem, 0)
    const sold = s.sales
      .filter(x => x.sp === spec.sp && x.grade === spec.grade)
      .reduce((acc, x) => acc + x.kg, 0)
    const avgPrice = batches.length ? Math.round(batches.reduce((acc, b) => acc + b.price, 0) / batches.length) : 7000
    const valuation = available * avgPrice

    return {
      ...spec,
      received,
      sold,
      available,
      valuation,
      avgPrice
    }
  }).filter(r => r.received > 0 || r.available > 0)

  const totalAvailable = speciesRows.reduce((a, b) => a + b.available, 0)
  const totalValuation = speciesRows.reduce((a, b) => a + b.valuation, 0)

  // Cold room chart data
  const roomData = s.wh.map(w => ({
    name: w.split(' ')[0],
    fullName: w,
    kg: live.filter(b => W(b) === w).reduce((t, b) => t + b.rem, 0)
  }))

  return (
    <div className="page-body">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 m-0">Fish Stock &amp; Cold Storage Inventory</h2>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            GS1/FiRCIS batch lot tracking, temperature logs, and cold room storage valuation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setM('tr')} className="btn-secondary text-xs">
            <ArrowRightLeft size={14} /> Stock Transfer
          </button>
          <button onClick={() => setM('ws')} className="btn-secondary text-xs text-rose-700 hover:bg-rose-50 border-rose-200">
            <Trash2 size={14} /> Write-off Spoilage
          </button>
        </div>
      </div>

      {/* Visual Cold Storage Facility Header */}
      <div className="panel p-0 overflow-hidden flex flex-col md:flex-row items-center border border-slate-200">
        <div className="w-full md:w-56 h-28 shrink-0 bg-slate-900 relative">
          <img
            src="/photos/cold-storage.png"
            alt="Cold Storage Warehouse"
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-1.5 left-1.5 bg-slate-950/80 text-cyan-300 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold backdrop-blur-sm">
            SUB-ZERO COLD ROOM
          </span>
        </div>
        <div className="p-3.5 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 m-0">Live Cold Room Holding Facility ({B.name})</h3>
            <p className="text-xs text-slate-500 m-0 mt-0.5">
              Automated FIFO inventory rotation, blast freezer holding (-18°C), and continuous temperature data monitoring.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 uppercase font-mono block">Total In Holding</span>
              <b className="text-base font-mono text-blue-900">{f(totalAvailable)} kg</b>
            </div>
            <div className="text-right border-l pl-3 border-slate-200">
              <span className="text-[11px] text-slate-400 uppercase font-mono block">Stock Value</span>
              <b className="text-base font-mono text-emerald-800">{tzs(totalValuation)}</b>
            </div>
          </div>
        </div>
      </div>

      {/* Cold Storage Facility KPI Cards (SRS Module 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {s.wh.map((w, i) => {
          const roomStock = live.filter(b => W(b) === w).reduce((t, b) => t + b.rem, 0)
          const temps = ['1.2°C', '2.5°C', '-18.4°C']
          return (
            <div key={w} className="panel p-4 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Warehouse size={16} className="text-blue-700" /> {w}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <Thermometer size={12} /> {temps[i] || '2.0°C'}
                </span>
              </div>
              <div>
                <span className="text-2xl font-bold font-mono text-slate-900">{f(roomStock)} kg</span>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, Math.round((roomStock / 4000) * 100))}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Capacity: 4,000 kg</span>
                <span>{Math.round((roomStock / 4000) * 100)}% utilized</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tabs: Live Inventory (BlueTrace Style) vs. Individual Batches */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setTab('live')}
          className={`pb-3 px-2 text-xs font-bold border-b-2 transition ${
            tab === 'live'
              ? 'border-blue-700 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Live Inventory Matrix ({speciesRows.length} Categories)
        </button>
        <button
          onClick={() => setTab('batches')}
          className={`pb-3 px-2 text-xs font-bold border-b-2 transition ${
            tab === 'batches'
              ? 'border-blue-700 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Active Batches &amp; Lot Traceability ({live.length})
        </button>
      </div>

      {tab === 'live' ? (
        /* BlueTrace-Style Live Inventory Table */
        <div className="panel p-0 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 m-0">Live Seafood Inventory Table</h3>
              <p className="text-xs text-slate-500 m-0">Real-time reconciliation of Received, Dispatched, and On-Hand Fish</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span>Total Available: <strong>{f(totalAvailable)} kg</strong></span>
              <span>Valuation: <strong className="text-emerald-700">{tzs(totalValuation)}</strong></span>
            </div>
          </div>
          <div className="data-table-wrap border-0 rounded-none">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fish Species</th>
                  <th>Grade</th>
                  <th>Received (Total)</th>
                  <th>Sold to Factories</th>
                  <th>Available On Hand</th>
                  <th>Est. Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {speciesRows.map(row => (
                  <tr key={`${row.sp}-${row.grade}`}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <FishPhoto sp={row.sp} size={36} />
                        <b className="text-slate-900">{row.sp}</b>
                      </div>
                    </td>
                    <td>
                      <Badge variant="blue">Grade {row.grade}</Badge>
                    </td>
                    <td>
                      <span className="font-mono text-slate-700">{f(row.received)} kg</span>
                    </td>
                    <td>
                      <span className="font-mono text-slate-700">{f(row.sold)} kg</span>
                    </td>
                    <td>
                      <b className="font-mono text-emerald-700 text-sm">{f(row.available)} kg</b>
                    </td>
                    <td>
                      <b className="font-mono text-slate-900">{tzs(row.valuation)}</b>
                    </td>
                    <td>
                      <Badge variant={row.available > 0 ? 'green' : 'neutral'}>
                        {row.available > 0 ? 'In Stock' : 'Depleted'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Batches & Traceability Table */
        <div className="panel p-0 overflow-hidden">
          <div className="data-table-wrap border-0 rounded-none">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch Number</th>
                  <th>Species &amp; Grade</th>
                  <th>Origin &amp; Supplier</th>
                  <th>Cold Room</th>
                  <th>Stock Balance</th>
                  <th>Landed Cost</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...s.batches].reverse().map(b => {
                  const supObj = s.suppliers.find(x => x.id === b.sup)
                  const unitLanded = landed(s, b)
                  return (
                    <tr key={b.id}>
                      <td>
                        <b className="font-mono text-blue-700 block">{b.no}</b>
                        <small className="text-slate-400 font-mono">{b.pur}</small>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <FishPhoto sp={b.sp} size={30} />
                          <div>
                            <span className="font-semibold text-slate-900 block">{b.sp}</span>
                            <small className="text-slate-500">Grade {b.grade}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-slate-800 font-medium block">{supObj?.name || b.sup}</span>
                        <small className="text-slate-400">{b.site}</small>
                      </td>
                      <td>
                        <span className="text-xs text-slate-700 font-medium flex items-center gap-1">
                          <Warehouse size={12} className="text-blue-600" /> {W(b)}
                        </span>
                      </td>
                      <td>
                        <b className="font-mono text-slate-900 text-sm">{f(b.rem)} / {f(b.kg)} kg</b>
                        <div className="w-24 bg-slate-100 rounded-full h-1 mt-1 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${Math.round((b.rem / (b.kg || 1)) * 100)}%` }}
                          />
                        </div>
                      </td>
                      <td>
                        <b className="font-mono text-slate-900">{tzs(unitLanded)}/kg</b>
                        <small className="text-slate-400 block font-mono">Fish: {tzs(b.price)}</small>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => setTraceBatch(b)}
                          className="btn-secondary text-xs px-2.5 py-1"
                        >
                          <QrCode size={13} /> Trace &amp; QR
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transfer or Write-off Modal Dialog */}
      {m && (
        <Modal
          title={m === 'tr' ? 'Cold Storage Stock Transfer' : 'Record Fish Spoilage / Wastage'}
          subtitle={m === 'tr' ? 'Move batches between landing chillers and main cold storage' : 'Document write-offs for damaged, thawed, or rejected fish'}
          onClose={() => setM(null)}
        >
          {live.length === 0 ? (
            <p className="text-sm text-slate-500">No active stock available to move.</p>
          ) : (
            <div className="flex flex-col gap-4">
              <Field label="Select Batch Lot">
                <select value={bid} onChange={set('b')} className="input-field font-mono">
                  {live.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.no} · {b.sp} (Grade {b.grade}) · {f(b.rem)} kg available in {W(b)}
                    </option>
                  ))}
                </select>
              </Field>

              {m === 'tr' ? (
                <>
                  <Field label="Destination Cold Room">
                    <select value={to} onChange={set('to')} className="input-field">
                      {s.wh.filter(w => w !== W(bb)).map(w => (
                        <option key={w}>{w}</option>
                      ))}
                    </select>
                  </Field>
                  <button
                    type="button"
                    onClick={() => {
                      a.transfer(bid, to)
                      setM(null)
                    }}
                    className="btn-primary"
                  >
                    Confirm Cold Room Transfer
                  </button>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Kilograms Lost (kg)">
                      <input
                        type="number"
                        value={d.kg}
                        onChange={set('kg')}
                        max={bb?.rem}
                        className="input-field font-mono font-bold"
                        placeholder="e.g. 25"
                      />
                    </Field>
                    <Field label="Reason for Loss">
                      <select value={d.why} onChange={set('why')} className="input-field">
                        <option value="Cold chain temperature fluctuation">Cold chain fluctuation</option>
                        <option value="Mechanical crushed crate damage">Crushed crate damage</option>
                        <option value="Belly burst deterioration">Belly burst deterioration</option>
                        <option value="Excessive ice thaw shrinkage">Ice thaw shrinkage</option>
                      </select>
                    </Field>
                  </div>
                  <button
                    type="button"
                    disabled={!(+d.kg > 0 && +d.kg <= (bb?.rem || 0))}
                    onClick={() => {
                      a.waste(bid, +d.kg, d.why || 'Cold chain temperature fluctuation')
                      setM(null)
                      setD({ ...d, kg: '', why: '' })
                    }}
                    className="btn-primary bg-rose-600 hover:bg-rose-700"
                  >
                    Confirm Write-Off Loss
                  </button>
                </>
              )}
            </div>
          )}
        </Modal>
      )}

      {/* Traceability Modal */}
      {traceBatch && (
        <TraceabilityModal batch={traceBatch} onClose={() => setTraceBatch(null)} />
      )}
    </div>
  )
}

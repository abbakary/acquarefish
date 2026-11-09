import React, { useState } from 'react'
import {
  Scale,
  Plus,
  Search,
  CheckCircle2,
  Share2,
  Printer,
  QrCode,
  ShieldCheck,
  Calendar,
  DollarSign,
  User,
  ArrowRight,
  RefreshCw,
  Clock
} from 'lucide-react'
import { useS, SPECIES, tot, supBal, supFuelDebt, supMaintDebt, supAccountStatement, nowL, canUserDo } from '../store'
import {
  Modal,
  Field,
  Badge,
  ScaleTerminal,
  ReceiptModal,
  TraceabilityModal,
  FishPhoto,
  f,
  tzs,
  fmtT,
  atOf
} from '../ui'

const init = {
  sup: '',
  sp: SPECIES[0],
  grade: 'A',
  kg: '350',
  price: '8000',
  paid: '1500000',
  method: 'M-Pesa (Mobile Money)',
  manual: false,
  when: '',
  deductFuel: true,
  fuelDeduction: '',
  deductMaint: true,
  maintDeduction: ''
}

export default function Buy() {
  const { s, a, me } = useS()
  const canRecordCatch = canUserDo(me, 'canBuy')
  const [open, setOpen] = useState(false)
  const [rc, setRc] = useState(null)
  const [traceBatch, setTraceBatch] = useState(null)
  const [step, setStep] = useState(0)
  const [d, setD] = useState(init)
  const [search, setSearch] = useState('')
  const [filterSp, setFilterSp] = useState('All')

  const total = (+d.kg || 0) * (+d.price || 0)
  const sup = d.sup || s.suppliers[0]?.id
  const sx = s.suppliers.find(x => x.id === sup)

  const activeFuelDebt = sup ? supFuelDebt(s, sup) : 0
  const activeMaintDebt = sup ? supMaintDebt(s, sup) : 0

  const fuelOff = d.deductFuel ? Math.min(activeFuelDebt, +d.fuelDeduction || activeFuelDebt) : 0
  const maintOff = d.deductMaint ? Math.min(activeMaintDebt, +d.maintDeduction || activeMaintDebt) : 0
  const totalOffset = fuelOff + maintOff
  const netEarnings = Math.max(0, total - totalOffset)
  const paid = Math.min(+d.paid || netEarnings, total)
  const ok2 = +d.kg > 0 && +d.price > 0 && !(d.manual && (!d.when || d.when > nowL()))

  const save = () => {
    const at = d.manual && d.when ? d.when : nowL()
    const purNo = 'PUR-' + String(s.seq.pur).padStart(6, '0')
    a.buy({
      at,
      date: at.slice(0, 10),
      manual: !!(d.manual && d.when),
      sup,
      sp: d.sp,
      grade: d.grade,
      kg: +d.kg,
      price: +d.price,
      paid: netEarnings,
      method: d.method,
      site: sx?.site || 'Mwanza Landing'
    })

    if (fuelOff > 0 || maintOff > 0) {
      a.settleFisherman({
        purId: purNo,
        supId: sup,
        fishTotal: total,
        fuelDeducted: fuelOff,
        maintDeducted: maintOff,
        netPayable: netEarnings,
        method: d.method,
        notes: `Deducted fuel debt (TZS ${fuelOff}) and maintenance debt (TZS ${maintOff}) from catch payout`
      })
    }

    setOpen(false)
    setStep(0)
    setD(init)
  }

  // Filtered batches
  const batches = [...s.batches].reverse().filter(b => {
    const supName = s.suppliers.find(x => x.id === b.sup)?.name || ''
    const matchSearch =
      b.pur.toLowerCase().includes(search.toLowerCase()) ||
      b.no.toLowerCase().includes(search.toLowerCase()) ||
      b.sp.toLowerCase().includes(search.toLowerCase()) ||
      supName.toLowerCase().includes(search.toLowerCase())
    const matchSp = filterSp === 'All' || b.sp === filterSp
    return matchSearch && matchSp
  })

  return (
    <div className="page-body">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 m-0">Fish Purchasing &amp; Weighing</h2>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Capture catches from fishermen, connect digital scales, and issue verified purchase vouchers.
          </p>
        </div>
        {canRecordCatch ? (
          <button
            onClick={() => {
              setD({ ...init, sup: s.suppliers[0]?.id || '' })
              setOpen(true)
            }}
            className="btn-primary"
          >
            <Plus size={16} /> New Fish Purchase (<span className="text-xs font-mono">&lt; 1 min</span>)
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 font-semibold">
            <span>Read-Only Scale View</span>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by purchase #, batch #, supplier, or species..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 text-xs"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['All', ...SPECIES].map(sp => (
            <button
              key={sp}
              onClick={() => setFilterSp(sp)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                filterSp === sp
                  ? 'bg-blue-900 text-white border-blue-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {sp}
            </button>
          ))}
        </div>
      </div>

      {/* Purchases Data Table */}
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Purchase &amp; Batch</th>
              <th>Fish Species</th>
              <th>Supplier / BMU</th>
              <th>Weight &amp; Price</th>
              <th>Total Amount</th>
              <th>Timestamp</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {batches.map(b => {
              const supObj = s.suppliers.find(x => x.id === b.sup)
              return (
                <tr key={b.id}>
                  <td>
                    <b className="font-mono text-blue-700">{b.pur}</b>
                    <small className="block font-mono text-slate-400">{b.no}</small>
                  </td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <FishPhoto sp={b.sp} size={36} />
                      <div>
                        <span className="font-bold text-slate-900 block">{b.sp}</span>
                        <small className="text-slate-500 font-mono">Grade {b.grade}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="font-medium text-slate-800 block">{supObj?.name || b.sup}</span>
                    <small className="text-slate-400">{b.site}</small>
                  </td>
                  <td>
                    <b className="font-mono text-slate-900">{f(b.kg)} kg</b>
                    <small className="block text-slate-400 font-mono">@ {tzs(b.price)}/kg</small>
                  </td>
                  <td>
                    <b className="font-mono text-slate-900">{tzs(tot(b))}</b>
                  </td>
                  <td>
                    <span className="text-xs text-slate-600 font-mono">{fmtT(atOf(b))}</span>
                  </td>
                  <td>
                    <Badge variant={b.st === 'accepted' ? 'green' : b.st === 'rejected' ? 'red' : 'amber'}>
                      {b.st === 'accepted' ? 'Accepted' : b.st === 'rejected' ? 'Rejected' : 'Pending QC'}
                    </Badge>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setTraceBatch(b)}
                        title="Traceability Chain & QR"
                        className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                      >
                        <QrCode size={16} />
                      </button>
                      <button
                        onClick={() => setRc(b)}
                        title="View & Print Voucher"
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                      >
                        <Printer size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* New Purchase Modal Dialog */}
      {open && (
        <Modal
          title="Record Fish Purchase &amp; Weighing"
          subtitle="Tanzania Lake Victoria Landing Protocol"
          onClose={() => {
            setOpen(false)
            setStep(0)
          }}
          maxWidth="max-w-2xl"
        >
          {/* Progress Steps */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs">
            {['1. Fisherman & Scale', '2. Species & Grading', '3. Voucher & Payment'].map((title, i) => (
              <span
                key={title}
                className={`font-semibold ${i === step ? 'text-blue-700' : i < step ? 'text-emerald-600' : 'text-slate-400'}`}
              >
                {title}
              </span>
            ))}
          </div>

          {step === 0 && (
            <div className="flex flex-col gap-4">
              {/* Electronic Scale Simulator (Panasonic Model matching dock photo) */}
              <ScaleTerminal
                weight={d.kg}
                onTare={() => setD({ ...d, kg: '0.0' })}
                onSimulateWeigh={() => {
                  const simulated = (250 + Math.random() * 450).toFixed(1)
                  setD({ ...d, kg: simulated })
                }}
              />

              <Field label="Supplier / Fisherman / BMU" hint="Registered Lake fishers">
                <select
                  value={sup}
                  onChange={e => setD({ ...d, sup: e.target.value })}
                  className="input-field"
                >
                  {s.suppliers.map(x => (
                    <option key={x.id} value={x.id}>
                      {x.name} ({x.cat}) · {x.site}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Net Fish Weight (kg)">
                  <input
                    type="number"
                    step="0.1"
                    value={d.kg}
                    onChange={e => setD({ ...d, kg: e.target.value })}
                    className="input-field font-mono text-base font-bold text-slate-900"
                  />
                </Field>
                <Field label="Landing Site">
                  <input
                    type="text"
                    disabled
                    value={sx?.site || 'Mwanza (Kirumba Mwaloni)'}
                    className="input-field bg-slate-50 text-slate-500"
                  />
                </Field>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={!(+d.kg > 0)}
                  className="btn-primary"
                >
                  Continue to Species &amp; Pricing <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <Field label="Fish Species Selection">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {SPECIES.map(x => (
                    <button
                      key={x}
                      type="button"
                      onClick={() => {
                        const defaults = {
                          'Nile Perch': 8000,
                          'Tilapia': 5200,
                          'Dagaa (Sardines)': 2600,
                          'Catfish': 4500
                        }
                        setD({ ...d, sp: x, price: String(defaults[x] || 7000) })
                      }}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition text-center ${
                        d.sp === x
                          ? 'border-blue-700 bg-blue-50/70 text-blue-950 font-bold shadow-sm'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <FishPhoto sp={x} size={54} />
                      <span className="text-xs leading-tight">{x}</span>
                    </button>
                  ))}
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Quality Classification">
                  <select
                    value={d.grade}
                    onChange={e => setD({ ...d, grade: e.target.value })}
                    className="input-field"
                  >
                    <option value="A">Grade A (Export / Prime)</option>
                    <option value="B">Grade B (Local Processing)</option>
                    <option value="C">Grade C (Smoke / Dry)</option>
                  </select>
                </Field>
                <Field label="Price per kg (TZS)">
                  <input
                    type="number"
                    value={d.price}
                    onChange={e => setD({ ...d, price: e.target.value })}
                    className="input-field font-mono font-bold"
                  />
                </Field>
              </div>

              {/* Calculated Total Bar */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-blue-800 uppercase tracking-wider block font-semibold">
                    Calculated Total ({f(d.kg)} kg × TZS {f(d.price)})
                  </span>
                  <span className="text-xl font-bold font-mono text-blue-950">{tzs(total)}</span>
                </div>
                <Badge variant="blue">Batch: BATCH-{String(s.batches.length + 1).padStart(3, '0')}</Badge>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button type="button" onClick={() => setStep(0)} className="btn-secondary">
                  Back
                </button>
                <button type="button" onClick={() => setStep(2)} className="btn-primary">
                  Review &amp; Issue Payment <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Supplier / BMU:</span>
                  <b className="text-slate-900">{sx?.name} ({sx?.site})</b>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Fish &amp; Grade:</span>
                  <b className="text-slate-900">{d.sp} · Grade {d.grade}</b>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Gross Quantity:</span>
                  <b className="font-mono text-slate-900">{f(d.kg)} kg</b>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1">
                  <span>Gross Catch Purchase Value:</span>
                  <span className="font-mono text-slate-900">{tzs(total)}</span>
                </div>
              </div>

              {/* Automatic Fisherman Credit Recovery (Fuel & Maintenance) */}
              {(activeFuelDebt > 0 || activeMaintDebt > 0) && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-col gap-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-amber-950">
                      <span>Fisherman Credit Settlement (Catch Deduction)</span>
                    </div>
                    <Badge variant="amber">Auto-offset</Badge>
                  </div>
                  <span className="text-[11px] text-amber-800">
                    The fisherman has outstanding fuel credit and/or boat repair debt. Deductions will be logged into their account statement without double-counting.
                  </span>

                  {activeFuelDebt > 0 && (
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-amber-200">
                      <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                        <input
                          type="checkbox"
                          checked={d.deductFuel}
                          onChange={e => setD({ ...d, deductFuel: e.target.checked })}
                          className="rounded text-blue-900 focus:ring-blue-900"
                        />
                        <span>Deduct Outstanding Fuel Debt (Balance: {tzs(activeFuelDebt)})</span>
                      </label>
                      <b className="font-mono text-red-600 font-bold">-{tzs(fuelOff)}</b>
                    </div>
                  )}

                  {activeMaintDebt > 0 && (
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-amber-200">
                      <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                        <input
                          type="checkbox"
                          checked={d.deductMaint}
                          onChange={e => setD({ ...d, deductMaint: e.target.checked })}
                          className="rounded text-blue-900 focus:ring-blue-900"
                        />
                        <span>Deduct Boat Maintenance Advance (Balance: {tzs(activeMaintDebt)})</span>
                      </label>
                      <b className="font-mono text-amber-700 font-bold">-{tzs(maintOff)}</b>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-1 border-t border-amber-200 font-bold text-slate-900">
                    <span>Net Catch Payment (After Credit Clear):</span>
                    <span className="text-base font-mono text-emerald-700">{tzs(netEarnings)}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Field label="Immediate Net Disbursement (TZS)">
                  <input
                    type="number"
                    value={netEarnings}
                    disabled
                    className="input-field font-mono font-bold bg-slate-50 text-emerald-800"
                  />
                </Field>
                <Field label="Payment Disbursement Method">
                  <select
                    value={d.method}
                    onChange={e => setD({ ...d, method: e.target.value })}
                    className="input-field"
                  >
                    <option>M-Pesa (Mobile Money)</option>
                    <option>Airtel Money</option>
                    <option>Cash Voucher</option>
                    <option>Bank Transfer (CRDB/NMB)</option>
                  </select>
                </Field>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                  Back
                </button>
                <button type="button" onClick={save} className="btn-primary bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle2 size={16} /> Complete &amp; Save Purchase
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Voucher / Receipt Modal */}
      {rc && (
        <ReceiptModal
          title={`Purchase Voucher ${rc.pur}`}
          lines={[
            ['Purchase ID', rc.pur],
            ['Batch ID', rc.no],
            ['Supplier', s.suppliers.find(x => x.id === rc.sup)?.name || rc.sup],
            ['Landing Site', rc.site],
            ['Species & Grade', `${rc.sp} (Grade ${rc.grade})`],
            ['Verified Weight', `${f(rc.kg)} kg`],
            ['Unit Price', `@ ${tzs(rc.price)}/kg`],
            ['Total Amount', tzs(tot(rc))],
            ['Timestamp', fmtT(atOf(rc))],
            ['Outstanding Balance', tzs(supBal(s, rc.sup))]
          ]}
          onClose={() => setRc(null)}
        />
      )}

      {/* Traceability Modal */}
      {traceBatch && (
        <TraceabilityModal batch={traceBatch} onClose={() => setTraceBatch(null)} />
      )}
    </div>
  )
}

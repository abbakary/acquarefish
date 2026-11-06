import React, { useState } from 'react'
import {
  Users,
  Anchor,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  Plus,
  Search,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Fuel as FuelIcon,
  Wrench,
  ArrowDownRight
} from 'lucide-react'
import { useS, SITES, supBal, supFuelDebt, supMaintDebt, supAccountStatement, tot } from '../store'
import { Modal, Field, Badge, FishPhoto, f, tzs, fmtT } from '../ui'

export default function Suppliers() {
  const { s, a } = useS()
  const [open, setOpen] = useState(false)
  const [viewSup, setViewSup] = useState(null)
  const [paySup, setPaySup] = useState(null)
  const [search, setSearch] = useState('')
  const [payForm, setPayForm] = useState({ amt: '', m: 'M-Pesa (Mobile Money)' })
  const [d, setD] = useState({
    name: '',
    phone: '',
    site: SITES[0],
    cat: 'Individual Fisherman',
    boat: 'MV Furaha'
  })

  const totalKg = s.batches.reduce((t, b) => t + b.kg, 0)
  const totalDebt = s.suppliers.reduce((t, x) => t + supBal(s, x.id), 0)

  const filteredSuppliers = s.suppliers.filter(x =>
    x.name.toLowerCase().includes(search.toLowerCase()) ||
    (x.no || '').toLowerCase().includes(search.toLowerCase()) ||
    (x.site || '').toLowerCase().includes(search.toLowerCase())
  )

  const handlePay = () => {
    if (!paySup || !(+payForm.amt > 0)) return
    a.pay(paySup.id, +payForm.amt, payForm.m)
    setPaySup(null)
    setPayForm({ amt: '', m: 'M-Pesa (Mobile Money)' })
  }

  return (
    <div className="page-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 m-0">Fishermen &amp; Supplier Management</h2>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Digital supplier registry, landing site BMU agreements, historical deliveries, and debt tracking.
          </p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary">
          <Plus size={16} /> Register New Supplier / BMU
        </button>
      </div>

      {/* KPI Cards (Inspired by Galatama Suppliers overview `image_9b74af37.png`) */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap">
            <Users size={22} />
          </div>
          <div className="kpi-content">
            <small>Active Registered Suppliers</small>
            <b>{s.suppliers.length} <span className="text-xs font-sans text-slate-400">fishers</span></b>
            <span className="kpi-sub">Lake Victoria &amp; Tanganyika</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap amber">
            <Anchor size={22} />
          </div>
          <div className="kpi-content">
            <small>Total Fish Sourced</small>
            <b>{f(totalKg)} <span className="text-xs font-sans text-slate-400">kg</span></b>
            <span className="kpi-sub">Across landing stations</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap green">
            <DollarSign size={22} />
          </div>
          <div className="kpi-content">
            <small>Outstanding Balances</small>
            <b className="text-rose-700">{tzs(totalDebt)}</b>
            <span className="kpi-sub">Pending disbursement</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap purple">
            <ShieldCheck size={22} />
          </div>
          <div className="kpi-content">
            <small>BMU Agreement Compliance</small>
            <b>98.4%</b>
            <span className="kpi-sub">Verified legal fishing gear</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search suppliers by name, code (SUP-001), or landing site..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-10 text-xs"
        />
      </div>

      {/* Suppliers Table */}
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Supplier Code &amp; Name</th>
              <th>Category</th>
              <th>Landing Station</th>
              <th>Phone Number</th>
              <th>Total Supplied</th>
              <th>Outstanding Debt</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map(sup => {
              const supKg = s.batches.filter(b => b.sup === sup.id).reduce((t, b) => t + b.kg, 0)
              const bal = supBal(s, sup.id)
              return (
                <tr key={sup.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-800 font-bold flex items-center justify-center text-xs border border-blue-200">
                        {sup.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <b className="text-slate-900 block">{sup.name}</b>
                        <small className="text-slate-400 font-mono">{sup.no || 'SUP-00' + sup.id.slice(1)}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge variant={sup.cat === 'BMU Fishing Group' ? 'blue' : 'neutral'}>
                      {sup.cat}
                    </Badge>
                  </td>
                  <td>
                    <span className="text-slate-800 flex items-center gap-1.5">
                      <MapPin size={12} className="text-slate-400" /> {sup.site}
                    </span>
                  </td>
                  <td>
                    <span className="font-mono text-slate-600">{sup.phone}</span>
                  </td>
                  <td>
                    <b className="font-mono text-slate-900">{f(supKg)} kg</b>
                  </td>
                  <td>
                    <b className={`font-mono ${bal > 0 ? 'text-rose-600 font-bold' : 'text-emerald-700'}`}>
                      {tzs(bal)}
                    </b>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {bal > 0 && (
                        <button
                          onClick={() => {
                            setPaySup(sup)
                            setPayForm({ amt: String(bal), m: 'M-Pesa (Mobile Money)' })
                          }}
                          className="btn-primary text-xs py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700"
                        >
                          <CreditCard size={12} /> Pay
                        </button>
                      )}
                      <button
                        onClick={() => setViewSup(sup)}
                        className="btn-secondary text-xs py-1 px-2.5"
                      >
                        Ledger
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Register New Supplier Modal */}
      {open && (
        <Modal
          title="Register New Fisherman or Supplier"
          subtitle="Record Beach Management Unit (BMU) details and landing base"
          onClose={() => setOpen(false)}
        >
          <div className="flex flex-col gap-4">
            <Field label="Supplier Full Name or Group Name">
              <input
                type="text"
                placeholder="e.g. Mussa Juma or Katonga Boat Team"
                value={d.name}
                onChange={e => setD({ ...d, name: e.target.value })}
                className="input-field"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone Number (M-Pesa / Airtel)">
                <input
                  type="tel"
                  placeholder="0754 123 456"
                  value={d.phone}
                  onChange={e => setD({ ...d, phone: e.target.value })}
                  className="input-field font-mono"
                />
              </Field>
              <Field label="Supplier Category">
                <select
                  value={d.cat}
                  onChange={e => setD({ ...d, cat: e.target.value })}
                  className="input-field"
                >
                  <option>Individual Fisherman</option>
                  <option>BMU Fishing Group</option>
                  <option>Dealer / Middleman</option>
                  <option>Aquaculture Fish Farm</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Primary Landing Site">
                <select
                  value={d.site}
                  onChange={e => setD({ ...d, site: e.target.value })}
                  className="input-field"
                >
                  {SITES.map(x => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label="Boat Name or Vessel Reg">
                <input
                  type="text"
                  placeholder="e.g. MV Victoria 02"
                  value={d.boat}
                  onChange={e => setD({ ...d, boat: e.target.value })}
                  className="input-field"
                />
              </Field>
            </div>

            <button
              type="button"
              disabled={!d.name}
              onClick={() => {
                a.addSup(d)
                setOpen(false)
                setD({ name: '', phone: '', site: SITES[0], cat: 'Individual Fisherman', boat: 'MV Furaha' })
              }}
              className="btn-primary mt-2"
            >
              Save Supplier to Register
            </button>
          </div>
        </Modal>
      )}

      {/* Supplier Ledger & Comprehensive Financial Statement Modal */}
      {viewSup && (() => {
        const statement = supAccountStatement(s, viewSup.id)
        const supFuelIssues = (s.fuelIssues || []).filter(f => f.supId === viewSup.id)
        const supWorkOrders = (s.maintenanceOrders || []).filter(m => m.supId === viewSup.id)
        const supSettlements = (s.settlements || []).filter(st => st.supId === viewSup.id)

        return (
          <Modal
            title={`Fisherman Statement: ${viewSup.name}`}
            subtitle={`${viewSup.cat} · ${viewSup.site} · ${viewSup.phone}`}
            onClose={() => setViewSup(null)}
            maxWidth="max-w-3xl"
          >
            <div className="flex flex-col gap-4 text-xs">
              {/* Financial Balance Summary Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Fish Earnings Due</span>
                  <b className="font-mono text-emerald-700 text-sm">{tzs(statement.fishOwed)}</b>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-red-700 block">Fuel Debt</span>
                  <b className="font-mono text-red-600 text-sm">-{tzs(statement.fuelDebt)}</b>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-800 block">Boat Maint. Debt</span>
                  <b className="font-mono text-amber-700 text-sm">-{tzs(statement.maintDebt)}</b>
                </div>
                <div className="border-l border-slate-200 pl-2">
                  <span className="text-[10px] uppercase font-bold text-blue-900 block">Net Fisherman Position</span>
                  <b className={`font-mono text-sm font-extrabold ${statement.netBalance >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    {tzs(statement.netBalance)}
                  </b>
                </div>
              </div>

              {/* SECTION 1: CATCH DELIVERIES */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>1. Fish Catch Delivered ({s.batches.filter(b => b.sup === viewSup.id).length})</span>
                  <span className="text-slate-500 font-normal">Landing Weighbridge</span>
                </h4>
                <div className="data-table-wrap max-h-36">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Batch</th>
                        <th>Species</th>
                        <th>Weight</th>
                        <th>Total Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {s.batches.filter(b => b.sup === viewSup.id).map(b => (
                        <tr key={b.id}>
                          <td className="font-mono text-xs">{b.date}</td>
                          <td className="font-mono text-xs text-blue-700">{b.no}</td>
                          <td>{b.sp}</td>
                          <td className="font-mono">{f(b.kg)} kg</td>
                          <td className="font-mono font-semibold">{tzs(tot(b))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 2: FUEL DISPENSED & DEBT */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>2. Dock Fuel Issues ({supFuelIssues.length})</span>
                  <span className="text-red-700 font-bold">Unpaid: {tzs(statement.fuelDebt)}</span>
                </h4>
                <div className="data-table-wrap max-h-36">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Voucher #</th>
                        <th>Date</th>
                        <th>Boat Reg</th>
                        <th>Litres</th>
                        <th>Total</th>
                        <th>Arrangement</th>
                        <th>Unpaid Debt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supFuelIssues.map(f => (
                        <tr key={f.id}>
                          <td className="font-mono text-xs text-blue-800">{f.no}</td>
                          <td>{f.date}</td>
                          <td className="font-mono">{f.boatReg || '-'}</td>
                          <td className="font-mono">{f.litres}L</td>
                          <td className="font-mono">{tzs(f.total)}</td>
                          <td>{f.arrangement}</td>
                          <td className="font-mono text-red-600 font-bold">{tzs(f.balance)}</td>
                        </tr>
                      ))}
                      {supFuelIssues.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-3 text-slate-400">No fuel issues logged for this fisherman.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 3: BOAT MAINTENANCE WORK ORDERS */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>3. Marine Fleet Maintenance ({supWorkOrders.length})</span>
                  <span className="text-amber-800 font-bold">Recoverable: {tzs(statement.maintDebt)}</span>
                </h4>
                <div className="data-table-wrap max-h-36">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Date</th>
                        <th>Job Title</th>
                        <th>Mechanic</th>
                        <th>Total Cost</th>
                        <th>Arrangement</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supWorkOrders.map(m => (
                        <tr key={m.id}>
                          <td className="font-mono text-xs text-blue-800">{m.no}</td>
                          <td>{m.date}</td>
                          <td className="truncate max-w-[140px]">{m.title}</td>
                          <td>{m.mechanic}</td>
                          <td className="font-mono">{tzs(m.totalCost)}</td>
                          <td>{m.arrangement}</td>
                          <td><Badge variant={m.status === 'Completed' ? 'green' : 'amber'}>{m.status}</Badge></td>
                        </tr>
                      ))}
                      {supWorkOrders.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-3 text-slate-400">No boat maintenance work orders for this fisherman.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 4: SETTLEMENTS & CASH CLEARANCES */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>4. Catch Deductions &amp; Settlements ({supSettlements.length})</span>
                  <span className="text-slate-500 font-normal">Cross-reconciliation</span>
                </h4>
                <div className="data-table-wrap max-h-32">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Settlement #</th>
                        <th>Date</th>
                        <th>Fish Value</th>
                        <th>Fuel Deducted</th>
                        <th>Maintenance Deducted</th>
                        <th>Net Paid</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supSettlements.map(st => (
                        <tr key={st.id}>
                          <td className="font-mono text-xs text-blue-800">{st.no}</td>
                          <td>{st.date}</td>
                          <td className="font-mono">{tzs(st.fishTotal)}</td>
                          <td className="font-mono text-red-600">-{tzs(st.fuelDeducted || 0)}</td>
                          <td className="font-mono text-amber-700">-{tzs(st.maintDeducted || 0)}</td>
                          <td className="font-mono font-bold text-emerald-700">{tzs(st.netPayable)}</td>
                        </tr>
                      ))}
                      {supSettlements.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-3 text-slate-400">No catch deductions settled yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Modal>
        )
      })()}

      {/* Fast Payment Modal */}
      {paySup && (
        <Modal
          title={`Pay Supplier: ${paySup.name}`}
          subtitle={`Outstanding Balance: ${tzs(supBal(s, paySup.id))}`}
          onClose={() => setPaySup(null)}
        >
          <div className="flex flex-col gap-4">
            <Field label="Disbursement Amount (TZS)">
              <input
                type="number"
                value={payForm.amt}
                onChange={e => setPayForm({ ...payForm, amt: e.target.value })}
                className="input-field font-mono font-bold text-lg"
              />
            </Field>

            <Field label="Payment Channel">
              <select
                value={payForm.m}
                onChange={e => setPayForm({ ...payForm, m: e.target.value })}
                className="input-field"
              >
                <option>M-Pesa (Mobile Money)</option>
                <option>Airtel Money</option>
                <option>Tigo Pesa</option>
                <option>CRDB / NMB Bank Transfer</option>
                <option>Cash Voucher</option>
              </select>
            </Field>

            <button
              type="button"
              onClick={handlePay}
              disabled={!(+payForm.amt > 0)}
              className="btn-primary bg-emerald-600 hover:bg-emerald-700"
            >
              Confirm &amp; Issue Disbursement Receipt
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

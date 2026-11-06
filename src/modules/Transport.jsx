import React, { useState } from 'react'
import {
  Truck,
  MapPin,
  Thermometer,
  DollarSign,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  User
} from 'lucide-react'
import { useS, SITES, trCost, refLabel, nowL } from '../store'
import { Modal, Field, Badge, f, tzs, fmtT, atOf } from '../ui'

export default function Transport() {
  const { s, a } = useS()
  const [tab, setTab] = useState('deliveries') // 'deliveries' or 'costs'
  const [dispatchOrder, setDispatchOrder] = useState(null)
  const [costModal, setCostModal] = useState(false)
  const [dispForm, setDispForm] = useState({ veh: 'T 342 EDK (KYC 3-Ton Refrigerated)', drv: 'Juma Ramadhani', st: 'In transit', temp: '1.8°C' })
  const [costForm, setCostForm] = useState({
    type: 'Industry Delivery',
    mode: 'KYC Refrigerated Truck',
    from: s.wh[0],
    to: s.customers[0]?.name || 'Nyakato Processing Plant',
    ref: '',
    cost: '180000',
    veh: 'T 342 EDK',
    temp: '1.5°C',
    method: 'CRDB Bank'
  })

  const trips = s.trips || []
  const totalTrCost = trCost(s)
  const totalKg = s.batches.reduce((t, b) => t + b.kg, 0)
  const costPerKg = totalKg ? Math.round(totalTrCost / totalKg) : 0

  const handleSaveDispatch = () => {
    if (!dispatchOrder) return
    a.dispatch(dispatchOrder.id, dispForm)
    setDispatchOrder(null)
  }

  const handleSaveCost = () => {
    a.addTrip({
      ...costForm,
      cost: +costForm.cost || 0,
      date: nowL().slice(0, 10),
      at: nowL()
    })
    setCostModal(false)
  }

  return (
    <div className="page-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 m-0">Refrigerated Transport &amp; Delivery Logistics</h2>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Cold chain vehicle monitoring (KYC light trucks &amp; insulated carriers), temperature logging, and dispatch notes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCostModal(true)} className="btn-primary">
            <Plus size={16} /> Log Transport Run / Trip Cost
          </button>
        </div>
      </div>

      {/* Visual Cold Chain Fleet Header */}
      <div className="panel p-0 overflow-hidden flex flex-col md:flex-row items-center border border-slate-200">
        <div className="w-full md:w-56 h-28 shrink-0 bg-slate-900 relative">
          <img
            src="/photos/refrigerated-truck.png"
            alt="Refrigerated Truck Loading"
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-1.5 left-1.5 bg-slate-950/80 text-amber-300 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold backdrop-blur-sm">
            KYC COLD FLEET
          </span>
        </div>
        <div className="p-3.5 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 m-0">Insulated Transport Fleet (Pier to Factory Gate)</h3>
            <p className="text-xs text-slate-500 m-0 mt-0.5">
              Tanzanian registration plates (T 342 EDK, T 819 DXZ) with continuous temperature compliance tracking and freight cost apportionment.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 whitespace-nowrap shrink-0">
            <CheckCircle2 size={14} className="text-emerald-600" /> Active Fleet GPS &amp; Chill Logged
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap">
            <Truck size={22} />
          </div>
          <div className="kpi-content">
            <small>Total Transport Spend</small>
            <b>{tzs(totalTrCost)}</b>
            <span className="kpi-sub">Landed cost component</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap amber">
            <DollarSign size={22} />
          </div>
          <div className="kpi-content">
            <small>Freight Cost per Kg</small>
            <b>{tzs(costPerKg)} <span className="text-xs font-sans text-slate-400">/kg</span></b>
            <span className="kpi-sub">Average across trips</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap green">
            <CheckCircle2 size={22} />
          </div>
          <div className="kpi-content">
            <small>Dispatched Deliveries</small>
            <b>{s.sales.filter(x => x.dis.st === 'Delivered').length} <span className="text-xs font-sans text-slate-400">completed</span></b>
            <span className="kpi-sub">{s.sales.filter(x => x.dis.st !== 'Delivered').length} in transit</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap purple">
            <Thermometer size={22} />
          </div>
          <div className="kpi-content">
            <small>Cold Chain Transit Temp</small>
            <b>1.5°C</b>
            <span className="kpi-sub text-emerald-600 font-semibold">Active cooling active</span>
          </div>
        </div>
      </div>

      {/* Real KYC Cold Chain Vehicle Showcase & Live Dispatches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real Vehicle Asset Showcase */}
        <div className="panel lg:col-span-1 p-0 overflow-hidden">
          <div className="relative h-44 bg-slate-900">
            <img
              src="/assets/aistudio/image_eec00c9e.png"
              alt="KYC Refrigerated Truck loading fish at pier"
              className="w-full h-full object-cover opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent p-4 flex flex-col justify-end">
              <span className="text-[11px] font-mono text-sky-400 uppercase tracking-wider">Fleet Asset</span>
              <h4 className="text-base font-bold text-white m-0">KYC Light Refrigerated Carriers</h4>
            </div>
          </div>
          <div className="p-4 flex flex-col gap-2.5 text-xs text-slate-600">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Fleet Standard:</span>
              <b className="text-slate-800">1 to 3 Ton Insulated Box Trucks</b>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Active Fleet:</span>
              <b className="text-slate-800 font-mono">T 342 EDK, T 819 DXZ</b>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Target Core Temp:</span>
              <b className="text-emerald-700 font-mono">0.0°C to 2.5°C</b>
            </div>
            <p className="text-[11px] text-slate-500 m-0 pt-1">
              Maintains seafood freshness from landing beaches in Mwanza &amp; Kigoma to factory loading bays.
            </p>
          </div>
        </div>

        {/* Deliveries & Dispatches Table */}
        <div className="panel lg:col-span-2">
          <div className="panel-header">
            <div>
              <h3>Factory Shipments &amp; Vehicle Assignments</h3>
              <p>Delivery dispatches to ABC Fish Processing, Victoria Perch &amp; Export clients</p>
            </div>
          </div>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order / Dispatch</th>
                  <th>Factory Client</th>
                  <th>Dispatched Weight</th>
                  <th>Carrier &amp; Driver</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {[...s.sales].reverse().map(y => {
                  const cusName = s.customers.find(z => z.id === y.cus)?.name || y.cus
                  return (
                    <tr key={y.id}>
                      <td>
                        <b className="font-mono text-blue-700">{y.no}</b>
                        <small className="block font-mono text-slate-400">{y.date}</small>
                      </td>
                      <td>
                        <b className="text-slate-900 block">{cusName}</b>
                        <small className="text-slate-500">{y.sp} · Grade {y.grade}</small>
                      </td>
                      <td>
                        <b className="font-mono text-slate-900">{f(y.kg)} kg</b>
                      </td>
                      <td>
                        <span className="text-slate-800 block text-xs font-semibold">{y.dis.veh || 'T 342 EDK (KYC Truck)'}</span>
                        <small className="text-slate-500">{y.dis.drv || 'Driver Assigned'}</small>
                      </td>
                      <td>
                        <Badge variant={y.dis.st === 'Delivered' ? 'green' : 'amber'}>
                          {y.dis.st}
                        </Badge>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => {
                            setDispatchOrder(y)
                            setDispForm({
                              veh: y.dis.veh || 'T 342 EDK (KYC 3-Ton Refrigerated)',
                              drv: y.dis.drv || 'Juma Ramadhani',
                              st: y.dis.st || 'In transit',
                              temp: '1.8°C'
                            })
                          }}
                          className="btn-secondary text-xs px-2.5 py-1"
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transport Runs & Ledger */}
      <div className="panel p-0 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 m-0">Transport Trip Cost Journal</h3>
          <p className="text-xs text-slate-500 m-0">Freight expenses apportioned into landed cost calculation per batch</p>
        </div>
        <div className="data-table-wrap border-0 rounded-none">
          <table className="data-table">
            <thead>
              <tr>
                <th>Route (From &rarr; To)</th>
                <th>Run Type</th>
                <th>Vehicle &amp; Mode</th>
                <th>Trip Cost (TZS)</th>
                <th>Payment Channel</th>
                <th>Date &amp; Time</th>
              </tr>
            </thead>
            <tbody>
              {trips.map(t => (
                <tr key={t.id}>
                  <td>
                    <b className="text-slate-900 block">{t.from} &rarr; {t.to}</b>
                    <small className="font-mono text-slate-400">{refLabel(s, t)}</small>
                  </td>
                  <td>
                    <Badge variant="blue">{t.type}</Badge>
                  </td>
                  <td>
                    <span className="text-slate-800 font-medium block">{t.mode}</span>
                    <small className="font-mono text-slate-400">{t.veh || 'Fleet Truck'}</small>
                  </td>
                  <td>
                    <b className="font-mono text-slate-900 text-sm">{tzs(t.cost)}</b>
                  </td>
                  <td>
                    <span className="text-xs text-slate-600">{t.method || 'Bank Transfer'}</span>
                  </td>
                  <td>
                    <span className="font-mono text-xs text-slate-500">{fmtT(atOf(t))}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Modal */}
      {dispatchOrder && (
        <Modal
          title={`Update Dispatch Status: ${dispatchOrder.no}`}
          subtitle={`Client: ${s.customers.find(z => z.id === dispatchOrder.cus)?.name}`}
          onClose={() => setDispatchOrder(null)}
        >
          <div className="flex flex-col gap-4">
            <Field label="Vehicle Registration / Carrier Model">
              <input
                type="text"
                value={dispForm.veh}
                onChange={e => setDispForm({ ...dispForm, veh: e.target.value })}
                className="input-field"
              />
            </Field>

            <Field label="Driver Name &amp; Contact">
              <input
                type="text"
                value={dispForm.drv}
                onChange={e => setDispForm({ ...dispForm, drv: e.target.value })}
                className="input-field"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Transit Temperature">
                <input
                  type="text"
                  value={dispForm.temp}
                  onChange={e => setDispForm({ ...dispForm, temp: e.target.value })}
                  className="input-field font-mono"
                />
              </Field>
              <Field label="Delivery Status">
                <select
                  value={dispForm.st}
                  onChange={e => setDispForm({ ...dispForm, st: e.target.value })}
                  className="input-field"
                >
                  <option>Loading at Chiller</option>
                  <option>In transit</option>
                  <option>Delivered</option>
                </select>
              </Field>
            </div>

            <button
              type="button"
              onClick={handleSaveDispatch}
              className="btn-primary bg-emerald-600 hover:bg-emerald-700 mt-2"
            >
              Save Dispatch Details
            </button>
          </div>
        </Modal>
      )}

      {/* Log Transport Cost Modal */}
      {costModal && (
        <Modal
          title="Log Cold Chain Transport Expense"
          subtitle="Record trip freight for inclusion in landed cost accounting"
          onClose={() => setCostModal(false)}
        >
          <div className="flex flex-col gap-4">
            <Field label="Trip Category">
              <select
                value={costForm.type}
                onChange={e => setCostForm({ ...costForm, type: e.target.value })}
                className="input-field"
              >
                <option value="Industry Delivery">Industry Delivery (To Processing Plant)</option>
                <option value="Landing Collection">Landing Collection (Landing Site &rarr; Cold Room)</option>
                <option value="Inter-Branch Transfer">Inter-Branch Transfer</option>
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Origin Location">
                <input
                  type="text"
                  value={costForm.from}
                  onChange={e => setCostForm({ ...costForm, from: e.target.value })}
                  className="input-field"
                />
              </Field>
              <Field label="Destination">
                <input
                  type="text"
                  value={costForm.to}
                  onChange={e => setCostForm({ ...costForm, to: e.target.value })}
                  className="input-field"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Trip Expense Amount (TZS)">
                <input
                  type="number"
                  value={costForm.cost}
                  onChange={e => setCostForm({ ...costForm, cost: e.target.value })}
                  className="input-field font-mono font-bold"
                />
              </Field>
              <Field label="Payment Method">
                <select
                  value={costForm.method}
                  onChange={e => setCostForm({ ...costForm, method: e.target.value })}
                  className="input-field"
                >
                  <option>CRDB / NMB Bank</option>
                  <option>M-Pesa (Mobile Money)</option>
                  <option>Cash Voucher</option>
                </select>
              </Field>
            </div>

            <button
              type="button"
              disabled={!(+costForm.cost > 0)}
              onClick={handleSaveCost}
              className="btn-primary mt-2"
            >
              Record Transport Expense
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

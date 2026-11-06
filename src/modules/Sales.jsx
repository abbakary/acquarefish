import React, { useState } from 'react'
import {
  Building2,
  DollarSign,
  Truck,
  Plus,
  Search,
  FileText,
  Printer,
  Share2,
  CheckCircle2,
  AlertTriangle,
  QrCode
} from 'lucide-react'
import { useS, stock, cusBal } from '../store'
import { Modal, Field, Badge, FishPhoto, ReceiptModal, f, tzs, fmtT } from '../ui'

export default function Sales() {
  const { s, a } = useS()
  const [tab, setTab] = useState('orders') // 'orders' or 'customers'
  const [modalMode, setModalMode] = useState(null)
  const [rc, setRc] = useState(null) // receive payment modal
  const [inv, setInv] = useState(null) // invoice receipt view
  const [amt, setAmt] = useState('')
  const [search, setSearch] = useState('')

  const st = stock(s)
  const keys = Object.keys(st)
  const [d, setD] = useState({ cus: '', key: '', kg: '1000', price: '11000', paid: '8000000' })
  const [n, setN] = useState({ name: '', phone: '', location: '', limit: '30000000', contact: '' })

  const cus = d.cus || s.customers[0]?.id
  const key = d.key || keys[0] || '|'
  const [sp, grade] = key.split('|')
  const av = st[key] || 0
  const total = (+d.kg || 0) * (+d.price || 0)

  const currentCus = s.customers.find(c => c.id === cus)
  const lim = currentCus?.limit || Infinity
  const currentOwed = cus ? cusBal(s, cus) : 0
  const over = cus && currentOwed + total - (+d.paid || 0) > lim
  const okS = cus && +d.kg > 0 && +d.kg <= av && +d.price > 0 && !over

  const handleSell = () => {
    a.sell({
      cus,
      sp,
      grade,
      kg: +d.kg,
      price: +d.price,
      paid: Math.min(+d.paid || 0, total)
    })
    setModalMode(null)
    setD({ ...d, kg: '', price: '', paid: '' })
  }

  const handleAddCus = () => {
    a.addCus({ ...n, limit: +n.limit || 0 })
    setModalMode(null)
    setN({ name: '', phone: '', location: '', limit: '30000000', contact: '' })
  }

  const handleReceivePay = () => {
    if (!rc || !(+amt > 0)) return
    a.receive(rc.id, +amt)
    setRc(null)
    setAmt('')
  }

  const totalRev = s.sales.reduce((t, x) => t + x.kg * x.price, 0)
  const totalSoldKg = s.sales.reduce((t, x) => t + x.kg, 0)
  const totalReceivables = s.customers.reduce((t, c) => t + cusBal(s, c.id), 0)

  return (
    <div className="page-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 m-0">Industry Sales &amp; Dispatch Invoicing</h2>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Commercial contracts with fish processing plants, credit limits, delivery notes, and FIFO batch allocation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setModalMode('sale')} className="btn-primary">
            <Plus size={16} /> New Industry Sales Order
          </button>
          <button onClick={() => setModalMode('cus')} className="btn-secondary text-xs">
            <Building2 size={14} /> Add Factory Account
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap">
            <DollarSign size={22} />
          </div>
          <div className="kpi-content">
            <small>Gross Industry Revenue</small>
            <b>{tzs(totalRev)}</b>
            <span className="kpi-sub">Total sales invoiced</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap amber">
            <Truck size={22} />
          </div>
          <div className="kpi-content">
            <small>Volume Delivered</small>
            <b>{f(totalSoldKg)} <span className="text-xs font-sans text-slate-400">kg</span></b>
            <span className="kpi-sub">Processing industry supplies</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap green">
            <Building2 size={22} />
          </div>
          <div className="kpi-content">
            <small>Outstanding Receivables</small>
            <b className="text-blue-800">{tzs(totalReceivables)}</b>
            <span className="kpi-sub">Industry credit balances</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap purple">
            <Building2 size={22} />
          </div>
          <div className="kpi-content">
            <small>Factory Accounts</small>
            <b>{s.customers.length} <span className="text-xs font-sans text-slate-400">clients</span></b>
            <span className="kpi-sub">Mwanza, Dar &amp; Export</span>
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setTab('orders')}
          className={`pb-3 px-2 text-xs font-bold border-b-2 transition ${
            tab === 'orders' ? 'border-blue-700 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Sales Invoices &amp; Dispatches ({s.sales.length})
        </button>
        <button
          onClick={() => setTab('customers')}
          className={`pb-3 px-2 text-xs font-bold border-b-2 transition ${
            tab === 'customers' ? 'border-blue-700 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Fish Processing Factory Accounts ({s.customers.length})
        </button>
      </div>

      {tab === 'orders' ? (
        /* Sales Orders Table */
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice / Order</th>
                <th>Processing Factory</th>
                <th>Fish &amp; Grade</th>
                <th>Dispatched Quantity</th>
                <th>Total Invoiced</th>
                <th>Paid Amount</th>
                <th>Balance Due</th>
                <th>Dispatch Logistics</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...s.sales].reverse().map(x => {
                const cusObj = s.customers.find(c => c.id === x.cus)
                const saleTotal = x.kg * x.price
                const balDue = saleTotal - x.paid
                return (
                  <tr key={x.id}>
                    <td>
                      <b className="font-mono text-blue-700">{x.no}</b>
                      <small className="block font-mono text-slate-400">{x.date}</small>
                    </td>
                    <td>
                      <b className="text-slate-900 block">{cusObj?.name || x.cus}</b>
                      <small className="text-slate-400">{cusObj?.location || 'Mwanza'}</small>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <FishPhoto sp={x.sp} size={30} />
                        <div>
                          <span className="font-medium text-slate-900 block">{x.sp}</span>
                          <small className="text-slate-500">Grade {x.grade}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <b className="font-mono text-slate-900">{f(x.kg)} kg</b>
                      <small className="block text-slate-400 font-mono">@ {tzs(x.price)}/kg</small>
                    </td>
                    <td>
                      <b className="font-mono text-slate-900">{tzs(saleTotal)}</b>
                    </td>
                    <td>
                      <span className="font-mono text-emerald-700 font-semibold">{tzs(x.paid)}</span>
                    </td>
                    <td>
                      <b className={`font-mono ${balDue > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                        {tzs(balDue)}
                      </b>
                    </td>
                    <td>
                      <Badge variant={x.dis.st === 'Delivered' ? 'green' : 'amber'}>
                        {x.dis.st}
                      </Badge>
                      <small className="block text-slate-400">{x.dis.veh || 'KYC Truck'}</small>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInv(x)}
                          title="Print Sales Invoice"
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                        >
                          <Printer size={15} />
                        </button>
                        {balDue > 0 && (
                          <button
                            onClick={() => {
                              setRc(x)
                              setAmt(String(balDue))
                            }}
                            className="btn-primary text-xs py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700"
                          >
                            Receive
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Customers Table */
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Code &amp; Factory</th>
                <th>Primary Contact</th>
                <th>Physical Plant Location</th>
                <th>Credit Limit</th>
                <th>Current Balance Owed</th>
                <th>Credit Utilization</th>
              </tr>
            </thead>
            <tbody>
              {s.customers.map(c => {
                const owed = cusBal(s, c.id)
                const limit = c.limit || 30000000
                const util = Math.min(100, Math.round((owed / limit) * 100))
                return (
                  <tr key={c.id}>
                    <td>
                      <b className="text-slate-900 block">{c.name}</b>
                      <small className="font-mono text-slate-400">{c.code || 'IND-0' + c.id.slice(1)}</small>
                    </td>
                    <td>
                      <span className="text-slate-800 block">{c.contact || 'Commercial Purchasing Dept'}</span>
                      <small className="text-slate-500 font-mono">{c.phone}</small>
                    </td>
                    <td>
                      <span className="text-slate-700 text-xs">{c.location || 'Lake Victoria Industrial Area'}</span>
                    </td>
                    <td>
                      <b className="font-mono text-slate-900">{tzs(limit)}</b>
                    </td>
                    <td>
                      <b className={`font-mono text-sm ${owed > 0 ? 'text-blue-800' : 'text-slate-400'}`}>
                        {tzs(owed)}
                      </b>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${util > 80 ? 'bg-rose-500' : 'bg-blue-600'}`}
                            style={{ width: `${util}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-slate-500">{util}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* New Sales Order Modal */}
      {modalMode === 'sale' && (
        <Modal
          title="Create Industry Sales Order &amp; Delivery Note"
          subtitle="Direct dispatch to fish-processing plant from available cold stock"
          onClose={() => setModalMode(null)}
          maxWidth="max-w-xl"
        >
          <div className="flex flex-col gap-4">
            <Field label="Customer / Factory">
              <select
                value={cus}
                onChange={e => setD({ ...d, cus: e.target.value })}
                className="input-field"
              >
                {s.customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Credit Limit: {tzs(c.limit)})
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Fish Species &amp; Grade Available In Cold Room">
              <select
                value={key}
                onChange={e => setD({ ...d, key: e.target.value })}
                className="input-field font-semibold"
              >
                {keys.map(k => (
                  <option key={k} value={k}>
                    {k.replace('|', ' · Grade ')} — {f(st[k])} kg available in cold storage
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Quantity to Sell (kg)">
                <input
                  type="number"
                  value={d.kg}
                  onChange={e => setD({ ...d, kg: e.target.value })}
                  max={av}
                  className="input-field font-mono font-bold"
                />
              </Field>
              <Field label="Agreed Price per kg (TZS)">
                <input
                  type="number"
                  value={d.price}
                  onChange={e => setD({ ...d, price: e.target.value })}
                  className="input-field font-mono font-bold"
                />
              </Field>
            </div>

            {/* Total Invoiced */}
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-blue-800 uppercase block font-semibold">Total Invoiced Amount</span>
                <span className="text-xl font-mono font-bold text-blue-950">{tzs(total)}</span>
              </div>
              <span className="text-xs text-blue-700">Available: {f(av)} kg</span>
            </div>

            {over && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle size={16} /> Credit limit exceeded for this factory account. Increase deposit.
              </div>
            )}

            <Field label="Initial Deposit / Payment Received (TZS)">
              <input
                type="number"
                value={d.paid}
                onChange={e => setD({ ...d, paid: e.target.value })}
                className="input-field font-mono font-bold"
              />
            </Field>

            <div className="flex justify-between items-center pt-2">
              <button type="button" onClick={() => setModalMode(null)} className="btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                disabled={!okS}
                onClick={handleSell}
                className="btn-primary bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 size={16} /> Authorize Order &amp; Dispatch
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Customer Modal */}
      {modalMode === 'cus' && (
        <Modal
          title="Add New Fish Processing Industry Client"
          subtitle="Establish commercial credit terms and plant delivery details"
          onClose={() => setModalMode(null)}
        >
          <div className="flex flex-col gap-4">
            <Field label="Processing Plant / Company Name">
              <input
                type="text"
                placeholder="e.g. Victoria Perch Processors Ltd"
                value={n.name}
                onChange={e => setN({ ...n, name: e.target.value })}
                className="input-field"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Plant Contact Person">
                <input
                  type="text"
                  placeholder="e.g. Patrick Temba"
                  value={n.contact}
                  onChange={e => setN({ ...n, contact: e.target.value })}
                  className="input-field"
                />
              </Field>
              <Field label="Phone Number">
                <input
                  type="tel"
                  placeholder="028 250 110"
                  value={n.phone}
                  onChange={e => setN({ ...n, phone: e.target.value })}
                  className="input-field font-mono"
                />
              </Field>
            </div>

            <Field label="Plant Location / Delivery Gate">
              <input
                type="text"
                placeholder="Nyakato Industrial Area, Plot 42, Mwanza"
                value={n.location}
                onChange={e => setN({ ...n, location: e.target.value })}
                className="input-field"
              />
            </Field>

            <Field label="Approved Credit Limit (TZS)">
              <input
                type="number"
                value={n.limit}
                onChange={e => setN({ ...n, limit: e.target.value })}
                className="input-field font-mono font-bold"
              />
            </Field>

            <button
              type="button"
              disabled={!n.name}
              onClick={handleAddCus}
              className="btn-primary mt-2"
            >
              Save Factory Client
            </button>
          </div>
        </Modal>
      )}

      {/* Receive Payment Modal */}
      {rc && (
        <Modal
          title={`Receive Payment: ${rc.no}`}
          subtitle={`Client: ${s.customers.find(c => c.id === rc.cus)?.name}`}
          onClose={() => setRc(null)}
        >
          <div className="flex flex-col gap-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between text-xs">
              <span className="text-slate-500">Invoice Total:</span>
              <b className="font-mono text-slate-900">{tzs(rc.kg * rc.price)}</b>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex justify-between text-xs">
              <span className="text-blue-800">Remaining Balance Due:</span>
              <b className="font-mono text-blue-950 font-bold">{tzs(rc.kg * rc.price - rc.paid)}</b>
            </div>
            <Field label="Payment Received (TZS)">
              <input
                type="number"
                value={amt}
                onChange={e => setAmt(e.target.value)}
                className="input-field font-mono text-lg font-bold"
              />
            </Field>
            <button
              type="button"
              disabled={!(+amt > 0 && +amt <= (rc.kg * rc.price - rc.paid))}
              onClick={handleReceivePay}
              className="btn-primary bg-emerald-600 hover:bg-emerald-700"
            >
              Post Payment to Account
            </button>
          </div>
        </Modal>
      )}

      {/* Invoice Modal */}
      {inv && (
        <ReceiptModal
          title={`Commercial Sales Invoice: ${inv.no}`}
          lines={[
            ['Customer', s.customers.find(c => c.id === inv.cus)?.name || inv.cus],
            ['Delivery Destination', s.customers.find(c => c.id === inv.cus)?.location || 'Factory Gate'],
            ['Fish Species & Grade', `${inv.sp} (Grade ${inv.grade})`],
            ['Net Weight Delivered', `${f(inv.kg)} kg`],
            ['Contract Price', `@ ${tzs(inv.price)}/kg`],
            ['Gross Total Invoiced', tzs(inv.kg * inv.price)],
            ['Initial Payment Received', tzs(inv.paid)],
            ['Outstanding Receivable', tzs(inv.kg * inv.price - inv.paid)],
            ['Allocated Batches (FIFO)', inv.alloc.map(l => s.batches.find(b => b.id === l.b)?.no).join(', ')]
          ]}
          onClose={() => setInv(null)}
        />
      )}
    </div>
  )
}

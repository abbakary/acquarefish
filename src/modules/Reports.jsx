import React, { useState } from 'react'
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  FileSpreadsheet,
  Search,
  ArrowRight
} from 'lucide-react'
import { useS, nowL, refLabel } from '../store'
import { Field, FishPhoto, f, tzs, fmtT, atOf } from '../ui'

export default function Reports() {
  const { s } = useS()
  const [tab, setTab] = useState('Purchases') // 'Purchases', 'Stock', 'Sales', 'Transport'
  const [fr, setFr] = useState('')
  const [to, setTo] = useState('')
  const [sup, setSup] = useState('')
  const [sp, setSp] = useState('')
  const [wh, setWh] = useState('')

  const setPreset = k => {
    if (k === 'All') {
      setFr('')
      setTo('')
      return
    }
    const x = new Date()
    if (k === 'Today') {
      x.setHours(0, 0, 0, 0)
    } else if (k === '7 days') {
      x.setDate(x.getDate() - 7)
    } else {
      x.setDate(1)
      x.setHours(0, 0, 0, 0)
    }
    x.setMinutes(x.getMinutes() - x.getTimezoneOffset())
    setFr(x.toISOString().slice(0, 16))
    setTo('')
  }

  const inR = t => (!fr || t >= fr) && (!to || t <= to)
  const nm = id => s.suppliers.find(x => x.id === id)?.name || '-'

  const batches = s.batches
    .filter(b => inR(atOf(b)) && (!sup || b.sup === sup) && (!sp || b.sp === sp) && (tab !== 'Stock' || !wh || (b.wh || s.wh[0]) === wh))
    .sort((x, y) => atOf(y).localeCompare(atOf(x)))

  let headers = []
  let rows = []
  let footers = []

  if (tab === 'Purchases') {
    headers = ['Date & Time', 'Purchase #', 'Supplier / BMU', 'Species & Grade', 'Weight (kg)', 'Price (TZS)', 'Total Amount (TZS)', 'Status']
    rows = batches.map(b => [
      fmtT(atOf(b)),
      b.pur,
      nm(b.sup),
      `${b.sp} (${b.grade})`,
      f(b.kg),
      f(b.price),
      f(b.kg * b.price),
      b.st
    ])
    const totalKg = batches.reduce((a, b) => a + b.kg, 0)
    const totalAmt = batches.reduce((a, b) => a + b.kg * b.price, 0)
    footers = ['Total', '', '', `${batches.length} purchases`, f(totalKg), '', f(totalAmt), '']
  } else if (tab === 'Stock') {
    headers = ['Batch #', 'Species', 'Grade', 'Cold Room', 'Received (kg)', 'Rejected (kg)', 'Remaining (kg)', 'Valuation (TZS)']
    rows = batches.map(b => [
      b.no,
      b.sp,
      `Grade ${b.grade}`,
      b.wh || s.wh[0],
      f(b.kg),
      f(b.rej || 0),
      f(b.rem),
      f(b.rem * b.price)
    ])
    const totalRem = batches.reduce((a, b) => a + b.rem, 0)
    const totalVal = batches.reduce((a, b) => a + b.rem * b.price, 0)
    footers = ['Total', '', '', `${batches.length} lots`, '', '', f(totalRem), f(totalVal)]
  } else if (tab === 'Sales') {
    const sales = s.sales
      .filter(x => inR(x.at || x.date + 'T00:00') && (!sp || x.sp === sp))
      .sort((a, b) => (b.at || b.date).localeCompare(a.at || a.date))

    headers = ['Invoice Date', 'Invoice #', 'Customer Industry', 'Fish & Grade', 'Weight Sold (kg)', 'Price/kg (TZS)', 'Invoiced (TZS)', 'Paid', 'Balance']
    rows = sales.map(x => {
      const cusName = s.customers.find(c => c.id === x.cus)?.name || x.cus
      return [
        fmtT(x.at || x.date + 'T00:00'),
        x.no,
        cusName,
        `${x.sp} (${x.grade})`,
        f(x.kg),
        f(x.price),
        f(x.kg * x.price),
        f(x.paid),
        f(x.kg * x.price - x.paid)
      ]
    })
    const totalSold = sales.reduce((a, x) => a + x.kg, 0)
    const totalInvoiced = sales.reduce((a, x) => a + x.kg * x.price, 0)
    const totalPaid = sales.reduce((a, x) => a + x.paid, 0)
    footers = ['Total', '', '', '', f(totalSold), '', f(totalInvoiced), f(totalPaid), f(totalInvoiced - totalPaid)]
  } else if (tab === 'Transport') {
    // Transport
    const trips = (s.trips || []).filter(x => inR(atOf(x))).sort((p, q) => atOf(q).localeCompare(atOf(p)))
    headers = ['Date & Time', 'Trip Type', 'Mode', 'From &rarr; To', 'Reference', 'Vehicle Reg', 'Cost (TZS)']
    rows = trips.map(x => [
      fmtT(atOf(x)),
      x.type,
      x.mode,
      `${x.from} → ${x.to}`,
      refLabel(s, x),
      x.veh || '-',
      f(x.cost)
    ])
    const totalCost = trips.reduce((a, t) => a + t.cost, 0)
    footers = ['Total', '', '', '', '', `${trips.length} trips`, f(totalCost)]
  } else if (tab === 'Fisherman Ledger') {
    const entries = (s.fishermanLedger || [])
      .filter(e => (!sup || e.supId === sup) && (!fr || (e.date || '') >= fr.slice(0, 10)) && (!to || (e.date || '') <= to.slice(0, 10)))
      .sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || '').localeCompare(a.createdAt || ''))

    headers = ['Date', 'Fisherman / BMU', 'Vessel', 'Season', 'Transaction Type', 'Debit (Owed)', 'Credit (Paid)', 'Source Module', 'Reference #', 'Created By']
    rows = entries.map(e => {
      const supName = nm(e.supId)
      const boat = (s.boats || []).find(b => b.id === e.boatId)?.name || e.boatId || '-'
      return [
        e.date || '-',
        supName,
        boat,
        e.seasonId || s.activeSeasonId || '2026-Q1',
        e.type,
        e.debit ? f(e.debit) : '-',
        e.credit ? f(e.credit) : '-',
        e.source?.toUpperCase() || 'LEDGER',
        e.ref || e.refId || '-',
        e.createdBy || 'Staff'
      ]
    })
    const totalDebits = entries.reduce((a, e) => a + (e.debit || 0), 0)
    const totalCredits = entries.reduce((a, e) => a + (e.credit || 0), 0)
    footers = ['Total', `${entries.length} entries`, '', '', '', f(totalDebits), f(totalCredits), '', '', 'Net: ' + f(totalDebits - totalCredits)]
  } else if (tab === 'Boat Costs') {
    const costs = (s.boatCostLedger || [])
      .filter(c => (!fr || (c.date || '') >= fr.slice(0, 10)) && (!to || (c.date || '') <= to.slice(0, 10)))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))

    headers = ['Date', 'Boat / Vessel', 'Season', 'Expense Category', 'Cost (TZS)', 'Financial Allocation', 'Reference #', 'Notes']
    rows = costs.map(c => {
      const boat = (s.boats || []).find(b => b.id === c.boatId)?.name || c.boatId || '-'
      return [
        c.date || '-',
        boat,
        c.seasonId || s.activeSeasonId || '2026-Q1',
        c.cat,
        f(c.cost),
        c.allocation,
        c.ref || '-',
        c.notes || ''
      ]
    })
    const totalBoatCost = costs.reduce((a, c) => a + (c.cost || 0), 0)
    footers = ['Total', `${costs.length} items`, '', '', f(totalBoatCost), '', '', '']
  }

  const exportCSV = () => {
    const csvContent = [headers, ...rows]
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `fishtrade-${tab.toLowerCase().replace(/\s+/g, '-')}-report.csv`
    link.click()
  }

  return (
    <div className="page-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 m-0">Business Intelligence Reports &amp; Ledger Exports</h2>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Central ledger reconciliations, purchases, inventory, sales invoices, and boat cost allocations.
          </p>
        </div>
        <button onClick={exportCSV} className="btn-primary bg-emerald-600 hover:bg-emerald-700">
          <Download size={16} /> Export Dataset to CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
        {['Purchases', 'Stock', 'Sales', 'Fisherman Ledger', 'Boat Costs', 'Transport'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
              tab === t ? 'border-blue-700 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t} Report
          </button>
        ))}
      </div>

      {/* Filter Strip */}
      <div className="panel p-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
            <Filter size={14} /> Date Presets:
          </span>
          <div className="flex items-center gap-1.5">
            {['Today', '7 days', 'This Month', 'All'].map(k => (
              <button
                key={k}
                onClick={() => setPreset(k === 'This Month' ? 'Month' : k)}
                className="px-3 py-1 rounded text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <Field label="From Date">
            <input
              type="datetime-local"
              value={fr}
              onChange={e => setFr(e.target.value)}
              className="input-field py-1 text-xs"
            />
          </Field>
          <Field label="To Date">
            <input
              type="datetime-local"
              value={to}
              onChange={e => setTo(e.target.value)}
              className="input-field py-1 text-xs"
            />
          </Field>
          {tab !== 'Transport' && (
            <Field label="Filter by Species">
              <select
                value={sp}
                onChange={e => setSp(e.target.value)}
                className="input-field py-1 text-xs"
              >
                <option value="">All Fish Species</option>
                {['Nile Perch', 'Tilapia', 'Dagaa (Sardines)', 'Catfish'].map(x => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
          )}
          {tab === 'Purchases' && (
            <Field label="Filter by Supplier">
              <select
                value={sup}
                onChange={e => setSup(e.target.value)}
                className="input-field py-1 text-xs"
              >
                <option value="">All Suppliers</option>
                {s.suppliers.map(x => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>
      </div>

      {/* Reports Data Table */}
      <div className="panel p-0 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-700 font-mono">
            {rows.length} RECORD(S) FOUND
          </span>
          <button onClick={exportCSV} className="text-xs text-blue-700 hover:underline font-semibold flex items-center gap-1">
            <FileSpreadsheet size={14} /> Download spreadsheet
          </button>
        </div>
        <div className="data-table-wrap border-0 rounded-none">
          <table className="data-table">
            <thead>
              <tr>
                {headers.map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className={cIdx >= 4 && cIdx <= 6 ? 'font-mono' : ''}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            {footers.length > 0 && (
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                  {footers.map((foot, fIdx) => (
                    <td key={fIdx} className="font-mono text-slate-900 py-3">
                      {foot}
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}

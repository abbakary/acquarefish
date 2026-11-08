import React, { useState } from 'react'
import {
  ArrowDownRight,
  Plus,
  Search,
  CheckCircle2,
  FileText,
  Printer,
  Download,
  Share2,
  BadgeCheck,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  User,
  Ship,
  Fuel as FuelIcon,
  Wrench,
  Anchor,
  UtensilsCrossed,
  Clock,
  AlertTriangle,
  Lock,
  ChevronRight,
  Filter,
  Check
} from 'lucide-react'
import { useS, supAccountStatement } from '../store'
import { Modal, Field, Badge, f, tzs, fmtT } from '../ui'

export default function Settlement() {
  const { s, a } = useS()
  const [tab, setTab] = useState('history') // 'history' | 'create' | 'disputes'
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [statementRecord, setStatementRecord] = useState(null)
  const [search, setSearch] = useState('')

  const settlements = s.settlements || []
  const suppliers = s.suppliers || []
  const boats = s.boats || []
  const seasons = s.seasons || []
  const activeSeason = seasons.find(sn => sn.id === s.activeSeasonId) || seasons[0] || { id: 'seas_2026_q1', code: '2026-Q1', name: 'Lake Victoria High Season 2026-Q1', status: 'Open' }

  // Totals & KPIs
  const totalSettlementsCount = settlements.length
  const totalDeductionsRecovered = settlements.reduce((sum, st) => sum + (st.totalDeductions || (st.fuelDeducted || 0) + (st.maintDeducted || 0)), 0)
  const totalNetDisbursed = settlements.reduce((sum, st) => sum + (st.netPayable || 0), 0)
  const totalAgreedTurnover = settlements.reduce((sum, st) => sum + (st.agreedEarnings || st.fishTotal || 0), 0)

  // Settlement Form State (Retrieves live approved transactions from all modules!)
  const [settleForm, setSettleForm] = useState(() => {
    const defaultSup = suppliers[0]?.id || ''
    const stmt = supAccountStatement(s, defaultSup)
    const boat = boats.find(b => b.ownerId === defaultSup)
    return {
      supId: defaultSup,
      boatId: boat?.id || '',
      seasonId: s.activeSeasonId || 'seas_2026_q1',
      settlementType: 'Full Season Settlement',
      agreedEarnings: String(stmt.totalCatchValue || 12000000),
      previousPaid: String(stmt.totalCatchPaid || 8000000),
      fuelDeducted: String(stmt.fuelDebt || 0),
      foodDeducted: String(stmt.foodDebt || 0),
      maintDeducted: String(stmt.maintDebt || 0),
      gearDeducted: String(stmt.gearDebt || 0),
      advancesDeducted: String(stmt.advancesDebt || 0),
      otherDeducted: '0',
      method: 'M-Pesa (Mobile Money)',
      disputeNotes: '',
      notes: 'End of fishing season consolidated payout'
    }
  })

  // Whenever selected fisherman changes, pull their live balances from the Central Ledger!
  const handleFishermanSelect = supId => {
    const stmt = supAccountStatement(s, supId)
    const boat = boats.find(b => b.ownerId === supId)
    setSettleForm(prev => ({
      ...prev,
      supId,
      boatId: boat?.id || prev.boatId,
      agreedEarnings: String(stmt.totalCatchValue || 6000000),
      previousPaid: String(stmt.totalCatchPaid || 4000000),
      fuelDeducted: String(stmt.fuelDebt || 0),
      foodDeducted: String(stmt.foodDebt || 0),
      maintDeducted: String(stmt.maintDebt || 0),
      gearDeducted: String(stmt.gearDebt || 0),
      advancesDeducted: String(stmt.advancesDebt || 0),
      otherDeducted: '0'
    }))
  }

  // Calculated totals in active form
  const formTotalDeductions =
    (+settleForm.fuelDeducted || 0) +
    (+settleForm.foodDeducted || 0) +
    (+settleForm.maintDeducted || 0) +
    (+settleForm.gearDeducted || 0) +
    (+settleForm.advancesDeducted || 0) +
    (+settleForm.otherDeducted || 0)

  const formNetPayable = Math.max(
    0,
    (+settleForm.agreedEarnings || 0) - (+settleForm.previousPaid || 0) - formTotalDeductions
  )

  const submitSettlement = () => {
    a.createSeasonSettlement({
      supId: settleForm.supId,
      boatId: settleForm.boatId,
      seasonId: settleForm.seasonId,
      settlementType: settleForm.settlementType,
      agreedEarnings: +settleForm.agreedEarnings,
      previousPaid: +settleForm.previousPaid,
      fuelDeducted: +settleForm.fuelDeducted,
      foodDeducted: +settleForm.foodDeducted,
      maintDeducted: +settleForm.maintDeducted,
      gearDeducted: +settleForm.gearDeducted,
      advancesDeducted: +settleForm.advancesDeducted,
      otherDeducted: +settleForm.otherDeducted,
      method: settleForm.method,
      notes: settleForm.notes
    })
    setCreateModalOpen(false)
  }

  return (
    <div className="page-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 m-0">Season Settlement &amp; Payout Consolidation</h2>
            <Badge variant="blue">Master Integration</Badge>
          </div>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Connects fish procurement earnings with fuel, food, maintenance, gear, and advance credit deductions into official statements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              handleFishermanSelect(suppliers[0]?.id || '')
              setCreateModalOpen(true)
            }}
            className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-500 font-bold"
          >
            <Plus size={14} /> + New Season Settlement
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Finalized Settlements</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black font-mono text-slate-900">{totalSettlementsCount}</span>
                <span className="text-xs text-slate-500">Statements</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800">
              <BadgeCheck size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Audit status:</span>
            <span className="font-bold text-emerald-700">Digital Sign-off Locked</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-emerald-200 bg-emerald-50/20 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Credit Recoveries Deducted</span>
              <span className="text-2xl font-black font-mono text-emerald-900 mt-1 block">{tzs(totalDeductionsRecovered)}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-900">
            <span>Sources offset:</span>
            <span className="font-semibold">Fuel, Food, Maint, Gear, Advances</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Net Disbursed to Fishers</span>
              <span className="text-2xl font-black font-mono text-blue-900 mt-1 block">{tzs(totalNetDisbursed)}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-800">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Channels:</span>
            <span className="font-semibold text-slate-800">M-Pesa, Bank RTGS, Cash</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Season Turnover</span>
              <span className="text-2xl font-black font-mono text-slate-900 mt-1 block">{tzs(totalAgreedTurnover)}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
              <Ship size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Season:</span>
            <span className="font-bold text-blue-900">{activeSeason?.code || '2026-Q1'}</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-xs font-bold">
        <button
          onClick={() => setTab('history')}
          className={`pb-3 transition flex items-center gap-2 border-b-2 ${
            tab === 'history' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText size={15} /> Finalized Settlement Statements ({settlements.length})
        </button>
        <button
          onClick={() => {
            handleFishermanSelect(suppliers[0]?.id || '')
            setCreateModalOpen(true)
          }}
          className="pb-3 text-emerald-700 hover:text-emerald-900 transition flex items-center gap-1.5"
        >
          <Plus size={15} /> + New Settlement Calculator
        </button>
      </div>

      {/* TAB 1: FINALIZED SETTLEMENT STATEMENTS */}
      {tab === 'history' && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search settlement statements by SET #, fisherman, or vessel..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-10 text-xs"
              />
            </div>
          </div>

          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Settlement #</th>
                  <th>Date</th>
                  <th>Fisherman / BMU</th>
                  <th>Vessel</th>
                  <th>Season</th>
                  <th>Agreed Earnings</th>
                  <th>Total Deductions Offset</th>
                  <th>Net Payable Disbursed</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map(st => {
                  const sup = suppliers.find(s => s.id === st.supId)
                  const boat = boats.find(b => b.id === st.boatId || b.ownerId === st.supId)
                  const totalDed = st.totalDeductions || (st.fuelDeducted || 0) + (st.maintDeducted || 0)
                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition">
                      <td className="font-mono font-bold text-blue-900">{st.no}</td>
                      <td className="whitespace-nowrap font-mono text-xs text-slate-700 font-medium">
                        {st.date}
                      </td>
                      <td>
                        <b className="text-slate-900 block">{sup?.name || st.supId}</b>
                        <span className="text-[11px] text-slate-500 font-mono">{sup?.phone || '-'}</span>
                      </td>
                      <td>
                        <span className="font-bold text-slate-800 block">{boat?.name || 'MV Furaha'}</span>
                        <span className="text-[11px] font-mono text-slate-400">{boat?.regNo || 'TZN-304'}</span>
                      </td>
                      <td>
                        <Badge variant="blue">{st.seasonId || '2026-Q1'}</Badge>
                      </td>
                      <td className="font-mono font-bold text-slate-900">{tzs(st.agreedEarnings || st.fishTotal || 0)}</td>
                      <td className="font-mono font-bold text-emerald-800">-{tzs(totalDed)}</td>
                      <td className="font-mono font-bold text-blue-900 text-sm">{tzs(st.netPayable)}</td>
                      <td>
                        <span className="text-xs font-semibold text-slate-700">{st.method}</span>
                      </td>
                      <td>
                        <Badge variant="green">{st.status || 'Settled'}</Badge>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => setStatementRecord(st)}
                          className="px-2.5 py-1 rounded bg-blue-50 text-blue-900 hover:bg-blue-100 text-xs font-semibold inline-flex items-center gap-1 transition"
                        >
                          <FileText size={13} /> View Statement
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

      {/* MODAL 1: NEW SEASON SETTLEMENT (LIVE PULL FROM CENTRAL FINANCIAL LEDGER) */}
      {createModalOpen && (
        <Modal title="Consolidated Season Settlement Calculation" close={() => setCreateModalOpen(false)}>
          <div className="flex flex-col gap-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Fisherman / Supplier">
                <select
                  value={settleForm.supId}
                  onChange={e => handleFishermanSelect(e.target.value)}
                  className="input-field font-semibold"
                >
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name} ({sup.no})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Fishing Season">
                <select
                  value={settleForm.seasonId}
                  onChange={e => setSettleForm({ ...settleForm, seasonId: e.target.value })}
                  className="input-field"
                >
                  {seasons.map(sn => (
                    <option key={sn.id} value={sn.id}>
                      {sn.name} ({sn.code})
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Earnings & Prior Payouts */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <Field label="Agreed Fisherman Earnings / Catch Value (TZS)">
                <input
                  type="number"
                  value={settleForm.agreedEarnings}
                  onChange={e => setSettleForm({ ...settleForm, agreedEarnings: e.target.value })}
                  className="input-field font-mono font-bold text-base text-blue-900"
                />
              </Field>

              <Field label="Interim Payouts Already Disbursed (TZS)">
                <input
                  type="number"
                  value={settleForm.previousPaid}
                  onChange={e => setSettleForm({ ...settleForm, previousPaid: e.target.value })}
                  className="input-field font-mono font-bold text-slate-700"
                />
              </Field>
            </div>

            {/* Multi-Module Deductions Breakdown (Populated from Central Financial Ledger) */}
            <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-amber-950 uppercase tracking-wider text-[11px]">
                  Approved Deductions from Operational Modules
                </span>
                <span className="font-mono font-bold text-amber-900">Total: {tzs(formTotalDeductions)}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                    <FuelIcon size={11} className="text-amber-600" /> Fuel Recoverable
                  </label>
                  <input
                    type="number"
                    value={settleForm.fuelDeducted}
                    onChange={e => setSettleForm({ ...settleForm, fuelDeducted: e.target.value })}
                    className="input-field font-mono font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                    <UtensilsCrossed size={11} className="text-orange-600" /> Food / Catering
                  </label>
                  <input
                    type="number"
                    value={settleForm.foodDeducted}
                    onChange={e => setSettleForm({ ...settleForm, foodDeducted: e.target.value })}
                    className="input-field font-mono font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                    <Wrench size={11} className="text-blue-600" /> Fleet Maintenance
                  </label>
                  <input
                    type="number"
                    value={settleForm.maintDeducted}
                    onChange={e => setSettleForm({ ...settleForm, maintDeducted: e.target.value })}
                    className="input-field font-mono font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                    <Anchor size={11} className="text-purple-600" /> Gear &amp; Equipment
                  </label>
                  <input
                    type="number"
                    value={settleForm.gearDeducted}
                    onChange={e => setSettleForm({ ...settleForm, gearDeducted: e.target.value })}
                    className="input-field font-mono font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                    <DollarSign size={11} className="text-emerald-600" /> Advances / Matumizi
                  </label>
                  <input
                    type="number"
                    value={settleForm.advancesDeducted}
                    onChange={e => setSettleForm({ ...settleForm, advancesDeducted: e.target.value })}
                    className="input-field font-mono font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold">Other Costs</label>
                  <input
                    type="number"
                    value={settleForm.otherDeducted}
                    onChange={e => setSettleForm({ ...settleForm, otherDeducted: e.target.value })}
                    className="input-field font-mono font-bold text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Net Payout Banner */}
            <div className="p-4 bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-xl flex items-center justify-between">
              <div>
                <span className="text-blue-200 text-xs block">Final Net Payable Entitlement:</span>
                <span className="text-2xl font-black font-mono tracking-tight">{tzs(formNetPayable)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-300 uppercase block font-semibold">Payment Channel</span>
                <span className="font-bold text-sm text-emerald-400">{settleForm.method}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Disbursement Method">
                <select
                  value={settleForm.method}
                  onChange={e => setSettleForm({ ...settleForm, method: e.target.value })}
                  className="input-field font-semibold"
                >
                  <option>M-Pesa (Mobile Money)</option>
                  <option>Bank RTGS</option>
                  <option>Cash Voucher</option>
                  <option>Airtel Money</option>
                </select>
              </Field>

              <Field label="Settlement Type">
                <select
                  value={settleForm.settlementType}
                  onChange={e => setSettleForm({ ...settleForm, settlementType: e.target.value })}
                  className="input-field"
                >
                  <option>Full Season Settlement</option>
                  <option>Partial Settlement (Balance Carried Forward)</option>
                </select>
              </Field>
            </div>

            <Field label="Settlement Audit Notes / Resolution">
              <input
                type="text"
                value={settleForm.notes}
                onChange={e => setSettleForm({ ...settleForm, notes: e.target.value })}
                className="input-field"
              />
            </Field>

            <div className="flex justify-between items-center pt-2">
              <button type="button" onClick={() => setCreateModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={submitSettlement} className="btn-primary bg-emerald-600 hover:bg-emerald-500 font-bold">
                <CheckCircle2 size={16} /> Finalize Settlement &amp; Clear Ledger
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: OFFICIAL PRINTABLE / DOWNLOADABLE SETTLEMENT STATEMENT */}
      {statementRecord && (
        <Modal title={`Settlement Statement: ${statementRecord.no}`} close={() => setStatementRecord(null)}>
          <div className="flex flex-col gap-4 text-xs">
            {/* Printable Statement Container */}
            <div className="p-5 bg-white border border-slate-300 rounded-xl space-y-4 shadow-sm text-slate-900 font-sans">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-blue-900 text-white font-bold flex items-center justify-center text-xs">FT</span>
                    <b className="text-base text-slate-900 uppercase tracking-tight">Victoria Perch &amp; Seafood Traders Ltd</b>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Mwanza Main Port · Lake Victoria Commercial Fisheries</span>
                  <span className="text-[11px] font-mono text-slate-400">TIN: 104-992-120 · VRN: 40019283</span>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono text-xs font-bold uppercase block">
                    FINAL SETTLEMENT
                  </span>
                  <b className="font-mono text-sm text-slate-900 block mt-1">{statementRecord.no}</b>
                  <span className="text-[11px] text-slate-400">{statementRecord.date}</span>
                </div>
              </div>

              {/* Beneficiary Details */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Account Holder / Fisherman</span>
                  <b className="text-sm text-slate-900 block">{suppliers.find(s => s.id === statementRecord.supId)?.name || statementRecord.supId}</b>
                  <span className="text-slate-600 font-mono">{suppliers.find(s => s.id === statementRecord.supId)?.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Vessel &amp; Season</span>
                  <b className="text-sm text-slate-900 block">MV Furaha (TZN-304)</b>
                  <span className="text-slate-600 font-mono">Season: {statementRecord.seasonId || '2026-Q1'}</span>
                </div>
              </div>

              {/* Itemized Financial Breakdown Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="p-2 font-bold text-slate-700">Financial Description</th>
                      <th className="p-2 text-right font-bold text-slate-700">Debit (TZS)</th>
                      <th className="p-2 text-right font-bold text-slate-700">Credit / Entitlement (TZS)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2 font-medium">Agreed Fisherman Catch Earnings (Season Entitlement)</td>
                      <td className="p-2 text-right text-slate-400">—</td>
                      <td className="p-2 text-right font-mono font-bold text-slate-900">
                        {tzs(statementRecord.agreedEarnings || statementRecord.fishTotal || 0)}
                      </td>
                    </tr>
                    {statementRecord.previousPaid > 0 && (
                      <tr className="bg-slate-50/50">
                        <td className="p-2 text-slate-600 pl-4">Less: Interim Batch Disbursements Already Paid</td>
                        <td className="p-2 text-right font-mono text-slate-700">{tzs(statementRecord.previousPaid)}</td>
                        <td className="p-2 text-right text-slate-400">—</td>
                      </tr>
                    )}
                    {statementRecord.fuelDeducted > 0 && (
                      <tr>
                        <td className="p-2 text-slate-700 pl-4">Less: Fishing Fuel Credit Recoverable (Dispensed at Dock)</td>
                        <td className="p-2 text-right font-mono text-red-600">{tzs(statementRecord.fuelDeducted)}</td>
                        <td className="p-2 text-right text-slate-400">—</td>
                      </tr>
                    )}
                    {statementRecord.foodDeducted > 0 && (
                      <tr>
                        <td className="p-2 text-slate-700 pl-4">Less: Food &amp; Catering Expenses (Mama Mpishi Provisions)</td>
                        <td className="p-2 text-right font-mono text-red-600">{tzs(statementRecord.foodDeducted)}</td>
                        <td className="p-2 text-right text-slate-400">—</td>
                      </tr>
                    )}
                    {statementRecord.maintDeducted > 0 && (
                      <tr>
                        <td className="p-2 text-slate-700 pl-4">Less: Marine Fleet Maintenance &amp; Parts (Recoverable)</td>
                        <td className="p-2 text-right font-mono text-red-600">{tzs(statementRecord.maintDeducted)}</td>
                        <td className="p-2 text-right text-slate-400">—</td>
                      </tr>
                    )}
                    {statementRecord.gearDeducted > 0 && (
                      <tr>
                        <td className="p-2 text-slate-700 pl-4">Less: Fishing Gear &amp; Equipment Issued on Credit</td>
                        <td className="p-2 text-right font-mono text-red-600">{tzs(statementRecord.gearDeducted)}</td>
                        <td className="p-2 text-right text-slate-400">—</td>
                      </tr>
                    )}
                    {statementRecord.advancesDeducted > 0 && (
                      <tr>
                        <td className="p-2 text-slate-700 pl-4">Less: Cash Advances &amp; Daily Matumizi Outstanding</td>
                        <td className="p-2 text-right font-mono text-red-600">{tzs(statementRecord.advancesDeducted)}</td>
                        <td className="p-2 text-right text-slate-400">—</td>
                      </tr>
                    )}
                    {statementRecord.otherDeducted > 0 && (
                      <tr>
                        <td className="p-2 text-slate-700 pl-4">Less: Other Approved Operational Costs</td>
                        <td className="p-2 text-right font-mono text-red-600">{tzs(statementRecord.otherDeducted)}</td>
                        <td className="p-2 text-right text-slate-400">—</td>
                      </tr>
                    )}
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                      <td className="p-2.5 text-slate-900 font-black">Net Season Payout Disbursed</td>
                      <td className="p-2.5 text-right font-mono text-slate-500">Total Deductions: {tzs(statementRecord.totalDeductions || (statementRecord.fuelDeducted || 0) + (statementRecord.maintDeducted || 0))}</td>
                      <td className="p-2.5 text-right font-mono font-black text-blue-900 text-sm">
                        {tzs(statementRecord.netPayable)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signatures block */}
              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-6">Fisherman / Captain Acknowledgment</span>
                  <div className="border-b border-slate-300 w-3/4 mb-1" />
                  <span className="font-semibold text-slate-800 block">Mzee Juma (Captain)</span>
                  <span className="text-[10px] text-slate-400">Signature / Fingerprint</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-6">Director / Operations Approval</span>
                  <div className="border-b border-slate-300 w-3/4 mb-1" />
                  <span className="font-semibold text-slate-800 block">{statementRecord.approvedBy || 'John Mwangi (Director)'}</span>
                  <span className="text-[10px] text-slate-400">Authorized Signatory</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer size={14} /> Print Statement
              </button>
              <button type="button" onClick={() => setStatementRecord(null)} className="btn-primary">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

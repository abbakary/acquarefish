import React, { useState } from 'react'
import {
  UtensilsCrossed,
  Plus,
  Search,
  DollarSign,
  User,
  Users,
  Ship,
  CheckCircle2,
  Calendar,
  RotateCcw,
  Receipt,
  FileText,
  BadgeCheck,
  TrendingUp,
  ArrowRight,
  Filter,
  Check,
  Percent
} from 'lucide-react'
import { useS, supFoodDebt } from '../store'
import { Modal, Field, Badge, f, tzs, fmtT } from '../ui'

export default function Catering() {
  const { s, a } = useS()
  const [tab, setTab] = useState('advances') // 'advances' | 'meals' | 'cooks'
  const [advanceModalOpen, setAdvanceModalOpen] = useState(false)
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [cookModalOpen, setCookModalOpen] = useState(false)
  const [reconcileModalOpen, setReconcileModalOpen] = useState(false)
  const [selectedAdvance, setSelectedAdvance] = useState(null)
  const [search, setSearch] = useState('')

  const cooks = s.cateringCooks || []
  const advances = s.cookAdvances || []
  const expenses = s.cateringExpenses || []
  const suppliers = s.suppliers || []
  const boats = s.boats || []
  const seasons = s.seasons || []
  const activeSeason = seasons.find(sn => sn.id === s.activeSeasonId) || seasons[0] || { id: 'seas_2026_q1', code: '2026-Q1', name: 'Lake Victoria High Season 2026-Q1', status: 'Open' }

  // Totals & KPIs
  const totalAdvancesIssued = advances.reduce((sum, x) => sum + (x.amountIssued || 0), 0)
  const totalActualExpenditure = expenses.reduce((sum, x) => sum + (x.totalSpent || 0), 0)
  const totalMoneyReturned = advances.reduce((sum, x) => sum + (x.moneyReturned || 0), 0)
  const totalRecoverableFoodDebt = suppliers.reduce((sum, sup) => sum + supFoodDebt(s, sup.id), 0)

  // Advance Form State (Money given to Mama Mpishi)
  const [advanceForm, setAdvanceForm] = useState({
    cookId: cooks[0]?.id || '',
    amountIssued: '150000',
    purpose: 'Daily crew ingredients, maize flour, cooking oil, beans & fresh vegetables',
    selectedBoatIds: [boats[0]?.id || 'boat0']
  })

  // Meal & Expense Logging Form State
  const [expForm, setExpForm] = useState({
    cookId: cooks[0]?.id || '',
    advanceId: advances[0]?.id || '',
    mealsCount: '24',
    crewSize: '6',
    mealType: 'Breakfast & Hot Lunch Stew',
    totalSpent: '125000',
    moneyReturned: '25000',
    arrangement: 'Fisherman-recoverable (Catch Deduction)',
    notes: 'Ugali, beans, fresh vegetables and spiced tea for offshore boats',
    allocations: [
      { boatId: boats[0]?.id || 'boat0', supId: boats[0]?.ownerId || 's0', cost: '75000', recoverable: '75000' }
    ]
  })

  // Add Boat Allocation row in expense form
  const handleAddBoatAllocation = () => {
    const unallocatedBoat = boats.find(b => !expForm.allocations.some(al => al.boatId === b.id)) || boats[0]
    setExpForm(prev => ({
      ...prev,
      allocations: [
        ...prev.allocations,
        { boatId: unallocatedBoat?.id || '', supId: unallocatedBoat?.ownerId || 'company', cost: '0', recoverable: '0' }
      ]
    }))
  }

  const handleUpdateAllocation = (idx, field, val) => {
    setExpForm(prev => {
      const nextAllocs = [...prev.allocations]
      nextAllocs[idx][field] = val
      if (field === 'boatId') {
        const b = boats.find(x => x.id === val)
        nextAllocs[idx].supId = b?.ownerId || 'company'
      }
      return { ...prev, allocations: nextAllocs }
    })
  }

  const handleRemoveAllocation = idx => {
    setExpForm(prev => ({
      ...prev,
      allocations: prev.allocations.filter((_, i) => i !== idx)
    }))
  }

  // Cook Register Form State
  const [cookForm, setCookForm] = useState({
    name: 'Mama Halima',
    phone: '0754 119 220',
    site: 'Kirumba Mwaloni Dock',
    assignedBoats: [boats[0]?.id || '']
  })

  const submitCookAdvance = () => {
    if (!(+advanceForm.amountIssued > 0)) return
    a.issueCookAdvance({
      cookId: advanceForm.cookId,
      amountIssued: +advanceForm.amountIssued,
      purpose: advanceForm.purpose,
      allocatedBoats: advanceForm.selectedBoatIds
    })
    setAdvanceModalOpen(false)
  }

  const submitCateringExpense = () => {
    if (!(+expForm.totalSpent > 0)) return
    const formattedAllocs = expForm.allocations.map(al => ({
      boatId: al.boatId,
      supId: al.supId,
      cost: +al.cost || 0,
      recoverable: expForm.arrangement.includes('recoverable') ? +al.recoverable || +al.cost || 0 : 0
    }))

    a.recordCateringExpense({
      cookId: expForm.cookId,
      advanceId: expForm.advanceId,
      mealsCount: +expForm.mealsCount,
      crewSize: +expForm.crewSize,
      mealType: expForm.mealType,
      totalSpent: +expForm.totalSpent,
      moneyReturned: +expForm.moneyReturned || 0,
      boatAllocations: formattedAllocs,
      arrangement: expForm.arrangement,
      notes: expForm.notes
    })
    setExpenseModalOpen(false)
  }

  const submitCreateCook = () => {
    if (!cookForm.name.trim()) return
    a.addCook(cookForm)
    setCookModalOpen(false)
  }

  return (
    <div className="page-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 m-0">Food &amp; Catering Management (Mama Mpishi)</h2>
            <Badge variant="blue">Crew Welfare</Badge>
          </div>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Administer cash advances to cooks (Mama Mpishi), receipt verification, unspent cash returns, and multi-vessel crew food allocations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCookModalOpen(true)} className="btn-secondary text-xs">
            <User size={14} /> + Register Mama Mpishi
          </button>
          <button onClick={() => setAdvanceModalOpen(true)} className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-500 font-bold">
            <DollarSign size={14} /> + Give Cash Advance to Cook
          </button>
          <button onClick={() => setExpenseModalOpen(true)} className="btn-primary text-xs font-bold">
            <UtensilsCrossed size={14} /> + Record Meal Expense &amp; Allocation
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Advances Given</span>
              <span className="text-2xl font-black font-mono text-slate-900 mt-1 block">{tzs(totalAdvancesIssued)}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Active Cooks:</span>
            <span className="font-semibold text-slate-800">{cooks.length} Mama Mpishi</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Actual Food Expenditure</span>
              <span className="text-2xl font-black font-mono text-blue-900 mt-1 block">{tzs(totalActualExpenditure)}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-800">
              <UtensilsCrossed size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Logged Meals:</span>
            <span className="font-bold text-slate-800">{expenses.reduce((s, x) => s + (x.mealsCount || 0), 0)} Meals Served</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-emerald-200 bg-emerald-50/20 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Unused Money Returned</span>
              <span className="text-2xl font-black font-mono text-emerald-900 mt-1 block">{tzs(totalMoneyReturned)}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
              <RotateCcw size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-900">
            <span>Accounting treatment:</span>
            <span className="font-bold">Cash Return (Not Expense)</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-amber-200 bg-amber-50/20 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Recoverable Food Balance</span>
              <span className="text-2xl font-black font-mono text-amber-950 mt-1 block">{tzs(totalRecoverableFoodDebt)}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-amber-100 flex items-center justify-between text-xs text-amber-900">
            <span>Deduction:</span>
            <span className="font-bold">Offsets in Season Settlement</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-xs font-bold">
        <button
          onClick={() => setTab('advances')}
          className={`pb-3 transition flex items-center gap-2 border-b-2 ${
            tab === 'advances' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign size={15} /> Cash Advances to Cooks &amp; Reconciliation ({advances.length})
        </button>
        <button
          onClick={() => setTab('meals')}
          className={`pb-3 transition flex items-center gap-2 border-b-2 ${
            tab === 'meals' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UtensilsCrossed size={15} /> Meals Log &amp; Multi-Boat Allocations ({expenses.length})
        </button>
        <button
          onClick={() => setTab('cooks')}
          className={`pb-3 transition flex items-center gap-2 border-b-2 ${
            tab === 'cooks' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User size={15} /> Mama Mpishi Registry &amp; Assigned Boats ({cooks.length})
        </button>
      </div>

      {/* TAB 1: COOK ADVANCES & RECONCILIATION */}
      {tab === 'advances' && (
        <div className="flex flex-col gap-3">
          <div className="p-4 bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BadgeCheck size={18} className="text-blue-300" />
                <b className="text-sm">Mama Mpishi Advance &amp; Expense Rule</b>
              </div>
              <p className="text-xs text-blue-100 max-w-2xl m-0">
                When Mama Mpishi is given TZS 150,000 for provisions and spends TZS 125,000 with market receipts, the remaining TZS 25,000 returned is credited directly as a <b>Cash Return</b>, and only TZS 125,000 is booked as the operating food cost.
              </p>
            </div>
            <button onClick={() => setAdvanceModalOpen(true)} className="px-4 py-2 bg-white text-blue-950 font-bold text-xs rounded-lg shadow hover:bg-blue-50 transition whitespace-nowrap">
              + Issue Cash to Mama Mpishi
            </button>
          </div>

          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Voucher #</th>
                  <th>Date</th>
                  <th>Cook (Mama Mpishi)</th>
                  <th>Advance Issued</th>
                  <th>Actual Spent</th>
                  <th>Unused Cash Returned</th>
                  <th>Status</th>
                  <th>Allocated Boats</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {advances.map(adv => {
                  const cook = cooks.find(c => c.id === adv.cookId)
                  return (
                    <tr key={adv.id} className="hover:bg-slate-50/80 transition">
                      <td className="font-mono font-bold text-blue-900">{adv.no}</td>
                      <td>{adv.date}</td>
                      <td>
                        <b className="text-slate-900 block">{cook?.name || adv.cookId}</b>
                        <span className="text-[11px] text-slate-500 font-mono">{cook?.phone || '-'}</span>
                      </td>
                      <td className="font-mono font-bold text-slate-900">{tzs(adv.amountIssued)}</td>
                      <td className="font-mono font-bold text-blue-900">{tzs(adv.actualExpenditure || 0)}</td>
                      <td className="font-mono font-bold text-emerald-700">
                        {adv.moneyReturned > 0 ? `+${tzs(adv.moneyReturned)}` : 'TZS 0'}
                      </td>
                      <td>
                        <Badge variant={adv.status === 'Reconciled' ? 'green' : 'amber'}>
                          {adv.status}
                        </Badge>
                      </td>
                      <td className="text-xs">
                        {adv.allocatedBoats.map(bid => boats.find(b => b.id === bid)?.name || bid).join(', ') || 'All Assigned'}
                      </td>
                      <td className="text-right">
                        {adv.status !== 'Reconciled' && (
                          <button
                            onClick={() => {
                              setExpForm(prev => ({
                                ...prev,
                                cookId: adv.cookId,
                                advanceId: adv.id,
                                totalSpent: String(adv.amountIssued),
                                moneyReturned: '0'
                              }))
                              setExpenseModalOpen(true)
                            }}
                            className="px-2.5 py-1 rounded bg-blue-50 text-blue-800 hover:bg-blue-100 text-xs font-semibold inline-flex items-center gap-1 transition"
                          >
                            <Receipt size={12} /> Reconcile Receipts
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MEALS LOG & MULTI-BOAT ALLOCATIONS */}
      {tab === 'meals' && (
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">
              Food costs allocated proportionally across fishing boats and posted to fisherman debt ledgers.
            </span>
            <button onClick={() => setExpenseModalOpen(true)} className="btn-primary text-xs font-bold">
              <Plus size={14} /> + Log Meal Expenditure
            </button>
          </div>

          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Voucher #</th>
                  <th>Date</th>
                  <th>Cook</th>
                  <th>Meal Details</th>
                  <th>Crew Headcount</th>
                  <th>Total Expenditure</th>
                  <th>Boat Allocations Breakdown</th>
                  <th>Arrangement</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(exp => {
                  const cook = cooks.find(c => c.id === exp.cookId)
                  return (
                    <tr key={exp.id}>
                      <td className="font-mono font-bold text-blue-900">{exp.no}</td>
                      <td>{exp.date}</td>
                      <td>
                        <b className="text-slate-900 block">{cook?.name || exp.cookId}</b>
                        <span className="text-[11px] text-slate-400">{exp.advanceRef ? `Adv: ${exp.advanceRef}` : 'Direct'}</span>
                      </td>
                      <td>
                        <b className="text-slate-900 block">{exp.mealType}</b>
                        <span className="text-[11px] text-slate-500">{exp.notes || '-'}</span>
                      </td>
                      <td>
                        <b className="font-mono text-slate-800">{exp.crewSize} Crew</b>
                        <span className="text-[11px] text-slate-400 block">{exp.mealsCount} Meals</span>
                      </td>
                      <td className="font-mono font-bold text-slate-900">{tzs(exp.totalSpent)}</td>
                      <td className="text-xs">
                        <div className="space-y-1">
                          {exp.boatAllocations.map((al, idx) => {
                            const b = boats.find(x => x.id === al.boatId)
                            const sup = suppliers.find(s => s.id === al.supId)
                            return (
                              <div key={idx} className="flex justify-between items-center bg-slate-50 p-1.5 rounded border border-slate-200">
                                <span className="font-medium text-slate-800">{b?.name || al.boatId} ({sup?.name || 'Company'}):</span>
                                <b className="font-mono text-slate-900">{tzs(al.cost)}</b>
                              </div>
                            )
                          })}
                        </div>
                      </td>
                      <td>
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          {exp.arrangement}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: COOKS (MAMA MPISHI) REGISTRY */}
      {tab === 'cooks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cooks.map(cook => {
            const cookAdv = advances.filter(a => a.cookId === cook.id)
            const cookSpend = cookAdv.reduce((s, a) => s + (a.actualExpenditure || 0), 0)
            const assignedBoatObjs = boats.filter(b => (cook.assignedBoats || []).includes(b.id))

            return (
              <div key={cook.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-sm shadow-inner">
                        {cook.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <b className="text-base text-slate-900 block">{cook.name}</b>
                        <span className="text-xs text-slate-500 font-mono">{cook.phone}</span>
                      </div>
                    </div>
                    <Badge variant="green">Active</Badge>
                  </div>

                  <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Landing Location:</span>
                      <b className="text-slate-800">{cook.site}</b>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Provisions Cooked:</span>
                      <b className="font-mono text-blue-900">{tzs(cookSpend)}</b>
                    </div>
                    <div className="border-t border-slate-200 pt-2">
                      <span className="text-slate-500 block mb-1 font-semibold">Assigned Fishing Boats:</span>
                      <div className="flex flex-wrap gap-1">
                        {assignedBoatObjs.map(b => (
                          <span key={b.id} className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-mono text-[11px] font-bold">
                            {b.name} ({b.regNo})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAdvanceForm(prev => ({ ...prev, cookId: cook.id }))
                      setAdvanceModalOpen(true)
                    }}
                    className="flex-1 py-1.5 bg-blue-900 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 transition text-center"
                  >
                    + Issue Advance
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL 1: ISSUE ADVANCE TO MAMA MPISHI */}
      {advanceModalOpen && (
        <Modal title="Issue Provisions Cash Advance to Mama Mpishi" close={() => setAdvanceModalOpen(false)}>
          <div className="flex flex-col gap-4 text-xs">
            <Field label="Select Cook (Mama Mpishi)">
              <select
                value={advanceForm.cookId}
                onChange={e => setAdvanceForm({ ...advanceForm, cookId: e.target.value })}
                className="input-field"
              >
                {cooks.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.site})
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Cash Advance Amount (TZS)">
              <input
                type="number"
                value={advanceForm.amountIssued}
                onChange={e => setAdvanceForm({ ...advanceForm, amountIssued: e.target.value })}
                className="input-field font-mono font-bold text-base"
              />
            </Field>

            <Field label="Purpose &amp; Provisions Scope">
              <textarea
                rows={2}
                value={advanceForm.purpose}
                onChange={e => setAdvanceForm({ ...advanceForm, purpose: e.target.value })}
                className="input-field"
              />
            </Field>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              Money given to Mama Mpishi remains an open advance until receipts are returned. Any unused cash returned will be booked as a <b>Cash Return</b> into company funds.
            </div>

            <div className="flex justify-between items-center pt-2">
              <button type="button" onClick={() => setAdvanceModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={submitCookAdvance} className="btn-primary">
                Disburse Advance
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: RECORD CATERING EXPENSE & MULTI-BOAT ALLOCATION */}
      {expenseModalOpen && (
        <Modal title="Record Food Expenses &amp; Multi-Boat Allocation" close={() => setExpenseModalOpen(false)}>
          <div className="flex flex-col gap-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cook (Mama Mpishi)">
                <select
                  value={expForm.cookId}
                  onChange={e => setExpForm({ ...expForm, cookId: e.target.value })}
                  className="input-field"
                >
                  {cooks.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Meal Type">
                <input
                  type="text"
                  value={expForm.mealType}
                  onChange={e => setExpForm({ ...expForm, mealType: e.target.value })}
                  className="input-field font-semibold"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Actual Food Expenditure (TZS)">
                <input
                  type="number"
                  value={expForm.totalSpent}
                  onChange={e => setExpForm({ ...expForm, totalSpent: e.target.value })}
                  className="input-field font-mono font-bold"
                />
              </Field>

              <Field label="Unused Cash Returned by Cook (TZS)">
                <input
                  type="number"
                  value={expForm.moneyReturned}
                  onChange={e => setExpForm({ ...expForm, moneyReturned: e.target.value })}
                  className="input-field font-mono text-emerald-700 font-bold"
                />
              </Field>
            </div>

            {/* Multi-Boat Cost Allocation */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">Allocate Cost Across Benefiting Boats</span>
                <button type="button" onClick={handleAddBoatAllocation} className="text-blue-700 font-bold hover:underline">
                  + Add Boat
                </button>
              </div>

              {expForm.allocations.map((alloc, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2 bg-white p-2 rounded border border-slate-200 items-center">
                  <div>
                    <label className="text-[10px] text-slate-400 block uppercase font-bold">Boat</label>
                    <select
                      value={alloc.boatId}
                      onChange={e => handleUpdateAllocation(idx, 'boatId', e.target.value)}
                      className="input-field text-xs"
                    >
                      {boats.map(b => (
                        <option key={b.id} value={b.id}>{b.name} ({b.regNo})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block uppercase font-bold">Allocated Cost (TZS)</label>
                    <input
                      type="number"
                      value={alloc.cost}
                      onChange={e => handleUpdateAllocation(idx, 'cost', e.target.value)}
                      className="input-field font-mono font-bold text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-400 block uppercase font-bold">Recoverable</label>
                      <input
                        type="number"
                        value={alloc.recoverable}
                        onChange={e => handleUpdateAllocation(idx, 'recoverable', e.target.value)}
                        className="input-field font-mono text-xs text-red-600 font-bold"
                      />
                    </div>
                    {expForm.allocations.length > 1 && (
                      <button type="button" onClick={() => handleRemoveAllocation(idx)} className="text-red-500 font-bold pt-4">×</button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Field label="Financial Recovery Treatment">
              <select
                value={expForm.arrangement}
                onChange={e => setExpForm({ ...expForm, arrangement: e.target.value })}
                className="input-field font-semibold"
              >
                <option>Fisherman-recoverable (Catch Deduction)</option>
                <option>Company-funded (Welfare Allowance)</option>
                <option>Shared (50% Company, 50% Fisherman)</option>
              </select>
            </Field>

            <Field label="Notes / Menu Items">
              <input
                type="text"
                value={expForm.notes}
                onChange={e => setExpForm({ ...expForm, notes: e.target.value })}
                className="input-field"
              />
            </Field>

            <div className="flex justify-between items-center pt-2">
              <button type="button" onClick={() => setExpenseModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={submitCateringExpense} className="btn-primary">
                Confirm Expenditure &amp; Post Recoveries
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: REGISTER COOK */}
      {cookModalOpen && (
        <Modal title="Register Cook / Mama Mpishi" close={() => setCookModalOpen(false)}>
          <div className="flex flex-col gap-4 text-xs">
            <Field label="Cook Full Name">
              <input
                type="text"
                value={cookForm.name}
                onChange={e => setCookForm({ ...cookForm, name: e.target.value })}
                className="input-field font-bold"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone Number">
                <input
                  type="text"
                  value={cookForm.phone}
                  onChange={e => setCookForm({ ...cookForm, phone: e.target.value })}
                  className="input-field font-mono"
                />
              </Field>

              <Field label="Dock / Landing Site">
                <input
                  type="text"
                  value={cookForm.site}
                  onChange={e => setCookForm({ ...cookForm, site: e.target.value })}
                  className="input-field"
                />
              </Field>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setCookModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={submitCreateCook} className="btn-primary">
                Save Mama Mpishi
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

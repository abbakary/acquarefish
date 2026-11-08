import React, { useState } from 'react'
import {
  Anchor,
  Plus,
  Search,
  Package,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  DollarSign,
  User,
  Ship,
  Compass,
  FileText,
  TrendingUp,
  Tag,
  ArrowRight,
  Filter,
  Check,
  ExternalLink
} from 'lucide-react'
import { useS, supGearDebt } from '../store'
import { Modal, Field, Badge, f, tzs, fmtT } from '../ui'

export default function Gear() {
  const { s, a } = useS()
  const [tab, setTab] = useState('issues') // 'issues' | 'catalog' | 'returns'
  const [issueModalOpen, setIssueModalOpen] = useState(false)
  const [itemModalOpen, setItemModalOpen] = useState(false)
  const [returnModalOpen, setReturnModalOpen] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')

  const gearItems = s.gearItems || []
  const gearIssues = s.gearIssues || []
  const suppliers = s.suppliers || []
  const boats = s.boats || []
  const seasons = s.seasons || []
  const activeSeason = seasons.find(sn => sn.id === s.activeSeasonId) || seasons[0]

  // KPI Calculations
  const totalCatalogItems = gearItems.length
  const totalStockQty = gearItems.reduce((acc, it) => acc + (it.stock || 0), 0)
  const totalRecoverableGearDebt = suppliers.reduce((sum, sup) => sum + supGearDebt(s, sup.id), 0)
  const activeGearIssues = gearIssues.filter(g => g.status === 'Issued')
  const totalGearSpend = gearIssues.reduce((sum, g) => sum + (g.totalCost || 0), 0)

  // Issue Form State
  const [issueForm, setIssueForm] = useState({
    supId: suppliers[0]?.id || '',
    boatId: boats[0]?.id || '',
    seasonId: s.activeSeasonId || 'seas_2026_q1',
    selectedItemId: gearItems[0]?.id || '',
    selectedQty: '2',
    arrangement: 'Fisherman-recoverable (Credit)',
    paid: '0',
    conditionOnIssue: 'New',
    notes: 'Issued for Lake Victoria night run',
    itemsList: []
  })

  // Return Form State
  const [returnForm, setReturnForm] = useState({
    returnedCondition: 'Good',
    restock: true,
    returnNotes: 'Returned after fishing expedition; inspected and clean'
  })

  // Item Form State
  const [itemForm, setItemForm] = useState({
    name: '',
    category: 'Reusable',
    stock: '10',
    minStock: '3',
    unitCost: '50000',
    sellPrice: '70000',
    unit: 'units',
    condition: 'New'
  })

  // Add Item into Issue Basket
  const handleAddItemToIssue = () => {
    const it = gearItems.find(g => g.id === issueForm.selectedItemId)
    if (!it) return
    const qty = +issueForm.selectedQty || 1
    const cost = qty * (it.sellPrice || it.unitCost)
    const newItems = [
      ...issueForm.itemsList,
      { itemId: it.id, name: it.name, qty, price: it.sellPrice, cost, unit: it.unit }
    ]
    setIssueForm(prev => ({
      ...prev,
      itemsList: newItems
    }))
  }

  const handleRemoveFromBasket = idx => {
    setIssueForm(prev => ({
      ...prev,
      itemsList: prev.itemsList.filter((_, i) => i !== idx)
    }))
  }

  const issueTotal = issueForm.itemsList.reduce((acc, it) => acc + it.cost, 0)

  const submitIssueGear = () => {
    if (issueForm.itemsList.length === 0) return
    a.issueGear({
      supId: issueForm.supId,
      boatId: issueForm.boatId,
      seasonId: issueForm.seasonId,
      items: issueForm.itemsList,
      totalCost: issueTotal,
      paid: +issueForm.paid || 0,
      arrangement: issueForm.arrangement,
      conditionOnIssue: issueForm.conditionOnIssue,
      notes: issueForm.notes
    })
    setIssueModalOpen(false)
    setIssueForm({
      supId: suppliers[0]?.id || '',
      boatId: boats[0]?.id || '',
      seasonId: s.activeSeasonId || 'seas_2026_q1',
      selectedItemId: gearItems[0]?.id || '',
      selectedQty: '2',
      arrangement: 'Fisherman-recoverable (Credit)',
      paid: '0',
      conditionOnIssue: 'New',
      notes: '',
      itemsList: []
    })
  }

  const submitReturnGear = () => {
    if (!selectedIssue) return
    a.returnGear(selectedIssue.id, {
      status: 'Returned & Reconciled',
      returnedCondition: returnForm.returnedCondition,
      restock: returnForm.restock,
      returnNotes: returnForm.returnNotes
    })
    setReturnModalOpen(false)
    setSelectedIssue(null)
  }

  const submitCreateItem = () => {
    if (!itemForm.name.trim()) return
    a.addGearItem(itemForm)
    setItemModalOpen(false)
    setItemForm({
      name: '',
      category: 'Reusable',
      stock: '10',
      minStock: '3',
      unitCost: '50000',
      sellPrice: '70000',
      unit: 'units',
      condition: 'New'
    })
  }

  return (
    <div className="page-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 m-0">Fishing Gear &amp; Equipment Management</h2>
            <Badge variant="blue">Lake Operations</Badge>
          </div>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Monitor nets, longlines, lamps, solar units, and GPS instruments issued to vessels with central ledger credit tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setItemModalOpen(true)} className="btn-secondary text-xs">
            <Package size={14} /> + Add Equipment SKU
          </button>
          <button onClick={() => setIssueModalOpen(true)} className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-500 font-bold">
            <Plus size={14} /> + Issue Gear to Vessel / Fisherman
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Equip Catalog &amp; SKUs</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black font-mono text-slate-900">{totalCatalogItems}</span>
                <span className="text-xs text-slate-500">Items ({totalStockQty} in store)</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800">
              <Anchor size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Asset Types:</span>
            <span className="font-semibold text-slate-800">Consumable, Reusable, Asset</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Issued Deployments</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black font-mono text-blue-900">{activeGearIssues.length}</span>
                <span className="text-xs text-slate-500">Vessels on Lake</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-800">
              <Ship size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Issued Value:</span>
            <span className="font-mono font-bold text-slate-800">{tzs(totalGearSpend)}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-amber-200 bg-amber-50/20 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Recoverable Gear Debt</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black font-mono text-amber-950">{tzs(totalRecoverableGearDebt)}</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-amber-100 flex items-center justify-between text-xs text-amber-900">
            <span>Posted to:</span>
            <span className="font-bold">Central Fisherman Ledger</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Season</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-base font-bold text-slate-900 truncate block">{activeSeason?.code || '2026-Q1'}</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Season Status:</span>
            <span className="font-bold text-emerald-700">Open for Fishing</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-xs font-bold">
        <button
          onClick={() => setTab('issues')}
          className={`pb-3 transition flex items-center gap-2 border-b-2 ${
            tab === 'issues' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Ship size={15} /> Issued Gear &amp; Vessel Assignments ({gearIssues.length})
        </button>
        <button
          onClick={() => setTab('catalog')}
          className={`pb-3 transition flex items-center gap-2 border-b-2 ${
            tab === 'catalog' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package size={15} /> Equipment Catalog &amp; Stores ({gearItems.length})
        </button>
        <button
          onClick={() => setTab('returns')}
          className={`pb-3 transition flex items-center gap-2 border-b-2 ${
            tab === 'returns' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <RotateCcw size={15} /> Return, Damage &amp; Loss Logs
        </button>
      </div>

      {/* TAB 1: ISSUED GEAR & ASSIGNMENTS */}
      {tab === 'issues' && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search issued gear by receipt #, fisherman, or boat..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-10 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIssueModalOpen(true)} className="btn-primary text-xs whitespace-nowrap bg-emerald-600 hover:bg-emerald-500 font-bold">
                <Plus size={14} /> + Issue Gear
              </button>
            </div>
          </div>

          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Voucher #</th>
                  <th>Date</th>
                  <th>Fisherman / BMU</th>
                  <th>Assigned Boat</th>
                  <th>Equipment Issued</th>
                  <th>Total Cost</th>
                  <th>Arrangement</th>
                  <th>Recoverable Debt</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {gearIssues
                  .filter(it => {
                    const sup = suppliers.find(s => s.id === it.supId)
                    const boat = boats.find(b => b.id === it.boatId)
                    return (
                      it.no.toLowerCase().includes(search.toLowerCase()) ||
                      (sup?.name || '').toLowerCase().includes(search.toLowerCase()) ||
                      (boat?.name || '').toLowerCase().includes(search.toLowerCase())
                    )
                  })
                  .map(issue => {
                    const sup = suppliers.find(s => s.id === issue.supId)
                    const boat = boats.find(b => b.id === issue.boatId)
                    return (
                      <tr key={issue.id} className="hover:bg-slate-50/80 transition">
                        <td className="font-mono font-bold text-blue-900">{issue.no}</td>
                        <td>
                          <span className="text-xs text-slate-700 block">{issue.date}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{fmtT(issue.at || issue.date)}</span>
                        </td>
                        <td>
                          <b className="text-slate-900 block">{sup?.name || issue.supId}</b>
                          <span className="text-[11px] text-slate-500 font-mono">{sup?.no || '-'}</span>
                        </td>
                        <td>
                          <span className="font-bold text-slate-800 block">{boat?.name || 'Unassigned'}</span>
                          <span className="text-[11px] font-mono text-slate-400">{boat?.regNo || '-'}</span>
                        </td>
                        <td className="max-w-[220px]">
                          <span className="text-xs text-slate-800 block truncate">
                            {issue.items.map(i => `${i.name} (x${i.qty})`).join(', ')}
                          </span>
                          <span className="text-[11px] text-slate-400">Condition: {issue.conditionOnIssue}</span>
                        </td>
                        <td className="font-mono font-bold text-slate-900">{tzs(issue.totalCost)}</td>
                        <td>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                              issue.arrangement.includes('Credit') || issue.arrangement.includes('recoverable')
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}
                          >
                            {issue.arrangement}
                          </span>
                        </td>
                        <td className="font-mono font-bold">
                          {issue.recoverable > 0 ? (
                            <span className="text-red-600">+{tzs(issue.recoverable)}</span>
                          ) : (
                            <span className="text-slate-400">Company Paid</span>
                          )}
                        </td>
                        <td>
                          <Badge variant={issue.status === 'Issued' ? 'amber' : 'green'}>
                            {issue.status}
                          </Badge>
                        </td>
                        <td className="text-right">
                          {issue.status === 'Issued' && (
                            <button
                              onClick={() => {
                                setSelectedIssue(issue)
                                setReturnModalOpen(true)
                              }}
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition"
                            >
                              <RotateCcw size={12} /> Log Return
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

      {/* TAB 2: EQUIPMENT CATALOG & STORES */}
      {tab === 'catalog' && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {['All', 'Consumable', 'Reusable', 'Asset'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                    filterCategory === cat
                      ? 'bg-blue-900 text-white border-blue-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button onClick={() => setItemModalOpen(true)} className="btn-primary text-xs font-bold">
              <Plus size={14} /> Add Equipment SKU
            </button>
          </div>

          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Equipment Description</th>
                  <th>Category</th>
                  <th>Stock Available</th>
                  <th>Unit of Measure</th>
                  <th>Cost Price</th>
                  <th>Issue / Selling Price</th>
                  <th>Condition</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {gearItems
                  .filter(it => filterCategory === 'All' || it.category === filterCategory)
                  .map(item => {
                    const isLow = (item.stock || 0) <= (item.minStock || 5)
                    return (
                      <tr key={item.id}>
                        <td>
                          <b className="text-slate-900 block">{item.name}</b>
                          <span className="text-[11px] font-mono text-slate-400">{item.id}</span>
                        </td>
                        <td>
                          <Badge
                            variant={
                              item.category === 'Asset'
                                ? 'purple'
                                : item.category === 'Reusable'
                                  ? 'blue'
                                  : 'neutral'
                            }
                          >
                            {item.category}
                          </Badge>
                        </td>
                        <td>
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            {item.stock} {item.unit}
                          </span>
                          <span className="text-[11px] text-slate-400 block">Min: {item.minStock}</span>
                        </td>
                        <td className="text-slate-600">{item.unit}</td>
                        <td className="font-mono">{tzs(item.unitCost)}</td>
                        <td className="font-mono font-bold text-blue-950">{tzs(item.sellPrice)}</td>
                        <td>
                          <span className="text-xs text-slate-700">{item.condition}</span>
                        </td>
                        <td>
                          <Badge variant={isLow ? 'red' : 'green'}>
                            {isLow ? 'Low Stock' : 'Available'}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RETURN & LOSS LOGS */}
      {tab === 'returns' && (
        <div className="flex flex-col gap-3">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            <b className="text-slate-900 block mb-1">Equipment Lifecycle &amp; Damaged Asset Policy</b>
            Reusable nets, lanterns, and GPS receivers returned from fishing expeditions are inspected for reef cuts or battery faults. Lost or damaged equipment issued on credit is retained as a fisherman liability on the central ledger.
          </div>

          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Voucher #</th>
                  <th>Date Issued</th>
                  <th>Return Date</th>
                  <th>Fisherman</th>
                  <th>Boat</th>
                  <th>Returned Condition</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {gearIssues.map(issue => (
                  <tr key={issue.id}>
                    <td className="font-mono font-bold text-blue-900">{issue.no}</td>
                    <td>{issue.date}</td>
                    <td>{issue.returnedDate || 'In Field'}</td>
                    <td>{suppliers.find(s => s.id === issue.supId)?.name || issue.supId}</td>
                    <td>{boats.find(b => b.id === issue.boatId)?.name || 'Vessel'}</td>
                    <td>
                      <Badge variant={issue.returnedCondition === 'Damaged' ? 'red' : 'green'}>
                        {issue.returnedCondition || issue.conditionOnIssue}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={issue.status === 'Issued' ? 'amber' : 'green'}>
                        {issue.status}
                      </Badge>
                    </td>
                    <td className="text-xs text-slate-500 max-w-[200px] truncate">
                      {issue.returnNotes || issue.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ISSUE GEAR TO VESSEL */}
      {issueModalOpen && (
        <Modal title="Issue Fishing Gear &amp; Equipment" close={() => setIssueModalOpen(false)}>
          <div className="flex flex-col gap-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Fisherman / Account">
                <select
                  value={issueForm.supId}
                  onChange={e => {
                    const matchedBoat = boats.find(b => b.ownerId === e.target.value)
                    setIssueForm({
                      ...issueForm,
                      supId: e.target.value,
                      boatId: matchedBoat?.id || issueForm.boatId
                    })
                  }}
                  className="input-field"
                >
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name} ({sup.no})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Assigned Fishing Boat">
                <select
                  value={issueForm.boatId}
                  onChange={e => setIssueForm({ ...issueForm, boatId: e.target.value })}
                  className="input-field"
                >
                  {boats.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.regNo})
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Gear Requisition Basket */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-slate-800 block">Select Equipment Item to Issue</span>
              <div className="flex gap-2">
                <select
                  value={issueForm.selectedItemId}
                  onChange={e => setIssueForm({ ...issueForm, selectedItemId: e.target.value })}
                  className="input-field flex-1"
                >
                  {gearItems.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name} · Stock: {g.stock} {g.unit} · TZS {f(g.sellPrice)}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={issueForm.selectedQty}
                  onChange={e => setIssueForm({ ...issueForm, selectedQty: e.target.value })}
                  className="input-field w-20 font-mono font-bold"
                />
                <button type="button" onClick={handleAddItemToIssue} className="btn-secondary text-xs">
                  + Add Item
                </button>
              </div>

              {issueForm.itemsList.length > 0 && (
                <div className="mt-2 space-y-1">
                  {issueForm.itemsList.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-white p-2 rounded border border-slate-200">
                      <span>{it.name} × {it.qty} {it.unit}</span>
                      <div className="flex items-center gap-3">
                        <b className="font-mono text-slate-900">{tzs(it.cost)}</b>
                        <button type="button" onClick={() => handleRemoveFromBasket(idx)} className="text-red-500 hover:text-red-700 font-bold">×</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Financial Arrangement">
                <select
                  value={issueForm.arrangement}
                  onChange={e => setIssueForm({ ...issueForm, arrangement: e.target.value })}
                  className="input-field font-semibold"
                >
                  <option>Fisherman-recoverable (Credit)</option>
                  <option>Company-funded</option>
                  <option>Cash / Immediate</option>
                </select>
              </Field>

              <Field label="Immediate Upfront Payment (TZS)">
                <input
                  type="number"
                  value={issueForm.paid}
                  onChange={e => setIssueForm({ ...issueForm, paid: e.target.value })}
                  className="input-field font-mono font-bold"
                />
              </Field>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-slate-500 block">Total Equipment Cost:</span>
                <b className="text-lg font-mono text-blue-950 font-bold">{tzs(issueTotal)}</b>
              </div>
              <div>
                <span className="text-slate-500 block text-right">Debit to Fisherman Ledger:</span>
                <b className="text-base font-mono text-red-600 font-bold">
                  {issueForm.arrangement.includes('recoverable') || issueForm.arrangement.includes('Credit')
                    ? tzs(Math.max(0, issueTotal - (+issueForm.paid || 0)))
                    : 'TZS 0'}
                </b>
              </div>
            </div>

            <Field label="Issue Notes">
              <input
                type="text"
                value={issueForm.notes}
                onChange={e => setIssueForm({ ...issueForm, notes: e.target.value })}
                className="input-field"
                placeholder="e.g. Verified by Storekeeper before voyage"
              />
            </Field>

            <div className="flex justify-between items-center pt-2">
              <button type="button" onClick={() => setIssueModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={submitIssueGear} disabled={issueForm.itemsList.length === 0} className="btn-primary">
                <CheckCircle2 size={16} /> Confirm Issue &amp; Post to Ledger
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: ADD EQUIPMENT SKU */}
      {itemModalOpen && (
        <Modal title="Register New Fishing Equipment SKU" close={() => setItemModalOpen(false)}>
          <div className="flex flex-col gap-4 text-xs">
            <Field label="Item Name &amp; Specifications">
              <input
                type="text"
                placeholder="e.g. Monofilament Gill Net 6-inch (100m)"
                value={itemForm.name}
                onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                className="input-field font-bold"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Equipment Category">
                <select
                  value={itemForm.category}
                  onChange={e => setItemForm({ ...itemForm, category: e.target.value })}
                  className="input-field"
                >
                  <option>Reusable</option>
                  <option>Consumable</option>
                  <option>Asset</option>
                </select>
              </Field>

              <Field label="Unit of Measure">
                <input
                  type="text"
                  placeholder="e.g. nets, rolls, pieces, boxes"
                  value={itemForm.unit}
                  onChange={e => setItemForm({ ...itemForm, unit: e.target.value })}
                  className="input-field"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Initial Store Stock">
                <input
                  type="number"
                  value={itemForm.stock}
                  onChange={e => setItemForm({ ...itemForm, stock: e.target.value })}
                  className="input-field font-mono font-bold"
                />
              </Field>

              <Field label="Minimum Reorder Threshold">
                <input
                  type="number"
                  value={itemForm.minStock}
                  onChange={e => setItemForm({ ...itemForm, minStock: e.target.value })}
                  className="input-field font-mono"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Supplier Cost Price (TZS)">
                <input
                  type="number"
                  value={itemForm.unitCost}
                  onChange={e => setItemForm({ ...itemForm, unitCost: e.target.value })}
                  className="input-field font-mono"
                />
              </Field>

              <Field label="Fisherman Issue Price (TZS)">
                <input
                  type="number"
                  value={itemForm.sellPrice}
                  onChange={e => setItemForm({ ...itemForm, sellPrice: e.target.value })}
                  className="input-field font-mono font-bold"
                />
              </Field>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setItemModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={submitCreateItem} className="btn-primary">
                Save Equipment Item
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: LOG GEAR RETURN */}
      {returnModalOpen && selectedIssue && (
        <Modal title={`Log Equipment Return: ${selectedIssue.no}`} close={() => setReturnModalOpen(false)}>
          <div className="flex flex-col gap-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <b className="text-slate-900 block">{selectedIssue.items.map(i => `${i.name} (x${i.qty})`).join(', ')}</b>
              <span className="text-slate-500 block">Issued on {selectedIssue.date} to {selectedIssue.supId}</span>
            </div>

            <Field label="Condition on Return">
              <select
                value={returnForm.returnedCondition}
                onChange={e => setReturnForm({ ...returnForm, returnedCondition: e.target.value })}
                className="input-field font-semibold"
              >
                <option>Good</option>
                <option>Fair (Minor Wear)</option>
                <option>Damaged / Needs Repair</option>
                <option>Lost / Irrecoverable</option>
              </select>
            </Field>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="restock_cb"
                checked={returnForm.restock}
                onChange={e => setReturnForm({ ...returnForm, restock: e.target.checked })}
                className="rounded text-blue-600"
              />
              <label htmlFor="restock_cb" className="text-slate-700 font-semibold cursor-pointer">
                Restock returned undamaged equipment into store inventory
              </label>
            </div>

            <Field label="Inspection Notes">
              <textarea
                rows={2}
                value={returnForm.returnNotes}
                onChange={e => setReturnForm({ ...returnForm, returnNotes: e.target.value })}
                className="input-field"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setReturnModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={submitReturnGear} className="btn-primary">
                Sign-off Return
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

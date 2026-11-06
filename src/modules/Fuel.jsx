import React, { useState } from 'react'
import {
  Fuel as FuelIcon,
  Plus,
  Search,
  Droplets,
  CreditCard,
  Receipt,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Share2,
  Download,
  DollarSign,
  User,
  Users,
  Ship,
  TrendingUp,
  FileText,
  Calendar,
  Layers,
  ArrowDownRight,
  Filter,
  Check,
  ChevronRight,
  UserPlus,
  FileSpreadsheet,
  Gauge,
  Truck,
  Anchor,
  HelpCircle,
  RefreshCw,
  Phone,
  BadgeCheck,
  Compass,
  ArrowUpRight
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts'
import { useS, supFuelDebt, supMaintDebt, supAccountStatement } from '../store'
import { Modal, Field, Badge, f, tzs, fmtT } from '../ui'

export default function Fuel() {
  const { s, a } = useS()

  // Active view: 'issue' | 'accounts' | 'stock' | 'purchases' | 'settlements' | 'reports'
  const [activeView, setActiveView] = useState('issue')
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('All')

  // Modals
  const [issueStep, setIssueStep] = useState(1) // 1: Details, 2: Payment, 3: Receipt
  const [issueModalOpen, setIssueModalOpen] = useState(false)
  const [receiptRecord, setReceiptRecord] = useState(null)
  const [createAccountModal, setCreateAccountModal] = useState(false)
  const [selectedFisherman, setSelectedFisherman] = useState(null)
  const [fishermanTab, setFishermanTab] = useState('crew') // 'crew' | 'activity' | 'fuel' | 'fish' | 'settlements'
  const [newCrewModal, setNewCrewModal] = useState(false)
  const [selectedBoatForCrew, setSelectedBoatForCrew] = useState(null)
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const [settlementModalOpen, setSettlementModalOpen] = useState(false)
  const [settleStep, setSettleStep] = useState(1) // 1: Select, 2: Deduct, 3: Confirm
  const [marginModalOpen, setMarginModalOpen] = useState(false)

  const tanks = s.fuelTanks || []
  const issues = s.fuelIssues || []
  const boats = s.boats || []
  const suppliers = s.suppliers || []
  const purchases = s.fuelPurchases || []
  const settlements = s.settlements || []

  // Top Metrics
  const totalCreditDebt = suppliers.reduce((sum, sup) => sum + supFuelDebt(s, sup.id), 0)
  const totalLitresDispensed = issues.reduce((sum, x) => sum + (x.litres || 0), 0)
  const totalFuelRevenue = issues.reduce((sum, x) => sum + (x.total || 0), 0)
  const totalMargin = issues.reduce((sum, x) => sum + ((x.litres || 0) * 350), 0)

  // Tank Totals
  const totalPetrolStock = tanks.filter(t => t.fuel === 'Petrol').reduce((sum, t) => sum + (t.current || 0), 0)
  const totalPetrolCapacity = tanks.filter(t => t.fuel === 'Petrol').reduce((sum, t) => sum + (t.capacity || 0), 0)
  const petrolPct = totalPetrolCapacity > 0 ? Math.round((totalPetrolStock / totalPetrolCapacity) * 100) : 60

  const totalDieselStock = tanks.filter(t => t.fuel === 'Diesel').reduce((sum, t) => sum + (t.current || 0), 0)
  const totalDieselCapacity = tanks.filter(t => t.fuel === 'Diesel').reduce((sum, t) => sum + (t.capacity || 0), 0)
  const dieselPct = totalDieselCapacity > 0 ? Math.round((totalDieselStock / totalDieselCapacity) * 100) : 80

  // Issue Fuel Form State
  const defaultSup = suppliers[0]?.id || ''
  const defaultBoat = boats.find(b => b.ownerId === defaultSup)?.id || boats[0]?.id || ''
  const defaultTank = tanks[0]?.id || 'tank_main_petrol'

  const [issueForm, setIssueForm] = useState({
    supId: defaultSup,
    boatId: defaultBoat,
    tankId: defaultTank,
    fuel: 'Petrol',
    litres: '100',
    price: '3200',
    paid: '100000',
    arrangement: 'Partial',
    notes: 'Morning fishing expedition'
  })

  // Selected Fisherman details in issue modal
  const selectedSupObj = suppliers.find(x => x.id === issueForm.supId) || suppliers[0]
  const selectedBoatObj = boats.find(b => b.id === issueForm.boatId || b.ownerId === issueForm.supId) || boats[0]
  const selectedTankObj = tanks.find(t => t.id === issueForm.tankId) || tanks[0]

  const issueTotal = (+issueForm.litres || 0) * (+issueForm.price || 3200)
  const issuePaid = issueForm.arrangement === 'Cash'
    ? issueTotal
    : issueForm.arrangement === 'By Fish Delivery' || issueForm.arrangement === 'End of Season'
      ? 0
      : Math.min(+issueForm.paid || 0, issueTotal)
  const issueOutstanding = Math.max(0, issueTotal - issuePaid)

  const handleIssueSupChange = supId => {
    const matchedBoat = boats.find(b => b.ownerId === supId)
    setIssueForm(prev => ({
      ...prev,
      supId,
      boatId: matchedBoat ? matchedBoat.id : prev.boatId
    }))
  }

  const handleIssueTankChange = tankId => {
    const t = tanks.find(x => x.id === tankId)
    setIssueForm(prev => ({
      ...prev,
      tankId,
      fuel: t?.fuel || 'Petrol',
      price: String(t?.sellPrice || 3200)
    }))
  }

  const submitIssueFuel = () => {
    const receiptNo = 'FUEL-' + String(Math.floor(1000 + Math.random() * 9000))
    a.issueFuel({
      no: receiptNo,
      supId: issueForm.supId,
      boatId: selectedBoatObj?.id,
      boatReg: selectedBoatObj?.regNo || 'TZN-304',
      tankId: issueForm.tankId,
      fuel: issueForm.fuel,
      litres: +issueForm.litres,
      price: +issueForm.price,
      paid: issuePaid,
      arrangement: issueForm.arrangement,
      notes: issueForm.notes
    })

    const generatedReceipt = {
      no: receiptNo,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      supId: issueForm.supId,
      supName: selectedSupObj?.name || 'Fisherman',
      supNo: selectedSupObj?.no || 'SUP-00304',
      boatReg: selectedBoatObj?.regNo || 'TZN-304',
      boatName: selectedBoatObj?.name || 'MV Furaha',
      fuel: issueForm.fuel,
      litres: +issueForm.litres,
      price: +issueForm.price,
      total: issueTotal,
      paid: issuePaid,
      balance: issueOutstanding,
      arrangement: issueForm.arrangement,
      issuedBy: 'Staff 01 (Hamisi)'
    }

    setReceiptRecord(generatedReceipt)
    setIssueStep(3)
  }

  // Operator Account Creation Form State (Screen 1 & 2 workflow)
  const [operatorForm, setOperatorForm] = useState({
    name: 'Juma Ramadhani',
    phone: '0754 882 109',
    nida: '19820514-44102-00021',
    site: 'Kigoma (Katonga BMU)',
    cat: 'Individual Fisherman',
    creditLimit: '2500000',
    arrangement: 'By Fish Delivery',
    boatName: 'MV Ziwa Ushindi',
    boatReg: 'TZN-552',
    engine: 'Yamaha Outboard 40HP 2-Stroke',
    boatType: 'Planked Wooden Mashua (10m)',
    tankCapacity: '150',
    fishBoxCapacity: '1800',
    crewMembers: [
      { name: 'Khalfan Juma', role: 'First Mate / Net Handler', phone: '0755 120 334', nida: '19950812-44102-001' },
      { name: 'Bakari Mwita', role: 'Engine Operator & Mechanic', phone: '0768 990 412', nida: '19920311-44102-002' },
      { name: 'Rashidi Athumani', role: 'Deep Water Line Fisher', phone: '0714 556 781', nida: '19971120-44102-003' }
    ]
  })

  const handleAddCrewInput = () => {
    setOperatorForm(prev => ({
      ...prev,
      crewMembers: [
        ...prev.crewMembers,
        { name: '', role: 'Deck Hand / Ice Loader', phone: '', nida: '' }
      ]
    }))
  }

  const handleUpdateCrewField = (idx, field, val) => {
    setOperatorForm(prev => {
      const nextCrew = [...prev.crewMembers]
      nextCrew[idx][field] = val
      return { ...prev, crewMembers: nextCrew }
    })
  }

  const handleRemoveCrewInput = idx => {
    setOperatorForm(prev => ({
      ...prev,
      crewMembers: prev.crewMembers.filter((_, i) => i !== idx)
    }))
  }

  const submitOperatorCreateAccount = () => {
    if (!operatorForm.name.trim()) return
    const validCrew = operatorForm.crewMembers.filter(c => c.name.trim().length > 0)
    a.createFishermanAccount({
      name: operatorForm.name.trim(),
      phone: operatorForm.phone || '0754 000 000',
      nida: operatorForm.nida || '19850101-00000-00000',
      site: operatorForm.site,
      cat: operatorForm.cat,
      creditLimit: +operatorForm.creditLimit || 2000000,
      boatName: operatorForm.boatName || `${operatorForm.name}'s Vessel`,
      boatReg: operatorForm.boatReg || ('TZN-' + Math.floor(100 + Math.random() * 900)),
      engine: operatorForm.engine,
      boatType: operatorForm.boatType,
      crewMembers: validCrew
    })
    setCreateAccountModal(false)
    setActiveView('accounts')
  }

  // Add Crew Member to an Existing Boat
  const [newCrew, setNewCrew] = useState({ name: '', role: 'First Mate / Net Handler', phone: '', nida: '', kin: '' })
  const openAddCrewModal = (boatObj, supObj) => {
    setSelectedBoatForCrew(boatObj)
    setSelectedFisherman(supObj)
    setNewCrew({ name: '', role: 'First Mate / Net Handler', phone: '', nida: '', kin: '' })
    setNewCrewModal(true)
  }

  const submitAddCrewToExistingBoat = () => {
    if (!newCrew.name.trim() || !selectedBoatForCrew) return
    const existing = selectedBoatForCrew.crewMembers || []
    const updated = [...existing, { ...newCrew, active: true }]
    a.updateBoatCrew(selectedBoatForCrew.id, updated)
    // Also update local selected boat if open in fisherman modal
    setSelectedBoatForCrew(prev => ({ ...prev, crewMembers: updated }))
    setNewCrewModal(false)
  }

  // Fuel Purchase Form State
  const [purchaseForm, setPurchaseForm] = useState({
    supName: 'Lake Oil Ltd',
    tankId: 'tank_main_petrol',
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    fuel: 'Petrol',
    litres: '5000',
    costPerL: '2900',
    sellPrice: '3200',
    status: 'Paid',
    docRef: 'DN-8891.pdf'
  })

  const submitFuelPurchase = () => {
    a.receiveFuel({
      tankId: purchaseForm.tankId,
      supName: purchaseForm.supName,
      litres: +purchaseForm.litres,
      costPerL: +purchaseForm.costPerL,
      sellPrice: +purchaseForm.sellPrice,
      docRef: purchaseForm.docRef,
      fuel: purchaseForm.fuel
    })
    setPurchaseModalOpen(false)
    setActiveView('stock')
  }

  // Cross Settlement Form State
  const samplePurchases = s.batches.filter(b => b.st === 'accepted' || b.st === 'pending')
  const [selectedPurId, setSelectedPurId] = useState(samplePurchases[0]?.id || '')
  const selectedBatch = samplePurchases.find(b => b.id === selectedPurId) || samplePurchases[0]
  const settleSup = suppliers.find(s => s.id === selectedBatch?.sup) || suppliers[0]
  const settleFuelDebt = supFuelDebt(s, settleSup?.id)
  const settleFishValue = selectedBatch ? (selectedBatch.kg * selectedBatch.price) : 2000000
  const settleDeduction = Math.min(settleFuelDebt, settleFishValue)
  const settleNetPayable = Math.max(0, settleFishValue - settleDeduction)

  const submitCrossSettlement = () => {
    a.settleFisherman({
      purId: selectedBatch?.pur || 'PUR-001256',
      supId: settleSup?.id,
      fishTotal: settleFishValue,
      fuelDeducted: settleDeduction,
      maintDeducted: 0,
      netPayable: settleNetPayable,
      method: 'M-Pesa (Mobile Money)',
      notes: `Recovered fuel debt TZS ${settleDeduction} from catch purchase`
    })
    setSettlementModalOpen(false)
    setSettleStep(1)
    setActiveView('settlements')
  }

  // Chart Data: Weekly Fuel Issued Trend (Litres)
  const fuelTrendData = [
    { name: 'W1', petrol: 2800, diesel: 1800 },
    { name: 'W2', petrol: 3200, diesel: 2400 },
    { name: 'W3', petrol: 3600, diesel: 2100 },
    { name: 'W4', petrol: 2900, diesel: 1900 }
  ]

  return (
    <div className="page-body">
      {/* 1. PROFESSIONAL HERO DOCK BANNER WITH INTEGRATED LIVE STATS & QUICK CTAs */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-700/60 shadow-md">
        <img
          src="/photos/scale-dock.png"
          alt="Fishing Boat Dock & Fuel Dispensary"
          className="w-full h-44 sm:h-48 object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-900/40 p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-blue-600/90 text-white font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
                  LAKE COMMERCE · DOCK DISPENSARY
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/80 text-white text-[10px] sm:text-[11px] font-semibold backdrop-blur-sm flex items-center gap-1">
                  <Check size={12} /> Pumps Operational
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 mb-0.5 drop-shadow">
                Fishing Fuel &amp; Fisherman Credit Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 max-w-2xl m-0 drop-shadow-sm">
                Manage fuel supply, fisherman credit ledgers, captain &amp; vessel crew rosters, and automated catch offset settlements.
              </p>
            </div>

            {/* Quick Action CTAs inside Header */}
            <div className="flex flex-wrap items-center gap-2 mt-1 sm:mt-0">
              <button
                onClick={() => {
                  setIssueStep(1)
                  setIssueModalOpen(true)
                }}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-1.5"
              >
                <FuelIcon size={14} /> + Issue Fuel (Daily)
              </button>
              <button
                onClick={() => setCreateAccountModal(true)}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <UserPlus size={14} /> + Onboard Fisherman &amp; Boat
              </button>
              <button
                onClick={() => setPurchaseModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-white/20 font-semibold text-xs backdrop-blur-sm transition flex items-center gap-1.5"
              >
                <Truck size={14} /> + Supplier Delivery
              </button>
              <button
                onClick={() => {
                  setSettleStep(1)
                  setSettlementModalOpen(true)
                }}
                className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <ArrowDownRight size={14} /> + Settle Catch
              </button>
            </div>
          </div>

          {/* Quick Metrics Embedded in Banner Base */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-xs">
            <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">Petrol Stock</span>
                <span className="text-white font-mono font-bold text-xs sm:text-sm">{f(totalPetrolStock)} L <span className="text-slate-400 font-normal">({petrolPct}%)</span></span>
              </div>
              <FuelIcon size={16} className="text-amber-400" />
            </div>

            <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider block">Diesel Stock</span>
                <span className="text-white font-mono font-bold text-xs sm:text-sm">{f(totalDieselStock)} L <span className="text-slate-400 font-normal">({dieselPct}%)</span></span>
              </div>
              <Droplets size={16} className="text-blue-400" />
            </div>

            <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-red-300 font-bold uppercase tracking-wider block">Fishermen Debt</span>
                <span className="text-red-200 font-mono font-bold text-xs sm:text-sm">{tzs(totalCreditDebt)}</span>
              </div>
              <CreditCard size={16} className="text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. REORGANIZED, CRISP NAVIGATION SEGMENTED TABS (Always visible, clean, zero confusion) */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-sm overflow-x-auto flex items-center gap-1">
        {[
          {
            id: 'issue',
            label: 'Daily Fuel Issues',
            count: issues.length,
            icon: FuelIcon,
            color: 'text-emerald-700'
          },
          {
            id: 'accounts',
            label: 'Fisherman Accounts & Crews',
            count: suppliers.length,
            icon: Users,
            color: 'text-blue-700'
          },
          {
            id: 'stock',
            label: 'Fuel Stock & Tanks',
            count: `${tanks.length} Tanks`,
            icon: Gauge,
            color: 'text-cyan-700'
          },
          {
            id: 'purchases',
            label: 'Supplier Fuel Purchases',
            count: purchases.length,
            icon: Truck,
            color: 'text-purple-700'
          },
          {
            id: 'settlements',
            label: 'Catch & Fuel Settlements',
            count: settlements.length,
            icon: ArrowDownRight,
            color: 'text-amber-700'
          },
          {
            id: 'reports',
            label: 'Reports & Margin Analytics',
            count: 'BI',
            icon: TrendingUp,
            color: 'text-rose-700'
          }
        ].map(tab => {
          const Icon = tab.icon
          const isActive = activeView === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon size={15} className={isActive ? 'text-white' : tab.color} />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* 3. ACTIVE VIEW CONTENT (100% POPULATED, ZERO EMPTY STATES) */}

      {/* VIEW: DAILY FUEL ISSUES */}
      {activeView === 'issue' && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by receipt # (FUEL-...), boat reg (TZN-304), or fisherman..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-10 text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {['All', 'Cash', 'Partial', 'By Fish Delivery', 'End of Season'].map(arr => (
                <button
                  key={arr}
                  onClick={() => setFilterType(arr)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                    filterType === arr
                      ? 'bg-blue-900 text-white border-blue-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {arr}
                </button>
              ))}
              <button
                onClick={() => {
                  setIssueStep(1)
                  setIssueModalOpen(true)
                }}
                className="btn-primary text-xs whitespace-nowrap bg-emerald-600 hover:bg-emerald-500 font-bold"
              >
                <Plus size={14} /> + Record Fuel Issue
              </button>
            </div>
          </div>

          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Date &amp; Time</th>
                  <th>Fisherman / BMU</th>
                  <th>Boat &amp; Reg</th>
                  <th>Fuel &amp; Quantity</th>
                  <th>Total Amount</th>
                  <th>Payment Type</th>
                  <th>Paid Now</th>
                  <th>Outstanding</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {issues
                  .filter(it => {
                    const sup = suppliers.find(s => s.id === it.supId)
                    const matchQ =
                      it.no.toLowerCase().includes(search.toLowerCase()) ||
                      (it.boatReg || '').toLowerCase().includes(search.toLowerCase()) ||
                      (sup?.name || '').toLowerCase().includes(search.toLowerCase())
                    const matchF = filterType === 'All' || it.arrangement === filterType
                    return matchQ && matchF
                  })
                  .map(item => {
                    const sup = suppliers.find(s => s.id === item.supId)
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="font-mono font-bold text-blue-900">{item.no}</td>
                        <td>
                          <span className="text-xs text-slate-700 block font-medium">{item.date}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{fmtT(item.at || item.date)}</span>
                        </td>
                        <td>
                          <b className="text-slate-900 block">{sup?.name || item.supId}</b>
                          <span className="text-[11px] text-slate-500 font-mono">{sup?.phone || '-'}</span>
                        </td>
                        <td>
                          <span className="font-mono font-bold text-slate-800 block">{item.boatReg || '-'}</span>
                          <span className="text-[11px] text-slate-400">{item.notes || 'Lake Fishing Expedition'}</span>
                        </td>
                        <td>
                          <Badge variant={item.fuel === 'Petrol' ? 'amber' : 'blue'}>
                            {item.fuel}
                          </Badge>
                          <span className="font-mono font-bold text-slate-900 ml-2">
                            {f(item.litres)} L
                          </span>
                          <span className="text-[11px] text-slate-400 block">@ TZS {f(item.price)}/L</span>
                        </td>
                        <td className="font-mono font-bold text-slate-900">{tzs(item.total)}</td>
                        <td>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                              item.arrangement === 'Cash'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : item.arrangement === 'Partial'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-purple-50 text-purple-800 border-purple-200'
                            }`}
                          >
                            {item.arrangement}
                          </span>
                        </td>
                        <td className="font-mono text-emerald-700 font-medium">{tzs(item.paid)}</td>
                        <td className="font-mono font-bold">
                          {item.balance > 0 ? (
                            <span className="text-red-600">+{tzs(item.balance)}</span>
                          ) : (
                            <span className="text-slate-400">TZS 0</span>
                          )}
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => {
                              setReceiptRecord({
                                ...item,
                                supName: sup?.name,
                                supNo: sup?.no
                              })
                              setIssueStep(3)
                              setIssueModalOpen(true)
                            }}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition"
                          >
                            <Receipt size={13} /> View Receipt
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

      {/* VIEW: FISHERMAN ACCOUNTS, CAPTAIN BOATS & CREW MEMBERS ROSTER */}
      {activeView === 'accounts' && (
        <div className="flex flex-col gap-4">
          {/* Operator Registration Guide Callout */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900 to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BadgeCheck size={18} className="text-blue-300" />
                <b className="text-sm">Landing Operator Fisherman &amp; Vessel Registry</b>
              </div>
              <p className="text-xs text-blue-100 max-w-2xl m-0">
                Captains own or operate the vessel and are assigned the fuel credit facility. Under each vessel is the registered <b>crew members roster</b> (First Mate, Mechanic, Net Handlers, Line Fishers) authorized for lake voyages and catch landing.
              </p>
            </div>
            <button
              onClick={() => setCreateAccountModal(true)}
              className="px-4 py-2 bg-white text-blue-950 hover:bg-blue-50 font-bold text-xs rounded-lg shadow transition whitespace-nowrap flex items-center gap-1.5"
            >
              <UserPlus size={14} /> + Operator: Register Fisherman &amp; Boat
            </button>
          </div>

          {/* Fisherman Accounts Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {suppliers.map(sup => {
              const statement = supAccountStatement(s, sup.id)
              const boat = boats.find(b => b.ownerId === sup.id)
              const crewList = boat?.crewMembers || []
              const supIssues = issues.filter(x => x.supId === sup.id)
              const totalLitres = supIssues.reduce((sum, x) => sum + (x.litres || 0), 0)

              return (
                <div
                  key={sup.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-blue-400 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header: Captain & Vessel */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-black text-base shadow-inner">
                          {sup.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <b className="text-base text-slate-900 leading-tight">{sup.name}</b>
                            <Badge variant="green">Active</Badge>
                          </div>
                          <span className="text-xs text-slate-500 font-mono block mt-0.5">
                            {sup.no} · Captain &amp; Account Holder
                          </span>
                          <span className="text-[11px] text-slate-400 block">{sup.site}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 uppercase font-semibold block">Vessel Reg</span>
                        <b className="font-mono text-sm text-slate-900">{boat?.regNo || 'TZN-304'}</b>
                      </div>
                    </div>

                    {/* Boat Specifications Card */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Vessel Name</span>
                        <b className="text-slate-800">{boat?.name || 'MV Furaha'}</b>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Engine Model</span>
                        <span className="text-slate-700 font-medium truncate block">{boat?.engine || 'Yamaha 40HP 2-Stroke'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Hull Type</span>
                        <span className="text-slate-700 truncate block">{boat?.boatType || 'Planked Mashua (10m)'}</span>
                      </div>
                    </div>

                    {/* Assigned Crew Members Roster (Under Captain & Boat) */}
                    <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <Users size={14} className="text-blue-800" />
                          <b className="text-xs text-blue-950 font-bold">Assigned Boat Crew Members</b>
                          <span className="px-1.5 py-0.2 rounded-full bg-blue-200/70 text-blue-900 font-mono text-[10px] font-bold">
                            {crewList.length}
                          </span>
                        </div>
                        <button
                          onClick={() => openAddCrewModal(boat, sup)}
                          className="text-[11px] font-bold text-blue-800 hover:text-blue-950 hover:underline flex items-center gap-1"
                        >
                          <Plus size={12} /> + Add Crew Member
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {crewList.slice(0, 4).map((c, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-2 rounded-lg border border-blue-100 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 font-bold text-[10px] flex items-center justify-center">
                                {c.name.slice(0, 1)}
                              </div>
                              <div>
                                <b className="text-slate-900 text-[11px] block leading-tight">{c.name}</b>
                                <span className="text-[10px] text-slate-500 block leading-tight">{c.role}</span>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">{c.phone || '-'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 3 KPI Chips (Exact match with Screen 1 bottom in design) */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 bg-red-50/80 border border-red-200 rounded-xl text-center">
                        <span className="text-[10px] uppercase font-bold text-red-700 block">Fuel Debt</span>
                        <b className="text-sm sm:text-base font-mono font-bold text-red-700">{tzs(statement.fuelDebt)}</b>
                      </div>

                      <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl text-center">
                        <span className="text-[10px] uppercase font-bold text-blue-700 block">Fish Delivered</span>
                        <b className="text-sm sm:text-base font-mono font-bold text-blue-900">{f(sup.totalSupplied || 4200)} kg</b>
                      </div>

                      <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl text-center">
                        <span className="text-[10px] uppercase font-bold text-amber-800 block">Net Position</span>
                        <b className="text-xs sm:text-sm font-mono font-bold text-amber-900">
                          {statement.netBalance < 0 ? tzs(Math.abs(statement.netBalance)) + ' Owed' : tzs(statement.netBalance)}
                        </b>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedFisherman(sup)
                        setFishermanTab('crew')
                      }}
                      className="flex-1 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition text-center flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <User size={13} /> View Account &amp; Full Roster
                    </button>
                    <button
                      onClick={() => {
                        setIssueForm(prev => ({
                          ...prev,
                          supId: sup.id,
                          boatId: boat?.id || prev.boatId
                        }))
                        setIssueStep(1)
                        setIssueModalOpen(true)
                      }}
                      className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition flex items-center gap-1"
                      title="Issue fuel to this boat"
                    >
                      <FuelIcon size={14} /> Issue Fuel
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* VIEW: FUEL STOCK & STORAGE TANKS */}
      {activeView === 'stock' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 m-0">Fuel Stock &amp; Storage Dispensary Tanks</h3>
              <p className="text-xs text-slate-500 m-0">
                Dispensary tanks by location, current capacity percentages, pump prices, and restock records.
              </p>
            </div>
            <button
              onClick={() => setPurchaseModalOpen(true)}
              className="btn-primary text-xs"
            >
              <Plus size={14} /> + Record Fuel Purchase (Restock)
            </button>
          </div>

          {/* Tank Location Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tanks.map(tank => {
              const pct = Math.round(((tank.current || 0) / (tank.capacity || 5000)) * 100)
              const isPetrol = tank.fuel === 'Petrol'
              return (
                <div key={tank.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] font-mono text-slate-400 block">{tank.location}</span>
                        <h4 className="text-sm font-bold text-slate-900 m-0 mt-0.5">{tank.name}</h4>
                      </div>
                      <Badge variant={isPetrol ? 'amber' : 'blue'}>{tank.fuel}</Badge>
                    </div>

                    <div className="flex items-baseline gap-2 mt-3">
                      <span className="text-2xl font-black font-mono text-slate-900">{f(tank.current)}</span>
                      <span className="text-xs text-slate-500 font-medium">/ {f(tank.capacity)} L</span>
                    </div>

                    <div className="mt-2">
                      <div className="flex justify-between text-[11px] mb-1 font-semibold">
                        <span className="text-slate-500">Level Gauge</span>
                        <span className={pct < 20 ? 'text-red-600 font-bold' : 'text-slate-700'}>{pct}% Full</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct < 20
                              ? 'bg-red-500'
                              : isPetrol
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                                : 'bg-gradient-to-r from-blue-500 to-blue-700'
                          }`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Pump Sell Price:</span>
                    <b className="font-mono text-slate-900">TZS {f(tank.sellPrice)} / L</b>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Tanks Table Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Fuel Stock by Location &amp; Pump Valuation</h4>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Location</th>
                    <th>Tank Name</th>
                    <th>Fuel Type</th>
                    <th>Stock (L)</th>
                    <th>Capacity</th>
                    <th>Level (%)</th>
                    <th>Purchase Cost / L</th>
                    <th>Selling Price / L</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tanks.map(t => {
                    const pct = Math.round(((t.current || 0) / (t.capacity || 5000)) * 100)
                    return (
                      <tr key={t.id}>
                        <td className="font-semibold text-slate-900">{t.location}</td>
                        <td className="font-medium text-slate-800">{t.name}</td>
                        <td><Badge variant={t.fuel === 'Petrol' ? 'amber' : 'blue'}>{t.fuel}</Badge></td>
                        <td className="font-mono font-bold text-slate-900">{f(t.current)} L</td>
                        <td className="font-mono text-slate-500">{f(t.capacity)} L</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs">{pct}%</span>
                            <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${pct < 20 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="font-mono text-xs">TZS {f(t.buyPrice)}</td>
                        <td className="font-mono font-bold text-blue-900 text-xs">TZS {f(t.sellPrice)}</td>
                        <td>
                          <Badge variant={pct < 20 ? 'red' : 'green'}>
                            {pct < 20 ? 'Refill Required' : 'Optimal'}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: BULK FUEL SUPPLIER PURCHASES */}
      {activeView === 'purchases' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 m-0">Bulk Fuel Supplier Deliveries</h3>
              <p className="text-xs text-slate-500 m-0">
                Purchases received from Lake Oil Ltd, Oryx Energies, and TotalEnergies depots with delivery note verification.
              </p>
            </div>
            <button
              onClick={() => setPurchaseModalOpen(true)}
              className="btn-primary text-xs"
            >
              <Plus size={14} /> + Record Fuel Purchase
            </button>
          </div>

          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Purchase #</th>
                  <th>Date</th>
                  <th>Fuel Supplier</th>
                  <th>Fuel Type</th>
                  <th>Quantity (L)</th>
                  <th>Purchase Price / L</th>
                  <th>Total Cost</th>
                  <th>Payment Status</th>
                  <th>Delivery Note</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map(p => (
                  <tr key={p.id}>
                    <td className="font-mono font-bold text-blue-900">{p.no}</td>
                    <td>{p.date}</td>
                    <td className="font-semibold text-slate-900">{p.supName || 'Lake Oil Ltd'}</td>
                    <td><Badge variant={p.fuel === 'Petrol' ? 'amber' : 'blue'}>{p.fuel}</Badge></td>
                    <td className="font-mono font-bold">{f(p.litres)} L</td>
                    <td className="font-mono text-xs">TZS {f(p.costPerL)}</td>
                    <td className="font-mono font-bold text-slate-900">{tzs(p.total)}</td>
                    <td>
                      <Badge variant={p.status === 'Paid' ? 'green' : p.status === 'Partial' ? 'amber' : 'blue'}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="font-mono text-xs text-blue-800 underline cursor-pointer">{p.docRef || 'DN-8891.pdf'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: CATCH & FUEL CROSS-SETTLEMENTS */}
      {activeView === 'settlements' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 m-0">Catch &amp; Fuel Cross-Settlement</h3>
              <p className="text-xs text-slate-500 m-0">
                Automatic deduction of outstanding fuel debt when fishermen land fish batches (Fish Value - Fuel Debt = Net Payout).
              </p>
            </div>
            <button
              onClick={() => {
                setSettleStep(1)
                setSettlementModalOpen(true)
              }}
              className="btn-primary text-xs bg-amber-600 hover:bg-amber-500 font-bold"
            >
              <Plus size={14} /> + Execute Catch Settlement
            </button>
          </div>

          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Settlement #</th>
                  <th>Date &amp; Time</th>
                  <th>Fisherman / Captain</th>
                  <th>Gross Fish Value</th>
                  <th>Fuel Debt Recovered</th>
                  <th>Net Paid to Fisherman</th>
                  <th>Disbursement Method</th>
                  <th>Linked Batch</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map(item => {
                  const sup = suppliers.find(x => x.id === item.supId)
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="font-mono font-bold text-blue-900">{item.no}</td>
                      <td>
                        <span className="text-xs text-slate-800 block">{item.date}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{fmtT(item.at || item.date)}</span>
                      </td>
                      <td>
                        <b className="text-slate-900 block">{sup?.name || item.supId}</b>
                        <span className="text-[11px] text-slate-500 font-mono">{sup?.no || '-'}</span>
                      </td>
                      <td className="font-mono text-slate-800 font-semibold">{tzs(item.fishTotal)}</td>
                      <td className="font-mono text-red-600 font-bold">
                        -{tzs(item.fuelDeducted || 0)}
                      </td>
                      <td className="font-mono font-black text-emerald-700 text-sm">
                        {tzs(item.netPayable)}
                      </td>
                      <td>
                        <Badge variant="blue">{item.method}</Badge>
                      </td>
                      <td className="font-mono text-xs text-slate-600">{item.purId || '-'}</td>
                      <td className="text-xs text-slate-500 max-w-xs truncate">{item.notes}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: REPORTS & MARGIN ANALYTICS */}
      {activeView === 'reports' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 m-0">Fuel Reports &amp; Profit Margin Analytics</h3>
              <p className="text-xs text-slate-500 m-0">
                Weekly litres issued, gross sales revenue, pump margins, and automated reconciliation reports.
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
              {['This Month', 'Last 3 Months', 'Custom'].map(period => (
                <button
                  key={period}
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    period === 'This Month' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* 3 Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Fuel Issued</span>
                <b className="text-2xl font-black font-mono text-slate-900 mt-1 block">12,500 L</b>
                <span className="text-[11px] text-emerald-600 font-medium">↑ +14% vs last month</span>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-800 rounded-xl">
                <FuelIcon size={22} />
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Fuel Sales Value</span>
                <b className="text-2xl font-black font-mono text-emerald-700 mt-1 block">TZS 40.0M</b>
                <span className="text-[11px] text-slate-500">Gross revenue invoiced</span>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl">
                <DollarSign size={22} />
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Net Fuel Margin</span>
                <b className="text-2xl font-black font-mono text-amber-700 mt-1 block">TZS 3.8M</b>
                <span className="text-[11px] text-amber-600 font-medium">9.5% gross profit margin</span>
              </div>
              <div className="p-2.5 bg-amber-50 text-amber-800 rounded-xl">
                <TrendingUp size={22} />
              </div>
            </div>
          </div>

          {/* Weekly Fuel Issued Trend (Litres) Bar Chart */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 m-0">Fuel Issued Trend (Litres)</h4>
                <span className="text-xs text-slate-500">Weekly breakdown by Petrol &amp; Diesel</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500 inline-block" /> Petrol</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-600 inline-block" /> Diesel</span>
              </div>
            </div>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fuelTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={val => `${f(val)} L`} />
                  <Bar dataKey="petrol" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Petrol" />
                  <Bar dataKey="diesel" fill="#2563eb" radius={[4, 4, 0, 0]} name="Diesel" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Interactive Report Shortcuts (All 4 are functional now!) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                title: 'Fuel Issue Report',
                desc: 'Daily log of litres issued to fishing vessels & thermal vouchers',
                action: () => setActiveView('issue')
              },
              {
                title: 'Fisherman Credit & Crew Report',
                desc: 'Outstanding balances, boat specs & registered crew rosters',
                action: () => setActiveView('accounts')
              },
              {
                title: 'Fuel Stock & Tanks Report',
                desc: 'Readings, tank dips, and location reconciliation',
                action: () => setActiveView('stock')
              },
              {
                title: 'Fuel Margin & Profitability',
                desc: 'Cost vs selling price analysis, margin per litre (TZS 350/L)',
                action: () => setMarginModalOpen(true)
              }
            ].map(r => (
              <button
                key={r.title}
                onClick={r.action}
                className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between hover:border-blue-500 hover:shadow-sm transition text-left"
              >
                <div>
                  <b className="text-xs text-slate-900 block">{r.title}</b>
                  <span className="text-[11px] text-slate-500">{r.desc}</span>
                </div>
                <ChevronRight size={16} className="text-blue-600 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. MODAL: ISSUE FUEL (DAILY) - 3 STEPS MATCHING SCREENS 3, 4, 5 */}
      {issueModalOpen && (
        <Modal
          title={issueStep === 3 ? 'Fuel Issue Receipt' : 'Issue Fuel to Fishing Boat'}
          subtitle={issueStep === 3 ? 'FishTrade ERP · Dock Dispensary' : `Step ${issueStep} of 2`}
          close={() => {
            setIssueModalOpen(false)
            setIssueStep(1)
          }}
        >
          {/* STEP 1: DETAILS */}
          {issueStep === 1 && (
            <div className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Fisherman / Captain *">
                  <select
                    value={issueForm.supId}
                    onChange={e => handleIssueSupChange(e.target.value)}
                    className="input-field font-semibold"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.no}) · {s.boat || 'Boat'}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Boat / Vessel *">
                  <select
                    value={issueForm.boatId}
                    onChange={e => setIssueForm({ ...issueForm, boatId: e.target.value })}
                    className="input-field font-mono font-bold"
                  >
                    {boats.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.regNo}) · {b.captain}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Fuel Type & Dispensary Tank *">
                  <select
                    value={issueForm.tankId}
                    onChange={e => handleIssueTankChange(e.target.value)}
                    className="input-field"
                  >
                    {tanks.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.fuel} ({t.name} - {t.location}) · TZS {f(t.sellPrice)}/L
                      </option>
                    ))}
                  </select>
                </Field>

                <div className="grid grid-cols-2 gap-2">
                  <Field label="Quantity (Litres) *">
                    <input
                      type="number"
                      value={issueForm.litres}
                      onChange={e => setIssueForm({ ...issueForm, litres: e.target.value })}
                      className="input-field font-mono font-bold"
                    />
                  </Field>
                  <Field label="Price / Litre (TZS) *">
                    <input
                      type="number"
                      value={issueForm.price}
                      onChange={e => setIssueForm({ ...issueForm, price: e.target.value })}
                      className="input-field font-mono"
                    />
                  </Field>
                </div>
              </div>

              {/* Total Amount Green Card (Exact match with design) */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-lg">
                    <FuelIcon size={20} />
                  </div>
                  <div>
                    <span className="text-[11px] text-emerald-800 font-semibold block uppercase">Total Amount</span>
                    <b className="text-xl font-black font-mono text-emerald-950">{tzs(issueTotal)}</b>
                  </div>
                </div>
                <span className="text-xs text-emerald-700 font-medium">
                  {issueForm.litres} L @ TZS {f(issueForm.price)}
                </span>
              </div>

              {/* Payment Arrangement Selector */}
              <div>
                <span className="text-xs font-bold text-slate-800 block mb-1.5">Payment Arrangement</span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'Cash', label: 'Cash' },
                    { id: 'Partial', label: 'Partial' },
                    { id: 'By Fish Delivery', label: 'By Fish Delivery' },
                    { id: 'End of Season', label: 'End of Season' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setIssueForm({ ...issueForm, arrangement: opt.id })}
                      className={`py-2 px-1.5 rounded-lg border text-center text-xs font-bold transition ${
                        issueForm.arrangement === opt.id
                          ? 'border-blue-900 bg-blue-900 text-white shadow-sm'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIssueStep(2)}
                  disabled={!(+issueForm.litres > 0)}
                  className="btn-primary"
                >
                  Next: Payment <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PAYMENT DETAILS & CONFIRMATION */}
          {issueStep === 2 && (
            <div className="flex flex-col gap-4 text-xs">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-600 font-semibold">Total Amount</span>
                <b className="text-base font-mono font-bold text-slate-900">{tzs(issueTotal)}</b>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Amount Paid Now (TZS) *">
                  <input
                    type="number"
                    value={issueForm.paid}
                    onChange={e => setIssueForm({ ...issueForm, paid: e.target.value })}
                    className="input-field font-mono font-bold text-base"
                  />
                </Field>
                <div className="flex flex-col justify-center">
                  <span className="text-xs text-slate-500 font-semibold">Outstanding Debt (Auto)</span>
                  <b className="text-lg font-mono font-black text-red-600 mt-1">{tzs(issueOutstanding)}</b>
                </div>
              </div>

              {/* Checklist / What this will do (from design screen 4) */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex flex-col gap-2">
                <span className="text-xs font-bold text-blue-950 block">This will:</span>
                <div className="space-y-1.5 text-xs text-blue-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    <span>Deduct {issueForm.litres} litres from fuel stock</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    <span>Add {tzs(issueTotal)} to {selectedSupObj?.name}'s fuel account</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    <span>Record {tzs(issuePaid)} as payment received</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    <span>Leave {tzs(issueOutstanding)} outstanding</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    <span>Save the staff and date</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setIssueStep(1)}
                  className="btn-secondary"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={submitIssueFuel}
                  className="btn-primary bg-emerald-600 hover:bg-emerald-700 font-bold"
                >
                  <Check size={16} /> Record Fuel Issue
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: FUEL ISSUE RECEIPT (Screen 5 in design) */}
          {issueStep === 3 && receiptRecord && (
            <div className="flex flex-col gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2 font-mono">
                <div className="text-center pb-2 border-b border-slate-200">
                  <b className="text-base font-bold text-blue-950 font-sans block">AquaCatch · FishTrade ERP</b>
                  <span className="text-xs text-slate-500 font-sans">Mwanza Fish Trading Co. Ltd.</span>
                  <div className="mt-1">
                    <Badge variant="green">Recorded</Badge>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Receipt No.</span>
                    <b className="text-slate-900">{receiptRecord.no}</b>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date &amp; Time</span>
                    <span className="text-slate-800">{receiptRecord.date}, {receiptRecord.time || '08:32'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fisherman / Captain</span>
                    <b className="text-slate-900 font-sans">{receiptRecord.supName} ({receiptRecord.supNo})</b>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Boat / Reg</span>
                    <b className="text-slate-900">{receiptRecord.boatReg}</b>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fuel Type</span>
                    <span className="text-slate-900">{receiptRecord.fuel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Quantity</span>
                    <b className="text-slate-900">{receiptRecord.litres} Litres</b>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Price / Litre</span>
                    <span>TZS {f(receiptRecord.price)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-sm">
                    <span className="text-slate-900">Total Amount</span>
                    <span className="text-slate-950">{tzs(receiptRecord.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Paid Now</span>
                    <span className="text-emerald-700 font-bold">{tzs(receiptRecord.paid)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1 font-bold">
                    <span className="text-red-700">Outstanding Balance</span>
                    <span className="text-red-700">{tzs(receiptRecord.balance)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1 text-[11px] text-slate-500">
                    <span>Issued By</span>
                    <span>{receiptRecord.issuedBy}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Share, Print, Done */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => alert(`Receipt ${receiptRecord.no} details copied to clipboard for SMS/WhatsApp!`)}
                  className="btn-secondary text-xs flex items-center justify-center gap-1"
                >
                  <Share2 size={13} /> Share
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-secondary text-xs flex items-center justify-center gap-1"
                >
                  <Printer size={13} /> Print
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIssueModalOpen(false)
                    setIssueStep(1)
                  }}
                  className="btn-primary text-xs flex items-center justify-center gap-1"
                >
                  <Check size={13} /> Done
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* 5. MODAL: OPERATOR CREATES FISHERMAN ACCOUNT & BOAT & ASSIGNED CREW ROSTER */}
      {createAccountModal && (
        <Modal
          title="Operator: Onboard Fisherman &amp; Vessel Account"
          subtitle="Landing Site Operator Registration · Captain KYC, Vessel Profile & Crew Members Roster"
          close={() => setCreateAccountModal(false)}
        >
          <div className="flex flex-col gap-4 text-xs">
            {/* Operator Stamp */}
            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-between">
              <span className="font-semibold">Operator: Landing Station Officer (Staff 01)</span>
              <span className="font-mono text-[11px]">{new Date().toLocaleDateString('en-GB')}</span>
            </div>

            {/* 1. Captain / Fisherman Profile */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                1. Captain &amp; Account Holder Information
              </span>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Fisherman / Captain Full Name *">
                  <input
                    type="text"
                    placeholder="e.g. Mzee Juma"
                    value={operatorForm.name}
                    onChange={e => setOperatorForm({ ...operatorForm, name: e.target.value })}
                    className="input-field font-bold"
                  />
                </Field>
                <Field label="Phone Number (M-Pesa Registered) *">
                  <input
                    type="tel"
                    placeholder="0754 123 456"
                    value={operatorForm.phone}
                    onChange={e => setOperatorForm({ ...operatorForm, phone: e.target.value })}
                    className="input-field font-mono"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <Field label="National ID (NIDA)">
                  <input
                    type="text"
                    placeholder="19820514-XXXXX"
                    value={operatorForm.nida}
                    onChange={e => setOperatorForm({ ...operatorForm, nida: e.target.value })}
                    className="input-field font-mono"
                  />
                </Field>
                <Field label="Landing BMU Station">
                  <select
                    value={operatorForm.site}
                    onChange={e => setOperatorForm({ ...operatorForm, site: e.target.value })}
                    className="input-field font-medium"
                  >
                    <option>Kigoma (Katonga BMU)</option>
                    <option>Mwanza (Kirumba Mwaloni)</option>
                    <option>Musoma (Mwigobero)</option>
                    <option>Ukerewe (Nansio)</option>
                  </select>
                </Field>
                <Field label="Credit Limit (TZS)">
                  <input
                    type="number"
                    value={operatorForm.creditLimit}
                    onChange={e => setOperatorForm({ ...operatorForm, creditLimit: e.target.value })}
                    className="input-field font-mono font-bold"
                  />
                </Field>
              </div>
            </div>

            {/* 2. Vessel Profile */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                2. Registered Fishing Vessel (Boat) Specifications
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <Field label="Boat Name *">
                  <input
                    type="text"
                    placeholder="e.g. MV Furaha"
                    value={operatorForm.boatName}
                    onChange={e => setOperatorForm({ ...operatorForm, boatName: e.target.value })}
                    className="input-field font-bold"
                  />
                </Field>
                <Field label="Registration # (TZN-XXX) *">
                  <input
                    type="text"
                    placeholder="e.g. TZN-304"
                    value={operatorForm.boatReg}
                    onChange={e => setOperatorForm({ ...operatorForm, boatReg: e.target.value })}
                    className="input-field font-mono font-bold"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <Field label="Engine Specifications">
                  <input
                    type="text"
                    value={operatorForm.engine}
                    onChange={e => setOperatorForm({ ...operatorForm, engine: e.target.value })}
                    className="input-field"
                  />
                </Field>
                <Field label="Hull Construction &amp; Length">
                  <input
                    type="text"
                    value={operatorForm.boatType}
                    onChange={e => setOperatorForm({ ...operatorForm, boatType: e.target.value })}
                    className="input-field"
                  />
                </Field>
              </div>
            </div>

            {/* 3. Assigned Crew Members Roster (Under Captain & Boat) */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-950 uppercase tracking-wider block">
                    3. Assigned Boat Crew Members (Under Captain)
                  </span>
                  <span className="text-[11px] text-blue-800">
                    Register all crew members subordinate to Captain {operatorForm.name || 'Owner'}.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddCrewInput}
                  className="px-2.5 py-1 rounded bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                >
                  <Plus size={13} /> + Add Crew Member
                </button>
              </div>

              <div className="space-y-2">
                {operatorForm.crewMembers.map((member, idx) => (
                  <div key={idx} className="p-2.5 bg-white rounded-lg border border-blue-100 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Member Name</span>
                      <input
                        type="text"
                        placeholder="e.g. Hamisi Juma"
                        value={member.name}
                        onChange={e => handleUpdateCrewField(idx, 'name', e.target.value)}
                        className="input-field text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Vessel Role</span>
                      <select
                        value={member.role}
                        onChange={e => handleUpdateCrewField(idx, 'role', e.target.value)}
                        className="input-field text-xs"
                      >
                        <option>First Mate / Net Handler</option>
                        <option>Engine Operator &amp; Mechanic</option>
                        <option>Deep Water Line Fisher</option>
                        <option>Boat Steersman / Navigator</option>
                        <option>Deck Hand / Ice Loader</option>
                        <option>Light Operator (Dagaa Night Fishing)</option>
                      </select>
                    </div>
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 block font-semibold">Phone / NIDA</span>
                        {operatorForm.crewMembers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCrewInput(idx)}
                            className="text-red-500 hover:text-red-700 text-xs font-bold"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        type="tel"
                        placeholder="0754 000 000"
                        value={member.phone}
                        onChange={e => handleUpdateCrewField(idx, 'phone', e.target.value)}
                        className="input-field text-xs font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCreateAccountModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitOperatorCreateAccount}
                disabled={!operatorForm.name.trim()}
                className="btn-primary bg-blue-900 hover:bg-blue-800 font-bold"
              >
                <Check size={16} /> Confirm &amp; Register Account
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 6. MODAL: DETAILED FISHERMAN ACCOUNT WITH CREW MEMBERS & FULL LEDGER */}
      {selectedFisherman && (() => {
        const statement = supAccountStatement(s, selectedFisherman.id)
        const boat = boats.find(b => b.ownerId === selectedFisherman.id)
        const crewList = boat?.crewMembers || []
        const supIssues = issues.filter(x => x.supId === selectedFisherman.id)
        const supBatches = s.batches.filter(b => b.sup === selectedFisherman.id)
        const supSettlements = settlements.filter(st => st.supId === selectedFisherman.id)

        return (
          <Modal
            title="Fisherman Account Profile"
            subtitle={`${selectedFisherman.name} · ${selectedFisherman.no}`}
            close={() => setSelectedFisherman(null)}
          >
            <div className="flex flex-col gap-4 text-xs">
              {/* Header Profile Banner */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-900 text-white font-black text-lg flex items-center justify-center">
                    {selectedFisherman.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 m-0">{selectedFisherman.name}</h3>
                      <Badge variant="green">Active Account</Badge>
                    </div>
                    <span className="text-xs text-slate-500 font-mono block mt-0.5">
                      {selectedFisherman.no} · Captain &amp; Boat Owner
                    </span>
                    <span className="text-[11px] text-slate-400 block">{selectedFisherman.site}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block uppercase font-semibold">Registered Vessel</span>
                  <b className="text-sm font-mono text-slate-900">{boat?.name || 'MV Furaha'} ({boat?.regNo || 'TZN-304'})</b>
                </div>
              </div>

              {/* 3 Metric Chips (Exact match with Screen 1 bottom in design) */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 bg-red-50/80 border border-red-200 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-red-700 block">Fuel Debt</span>
                  <b className="text-base font-mono font-bold text-red-700">{tzs(statement.fuelDebt)}</b>
                </div>

                <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-blue-700 block">Fish Delivered</span>
                  <b className="text-base font-mono font-bold text-blue-900">{f(selectedFisherman.totalSupplied || 4200)} kg</b>
                  <span className="text-[10px] text-slate-400 block">This month</span>
                </div>

                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-amber-800 block">Net Position</span>
                  <b className="text-base font-mono font-bold text-amber-900">
                    {statement.netBalance < 0 ? tzs(Math.abs(statement.netBalance)) + ' Owed' : tzs(statement.netBalance)}
                  </b>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="border-b border-slate-200 flex items-center gap-3 overflow-x-auto">
                {[
                  { id: 'crew', label: `Boat Crew Members (${crewList.length})` },
                  { id: 'activity', label: 'Account Activity' },
                  { id: 'fuel', label: 'Fuel Issues History' },
                  { id: 'fish', label: 'Fish Catches Landed' },
                  { id: 'settlements', label: `Settlement Vouchers (${supSettlements.length})` }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setFishermanTab(t.id)}
                    className={`pb-2 text-xs font-bold transition border-b-2 whitespace-nowrap ${
                      fishermanTab === t.id ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* TAB: CREW MEMBERS (User explicitly asked to include boat crew members after captain!) */}
              {fishermanTab === 'crew' && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <b className="text-xs text-slate-900 block">Vessel: {boat?.name || 'MV Furaha'} ({boat?.regNo || 'TZN-304'})</b>
                      <span className="text-[11px] text-slate-500">Captain / Vessel Master: {boat?.captain || selectedFisherman.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openAddCrewModal(boat, selectedFisherman)}
                      className="btn-primary text-xs flex items-center gap-1"
                    >
                      <Plus size={13} /> + Add Crew Member
                    </button>
                  </div>

                  <div className="space-y-2">
                    {crewList.map((c, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs">
                            {c.name.slice(0, 1)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <b className="text-xs text-slate-900">{c.name}</b>
                              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-semibold">
                                {c.role}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                              Phone: {c.phone || '-'} · NIDA: {c.nida || 'Verified'}
                            </span>
                          </div>
                        </div>
                        <Badge variant="green">Authorized Crew</Badge>
                      </div>
                    ))}
                    {crewList.length === 0 && (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        No additional crew registered yet. Click "+ Add Crew Member" to assign crew to this vessel.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: ACCOUNT ACTIVITY (All Transactions Table) */}
              {fishermanTab === 'activity' && (
                <div className="data-table-wrap max-h-56">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Debit (TZS)</th>
                        <th>Credit (TZS)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supIssues.map(it => (
                        <tr key={it.id}>
                          <td className="font-mono text-xs">{it.date}</td>
                          <td>Fuel Issue ({it.litres} L {it.fuel})</td>
                          <td className="font-mono text-red-600 font-bold">{tzs(it.total)}</td>
                          <td className="font-mono text-slate-400">-</td>
                        </tr>
                      ))}
                      {(s.fuelPayments || []).filter(p => p.supId === selectedFisherman.id).map(p => (
                        <tr key={p.id}>
                          <td className="font-mono text-xs">{p.date}</td>
                          <td>Cash Payment ({p.m})</td>
                          <td className="font-mono text-slate-400">-</td>
                          <td className="font-mono text-emerald-700 font-bold">{tzs(p.amt)}</td>
                        </tr>
                      ))}
                      {supSettlements.map(st => (
                        <tr key={st.id}>
                          <td className="font-mono text-xs">{st.date}</td>
                          <td>Catch Settlement Deduction ({st.no})</td>
                          <td className="font-mono text-slate-400">-</td>
                          <td className="font-mono text-emerald-700 font-bold">{tzs(st.fuelDeducted)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB: FUEL ISSUES HISTORY */}
              {fishermanTab === 'fuel' && (
                <div className="data-table-wrap max-h-56">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Receipt #</th>
                        <th>Date</th>
                        <th>Litres</th>
                        <th>Total</th>
                        <th>Paid</th>
                        <th>Arrangement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supIssues.map(it => (
                        <tr key={it.id}>
                          <td className="font-mono font-bold text-blue-900">{it.no}</td>
                          <td>{it.date}</td>
                          <td className="font-mono">{it.litres} L</td>
                          <td className="font-mono font-bold">{tzs(it.total)}</td>
                          <td className="font-mono text-emerald-700">{tzs(it.paid)}</td>
                          <td><Badge variant="blue">{it.arrangement}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB: FISH CATCHES */}
              {fishermanTab === 'fish' && (
                <div className="data-table-wrap max-h-56">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Batch #</th>
                        <th>Date</th>
                        <th>Species</th>
                        <th>Weight</th>
                        <th>Purchase Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supBatches.map(b => (
                        <tr key={b.id}>
                          <td className="font-mono font-bold text-blue-900">{b.no}</td>
                          <td>{b.date}</td>
                          <td>{b.sp}</td>
                          <td className="font-mono font-bold">{f(b.kg)} kg</td>
                          <td className="font-mono text-slate-900 font-bold">{tzs(b.kg * b.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB: SETTLEMENTS */}
              {fishermanTab === 'settlements' && (
                <div className="data-table-wrap max-h-56">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Settlement #</th>
                        <th>Date</th>
                        <th>Fish Value</th>
                        <th>Fuel Deducted</th>
                        <th>Net Paid</th>
                        <th>Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supSettlements.map(st => (
                        <tr key={st.id}>
                          <td className="font-mono font-bold text-blue-900">{st.no}</td>
                          <td>{st.date}</td>
                          <td className="font-mono">{tzs(st.fishTotal)}</td>
                          <td className="font-mono text-red-600 font-bold">-{tzs(st.fuelDeducted)}</td>
                          <td className="font-mono text-emerald-700 font-bold">{tzs(st.netPayable)}</td>
                          <td><Badge variant="blue">{st.method}</Badge></td>
                        </tr>
                      ))}
                      {supSettlements.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-4 text-slate-400">
                            No cross-settlement vouchers recorded for this fisherman yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-900">
                  Total Outstanding Fuel Debt: <b className="font-mono text-red-600">{tzs(statement.fuelDebt)}</b>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedFisherman(null)}
                  className="btn-secondary text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )
      })()}

      {/* 7. MODAL: ADD CREW MEMBER TO BOAT */}
      {newCrewModal && (
        <Modal
          title="Add Crew Member to Vessel"
          subtitle={`Assigning to ${selectedBoatForCrew?.name || 'Vessel'} (${selectedBoatForCrew?.regNo || 'TZN-XXX'})`}
          close={() => setNewCrewModal(false)}
        >
          <div className="flex flex-col gap-3 text-xs">
            <Field label="Crew Member Full Name *">
              <input
                type="text"
                placeholder="e.g. Bakari Ally"
                value={newCrew.name}
                onChange={e => setNewCrew({ ...newCrew, name: e.target.value })}
                className="input-field font-bold"
              />
            </Field>

            <Field label="Role on Vessel *">
              <select
                value={newCrew.role}
                onChange={e => setNewCrew({ ...newCrew, role: e.target.value })}
                className="input-field font-medium"
              >
                <option>First Mate / Net Handler</option>
                <option>Engine Operator &amp; Mechanic</option>
                <option>Deep Water Line Fisher</option>
                <option>Boat Steersman / Navigator</option>
                <option>Deck Hand / Ice Loader</option>
                <option>Light Operator (Dagaa Night Fishing)</option>
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Phone Number (M-Pesa)">
                <input
                  type="tel"
                  placeholder="0754 123 456"
                  value={newCrew.phone}
                  onChange={e => setNewCrew({ ...newCrew, phone: e.target.value })}
                  className="input-field font-mono"
                />
              </Field>
              <Field label="National ID (NIDA)">
                <input
                  type="text"
                  placeholder="19920518-XXXXX"
                  value={newCrew.nida}
                  onChange={e => setNewCrew({ ...newCrew, nida: e.target.value })}
                  className="input-field font-mono"
                />
              </Field>
            </div>

            <Field label="Next of Kin Contact (Safety at Lake)">
              <input
                type="text"
                placeholder="Name &amp; Phone (e.g. Asha Ally - 0714 000 111)"
                value={newCrew.kin}
                onChange={e => setNewCrew({ ...newCrew, kin: e.target.value })}
                className="input-field"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setNewCrewModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitAddCrewToExistingBoat}
                disabled={!newCrew.name.trim()}
                className="btn-primary"
              >
                Save Crew Member
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 8. MODAL: FUEL PURCHASE (FROM SUPPLIER) */}
      {purchaseModalOpen && (
        <Modal
          title="Fuel Purchase (From Bulk Supplier)"
          subtitle="Bulk delivery intake into company storage dispensary tanks"
          close={() => setPurchaseModalOpen(false)}
        >
          <div className="flex flex-col gap-4 text-xs">
            <Field label="Fuel Supplier *">
              <select
                value={purchaseForm.supName}
                onChange={e => setPurchaseForm({ ...purchaseForm, supName: e.target.value })}
                className="input-field font-bold"
              >
                <option>Lake Oil Ltd</option>
                <option>Oryx Energies Tanzania Ltd</option>
                <option>TotalEnergies Lake Zone Depot</option>
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Purchase Date">
                <input
                  type="text"
                  value={purchaseForm.date}
                  onChange={e => setPurchaseForm({ ...purchaseForm, date: e.target.value })}
                  className="input-field font-medium"
                />
              </Field>
              <Field label="Destination Tank">
                <select
                  value={purchaseForm.tankId}
                  onChange={e => {
                    const t = tanks.find(x => x.id === e.target.value)
                    setPurchaseForm({
                      ...purchaseForm,
                      tankId: e.target.value,
                      fuel: t?.fuel || 'Petrol'
                    })
                  }}
                  className="input-field font-medium"
                >
                  {tanks.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.location})
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Quantity (Litres) *">
                <input
                  type="number"
                  value={purchaseForm.litres}
                  onChange={e => setPurchaseForm({ ...purchaseForm, litres: e.target.value })}
                  className="input-field font-mono font-bold"
                />
              </Field>
              <Field label="Purchase Price / Litre (TZS) *">
                <input
                  type="number"
                  value={purchaseForm.costPerL}
                  onChange={e => setPurchaseForm({ ...purchaseForm, costPerL: e.target.value })}
                  className="input-field font-mono"
                />
              </Field>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-emerald-800 font-semibold block uppercase">Total Cost</span>
                <b className="text-lg font-black font-mono text-emerald-950">
                  {tzs((+purchaseForm.litres || 0) * (+purchaseForm.costPerL || 0))}
                </b>
              </div>
              <Badge variant="blue">{purchaseForm.fuel}</Badge>
            </div>

            <Field label="Payment Status">
              <div className="grid grid-cols-3 gap-2">
                {['Paid', 'Partial', 'Pending'].map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setPurchaseForm({ ...purchaseForm, status: st })}
                    className={`py-1.5 rounded-lg border text-center text-xs font-bold transition ${
                      purchaseForm.status === st ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Delivery Note Reference">
              <input
                type="text"
                value={purchaseForm.docRef}
                onChange={e => setPurchaseForm({ ...purchaseForm, docRef: e.target.value })}
                className="input-field font-mono"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPurchaseModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitFuelPurchase}
                className="btn-primary"
              >
                Save Purchase &amp; Restock Tank
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 9. MODAL: CROSS-SETTLEMENT (FISH & FUEL) */}
      {settlementModalOpen && (
        <Modal
          title="Settlement (Fish &amp; Fuel Deduction)"
          subtitle="Cross-settlement and fuel credit recovery from catch payout"
          close={() => setSettlementModalOpen(false)}
        >
          <div className="flex flex-col gap-4 text-xs">
            {/* Fish Purchase Details */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-900 block">Fish Purchase Details</span>
              <Field label="Select Catch Batch Landed">
                <select
                  value={selectedPurId}
                  onChange={e => setSelectedPurId(e.target.value)}
                  className="input-field font-medium"
                >
                  {samplePurchases.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.pur} · {b.sp} ({f(b.kg)} kg) · Value: {tzs(b.kg * b.price)}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="space-y-1 pt-1 text-slate-700">
                <div className="flex justify-between">
                  <span>Fisherman:</span>
                  <b className="text-slate-900">{settleSup?.name} ({settleSup?.no})</b>
                </div>
                <div className="flex justify-between">
                  <span>Fish Species:</span>
                  <b>{selectedBatch?.sp || 'Nile Perch'}</b>
                </div>
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <b className="font-mono">{f(selectedBatch?.kg || 2000)} kg</b>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1 font-bold">
                  <span>Gross Purchase Value:</span>
                  <span className="font-mono text-blue-950">{tzs(settleFishValue)}</span>
                </div>
              </div>
            </div>

            {/* Fuel Debt Summary */}
            <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl flex justify-between items-center">
              <div>
                <span className="text-red-700 font-bold block">Fuel Debt Summary</span>
                <span className="text-slate-500 text-[11px]">Active debt owed by this fisherman</span>
              </div>
              <b className="text-base font-mono font-bold text-red-700">{tzs(settleFuelDebt)}</b>
            </div>

            {/* Settlement Calculation (Exact match with Screen 4 Bottom) */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col gap-1.5">
              <span className="text-xs font-bold text-emerald-950 block">Settlement Calculation</span>
              <div className="flex justify-between text-slate-700">
                <span>Fish Purchase Amount:</span>
                <b className="font-mono">{tzs(settleFishValue)}</b>
              </div>
              <div className="flex justify-between text-red-700 font-semibold">
                <span>Less: Fuel Debt Deduction:</span>
                <b className="font-mono">-{tzs(settleDeduction)}</b>
              </div>
              <div className="flex justify-between border-t border-emerald-300 pt-1.5 text-sm font-bold text-emerald-950">
                <span>Net Payable to Fisherman:</span>
                <b className="font-mono text-emerald-800">{tzs(settleNetPayable)}</b>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSettlementModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitCrossSettlement}
                className="btn-primary bg-emerald-600 hover:bg-emerald-700 font-bold"
              >
                <Check size={16} /> Confirm Settlement &amp; Payout
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 10. MODAL: PROFIT MARGIN & UNIT ECONOMICS BREAKDOWN */}
      {marginModalOpen && (
        <Modal
          title="Fuel Margin &amp; Profitability Analysis"
          subtitle="Unit economics, buy vs sell spreads, and net gross profit contribution"
          close={() => setMarginModalOpen(false)}
        >
          <div className="flex flex-col gap-4 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-amber-800 font-semibold block uppercase text-[10px]">Average Fuel Spread</span>
                <b className="text-lg font-mono font-bold text-amber-950">TZS 350 / Litre</b>
              </div>
              <Badge variant="amber">9.5% Net Margin</Badge>
            </div>

            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Supplier Cost / L</th>
                    <th>Pump Sell / L</th>
                    <th>Spread / L</th>
                    <th>Monthly Litres</th>
                    <th>Gross Profit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><Badge variant="amber">Petrol</Badge></td>
                    <td className="font-mono">TZS 2,850</td>
                    <td className="font-mono font-bold text-blue-900">TZS 3,200</td>
                    <td className="font-mono text-emerald-700 font-bold">+TZS 350</td>
                    <td className="font-mono">7,800 L</td>
                    <td className="font-mono font-bold text-emerald-800">TZS 2,730,000</td>
                  </tr>
                  <tr>
                    <td><Badge variant="blue">Diesel</Badge></td>
                    <td className="font-mono">TZS 2,950</td>
                    <td className="font-mono font-bold text-blue-900">TZS 3,350</td>
                    <td className="font-mono text-emerald-700 font-bold">+TZS 400</td>
                    <td className="font-mono">4,700 L</td>
                    <td className="font-mono font-bold text-emerald-800">TZS 1,880,000</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan={4}>Total Net Profit Contribution</td>
                    <td className="font-mono">12,500 L</td>
                    <td className="font-mono text-emerald-800 text-sm">TZS 4,610,000</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMarginModalOpen(false)}
                className="btn-primary"
              >
                Close Analysis
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

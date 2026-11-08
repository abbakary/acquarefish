import React, { useState } from 'react'
import {
  Ship,
  Users,
  Search,
  Plus,
  Calendar,
  DollarSign,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  FileText,
  BadgeAlert,
  Fuel,
  UtensilsCrossed,
  Anchor,
  Wrench,
  Sparkles,
  ChevronRight,
  Filter,
  Check,
  X,
  CreditCard,
  Briefcase,
  History,
  Phone,
  Compass,
  Layers,
  LogOut
} from 'lucide-react'
import { useS } from '../store'
import { Modal, Field, Badge, f, tzs, fmtT } from '../ui'

export default function Crew({ go }) {
  const { s, a } = useS()
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'crew' | 'accounts' | 'history'
  const [boatSearch, setBoatSearch] = useState('')
  const [operationFilter, setOperationFilter] = useState('All')

  // Modals state
  const [createBoatModalOpen, setCreateBoatModalOpen] = useState(false)
  const [assignCrewModalOpen, setAssignCrewModalOpen] = useState(false)
  const [kibaluaModalOpen, setKibaluaModalOpen] = useState(false)
  const [exitModalOpen, setExitModalOpen] = useState(false)
  const [expenseAllocModalOpen, setExpenseAllocModalOpen] = useState(false)
  const [settleKibaluaModalOpen, setSettleKibaluaModalOpen] = useState(false)
  const [selectedKibalua, setSelectedKibalua] = useState(null)
  const [selectedCrewForExit, setSelectedCrewForExit] = useState(null)
  const [accountDetailModalOpen, setAccountDetailModalOpen] = useState(false)
  const [selectedCrewAccount, setSelectedCrewAccount] = useState(null)

  const [boatForm, setBoatForm] = useState({
    code: '',
    regNo: '',
    name: '',
    operation: 'Company-managed',
    captain: '',
    captainPhone: '',
    landingSite: 'Mwanza Main Landing (Kirumba)',
    boatType: 'Planked Wooden Mashua (10m)',
    engine: 'Yamaha Outboard 40HP 2-Stroke',
    engineHours: '0',
    fuelCapacityLitres: '120',
    status: 'Operational',
    notes: ''
  })

  const openCreateBoatModal = () => {
    const nextIdx = (s.boats || []).length + 1
    const nextCode = `FISH-${String(nextIdx).padStart(3, '0')}`
    const nextReg = `TZN-${200 + nextIdx}`
    setBoatForm({
      code: nextCode,
      regNo: nextReg,
      name: `MV Furaha 0${nextIdx}`,
      operation: 'Company-managed',
      captain: '',
      captainPhone: '',
      landingSite: s.suppliers?.[0]?.site || 'Mwanza Main Landing (Kirumba)',
      boatType: 'Planked Wooden Mashua (10m)',
      engine: 'Yamaha Outboard 40HP 2-Stroke',
      engineHours: '0',
      fuelCapacityLitres: '120',
      status: 'Operational',
      notes: 'Registered for active fishing operations and crew assignment'
    })
    setCreateBoatModalOpen(true)
  }

  const submitCreateBoat = () => {
    if (!boatForm.name.trim() || !boatForm.code.trim()) return
    a.addBoat(boatForm)
    setCreateBoatModalOpen(false)
  }

  const boats = s?.boats || []
  const assignments = s?.boatCrewAssignments || []
  const kibaluaEngagements = s?.kibaluaEngagements || []
  const exitRecords = s?.fishermanExitRecords || []
  const expenseAllocations = s?.boatExpenseAllocations || []
  
  const defaultSeason = { id: 'seas_2026_q1', code: '2026-Q1', name: 'Lake Victoria High Season 2026-Q1', status: 'Open' }
  const seasons = (s?.seasons && s.seasons.length > 0) ? s.seasons : [defaultSeason]
  const activeSeason = seasons.find(sn => sn.id === s?.activeSeasonId) || seasons[0] || defaultSeason

  // Currently selected boat
  const defaultBoat = boats[0] || {
    id: 'boat0',
    code: 'FISH-001',
    regNo: 'TZN-304',
    name: 'MV Furaha',
    captain: 'Mzee Juma',
    phone: '0754 289 110',
    operation: 'Company-managed',
    status: 'Operational',
    landingSite: 'Mwanza Main Landing (Kirumba)',
    engine: 'Yamaha Outboard 40HP 2-Stroke',
    crewMembers: []
  }
  const selectedBoatId = s?.activeBoatId || boats[0]?.id || 'boat0'
  const currentBoat = boats.find(b => b.id === selectedBoatId) || defaultBoat

  // Boat-filtered data
  const currentBoatAssignments = assignments.filter(a => a.boatId === currentBoat?.id)
  const activePermanentCrew = currentBoatAssignments.filter(a => a.status === 'Active')
  const historicalCrew = currentBoatAssignments.filter(a => a.status !== 'Active')
  const currentKibalua = kibaluaEngagements.filter(k => k.boatId === currentBoat?.id)
  const activeKibalua = currentKibalua.filter(k => k.status === 'Active')
  const completedKibalua = currentKibalua.filter(k => k.status === 'Completed')
  const currentBoatExits = exitRecords.filter(e => e.boatId === currentBoat?.id)
  const currentBoatAllocations = expenseAllocations.filter(e => e.boatId === currentBoat?.id)

  // Current Captain
  const captainAssignment = activePermanentCrew.find(c => c.position === 'Captain') || {
    fishermanName: currentBoat?.captain || 'Unassigned',
    position: 'Captain',
    phone: currentBoat?.captainPhone || currentBoat?.phone || currentBoat?.crewMembers?.[0]?.phone || '-'
  }

  // Filtered Boats for Selection / Search
  const filteredBoats = boats.filter(boat => {
    const q = (boatSearch || '').toLowerCase().trim()
    const matchesSearch =
      !q ||
      (boat.name || '').toLowerCase().includes(q) ||
      (boat.code || '').toLowerCase().includes(q) ||
      (boat.regNo || '').toLowerCase().includes(q) ||
      (boat.altReg || '').toLowerCase().includes(q) ||
      (boat.captain || '').toLowerCase().includes(q) ||
      (boat.landingSite || '').toLowerCase().includes(q) ||
      assignments.some(
        a => a.boatId === boat.id && (a.fishermanName || '').toLowerCase().includes(q)
      )

    const matchesOp =
      operationFilter === 'All' ||
      (operationFilter === 'Company-managed' && boat.operation === 'Company-managed') ||
      (operationFilter === 'BMU-managed' && boat.operation === 'BMU-managed') ||
      (operationFilter === 'Fisherman-owned' && boat.operation === 'Fisherman-owned')

    return matchesSearch && matchesOp
  })

  // Forms State
  const [crewForm, setCrewForm] = useState({
    boatId: currentBoat?.id || 'boat0',
    fishermanName: '',
    phone: '',
    nida: '',
    position: 'Crew', // 'Captain', 'First Mate', 'Engine Operator', 'Crew', 'Net Handler'
    accountType: 'Permanent',
    startDate: new Date().toISOString().slice(0, 10),
    rateAgreement: 'Standard Crew Catch Share (20%)',
    initialBalance: '0',
    notes: 'Assigned to boat crew roster'
  })

  const [kibaluaForm, setKibaluaForm] = useState({
    boatId: currentBoat?.id || 'boat0',
    fishermanName: '',
    phone: '',
    durationDays: 5,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10),
    dailyRate: '25000',
    advancePaid: '25000',
    allocatedExpenses: '0',
    notes: 'Lake Victoria night run; daily agreed rate'
  })

  const [exitForm, setExitForm] = useState({
    assignmentId: '',
    fishermanName: '',
    boatId: currentBoat?.id || 'boat0',
    lastWorkingDate: new Date().toISOString().slice(0, 10),
    reason: 'Resigned', // 'Resigned', 'Contract ended', 'Transferred to another boat', 'Dismissed', 'Temporary engagement completed', 'Other'
    outstandingAdvances: '0',
    unreturnedGear: 'None',
    finalBalanceDue: '0',
    notes: 'Crew exit clearance processed. Unsettled balance retained on central ledger.'
  })

  const [allocForm, setAllocForm] = useState({
    boatId: currentBoat?.id || 'boat0',
    date: new Date().toISOString().slice(0, 10),
    expenseType: 'Food & Catering',
    description: 'Expedition rations (Maize meal, rice, dry beans, sardines)',
    totalAmount: '100000',
    rule: 'Equal allocation', // 'Equal allocation', 'Allocation by crew days', 'Allocation by agreed percentage', 'Company-funded'
    notes: 'Split among active crew members'
  })

  const [settleForm, setSettleForm] = useState({
    completedDate: new Date().toISOString().slice(0, 10),
    finalPaymentPaid: 0,
    paymentMethod: 'Cash (Direct Disbursement)',
    notes: 'Full engagement settled & paid'
  })

  // Handlers
  const handleSelectBoat = boatId => {
    a.setActiveBoat(boatId)
    setCrewForm(prev => ({ ...prev, boatId }))
    setKibaluaForm(prev => ({ ...prev, boatId }))
    setExitForm(prev => ({ ...prev, boatId }))
    setAllocForm(prev => ({ ...prev, boatId }))
  }

  const submitAssignCrew = () => {
    if (!crewForm.fishermanName.trim()) return
    a.assignBoatCrew({
      ...crewForm,
      boatId: currentBoat?.id || 'boat0'
    })
    setAssignCrewModalOpen(false)
    setCrewForm({
      boatId: currentBoat?.id || 'boat0',
      fishermanName: '',
      phone: '',
      nida: '',
      position: 'Crew',
      accountType: 'Permanent',
      startDate: new Date().toISOString().slice(0, 10),
      rateAgreement: 'Standard Crew Catch Share (20%)',
      initialBalance: '0',
      notes: ''
    })
  }

  const submitKibalua = () => {
    if (!kibaluaForm.fishermanName.trim()) return
    const days = +kibaluaForm.durationDays || 1
    const rate = +kibaluaForm.dailyRate || 25000
    const gross = days * rate

    a.createKibaluaEngagement({
      ...kibaluaForm,
      boatId: currentBoat?.id || 'boat0',
      grossPayable: gross
    })
    setKibaluaModalOpen(false)
    setKibaluaForm({
      boatId: currentBoat?.id || 'boat0',
      fishermanName: '',
      phone: '',
      durationDays: 5,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10),
      dailyRate: '25000',
      advancePaid: '25000',
      allocatedExpenses: '0',
      notes: ''
    })
  }

  const openExitClearanceModal = crew => {
    setSelectedCrewForExit(crew)
    setExitForm({
      assignmentId: crew.id,
      fishermanName: crew.fishermanName,
      boatId: crew.boatId,
      lastWorkingDate: new Date().toISOString().slice(0, 10),
      reason: 'Resigned',
      outstandingAdvances: String(crew.balance || 0),
      unreturnedGear: 'None (Equipment returned to storekeeper)',
      finalBalanceDue: String(crew.balance || 0),
      notes: `Exit clearance for ${crew.fishermanName}. Financial balance of TZS ${f(crew.balance)} preserved on central ledger.`
    })
    setExitModalOpen(true)
  }

  const submitExitClearance = () => {
    if (!exitForm.assignmentId) return
    a.processFishermanExit(exitForm)
    setExitModalOpen(false)
    setSelectedCrewForExit(null)
  }

  const openSettleKibalua = kib => {
    setSelectedKibalua(kib)
    setSettleForm({
      completedDate: new Date().toISOString().slice(0, 10),
      finalPaymentPaid: kib.remainingPayable,
      paymentMethod: 'Cash (Direct Disbursement)',
      notes: `Settled ${kib.no} for ${kib.fishermanName}. Final amount paid: TZS ${f(kib.remainingPayable)}.`
    })
    setSettleKibaluaModalOpen(true)
  }

  const submitSettleKibalua = () => {
    if (!selectedKibalua) return
    a.completeKibaluaEngagement(selectedKibalua.id, settleForm)
    setSettleKibaluaModalOpen(false)
    setSelectedKibalua(null)
  }

  const submitExpenseAllocation = () => {
    if (!allocForm.totalAmount || +allocForm.totalAmount <= 0) return
    a.allocateBoatExpense({
      ...allocForm,
      boatId: currentBoat?.id || 'boat0'
    })
    setExpenseAllocModalOpen(false)
    setAllocForm({
      boatId: currentBoat?.id || 'boat0',
      date: new Date().toISOString().slice(0, 10),
      expenseType: 'Food & Catering',
      description: 'Expedition rations',
      totalAmount: '100000',
      rule: 'Equal allocation',
      notes: ''
    })
  }

  // Quick duration change for Kibalua
  const setKibaluaDuration = days => {
    const start = new Date(kibaluaForm.startDate)
    const end = new Date(start.getTime() + days * 864e5)
    setKibaluaForm(prev => ({
      ...prev,
      durationDays: days,
      endDate: end.toISOString().slice(0, 10)
    }))
  }

  return (
    <div className="page-body">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 m-0 flex items-center gap-2">
              <Ship className="text-blue-800" size={24} />
              Boat Crew &amp; Fisherman Account Management
            </h2>
            <Badge variant="blue">{activeSeason?.code || '2026-Q1'}</Badge>
          </div>
          <p className="text-xs text-slate-500 m-0 mt-1 max-w-3xl leading-relaxed">
            Organize fishing operations around vessels with individual fisherman financial ledgers. Manage permanent crew rosters, short-term Kibalua engagements (1, 2, 5 days), shared expense allocations, and assignment history.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openCreateBoatModal}
            className="btn-primary text-xs inline-flex items-center gap-1.5 font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
            title="Register a new fishing vessel and assign its primary captain"
          >
            <Plus size={14} /> + Register New Boat
          </button>
          <button
            onClick={() => setExpenseAllocModalOpen(true)}
            className="btn-secondary text-xs inline-flex items-center gap-1.5 font-semibold"
          >
            <UtensilsCrossed size={14} /> Allocate Shared Expense
          </button>
          <button
            onClick={() => {
              setKibaluaDuration(5)
              setKibaluaModalOpen(true)
            }}
            className="btn-secondary text-xs inline-flex items-center gap-1.5 font-bold text-amber-900 bg-amber-50 border-amber-200 hover:bg-amber-100"
          >
            <Briefcase size={14} /> + New Kibalua (1/2/5 Days)
          </button>
          <button
            onClick={() => setAssignCrewModalOpen(true)}
            className="btn-primary text-xs inline-flex items-center gap-1.5 font-bold bg-blue-700 hover:bg-blue-600 shadow-xs"
          >
            <Plus size={14} /> + Assign Permanent Crew
          </button>
        </div>
      </div>

      {/* Prominent Boat-First Omnibar & Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Boat-First Fleet Selector:
            </span>
            <div className="flex items-center gap-1.5">
              {['All', 'Company-managed', 'BMU-managed', 'Fisherman-owned'].map(op => (
                <button
                  key={op}
                  onClick={() => setOperationFilter(op)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition border ${
                    operationFilter === op
                      ? 'bg-blue-900 text-white border-blue-900'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search boat reg, name, captain, or crew..."
              value={boatSearch}
              onChange={e => setBoatSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Horizontal Vessel Scrollable Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {filteredBoats.map(boat => {
            const isSelected = boat.id === currentBoat?.id
            const boatCrew = assignments.filter(a => a.boatId === boat.id && a.status === 'Active')
            const kibaluaActive = kibaluaEngagements.filter(k => k.boatId === boat.id && k.status === 'Active')
            const totalCrewDebt = boatCrew.reduce((acc, c) => acc + (c.balance || 0), 0)

            return (
              <div
                key={boat.id}
                onClick={() => handleSelectBoat(boat.id)}
                className={`cursor-pointer rounded-xl p-3.5 border transition-all text-left relative ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-600 shadow-sm ring-1 ring-blue-500'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded">
                      {boat.code || boat.regNo}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1 m-0">{boat.name}</h3>
                  </div>
                  <Badge variant={boat.status === 'Active' || boat.status === 'Operational' ? 'green' : 'amber'}>
                    {boat.status || 'Active'}
                  </Badge>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-400">Captain:</span>
                    <b className="text-slate-800">{boat.captain || 'Unassigned'}</b>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-400">Crew Roster:</span>
                    <span className="font-semibold text-slate-800">
                      {boatCrew.length} Crew {kibaluaActive.length > 0 && <span className="text-amber-700 font-bold">(+{kibaluaActive.length} Kibalua)</span>}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-400">Operation:</span>
                    <span className="text-slate-600 font-medium text-[11px]">{boat.operation || boat.ownerType}</span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-mono">Crew Debt:</span>
                  <span className="font-mono font-bold text-red-600">
                    {totalCrewDebt > 0 ? `+${tzs(totalCrewDebt)}` : 'TZS 0'}
                  </span>
                </div>
              </div>
            )
          })}

          {/* Quick Register New Boat Card */}
          <div
            onClick={openCreateBoatModal}
            className="cursor-pointer rounded-xl p-3.5 border-2 border-dashed border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50/70 bg-emerald-50/20 transition-all flex flex-col items-center justify-center text-center group min-h-[140px]"
            title="Click to register a new boat and captain"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 group-hover:bg-emerald-200 text-emerald-800 flex items-center justify-center transition shadow-xs">
              <Plus size={18} />
            </div>
            <b className="text-xs font-bold text-emerald-950 mt-2 block">
              + Register New Boat
            </b>
            <span className="text-[11px] text-emerald-700 mt-0.5">
              Add vessel &amp; captain
            </span>
          </div>
        </div>
      </div>

      {/* Selected Boat Comprehensive Management Console */}
      {currentBoat && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Boat Banner Header */}
          <div className="p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-white shrink-0 shadow-inner">
                <Ship size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white m-0 tracking-tight">
                    {currentBoat.code || currentBoat.regNo}: {currentBoat.name}
                  </h3>
                  <Badge variant="blue">{currentBoat.operation || 'Company-managed'}</Badge>
                  <Badge variant="green">{currentBoat.status || 'Active'}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 mt-1">
                  <span>Captain: <b className="text-white">{captainAssignment.fishermanName}</b></span>
                  <span>Engine: <b className="text-white">{currentBoat.engine}</b></span>
                  <span>Landing Site: <b className="text-white">{currentBoat.landingSite || 'Main Dock'}</b></span>
                  <span>Season: <b className="text-sky-300">{activeSeason?.name || '2026-Q1'}</b></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <span className="text-[11px] text-slate-400 block uppercase tracking-wider">Active Crew on Board</span>
                <b className="text-xl font-mono text-emerald-400 font-bold">
                  {activePermanentCrew.length} Permanent {activeKibalua.length > 0 && `+ ${activeKibalua.length} Kibalua`}
                </b>
              </div>
              <button
                onClick={() => setAssignCrewModalOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-xs whitespace-nowrap"
              >
                + Add Crew
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Overview | Crew | Accounts | History) */}
          <div className="flex items-center border-b border-slate-200 px-5 bg-slate-50/60 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Layers },
              { id: 'crew', label: `Crew & Engagements (${activePermanentCrew.length + activeKibalua.length})`, icon: Users },
              { id: 'accounts', label: 'Individual Accounts & Ledger', icon: DollarSign },
              { id: 'history', label: `Assignment History (${historicalCrew.length + exitRecords.length})`, icon: History }
            ].map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-4 text-xs font-bold inline-flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                    isActive
                      ? 'border-blue-900 text-blue-950 bg-white shadow-xs'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className="p-5">
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                {/* 4 Summary KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-white">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Captain</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <b className="text-base text-slate-900">{captainAssignment.fishermanName}</b>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono block mt-1">
                      {captainAssignment.phone || currentBoat.crewMembers?.[0]?.phone || 'Mobile: Verified'}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Active Crew</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <b className="text-2xl font-mono text-slate-900">{activePermanentCrew.length}</b>
                      <span className="text-xs text-slate-500">
                        Permanent {activeKibalua.length > 0 && `(+${activeKibalua.length} Kibalua)`}
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                      Compliant vessel crew size
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Crew Debt Balance</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <b className="text-xl font-mono text-red-600 font-bold">
                        {tzs(activePermanentCrew.reduce((sum, c) => sum + (c.balance || 0), 0))}
                      </b>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Recoverable on Central Fisherman Ledger
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Season Operation</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <b className="text-base text-slate-900">{currentBoat.operation || 'Company-managed'}</b>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      Season: {activeSeason?.name || '2026-Q1'}
                    </span>
                  </div>
                </div>

                {/* 2-Column Split: Active Crew Snapshot & Recent Shared Allocations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Current Active Crew Roster */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <b className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Users size={15} className="text-blue-700" />
                        Current Assigned Fishermen ({activePermanentCrew.length})
                      </b>
                      <button
                        onClick={() => setActiveTab('crew')}
                        className="text-xs text-blue-700 font-bold hover:underline"
                      >
                        Manage Crew &rarr;
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {activePermanentCrew.map(crew => (
                        <div key={crew.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/60 transition">
                          <div>
                            <div className="flex items-center gap-2">
                              <b className="text-slate-900 text-xs">{crew.fishermanName}</b>
                              <Badge variant={crew.position === 'Captain' ? 'blue' : 'neutral'}>
                                {crew.position}
                              </Badge>
                              <Badge variant="green">{crew.accountType}</Badge>
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                              Assigned: {crew.startDate} · {crew.phone}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[11px] text-slate-400 block">Individual Balance</span>
                            <b className="font-mono text-xs text-red-600">
                              {crew.balance > 0 ? `+${tzs(crew.balance)}` : 'TZS 0'}
                            </b>
                            <span className="text-[10px] text-slate-400 block">Owed by fisherman</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shared Boat Expenses & Allocations */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <b className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <UtensilsCrossed size={15} className="text-emerald-700" />
                        Shared Boat Expenses &amp; Allocations
                      </b>
                      <button
                        onClick={() => setExpenseAllocModalOpen(true)}
                        className="text-xs text-blue-700 font-bold hover:underline"
                      >
                        + New Allocation
                      </button>
                    </div>

                    <div className="p-3.5 text-xs text-slate-600 bg-blue-50/40 border-b border-slate-200">
                      Shared costs (food rations, ice, fuel) are split transparently among crew members based on company rules and debited to their individual accounts.
                    </div>

                    <div className="divide-y divide-slate-100">
                      {currentBoatAllocations.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-xs">
                          No shared expenses recorded for this vessel yet.
                        </div>
                      ) : (
                        currentBoatAllocations.map(alloc => (
                          <div key={alloc.id} className="p-3.5 flex items-start justify-between">
                            <div>
                              <b className="text-slate-900 text-xs block">{alloc.description}</b>
                              <span className="text-[11px] text-slate-500 font-mono">
                                {alloc.date} · {alloc.expenseType} · Rule: <b>{alloc.rule}</b>
                              </span>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {alloc.splitItems?.map((sp, idx) => (
                                  <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                                    {sp.name}: {tzs(sp.amount)}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <b className="font-mono text-xs text-slate-900 font-bold">{tzs(alloc.totalAmount)}</b>
                              <span className="text-[10px] text-emerald-700 font-semibold block">Posted to Ledgers</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CREW & ENGAGEMENTS */}
            {activeTab === 'crew' && (
              <div className="space-y-6">
                {/* Section A: Permanent Crew Members */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
                        <Users size={16} className="text-blue-800" />
                        Type A: Permanent / Boat Account Fishermen
                      </h4>
                      <p className="text-xs text-slate-500 m-0 mt-0.5">
                        Regular crew assigned to {currentBoat.name} with individual accounts, advances, and seasonal settlement entitlements.
                      </p>
                    </div>
                    <button
                      onClick={() => setAssignCrewModalOpen(true)}
                      className="btn-primary text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <Plus size={14} /> + Assign Permanent Crew
                    </button>
                  </div>

                  <div className="data-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Fisherman Name</th>
                          <th>Role / Position</th>
                          <th>Account Type</th>
                          <th>Assigned Date</th>
                          <th>Trips Worked</th>
                          <th>Agreed Compensation</th>
                          <th>Individual Account Balance</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activePermanentCrew.map(crew => (
                          <tr key={crew.id} className="hover:bg-slate-50/80 transition">
                            <td className="whitespace-nowrap">
                              <b className="text-slate-900 block">{crew.fishermanName}</b>
                              <span className="text-[11px] text-slate-500 font-mono">{crew.phone || '-'}</span>
                            </td>
                            <td className="whitespace-nowrap">
                              <Badge variant={crew.position === 'Captain' ? 'blue' : 'neutral'}>
                                {crew.position}
                              </Badge>
                            </td>
                            <td className="whitespace-nowrap">
                              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                                Permanent
                              </span>
                            </td>
                            <td className="font-mono text-xs text-slate-700 whitespace-nowrap">
                              {crew.startDate}
                            </td>
                            <td className="font-mono text-xs whitespace-nowrap">
                              <b>{crew.totalTrips || 0}</b> trips ({crew.totalDeliveredKg || 0} kg)
                            </td>
                            <td className="text-xs text-slate-600 whitespace-nowrap">
                              {crew.rateAgreement}
                            </td>
                            <td className="whitespace-nowrap">
                              <b className="font-mono text-xs text-red-600 block">
                                {crew.balance > 0 ? `+${tzs(crew.balance)}` : 'TZS 0'}
                              </b>
                              <span className="text-[10px] text-slate-400 block">Owed by fisherman</span>
                            </td>
                            <td className="text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedCrewAccount(crew)
                                    setAccountDetailModalOpen(true)
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition"
                                >
                                  <FileText size={12} /> Statement
                                </button>
                                <button
                                  onClick={() => openExitClearanceModal(crew)}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold inline-flex items-center gap-1 transition"
                                >
                                  <LogOut size={12} /> Process Exit
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section B: Temporary / Kibalua Fisherman Engagements */}
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
                        <Briefcase size={16} className="text-amber-800" />
                        Type B: Temporary / Kibalua Fishermen ({currentKibalua.length})
                      </h4>
                      <p className="text-xs text-slate-500 m-0 mt-0.5">
                        Short-term fishermen engaged for 1, 2, 5 days, or custom duration. Handled with daily agreed compensation and separate settlement.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setKibaluaDuration(1)
                          setKibaluaModalOpen(true)
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold"
                      >
                        + 1-Day Kibalua
                      </button>
                      <button
                        onClick={() => {
                          setKibaluaDuration(2)
                          setKibaluaModalOpen(true)
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold"
                      >
                        + 2-Day Kibalua
                      </button>
                      <button
                        onClick={() => {
                          setKibaluaDuration(5)
                          setKibaluaModalOpen(true)
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs"
                      >
                        + 5-Day Kibalua
                      </button>
                    </div>
                  </div>

                  <div className="data-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Voucher #</th>
                          <th>Fisherman</th>
                          <th>Duration</th>
                          <th>Engagement Dates</th>
                          <th>Daily Rate</th>
                          <th>Gross Earnings</th>
                          <th>Advance Paid</th>
                          <th>Remaining Payable</th>
                          <th>Status</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentKibalua.map(kib => (
                          <tr key={kib.id} className="hover:bg-slate-50/80 transition">
                            <td className="font-mono font-bold text-blue-900 whitespace-nowrap">{kib.no}</td>
                            <td className="whitespace-nowrap">
                              <b className="text-slate-900 block">{kib.fishermanName}</b>
                              <span className="text-[11px] text-slate-500 font-mono">{kib.phone || '-'}</span>
                            </td>
                            <td className="whitespace-nowrap">
                              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                {kib.durationDays} Days ({kib.tripsCount || kib.durationDays} trips)
                              </span>
                            </td>
                            <td className="font-mono text-xs text-slate-700 whitespace-nowrap">
                              {kib.startDate} &rarr; {kib.endDate}
                            </td>
                            <td className="font-mono font-semibold whitespace-nowrap">
                              {tzs(kib.dailyRate)}/day
                            </td>
                            <td className="font-mono font-bold text-slate-900 whitespace-nowrap">
                              {tzs(kib.grossPayable)}
                            </td>
                            <td className="font-mono text-red-600 whitespace-nowrap">
                              {kib.advancePaid > 0 ? `-${tzs(kib.advancePaid)}` : 'TZS 0'}
                            </td>
                            <td className="whitespace-nowrap">
                              <b className="font-mono text-emerald-700 font-black">
                                {tzs(kib.remainingPayable)}
                              </b>
                              <span className="text-[10px] text-slate-400 block">Owed to fisherman</span>
                            </td>
                            <td className="whitespace-nowrap">
                              <Badge variant={kib.status === 'Active' ? 'amber' : 'green'}>
                                {kib.status}
                              </Badge>
                            </td>
                            <td className="text-right whitespace-nowrap">
                              {kib.status === 'Active' ? (
                                <button
                                  onClick={() => openSettleKibalua(kib)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition shadow-xs"
                                >
                                  <Check size={12} /> Settle &amp; Pay
                                </button>
                              ) : (
                                <span className="text-xs text-emerald-700 font-semibold inline-flex items-center gap-1">
                                  <CheckCircle2 size={13} /> Paid &amp; Completed
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: INDIVIDUAL ACCOUNTS & LEDGER */}
            {activeTab === 'accounts' && (
              <div className="space-y-6">
                <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl text-xs text-slate-700 space-y-1">
                  <b className="text-blue-950 font-bold block text-sm flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-blue-700" />
                    Individual Crew Financial Accounts Policy
                  </b>
                  <p className="m-0 leading-relaxed">
                    Even though multiple fishermen work on the same vessel (e.g. {currentBoat.name}), they <b>never share one financial account</b>. Each fisherman has their own ledger tracking advances received, allocated food rations, gear debt, catch earnings, and net seasonal settlement payout.
                  </p>
                </div>

                {/* Individual Crew Accounts Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {currentBoatAssignments.map(crew => (
                    <div
                      key={crew.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 hover:border-blue-400 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <b className="text-slate-900 text-sm block">{crew.fishermanName}</b>
                          <span className="text-[11px] text-slate-500 font-mono">{crew.phone || '-'}</span>
                        </div>
                        <Badge variant={crew.position === 'Captain' ? 'blue' : 'neutral'}>
                          {crew.position}
                        </Badge>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-lg space-y-1 text-xs">
                        <div className="flex items-center justify-between text-slate-500 text-[11px]">
                          <span>Account Status:</span>
                          <b className={crew.status === 'Active' ? 'text-emerald-700' : 'text-slate-500'}>
                            {crew.status}
                          </b>
                        </div>
                        <div className="flex items-center justify-between text-slate-500 text-[11px]">
                          <span>Assigned Period:</span>
                          <span className="font-mono text-slate-700">
                            {crew.startDate} &rarr; {crew.endDate || 'Active'}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                          <span className="font-bold text-slate-700">Account Balance:</span>
                          <b className="font-mono text-sm text-red-600">
                            +{tzs(crew.balance || 0)}
                          </b>
                        </div>
                        <span className="text-[10px] text-slate-400 block text-right">
                          Owed by fisherman (Advances &amp; Gear)
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedCrewAccount(crew)
                          setAccountDetailModalOpen(true)
                        }}
                        className="w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition inline-flex items-center justify-center gap-1.5"
                      >
                        <FileText size={12} /> View Detailed Ledger
                      </button>
                    </div>
                  ))}
                </div>

                {/* Shared Boat Expense Allocation Engine */}
                <div className="rounded-xl border border-slate-200 p-5 bg-slate-50/40 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-1.5">
                        <UtensilsCrossed size={16} className="text-blue-800" />
                        Shared Vessel Expense Allocation Engine
                      </h4>
                      <p className="text-xs text-slate-500 m-0 mt-0.5">
                        Post shared operational costs for {currentBoat.name} (food, ice, twine) and allocate transparently to individual crew accounts.
                      </p>
                    </div>
                    <button
                      onClick={() => setExpenseAllocModalOpen(true)}
                      className="btn-primary text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      + Allocate Shared Expense
                    </button>
                  </div>

                  <div className="data-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Expense Category</th>
                          <th>Description</th>
                          <th>Total Amount</th>
                          <th>Allocation Rule</th>
                          <th>Active Crew Share</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentBoatAllocations.map(alloc => (
                          <tr key={alloc.id}>
                            <td className="font-mono text-xs whitespace-nowrap">{alloc.date}</td>
                            <td className="whitespace-nowrap">
                              <Badge variant="blue">{alloc.expenseType}</Badge>
                            </td>
                            <td className="text-xs text-slate-700 whitespace-nowrap">{alloc.description}</td>
                            <td className="font-mono font-bold text-slate-900 whitespace-nowrap">{tzs(alloc.totalAmount)}</td>
                            <td className="whitespace-nowrap">
                              <span className="font-semibold text-xs text-slate-800">{alloc.rule}</span>
                            </td>
                            <td className="whitespace-nowrap">
                              <span className="text-xs text-slate-600 font-mono">
                                {alloc.splitItems?.length || 0} crew ({tzs(Math.round(alloc.totalAmount / (alloc.splitItems?.length || 1)))} each)
                              </span>
                            </td>
                            <td className="whitespace-nowrap">
                              <span className="text-xs text-emerald-700 font-semibold inline-flex items-center gap-1">
                                <CheckCircle2 size={12} /> Posted to Accounts
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ASSIGNMENT HISTORY & EXIT CLEARANCES */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
                  <b className="text-slate-900 font-bold block text-sm flex items-center gap-1.5">
                    <History size={16} className="text-blue-800" />
                    Assignment History &amp; Departure Preservation Policy
                  </b>
                  <p className="m-0 leading-relaxed">
                    When a fisherman leaves a vessel or the company, their historical assignments and financial records are <b>never deleted or overwritten</b>. Previous assignment periods are preserved so end-of-season settlement accurately calculates trips worked, advances, and final clearance.
                  </p>
                </div>

                {/* Historical Timeline of Changes on this Boat */}
                <div className="rounded-xl border border-slate-200 p-5 space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 m-0">
                    Vessel Crew Assignment Timeline ({currentBoat.name})
                  </h4>

                  <div className="relative pl-6 border-l-2 border-blue-200 space-y-6">
                    <div className="relative">
                      <span className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                      <div className="text-xs">
                        <span className="text-slate-400 font-mono">January 2026 · Season Opening</span>
                        <b className="text-slate-900 block text-sm mt-0.5">Initial Crew Assignment</b>
                        <p className="text-slate-600 m-0 mt-0.5">
                          John Michael (Captain), Peter Joseph (Crew), David Paulo (Crew), and Musa Ally (Crew) assigned for Lake Victoria deep water expeditions.
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-amber-500 ring-4 ring-amber-100" />
                      <div className="text-xs">
                        <span className="text-slate-400 font-mono">20 March 2026 · Departure &amp; Exit Clearance</span>
                        <b className="text-slate-900 block text-sm mt-0.5">David Paulo (Crew) Exits Vessel</b>
                        <p className="text-slate-600 m-0 mt-0.5">
                          David Paulo leaves the company to relocate to Mwanza. Formal exit clearance approved by Asha Komba (Manager). Unsettled balance of TZS 320,000 preserved on central ledger for season settlement.
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                      <div className="text-xs">
                        <span className="text-slate-400 font-mono">22 March 2026 · Replacement Onboarding</span>
                        <b className="text-slate-900 block text-sm mt-0.5">Ali Hassan Joins as Permanent Crew</b>
                        <p className="text-slate-600 m-0 mt-0.5">
                          Ali Hassan assigned to MV Furaha with 20% catch share agreement to fill the deck position.
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-purple-500 ring-4 ring-purple-100" />
                      <div className="text-xs">
                        <span className="text-slate-400 font-mono">10 April 2026 · Temporary Engagement</span>
                        <b className="text-slate-900 block text-sm mt-0.5">Hassan Omari - 5-Day Kibalua Expedition</b>
                        <p className="text-slate-600 m-0 mt-0.5">
                          Specialist night fishing Kibalua engaged for 5 days at TZS 25,000/day. Successfully completed 4 night trips; net payable TZS 100,000 recorded.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exit Clearance Records Table */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 m-0 mb-3 flex items-center gap-1.5">
                    <UserX size={16} className="text-rose-600" />
                    Formal Fisherman Exit &amp; Clearance Records ({currentBoatExits.length})
                  </h4>

                  <div className="data-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Fisherman Name</th>
                          <th>Boat</th>
                          <th>Last Working Date</th>
                          <th>Reason for Leaving</th>
                          <th>Unreturned Equipment</th>
                          <th>Outstanding Debt Balance</th>
                          <th>Approval Status</th>
                          <th>Approved By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentBoatExits.map(exit => (
                          <tr key={exit.id} className="hover:bg-slate-50/80 transition">
                            <td className="whitespace-nowrap">
                              <b className="text-slate-900 block">{exit.fishermanName}</b>
                              <span className="text-[11px] text-slate-500 font-mono">{exit.phone || '-'}</span>
                            </td>
                            <td className="font-mono text-xs whitespace-nowrap">{exit.boatName} ({exit.boatReg})</td>
                            <td className="font-mono text-xs whitespace-nowrap font-bold text-slate-700">{exit.lastWorkingDate}</td>
                            <td className="whitespace-nowrap">
                              <Badge variant="amber">{exit.reason}</Badge>
                            </td>
                            <td className="text-xs text-slate-600 whitespace-nowrap">{exit.unreturnedGear}</td>
                            <td className="font-mono text-xs font-bold text-red-600 whitespace-nowrap">
                              +{tzs(exit.finalBalanceDue)}
                            </td>
                            <td className="whitespace-nowrap">
                              <span className="text-xs font-semibold text-emerald-700 inline-flex items-center gap-1">
                                <CheckCircle2 size={13} /> {exit.status}
                              </span>
                            </td>
                            <td className="text-xs text-slate-600 whitespace-nowrap">
                              {exit.approvedBy} ({exit.approvedDate})
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: ASSIGN PERMANENT CREW */}
      {assignCrewModalOpen && (
        <Modal title={`Assign Permanent Crew to ${currentBoat?.name}`} close={() => setAssignCrewModalOpen(false)}>
          <div className="flex flex-col gap-4 text-xs">
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1">
              <b className="text-blue-950 block">Boat Assignment Policy</b>
              <span className="text-slate-600 block">
                Assign a permanent crew member or designate a vessel captain. Overlapping active permanent assignments on other vessels are automatically transferred.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Fisherman Full Name">
                <input
                  type="text"
                  placeholder="e.g. Peter Joseph"
                  value={crewForm.fishermanName}
                  onChange={e => setCrewForm({ ...crewForm, fishermanName: e.target.value })}
                  className="input-field font-semibold"
                />
              </Field>

              <Field label="Assigned Role / Position">
                <select
                  value={crewForm.position}
                  onChange={e => setCrewForm({ ...crewForm, position: e.target.value })}
                  className="input-field font-bold"
                >
                  <option value="Captain">Captain / Vessel Master</option>
                  <option value="First Mate">First Mate (Msaidizi wa Nahodha)</option>
                  <option value="Engine Operator">Engine Operator &amp; Mechanic</option>
                  <option value="Net Handler">Net Handler / Hauler</option>
                  <option value="Crew">Deck Crew Member</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone / Mobile Money">
                <input
                  type="text"
                  placeholder="e.g. 0768 221 405"
                  value={crewForm.phone}
                  onChange={e => setCrewForm({ ...crewForm, phone: e.target.value })}
                  className="input-field font-mono"
                />
              </Field>

              <Field label="NIDA National ID">
                <input
                  type="text"
                  placeholder="e.g. 19880415-33102-00021"
                  value={crewForm.nida}
                  onChange={e => setCrewForm({ ...crewForm, nida: e.target.value })}
                  className="input-field font-mono"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Assignment Start Date">
                <input
                  type="date"
                  value={crewForm.startDate}
                  onChange={e => setCrewForm({ ...crewForm, startDate: e.target.value })}
                  className="input-field font-mono"
                />
              </Field>

              <Field label="Catch Sharing Agreement">
                <select
                  value={crewForm.rateAgreement}
                  onChange={e => setCrewForm({ ...crewForm, rateAgreement: e.target.value })}
                  className="input-field"
                >
                  <option>Standard Crew Catch Share (20%)</option>
                  <option>Vessel Master Catch Share (40%) + Allowance</option>
                  <option>First Mate Share (25%)</option>
                  <option>BMU Fixed Agreement</option>
                  <option>Daily Guaranteed Stipend</option>
                </select>
              </Field>
            </div>

            <Field label="Initial Ledger Balance (TZS)">
              <input
                type="number"
                placeholder="0"
                value={crewForm.initialBalance}
                onChange={e => setCrewForm({ ...crewForm, initialBalance: e.target.value })}
                className="input-field font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Any pre-existing advance or onboarding loan debited to the fisherman's account.
              </span>
            </Field>

            <Field label="Assignment Notes">
              <textarea
                rows={2}
                value={crewForm.notes}
                onChange={e => setCrewForm({ ...crewForm, notes: e.target.value })}
                placeholder="Notes on experience, fishing specialty, or previous vessel..."
                className="input-field"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setAssignCrewModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={submitAssignCrew}
                className="btn-primary bg-blue-700 hover:bg-blue-600 font-bold inline-flex items-center gap-1.5"
              >
                <Check size={14} /> Confirm Crew Assignment
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: REGISTER KIBALUA TEMPORARY ENGAGEMENT */}
      {kibaluaModalOpen && (
        <Modal title={`Register Kibalua (Temporary Engagement) · ${currentBoat?.name}`} close={() => setKibaluaModalOpen(false)}>
          <div className="flex flex-col gap-4 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <b className="text-amber-950 block font-bold">Kibalua Short-Term Engagement Workflow</b>
              <span className="text-slate-600 block">
                Engage temporary fishermen for 1, 2, 5 days, or custom duration. Daily agreed rates and individual advances are tracked separately without making them permanent crew.
              </span>
            </div>

            <Field label="Fisherman Full Name">
              <input
                type="text"
                placeholder="e.g. Ali Hassan or Kassim Said"
                value={kibaluaForm.fishermanName}
                onChange={e => setKibaluaForm({ ...kibaluaForm, fishermanName: e.target.value })}
                className="input-field font-semibold"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone / Mobile Money">
                <input
                  type="text"
                  placeholder="0769 334 118"
                  value={kibaluaForm.phone}
                  onChange={e => setKibaluaForm({ ...kibaluaForm, phone: e.target.value })}
                  className="input-field font-mono"
                />
              </Field>

              <Field label="Duration Preset">
                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 5].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setKibaluaDuration(d)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${
                        kibaluaForm.durationDays === d
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {d} Day{d > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Date">
                <input
                  type="date"
                  value={kibaluaForm.startDate}
                  onChange={e => setKibaluaForm({ ...kibaluaForm, startDate: e.target.value })}
                  className="input-field font-mono"
                />
              </Field>

              <Field label="Expected End Date">
                <input
                  type="date"
                  value={kibaluaForm.endDate}
                  onChange={e => setKibaluaForm({ ...kibaluaForm, endDate: e.target.value })}
                  className="input-field font-mono"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Daily Agreed Rate (TZS)">
                <input
                  type="number"
                  value={kibaluaForm.dailyRate}
                  onChange={e => setKibaluaForm({ ...kibaluaForm, dailyRate: e.target.value })}
                  className="input-field font-mono font-bold"
                />
              </Field>

              <Field label="Advance Paid Today (TZS)">
                <input
                  type="number"
                  value={kibaluaForm.advancePaid}
                  onChange={e => setKibaluaForm({ ...kibaluaForm, advancePaid: e.target.value })}
                  className="input-field font-mono text-red-600 font-bold"
                />
              </Field>
            </div>

            {/* Live Calculation Preview Card */}
            <div className="p-3 bg-slate-100 rounded-xl space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Duration:</span>
                <b>{kibaluaForm.durationDays} Days @ {tzs(kibaluaForm.dailyRate)}/day</b>
              </div>
              <div className="flex justify-between text-slate-800">
                <span>Gross Expected Earnings:</span>
                <b>{tzs((+kibaluaForm.durationDays || 1) * (+kibaluaForm.dailyRate || 0))}</b>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Less Advance Disbursed:</span>
                <b>-{tzs(+kibaluaForm.advancePaid || 0)}</b>
              </div>
              <div className="pt-1.5 border-t border-slate-300 flex justify-between text-emerald-800 font-bold text-sm">
                <span>Net Payable at Completion:</span>
                <b>
                  {tzs(
                    Math.max(
                      0,
                      (+kibaluaForm.durationDays || 1) * (+kibaluaForm.dailyRate || 0) -
                        (+kibaluaForm.advancePaid || 0)
                    )
                  )}
                </b>
              </div>
            </div>

            <Field label="Engagement Notes">
              <textarea
                rows={2}
                value={kibaluaForm.notes}
                onChange={e => setKibaluaForm({ ...kibaluaForm, notes: e.target.value })}
                placeholder="Specialty tasks, night run schedule, or landing beach agreement..."
                className="input-field"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setKibaluaModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={submitKibalua}
                className="btn-primary bg-amber-600 hover:bg-amber-700 font-bold inline-flex items-center gap-1.5"
              >
                <Check size={14} /> Register Kibalua Engagement
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: SETTLE KIBALUA */}
      {settleKibaluaModalOpen && selectedKibalua && (
        <Modal title={`Settle Kibalua Payment: ${selectedKibalua.no}`} close={() => setSettleKibaluaModalOpen(false)}>
          <div className="flex flex-col gap-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <b className="text-slate-900 block text-sm">{selectedKibalua.fishermanName}</b>
              <span className="text-slate-500 font-mono block">
                Vessel: {selectedKibalua.boatName} ({selectedKibalua.boatReg}) · {selectedKibalua.durationDays} Days ({selectedKibalua.startDate} to {selectedKibalua.endDate})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="p-3 bg-slate-100 rounded-xl">
                <span className="text-[11px] text-slate-500 block">Gross Agreed Earnings:</span>
                <b className="text-sm text-slate-900">{tzs(selectedKibalua.grossPayable)}</b>
              </div>
              <div className="p-3 bg-red-50 rounded-xl">
                <span className="text-[11px] text-red-600 block">Advances Already Paid:</span>
                <b className="text-sm text-red-700">-{tzs(selectedKibalua.advancePaid)}</b>
              </div>
            </div>

            <Field label="Final Net Settlement Amount (TZS)">
              <input
                type="number"
                value={settleForm.finalPaymentPaid}
                onChange={e => setSettleForm({ ...settleForm, finalPaymentPaid: e.target.value })}
                className="input-field font-mono font-black text-emerald-700 text-base"
              />
            </Field>

            <Field label="Payment Disbursement Method">
              <select
                value={settleForm.paymentMethod}
                onChange={e => setSettleForm({ ...settleForm, paymentMethod: e.target.value })}
                className="input-field font-semibold"
              >
                <option>Cash (Direct Disbursement)</option>
                <option>M-Pesa (Mobile Money)</option>
                <option>Airtel Money</option>
                <option>Bank Transfer / Agency</option>
              </select>
            </Field>

            <Field label="Settlement Notes &amp; Sign-off">
              <textarea
                rows={2}
                value={settleForm.notes}
                onChange={e => setSettleForm({ ...settleForm, notes: e.target.value })}
                className="input-field"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setSettleKibaluaModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={submitSettleKibalua}
                className="btn-primary bg-emerald-600 hover:bg-emerald-700 font-bold inline-flex items-center gap-1.5"
              >
                <Check size={14} /> Confirm &amp; Complete Payment
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 4: PROCESS FISHERMAN EXIT & CLEARANCE */}
      {exitModalOpen && selectedCrewForExit && (
        <Modal title={`Process Exit Clearance · ${selectedCrewForExit.fishermanName}`} close={() => setExitModalOpen(false)}>
          <div className="flex flex-col gap-4 text-xs">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <b className="text-rose-950 block font-bold">Historical Preservation Exit Policy</b>
              <span className="text-slate-600 block">
                Closing an assignment does NOT delete the fisherman or wipe their financial transactions. Unpaid debts or final settlement entitlements remain visible and audited.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Last Working Date">
                <input
                  type="date"
                  value={exitForm.lastWorkingDate}
                  onChange={e => setExitForm({ ...exitForm, lastWorkingDate: e.target.value })}
                  className="input-field font-mono font-bold"
                />
              </Field>

              <Field label="Reason for Leaving Vessel">
                <select
                  value={exitForm.reason}
                  onChange={e => setExitForm({ ...exitForm, reason: e.target.value })}
                  className="input-field font-semibold"
                >
                  <option value="Resigned">Resigned / Voluntary Departure</option>
                  <option value="Contract ended">Contract / Season Agreement Ended</option>
                  <option value="Transferred to another boat">Transferred to Another Fleet Vessel</option>
                  <option value="Dismissed">Dismissed / Terminated for Cause</option>
                  <option value="Temporary engagement completed">Temporary Engagement Completed</option>
                  <option value="Other">Other / Personal Circumstances</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Unsettled Ledger Debt (TZS)">
                <input
                  type="number"
                  value={exitForm.outstandingAdvances}
                  onChange={e => setExitForm({ ...exitForm, outstandingAdvances: e.target.value })}
                  className="input-field font-mono font-bold text-red-600"
                />
              </Field>

              <Field label="Unreturned Equipment Check">
                <input
                  type="text"
                  value={exitForm.unreturnedGear}
                  onChange={e => setExitForm({ ...exitForm, unreturnedGear: e.target.value })}
                  placeholder="e.g. 2 nets returned, 1 lantern missing"
                  className="input-field"
                />
              </Field>
            </div>

            <Field label="Exit &amp; Clearance Notes">
              <textarea
                rows={2}
                value={exitForm.notes}
                onChange={e => setExitForm({ ...exitForm, notes: e.target.value })}
                className="input-field"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setExitModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={submitExitClearance}
                className="btn-primary bg-rose-700 hover:bg-rose-800 font-bold inline-flex items-center gap-1.5"
              >
                <Check size={14} /> Approve Exit &amp; Preserve Records
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 5: ALLOCATE SHARED BOAT EXPENSE */}
      {expenseAllocModalOpen && (
        <Modal title={`Allocate Shared Boat Expense · ${currentBoat?.name}`} close={() => setExpenseAllocModalOpen(false)}>
          <div className="flex flex-col gap-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <b className="text-slate-900 block font-bold">Shared Cost Allocation Policy</b>
              <span className="text-slate-600 block">
                Expenses incurred for the whole vessel (food, fuel, gear maintenance) are distributed transparently across active crew members.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Expense Date">
                <input
                  type="date"
                  value={allocForm.date}
                  onChange={e => setAllocForm({ ...allocForm, date: e.target.value })}
                  className="input-field font-mono"
                />
              </Field>

              <Field label="Expense Category">
                <select
                  value={allocForm.expenseType}
                  onChange={e => setAllocForm({ ...allocForm, expenseType: e.target.value })}
                  className="input-field font-semibold"
                >
                  <option value="Food & Catering">Food &amp; Catering (Rations / Cook)</option>
                  <option value="Shared Fuel">Shared Expedition Fuel</option>
                  <option value="Net & Gear Repair">Net &amp; Gear Maintenance</option>
                  <option value="Vessel Ice & Preservation">Ice &amp; Cold Preservation</option>
                  <option value="Other Operational Cost">Other Operational Expense</option>
                </select>
              </Field>
            </div>

            <Field label="Expense Description">
              <input
                type="text"
                value={allocForm.description}
                onChange={e => setAllocForm({ ...allocForm, description: e.target.value })}
                placeholder="e.g. Expedition rations for 3-day run"
                className="input-field"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Total Amount (TZS)">
                <input
                  type="number"
                  value={allocForm.totalAmount}
                  onChange={e => setAllocForm({ ...allocForm, totalAmount: e.target.value })}
                  className="input-field font-mono font-bold"
                />
              </Field>

              <Field label="Allocation Rule">
                <select
                  value={allocForm.rule}
                  onChange={e => setAllocForm({ ...allocForm, rule: e.target.value })}
                  className="input-field font-semibold"
                >
                  <option value="Equal allocation">Equal allocation (split evenly)</option>
                  <option value="Allocation by crew days">Allocation by crew days</option>
                  <option value="Allocation by agreed percentage">Allocation by agreed percentage</option>
                  <option value="Company-funded">Company-funded (no fisherman deduction)</option>
                </select>
              </Field>
            </div>

            {/* Live Distribution Preview */}
            <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
              <span className="font-bold text-blue-950 block">Live Preview of Deductions per Crew Member:</span>
              <div className="space-y-1">
                {activePermanentCrew.map(c => {
                  const share =
                    allocForm.rule === 'Company-funded'
                      ? 0
                      : Math.round((+allocForm.totalAmount || 0) / (activePermanentCrew.length || 1))
                  return (
                    <div key={c.id} className="flex justify-between font-mono text-xs text-slate-700">
                      <span>{c.fishermanName} ({c.position}):</span>
                      <b className={share > 0 ? 'text-red-600' : 'text-slate-400'}>
                        {share > 0 ? `+${tzs(share)}` : 'TZS 0 (Company Absorbed)'}
                      </b>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setExpenseAllocModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={submitExpenseAllocation}
                className="btn-primary bg-blue-700 hover:bg-blue-600 font-bold inline-flex items-center gap-1.5"
              >
                <Check size={14} /> Post Shared Allocation to Ledgers
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 6: DETAILED INDIVIDUAL CREW ACCOUNT STATEMENT */}
      {accountDetailModalOpen && selectedCrewAccount && (
        <Modal
          title={`Individual Fisherman Account: ${selectedCrewAccount.fishermanName}`}
          close={() => {
            setAccountDetailModalOpen(false)
            setSelectedCrewAccount(null)
          }}
        >
          <div className="flex flex-col gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between">
              <div>
                <b className="text-slate-900 text-sm block">{selectedCrewAccount.fishermanName}</b>
                <span className="text-slate-500 font-mono text-[11px]">
                  Role: {selectedCrewAccount.position} · Vessel: {selectedCrewAccount.boatName} ({selectedCrewAccount.boatReg})
                </span>
                <span className="text-slate-400 font-mono text-[11px] block mt-0.5">
                  Assigned Date: {selectedCrewAccount.startDate} · Phone: {selectedCrewAccount.phone || '-'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Current Ledger Balance</span>
                <b className="font-mono text-base text-red-600 font-bold">
                  +{tzs(selectedCrewAccount.balance || 0)}
                </b>
                <span className="text-[10px] text-slate-500 block">Owed by Fisherman to Company</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-900 block text-xs">Active Season Breakdown &amp; Recoverables:</span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-100 rounded-lg">
                  <span className="text-slate-500 text-[10px] block">Cash Advances Received:</span>
                  <b className="text-slate-900">
                    {tzs(Math.round((selectedCrewAccount.balance || 0) * 0.6))}
                  </b>
                </div>
                <div className="p-2.5 bg-slate-100 rounded-lg">
                  <span className="text-slate-500 text-[10px] block">Allocated Food &amp; Catering:</span>
                  <b className="text-slate-900">
                    {tzs(Math.round((selectedCrewAccount.balance || 0) * 0.25))}
                  </b>
                </div>
                <div className="p-2.5 bg-slate-100 rounded-lg">
                  <span className="text-slate-500 text-[10px] block">Gear &amp; Twine Debt:</span>
                  <b className="text-slate-900">
                    {tzs(Math.round((selectedCrewAccount.balance || 0) * 0.15))}
                  </b>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-lg">
                  <span className="text-emerald-700 text-[10px] block">Catch Deliveries Worked:</span>
                  <b className="text-emerald-800">
                    {selectedCrewAccount.totalTrips || 38} trips ({selectedCrewAccount.totalDeliveredKg || 3900} kg)
                  </b>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setAccountDetailModalOpen(false)
                  setSelectedCrewAccount(null)
                }}
                className="btn-secondary"
              >
                Close Statement
              </button>
              <button
                type="button"
                onClick={() => {
                  setAccountDetailModalOpen(false)
                  go('settlement')
                }}
                className="btn-primary bg-blue-700 hover:bg-blue-600 font-bold inline-flex items-center gap-1.5"
              >
                Go to Season Settlement &rarr;
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 7: REGISTER / CREATE NEW FISHING BOAT */}
      {createBoatModalOpen && (
        <Modal
          title="Register New Fishing Boat / Vessel"
          close={() => setCreateBoatModalOpen(false)}
        >
          <div className="flex flex-col gap-4 text-xs">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Ship size={20} />
              </div>
              <div>
                <b className="text-emerald-950 text-xs block">Boat-First Operational Unit Setup</b>
                <span className="text-emerald-800 text-[11px] leading-tight block">
                  Registering a vessel activates its individual vessel ledger, automatically assigns its primary captain to the crew roster, and enables immediate tracking of fuel, food, gear, and catch deliveries.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Vessel Internal Code *">
                <input
                  type="text"
                  value={boatForm.code}
                  onChange={e => setBoatForm({ ...boatForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. FISH-005"
                  className="input-field font-mono font-bold uppercase"
                  required
                />
              </Field>

              <Field label="Government Registration # (TZN)">
                <input
                  type="text"
                  value={boatForm.regNo}
                  onChange={e => setBoatForm({ ...boatForm, regNo: e.target.value.toUpperCase() })}
                  placeholder="e.g. TZN-501"
                  className="input-field font-mono uppercase"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Vessel Name *">
                <input
                  type="text"
                  value={boatForm.name}
                  onChange={e => setBoatForm({ ...boatForm, name: e.target.value })}
                  placeholder="e.g. MV Ziwa Star"
                  className="input-field font-bold"
                  required
                />
              </Field>

              <Field label="Operation &amp; Ownership Model">
                <select
                  value={boatForm.operation}
                  onChange={e => setBoatForm({ ...boatForm, operation: e.target.value })}
                  className="input-field font-semibold"
                >
                  <option value="Company-managed">Company-managed (Company Fleet)</option>
                  <option value="BMU-managed">BMU-managed (Community Group)</option>
                  <option value="Fisherman-owned">Fisherman-owned (Contracted Partner)</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Assigned Boat Captain Name">
                <input
                  type="text"
                  value={boatForm.captain}
                  onChange={e => setBoatForm({ ...boatForm, captain: e.target.value })}
                  placeholder="e.g. Capt. Omari Juma"
                  className="input-field font-semibold"
                />
              </Field>

              <Field label="Captain Phone / Contact">
                <input
                  type="text"
                  value={boatForm.captainPhone}
                  onChange={e => setBoatForm({ ...boatForm, captainPhone: e.target.value })}
                  placeholder="e.g. +255 754 123 456"
                  className="input-field font-mono"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Home Landing Site">
                <select
                  value={boatForm.landingSite}
                  onChange={e => setBoatForm({ ...boatForm, landingSite: e.target.value })}
                  className="input-field"
                >
                  <option value="Mwanza Main Landing (Kirumba)">Mwanza Main Landing (Kirumba)</option>
                  <option value="Kigoma Landing Site">Kigoma Landing Site</option>
                  <option value="Musoma Port Landing">Musoma Port Landing</option>
                  <option value="Bukoba Port Facility">Bukoba Port Facility</option>
                </select>
              </Field>

              <Field label="Propulsion Engine &amp; Outboard">
                <select
                  value={boatForm.engine}
                  onChange={e => setBoatForm({ ...boatForm, engine: e.target.value })}
                  className="input-field"
                >
                  <option value="Yamaha Outboard 40HP 2-Stroke">Yamaha Outboard 40HP 2-Stroke</option>
                  <option value="Yamaha Outboard 15HP 2-Stroke">Yamaha Outboard 15HP 2-Stroke</option>
                  <option value="Tohatsu Outboard 25HP">Tohatsu Outboard 25HP</option>
                  <option value="Inboard Diesel Yanmar 55HP">Inboard Diesel Yanmar 55HP</option>
                  <option value="Paddle / Sail Rig">Paddle / Sail Rig</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Vessel Type">
                <select
                  value={boatForm.boatType}
                  onChange={e => setBoatForm({ ...boatForm, boatType: e.target.value })}
                  className="input-field text-xs"
                >
                  <option value="Planked Wooden Mashua (10m)">Planked Wooden Mashua (10m)</option>
                  <option value="Fiberglass Dhow (8m)">Fiberglass Dhow (8m)</option>
                  <option value="Steel Hull Trawler (14m)">Steel Hull Trawler (14m)</option>
                  <option value="Traditional Canoe (Ngalawa)">Traditional Canoe (Ngalawa)</option>
                </select>
              </Field>

              <Field label="Fuel Capacity (Litres)">
                <input
                  type="number"
                  value={boatForm.fuelCapacityLitres}
                  onChange={e => setBoatForm({ ...boatForm, fuelCapacityLitres: e.target.value })}
                  className="input-field font-mono"
                />
              </Field>

              <Field label="Operational Status">
                <select
                  value={boatForm.status}
                  onChange={e => setBoatForm({ ...boatForm, status: e.target.value })}
                  className="input-field font-bold text-xs"
                >
                  <option value="Operational">Operational</option>
                  <option value="Standby">Standby</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
              </Field>
            </div>

            <Field label="Operational Notes / Permitting">
              <input
                type="text"
                value={boatForm.notes}
                onChange={e => setBoatForm({ ...boatForm, notes: e.target.value })}
                placeholder="e.g. Registered with Beach Management Unit (BMU); seasonal deep-lake permit"
                className="input-field"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCreateBoatModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitCreateBoat}
                disabled={!boatForm.name.trim() || !boatForm.code.trim()}
                className="btn-primary bg-emerald-600 hover:bg-emerald-500 font-bold inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check size={14} /> Register &amp; Activate Vessel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

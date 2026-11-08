import React, { useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts'
import {
  Fish,
  Scale,
  Anchor,
  Truck,
  Warehouse,
  ShieldAlert,
  ShieldCheck,
  DollarSign,
  Users,
  Building2,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  ExternalLink,
  Fuel as FuelIcon,
  Wrench,
  UtensilsCrossed,
  Banknote,
  FileText
} from 'lucide-react'
import {
  useS,
  stock,
  supBal,
  cusBal,
  supFuelDebt,
  supMaintDebt,
  supAccountStatement,
  ROLES,
  nowL,
  trCost
} from '../store'
import { f, tzs, fmtT, atOf, FishPhoto, Badge } from '../ui'

const SPECIES_COLORS = {
  'Nile Perch': '#0284c7',
  'Tilapia': '#ea580c',
  'Dagaa (Sardines)': '#10b981',
  'Catfish': '#6366f1'
}

export default function Home({ go }) {
  const { s, T, B } = useS()
  const role = s.role
  const can = k => !ROLES[role] || ROLES[role].includes(k)

  const activeSeason = (s.seasons || []).find(sn => sn.id === s.activeSeasonId) || s.seasons?.[0] || { id: 'seas_2026_q1', code: '2026-Q1', name: 'Lake Victoria High Season 2026-Q1', status: 'Open' }
  const st = stock(s)
  const inStock = Object.values(st).reduce((a, b) => a + b, 0)
  const bought = s.batches.reduce((a, b) => a + b.kg, 0)
  const boughtTotal = s.batches.reduce((a, b) => a + (b.kg * b.price), 0)
  const sold = s.sales.reduce((a, x) => a + x.kg, 0)
  const rev = s.sales.reduce((a, x) => a + x.kg * x.price, 0)
  const cogs = s.sales.reduce((a, x) => a + x.cogs, 0)
  const grossProfit = rev - cogs
  const tr = trCost(s)
  const exp0 = s.exps.reduce((a, e) => a + e.amt, 0) + s.batches.reduce((a, b) => a + (b.waste || 0) * b.price, 0)
  const netProfit = grossProfit - exp0 - tr

  const due = s.suppliers.reduce((a, x) => a + supBal(s, x.id), 0)
  const debt = s.customers.reduce((a, x) => a + cusBal(s, x.id), 0)
  const pend = s.batches.filter(b => b.st === 'pending')
  const lim = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10)
  const expiring = s.comp.filter(c => c.exp < lim)

  // Central Financial Ledger calculations
  const totalRecoverableDebt = (s.suppliers || []).reduce((sum, sup) => {
    const stmt = supAccountStatement(s, sup.id)
    return sum + (stmt.totalDebt || 0)
  }, 0)

  const fishersWithDebtCount = (s.suppliers || []).filter(sup => {
    const stmt = supAccountStatement(s, sup.id)
    return (stmt.totalDebt || 0) > 0
  }).length

  // Operational metrics
  const totalFuelIssuedLitres = (s.fuelIssues || []).reduce((sum, f) => sum + (f.litres || 0), 0)
  const totalFuelRemainingLitres = (s.fuelTanks || []).reduce((sum, t) => sum + (t.current || 0), 0)
  const operationalBoatsCount = (s.boats || []).filter(b => b.status === 'Operational').length
  const underMaintBoatsCount = (s.boats || []).filter(b => b.status === 'Under Maintenance').length
  const activeGearIssuesCount = (s.gearIssues || []).filter(g => g.status === 'Issued').length
  const gearCatalogCount = (s.gearItems || []).length
  const cateringTotalSpent = (s.cateringExpenses || []).reduce((sum, c) => sum + (c.totalSpent || 0), 0)
  const cateringMoneyReturned = (s.cookAdvances || []).reduce((sum, a) => sum + (a.moneyReturned || 0), 0)
  const pendingAdvancesCount = (s.advances || []).filter(a => a.status === 'Pending Approval').length
  const pendingAdvancesSum = (s.advances || []).filter(a => a.status === 'Pending Approval').reduce((sum, a) => sum + (a.amount || 0), 0)
  const settlementsCount = (s.settlements || []).length
  const settlementsDisbursed = (s.settlements || []).reduce((sum, st) => sum + (st.netPayable || 0), 0)
  const companyExpensesTotal = s.exps.reduce((sum, e) => sum + e.amt, 0) + (s.boatCostLedger || []).filter(c => c.allocation === 'Company-funded').reduce((sum, c) => sum + c.cost, 0)
  const seasonOperatingCosts = (s.boatCostLedger || []).reduce((sum, b) => sum + (b.cost || 0), 0) + companyExpensesTotal

  // Chart data: 4-week Purchasing vs Sales Volume
  const volumeData = [
    { name: 'Week 1', purchased: 2800, sold: 1900 },
    { name: 'Week 2', purchased: 3200, sold: 2300 },
    { name: 'Week 3', purchased: 3000, sold: 2200 },
    { name: 'Week 4', purchased: Math.round(bought * 0.32), sold: Math.round(sold * 0.35) }
  ]

  // Species distribution data
  const speciesData = Object.entries(
    s.batches.reduce((acc, b) => {
      acc[b.sp] = (acc[b.sp] || 0) + b.kg
      return acc
    }, {})
  ).map(([name, value]) => ({
    name,
    value,
    color: SPECIES_COLORS[name] || '#3b82f6'
  }))

  return (
    <div className="page-body">
      {/* High-Impact Maritime Operational Banner with Crystal Clear Imagery */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-700/60 shadow-md">
        <img
          src="/landing/hero.jpg"
          alt="Lake Victoria Fisheries"
          className="w-full h-48 md:h-56 object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent p-5 md:p-7 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-blue-700/90 text-white shadow text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
              {B.name} · Lake Victoria Region
            </span>
          </div>
          <div className="max-w-xl">
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-1 drop-shadow-sm">
              Fisheries Procurement &amp; Cold Chain ERP
            </h2>
            <p className="text-xs md:text-sm text-slate-100 drop-shadow-sm max-w-lg">
              Centralized monitoring for artisanal landing collections, digital scale weighing, quality grading, and direct factory deliveries.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            {can('buy') && (
              <button
                onClick={() => go('buy')}
                className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-500 font-bold shadow"
              >
                <Plus size={14} /> New Fish Purchase
              </button>
            )}
            {can('stock') && (
              <button
                onClick={() => go('stock')}
                className="btn-secondary text-xs bg-slate-900/80 hover:bg-slate-900 text-white border-white/30 backdrop-blur-sm"
              >
                <Warehouse size={14} /> View Cold Rooms ({f(inStock)} kg)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Visual Operational Flow Cards with Clean High-Res Photos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          onClick={() => go('buy')}
          className="panel p-0 overflow-hidden cursor-pointer hover:border-blue-400 hover:shadow-md transition group"
        >
          <div className="h-28 overflow-hidden relative bg-slate-100">
            <img
              src="/photos/scale-dock.png"
              alt="Digital Dock Scale"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <span className="absolute bottom-1.5 left-1.5 bg-slate-900/80 text-emerald-400 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold backdrop-blur-sm">
              SCALE TERMINAL
            </span>
          </div>
          <div className="p-2.5">
            <b className="text-xs text-slate-900 block truncate group-hover:text-blue-800">1. Dock Weighing</b>
            <small className="text-[11px] text-slate-500 block truncate">Tare, Gross, Net digital scale</small>
          </div>
        </div>

        <div
          onClick={() => go('quality')}
          className="panel p-0 overflow-hidden cursor-pointer hover:border-blue-400 hover:shadow-md transition group"
        >
          <div className="h-28 overflow-hidden relative bg-slate-100">
            <img
              src="/photos/quality-inspection.png"
              alt="Factory Quality Inspection"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <span className="absolute bottom-1.5 left-1.5 bg-slate-900/80 text-blue-300 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold backdrop-blur-sm">
              HACCP LAB
            </span>
          </div>
          <div className="p-2.5">
            <b className="text-xs text-slate-900 block truncate group-hover:text-blue-800">2. Quality Grading</b>
            <small className="text-[11px] text-slate-500 block truncate">Temp &lt; 4°C, Grade A/B/C</small>
          </div>
        </div>

        <div
          onClick={() => go('stock')}
          className="panel p-0 overflow-hidden cursor-pointer hover:border-blue-400 hover:shadow-md transition group"
        >
          <div className="h-28 overflow-hidden relative bg-slate-100">
            <img
              src="/photos/cold-storage.png"
              alt="Sub-Zero Cold Storage"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <span className="absolute bottom-1.5 left-1.5 bg-slate-900/80 text-cyan-300 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold backdrop-blur-sm">
              COLD CHAIN
            </span>
          </div>
          <div className="p-2.5">
            <b className="text-xs text-slate-900 block truncate group-hover:text-blue-800">3. Cold Storage</b>
            <small className="text-[11px] text-slate-500 block truncate">{f(inStock)} kg in holding rooms</small>
          </div>
        </div>

        <div
          onClick={() => go('transport')}
          className="panel p-0 overflow-hidden cursor-pointer hover:border-blue-400 hover:shadow-md transition group"
        >
          <div className="h-28 overflow-hidden relative bg-slate-100">
            <img
              src="/photos/refrigerated-truck.png"
              alt="Refrigerated Truck Dispatch"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <span className="absolute bottom-1.5 left-1.5 bg-slate-900/80 text-amber-300 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold backdrop-blur-sm">
              DISPATCH
            </span>
          </div>
          <div className="p-2.5">
            <b className="text-xs text-slate-900 block truncate group-hover:text-blue-800">4. Transport Fleet</b>
            <small className="text-[11px] text-slate-500 block truncate">1-3T insulated trucks</small>
          </div>
        </div>
      </div>

      {/* Operational Alerts */}
      {(pend.length > 0 || expiring.length > 0) && (
        <div className="flex flex-col gap-2">
          {pend.length > 0 && can('quality') && (
            <div
              onClick={() => go('quality')}
              className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900 cursor-pointer hover:bg-amber-100/70 transition"
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert size={18} className="text-amber-600" />
                <span>
                  <strong>{pend.length} Landing Batch awaiting Quality Inspection:</strong> Cold chain compliance requires reception temp &lt; 4.0°C.
                </span>
              </div>
              <span className="font-bold text-amber-700 flex items-center gap-1">
                Inspect Now <ChevronRight size={14} />
              </span>
            </div>
          )}
          {expiring.length > 0 && can('compliance') && (
            <div
              onClick={() => go('compliance')}
              className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-900 cursor-pointer hover:bg-rose-100/70 transition"
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle size={18} className="text-rose-600" />
                <span>
                  <strong>FiRCIS Document Alert:</strong> {expiring[0]?.type} ({expiring[0]?.ref}) is due for renewal before export dispatch.
                </span>
              </div>
              <span className="font-bold text-rose-700 flex items-center gap-1">
                View Licences <ChevronRight size={14} />
              </span>
            </div>
          )}
        </div>
      )}

      {/* FishTrade – Owner's Business Overview (Specification Section 8) */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 m-0">FishTrade – Owner's Business Overview</h3>
              <Badge variant="blue">Executive Cockpit</Badge>
            </div>
            <p className="text-xs text-slate-500 m-0">
              End-to-end operational visibility and central financial position across fishermen, boats, and the active season.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              Active Season: <b className="text-blue-900 font-mono">{activeSeason?.code || '2026-Q1'}</b>
            </span>
          </div>
        </div>

        {/* 4 High-Level Business Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div
            onClick={() => go('suppliers')}
            className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-blue-400 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-800">
                Active fishermen
              </span>
              <Users size={18} className="text-blue-600" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <b className="text-2xl font-black font-mono text-slate-900">245</b>
              <span className="text-xs text-slate-500">registered</span>
            </div>
            <small className="text-[11px] text-slate-400 block mt-1 truncate">
              {s.suppliers.length} active landing station accounts
            </small>
          </div>

          <div
            onClick={() => go('crew')}
            className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-blue-400 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-800">
                Active boats &amp; Crew
              </span>
              <Anchor size={18} className="text-cyan-600" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <b className="text-2xl font-black font-mono text-slate-900">38</b>
              <span className="text-xs text-slate-500">vessels</span>
            </div>
            <small className="text-[11px] text-emerald-600 font-semibold block mt-1 truncate">
              {(s.boats || []).filter(b => b.status === 'Operational').length} ready · {(s.boats || []).filter(b => b.status === 'Under Maintenance').length} in service
            </small>
          </div>

          <div
            onClick={() => go('settlement')}
            className="p-4 bg-white border border-amber-200 bg-amber-50/20 rounded-xl shadow-xs hover:border-amber-400 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between text-amber-800 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-amber-900">
                Recoverable balances
              </span>
              <TrendingUp size={18} className="text-amber-600" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <b className="text-2xl font-black font-mono text-amber-900">
                {totalRecoverableDebt > 0 ? tzs(totalRecoverableDebt) : 'TZS 28.5M'}
              </b>
            </div>
            <small className="text-[11px] text-amber-700 block mt-1 truncate">
              Fuel, gear, food, maint &amp; advances
            </small>
          </div>

          <div
            onClick={() => go('expenses')}
            className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-blue-400 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-800">
                Season operating costs
              </span>
              <DollarSign size={18} className="text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <b className="text-2xl font-black font-mono text-slate-900">
                {seasonOperatingCosts > 0 ? tzs(seasonOperatingCosts) : 'TZS 42.8M'}
              </b>
            </div>
            <small className="text-[11px] text-slate-400 block mt-1 truncate">
              Fleet ops, cold storage &amp; logistics
            </small>
          </div>
        </div>

        {/* Operational Overview & Financial Overview Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Column A: Operational Overview */}
          <div className="panel p-4 flex flex-col justify-between">
            <div>
              <div className="panel-header mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900 m-0">Operational Overview</h3>
                </div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Live Lake Ops</span>
              </div>
              <div className="flex flex-col divide-y divide-slate-100 text-xs">
                {/* 1. Fuel issued and fuel remaining */}
                <div className="py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-blue-50 text-blue-800">
                      <FuelIcon size={16} />
                    </div>
                    <div>
                      <b className="text-slate-800 block">Fuel issued &amp; fuel remaining</b>
                      <span className="text-slate-500 text-[11px]">
                        {f(totalFuelIssuedLitres)}L issued · {f(totalFuelRemainingLitres)}L in stock
                      </span>
                    </div>
                  </div>
                  <button onClick={() => go('fuel')} className="text-blue-800 hover:text-blue-900 font-semibold text-xs flex items-center gap-1">
                    Manage <ChevronRight size={13} />
                  </button>
                </div>

                {/* 2. Boats operational and under maintenance */}
                <div className="py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-800">
                      <Wrench size={16} />
                    </div>
                    <div>
                      <b className="text-slate-800 block">Boats operational &amp; under maintenance</b>
                      <span className="text-slate-500 text-[11px]">
                        {operationalBoatsCount} operational vessels · {underMaintBoatsCount} in maintenance
                      </span>
                    </div>
                  </div>
                  <button onClick={() => go('maintenance')} className="text-blue-800 hover:text-blue-900 font-semibold text-xs flex items-center gap-1">
                    Fleet <ChevronRight size={13} />
                  </button>
                </div>

                {/* 3. Equipment issued and damaged */}
                <div className="py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800">
                      <Anchor size={16} />
                    </div>
                    <div>
                      <b className="text-slate-800 block">Equipment issued &amp; condition</b>
                      <span className="text-slate-500 text-[11px]">
                        {activeGearIssuesCount} active issues · {gearCatalogCount} catalogued items
                      </span>
                    </div>
                  </div>
                  <button onClick={() => go('gear')} className="text-blue-800 hover:text-blue-900 font-semibold text-xs flex items-center gap-1">
                    Gear <ChevronRight size={13} />
                  </button>
                </div>

                {/* 4. Daily food and catering costs */}
                <div className="py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-amber-50 text-amber-800">
                      <UtensilsCrossed size={16} />
                    </div>
                    <div>
                      <b className="text-slate-800 block">Daily food &amp; catering costs</b>
                      <span className="text-slate-500 text-[11px]">
                        {tzs(cateringTotalSpent)} meals spent · {tzs(cateringMoneyReturned)} cash returned
                      </span>
                    </div>
                  </div>
                  <button onClick={() => go('catering')} className="text-blue-800 hover:text-blue-900 font-semibold text-xs flex items-center gap-1">
                    Catering <ChevronRight size={13} />
                  </button>
                </div>

                {/* 5. Cash advances awaiting approval */}
                <div className="py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-rose-50 text-rose-800">
                      <Banknote size={16} />
                    </div>
                    <div>
                      <b className="text-slate-800 block">Cash advances awaiting approval</b>
                      <span className="text-slate-500 text-[11px]">
                        {pendingAdvancesCount} pending requests · {tzs(pendingAdvancesSum)}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => go('advances')} className="text-rose-700 hover:text-rose-900 font-semibold text-xs flex items-center gap-1">
                    Review <ChevronRight size={13} />
                  </button>
                </div>

                {/* 6. Fishermen with outstanding balances */}
                <div className="py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-purple-50 text-purple-800">
                      <Users size={16} />
                    </div>
                    <div>
                      <b className="text-slate-800 block">Fishermen with outstanding balances</b>
                      <span className="text-slate-500 text-[11px]">
                        {fishersWithDebtCount} fishermen with recoverable credit balances
                      </span>
                    </div>
                  </div>
                  <button onClick={() => go('suppliers')} className="text-purple-700 hover:text-purple-900 font-semibold text-xs flex items-center gap-1">
                    Ledger <ChevronRight size={13} />
                  </button>
                </div>

                {/* 7. Season settlements pending approval */}
                <div className="py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-800">
                      <FileText size={16} />
                    </div>
                    <div>
                      <b className="text-slate-800 block">Season settlements pending approval</b>
                      <span className="text-slate-500 text-[11px]">
                        {settlementsCount} finalized statements · {tzs(settlementsDisbursed)} net disbursed
                      </span>
                    </div>
                  </div>
                  <button onClick={() => go('settlement')} className="text-emerald-700 hover:text-emerald-900 font-semibold text-xs flex items-center gap-1">
                    Statements <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Column B: Financial Overview */}
          <div className="panel p-4 flex flex-col justify-between">
            <div>
              <div className="panel-header mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 m-0">Financial Overview</h3>
                </div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Company Position</span>
              </div>
              <div className="flex flex-col divide-y divide-slate-100 text-xs">
                {/* 1. Total fish purchases */}
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block">Total fish purchases</span>
                    <b className="font-mono text-slate-900 text-sm">{tzs(boughtTotal)}</b>
                  </div>
                  <span className="text-slate-400 text-xs font-mono">{f(bought)} kg</span>
                </div>

                {/* 2. Total industry sales */}
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block">Total industry sales</span>
                    <b className="font-mono text-blue-900 text-sm">{tzs(rev)}</b>
                  </div>
                  <span className="text-slate-400 text-xs font-mono">{f(sold)} kg</span>
                </div>

                {/* 3. Payments received */}
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block">Payments received from factories</span>
                    <b className="font-mono text-emerald-800 text-sm">{tzs(rev - debt)}</b>
                  </div>
                  <span className="text-emerald-600 font-semibold text-[11px]">
                    {rev > 0 ? Math.round(((rev - debt) / rev) * 100) : 0}% collected
                  </span>
                </div>

                {/* 4. Supplier and fisherman liabilities */}
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block">Supplier and fisherman liabilities</span>
                    <b className="font-mono text-rose-800 text-sm">{tzs(due)}</b>
                  </div>
                  <span className="text-rose-600 font-semibold text-[11px]">Pending catch payout</span>
                </div>

                {/* 5. Company-funded expenses */}
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block">Company-funded operating expenses</span>
                    <b className="font-mono text-slate-900 text-sm">{tzs(companyExpensesTotal)}</b>
                  </div>
                  <span className="text-slate-400 text-[11px]">Cold rooms, ice, dock labor</span>
                </div>

                {/* 6. Recoverable fisherman expenses */}
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block">Recoverable fisherman expenses</span>
                    <b className="font-mono text-amber-800 text-sm">{tzs(totalRecoverableDebt)}</b>
                  </div>
                  <span className="text-amber-700 font-semibold text-[11px]">Deductible from fish catch</span>
                </div>

                {/* 7. Outstanding customer receivables */}
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block">Outstanding customer receivables</span>
                    <b className="font-mono text-blue-900 text-sm">{tzs(debt)}</b>
                  </div>
                  <span className="text-blue-700 font-semibold text-[11px]">Industrial plant debtors</span>
                </div>

                {/* 8. Actual business profitability */}
                <div className="py-2.5 flex items-center justify-between bg-emerald-50/50 px-2 rounded-lg mt-1 border border-emerald-100">
                  <div>
                    <span className="text-emerald-900 font-bold block">Actual business profitability (Net)</span>
                    <b className="font-mono text-emerald-800 text-base">{tzs(netProfit)}</b>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-700 font-bold block text-xs">
                      {rev > 0 ? ((netProfit / rev) * 100).toFixed(1) : 0}% Margin
                    </span>
                    <small className="text-[10px] text-emerald-600">After all landed costs</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Section (Using Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Purchasing vs Sales Volume Chart */}
        <div className="panel lg:col-span-2">
          <div className="panel-header">
            <div>
              <h3>Purchasing vs. Industry Sales Volume</h3>
              <p>Monthly weekly progression in kilograms (kg)</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">November 2026</span>
            </div>
          </div>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} stroke="#cbd5e1" />
                <Tooltip
                  formatter={(val, name) => [`${f(val)} kg`, name === 'purchased' ? 'Purchased' : 'Sold to Factories']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="purchased" name="Fish Purchased" fill="#0b3a8c" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sold" name="Fish Sold to Industry" fill="#f28c28" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Species Breakdown Donut Chart */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Species Mix</h3>
              <p>Catch volume distribution</p>
            </div>
          </div>
          <div className="w-full h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={speciesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {speciesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={val => `${f(val)} kg`} contentStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            {speciesData.map(sp => (
              <div key={sp.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sp.color }} />
                  {sp.name}
                </span>
                <b className="font-mono text-slate-700">{f(sp.value)} kg</b>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Health Summary & Live Receiving Log (SRS Module 5 & BlueTrace Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Overview Card */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Financial Position</h3>
              <p>Cash, payables &amp; customer debts</p>
            </div>
            <DollarSign className="text-slate-400" size={18} />
          </div>
          <div className="flex flex-col gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
              <div>
                <span className="text-slate-500 block">Sales Invoiced (Revenue)</span>
                <b className="text-sm font-mono text-slate-900">{tzs(rev)}</b>
              </div>
              <span className="text-emerald-600 font-semibold text-xs">Paid: {tzs(rev - debt)}</span>
            </div>

            <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-100 flex justify-between items-center">
              <div>
                <span className="text-rose-700 block">Supplier Payments Due (Fishermen)</span>
                <b className="text-sm font-mono text-rose-800">{tzs(due)}</b>
              </div>
              {can('payments') && (
                <button onClick={() => go('payments')} className="text-rose-700 hover:underline font-semibold">
                  Pay Now
                </button>
              )}
            </div>

            <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 flex justify-between items-center">
              <div>
                <span className="text-blue-700 block">Customer Debts (Industries)</span>
                <b className="text-sm font-mono text-blue-800">{tzs(debt)}</b>
              </div>
              {can('sales') && (
                <button onClick={() => go('sales')} className="text-blue-700 hover:underline font-semibold">
                  Collect
                </button>
              )}
            </div>

            <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 flex justify-between items-center">
              <div>
                <span className="text-amber-800 block">Fisherman Fuel Credit Ledger</span>
                <b className="text-sm font-mono text-amber-900">
                  {tzs(s.suppliers.reduce((a, x) => a + supFuelDebt(s, x.id), 0))}
                </b>
              </div>
              <button onClick={() => go('fuel')} className="text-amber-800 hover:underline font-semibold flex items-center gap-1">
                <FuelIcon size={12} /> Manage
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-slate-700 block">Active Vessel Fleet &amp; Repairs</span>
                <b className="text-sm font-mono text-slate-900">
                  {(s.boats || []).filter(b => b.status === 'Operational').length} / {(s.boats || []).length} Boats Ready
                </b>
              </div>
              <button onClick={() => go('maintenance')} className="text-blue-900 hover:underline font-semibold flex items-center gap-1">
                <Wrench size={12} /> Fleet
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
              <div>
                <span className="text-slate-500 block">Transport &amp; Ice Costs</span>
                <b className="text-sm font-mono text-slate-900">{tzs(tr + exp0)}</b>
              </div>
              <span className="text-slate-400">Landed logistics</span>
            </div>
          </div>
        </div>

        {/* Live Receiving Log (Latest Batches Table) */}
        <div className="panel lg:col-span-2">
          <div className="panel-header">
            <div>
              <h3>Recent Landing Collections</h3>
              <p>Fish arrivals, weighing, and quality reception</p>
            </div>
            {can('buy') && (
              <button onClick={() => go('buy')} className="btn-secondary text-xs">
                View All Batches
              </button>
            )}
          </div>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fish &amp; Batch</th>
                  <th>Supplier / Landing</th>
                  <th>Quantity</th>
                  <th>Total Cost</th>
                  <th>Inspection</th>
                </tr>
              </thead>
              <tbody>
                {s.batches.slice(0, 5).map(b => (
                  <tr key={b.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <FishPhoto sp={b.sp} size={36} />
                        <div>
                          <b className="block text-slate-900">{b.sp}</b>
                          <small className="text-slate-400 font-mono">{b.no} · Grade {b.grade}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span className="text-slate-800 font-medium">
                          {s.suppliers.find(x => x.id === b.sup)?.name || b.sup}
                        </span>
                        <small className="block text-slate-400">{b.site}</small>
                      </div>
                    </td>
                    <td>
                      <b className="font-mono text-slate-900">{f(b.kg)} kg</b>
                      <small className="block text-slate-400">{b.crates || Math.round(b.kg / 40)} crates</small>
                    </td>
                    <td>
                      <b className="font-mono text-slate-900">{tzs(b.kg * b.price)}</b>
                      <small className="block text-slate-400">@ {tzs(b.price)}/kg</small>
                    </td>
                    <td>
                      <Badge variant={b.st === 'accepted' ? 'green' : 'amber'}>
                        {b.st === 'accepted' ? 'Accepted' : 'Pending QC'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

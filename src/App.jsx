import React, { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Building2,
  Scale,
  Warehouse,
  ShoppingBag,
  Users,
  ShieldCheck,
  DollarSign,
  Truck,
  Receipt,
  FileText,
  ShieldAlert,
  BarChart3,
  UserCheck,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Fish,
  MapPin,
  Smartphone,
  PanelLeftClose,
  PanelLeftOpen,
  Fuel as FuelIcon,
  Wrench,
  Anchor,
  UtensilsCrossed,
  Hammer,
  Banknote,
  Calendar,
  Layers,
  ArrowRight,
  Ship,
  Search
} from 'lucide-react'
import { useS, ROLES } from './store'
import Home from './modules/Home'
import Crew from './modules/Crew'
import Buy from './modules/Buy'
import Fuel from './modules/Fuel'
import Maintenance from './modules/Maintenance'
import Gear from './modules/Gear'
import Catering from './modules/Catering'
import Investment from './modules/Investment'
import Advances from './modules/Advances'
import Settlement from './modules/Settlement'
import Stock from './modules/Stock'
import Sales from './modules/Sales'
import Suppliers from './modules/Suppliers'
import Quality from './modules/Quality'
import Payments from './modules/Payments'
import Transport from './modules/Transport'
import Expenses from './modules/Expenses'
import Compliance from './modules/Compliance'
import Audit from './modules/Audit'
import Reports from './modules/Reports'
import Staff from './modules/Staff'
import Hq from './modules/Hq'
import Super from './modules/Super'
import Landing from './modules/Landing'
import Register from './modules/Register'
import Login from './modules/Login'
import { PWAInstallButton, OfflineIndicator } from './ui'

class ModuleErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, errorInfo) {
    console.error('Module Error:', error, errorInfo)
  }
  componentDidUpdate(prevProps) {
    if (prevProps.tabKey !== this.props.tabKey && this.state.hasError) {
      this.setState({ hasError: false, error: null })
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-2xl mx-auto my-12 bg-white rounded-2xl border border-rose-200 shadow-md text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <ShieldAlert size={28} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Module View Encountered an Issue</h2>
          <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto leading-relaxed">
            {this.state.error?.message || 'An unexpected rendering error occurred while loading this view.'}
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Reload View
            </button>
            <button
              onClick={() => this.props.onReset?.()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
            >
              Return to Overview
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const MODULE_DEFS = {
  // Shared System Foundation & Business Overview
  home: { label: "Owner's Overview", shortLabel: 'Overview', icon: LayoutDashboard, component: Home, group: 'central_shared' },
  hq: { label: 'HQ Analytics', shortLabel: 'HQ', icon: Building2, component: Hq, group: 'central_shared' },
  
  // 1. Existing Foundation: Core Fish Management
  crew: { label: 'Boat Crew & Accounts', shortLabel: 'Boat Crew', icon: Ship, component: Crew, group: 'foundation' },
  suppliers: { label: 'Fishermen & Boats', shortLabel: 'Fishermen', icon: Users, component: Suppliers, group: 'foundation' },
  buy: { label: 'Purchases & Weighing', shortLabel: 'Purchases', icon: Scale, component: Buy, group: 'foundation' },
  stock: { label: 'Stock & Cold Rooms', shortLabel: 'Stock', icon: Warehouse, component: Stock, group: 'foundation' },
  sales: { label: 'Industry Sales', shortLabel: 'Sales', icon: ShoppingBag, component: Sales, group: 'foundation' },
  payments: { label: 'Catch Payments', shortLabel: 'Payments', icon: DollarSign, component: Payments, group: 'foundation' },
  quality: { label: 'Quality & HACCP', shortLabel: 'Quality', icon: ShieldCheck, component: Quality, group: 'foundation' },
  transport: { label: 'Cold Chain Transport', shortLabel: 'Transport', icon: Truck, component: Transport, group: 'foundation' },

  // 2. New Modules: Fishing Operations & Cost Management
  fuel: { label: 'Fuel Management', shortLabel: 'Fuel', icon: FuelIcon, component: Fuel, group: 'ops_costs' },
  maintenance: { label: 'Fleet & Maintenance', shortLabel: 'Fleet', icon: Wrench, component: Maintenance, group: 'ops_costs' },
  gear: { label: 'Gear & Equipment', shortLabel: 'Gear', icon: Anchor, component: Gear, group: 'ops_costs' },
  catering: { label: 'Food & Catering', shortLabel: 'Catering', icon: UtensilsCrossed, component: Catering, group: 'ops_costs' },
  investment: { label: 'Boat Construction', shortLabel: 'Investment', icon: Hammer, component: Investment, group: 'ops_costs' },
  advances: { label: 'Cash Advances', shortLabel: 'Advances', icon: Banknote, component: Advances, group: 'ops_costs' },
  settlement: { label: 'Season Settlement', shortLabel: 'Settlement', icon: FileText, component: Settlement, group: 'ops_costs' },

  // 3. Central Integration & Governance
  expenses: { label: 'Operating Expenses', shortLabel: 'Expenses', icon: Receipt, component: Expenses, group: 'central_shared' },
  compliance: { label: 'FiRCIS & Permits', shortLabel: 'Compliance', icon: FileText, component: Compliance, group: 'central_shared' },
  reports: { label: 'Reports & Ledgers', shortLabel: 'Reports', icon: BarChart3, component: Reports, group: 'central_shared' },
  audit: { label: 'Audit Trail', shortLabel: 'Audit', icon: ShieldAlert, component: Audit, group: 'central_shared' },
  staff: { label: 'Staff & Roles', shortLabel: 'Staff', icon: UserCheck, component: Staff, group: 'central_shared' }
}

const MODULE_GROUPS = [
  {
    id: 'foundation',
    label: 'Core Fish Management',
    shortGroup: 'Core Fish',
    defaultTab: 'crew',
    items: ['crew', 'suppliers', 'buy', 'stock', 'sales', 'payments', 'quality', 'transport']
  },
  {
    id: 'ops_costs',
    label: 'Operations & Costs',
    shortGroup: 'Operations',
    defaultTab: 'fuel',
    items: ['fuel', 'maintenance', 'gear', 'catering', 'investment', 'advances', 'settlement']
  },
  {
    id: 'central_shared',
    label: 'Central Integration',
    shortGroup: 'Executive & BI',
    defaultTab: 'home',
    items: ['home', 'hq', 'expenses', 'reports', 'compliance', 'audit', 'staff']
  }
]

const SIDEBAR_ITEMS = [
  'home',
  // Core Fish Management
  'crew',
  'suppliers',
  'buy',
  'stock',
  'sales',
  'payments',
  'quality',
  'transport',
  // Operations & Costs
  'fuel',
  'maintenance',
  'gear',
  'catering',
  'investment',
  'advances',
  'settlement',
  // Central Integration
  'hq',
  'expenses',
  'reports',
  'compliance',
  'audit',
  'staff'
]

const MOBILE_NAV_KEYS = ['home', 'crew', 'buy', 'fuel', 'settlement', 'more']

export default function App() {
  const { s, a, T, B, me, x, ses } = useS()
  const [view, setView] = useState(() => location.hash.replace('#/', '') || '')
  const [tab, setTab] = useState(() => {
    const v = location.hash.replace('#/', '') || ''
    return MODULE_DEFS[v] ? v : 'home'
  })
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('ft_sidebar_collapsed') === '1'
    } catch (e) {
      return false
    }
  })
  const [moreOpen, setMoreOpen] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState({})
  const [boatNavSearch, setBoatNavSearch] = useState('')
  const [boatNavDropdownOpen, setBoatNavDropdownOpen] = useState(false)

  const handleJumpToBoat = boatId => {
    a.setActiveBoat(boatId)
    setBoatNavDropdownOpen(false)
    setBoatNavSearch('')
    changeTab('crew')
  }

  const toggleGroup = gid => {
    setCollapsedGroups(prev => ({ ...prev, [gid]: !prev[gid] }))
  }

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev
      try {
        localStorage.setItem('ft_sidebar_collapsed', next ? '1' : '0')
      } catch (e) {}
      return next
    })
  }

  const nav = v => {
    location.hash = v ? '#/' + v : ''
    setView(v)
    if (MODULE_DEFS[v]) setTab(v)
    else setTab('home')
  }

  const changeTab = k => {
    setTab(k)
    location.hash = '#/' + k
  }

  useEffect(() => {
    const handleHash = () => {
      const v = location.hash.replace('#/', '') || ''
      setView(v)
      if (MODULE_DEFS[v]) {
        setTab(v)
      }
    }
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        document.getElementById('header-boat-search-input')?.focus()
      } else if (e.key === 'Escape') {
        setBoatNavDropdownOpen(false)
      }
    }
    const handleClickOutside = e => {
      if (!e.target.closest('.header-boat-search')) {
        setBoatNavDropdownOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  if (ses && ses.kind === 'super') return <Super />
  if (!s) {
    if (view === 'login') return <Login go={nav} />
    if (view === 'register') return <Register go={nav} />
    return <Landing go={nav} />
  }

  const hq = !me.branch || me.branch === 'all'
  const isAllowed = k => !ROLES[s.role] || ROLES[s.role].includes(k)

  const navMatchingBoats = (s?.boats || []).filter(b => {
    const q = boatNavSearch.toLowerCase().trim()
    if (!q) return true
    return (
      (b.name || '').toLowerCase().includes(q) ||
      (b.code || '').toLowerCase().includes(q) ||
      (b.regNo || '').toLowerCase().includes(q) ||
      (b.altReg || '').toLowerCase().includes(q) ||
      (b.captain || '').toLowerCase().includes(q) ||
      (b.landingSite || '').toLowerCase().includes(q) ||
      (s?.boatCrewAssignments || []).some(
        c => c.boatId === b.id && (c.fishermanName || '').toLowerCase().includes(q)
      )
    )
  })

  const currentTab = isAllowed(tab) ? tab : 'home'
  const activeGroup = MODULE_GROUPS.find(g => g.items.includes(currentTab))?.id || 'central_shared'
  const ActiveComponent = MODULE_DEFS[currentTab]?.component || Home

  const soon = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10)
  const badges = {
    quality: (s.batches || []).filter(b => b.st === 'pending').length,
    advances: (s.advances || []).filter(adv => adv.status === 'Pending Approval').length,
    compliance: (s.comp || []).filter(c => c.exp < soon).length
  }

  const out = () => {
    x.logout()
    nav('')
  }

  return (
    <div className="app-container">
      {/* Offline Status PWA Banner */}
      <OfflineIndicator />

      {/* Desktop Enterprise Sticky Vertical Icon-Tile Sidebar */}
      <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <a href="#/" onClick={() => nav('')} className="sidebar-logo" title="FishTrade ERP">
          <div className="sidebar-logo-icon">
            <Fish size={22} className="text-white" />
          </div>
          <div className="sidebar-logo-text">
            <b>FishTrade</b>
          </div>
        </a>

        <div className="sidebar-nav">
          {MODULE_GROUPS.map((grp, gIdx) => {
            const visibleItems = grp.items.filter(isAllowed)
            if (visibleItems.length === 0) return null

            return (
              <div key={grp.id} className="flex flex-col gap-1">
                {gIdx > 0 && <div className="sidebar-group-divider" />}
                <div className="sidebar-group-micro" title={grp.label}>
                  {grp.shortGroup}
                </div>
                {visibleItems.map(k => {
                  const item = MODULE_DEFS[k]
                  const Icon = item.icon
                  const badgeCount = badges[k] || 0
                  const active = currentTab === k
                  return (
                    <button
                      key={k}
                      onClick={() => changeTab(k)}
                      className={`sidebar-link ${active ? 'active' : ''}`}
                      title={`${grp.label} · ${item.label}`}
                    >
                      <Icon size={21} className="shrink-0" />
                      <span className="sidebar-label">{item.shortLabel}</span>
                      {badgeCount > 0 && <span className="sidebar-badge">{badgeCount}</span>}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>

        <div className="sidebar-footer">
          <button onClick={out} className="sidebar-link text-slate-300 hover:text-white" title="Sign Out">
            <LogOut size={18} className="shrink-0" />
            <span className="sidebar-label">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="app-main">
        {ses.imp && (
          <div className="bg-amber-600 text-white px-4 py-2 text-xs flex justify-between items-center font-semibold">
            <span>Support View: Active session for {T.name}</span>
            <button
              onClick={x.exitImp}
              className="bg-white text-amber-900 px-3 py-0.5 rounded font-bold hover:bg-slate-100"
            >
              Exit Support Mode
            </button>
          </div>
        )}

        {/* Top Header with Modular Tabs */}
        <header className="top-header">
          <div className="header-left">
            {/* Collapse / Expand Toggle Button */}
            <button
              onClick={toggleCollapsed}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition shrink-0"
              title={collapsed ? 'Expand sidebar (show labels)' : 'Collapse sidebar (maximum table width)'}
            >
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>

            <div className="header-title-block" title={`${T.name} — ${MODULE_DEFS[currentTab]?.label}`}>
              <small>{T.name}</small>
              <h1>{MODULE_DEFS[currentTab]?.label}</h1>
            </div>

            {/* Station Switcher */}
            {hq && T.branches.length > 1 ? (
              <div className="branch-select-box hidden sm:flex">
                <MapPin size={13} className="text-blue-700 shrink-0" />
                <select
                  value={B.id}
                  onChange={e => {
                    x.switchBranch(e.target.value)
                    changeTab('home')
                  }}
                  className="branch-select"
                >
                  {T.branches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="branch-select-box hidden sm:flex">
                <MapPin size={13} className="text-blue-700 shrink-0" />
                <span>{B.name}</span>
              </div>
            )}

            {/* Shared Active Season Switcher (Central Operational Integration) */}
            <div className="branch-select-box hidden xl:flex items-center gap-1.5 bg-sky-50 border-sky-200 shrink-0">
              <Calendar size={13} className="text-sky-700 shrink-0" />
              <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider">Season:</span>
              <select
                value={s.activeSeasonId || 'seas_2026_q1'}
                onChange={e => a.setActiveSeason(e.target.value)}
                className="branch-select text-sky-950 font-bold cursor-pointer max-w-[110px]"
                title="Select active fishing season for central operations, costs, and settlements"
              >
                {(s.seasons && s.seasons.length > 0
                  ? s.seasons
                  : [
                      { id: 'seas_2026_q1', code: '2026-Q1', name: '2026-Q1 High Season' },
                      { id: 'seas_2025_q4', code: '2025-Q4', name: '2025-Q4 Rain Season' }
                    ]
                ).map(sn => (
                  <option key={sn.id} value={sn.id}>
                    {sn.code || sn.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Prominent Global Boat & Crew Search Omnibar (Easy Nav) */}
            <div className="relative header-boat-search hidden sm:block shrink-0">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs shadow-xs focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 w-36 md:w-48 lg:w-56">
                <Ship size={14} className="text-blue-700 shrink-0" />
                <input
                  id="header-boat-search-input"
                  type="text"
                  placeholder="Find Boat [/]..."
                  value={boatNavSearch}
                  onFocus={() => setBoatNavDropdownOpen(true)}
                  onChange={e => {
                    setBoatNavSearch(e.target.value)
                    setBoatNavDropdownOpen(true)
                  }}
                  className="w-full bg-transparent border-0 p-0 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
                />
                {boatNavSearch ? (
                  <button
                    onClick={() => {
                      setBoatNavSearch('')
                      setBoatNavDropdownOpen(false)
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X size={12} />
                  </button>
                ) : (
                  <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 rounded border border-slate-200">
                    /
                  </kbd>
                )}
              </div>

              {/* Quick Jump Results Popover */}
              {boatNavDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-80 max-h-96 overflow-y-auto bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50 divide-y divide-slate-100">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex justify-between items-center">
                    <span>Boats &amp; Assigned Crew</span>
                    <button
                      onClick={() => setBoatNavDropdownOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      Esc
                    </button>
                  </div>
                  {navMatchingBoats.slice(0, 6).map(b => {
                    const crewCount = (s.boatCrewAssignments || []).filter(
                      c => c.boatId === b.id && c.status === 'Active'
                    ).length
                    const kibaluaCount = (s.kibaluaEngagements || []).filter(
                      k => k.boatId === b.id && k.status === 'Active'
                    ).length
                    return (
                      <button
                        key={b.id}
                        onClick={() => handleJumpToBoat(b.id)}
                        className="w-full text-left p-2 rounded-lg hover:bg-blue-50/80 transition flex items-center justify-between group"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-blue-900 group-hover:text-blue-700 bg-blue-100/60 px-1.5 py-0.5 rounded">
                              {b.code || b.regNo}
                            </span>
                            <span className="font-bold text-xs text-slate-900">{b.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            Captain: {b.captain || 'Unassigned'} · {crewCount} Crew {kibaluaCount > 0 && `(+${kibaluaCount} Kibalua)`}
                          </div>
                        </div>
                        <Badge variant={b.status === 'Active' || b.status === 'Operational' ? 'green' : 'amber'}>
                          {b.status || 'Active'}
                        </Badge>
                      </button>
                    )
                  })}
                  <div className="pt-2 px-2">
                    <button
                      onClick={() => {
                        setBoatNavDropdownOpen(false)
                        changeTab('crew')
                      }}
                      className="w-full py-1.5 text-center text-xs font-bold text-blue-700 hover:bg-blue-50 rounded-md transition block"
                    >
                      Open Boat Crew Management Console &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center: Top 3-Group Architecture Switcher Tabs */}
          <div className="hidden xl:flex top-module-tabs">
            {MODULE_GROUPS.map(g => {
              const isActive = activeGroup === g.id
              return (
                <button
                  key={g.id}
                  onClick={() => changeTab(g.defaultTab)}
                  className={`top-module-tab ${isActive ? 'active' : ''}`}
                >
                  <span className="hidden 2xl:inline">{g.label}</span>
                  <span className="2xl:hidden">{g.shortGroup || g.label}</span>
                </button>
              )
            })}
          </div>

          <div className="header-right">
            {/* Mobile Quick Boat Crew Search Button */}
            <button
              onClick={() => changeTab('crew')}
              className="sm:hidden p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200 shrink-0"
              title="Boat Crew & Accounts"
            >
              <Ship size={16} />
            </button>

            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Ops
            </span>

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* User Profile */}
            <div className="user-pill">
              <div className="user-avatar">
                {me.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="user-details hidden sm:flex">
                <b>{me.name.split(' ')[0]}</b>
                <small>{s.role}</small>
              </div>
            </div>

            <button
              onClick={out}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition shrink-0"
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>

        {/* Dynamic Active Module */}
        <main className="flex-1">
          <ModuleErrorBoundary tabKey={currentTab} onReset={() => changeTab('home')}>
            <ActiveComponent go={changeTab} />
          </ModuleErrorBoundary>
        </main>

        {/* Mobile Bottom Navigation (< 768px) */}
        <nav className="mobile-bottom-nav">
          <button
            onClick={() => changeTab('home')}
            className={`mobile-nav-btn ${currentTab === 'home' ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </button>
          {isAllowed('crew') && (
            <button
              onClick={() => changeTab('crew')}
              className={`mobile-nav-btn ${currentTab === 'crew' ? 'active' : ''}`}
            >
              <Ship size={20} />
              <span>Boat Crew</span>
            </button>
          )}
          {isAllowed('buy') && (
            <button
              onClick={() => changeTab('buy')}
              className={`mobile-nav-btn ${currentTab === 'buy' ? 'active' : ''}`}
            >
              <Scale size={20} />
              <span>Buy</span>
            </button>
          )}
          {isAllowed('fuel') && (
            <button
              onClick={() => changeTab('fuel')}
              className={`mobile-nav-btn ${currentTab === 'fuel' ? 'active' : ''}`}
            >
              <FuelIcon size={20} />
              <span>Fuel</span>
            </button>
          )}
          {isAllowed('settlement') && (
            <button
              onClick={() => changeTab('settlement')}
              className={`mobile-nav-btn ${currentTab === 'settlement' ? 'active' : ''}`}
            >
              <FileText size={20} />
              <span>Settle</span>
            </button>
          )}
          <button
            onClick={() => setMoreOpen(true)}
            className="mobile-nav-btn"
          >
            <Menu size={20} />
            <span>More</span>
          </button>
        </nav>

        {/* Mobile "More" Drawer Modal */}
        {moreOpen && (
          <div className="modal-overlay" onClick={() => setMoreOpen(false)}>
            <div className="modal-dialog max-w-md max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <b className="text-base text-slate-900 block">All FishTrade ERP Modules</b>
                  <span className="text-[11px] text-slate-400">Complete fishing business management</span>
                </div>
                <button onClick={() => setMoreOpen(false)} className="text-slate-400 p-1">
                  <X size={18} />
                </button>
              </div>
              
              <div className="flex flex-col gap-4 py-3">
                {MODULE_GROUPS.map(grp => {
                  const visible = grp.items.filter(isAllowed)
                  if (visible.length === 0) return null
                  return (
                    <div key={grp.id}>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
                        {grp.label}
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {visible.map(k => {
                          const item = MODULE_DEFS[k]
                          const Icon = item.icon
                          const isAct = currentTab === k
                          const badge = badges[k] || 0
                          return (
                            <button
                              key={k}
                              onClick={() => {
                                changeTab(k)
                                setMoreOpen(false)
                              }}
                              className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition ${
                                isAct ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold' : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <Icon size={18} className={isAct ? 'text-blue-700' : 'text-slate-500'} />
                              <div className="flex-1 min-w-0">
                                <span className="text-xs truncate block">{item.shortLabel}</span>
                                <small className="text-[10px] text-slate-400 truncate block">{item.label}</small>
                              </div>
                              {badge > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                  {badge}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

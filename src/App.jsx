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
  Wrench
} from 'lucide-react'
import { useS, ROLES } from './store'
import Home from './modules/Home'
import Buy from './modules/Buy'
import Fuel from './modules/Fuel'
import Maintenance from './modules/Maintenance'
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

const MODULE_DEFS = {
  home: { label: 'Business Overview', icon: LayoutDashboard, component: Home, group: 'analytics' },
  hq: { label: 'HQ Analytics', icon: Building2, component: Hq, group: 'analytics' },
  buy: { label: 'Purchases & Weighing', icon: Scale, component: Buy, group: 'operations' },
  fuel: { label: 'Fishing Fuel & Credit', icon: FuelIcon, component: Fuel, group: 'operations' },
  maintenance: { label: 'Fleet & Maintenance', icon: Wrench, component: Maintenance, group: 'operations' },
  stock: { label: 'Stock & Cold Rooms', icon: Warehouse, component: Stock, group: 'inventory' },
  sales: { label: 'Industry Sales', icon: ShoppingBag, component: Sales, group: 'commercial' },
  suppliers: { label: 'Fishermen & BMUs', icon: Users, component: Suppliers, group: 'commercial' },
  quality: { label: 'Quality Inspection', icon: ShieldCheck, component: Quality, group: 'operations' },
  payments: { label: 'Supplier Payments', icon: DollarSign, component: Payments, group: 'commercial' },
  transport: { label: 'Cold Chain Transport', icon: Truck, component: Transport, group: 'operations' },
  expenses: { label: 'Expenses & Landed Cost', icon: Receipt, component: Expenses, group: 'commercial' },
  compliance: { label: 'FiRCIS & Permits', icon: FileText, component: Compliance, group: 'governance' },
  reports: { label: 'BI Reports & Exports', icon: BarChart3, component: Reports, group: 'analytics' },
  audit: { label: 'Audit Trail', icon: ShieldAlert, component: Audit, group: 'governance' },
  staff: { label: 'Staff & Roles', icon: UserCheck, component: Staff, group: 'governance' }
}

const MODULE_GROUPS = [
  { id: 'operations', label: 'Operations', defaultTab: 'buy', items: ['buy', 'fuel', 'maintenance', 'quality', 'transport'] },
  { id: 'inventory', label: 'Live Inventory', defaultTab: 'stock', items: ['stock'] },
  { id: 'commercial', label: 'Commercial & Sales', defaultTab: 'sales', items: ['sales', 'suppliers', 'payments', 'expenses'] },
  { id: 'analytics', label: 'Analytics & HQ', defaultTab: 'home', items: ['home', 'hq', 'reports'] },
  { id: 'governance', label: 'Compliance & Audit', defaultTab: 'compliance', items: ['compliance', 'audit', 'staff'] }
]

const SIDEBAR_ITEMS = [
  'home',
  'hq',
  'buy',
  'fuel',
  'maintenance',
  'stock',
  'sales',
  'quality',
  'suppliers',
  'payments',
  'transport',
  'expenses',
  'reports',
  'compliance',
  'audit',
  'staff'
]

const MOBILE_NAV_KEYS = ['home', 'buy', 'stock', 'sales', 'more']

export default function App() {
  const { s, T, B, me, x, ses } = useS()
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

  if (ses && ses.kind === 'super') return <Super />
  if (!s) {
    if (view === 'login') return <Login go={nav} />
    if (view === 'register') return <Register go={nav} />
    return <Landing go={nav} />
  }

  const hq = !me.branch || me.branch === 'all'
  const isAllowed = k => !ROLES[s.role] || ROLES[s.role].includes(k)

  const currentTab = isAllowed(tab) ? tab : 'home'
  const activeGroup = MODULE_GROUPS.find(g => g.items.includes(currentTab))?.id || 'analytics'
  const ActiveComponent = MODULE_DEFS[currentTab]?.component || Home

  const soon = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10)
  const badges = {
    quality: s.batches.filter(b => b.st === 'pending').length,
    compliance: s.comp.filter(c => c.exp < soon).length
  }

  const out = () => {
    x.logout()
    nav('')
  }

  return (
    <div className="app-container">
      {/* Offline Status PWA Banner */}
      <OfflineIndicator />

      {/* Desktop Enterprise Sidebar (Collapsible Rail) */}
      <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="flex items-center justify-between">
          <a href="#/" onClick={() => nav('')} className="sidebar-logo" title="FishTrade ERP">
            <div className="sidebar-logo-icon">
              <Fish size={22} className="text-blue-900" />
            </div>
            <div className="sidebar-logo-text">
              <b>FishTrade</b>
              <small>Tanzania ERP</small>
            </div>
          </a>
        </div>

        <div className="sidebar-nav">
          {SIDEBAR_ITEMS.filter(isAllowed).map(k => {
            const item = MODULE_DEFS[k]
            const Icon = item.icon
            const badgeCount = badges[k] || 0
            const active = currentTab === k
            return (
              <button
                key={k}
                onClick={() => changeTab(k)}
                className={`sidebar-link ${active ? 'active' : ''}`}
                title={item.label}
              >
                <Icon size={18} className="shrink-0" />
                <span>{item.label}</span>
                {badgeCount > 0 && <span className="sidebar-badge">{badgeCount}</span>}
              </button>
            )
          })}
        </div>

        <div className="sidebar-footer">
          <div className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300">
            <div className="text-[10px] text-blue-300 font-mono uppercase tracking-wider">Active Station</div>
            <b className="text-white block truncate">{B.name}</b>
          </div>
          <button onClick={out} className="sidebar-link text-slate-300 hover:text-white" title="Sign Out">
            <LogOut size={16} className="shrink-0" />
            <span>Sign Out</span>
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

        {/* Top Header with Modular Tabs (Inspired by BlueTrace image_d49bd67a.png) */}
        <header className="top-header">
          <div className="header-left">
            {/* Collapse / Expand Toggle Button */}
            <button
              onClick={toggleCollapsed}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              title={collapsed ? 'Expand sidebar (show labels)' : 'Collapse sidebar (maximum table width)'}
            >
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>

            <div className="header-title-block">
              <small>{T.name}</small>
              <h1>{MODULE_DEFS[currentTab]?.label}</h1>
            </div>

            {/* Station Switcher */}
            {hq && T.branches.length > 1 ? (
              <div className="branch-select-box hidden sm:flex">
                <MapPin size={14} className="text-blue-700 shrink-0" />
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
                <MapPin size={14} className="text-blue-700 shrink-0" />
                <span>{B.name}</span>
              </div>
            )}
          </div>

          {/* Center: Top Modular Switcher Tabs (Inspired by BlueTrace image_d49bd67a.png) */}
          <div className="hidden lg:flex top-module-tabs">
            {MODULE_GROUPS.map(g => {
              const isActive = activeGroup === g.id
              return (
                <button
                  key={g.id}
                  onClick={() => changeTab(g.defaultTab)}
                  className={`top-module-tab ${isActive ? 'active' : ''}`}
                >
                  <span>{g.label}</span>
                </button>
              )
            })}
          </div>

          <div className="header-right">
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
              className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Dynamic Active Module */}
        <main className="flex-1">
          <ActiveComponent go={changeTab} />
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
          {isAllowed('buy') && (
            <button
              onClick={() => changeTab('buy')}
              className={`mobile-nav-btn ${currentTab === 'buy' ? 'active' : ''}`}
            >
              <Scale size={20} />
              <span>Buy</span>
            </button>
          )}
          {isAllowed('stock') && (
            <button
              onClick={() => changeTab('stock')}
              className={`mobile-nav-btn ${currentTab === 'stock' ? 'active' : ''}`}
            >
              <Warehouse size={20} />
              <span>Stock</span>
            </button>
          )}
          {isAllowed('sales') && (
            <button
              onClick={() => changeTab('sales')}
              className={`mobile-nav-btn ${currentTab === 'sales' ? 'active' : ''}`}
            >
              <ShoppingBag size={20} />
              <span>Sales</span>
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
            <div className="modal-dialog max-w-sm" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <b className="text-base text-slate-900">All Modules</b>
                <button onClick={() => setMoreOpen(false)} className="text-slate-400 p-1">
                  <X size={18} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2.5 py-2">
                {SIDEBAR_ITEMS.filter(isAllowed).map(k => {
                  const item = MODULE_DEFS[k]
                  const Icon = item.icon
                  return (
                    <button
                      key={k}
                      onClick={() => {
                        changeTab(k)
                        setMoreOpen(false)
                      }}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition ${
                        currentTab === k ? 'bg-blue-50 border-blue-700 text-blue-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <Icon size={22} className={currentTab === k ? 'text-blue-700' : 'text-slate-500'} />
                      <span className="text-xs leading-tight">{item.label}</span>
                    </button>
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

import React, { useState } from 'react'
import {
  Users,
  UserCheck,
  ShieldCheck,
  Building2,
  Phone,
  Lock,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Clock,
  Key,
  Shield,
  Layers,
  MapPin,
  Check,
  AlertCircle,
  AlertTriangle,
  Copy,
  Sliders,
  DollarSign,
  Fuel as FuelIcon,
  Scale,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react'
import {
  useS,
  ROLES,
  ALL_MODULE_KEYS,
  PERMISSIONS_LIST,
  DEFAULT_ROLE_PERMS,
  getUserAllowedModules,
  canUserAccessModule,
  canUserDo
} from '../store'
import { Modal, Field, Badge, fmtT } from '../ui'

const MODULE_DEFINITIONS = [
  {
    group: 'Core Fish Trade',
    items: [
      { key: 'buy', label: 'Purchases & Dock Scales', desc: 'Dockside fishermen catch reception and scale weigh-in' },
      { key: 'stock', label: 'Stock & Cold Storage', desc: 'Cold room inventory, blast freezers (-18°C), and lot FIFO' },
      { key: 'sales', label: 'Industry Sales', desc: 'Commercial factory dispatches, delivery notes, and tax invoices' },
      { key: 'payments', label: 'Catch Payments', desc: 'Fisherman payout ledgers, M-Pesa, bank transfers, and cash' },
      { key: 'quality', label: 'Quality & HACCP', desc: 'Temperature core probe checks (< 4.0°C) and organoleptic grading' },
      { key: 'transport', label: 'Cold Chain Transport', desc: '1-3 ton KYC refrigerated truck routes and carrier logs' }
    ]
  },
  {
    group: 'Lake Operations & Costs',
    items: [
      { key: 'crew', label: 'Boat Crew & Accounts', desc: 'Vessels, captain shares, and permanent/Kibalua crew records' },
      { key: 'fuel', label: 'Fuel Management', desc: 'Bulk fuel tanks, petrol/diesel dispensing, and boat fuel ledgers' },
      { key: 'maintenance', label: 'Fleet & Maintenance', desc: 'Marine outboard engine work orders and spare parts store' },
      { key: 'gear', label: 'Gear & Equipment', desc: 'Gill nets, solar lamps, anchors, and safety life vests' },
      { key: 'catering', label: 'Food & Rations', desc: 'Mama Mpishi catering advances and boat meal allocations' },
      { key: 'investment', label: 'Boat Construction', desc: 'New boat construction projects and hire-purchase recovery' },
      { key: 'advances', label: 'Cash Advances', desc: 'Crew emergency loans, daily matumizi, and approvals' },
      { key: 'settlement', label: 'Season Settlement', desc: 'Multi-module catch reconciliation and seasonal ledger closure' }
    ]
  },
  {
    group: 'Executive & Governance',
    items: [
      { key: 'home', label: 'Business Overview', desc: 'KPI summaries, daily trade totals, and recent activity feed' },
      { key: 'hq', label: 'HQ Analytics', desc: 'Multi-branch comparison, profit margins, and branch control' },
      { key: 'suppliers', label: 'Fishermen & Boats', desc: 'Artisanal fisherman directory, boats, and credit limits' },
      { key: 'expenses', label: 'Operating Expenses', desc: 'Landing beach operational overheads, ice, and station costs' },
      { key: 'compliance', label: 'FiRCIS & Permits', desc: 'Government fisheries permits, health certificates, renewals' },
      { key: 'reports', label: 'Reports & Ledgers', desc: 'Comprehensive financial statements, tax, and sales ledgers' },
      { key: 'audit', label: 'Audit Trail', desc: 'Immutable log of every weigh-in, payout, and user action' },
      { key: 'staff', label: 'Staff & Security', desc: 'User accounts, granular role permissions, and station access' }
    ]
  }
]

const MODULE_NAME_MAP = {}
MODULE_DEFINITIONS.forEach(g => g.items.forEach(it => { MODULE_NAME_MAP[it.key] = it.label }))

export default function Staff() {
  const { s, a, T, db } = useS()
  const me = (s.staff || []).find(x => x.id === s.me) || s.staff?.[0]
  const isOwner = me?.role === 'Owner' || me?.role === 'General Manager'
  const canManageStaff = canUserDo(me, 'canManageStaff')

  const [activeTab, setActiveTab] = useState('staff') // 'staff' | 'roles' | 'security_audit'
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [stationFilter, setStationFilter] = useState('all')
  const [editUser, setEditUser] = useState(null)
  const [modalTab, setModalTab] = useState('basics') // 'basics' | 'modules' | 'permissions'
  const [showPin, setShowPin] = useState(false)

  const assignableRoles = Object.keys(ROLES).filter(r => isOwner || (r !== 'Owner' && r !== 'General Manager'))
  const canEditUser = u => isOwner || (u.role !== 'Owner' && u.role !== 'General Manager')

  const activeOwnersCount = (s.staff || []).filter(x => x.role === 'Owner' && x.active).length
  const branchesList = T?.branches || [{ id: 'main', name: 'Main Landing Pier' }]

  const filteredStaff = (s.staff || []).filter(u => {
    const q = searchTerm.toLowerCase().trim()
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q)
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    const matchesStation = stationFilter === 'all' || (stationFilter === 'hq' ? u.branch === 'all' : u.branch === stationFilter)
    return matchesSearch && matchesRole && matchesStation
  })

  // Form validation
  const isNew = editUser && !editUser.id
  let formError = ''
  if (editUser) {
    if (!editUser.name?.trim()) {
      formError = 'Enter the staff member’s full name.'
    } else if (isNew && !/^[a-z0-9._]{3,}$/.test(editUser.username || '')) {
      formError = 'Username must be at least 3 lowercase characters or numbers.'
    } else if (
      isNew &&
      db.tenants.some(t => t.staff.some(x => x.username === (editUser.username || '').toLowerCase().trim()))
    ) {
      formError = 'That username is already registered in the system.'
    } else if ((isNew || editUser.pin) && !/^\d{4,6}$/.test(editUser.pin || '')) {
      formError = 'Security PIN must be 4 to 6 numeric digits.'
    } else if (editUser.id === me?.id && !editUser.active) {
      formError = 'You cannot deactivate your own active session account.'
    } else if (
      editUser.wasRole === 'Owner' &&
      (editUser.role !== 'Owner' || !editUser.active) &&
      activeOwnersCount <= 1
    ) {
      formError = 'Company must retain at least one active Owner.'
    }
  }

  // Action helpers
  const handleOpenAdd = () => {
    const defaultRole = assignableRoles.find(r => r === 'Purchasing Officer') || assignableRoles[0]
    const defaultPerms = { ...(DEFAULT_ROLE_PERMS[defaultRole] || {}) }
    const defaultMods = [...(ROLES[defaultRole] || ALL_MODULE_KEYS)]
    setEditUser({
      name: '',
      phone: '',
      username: '',
      role: defaultRole,
      pin: '1234',
      active: true,
      branch: 'all',
      customModules: defaultMods,
      permissions: defaultPerms,
      isCustomAccess: false
    })
    setModalTab('basics')
    setShowPin(false)
  }

  const handleOpenEdit = u => {
    const userRole = u.role
    const roleDefaultPerms = DEFAULT_ROLE_PERMS[userRole] || {}
    const roleDefaultMods = ROLES[userRole] === 0 ? ALL_MODULE_KEYS : ROLES[userRole] || ALL_MODULE_KEYS
    const userPerms = { ...roleDefaultPerms, ...(u.permissions || {}) }
    const userMods = u.customModules && u.customModules.length > 0 ? [...u.customModules] : [...roleDefaultMods]

    setEditUser({
      ...u,
      wasRole: u.role,
      pin: '',
      customModules: userMods,
      permissions: userPerms,
      isCustomAccess: !!(u.customModules && u.customModules.length > 0)
    })
    setModalTab('basics')
    setShowPin(false)
  }

  const handleSave = () => {
    if (!editUser || formError) return
    const { id, wasRole, username, pin, isCustomAccess, ...rest } = editUser
    const payload = {
      ...rest,
      customModules: isCustomAccess ? editUser.customModules : [],
      permissions: editUser.permissions || {}
    }

    if (id) {
      a.updStaff(id, {
        ...payload,
        pin: pin ? pin.trim() : undefined
      })
    } else {
      a.addStaff({
        ...payload,
        username: (username || '').toLowerCase().trim(),
        pin: (pin || '1234').trim()
      })
    }
    setEditUser(null)
  }

  // Quick preset handlers for admin
  const handleRoleChangeInModal = newRole => {
    const roleDefaultPerms = { ...(DEFAULT_ROLE_PERMS[newRole] || {}) }
    const roleDefaultMods = ROLES[newRole] === 0 ? ALL_MODULE_KEYS : [...(ROLES[newRole] || ALL_MODULE_KEYS)]
    setEditUser({
      ...editUser,
      role: newRole,
      permissions: roleDefaultPerms,
      customModules: roleDefaultMods,
      isCustomAccess: false
    })
  }

  const toggleModule = modKey => {
    const current = editUser.customModules || []
    const updated = current.includes(modKey) ? current.filter(k => k !== modKey) : [...current, modKey]
    setEditUser({
      ...editUser,
      customModules: updated,
      isCustomAccess: true
    })
  }

  const togglePermission = permKey => {
    const current = editUser.permissions || {}
    setEditUser({
      ...editUser,
      permissions: {
        ...current,
        [permKey]: !current[permKey]
      }
    })
  }

  const applyModulePreset = type => {
    let mods = []
    if (type === 'all') {
      mods = [...ALL_MODULE_KEYS]
    } else if (type === 'fish') {
      mods = ['home', 'buy', 'stock', 'sales', 'payments', 'quality', 'transport']
    } else if (type === 'lake') {
      mods = ['home', 'crew', 'fuel', 'maintenance', 'gear', 'catering', 'investment', 'advances', 'settlement']
    } else if (type === 'auditor') {
      mods = ['home', 'hq', 'reports', 'audit', 'compliance', 'stock', 'expenses']
    } else if (type === 'reset') {
      mods = ROLES[editUser.role] === 0 ? [...ALL_MODULE_KEYS] : [...(ROLES[editUser.role] || ALL_MODULE_KEYS)]
      setEditUser({ ...editUser, customModules: mods, isCustomAccess: false })
      return
    }
    setEditUser({ ...editUser, customModules: mods, isCustomAccess: true })
  }

  const applyPermissionPreset = type => {
    const role = editUser.role
    if (type === 'reset') {
      setEditUser({ ...editUser, permissions: { ...(DEFAULT_ROLE_PERMS[role] || {}) } })
    } else if (type === 'grant_all') {
      const allPerms = {}
      PERMISSIONS_LIST.forEach(p => { allPerms[p.key] = true })
      setEditUser({ ...editUser, permissions: allPerms })
    } else if (type === 'readonly') {
      const ro = {}
      PERMISSIONS_LIST.forEach(p => { ro[p.key] = p.key === 'canViewReports' || p.key === 'canExport' })
      setEditUser({ ...editUser, permissions: ro })
    }
  }

  const copyFromUser = srcUserId => {
    const src = (s.staff || []).find(u => u.id === srcUserId)
    if (!src) return
    const srcMods = getUserAllowedModules(src)
    const srcPerms = { ...(DEFAULT_ROLE_PERMS[src.role] || {}), ...(src.permissions || {}) }
    setEditUser({
      ...editUser,
      customModules: [...srcMods],
      permissions: srcPerms,
      isCustomAccess: true
    })
  }

  return (
    <div className="page-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 m-0 flex items-center gap-2">
            <ShieldCheck className="text-teal-700" size={24} />
            User Security &amp; Granular Access Control
          </h2>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Control which landing stations, modules, and financial actions each team member can perform.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canManageStaff && (
            <button
              onClick={handleOpenAdd}
              className="wizard-btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-sm font-bold"
            >
              <Plus size={16} />
              <span>Create New User</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="panel p-4 flex flex-col gap-1">
          <small className="text-slate-400 text-xs font-semibold uppercase font-mono">Total Staff Accounts</small>
          <b className="text-2xl font-mono text-slate-900 font-bold">{(s.staff || []).length}</b>
          <span className="text-[11px] text-slate-500">Across {branchesList.length} landing branch(es)</span>
        </div>

        <div className="panel p-4 flex flex-col gap-1">
          <small className="text-slate-400 text-xs font-semibold uppercase font-mono">Active Users</small>
          <b className="text-2xl font-mono text-emerald-600 font-bold">
            {(s.staff || []).filter(x => x.active).length}
          </b>
          <span className="text-[11px] text-slate-500">Allowed to sign in to ERP</span>
        </div>

        <div className="panel p-4 flex flex-col gap-1">
          <small className="text-slate-400 text-xs font-semibold uppercase font-mono">Financial Approvers</small>
          <b className="text-2xl font-mono text-amber-600 font-bold">
            {(s.staff || []).filter(u => canUserDo(u, 'canPay') || canUserDo(u, 'canApproveAdvances')).length}
          </b>
          <span className="text-[11px] text-slate-500">Can disburse cash or advances</span>
        </div>

        <div className="panel p-4 flex flex-col gap-1">
          <small className="text-slate-400 text-xs font-semibold uppercase font-mono">Station-Restricted</small>
          <b className="text-2xl font-mono text-teal-700 font-bold">
            {(s.staff || []).filter(u => u.branch && u.branch !== 'all').length}
          </b>
          <span className="text-[11px] text-slate-500">Locked to specific landing pier</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('staff')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'staff'
              ? 'border-teal-700 text-teal-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck size={16} />
          <span>Staff Directory &amp; Access ({s.staff?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('security_audit')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'security_audit'
              ? 'border-teal-700 text-teal-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Key size={16} />
          <span>High-Risk Privileges Audit</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'roles'
              ? 'border-teal-700 text-teal-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield size={16} />
          <span>Default Roles Matrix</span>
        </button>
      </div>

      {/* Tab 1: Staff Directory & Access Cards */}
      {activeTab === 'staff' && (
        <div className="flex flex-col gap-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff by name, handle, phone..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-white text-slate-800"
              >
                <option value="all">All Roles ({s.staff?.length || 0})</option>
                {Object.keys(ROLES).map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <select
                value={stationFilter}
                onChange={e => setStationFilter(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-white text-slate-800"
              >
                <option value="all">All Station Boundaries</option>
                <option value="hq">All Branches (HQ Privileges)</option>
                {branchesList.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} (Restricted)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* User Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.map(u => {
              const branchName =
                u.branch && u.branch !== 'all'
                  ? branchesList.find(b => b.id === u.branch)?.name || u.branch
                  : 'All Landing Branches (HQ Access)'
              const isCurrentUser = u.id === me?.id
              const canEditThis = canManageStaff && canEditUser(u)
              const allowedModules = getUserAllowedModules(u)
              const isCustom = u.customModules && u.customModules.length > 0

              const userCanPay = canUserDo(u, 'canPay')
              const userCanApproveAdv = canUserDo(u, 'canApproveAdvances')
              const userCanFuel = canUserDo(u, 'canIssueFuel')
              const userCanHaccp = canUserDo(u, 'canInspectQuality')

              return (
                <div
                  key={u.id}
                  className={`panel p-5 flex flex-col justify-between gap-4 transition hover:shadow-md ${
                    isCurrentUser ? 'border-teal-600 ring-1 ring-teal-600/20 bg-teal-50/20' : ''
                  }`}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-700 to-blue-900 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                          {u.name ? u.name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <b className="text-sm font-bold text-slate-900 block leading-tight">
                            {u.name} {isCurrentUser && <span className="text-teal-700 font-bold">(You)</span>}
                          </b>
                          <span className="text-xs font-mono text-slate-500">@{u.username}</span>
                        </div>
                      </div>

                      <Badge variant={u.active ? 'green' : 'red'}>
                        {u.active ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>

                    <div className="flex flex-col gap-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Assigned Base Role:</span>
                        <Badge variant="blue">{u.role}</Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Station Scope:</span>
                        <span
                          className={`font-semibold text-right truncate max-w-[170px] ${
                            u.branch && u.branch !== 'all' ? 'text-amber-800' : 'text-slate-800'
                          }`}
                          title={branchName}
                        >
                          {branchName}
                        </span>
                      </div>

                      {u.phone && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Phone:</span>
                          <span className="font-mono text-slate-800">{u.phone}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Module Access:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold text-slate-900">
                            {allowedModules.length} of 22
                          </span>
                          {isCustom && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                              Custom
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Critical Permissions Strip */}
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Active Key Capabilities:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {userCanPay && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            💰 Disburse Cash
                          </span>
                        )}
                        {userCanApproveAdv && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            ⚡ Approve Advances
                          </span>
                        )}
                        {userCanFuel && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            ⛽ Dispense Fuel
                          </span>
                        )}
                        {userCanHaccp && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                            🔍 HACCP Inspect
                          </span>
                        )}
                        {!userCanPay && !userCanApproveAdv && !userCanFuel && !userCanHaccp && (
                          <span className="px-2 py-0.5 rounded text-[10px] text-slate-500 bg-slate-100 border border-slate-200">
                            Standard View / Record Only
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {canEditThis && (
                    <div className="border-t border-slate-100 pt-3 flex justify-end">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="wizard-btn-primary text-xs py-1.5 px-3 rounded-xl flex items-center gap-1.5 font-bold shadow-xs"
                      >
                        <Sliders size={13} />
                        <span>Manage Access &amp; PIN</span>
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {filteredStaff.length === 0 && (
            <div className="panel p-12 text-center text-slate-500 text-xs">
              No staff members match the selected search and filter criteria.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: High-Risk Privileges Audit */}
      {activeTab === 'security_audit' && (
        <div className="flex flex-col gap-6">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <b className="font-bold block text-sm">Security &amp; Financial Governance Matrix</b>
              <p className="m-0 mt-1 leading-relaxed">
                Review which team members have high-risk capabilities that disburse company funds, dispense fuel, or approve credit. Keep these roles restricted to trustworthy station managers and senior accountants.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Privilege Card 1: Disburse Payments */}
            <div className="panel p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <DollarSign size={16} />
                  </div>
                  <div>
                    <b className="text-xs font-bold text-slate-900 block">Can Disburse Catch Payouts</b>
                    <span className="text-[11px] text-slate-500">M-Pesa, Bank, or Cash payments to fishermen</span>
                  </div>
                </div>
                <Badge variant="green">
                  {(s.staff || []).filter(u => canUserDo(u, 'canPay')).length} Authorized
                </Badge>
              </div>

              <div className="flex flex-col gap-1.5">
                {(s.staff || [])
                  .filter(u => canUserDo(u, 'canPay'))
                  .map(u => (
                    <div key={u.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs">
                      <span className="font-semibold text-slate-900">{u.name} (@{u.username})</span>
                      <Badge variant="blue">{u.role}</Badge>
                    </div>
                  ))}
              </div>
            </div>

            {/* Privilege Card 2: Approve Advances */}
            <div className="panel p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <b className="text-xs font-bold text-slate-900 block">Can Approve Cash Advances</b>
                    <span className="text-[11px] text-slate-500">Authorizes boat crew emergency loans &amp; rations</span>
                  </div>
                </div>
                <Badge variant="blue">
                  {(s.staff || []).filter(u => canUserDo(u, 'canApproveAdvances')).length} Authorized
                </Badge>
              </div>

              <div className="flex flex-col gap-1.5">
                {(s.staff || [])
                  .filter(u => canUserDo(u, 'canApproveAdvances'))
                  .map(u => (
                    <div key={u.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs">
                      <span className="font-semibold text-slate-900">{u.name} (@{u.username})</span>
                      <Badge variant="blue">{u.role}</Badge>
                    </div>
                  ))}
              </div>
            </div>

            {/* Privilege Card 3: Dispense Fuel */}
            <div className="panel p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <FuelIcon size={16} />
                  </div>
                  <div>
                    <b className="text-xs font-bold text-slate-900 block">Can Dispense Fuel from Tanks</b>
                    <span className="text-[11px] text-slate-500">Authorizes petrol and diesel pump issues</span>
                  </div>
                </div>
                <Badge variant="amber">
                  {(s.staff || []).filter(u => canUserDo(u, 'canIssueFuel')).length} Authorized
                </Badge>
              </div>

              <div className="flex flex-col gap-1.5">
                {(s.staff || [])
                  .filter(u => canUserDo(u, 'canIssueFuel'))
                  .map(u => (
                    <div key={u.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs">
                      <span className="font-semibold text-slate-900">{u.name} (@{u.username})</span>
                      <Badge variant="blue">{u.role}</Badge>
                    </div>
                  ))}
              </div>
            </div>

            {/* Privilege Card 4: Manage Staff */}
            <div className="panel p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                    <Key size={16} />
                  </div>
                  <div>
                    <b className="text-xs font-bold text-slate-900 block">Can Manage Staff &amp; Reset PINs</b>
                    <span className="text-[11px] text-slate-500">Full system access control</span>
                  </div>
                </div>
                <Badge variant="blue">
                  {(s.staff || []).filter(u => canUserDo(u, 'canManageStaff')).length} Authorized
                </Badge>
              </div>

              <div className="flex flex-col gap-1.5">
                {(s.staff || [])
                  .filter(u => canUserDo(u, 'canManageStaff'))
                  .map(u => (
                    <div key={u.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs">
                      <span className="font-semibold text-slate-900">{u.name} (@{u.username})</span>
                      <Badge variant="blue">{u.role}</Badge>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Default Roles Matrix */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(ROLES).map(roleName => {
            const roleMods = ROLES[roleName] === 0 ? ALL_MODULE_KEYS : ROLES[roleName] || []
            const rolePerms = DEFAULT_ROLE_PERMS[roleName] || {}
            const staffCount = (s.staff || []).filter(u => u.role === roleName).length

            return (
              <div key={roleName} className="panel p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 m-0">{roleName}</h3>
                    <span className="text-xs text-slate-400">
                      {staffCount} active staff member(s)
                    </span>
                  </div>
                  <Badge variant={roleName === 'Owner' ? 'blue' : 'neutral'}>
                    {roleMods.length === ALL_MODULE_KEYS.length
                      ? 'Full ERP Access'
                      : `${roleMods.length} of 22 Modules`}
                  </Badge>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Default Action Privileges:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(rolePerms).map(([pKey, allowed]) => {
                      if (!allowed) return null
                      const meta = PERMISSIONS_LIST.find(p => p.key === pKey)
                      return (
                        <span key={pKey} className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                          {meta?.label || pKey}
                        </span>
                      )
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Included Modules:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {roleMods.map(mKey => (
                      <span key={mKey} className="px-2 py-0.5 rounded text-[10px] bg-teal-50 text-teal-800 border border-teal-200">
                        {MODULE_NAME_MAP[mKey] || mKey}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add / Edit Staff Modal with Granular Security Controls */}
      {editUser && (
        <Modal
          title={isNew ? 'Create New Staff Account' : `Manage User Security: ${editUser.name}`}
          subtitle="Configure credentials, landing station boundaries, module visibility, and action privileges."
          onClose={() => setEditUser(null)}
          maxWidth="max-w-2xl"
        >
          <div className="flex flex-col gap-5">
            {/* Quick Clone Permissions Dropdown */}
            {(s.staff || []).length > 1 && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                  <Copy size={14} className="text-teal-700" />
                  Quick Clone Settings:
                </span>
                <select
                  onChange={e => {
                    if (e.target.value) copyFromUser(e.target.value)
                  }}
                  defaultValue=""
                  className="px-2.5 py-1 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                >
                  <option value="" disabled>Copy permissions from existing user...</option>
                  {(s.staff || [])
                    .filter(u => u.id !== editUser.id)
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Modal Internal Section Tabs */}
            <div className="flex border-b border-slate-200 gap-2">
              <button
                type="button"
                onClick={() => setModalTab('basics')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
                  modalTab === 'basics'
                    ? 'border-teal-700 text-teal-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                1. Identity &amp; Role
              </button>
              <button
                type="button"
                onClick={() => setModalTab('modules')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                  modalTab === 'modules'
                    ? 'border-teal-700 text-teal-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>2. Module Visibility</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-800">
                  {(editUser.customModules || []).length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('permissions')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                  modalTab === 'permissions'
                    ? 'border-teal-700 text-teal-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>3. Action Privileges</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800">
                  {Object.values(editUser.permissions || {}).filter(Boolean).length}
                </span>
              </button>
            </div>

            {/* TAB 1: Basics & Identity */}
            {modalTab === 'basics' && (
              <div className="flex flex-col gap-4">
                <Field label="Staff Member Full Name">
                  <input
                    type="text"
                    value={editUser.name}
                    onChange={e => setEditUser({ ...editUser, name: e.target.value })}
                    placeholder="e.g. Juma Kassim"
                    className="input-field font-semibold"
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Phone (M-Pesa / SMS)">
                    <input
                      type="tel"
                      value={editUser.phone || ''}
                      onChange={e => setEditUser({ ...editUser, phone: e.target.value })}
                      placeholder="+255 754 111 222"
                      className="input-field font-mono"
                    />
                  </Field>

                  <Field label="Login Username">
                    <input
                      type="text"
                      value={editUser.username || ''}
                      disabled={!isNew}
                      autoCapitalize="none"
                      onChange={e => setEditUser({ ...editUser, username: e.target.value.toLowerCase().trim() })}
                      placeholder="e.g. juma_k"
                      className="input-field font-mono"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Primary Base Role">
                    <select
                      value={editUser.role}
                      onChange={e => handleRoleChangeInModal(e.target.value)}
                      className="input-field font-bold"
                    >
                      {assignableRoles.map(r => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Landing Branch Station Scope">
                    <select
                      value={editUser.branch || 'all'}
                      onChange={e => setEditUser({ ...editUser, branch: e.target.value })}
                      className="input-field font-semibold"
                    >
                      <option value="all">All Branches (HQ Privileges)</option>
                      {branchesList.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name} (Restricted)
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                {/* PIN Input with Eye Toggle */}
                <div>
                  <label className="wizard-input-label block mb-1">
                    {isNew ? 'Security 4-Digit PIN' : 'New PIN (Leave blank to keep current)'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      inputMode="numeric"
                      value={editUser.pin || ''}
                      onChange={e => setEditUser({ ...editUser, pin: e.target.value })}
                      placeholder="••••"
                      className="input-field font-mono tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {!isNew && (
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={editUser.active}
                      onChange={e => setEditUser({ ...editUser, active: e.target.checked })}
                      className="accent-teal-700 w-4 h-4"
                    />
                    <span>Account Active (Permitted to sign in to ERP)</span>
                  </label>
                )}
              </div>
            )}

            {/* TAB 2: Module Visibility (What they can see) */}
            {modalTab === 'modules' && (
              <div className="flex flex-col gap-4">
                {/* 1-Click Module Presets */}
                <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => applyModulePreset('all')}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-semibold hover:bg-slate-100"
                  >
                    ⚡ All 22 Modules
                  </button>
                  <button
                    type="button"
                    onClick={() => applyModulePreset('fish')}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-semibold hover:bg-slate-100"
                  >
                    🐟 Fish Trade Only
                  </button>
                  <button
                    type="button"
                    onClick={() => applyModulePreset('lake')}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-semibold hover:bg-slate-100"
                  >
                    ⚓ Lake Ops &amp; Costs
                  </button>
                  <button
                    type="button"
                    onClick={() => applyModulePreset('reset')}
                    className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-bold hover:bg-teal-100 ml-auto"
                  >
                    ↺ Reset to Role Default
                  </button>
                </div>

                {/* Module Groups Checklist */}
                <div className="flex flex-col gap-4 max-h-96 overflow-y-auto pr-1">
                  {MODULE_DEFINITIONS.map(grp => (
                    <div key={grp.group} className="flex flex-col gap-2">
                      <b className="text-xs font-bold uppercase tracking-wider text-slate-700 block px-1">
                        {grp.group}
                      </b>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {grp.items.map(it => {
                          const isChecked = (editUser.customModules || []).includes(it.key)
                          return (
                            <div
                              key={it.key}
                              onClick={() => toggleModule(it.key)}
                              className={`p-2.5 rounded-xl border cursor-pointer transition flex items-start gap-2.5 ${
                                isChecked
                                  ? 'bg-teal-50/70 border-teal-600 text-slate-900 ring-1 ring-teal-600/30'
                                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500 opacity-70'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}} // handled by div onClick
                                className="accent-teal-700 mt-0.5"
                              />
                              <div className="flex-1 min-w-0">
                                <b className="text-xs font-bold block">{it.label}</b>
                                <p className="text-[10px] text-slate-500 m-0 leading-tight truncate">{it.desc}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Action Capabilities (What they can DO) */}
            {modalTab === 'permissions' && (
              <div className="flex flex-col gap-4">
                {/* 1-Click Action Presets */}
                <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700">Privilege Presets:</span>
                  <button
                    type="button"
                    onClick={() => applyPermissionPreset('grant_all')}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-semibold hover:bg-slate-100"
                  >
                    👑 Grant All Privileges
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPermissionPreset('readonly')}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-semibold hover:bg-slate-100"
                  >
                    🔍 Read-Only Auditor
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPermissionPreset('reset')}
                    className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-bold hover:bg-teal-100 ml-auto"
                  >
                    ↺ Reset to Role Default
                  </button>
                </div>

                {/* Permissions List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
                  {PERMISSIONS_LIST.map(p => {
                    const isGranted = !!editUser.permissions?.[p.key]
                    const isFinancialRisk = p.key === 'canPay' || p.key === 'canApproveAdvances' || p.key === 'canManageStaff'

                    return (
                      <div
                        key={p.key}
                        onClick={() => togglePermission(p.key)}
                        className={`p-3 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                          isGranted
                            ? isFinancialRisk
                              ? 'bg-amber-50/70 border-amber-500 text-slate-900 ring-1 ring-amber-500/40'
                              : 'bg-emerald-50/70 border-emerald-600 text-slate-900 ring-1 ring-emerald-600/30'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500 opacity-70'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isGranted}
                          onChange={() => {}}
                          className={`mt-0.5 ${isFinancialRisk ? 'accent-amber-600' : 'accent-emerald-700'}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <b className="text-xs font-bold">{p.label}</b>
                            {isFinancialRisk && (
                              <span className="text-[9px] font-bold px-1 rounded bg-amber-200 text-amber-900">
                                High Risk
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 m-0 mt-0.5 leading-snug">{p.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="btn-secondary text-xs py-2 px-4 rounded-xl"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!!formError}
                onClick={handleSave}
                className="wizard-btn-primary text-xs py-2 px-6 rounded-xl font-bold shadow-sm"
              >
                {isNew ? 'Create Staff User' : 'Save Security Profile'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

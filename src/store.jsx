import { createContext, useContext, useEffect, useState } from 'react'

const KEY = 'fishtrade.v9'
const today = () => new Date().toISOString().slice(0, 10)
export const SPECIES = ['Nile Perch', 'Tilapia', 'Dagaa (Sardines)', 'Catfish']
export const SITES = [
  'Mwanza (Kirumba Mwaloni)',
  'Kigoma (Katonga BMU)',
  'Musoma (Mwigobero)',
  'Ukerewe (Nansio)',
  'Bukoba (Kemondo)'
]
export const COLD_ROOMS = [
  'Main Cold Room (0°C to 2°C)',
  'Landing Holding Chiller',
  'Blast Freezer (-18°C)'
]

export const ROLES = {
  Owner: 0,
  'General Manager': 0,
  'Purchasing Officer': ['home', 'crew', 'buy', 'fuel', 'maintenance', 'gear', 'catering', 'stock', 'transport', 'reports'],
  'Quality Inspector': ['home', 'quality', 'stock', 'reports'],
  Storekeeper: ['home', 'crew', 'stock', 'fuel', 'maintenance', 'gear', 'quality', 'reports'],
  Accountant: ['home', 'crew', 'hq', 'payments', 'fuel', 'maintenance', 'gear', 'catering', 'investment', 'advances', 'settlement', 'expenses', 'suppliers', 'sales', 'transport', 'reports'],
  'Sales Officer': ['home', 'sales', 'transport', 'stock', 'reports'],
  'Transport Officer': ['home', 'transport', 'maintenance'],
  Auditor: ['home', 'crew', 'hq', 'buy', 'fuel', 'maintenance', 'gear', 'catering', 'investment', 'advances', 'settlement', 'stock', 'sales', 'suppliers', 'quality', 'payments', 'transport', 'expenses', 'compliance', 'audit', 'reports']
}

export const ALL_MODULE_KEYS = [
  'home', 'hq',
  'crew', 'suppliers', 'buy', 'stock', 'sales', 'payments', 'quality', 'transport',
  'fuel', 'maintenance', 'gear', 'catering', 'investment', 'advances', 'settlement',
  'expenses', 'compliance', 'reports', 'audit', 'staff'
]

export const PERMISSIONS_LIST = [
  { key: 'canBuy', label: 'Record Catch Weigh-in & Purchases', group: 'Fish Trade', desc: 'Capture dockside scale weights, species, and issue vouchers' },
  { key: 'canPay', label: 'Disburse Catch Payments', group: 'Fish Trade', desc: 'Issue cash, M-Pesa, Airtel Money or bank disbursements' },
  { key: 'canInspectQuality', label: 'HACCP Quality & Inspection', group: 'Fish Trade', desc: 'Record core temperature, organoleptic grades, reject lots' },
  { key: 'canManageSales', label: 'Factory Sales & Invoicing', group: 'Fish Trade', desc: 'Create delivery dispatches and factory commercial invoices' },
  { key: 'canIssueFuel', label: 'Dispense Fuel to Vessels', group: 'Lake Operations', desc: 'Issue petrol/diesel from tanks to boats and captains' },
  { key: 'canApproveAdvances', label: 'Approve Cash Advances', group: 'Lake Operations', desc: 'Authorize crew emergency loans and daily stipends' },
  { key: 'canManageGear', label: 'Issue Fishing Gear & Assets', group: 'Lake Operations', desc: 'Issue gill nets, solar lamps, ropes and life vests' },
  { key: 'canManageFleet', label: 'Fleet Maintenance Work Orders', group: 'Lake Operations', desc: 'Open boat repair work orders and allocate spare parts' },
  { key: 'canSettleSeason', label: 'Season Settlement & Closing', group: 'Lake Operations', desc: 'Audit final crew accounts and close seasonal statements' },
  { key: 'canViewReports', label: 'Financial & Operational Reports', group: 'Governance & BI', desc: 'View profit margins, branch comparisons and ledgers' },
  { key: 'canManageStaff', label: 'Manage Staff & Security Access', group: 'Governance & BI', desc: 'Create users, modify permissions, reset PINs' },
  { key: 'canExport', label: 'Export Data & Official Documents', group: 'Governance & BI', desc: 'Download CSVs, print FiRCIS permits and share receipts' }
]

export const DEFAULT_ROLE_PERMS = {
  Owner: { canBuy: true, canPay: true, canInspectQuality: true, canManageSales: true, canIssueFuel: true, canApproveAdvances: true, canManageGear: true, canManageFleet: true, canSettleSeason: true, canViewReports: true, canManageStaff: true, canExport: true },
  'General Manager': { canBuy: true, canPay: true, canInspectQuality: true, canManageSales: true, canIssueFuel: true, canApproveAdvances: true, canManageGear: true, canManageFleet: true, canSettleSeason: true, canViewReports: true, canManageStaff: true, canExport: true },
  'Purchasing Officer': { canBuy: true, canPay: false, canInspectQuality: false, canManageSales: false, canIssueFuel: true, canApproveAdvances: false, canManageGear: true, canManageFleet: false, canSettleSeason: false, canViewReports: false, canManageStaff: false, canExport: true },
  'Quality Inspector': { canBuy: false, canPay: false, canInspectQuality: true, canManageSales: false, canIssueFuel: false, canApproveAdvances: false, canManageGear: false, canManageFleet: false, canSettleSeason: false, canViewReports: false, canManageStaff: false, canExport: true },
  Storekeeper: { canBuy: false, canPay: false, canInspectQuality: false, canManageSales: false, canIssueFuel: true, canApproveAdvances: false, canManageGear: true, canManageFleet: true, canSettleSeason: false, canViewReports: false, canManageStaff: false, canExport: false },
  Accountant: { canBuy: false, canPay: true, canInspectQuality: false, canManageSales: true, canIssueFuel: false, canApproveAdvances: true, canManageGear: false, canManageFleet: false, canSettleSeason: true, canViewReports: true, canManageStaff: false, canExport: true },
  'Sales Officer': { canBuy: false, canPay: false, canInspectQuality: false, canManageSales: true, canIssueFuel: false, canApproveAdvances: false, canManageGear: false, canManageFleet: false, canSettleSeason: false, canViewReports: true, canManageStaff: false, canExport: true },
  'Transport Officer': { canBuy: false, canPay: false, canInspectQuality: false, canManageSales: false, canIssueFuel: true, canApproveAdvances: false, canManageGear: false, canManageFleet: true, canSettleSeason: false, canViewReports: false, canManageStaff: false, canExport: false },
  Auditor: { canBuy: false, canPay: false, canInspectQuality: false, canManageSales: false, canIssueFuel: false, canApproveAdvances: false, canManageGear: false, canManageFleet: false, canSettleSeason: false, canViewReports: true, canManageStaff: false, canExport: true }
}

export const getUserAllowedModules = user => {
  if (!user) return []
  if (user.role === 'Owner' || user.role === 'General Manager') {
    return user.customModules && user.customModules.length > 0 ? user.customModules : ALL_MODULE_KEYS
  }
  if (user.customModules && Array.isArray(user.customModules) && user.customModules.length > 0) {
    return user.customModules
  }
  const roleMods = ROLES[user.role]
  if (roleMods === 0 || !roleMods) return ALL_MODULE_KEYS
  return roleMods
}

export const canUserAccessModule = (user, modKey) => {
  if (!user) return false
  if (user.role === 'Owner') return true
  if (user.role === 'General Manager' && (!user.customModules || user.customModules.length === 0)) return true
  const allowed = getUserAllowedModules(user)
  return allowed.includes(modKey)
}

export const canUserDo = (user, actionKey) => {
  if (!user) return false
  if (user.role === 'Owner') return true
  if (user.permissions && typeof user.permissions[actionKey] === 'boolean') {
    return user.permissions[actionKey]
  }
  const def = DEFAULT_ROLE_PERMS[user.role]
  return def ? !!def[actionKey] : false
}

export const uid = p => p + Math.random().toString(36).slice(2, 8)
export const nowL = () => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export const tot = b => (b.kg || 0) * (b.price || 0)
export const trCost = s => (s.trips || []).reduce((t, x) => t + (x.cost || 0), 0)
export const landed = (s, b) => {
  const tripSum = (s.trips || []).filter(t => t.ref === b.id).reduce((a, t) => a + t.cost, 0)
  return b.price + tripSum / (b.kg || 1)
}

export const refLabel = (s, t) => s.batches.find(x => x.id === t.ref)?.no || s.sales.find(x => x.id === t.ref)?.no || '-'

export const supBal = (s, id) => {
  const bought = s.batches.filter(b => b.sup === id).reduce((a, b) => a + tot(b), 0)
  const paid = s.pays.filter(p => p.sup === id).reduce((a, p) => a + p.amt, 0)
  return bought - paid
}

// Central Fisherman Ledger Queries
export const getFishermanLedger = (s, id) => {
  const entries = (s.fishermanLedger || []).filter(e => e.supId === id)
  return entries.sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || '').localeCompare(a.createdAt || ''))
}

export const supAccountStatement = (s, id) => {
  const ledger = (s.fishermanLedger || []).filter(e => e.supId === id && e.status !== 'Reversed')
  
  // Breakdown by source module
  const fuelDebt = ledger.filter(e => e.source === 'fuel').reduce((sum, e) => sum + (e.debit || 0) - (e.credit || 0), 0)
  const maintDebt = ledger.filter(e => e.source === 'maintenance').reduce((sum, e) => sum + (e.debit || 0) - (e.credit || 0), 0)
  const gearDebt = ledger.filter(e => e.source === 'gear').reduce((sum, e) => sum + (e.debit || 0) - (e.credit || 0), 0)
  const foodDebt = ledger.filter(e => e.source === 'catering').reduce((sum, e) => sum + (e.debit || 0) - (e.credit || 0), 0)
  const advancesDebt = ledger.filter(e => e.source === 'advances').reduce((sum, e) => sum + (e.debit || 0) - (e.credit || 0), 0)
  const otherDebt = ledger.filter(e => e.source === 'other').reduce((sum, e) => sum + (e.debit || 0) - (e.credit || 0), 0)

  // Overall ledger recoverable balance (Total Debit - Total Credit)
  const totalDebits = ledger.reduce((sum, e) => sum + (e.debit || 0), 0)
  const totalCredits = ledger.reduce((sum, e) => sum + (e.credit || 0), 0)
  const totalRecoverableDebt = Math.max(0, totalDebits - totalCredits)

  // Fish catch earnings
  const fishOwed = supBal(s, id)
  const totalCatchValue = s.batches.filter(b => b.sup === id).reduce((a, b) => a + tot(b), 0)
  const totalCatchPaid = s.pays.filter(p => p.sup === id).reduce((a, p) => a + p.amt, 0)
  const netBalance = fishOwed - totalRecoverableDebt

  return {
    fishOwed,
    totalCatchValue,
    totalCatchPaid,
    fuelDebt: Math.max(0, fuelDebt),
    maintDebt: Math.max(0, maintDebt),
    gearDebt: Math.max(0, gearDebt),
    foodDebt: Math.max(0, foodDebt),
    advancesDebt: Math.max(0, advancesDebt),
    otherDebt: Math.max(0, otherDebt),
    totalDebt: totalRecoverableDebt,
    netBalance
  }
}

export const supFuelDebt = (s, id) => {
  const stmt = supAccountStatement(s, id)
  return stmt.fuelDebt
}

export const supMaintDebt = (s, id) => {
  const stmt = supAccountStatement(s, id)
  return stmt.maintDebt
}

export const supAdvancesDebt = (s, id) => {
  const stmt = supAccountStatement(s, id)
  return stmt.advancesDebt
}

export const supGearDebt = (s, id) => {
  const stmt = supAccountStatement(s, id)
  return stmt.gearDebt
}

export const supFoodDebt = (s, id) => {
  const stmt = supAccountStatement(s, id)
  return stmt.foodDebt
}

export const getBoatCosts = (s, boatId) => {
  return (s.boatCostLedger || []).filter(c => c.boatId === boatId)
}

export const cusBal = (s, id) => {
  return s.sales.filter(x => x.cus === id).reduce((a, x) => a + (x.kg * x.price) - (x.paid || 0), 0)
}

export const stock = s => {
  const m = {}
  s.batches.filter(b => b.st === 'accepted' && b.rem > 0).forEach(b => {
    const k = b.sp + '|' + (b.grade || 'A')
    m[k] = (m[k] || 0) + b.rem
  })
  return m
}

export const H = s => {
  let h = 5381
  for (const c of 'ft' + s) h = ((h << 5) + h + c.charCodeAt(0)) | 0
  return String(h)
}

const d0 = n => {
  const x = new Date()
  x.setDate(x.getDate() - n)
  return x.toISOString().slice(0, 10)
}

export const PLANS = [
  { id: 'Starter', price: 49000, branches: 1, users: 5, note: 'One landing site branch, purchasing & weighing' },
  { id: 'Business', price: 149000, branches: 5, users: 25, note: 'Multi-branch Lake Victoria value chain + HQ analytics' },
  { id: 'Enterprise', price: 399000, branches: 99, users: 999, note: 'Unlimited branches, cold chain GPS & FiRCIS exports' }
]

export const mkBranch = (site, k = 1, demo = true) => {
  const d = {
    wh: [...COLD_ROOMS],
    audit: [],
    seq: { pur: 126, sal: 85, fuel: 104, wo: 126, set: 41, gear: 101, adv: 101, proj: 101, cat: 101 },
    suppliers: [],
    batches: [],
    pays: [],
    customers: [],
    sales: [],
    exps: [],
    trips: [],
    comp: [],
    seasons: [
      {
        id: 'seas_2026_q1',
        name: 'Season 2026-Q1 (Lake Victoria Main Run)',
        code: '2026-Q1',
        start: d0(60),
        end: d0(-30),
        status: 'Active',
        targetKg: 250000,
        budget: 65000000,
        notes: 'High Nile Perch & Tilapia harvest season across Mwanza, Kigoma, Musoma'
      },
      {
        id: 'seas_2025_q4',
        name: 'Season 2025-Q4 (Nile Perch Peak)',
        code: '2025-Q4',
        start: d0(150),
        end: d0(61),
        status: 'Closed',
        targetKg: 220000,
        budget: 52000000,
        notes: 'Q4 season completed, verified and fully settled'
      }
    ],
    activeSeasonId: 'seas_2026_q1',
    fishermanLedger: [],
    boatCostLedger: [],
    fuelTanks: [
      { id: 'tank_main_petrol', name: 'Main Tank (Petrol)', location: 'Main Landing Dock', fuel: 'Petrol', capacity: 5000, current: 3000, buyPrice: 2850, sellPrice: 3200, unit: 'Litres' },
      { id: 'tank_main_diesel', name: 'Main Tank (Diesel)', location: 'Main Landing Dock', fuel: 'Diesel', capacity: 6000, current: 5000, buyPrice: 2950, sellPrice: 3350, unit: 'Litres' },
      { id: 'tank_depot_petrol', name: 'Depot B (Petrol)', location: 'Kigoma Landing Depot', fuel: 'Petrol', capacity: 2000, current: 1500, buyPrice: 2850, sellPrice: 3200, unit: 'Litres' },
      { id: 'tank_depot_diesel', name: 'Depot B (Diesel)', location: 'Kigoma Landing Depot', fuel: 'Diesel', capacity: 3000, current: 2200, buyPrice: 2950, sellPrice: 3350, unit: 'Litres' }
    ],
    fuelSuppliers: [
      { id: 'fsp0', name: 'Lake Oil Ltd', contact: '028 250 8890', location: 'Kigoma Port Terminal', rep: 'Haruna M.', terms: 'Immediate Delivery Note' },
      { id: 'fsp1', name: 'Oryx Energies Tanzania Ltd', contact: '022 216 0000', location: 'Mwanza Bulk Terminal', rep: 'Salum K.', terms: '14 Days Net' },
      { id: 'fsp2', name: 'TotalEnergies Lake Zone Depot', contact: '028 250 4400', location: 'Kirumba Terminal', rep: 'Amina M.', terms: 'Immediate RTGS' }
    ],
    fuelPurchases: [],
    fuelIssues: [],
    fuelPayments: [],
    fuelAdjustments: [],
    boats: [],
    spareParts: [],
    maintenanceOrders: [],
    maintPayments: [],
    gearItems: [],
    gearIssues: [],
    cateringCooks: [],
    cookAdvances: [],
    cateringExpenses: [],
    boatProjects: [],
    advances: [],
    settlements: [],
    boatCrewAssignments: [],
    kibaluaEngagements: [],
    fishermanExitRecords: [],
    boatExpenseAllocations: [],
    activeBoatId: 'boat0'
  }

  if (!demo) return d

  d.suppliers = [
    {
      id: 's0',
      no: 'SUP-00304',
      name: 'Mzee Juma',
      phone: '0754 289 110',
      site: site || 'Kigoma Landing Site',
      cat: 'Individual Fisherman',
      boat: 'MV Furaha',
      boatId: 'boat0',
      boatReg: 'TZN-304',
      nida: '19740612-44102-00015',
      creditLimit: 3000000,
      status: 'Active',
      totalSupplied: 4200
    },
    {
      id: 's1',
      no: 'SUP-00108',
      name: 'Katonga Beach Fishers Group',
      phone: '0768 991 422',
      site: site || 'Kigoma (Katonga BMU)',
      cat: 'BMU Fishing Group',
      boat: 'Kigoma Star 01',
      boatId: 'boat1',
      boatReg: 'TZN-108',
      nida: '19810315-11029-00032',
      creditLimit: 5000000,
      status: 'Active',
      totalSupplied: 8900
    },
    {
      id: 's2',
      no: 'SUP-00205',
      name: 'Neema Paul & Sons',
      phone: '0713 445 678',
      site: site || 'Musoma (Mwigobero)',
      cat: 'Dealer / Middleman',
      boat: 'MV Victoria Queen',
      boatId: 'boat2',
      boatReg: 'TZN-205',
      nida: '19851120-33201-00041',
      creditLimit: 6000000,
      status: 'Active',
      totalSupplied: 6150
    },
    {
      id: 's3',
      no: 'SUP-00412',
      name: 'Mussa Hamisi',
      phone: '0782 334 112',
      site: site || 'Ukerewe (Nansio)',
      cat: 'Individual Fisherman',
      boat: 'Ziwa Express',
      boatId: 'boat3',
      boatReg: 'TZN-412',
      nida: '19900822-55104-00018',
      creditLimit: 2500000,
      status: 'Active',
      totalSupplied: 3200
    }
  ]

  d.boats = [
    {
      id: 'boat0',
      code: 'FISH-001',
      regNo: 'FISH-001',
      altReg: 'TZN-304',
      name: 'MV Furaha',
      ownerType: 'Company-managed',
      ownerId: 'company',
      captain: 'John Michael',
      operation: 'Company-managed',
      seasonId: 'seas_2026_q1',
      landingSite: 'Kigoma Landing Site',
      engine: 'Yamaha Outboard 40HP 2-Stroke',
      boatType: 'Planked Wooden Mashua (10m)',
      status: 'Active',
      operationalStatus: 'Operational',
      engineHours: 340,
      lastService: d0(14),
      notes: 'Company-managed vessel with 4 permanent crew and occasional Kibalua engagements',
      crewMembers: [
        { name: 'John Michael', role: 'Captain', phone: '0754 289 110', type: 'Permanent' },
        { name: 'Peter Joseph', role: 'Crew', phone: '0768 221 405', type: 'Permanent' },
        { name: 'Musa Ally', role: 'Crew', phone: '0782 119 402', type: 'Permanent' },
        { name: 'Ali Hassan', role: 'Crew', phone: '0755 994 301', type: 'Permanent' }
      ]
    },
    {
      id: 'boat1',
      code: 'FISH-002',
      regNo: 'FISH-002',
      altReg: 'TZN-108',
      name: 'Kigoma Star 01',
      ownerType: 'BMU-owned',
      ownerId: 's1',
      captain: 'Ally Katonga',
      operation: 'BMU-managed',
      seasonId: 'seas_2026_q1',
      landingSite: 'Katonga BMU Beach',
      engine: 'Yamaha 25HP Outboard',
      boatType: 'Fiberglass Fishing Canoe (8m)',
      status: 'Active',
      operationalStatus: 'Operational',
      engineHours: 510,
      lastService: d0(20),
      notes: 'BMU night fishing vessel with pressure lanterns',
      crewMembers: [
        { name: 'Ally Katonga', role: 'Captain', phone: '0768 991 422', type: 'Permanent' },
        { name: 'Rashidi Mwinyi', role: 'Crew', phone: '0755 221 441', type: 'Permanent' }
      ]
    },
    {
      id: 'boat2',
      code: 'FISH-003',
      regNo: 'FISH-003',
      altReg: 'TZN-205',
      name: 'MV Victoria Queen',
      ownerType: 'Company-owned',
      ownerId: 'company',
      captain: 'Capt. Omary',
      operation: 'Company-managed',
      seasonId: 'seas_2026_q1',
      landingSite: 'Mwigobero Pier',
      engine: 'Suzuki 60HP 4-Stroke Lean Burn',
      boatType: 'Heavy Wooden Transport Dhow (12m)',
      status: 'Under Maintenance',
      operationalStatus: 'Under Maintenance',
      engineHours: 780,
      lastService: d0(3),
      notes: 'Company collection vessel for offshore islands',
      crewMembers: [
        { name: 'Capt. Omary', role: 'Captain', phone: '0767 114 990', type: 'Permanent' },
        { name: 'Baraka John', role: 'Crew', phone: '0718 332 441', type: 'Permanent' }
      ]
    },
    {
      id: 'boat3',
      code: 'FISH-004',
      regNo: 'FISH-004',
      altReg: 'TZN-412',
      name: 'Ziwa Express',
      ownerType: 'Fisherman-owned',
      ownerId: 's3',
      captain: 'Mussa Hamisi',
      operation: 'Fisherman-owned',
      seasonId: 'seas_2026_q1',
      landingSite: 'Ukerewe (Nansio)',
      engine: 'Tohatsu 30HP Outboard',
      boatType: 'Planked Canoe (9m)',
      status: 'Active',
      operationalStatus: 'Operational',
      engineHours: 190,
      lastService: d0(30),
      notes: 'Tilapia & Dagaa gill netter',
      crewMembers: [
        { name: 'Mussa Hamisi', role: 'Captain', phone: '0782 334 112', type: 'Permanent' },
        { name: 'Athumani Mussa', role: 'Crew', phone: '0784 991 223', type: 'Permanent' }
      ]
    }
  ]

  d.boatCrewAssignments = [
    {
      id: 'asg_0',
      boatId: 'boat0',
      boatReg: 'FISH-001',
      boatName: 'MV Furaha',
      supId: 's0',
      fishermanName: 'John Michael',
      position: 'Captain',
      accountType: 'Permanent',
      phone: '0754 289 110',
      nida: '19740612-44102-00015',
      seasonId: 'seas_2026_q1',
      startDate: '2026-01-01',
      endDate: null,
      status: 'Active',
      balance: 450000,
      balanceType: 'owed_by_fisherman',
      balanceMeaning: 'Recoverable advances & gear debt owed to company',
      rateAgreement: 'Vessel Master Catch Share (40%) + Allowance',
      totalTrips: 42,
      totalDeliveredKg: 4200,
      notes: 'Designated Captain / Vessel Master for MV Furaha'
    },
    {
      id: 'asg_1',
      boatId: 'boat0',
      boatReg: 'FISH-001',
      boatName: 'MV Furaha',
      supId: 's_peter',
      fishermanName: 'Peter Joseph',
      position: 'Crew',
      accountType: 'Permanent',
      phone: '0768 221 405',
      nida: '19880415-33102-00021',
      seasonId: 'seas_2026_q1',
      startDate: '2026-01-01',
      endDate: null,
      status: 'Active',
      balance: 180000,
      balanceType: 'owed_by_fisherman',
      balanceMeaning: 'Recoverable cash advance & ration debt',
      rateAgreement: 'Standard Crew Catch Share (20%)',
      totalTrips: 40,
      totalDeliveredKg: 4050,
      notes: 'Net hauler and deck leader'
    },
    {
      id: 'asg_2',
      boatId: 'boat0',
      boatReg: 'FISH-001',
      boatName: 'MV Furaha',
      supId: 's_david',
      fishermanName: 'David Paulo',
      position: 'Crew',
      accountType: 'Permanent',
      phone: '0714 559 881',
      nida: '19920311-22104-00045',
      seasonId: 'seas_2026_q1',
      startDate: '2026-01-01',
      endDate: '2026-03-20',
      status: 'Exited',
      balance: 320000,
      balanceType: 'owed_by_fisherman',
      balanceMeaning: 'Unsettled cash advances preserved on central ledger',
      rateAgreement: 'Standard Crew Catch Share (20%)',
      totalTrips: 26,
      totalDeliveredKg: 2800,
      notes: 'Assignment closed on March 20; left company. Exit record preserved for settlement.'
    },
    {
      id: 'asg_3',
      boatId: 'boat0',
      boatReg: 'FISH-001',
      boatName: 'MV Furaha',
      supId: 's_musa',
      fishermanName: 'Musa Ally',
      position: 'Crew',
      accountType: 'Permanent',
      phone: '0782 119 402',
      nida: '19951108-11203-00033',
      seasonId: 'seas_2026_q1',
      startDate: '2026-01-01',
      endDate: null,
      status: 'Active',
      balance: 90000,
      balanceType: 'owed_by_fisherman',
      balanceMeaning: 'Emergency medical advance balance',
      rateAgreement: 'Standard Crew Catch Share (20%)',
      totalTrips: 38,
      totalDeliveredKg: 3900,
      notes: 'Engine assistant and line handler'
    },
    {
      id: 'asg_4',
      boatId: 'boat0',
      boatReg: 'FISH-001',
      boatName: 'MV Furaha',
      supId: 's_ali',
      fishermanName: 'Ali Hassan',
      position: 'Crew',
      accountType: 'Permanent',
      phone: '0755 994 301',
      nida: '19900914-44102-00088',
      seasonId: 'seas_2026_q1',
      startDate: '2026-03-22',
      endDate: null,
      status: 'Active',
      balance: 50000,
      balanceType: 'owed_by_fisherman',
      balanceMeaning: 'Onboarding equipment allocation debt',
      rateAgreement: 'Standard Crew Catch Share (20%)',
      totalTrips: 18,
      totalDeliveredKg: 1950,
      notes: 'Joined in late March as permanent replacement crew for David Paulo'
    },
    {
      id: 'asg_5',
      boatId: 'boat1',
      boatReg: 'FISH-002',
      boatName: 'Kigoma Star 01',
      supId: 's1',
      fishermanName: 'Ally Katonga',
      position: 'Captain',
      accountType: 'Permanent',
      phone: '0768 991 422',
      seasonId: 'seas_2026_q1',
      startDate: '2026-01-01',
      endDate: null,
      status: 'Active',
      balance: 210000,
      balanceType: 'owed_by_fisherman',
      balanceMeaning: 'Fuel advance balance',
      rateAgreement: 'BMU Fleet Master Share',
      totalTrips: 34,
      totalDeliveredKg: 5400,
      notes: 'BMU night fishing leader'
    },
    {
      id: 'asg_6',
      boatId: 'boat1',
      boatReg: 'FISH-002',
      boatName: 'Kigoma Star 01',
      supId: 's_rashidi',
      fishermanName: 'Rashidi Mwinyi',
      position: 'Crew',
      accountType: 'Permanent',
      phone: '0755 221 441',
      seasonId: 'seas_2026_q1',
      startDate: '2026-01-01',
      endDate: null,
      status: 'Active',
      balance: 85000,
      balanceType: 'owed_by_fisherman',
      balanceMeaning: 'Ration allocation',
      rateAgreement: 'BMU Crew Share',
      totalTrips: 32,
      totalDeliveredKg: 4900,
      notes: 'Dagaa seine net operator'
    }
  ]

  d.kibaluaEngagements = [
    {
      id: 'kib_0',
      no: 'KIB-00101',
      boatId: 'boat0',
      boatReg: 'FISH-001',
      boatName: 'MV Furaha',
      fishermanName: 'Hassan Omari',
      phone: '0769 334 118',
      position: 'Crew (Kibalua)',
      engagementType: 'Kibalua',
      durationDays: 5,
      startDate: '2026-04-10',
      endDate: '2026-04-15',
      dailyRate: 25000,
      grossPayable: 125000,
      advancePaid: 25000,
      allocatedExpenses: 0,
      remainingPayable: 100000,
      tripsCount: 4,
      paymentStatus: 'Pending Payment',
      status: 'Completed',
      seasonId: 'seas_2026_q1',
      notes: '5-day deep water night expedition; completed all 4 night runs. Remaining TZS 100,000 payable.'
    },
    {
      id: 'kib_1',
      no: 'KIB-00102',
      boatId: 'boat0',
      boatReg: 'FISH-001',
      boatName: 'MV Furaha',
      fishermanName: 'Kassim Said',
      phone: '0712 884 902',
      position: 'Crew (Kibalua)',
      engagementType: 'Kibalua',
      durationDays: 2,
      startDate: '2026-11-06',
      endDate: '2026-11-08',
      dailyRate: 30000,
      grossPayable: 60000,
      advancePaid: 15000,
      allocatedExpenses: 5000,
      remainingPayable: 40000,
      tripsCount: 2,
      paymentStatus: 'Active',
      status: 'Active',
      seasonId: 'seas_2026_q1',
      notes: '2-day moonless night net repair & hauling specialist'
    },
    {
      id: 'kib_2',
      no: 'KIB-00103',
      boatId: 'boat1',
      boatReg: 'FISH-002',
      boatName: 'Kigoma Star 01',
      fishermanName: 'Juma Ramadhani',
      phone: '0788 123 456',
      position: 'Crew (Kibalua)',
      engagementType: 'Kibalua',
      durationDays: 1,
      startDate: '2026-11-07',
      endDate: '2026-11-07',
      dailyRate: 25000,
      grossPayable: 25000,
      advancePaid: 0,
      allocatedExpenses: 0,
      remainingPayable: 25000,
      tripsCount: 1,
      paymentStatus: 'Pending Payment',
      status: 'Completed',
      seasonId: 'seas_2026_q1',
      notes: '1-day single night replacement crew for Katonga beach'
    }
  ]

  d.fishermanExitRecords = [
    {
      id: 'exit_david',
      assignmentId: 'asg_2',
      boatId: 'boat0',
      boatReg: 'FISH-001',
      boatName: 'MV Furaha',
      fishermanName: 'David Paulo',
      supId: 's_david',
      phone: '0714 559 881',
      position: 'Crew',
      lastWorkingDate: '2026-03-20',
      reason: 'Resigned',
      outstandingAdvances: 320000,
      unreturnedGear: 'None (all 2 nets returned to store)',
      finalBalanceDue: 320000,
      approvedBy: 'Asha Komba (Manager)',
      approvedDate: '2026-03-21',
      status: 'Approved & Retained on Ledger',
      notes: 'David left company in March to relocate to Mwanza. Unsettled balance of TZS 320,000 retained on central ledger for season settlement.'
    }
  ]

  d.boatExpenseAllocations = [
    {
      id: 'alloc_001',
      boatId: 'boat0',
      boatReg: 'FISH-001',
      boatName: 'MV Furaha',
      date: '2026-11-04',
      seasonId: 'seas_2026_q1',
      expenseType: 'Food & Catering',
      description: 'Crew rations for 3-day deep lake expedition (Flour, beans, rice, dried sardines)',
      totalAmount: 100000,
      rule: 'Equal allocation',
      splitItems: [
        { supId: 's0', name: 'John Michael', role: 'Captain', amount: 25000, status: 'Posted to Ledger' },
        { supId: 's_peter', name: 'Peter Joseph', role: 'Crew', amount: 25000, status: 'Posted to Ledger' },
        { supId: 's_musa', name: 'Musa Ally', role: 'Crew', amount: 25000, status: 'Posted to Ledger' },
        { supId: 's_ali', name: 'Ali Hassan', role: 'Crew', amount: 25000, status: 'Posted to Ledger' }
      ],
      postedBy: 'Asha Komba (Manager)',
      notes: 'Allocated equally among 4 active crew members (TZS 25,000 each) and debited to individual statements.'
    }
  ]

  d.spareParts = [
    { id: 'sp_spark', name: 'NGK Marine Spark Plug B7HS-10', partNo: 'NGK-B7HS', category: 'Ignition', stock: 42, minStock: 10, unitCost: 8500, sellPrice: 12000, unit: 'pcs' },
    { id: 'sp_oil2t', name: 'Yamalube 2-Stroke Outboard Marine Oil (1L)', partNo: 'YAM-2T-1L', category: 'Lubricants', stock: 118, minStock: 25, unitCost: 18000, sellPrice: 24000, unit: 'Litres' },
    { id: 'sp_prop', name: 'Yamaha 40HP Aluminum Propeller (11 1/8 x 13)', partNo: 'YAM-PROP-40', category: 'Propulsion', stock: 5, minStock: 2, unitCost: 190000, sellPrice: 245000, unit: 'pcs' },
    { id: 'sp_batt', name: 'Marine Sealed 12V 75Ah Deep Cycle Battery', partNo: 'BAT-12V75', category: 'Electrical', stock: 7, minStock: 3, unitCost: 210000, sellPrice: 275000, unit: 'pcs' },
    { id: 'sp_gear', name: 'Yamaha Marine Gear Lube Tube 350ml', partNo: 'GEAR-350', category: 'Lubricants', stock: 33, minStock: 8, unitCost: 14000, sellPrice: 19500, unit: 'tubes' },
    { id: 'sp_rope', name: 'Braided High-Tensile Marine Line 12mm (100m)', partNo: 'ROP-12-100', category: 'Rigging', stock: 14, minStock: 4, unitCost: 95000, sellPrice: 130000, unit: 'rolls' }
  ]

  d.fuelPurchases = [
    { id: 'fp0', no: 'FP-00127', date: d0(5), supId: 'fsp0', supName: 'Lake Oil Ltd', tankId: 'tank_main_petrol', fuel: 'Petrol', litres: 5000, costPerL: 2900, total: 14500000, docRef: 'DN-8891.pdf', status: 'Paid' },
    { id: 'fp1', no: 'FP-00126', date: d0(7), supId: 'fsp1', supName: 'Oryx Energies Tanzania Ltd', tankId: 'tank_main_diesel', fuel: 'Diesel', litres: 8000, costPerL: 2950, total: 23600000, docRef: 'DN-ORYX-4412', status: 'Partial' },
    { id: 'fp2', no: 'FP-00125', date: d0(10), supId: 'fsp0', supName: 'Lake Oil Ltd', tankId: 'tank_depot_petrol', fuel: 'Petrol', litres: 3000, costPerL: 2900, total: 8700000, docRef: 'DN-8840.pdf', status: 'Paid' }
  ]

  d.fuelIssues = [
    { id: 'fi0', no: 'FUEL-001458', date: d0(2), at: d0(2) + 'T08:32', supId: 's0', boatId: 'boat0', boatReg: 'TZN-304', tankId: 'tank_main_petrol', fuel: 'Petrol', litres: 100, price: 3200, total: 320000, paid: 100000, balance: 220000, arrangement: 'Partial', issuedBy: 'Staff 01 (Hamisi)', notes: 'Morning fishing trip to Ukerewe deep waters' },
    { id: 'fi1', no: 'FUEL-001457', date: d0(3), at: d0(3) + 'T07:15', supId: 's0', boatId: 'boat0', boatReg: 'TZN-304', tankId: 'tank_main_petrol', fuel: 'Petrol', litres: 75, price: 3200, total: 240000, paid: 0, balance: 240000, arrangement: 'By Fish Delivery', issuedBy: 'Staff 01 (Hamisi)', notes: 'Mid-lake Nile perch run' },
    { id: 'fi2', no: 'FUEL-001456', date: d0(5), at: d0(5) + 'T06:45', supId: 's0', boatId: 'boat0', boatReg: 'TZN-304', tankId: 'tank_main_petrol', fuel: 'Petrol', litres: 50, price: 3200, total: 160000, paid: 0, balance: 160000, arrangement: 'By Fish Delivery', issuedBy: 'Staff 01 (Hamisi)', notes: 'Kigoma deep drop' },
    { id: 'fi3', no: 'FUEL-001455', date: d0(7), at: d0(7) + 'T07:30', supId: 's0', boatId: 'boat0', boatReg: 'TZN-304', tankId: 'tank_main_petrol', fuel: 'Petrol', litres: 100, price: 3200, total: 320000, paid: 0, balance: 320000, arrangement: 'End of Season', issuedBy: 'Staff 01 (Hamisi)', notes: 'Initial season opening issue' },
    { id: 'fi4', no: 'FUEL-001454', date: d0(1), at: d0(1) + 'T08:00', supId: 's1', boatId: 'boat1', boatReg: 'TZN-108', tankId: 'tank_main_petrol', fuel: 'Petrol', litres: 60, price: 3200, total: 192000, paid: 0, balance: 192000, arrangement: 'By Fish Delivery', issuedBy: 'Staff 01 (Hamisi)', notes: 'Dagaa night light fishing' },
    { id: 'fi5', no: 'FUEL-001453', date: d0(0), at: d0(0) + 'T09:10', supId: 's3', boatId: 'boat3', boatReg: 'TZN-412', tankId: 'tank_main_petrol', fuel: 'Petrol', litres: 40, price: 3200, total: 128000, paid: 128000, balance: 0, arrangement: 'Cash', issuedBy: 'Staff 01 (Hamisi)', notes: 'Cash payment at pump' }
  ]

  d.fuelPayments = [
    { id: 'fp0', supId: 's0', amt: 100000, m: 'Cash Payment', date: d0(2), ref: 'CASH-0021', notes: 'Direct cash payment at pump counter' }
  ]

  d.maintenanceOrders = [
    { id: 'wo0', no: 'WO-000125', date: d0(3), boatId: 'boat2', supId: 'company', title: 'Complete 250hr Service & Lower Unit Oil Change', fault: 'Scheduled engine maintenance and propeller shaft seal inspection', mechanic: 'Fundi Rashidi (Mwanza Marine Workshop)', status: 'In Progress', arrangement: 'Company-paid', parts: [{ partId: 'sp_gear', name: 'Yamaha Marine Gear Lube', qty: 2, cost: 39000 }, { partId: 'sp_spark', name: 'NGK Marine Spark Plug', qty: 3, cost: 36000 }], partsCost: 75000, laborCost: 80000, otherCost: 25000, totalCost: 180000, recoverable: 0, recovered: 0 },
    { id: 'wo1', no: 'WO-000124', date: d0(7), boatId: 'boat0', supId: 's0', title: 'Yamaha 40HP Propeller Replacement & Carb Tuning', fault: 'Propeller blades damaged by rocky reef near Ukerewe Island; engine misfiring at high RPM', mechanic: 'Fundi Rashidi', status: 'Completed', arrangement: 'Company-assisted (Deduct from fish)', parts: [{ partId: 'sp_prop', name: 'Yamaha 40HP Propeller', qty: 1, cost: 245000 }, { partId: 'sp_spark', name: 'NGK Marine Spark Plug', qty: 2, cost: 24000 }], partsCost: 269000, laborCost: 70000, otherCost: 0, totalCost: 339000, recoverable: 339000, recovered: 139000 }
  ]

  // Gear & Equipment Catalog & Issued Inventory
  d.gearItems = [
    { id: 'gi_net_np', name: 'Monofilament Gill Net 6-inch (100m)', category: 'Reusable', stock: 24, minStock: 5, unitCost: 85000, sellPrice: 110000, unit: 'nets', condition: 'Good' },
    { id: 'gi_net_dagaa', name: 'Dagaa Seine Net Mosquito Mesh (50m)', category: 'Reusable', stock: 12, minStock: 3, unitCost: 190000, sellPrice: 240000, unit: 'nets', condition: 'Good' },
    { id: 'gi_rope_poly', name: 'Polypropylene Marine Anchor Rope 14mm (100m roll)', category: 'Reusable', stock: 18, minStock: 4, unitCost: 75000, sellPrice: 95000, unit: 'rolls', condition: 'Good' },
    { id: 'gi_lamp_solar', name: 'Night Fishing Pressure Solar LED Lamp 50W', category: 'Asset', stock: 30, minStock: 6, unitCost: 140000, sellPrice: 180000, unit: 'units', condition: 'New' },
    { id: 'gi_gps_finder', name: 'Garmin Striker 4 GPS Fish Finder with Transducer', category: 'Asset', stock: 6, minStock: 2, unitCost: 450000, sellPrice: 550000, unit: 'units', condition: 'New' },
    { id: 'gi_hook_box', name: 'Mustad Longline Marine Hooks Size 8 (Box of 100)', category: 'Consumable', stock: 85, minStock: 15, unitCost: 22000, sellPrice: 30000, unit: 'boxes', condition: 'New' },
    { id: 'gi_float_cork', name: 'High-Density EVA Fishing Floats (Pack of 50)', category: 'Consumable', stock: 40, minStock: 10, unitCost: 35000, sellPrice: 48000, unit: 'packs', condition: 'New' },
    { id: 'gi_vest_marine', name: 'SOLAS Approved Marine Life Jacket (Adult 150N)', category: 'Asset', stock: 50, minStock: 10, unitCost: 40000, sellPrice: 50000, unit: 'pieces', condition: 'New' }
  ]

  d.gearIssues = [
    {
      id: 'giss0',
      no: 'GEAR-00021',
      date: d0(4),
      supId: 's0',
      boatId: 'boat0',
      seasonId: 'seas_2026_q1',
      items: [{ itemId: 'gi_net_np', name: 'Monofilament Gill Net 6-inch', qty: 2, price: 110000, cost: 220000 }],
      totalCost: 220000,
      paid: 40000,
      recoverable: 180000,
      arrangement: 'Fisherman-recoverable (Credit)',
      status: 'Issued',
      conditionOnIssue: 'New',
      returnedQty: 0,
      issuedBy: 'Baraka Mussa (Storekeeper)',
      notes: 'Issued before moonless night expedition'
    },
    {
      id: 'giss1',
      no: 'GEAR-00020',
      date: d0(8),
      supId: 's1',
      boatId: 'boat1',
      seasonId: 'seas_2026_q1',
      items: [{ itemId: 'gi_lamp_solar', name: 'Pressure Solar LED Lamp', qty: 2, price: 180000, cost: 360000 }],
      totalCost: 360000,
      paid: 360000,
      recoverable: 0,
      arrangement: 'Company-funded',
      status: 'Issued',
      conditionOnIssue: 'New',
      returnedQty: 0,
      issuedBy: 'Baraka Mussa (Storekeeper)',
      notes: 'BMU safety equipment upgrade'
    }
  ]

  // Food & Catering Management (Mama Mpishi)
  d.cateringCooks = [
    { id: 'ck0', name: 'Mama Neema (Neema Juma)', phone: '0754 331 992', site: 'Kirumba Mwaloni Dock', assignedBoats: ['boat0', 'boat2'], rating: 'Reliable' },
    { id: 'ck1', name: 'Bi Zainab Ally', phone: '0714 882 119', site: 'Katonga BMU Landing', assignedBoats: ['boat1', 'boat3'], rating: 'Experienced' }
  ]

  d.cookAdvances = [
    {
      id: 'ca0',
      no: 'CADV-00101',
      date: d0(3),
      cookId: 'ck0',
      amountIssued: 150000,
      actualExpenditure: 125000,
      moneyReturned: 25000,
      status: 'Reconciled',
      purpose: 'Daily crew ingredients, maize flour, cooking oil, beans & fresh vegetables',
      receiptDoc: 'RECEIPT-MKT-4412.jpg',
      allocatedBoats: ['boat0', 'boat2'],
      issuedBy: 'Hamisi Ally (Accountant)',
      notes: 'Mama Neema returned TZS 25,000 cash balance directly to accountant cashbox.'
    },
    {
      id: 'ca1',
      no: 'CADV-00102',
      date: d0(1),
      cookId: 'ck1',
      amountIssued: 120000,
      actualExpenditure: 120000,
      moneyReturned: 0,
      status: 'Reconciled',
      purpose: 'Night light fishing crew rations (Kigoma BMU)',
      receiptDoc: 'RECEIPT-KAT-09.jpg',
      allocatedBoats: ['boat1'],
      issuedBy: 'Hamisi Ally (Accountant)',
      notes: 'Full advance accounted for.'
    }
  ]

  d.cateringExpenses = [
    {
      id: 'cat0',
      no: 'CAT-00045',
      date: d0(3),
      cookId: 'ck0',
      advanceRef: 'CADV-00101',
      seasonId: 'seas_2026_q1',
      mealsCount: 24,
      crewSize: 6,
      mealType: 'Breakfast & Hot Lunch Stew',
      totalSpent: 125000,
      boatAllocations: [
        { boatId: 'boat0', supId: 's0', cost: 75000, recoverable: 75000 },
        { boatId: 'boat2', supId: 'company', cost: 50000, recoverable: 0 }
      ],
      arrangement: 'Fisherman-recoverable (Catch Deduction)',
      notes: 'Ugali, beans, fresh vegetables and spiced tea for 2 boats'
    }
  ]

  // Boat Construction & Investment Projects
  d.boatProjects = [
    {
      id: 'bp0',
      name: 'New 12-Metre Deep-Water Mashua (MV Ushindi II)',
      projectNo: 'PROJ-BOAT-001',
      builder: 'Fundi Mzee Selemani (Kirumba Boat Yard)',
      builderPhone: '0754 990 123',
      seasonId: 'seas_2026_q1',
      assignedSupId: 's0',
      targetBoatName: 'MV Ushindi II',
      status: 'In Progress',
      progressPct: 65,
      startDate: d0(60),
      targetCompletion: d0(-30),
      costBreakdown: {
        timberMaterials: 3500000,
        labour: 1800000,
        engine: 4200000,
        equipment: 650000,
        total: 10150000
      },
      paidStages: 6500000,
      balanceToPay: 3650000,
      ownershipType: 'Company Asset with Fisherman Hire-Purchase',
      contractualRecoverable: 4000000,
      repaymentTerms: '20% deduction from agreed fish catch over 2 seasons',
      stages: [
        { name: 'Keel Laying & Timber Framing', cost: 2500000, status: 'Completed', date: d0(55) },
        { name: 'Hardwood Hull Planking & Caulking', cost: 2500000, status: 'Completed', date: d0(30) },
        { name: 'Marine Engine Installation (Yamaha 40HP)', cost: 3500000, status: 'In Progress', date: d0(5) },
        { name: 'Deck Fiberglassing & Painting', cost: 1000000, status: 'Pending', date: d0(-15) },
        { name: 'Sea Trials & Marine Licensing', cost: 650000, status: 'Pending', date: d0(-25) }
      ],
      notes: 'High-tensile mninga wood hull for offshore night fishing.'
    }
  ]

  // Fisherman Cash Advances & Daily Matumizi
  d.advances = [
    {
      id: 'adv0',
      no: 'ADV-00101',
      date: d0(4),
      at: d0(4) + 'T09:30',
      supId: 's0',
      boatId: 'boat0',
      seasonId: 'seas_2026_q1',
      amount: 150000,
      category: 'Daily Matumizi',
      purpose: 'Crew daily meal stipends & family emergency',
      method: 'M-Pesa (Mobile Money)',
      phone: '0754 289 110',
      status: 'Approved',
      classification: 'Fisherman-recoverable',
      approvedBy: 'Asha Komba (Manager)',
      recovered: 0,
      notes: 'Approved by GM Asha Komba'
    },
    {
      id: 'adv1',
      no: 'ADV-00102',
      date: d0(6),
      at: d0(6) + 'T14:15',
      supId: 's1',
      boatId: 'boat1',
      seasonId: 'seas_2026_q1',
      amount: 250000,
      category: 'Emergency / Medical',
      purpose: 'Hospitalization for crew first mate child',
      method: 'Airtel Money',
      phone: '0768 991 422',
      status: 'Approved',
      classification: 'Fisherman-recoverable',
      approvedBy: 'Asha Komba (Manager)',
      recovered: 50000,
      notes: 'Emergency disbursement, partial repayment logged'
    },
    {
      id: 'adv2',
      no: 'ADV-00103',
      date: d0(1),
      at: d0(1) + 'T10:00',
      supId: 's3',
      boatId: 'boat3',
      seasonId: 'seas_2026_q1',
      amount: 100000,
      category: 'Daily Matumizi',
      purpose: 'Net repair twine & crew lunch',
      method: 'Cash',
      phone: '0782 334 112',
      status: 'Pending Approval',
      classification: 'Fisherman-recoverable',
      approvedBy: '',
      recovered: 0,
      notes: 'Waiting for manager sign-off'
    }
  ]

  // Central Fisherman Financial Ledger Entries
  d.fishermanLedger = [
    {
      id: 'fl_01',
      supId: 's0',
      boatId: 'boat0',
      seasonId: 'seas_2026_q1',
      date: d0(2),
      type: 'Fuel Issued',
      debit: 320000,
      credit: 0,
      source: 'fuel',
      refId: 'fi0',
      ref: 'FUEL-001458',
      notes: 'Issued 100L Petrol for MV Furaha',
      createdBy: 'Hamisi Ally (Accountant)',
      status: 'Approved',
      createdAt: d0(2) + 'T08:32:00'
    },
    {
      id: 'fl_02',
      supId: 's0',
      boatId: 'boat0',
      seasonId: 'seas_2026_q1',
      date: d0(2),
      type: 'Cash Payment',
      debit: 0,
      credit: 100000,
      source: 'fuel',
      refId: 'fp0',
      ref: 'CASH-0021',
      notes: 'Direct cash payment at pump counter',
      createdBy: 'Staff 01 (Hamisi)',
      status: 'Approved',
      createdAt: d0(2) + 'T08:35:00'
    },
    {
      id: 'fl_03',
      supId: 's0',
      boatId: 'boat0',
      seasonId: 'seas_2026_q1',
      date: d0(7),
      type: 'Maintenance Repair',
      debit: 339000,
      credit: 0,
      source: 'maintenance',
      refId: 'wo1',
      ref: 'WO-000124',
      notes: 'Yamaha 40HP Propeller replacement (Recoverable)',
      createdBy: 'Asha Komba (Manager)',
      status: 'Approved',
      createdAt: d0(7) + 'T10:00:00'
    },
    {
      id: 'fl_04',
      supId: 's0',
      boatId: 'boat0',
      seasonId: 'seas_2026_q1',
      date: d0(4),
      type: 'Cash Advance',
      debit: 150000,
      credit: 0,
      source: 'advances',
      refId: 'adv0',
      ref: 'ADV-00101',
      notes: 'Crew daily meal stipends & family emergency',
      createdBy: 'Asha Komba (Manager)',
      status: 'Approved',
      createdAt: d0(4) + 'T09:30:00'
    },
    {
      id: 'fl_05',
      supId: 's0',
      boatId: 'boat0',
      seasonId: 'seas_2026_q1',
      date: d0(4),
      type: 'Gear Issued',
      debit: 180000,
      credit: 0,
      source: 'gear',
      refId: 'giss0',
      ref: 'GEAR-00021',
      notes: '2x Monofilament Gill Nets (Recoverable credit)',
      createdBy: 'Baraka Mussa (Storekeeper)',
      status: 'Approved',
      createdAt: d0(4) + 'T11:00:00'
    },
    {
      id: 'fl_06',
      supId: 's0',
      boatId: 'boat0',
      seasonId: 'seas_2026_q1',
      date: d0(3),
      type: 'Food & Catering',
      debit: 75000,
      credit: 0,
      source: 'catering',
      refId: 'cat0',
      ref: 'CAT-00045',
      notes: 'Crew meals & offshore provisions via Mama Neema',
      createdBy: 'Hamisi Ally (Accountant)',
      status: 'Approved',
      createdAt: d0(3) + 'T12:00:00'
    },
    {
      id: 'fl_07',
      supId: 's1',
      boatId: 'boat1',
      seasonId: 'seas_2026_q1',
      date: d0(6),
      type: 'Cash Advance',
      debit: 250000,
      credit: 0,
      source: 'advances',
      refId: 'adv1',
      ref: 'ADV-00102',
      notes: 'Emergency hospitalization advance for crew first mate',
      createdBy: 'Asha Komba (Manager)',
      status: 'Approved',
      createdAt: d0(6) + 'T14:15:00'
    },
    {
      id: 'fl_08',
      supId: 's1',
      boatId: 'boat1',
      seasonId: 'seas_2026_q1',
      date: d0(5),
      type: 'Cash Advance Repayment',
      debit: 0,
      credit: 50000,
      source: 'advances',
      refId: 'adv1_p1',
      ref: 'REPAY-001',
      notes: 'Direct cash recovery from fisherman',
      createdBy: 'Hamisi Ally (Accountant)',
      status: 'Approved',
      createdAt: d0(5) + 'T16:00:00'
    },
    {
      id: 'fl_09',
      supId: 's1',
      boatId: 'boat1',
      seasonId: 'seas_2026_q1',
      date: d0(1),
      type: 'Fuel Issued',
      debit: 192000,
      credit: 0,
      source: 'fuel',
      refId: 'fi4',
      ref: 'FUEL-001454',
      notes: '60L Petrol issued for Dagaa night light voyage',
      createdBy: 'Staff 01 (Hamisi)',
      status: 'Approved',
      createdAt: d0(1) + 'T08:00:00'
    }
  ]

  // Boat Cost Ledger
  d.boatCostLedger = [
    { id: 'bc0', boatId: 'boat0', seasonId: 'seas_2026_q1', date: d0(2), cat: 'Fuel', cost: 320000, allocation: 'Fisherman-recoverable', ref: 'FUEL-001458', notes: '100L Petrol issued' },
    { id: 'bc1', boatId: 'boat0', seasonId: 'seas_2026_q1', date: d0(7), cat: 'Maintenance', cost: 339000, allocation: 'Fisherman-recoverable', ref: 'WO-000124', notes: 'Propeller replacement & tuning' },
    { id: 'bc2', boatId: 'boat0', seasonId: 'seas_2026_q1', date: d0(4), cat: 'Gear', cost: 220000, allocation: 'Fisherman-recoverable', ref: 'GEAR-00021', notes: '2x Gill Nets issued' },
    { id: 'bc3', boatId: 'boat0', seasonId: 'seas_2026_q1', date: d0(3), cat: 'Food', cost: 75000, allocation: 'Fisherman-recoverable', ref: 'CAT-00045', notes: 'Crew rations' },
    { id: 'bc4', boatId: 'boat2', seasonId: 'seas_2026_q1', date: d0(3), cat: 'Maintenance', cost: 180000, allocation: 'Company-funded', ref: 'WO-000125', notes: 'Company collection vessel 250hr service' },
    { id: 'bc5', boatId: 'boat1', seasonId: 'seas_2026_q1', date: d0(1), cat: 'Fuel', cost: 192000, allocation: 'Fisherman-recoverable', ref: 'FUEL-001454', notes: '60L Petrol night run' }
  ]

  d.customers = [
    { id: 'c0', code: 'IND-01', name: 'ABC Fish Processing Ltd', phone: '028 250 0110', location: 'Nyakato Industrial Area, Mwanza', limit: 40000000, contact: 'Mr. Patrick Temba' },
    { id: 'c1', code: 'IND-02', name: 'Victoria Perch Exporters Ltd', phone: '028 254 0220', location: 'Ilemela Port Road, Mwanza', limit: 35000000, contact: 'Grace Minja' },
    { id: 'c2', code: 'IND-03', name: 'TanFish Cold Chains Dar', phone: '022 212 9000', location: 'Kurasini Harbor, Dar es Salaam', limit: 25000000, contact: 'Ally Rashid' }
  ]

  const sampleData = [
    { sp: 'Nile Perch', grade: 'A', kg: 1400, price: 8200, sup: 's0', daysAgo: 14, temp: 1.8, wh: d.wh[0] },
    { sp: 'Nile Perch', grade: 'A', kg: 1200, price: 8000, sup: 's1', daysAgo: 11, temp: 2.1, wh: d.wh[0] },
    { sp: 'Tilapia', grade: 'A', kg: 850, price: 5400, sup: 's2', daysAgo: 8, temp: 1.9, wh: d.wh[1] },
    { sp: 'Dagaa (Sardines)', grade: 'Standard', kg: 950, price: 2600, sup: 's1', daysAgo: 6, temp: 2.4, wh: d.wh[0] },
    { sp: 'Nile Perch', grade: 'B', kg: 600, price: 6800, sup: 's3', daysAgo: 4, temp: 2.8, wh: d.wh[0] },
    { sp: 'Tilapia', grade: 'A', kg: 700, price: 5200, sup: 's0', daysAgo: 2, temp: 2.0, wh: d.wh[1] },
    { sp: 'Nile Perch', grade: 'A', kg: 550, price: 8100, sup: 's2', daysAgo: 0, temp: 2.2, wh: d.wh[0], pending: true }
  ]

  sampleData.forEach((item, idx) => {
    const dt = d0(item.daysAgo)
    const isPending = item.pending
    const sold = isPending ? 0 : Math.round(item.kg * 0.65)
    const rem = isPending ? 0 : item.kg - sold
    const batchId = 'b' + idx
    const purNo = 'PUR-000' + (120 + idx)

    d.batches.push({
      id: batchId,
      no: 'BATCH-' + String(idx + 1).padStart(3, '0'),
      pur: purNo,
      sup: item.sup,
      sp: item.sp,
      grade: item.grade,
      kg: item.kg,
      rem: rem,
      price: item.price,
      date: dt,
      at: dt + 'T07:45',
      site: site || 'Mwanza (Kirumba Mwaloni)',
      wh: item.wh,
      st: isPending ? 'pending' : 'accepted',
      rej: isPending ? 0 : 25,
      temp: item.temp,
      insp: dt,
      tare: 12.5,
      crates: Math.round(item.kg / 40)
    })

    // Payments to fishermen
    const totalCost = item.kg * item.price
    d.pays.push({
      id: 'p' + idx,
      sup: item.sup,
      amt: Math.round(totalCost * 0.8),
      m: idx % 2 === 0 ? 'M-Pesa (Mobile Money)' : 'Cash Voucher',
      date: dt,
      ref: 'PAY-' + (500 + idx)
    })

    // Sales to Industry
    if (!isPending && sold > 0) {
      const salePrice = Math.round(item.price * 1.35)
      const saleTotal = sold * salePrice
      const paid = Math.round(saleTotal * 0.75)
      const saleDate = d0(Math.max(0, item.daysAgo - 2))
      const salId = 'x' + idx
      const salNo = 'SAL-0000' + (80 + idx)

      d.sales.push({
        id: salId,
        no: salNo,
        cus: idx % 2 === 0 ? 'c0' : 'c1',
        sp: item.sp,
        grade: item.grade,
        kg: sold,
        price: salePrice,
        paid: paid,
        cogs: sold * item.price,
        date: saleDate,
        at: saleDate + 'T14:30',
        alloc: [{ b: batchId, kg: sold }],
        dis: {
          st: idx === 0 ? 'Delivered' : 'In transit',
          veh: 'T ' + (230 + idx) + ' DKN (KYC 3-Ton Refrigerated)',
          drv: 'Juma Ramadhani'
        }
      })

      d.trips.push({
        id: 't' + idx,
        type: 'Industry Delivery',
        mode: 'KYC Refrigerated Truck',
        from: d.wh[0],
        to: 'Nyakato Processing Plant',
        cost: 180000,
        date: saleDate,
        at: saleDate + 'T15:00',
        ref: salId,
        veh: 'T ' + (230 + idx) + ' DKN',
        temp: '1.5°C'
      })
    }
  })

  d.exps = [
    { id: 'e0', cat: 'Flake Ice & Insulated Crates', amt: 350000, date: d0(3), desc: '50 bags food-grade crushed ice for landing site' },
    { id: 'e1', cat: 'Cold Storage Electricity / Generator Fuel', amt: 480000, date: d0(5), desc: 'Weekly power & diesel backup for Main Chiller' },
    { id: 'e2', cat: 'Loading & Dock Handling Labor', amt: 120000, date: d0(2), desc: 'Casual labor for boat unloading at Kirumba Mwaloni' }
  ]

  d.comp = [
    { id: 'k0', type: 'FiRCIS Fish Movement Permit', ref: 'FMP-MWZ-2026-089', who: 'Ministry of Livestock and Fisheries', exp: '2027-02-28', status: 'Valid' },
    { id: 'k1', type: 'Commercial Fish Dealer Licence', ref: 'FDL-LAKE-8841', who: 'Fisheries Department Mwanza', exp: '2026-12-31', status: 'Expiring Soon' },
    { id: 'k2', type: 'Sanitary & Cold Chain Inspection Cert', ref: 'SAN-CERT-4412', who: 'Tanzania Food & Drugs Authority (TMDA)', exp: '2027-06-15', status: 'Valid' }
  ]

  // Master Season Settlement Records
  d.settlements = [
    {
      id: 'set0',
      no: 'SET-00041',
      date: d0(1),
      at: d0(1) + 'T11:45',
      seasonId: 'seas_2026_q1',
      supId: 's0',
      boatId: 'boat0',
      agreedEarnings: 11480000, // Total catch supplied
      fuelDeducted: 740000,
      maintDeducted: 200000,
      gearDeducted: 180000,
      foodDeducted: 75000,
      advancesDeducted: 150000,
      otherDeducted: 50000,
      totalDeductions: 1395000,
      previousPaid: 8000000,
      netPayable: 2085000,
      method: 'M-Pesa (Mobile Money)',
      status: 'Approved & Disbursed',
      settlementType: 'Full Season Settlement',
      approvedBy: 'John Mwangi (Director)',
      notes: 'Full reconciliation of Lake Victoria Season 2026-Q1 for Mzee Juma (MV Furaha)'
    },
    {
      id: 'set1',
      no: 'SET-00040',
      date: d0(3),
      at: d0(3) + 'T14:20',
      seasonId: 'seas_2026_q1',
      supId: 's1',
      boatId: 'boat1',
      agreedEarnings: 15120000,
      fuelDeducted: 192000,
      maintDeducted: 0,
      gearDeducted: 0,
      foodDeducted: 0,
      advancesDeducted: 200000,
      otherDeducted: 0,
      totalDeductions: 392000,
      previousPaid: 12000000,
      netPayable: 2728000,
      method: 'Bank RTGS',
      status: 'Approved & Disbursed',
      settlementType: 'Partial Settlement',
      approvedBy: 'Asha Komba (Manager)',
      notes: 'BMU night fishing expedition payout after advances and fuel credit deduction'
    }
  ]

  return d
}

const ST = (n, u, role, br, pin = '1234') => ({
  id: uid('u'),
  name: n,
  phone: '0754 000 111',
  username: u,
  pin: H(pin),
  role,
  active: true,
  branch: br
})

const seedDb = () => ({
  v: 9,
  ses: null,
  plat: {
    admin: { username: 'admin', pin: H('admin123'), name: 'Platform Admin' },
    log: []
  },
  tenants: [
    {
      id: 't1',
      name: 'Victoria Perch & Seafood Traders Ltd',
      plan: 'Business',
      status: 'active',
      created: d0(120),
      sector: 'Lake Victoria Commercial Fisheries',
      region: 'Mwanza',
      staff: [
        ST('John Mwangi (Director)', 'owner', 'Owner', 'all', '1234'),
        ST('Asha Komba (Operations)', 'manager', 'General Manager', 'all', '1234'),
        ST('Juma Said (Landing Officer)', 'juma', 'Purchasing Officer', 'br1', '1111'),
        ST('Neema Paul (Quality Lead)', 'neema', 'Quality Inspector', 'br1', '2222'),
        ST('Hamisi Ally (Chief Accountant)', 'hamisi', 'Accountant', 'br1', '3333'),
        ST('Baraka Mussa (Cold Chain)', 'baraka', 'Storekeeper', 'br1', '4444'),
        ST('Salim Bakari (Sales & Industry)', 'salim', 'Sales Officer', 'br1', '5555')
      ],
      branches: [
        { id: 'br1', name: 'Mwanza Main Landing (Kirumba)', region: 'Mwanza', data: mkBranch('Mwanza (Kirumba Mwaloni)', 1.2, true) },
        { id: 'br2', name: 'Kigoma Port Hub (Lake Tanganyika)', region: 'Kigoma', data: mkBranch('Kigoma (Katonga BMU)', 0.9, true) },
        { id: 'br3', name: 'Musoma Collection Station', region: 'Musoma', data: mkBranch('Musoma (Mwigobero)', 0.7, true) }
      ]
    }
  ]
})

const C = createContext()
export const useS = () => useContext(C)

const L = (p, m) => {
  const me = (p.staff || []).find(x => x.id === p.me)
  p.audit.unshift({
    id: uid('a'),
    t: new Date().toLocaleString('en-GB'),
    u: (me ? me.name + ' · ' : '') + p.role,
    m
  })
}

// Internal Ledger helper
const postLedgerEntry = (p, entry) => {
  p.fishermanLedger = p.fishermanLedger || []
  const id = uid('fl')
  const newEntry = {
    id,
    createdAt: new Date().toISOString(),
    status: 'Approved',
    ...entry
  }
  p.fishermanLedger.unshift(newEntry)
  return newEntry
}

export function Store({ children }) {
  const [db, setDb] = useState(() => {
    // 1. Check if v9 exists in localStorage
    try {
      const v = JSON.parse(localStorage.getItem(KEY))
      if (v && v.v === 9) {
        // Guarantee all branches have valid array structures
        for (const t of v.tenants || []) {
          for (const b of t.branches || []) {
            if (b.data) {
              const fresh = mkBranch(b.region || 'Mwanza', 1, false)
              b.data.seasons = b.data.seasons && b.data.seasons.length > 0 ? b.data.seasons : fresh.seasons
              b.data.boats = b.data.boats && b.data.boats.length > 0 ? b.data.boats : fresh.boats
              b.data.boatCrewAssignments = b.data.boatCrewAssignments && b.data.boatCrewAssignments.length > 0 ? b.data.boatCrewAssignments : fresh.boatCrewAssignments
              b.data.kibaluaEngagements = b.data.kibaluaEngagements || fresh.kibaluaEngagements || []
              b.data.fishermanExitRecords = b.data.fishermanExitRecords || fresh.fishermanExitRecords || []
              b.data.boatExpenseAllocations = b.data.boatExpenseAllocations || fresh.boatExpenseAllocations || []
              b.data.activeSeasonId = b.data.activeSeasonId || 'seas_2026_q1'
              b.data.activeBoatId = b.data.activeBoatId || (b.data.boats && b.data.boats[0]?.id) || 'boat0'
            }
          }
        }
        return v
      }
    } catch (e) {}

    // 2. Automatically migrate existing user session from fishtrade.v8 if present
    try {
      const oldV8 = JSON.parse(localStorage.getItem('fishtrade.v8'))
      if (oldV8 && oldV8.ses) {
        const freshDb = seedDb()
        freshDb.ses = oldV8.ses
        return freshDb
      }
    } catch (e) {}

    return seedDb()
  })

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(db))
    } catch (e) {}
  }, [db])

  const ses = db.ses || {}
  const T = db.tenants.find(t => t.id === ses.tid)
  const B = T && T.branches.find(b => b.id === ses.bid)
  const me = T && T.staff.find(x => x.id === ses.uid)
  const s = ses.kind === 'tenant' && T && B && me ? { ...B.data, staff: T.staff, me: me.id, role: me.role } : null

  const up = f =>
    setDb(d => {
      const n = structuredClone(d)
      const t = n.tenants.find(x => x.id === n.ses.tid)
      const b = t.branches.find(x => x.id === n.ses.bid)
      const u = t.staff.find(x => x.id === n.ses.uid)
      const p = f({ ...b.data, staff: t.staff, me: u.id, role: u.role })
      const { staff, me: _m, role: _r, ...data } = p
      b.data = data
      t.staff = staff
      return n
    })

  const mut = f =>
    setDb(d => {
      const n = structuredClone(d)
      f(n)
      return n
    })

  const a = {
    setActiveSeason: seasonId =>
      up(p => {
        p.activeSeasonId = seasonId
        L(p, `Switched active fishing season to ${seasonId}`)
        return p
      }),

    addSup: d =>
      up(p => {
        const no = 'SUP-' + String(p.suppliers.length + 1).padStart(3, '0')
        p.suppliers.push({ id: uid('s'), no, totalSupplied: 0, ...d })
        L(p, `Registered supplier ${d.name} (${no})`)
        return p
      }),

    addCus: d =>
      up(p => {
        const code = 'IND-' + String(p.customers.length + 1).padStart(2, '0')
        p.customers.push({ id: uid('c'), code, ...d })
        L(p, `Added industry client ${d.name} (${code})`)
        return p
      }),

    buy: d =>
      up(p => {
        const { paid, method, ...b } = d
        const n = 'PUR-' + String(p.seq.pur++).padStart(6, '0')
        const batchNo = 'BATCH-' + String(p.batches.length + 1).padStart(3, '0')
        p.batches.push({
          id: uid('b'),
          no: batchNo,
          pur: n,
          st: 'pending',
          rej: 0,
          rem: 0,
          date: today(),
          wh: p.wh[0],
          ...b
        })
        if (paid > 0) {
          p.pays.push({ id: uid('p'), sup: b.sup, amt: paid, m: method, date: today(), ref: 'PAY-' + uid('') })
        }
        L(p, `${n}: Bought ${b.kg} kg ${b.sp} (${b.grade}) from supplier @ TZS ${b.price}`)
        return p
      }),

    inspect: (id, acc, temp, reason) =>
      up(p => {
        const b = p.batches.find(x => x.id === id)
        b.rem = acc
        b.rej = b.kg - acc
        b.temp = temp
        b.reason = reason
        b.st = acc > 0 ? 'accepted' : 'rejected'
        b.insp = today()
        L(p, `${b.no} inspected: Accepted ${acc} kg, rejected ${b.rej} kg (Temp ${temp}°C)`)
        return p
      }),

    transfer: (id, to) =>
      up(p => {
        const b = p.batches.find(x => x.id === id)
        L(p, `${b.no} transferred from ${b.wh || p.wh[0]} → ${to}`)
        b.wh = to
        return p
      }),

    waste: (id, kg, why) =>
      up(p => {
        const b = p.batches.find(x => x.id === id)
        b.rem -= kg
        b.waste = (b.waste || 0) + kg
        L(p, `${b.no}: Documented wastage ${kg} kg (${why || 'Deterioration'})`)
        return p
      }),

    pay: (sup, amt, m) =>
      up(p => {
        const ref = 'PAY-' + uid('')
        p.pays.push({ id: uid('p'), sup, amt, m, date: today(), ref })
        L(p, `Issued payment of TZS ${amt} (${m}) to supplier`)
        return p
      }),

    sell: d =>
      up(p => {
        let need = d.kg
        let cogs = 0
        const alloc = []
        p.batches
          .filter(b => b.st === 'accepted' && b.sp === d.sp && b.grade === d.grade && b.rem > 0)
          .sort((x, y) => x.date.localeCompare(y.date))
          .forEach(b => {
            if (need <= 0) return
            const t = Math.min(need, b.rem)
            b.rem -= t
            need -= t
            cogs += t * b.price
            alloc.push({ b: b.id, kg: t })
          })
        const no = 'SAL-' + String(p.seq.sal++).padStart(6, '0')
        p.sales.push({
          id: uid('x'),
          no,
          ...d,
          cogs,
          alloc,
          date: today(),
          at: nowL(),
          dis: { st: 'Pending Dispatch', veh: '', drv: '' }
        })
        L(p, `${no}: Dispatched order of ${d.kg} kg ${d.sp} to processing industry`)
        return p
      }),

    receive: (id, amt) =>
      up(p => {
        const x = p.sales.find(y => y.id === id)
        x.paid += amt
        L(p, `Received payment of TZS ${amt} for invoice ${x.no}`)
        return p
      }),

    dispatch: (id, dis) =>
      up(p => {
        const x = p.sales.find(y => y.id === id)
        x.dis = dis
        L(p, `${x.no} vehicle assigned: ${dis.veh}, Driver: ${dis.drv} (${dis.st})`)
        return p
      }),

    addExp: d =>
      up(p => {
        p.exps.push({ id: uid('e'), date: today(), ...d })
        L(p, `Logged operating expense: ${d.cat} (TZS ${d.amt})`)
        return p
      }),

    addComp: d =>
      up(p => {
        p.comp.push({ id: uid('k'), ...d })
        L(p, `Added compliance permit ${d.type} (${d.ref})`)
        return p
      }),

    addTrip: d =>
      up(p => {
        p.trips.push({ id: uid('t'), ...d })
        L(p, `Recorded transport run: ${d.mode} ${d.from} → ${d.to} (TZS ${d.cost})`)
        return p
      }),

    addStaff: d =>
      up(p => {
        p.staff.push({ id: uid('u'), active: true, ...d, pin: H(d.pin) })
        L(p, `Created user account for ${d.username} (${d.role})`)
        return p
      }),

    updStaff: (id, d) =>
      up(p => {
        const u = p.staff.find(x => x.id === id)
        const { pin, ...r } = d
        Object.assign(u, r)
        if (pin) u.pin = H(pin)
        if (id === p.me) p.role = u.role
        L(p, `Updated staff profile ${u.username}`)
        return p
      }),

    // A. FUEL MANAGEMENT (Connected with Central Fisherman Ledger & Boat Cost Ledger)
    issueFuel: d =>
      up(p => {
        p.fuelTanks = p.fuelTanks || []
        p.fuelIssues = p.fuelIssues || []
        p.boatCostLedger = p.boatCostLedger || []
        p.seq.fuel = p.seq.fuel || 100
        const tank = p.fuelTanks.find(t => t.id === d.tankId || t.fuel === d.fuel)
        if (tank) {
          tank.current = Math.max(0, (tank.current || 0) - (+d.litres || 0))
        }
        const total = (+d.litres || 0) * (+d.price || 0)
        const paid = Math.min(+d.paid || 0, total)
        const balance = Math.max(0, total - paid)
        const no = 'FI-' + String(p.seq.fuel++).padStart(6, '0')
        const sup = p.suppliers.find(x => x.id === d.supId)
        const boat = (p.boats || []).find(b => b.id === d.boatId)
        const meUser = (p.staff || []).find(u => u.id === p.me)
        const seasonId = d.seasonId || p.activeSeasonId || 'seas_2026_q1'

        const issueRecord = {
          id: uid('fi'),
          no,
          date: d.date || today(),
          at: nowL(),
          seasonId,
          supId: d.supId,
          boatId: d.boatId,
          boatReg: boat?.regNo || d.boatReg || '-',
          tankId: tank?.id || d.tankId || 'tank_petrol',
          fuel: d.fuel || tank?.fuel || 'Petrol',
          litres: +d.litres,
          price: +d.price,
          total,
          paid,
          balance,
          arrangement: d.arrangement || 'Partial',
          issuedBy: meUser?.name || 'Landing Officer',
          notes: d.notes || ''
        }
        p.fuelIssues.unshift(issueRecord)

        // Post Debit to Central Fisherman Financial Ledger if there is an outstanding recoverable balance
        if (balance > 0 && d.supId) {
          postLedgerEntry(p, {
            supId: d.supId,
            boatId: d.boatId,
            seasonId,
            date: d.date || today(),
            type: 'Fuel Issued',
            debit: balance,
            credit: 0,
            source: 'fuel',
            refId: issueRecord.id,
            ref: no,
            notes: `Fuel credit: ${d.litres}L ${d.fuel} @ TZS ${d.price}/L (Total ${total}, Paid ${paid})`,
            createdBy: meUser?.name || 'Fuel Officer'
          })
        }

        // Post Boat Cost Ledger
        if (d.boatId) {
          p.boatCostLedger.unshift({
            id: uid('bc'),
            boatId: d.boatId,
            seasonId,
            date: d.date || today(),
            cat: 'Fuel',
            cost: total,
            allocation: d.arrangement === 'Company-paid' ? 'Company-funded' : 'Fisherman-recoverable',
            ref: no,
            notes: `${d.litres}L ${d.fuel} issued`
          })
        }

        L(p, `${no}: Issued ${d.litres}L ${d.fuel} to ${sup?.name || 'Fisherman'} (${boat?.regNo || 'Boat'}). TZS ${total} (Paid: ${paid}, Balance: ${balance})`)
        return p
      }),

    receiveFuel: d =>
      up(p => {
        p.fuelTanks = p.fuelTanks || []
        p.fuelPurchases = p.fuelPurchases || []
        const tank = p.fuelTanks.find(t => t.id === d.tankId)
        if (tank) {
          tank.current = (tank.current || 0) + (+d.litres || 0)
          if (d.sellPrice) tank.sellPrice = +d.sellPrice
          if (d.costPerL) tank.buyPrice = +d.costPerL
        }
        const total = (+d.litres || 0) * (+d.costPerL || 0)
        const no = 'FP-' + uid('')
        p.fuelPurchases.unshift({
          id: uid('fp'),
          no,
          date: d.date || today(),
          supId: d.supId,
          supName: d.supName,
          tankId: d.tankId,
          fuel: tank?.fuel || d.fuel || 'Petrol',
          litres: +d.litres,
          costPerL: +d.costPerL,
          sellPrice: +d.sellPrice || tank?.sellPrice,
          total,
          docRef: d.docRef || '',
          status: 'Delivered'
        })
        L(p, `Fuel Received: Restocked ${d.litres}L into ${tank?.name || 'Fuel Tank'} from ${d.supName || 'Supplier'}`)
        return p
      }),

    payFuelDebt: (supId, amt, m, notes = '') =>
      up(p => {
        p.fuelPayments = p.fuelPayments || []
        const sup = p.suppliers.find(x => x.id === supId)
        const ref = 'FPAY-' + uid('')
        const payRecord = {
          id: uid('fp'),
          supId,
          amt: +amt,
          m,
          date: today(),
          at: nowL(),
          ref,
          notes
        }
        p.fuelPayments.unshift(payRecord)

        // Post Credit to Central Fisherman Ledger
        postLedgerEntry(p, {
          supId,
          seasonId: p.activeSeasonId || 'seas_2026_q1',
          date: today(),
          type: 'Cash Payment',
          debit: 0,
          credit: +amt,
          source: 'fuel',
          refId: payRecord.id,
          ref,
          notes: `Fuel debt direct payment (${m}): ${notes || 'Pump cash payment'}`,
          createdBy: (p.staff || []).find(u => u.id === p.me)?.name || 'Accountant'
        })

        L(p, `Fuel Debt Payment: Received TZS ${amt} (${m}) from fisherman ${sup?.name || supId}`)
        return p
      }),

    recordFuelAdjustment: d =>
      up(p => {
        p.fuelAdjustments = p.fuelAdjustments || []
        const tank = p.fuelTanks.find(t => t.id === d.tankId)
        if (tank) {
          if (d.type === 'Addition / Dipstick Correction') {
            tank.current = (tank.current || 0) + (+d.litres || 0)
          } else {
            tank.current = Math.max(0, (tank.current || 0) - (+d.litres || 0))
          }
        }
        p.fuelAdjustments.unshift({
          id: uid('fa'),
          date: today(),
          tankId: d.tankId,
          tankName: tank?.name || 'Tank',
          litres: +d.litres,
          type: d.type,
          reason: d.reason || 'Routine dipstick calibration',
          recordedBy: (p.staff || []).find(u => u.id === p.me)?.name || 'Storekeeper'
        })
        L(p, `Fuel Tank Calibration: ${d.type} (${d.litres}L) on ${tank?.name || 'Tank'}`)
        return p
      }),

    // B. BOAT & FLEET MAINTENANCE MANAGEMENT
    addBoat: d =>
      up(p => {
        p.boats = p.boats || []
        const boatId = uid('boat')
        const code = (d.code || d.regNo || ('FISH-' + String(p.boats.length + 1).padStart(3, '0'))).trim().toUpperCase()
        const regNo = (d.regNo || d.code || ('TZN-' + (100 + p.boats.length + 1))).trim().toUpperCase()
        const name = (d.name || `MV Vessel ${p.boats.length + 1}`).trim()
        const captainName = (d.captain || '').trim()
        const operation = d.operation || 'Company-managed'

        const boatObj = {
          code,
          regNo,
          name,
          captain: captainName || 'Unassigned',
          phone: d.captainPhone || d.phone || '',
          captainPhone: d.captainPhone || d.phone || '',
          operation,
          ownerType: operation,
          landingSite: d.landingSite || (p.suppliers[0]?.site || 'Mwanza Main Landing (Kirumba)'),
          boatType: d.boatType || 'Planked Wooden Mashua (10m)',
          engine: d.engine || 'Yamaha Outboard 40HP 2-Stroke',
          engineHours: +d.engineHours || 0,
          fuelCapacityLitres: +d.fuelCapacityLitres || 120,
          status: d.status || 'Operational',
          lastService: d.lastService || today(),
          notes: d.notes || '',
          createdDate: today(),
          activeSeasonId: d.seasonId || p.activeSeasonId || 'seas_2026_q1',
          ...d,
          id: boatId
        }

        p.boats.push(boatObj)
        p.activeBoatId = boatId // automatically select new boat!

        // If a captain name was supplied, auto-create Captain assignment on this vessel!
        if (captainName) {
          p.boatCrewAssignments = p.boatCrewAssignments || []
          const asgId = uid('asg')
          p.boatCrewAssignments.unshift({
            id: asgId,
            boatId,
            boatReg: regNo,
            boatName: name,
            supId: d.supId || ('sup_' + uid('')),
            fishermanName: captainName,
            position: 'Captain',
            accountType: 'Permanent',
            phone: d.captainPhone || d.phone || '',
            nida: d.nida || '',
            seasonId: p.activeSeasonId || 'seas_2026_q1',
            startDate: today(),
            endDate: null,
            status: 'Active',
            balance: 0,
            balanceType: 'clear',
            balanceMeaning: 'Clean Account',
            rateAgreement: 'Captain Catch Share (30%)',
            totalTrips: 0,
            totalDeliveredKg: 0,
            notes: `Auto-assigned as primary Captain on registration of ${name}`
          })
        }

        L(p, `Boat Registered: Added ${name} (${regNo}) with Captain ${captainName || 'Unassigned'} [${operation}]`)
        return p
      }),

    updateBoat: (id, d) =>
      up(p => {
        p.boats = p.boats || []
        const b = p.boats.find(x => x.id === id)
        if (b) {
          Object.assign(b, d)
          L(p, `Boat Updated: ${b.name} (${b.regNo}) status set to ${b.status}`)
        }
        return p
      }),

    addWorkOrder: d =>
      up(p => {
        p.maintenanceOrders = p.maintenanceOrders || []
        p.spareParts = p.spareParts || []
        p.boatCostLedger = p.boatCostLedger || []
        p.seq.wo = p.seq.wo || 120
        const no = 'WO-' + String(p.seq.wo++).padStart(6, '0')
        const boat = (p.boats || []).find(b => b.id === d.boatId)
        const seasonId = d.seasonId || p.activeSeasonId || 'seas_2026_q1'
        
        // Deduct spare parts used from inventory
        const partsList = d.parts || []
        partsList.forEach(item => {
          const part = p.spareParts.find(sp => sp.id === item.partId)
          if (part) {
            part.stock = Math.max(0, (part.stock || 0) - (+item.qty || 1))
          }
        })

        const totalCost = (+d.partsCost || 0) + (+d.laborCost || 0) + (+d.otherCost || 0)
        let recoverable = 0
        if (d.arrangement === 'Company-assisted (Deduct from fish)' || d.arrangement === 'Fisherman-recoverable' || d.arrangement === 'Fisherman-paid (Credit)') {
          recoverable = totalCost
        } else if (d.arrangement === 'Shared cost') {
          recoverable = Math.round(totalCost * 0.5)
        }

        const woRecord = {
          id: uid('wo'),
          no,
          date: d.date || today(),
          at: nowL(),
          seasonId,
          boatId: d.boatId,
          supId: d.supId || boat?.ownerId || 'company',
          title: d.title,
          fault: d.fault,
          mechanic: d.mechanic,
          status: d.status || 'Reported',
          arrangement: d.arrangement || 'Company-paid',
          parts: partsList,
          partsCost: +d.partsCost || 0,
          laborCost: +d.laborCost || 0,
          otherCost: +d.otherCost || 0,
          totalCost,
          recoverable,
          recovered: 0,
          notes: d.notes || '',
          photoUrl: d.photoUrl || ''
        }

        p.maintenanceOrders.unshift(woRecord)

        // If recoverable from fisherman, post Debit to Central Fisherman Financial Ledger
        if (recoverable > 0 && woRecord.supId && woRecord.supId !== 'company') {
          postLedgerEntry(p, {
            supId: woRecord.supId,
            boatId: d.boatId,
            seasonId,
            date: d.date || today(),
            type: 'Maintenance Repair',
            debit: recoverable,
            credit: 0,
            source: 'maintenance',
            refId: woRecord.id,
            ref: no,
            notes: `Repair work order: ${d.title} (Parts: ${d.partsCost}, Labor: ${d.laborCost})`,
            createdBy: (p.staff || []).find(u => u.id === p.me)?.name || 'Fleet Manager'
          })
        }

        // Post to Boat Cost Ledger
        if (d.boatId) {
          p.boatCostLedger.unshift({
            id: uid('bc'),
            boatId: d.boatId,
            seasonId,
            date: d.date || today(),
            cat: 'Maintenance',
            cost: totalCost,
            allocation: recoverable === totalCost ? 'Fisherman-recoverable' : recoverable > 0 ? 'Shared' : 'Company-funded',
            ref: no,
            notes: `WO ${no}: ${d.title}`
          })
        }

        if (boat && d.status !== 'Completed') {
          boat.status = 'Under Maintenance'
        }

        L(p, `${no}: Created maintenance work order for ${boat?.name || 'Boat'} (${d.title}) - TZS ${totalCost}`)
        return p
      }),

    updateWorkOrder: (id, d) =>
      up(p => {
        p.maintenanceOrders = p.maintenanceOrders || []
        const wo = p.maintenanceOrders.find(x => x.id === id)
        if (wo) {
          Object.assign(wo, d)
          if (d.status === 'Completed') {
            const boat = (p.boats || []).find(b => b.id === wo.boatId)
            if (boat) {
              boat.status = 'Operational'
              boat.lastService = today()
            }
          }
          L(p, `${wo.no}: Maintenance work order status updated to ${wo.status}`)
        }
        return p
      }),

    addSparePart: d =>
      up(p => {
        p.spareParts = p.spareParts || []
        const existing = p.spareParts.find(x => x.partNo === d.partNo)
        if (existing) {
          existing.stock = (existing.stock || 0) + (+d.stock || 0)
          if (d.sellPrice) existing.sellPrice = +d.sellPrice
          if (d.unitCost) existing.unitCost = +d.unitCost
          L(p, `Restocked spare part ${existing.name} (+${d.stock})`)
        } else {
          p.spareParts.push({
            id: uid('sp'),
            stock: +d.stock || 0,
            minStock: +d.minStock || 5,
            unitCost: +d.unitCost || 0,
            sellPrice: +d.sellPrice || 0,
            ...d
          })
          L(p, `Registered new marine spare part: ${d.name} (${d.partNo})`)
        }
        return p
      }),

    // C. FISHING GEAR & EQUIPMENT MANAGEMENT
    addGearItem: d =>
      up(p => {
        p.gearItems = p.gearItems || []
        p.gearItems.push({
          id: uid('gi'),
          stock: +d.stock || 0,
          minStock: +d.minStock || 5,
          unitCost: +d.unitCost || 0,
          sellPrice: +d.sellPrice || 0,
          condition: d.condition || 'New',
          ...d
        })
        L(p, `Registered fishing equipment: ${d.name} (${d.category})`)
        return p
      }),

    issueGear: d =>
      up(p => {
        p.gearIssues = p.gearIssues || []
        p.gearItems = p.gearItems || []
        p.boatCostLedger = p.boatCostLedger || []
        p.seq.gear = p.seq.gear || 100
        const no = 'GEAR-' + String(p.seq.gear++).padStart(5, '0')
        const seasonId = d.seasonId || p.activeSeasonId || 'seas_2026_q1'
        const meUser = (p.staff || []).find(u => u.id === p.me)

        // Deduct gear from catalog stock
        const items = d.items || []
        items.forEach(it => {
          const catItem = p.gearItems.find(g => g.id === it.itemId)
          if (catItem) {
            catItem.stock = Math.max(0, (catItem.stock || 0) - (+it.qty || 1))
          }
        })

        const totalCost = +d.totalCost || 0
        const paid = +d.paid || 0
        let recoverable = 0
        if (d.arrangement === 'Fisherman-recoverable (Credit)' || d.arrangement === 'Credit / Deduct from fish') {
          recoverable = Math.max(0, totalCost - paid)
        }

        const issueRecord = {
          id: uid('giss'),
          no,
          date: d.date || today(),
          at: nowL(),
          supId: d.supId,
          boatId: d.boatId,
          seasonId,
          items,
          totalCost,
          paid,
          recoverable,
          arrangement: d.arrangement,
          status: 'Issued',
          conditionOnIssue: d.conditionOnIssue || 'New',
          returnedQty: 0,
          issuedBy: meUser?.name || 'Storekeeper',
          notes: d.notes || ''
        }
        p.gearIssues.unshift(issueRecord)

        // Post Debit to Central Fisherman Financial Ledger if recoverable credit
        if (recoverable > 0 && d.supId) {
          postLedgerEntry(p, {
            supId: d.supId,
            boatId: d.boatId,
            seasonId,
            date: d.date || today(),
            type: 'Gear Issued',
            debit: recoverable,
            credit: 0,
            source: 'gear',
            refId: issueRecord.id,
            ref: no,
            notes: `Fishing gear credit: ${items.map(i => `${i.name} (x${i.qty})`).join(', ')}`,
            createdBy: meUser?.name || 'Storekeeper'
          })
        }

        // Post to Boat Cost Ledger
        if (d.boatId) {
          p.boatCostLedger.unshift({
            id: uid('bc'),
            boatId: d.boatId,
            seasonId,
            date: d.date || today(),
            cat: 'Gear',
            cost: totalCost,
            allocation: recoverable > 0 ? 'Fisherman-recoverable' : 'Company-funded',
            ref: no,
            notes: `${no}: Gear issued to boat`
          })
        }

        L(p, `${no}: Issued fishing gear to ${d.supId} (Boat: ${d.boatId || 'Unassigned'}) - TZS ${totalCost} (Recoverable: ${recoverable})`)
        return p
      }),

    returnGear: (id, d) =>
      up(p => {
        p.gearIssues = p.gearIssues || []
        const issue = p.gearIssues.find(g => g.id === id)
        if (issue) {
          issue.status = d.status || 'Returned'
          issue.returnedDate = d.returnedDate || today()
          issue.returnedCondition = d.returnedCondition || 'Good'
          issue.returnNotes = d.returnNotes || ''
          issue.liabilityHandling = d.liabilityHandling || (d.status === 'Returned' && d.creditFisherman ? 'Credited to Fisherman' : 'Retained as Fisherman Liability')

          // If gear is undamaged and reusable, restock it
          if (d.restock) {
            (issue.items || []).forEach(it => {
              const catItem = (p.gearItems || []).find(g => g.id === it.itemId)
              if (catItem) {
                catItem.stock = (catItem.stock || 0) + (+it.qty || 1)
              }
            })
          }

          // If creditFisherman is selected and there was recoverable debt:
          if (d.creditFisherman && issue.recoverable > 0 && issue.supId) {
            postLedgerEntry(p, {
              supId: issue.supId,
              boatId: issue.boatId,
              seasonId: issue.seasonId || p.activeSeasonId || 'seas_2026_q1',
              date: d.returnedDate || today(),
              type: 'Gear Return Credit',
              debit: 0,
              credit: issue.recoverable,
              source: 'gear',
              refId: issue.id,
              ref: issue.no,
              notes: `Gear returned in ${issue.returnedCondition} condition (${issue.no}) - liability credited`,
              createdBy: (p.staff || []).find(u => u.id === p.me)?.name || 'Storekeeper'
            })
            issue.recoverable = 0
          } else if (d.companyWriteOff && issue.recoverable > 0 && issue.supId) {
            postLedgerEntry(p, {
              supId: issue.supId,
              boatId: issue.boatId,
              seasonId: issue.seasonId || p.activeSeasonId || 'seas_2026_q1',
              date: d.returnedDate || today(),
              type: 'Gear Loss Write-Off',
              debit: 0,
              credit: issue.recoverable,
              source: 'gear',
              refId: issue.id,
              ref: issue.no,
              notes: `Equipment lost/damaged at sea (${issue.no}) - absorbed as company emergency expense`,
              createdBy: (p.staff || []).find(u => u.id === p.me)?.name || 'Manager'
            })
            issue.recoverable = 0
          }

          L(p, `Gear Returned / Inspected: ${issue.no} recorded as ${issue.status} (${issue.returnedCondition}) · Liability: ${issue.liabilityHandling}`)
        }
        return p
      }),

    // D. FOOD & CATERING MANAGEMENT (MAMA MPISHI)
    addCook: d =>
      up(p => {
        p.cateringCooks = p.cateringCooks || []
        p.cateringCooks.push({
          id: uid('ck'),
          name: d.name,
          phone: d.phone,
          site: d.site || 'Main Landing Dock',
          assignedBoats: d.assignedBoats || [],
          rating: 'Reliable'
        })
        L(p, `Registered cook / Mama Mpishi: ${d.name}`)
        return p
      }),

    issueCookAdvance: d =>
      up(p => {
        p.cookAdvances = p.cookAdvances || []
        p.seq.cat = p.seq.cat || 100
        const no = 'CADV-' + String(p.seq.cat++).padStart(5, '0')
        const meUser = (p.staff || []).find(u => u.id === p.me)

        const adv = {
          id: uid('ca'),
          no,
          date: d.date || today(),
          cookId: d.cookId,
          amountIssued: +d.amountIssued || 0,
          actualExpenditure: +d.actualExpenditure || 0,
          moneyReturned: +d.moneyReturned || 0,
          status: d.status || 'Issued',
          purpose: d.purpose || 'Daily food market ingredients for crew',
          allocatedBoats: d.allocatedBoats || [],
          receiptDoc: d.receiptDoc || '',
          issuedBy: meUser?.name || 'Accountant',
          notes: d.notes || ''
        }
        p.cookAdvances.unshift(adv)
        L(p, `${no}: Issued cash advance of TZS ${d.amountIssued} to cook (${d.cookId})`)
        return p
      }),

    recordCateringExpense: d =>
      up(p => {
        p.cateringExpenses = p.cateringExpenses || []
        p.boatCostLedger = p.boatCostLedger || []
        const seasonId = d.seasonId || p.activeSeasonId || 'seas_2026_q1'
        const no = 'CAT-' + uid('')
        const meUser = (p.staff || []).find(u => u.id === p.me)

        const catExp = {
          id: uid('cat'),
          no,
          date: d.date || today(),
          cookId: d.cookId,
          advanceRef: d.advanceRef || '',
          seasonId,
          mealsCount: +d.mealsCount || 0,
          crewSize: +d.crewSize || 0,
          mealType: d.mealType || 'Daily Meals',
          totalSpent: +d.totalSpent || 0,
          boatAllocations: d.boatAllocations || [],
          arrangement: d.arrangement || 'Fisherman-recoverable',
          notes: d.notes || ''
        }
        p.cateringExpenses.unshift(catExp)

        // For each boat allocated, if recoverable from fisherman, post Debit to Central Fisherman Financial Ledger
        const allocations = d.boatAllocations || []
        allocations.forEach(alloc => {
          if (alloc.recoverable > 0 && alloc.supId && alloc.supId !== 'company') {
            postLedgerEntry(p, {
              supId: alloc.supId,
              boatId: alloc.boatId,
              seasonId,
              date: d.date || today(),
              type: 'Food & Catering',
              debit: alloc.recoverable,
              credit: 0,
              source: 'catering',
              refId: catExp.id,
              ref: no,
              notes: `Crew meals & food allowance (Boat ${alloc.boatId || 'Fleet'})`,
              createdBy: meUser?.name || 'Catering Supervisor'
            })
          }

          if (alloc.boatId) {
            p.boatCostLedger.unshift({
              id: uid('bc'),
              boatId: alloc.boatId,
              seasonId,
              date: d.date || today(),
              cat: 'Food',
              cost: alloc.cost,
              allocation: alloc.recoverable > 0 ? 'Fisherman-recoverable' : 'Company-funded',
              ref: no,
              notes: `Meals cost allocated`
            })
          }
        })

        // Also if linked to a cook advance, mark that advance as reconciled
        if (d.advanceId) {
          const adv = (p.cookAdvances || []).find(a => a.id === d.advanceId)
          if (adv) {
            adv.status = 'Reconciled'
            adv.actualExpenditure = +d.totalSpent
            adv.moneyReturned = Math.max(0, adv.amountIssued - (+d.totalSpent))
          }
        }

        L(p, `${no}: Logged food catering expenditure of TZS ${d.totalSpent} across ${allocations.length} boats`)
        return p
      }),

    // E. BOAT CONSTRUCTION & INVESTMENT MANAGEMENT
    addBoatProject: d =>
      up(p => {
        p.boatProjects = p.boatProjects || []
        p.seq.proj = p.seq.proj || 100
        const projectNo = 'PROJ-BOAT-' + String(p.seq.proj++).padStart(3, '0')
        const totalCost = (+d.timberMaterials || 0) + (+d.labour || 0) + (+d.engine || 0) + (+d.equipment || 0)
        
        const project = {
          id: uid('bp'),
          projectNo,
          name: d.name,
          builder: d.builder,
          builderPhone: d.builderPhone || '',
          seasonId: d.seasonId || p.activeSeasonId || 'seas_2026_q1',
          assignedSupId: d.assignedSupId || '',
          targetBoatName: d.targetBoatName || d.name,
          status: 'Under Construction',
          progressPct: +d.progressPct || 10,
          startDate: d.startDate || today(),
          targetCompletion: d.targetCompletion || '',
          costBreakdown: {
            timberMaterials: +d.timberMaterials || 0,
            labour: +d.labour || 0,
            engine: +d.engine || 0,
            equipment: +d.equipment || 0,
            total: totalCost
          },
          paidStages: +d.paidStages || 0,
          balanceToPay: Math.max(0, totalCost - (+d.paidStages || 0)),
          ownershipType: d.ownershipType || 'Company Asset with Fisherman Hire-Purchase',
          contractualRecoverable: +d.contractualRecoverable || 0,
          repaymentTerms: d.repaymentTerms || 'Staged deduction from fish catch',
          stages: d.stages || [
            { name: 'Keel Laying & Timber Framing', cost: Math.round(totalCost * 0.25), status: 'Completed', date: today() },
            { name: 'Hull Planking & Ribs', cost: Math.round(totalCost * 0.25), status: 'In Progress', date: '' },
            { name: 'Marine Engine Installation', cost: Math.round(totalCost * 0.35), status: 'Pending', date: '' },
            { name: 'Deck Caulking, Painting & Sea Trials', cost: Math.round(totalCost * 0.15), status: 'Pending', date: '' }
          ],
          notes: d.notes || ''
        }
        p.boatProjects.unshift(project)
        L(p, `${projectNo}: Registered new boat construction project "${d.name}" (Est TZS ${totalCost})`)
        return p
      }),

    updateProjectProgress: (id, pct, status) =>
      up(p => {
        p.boatProjects = p.boatProjects || []
        const proj = p.boatProjects.find(x => x.id === id)
        if (proj) {
          proj.progressPct = +pct
          if (status) proj.status = status
          if (status === 'Completed & Commissioned') {
            // Automatically add to active fleet boats
            p.boats = p.boats || []
            const newBoatId = uid('boat')
            p.boats.push({
              id: newBoatId,
              regNo: 'TZN-' + Math.floor(200 + Math.random() * 700),
              name: proj.targetBoatName || proj.name,
              ownerType: proj.ownershipType.includes('Company') ? 'Company-owned' : 'Fisherman-owned',
              ownerId: proj.assignedSupId || 'company',
              captain: 'Assigned Captain',
              engine: 'Yamaha Outboard 40HP 2-Stroke',
              boatType: 'Planked Wooden Mashua (12m)',
              status: 'Operational',
              engineHours: 0,
              lastService: today(),
              notes: `Commissioned from Project ${proj.projectNo}`
            })
          }
          L(p, `Project ${proj.projectNo} progress updated to ${pct}% (${proj.status})`)
        }
        return p
      }),

    addProjectPayment: (id, amt, stageName) =>
      up(p => {
        p.boatProjects = p.boatProjects || []
        const proj = p.boatProjects.find(x => x.id === id)
        if (proj) {
          proj.paidStages = (proj.paidStages || 0) + (+amt)
          proj.balanceToPay = Math.max(0, (proj.costBreakdown?.total || 0) - proj.paidStages)
          L(p, `Project ${proj.projectNo}: Recorded staged payment of TZS ${amt} for ${stageName}`)
        }
        return p
      }),

    // F. FISHERMAN CASH ADVANCES & DAILY MATUMIZI
    requestAdvance: d =>
      up(p => {
        p.advances = p.advances || []
        p.seq.adv = p.seq.adv || 100
        const no = 'ADV-' + String(p.seq.adv++).padStart(5, '0')
        const seasonId = d.seasonId || p.activeSeasonId || 'seas_2026_q1'
        const sup = p.suppliers.find(s => s.id === d.supId)
        const boat = (p.boats || []).find(b => b.ownerId === d.supId || b.id === d.boatId)

        const adv = {
          id: uid('adv'),
          no,
          date: d.date || today(),
          at: nowL(),
          supId: d.supId,
          boatId: boat?.id || d.boatId || '',
          seasonId,
          amount: +d.amount || 0,
          category: d.category || 'Daily Matumizi',
          purpose: d.purpose || 'Crew allowances & fishing supplies',
          method: d.method || 'M-Pesa (Mobile Money)',
          phone: d.phone || sup?.phone || '',
          status: 'Pending Approval',
          classification: d.classification || 'Fisherman-recoverable',
          approvedBy: '',
          recovered: 0,
          notes: d.notes || ''
        }
        p.advances.unshift(adv)
        L(p, `${no}: Advance requested for ${sup?.name || 'Fisherman'} (TZS ${d.amount})`)
        return p
      }),

    approveAdvance: (id, status, approvedAmount) =>
      up(p => {
        p.advances = p.advances || []
        const adv = p.advances.find(x => x.id === id)
        if (adv) {
          const meUser = (p.staff || []).find(u => u.id === p.me)
          adv.status = status // 'Approved' | 'Rejected'
          adv.approvedBy = meUser?.name || 'General Manager'
          if (approvedAmount && +approvedAmount > 0) {
            adv.amount = +approvedAmount
          }

          // If approved, post Debit to Central Fisherman Financial Ledger if recoverable
          if (status === 'Approved' && adv.classification === 'Fisherman-recoverable') {
            postLedgerEntry(p, {
              supId: adv.supId,
              boatId: adv.boatId,
              seasonId: adv.seasonId,
              date: adv.date,
              type: 'Cash Advance',
              debit: adv.amount,
              credit: 0,
              source: 'advances',
              refId: adv.id,
              ref: adv.no,
              notes: `${adv.category}: ${adv.purpose} (${adv.method})`,
              createdBy: meUser?.name || 'Manager'
            })
          }

          L(p, `Advance ${adv.no} status updated to ${status} for TZS ${adv.amount}`)
        }
        return p
      }),

    repayAdvance: (id, amt, m, notes = '') =>
      up(p => {
        p.advances = p.advances || []
        const adv = p.advances.find(x => x.id === id)
        const meUser = (p.staff || []).find(u => u.id === p.me)
        if (adv) {
          adv.recovered = (adv.recovered || 0) + (+amt)
          const ref = 'REPAY-' + uid('')
          
          // Post Credit to Central Fisherman Financial Ledger
          postLedgerEntry(p, {
            supId: adv.supId,
            boatId: adv.boatId,
            seasonId: adv.seasonId,
            date: today(),
            type: 'Cash Advance Repayment',
            debit: 0,
            credit: +amt,
            source: 'advances',
            refId: ref,
            ref,
            notes: `Direct cash repayment for ${adv.no}: ${notes}`,
            createdBy: meUser?.name || 'Accountant'
          })

          L(p, `Advance ${adv.no}: Logged partial recovery of TZS ${amt} (${m})`)
        }
        return p
      }),

    // G. SEASON SETTLEMENT MANAGEMENT (MASTER CONSOLIDATION MODULE)
    createSeasonSettlement: d =>
      up(p => {
        p.settlements = p.settlements || []
        p.seq.set = p.seq.set || 40
        const no = 'SET-' + String(p.seq.set++).padStart(5, '0')
        const sup = p.suppliers.find(x => x.id === d.supId)
        const boat = (p.boats || []).find(b => b.ownerId === d.supId || b.id === d.boatId)
        const meUser = (p.staff || []).find(u => u.id === p.me)
        const seasonId = d.seasonId || p.activeSeasonId || 'seas_2026_q1'

        const totalDeductions =
          (+d.fuelDeducted || 0) +
          (+d.maintDeducted || 0) +
          (+d.gearDeducted || 0) +
          (+d.foodDeducted || 0) +
          (+d.advancesDeducted || 0) +
          (+d.otherDeducted || 0)

        const netPayable = Math.max(0, (+d.agreedEarnings || 0) - (+d.previousPaid || 0) - totalDeductions)

        const settlementRecord = {
          id: uid('st'),
          no,
          date: d.date || today(),
          at: nowL(),
          seasonId,
          supId: d.supId,
          boatId: boat?.id || d.boatId || '',
          agreedEarnings: +d.agreedEarnings || 0,
          previousPaid: +d.previousPaid || 0,
          fuelDeducted: +d.fuelDeducted || 0,
          maintDeducted: +d.maintDeducted || 0,
          gearDeducted: +d.gearDeducted || 0,
          foodDeducted: +d.foodDeducted || 0,
          advancesDeducted: +d.advancesDeducted || 0,
          otherDeducted: +d.otherDeducted || 0,
          totalDeductions,
          netPayable,
          method: d.method || 'M-Pesa (Mobile Money)',
          status: 'Approved & Disbursed',
          settlementType: d.settlementType || 'Full Season Settlement',
          approvedBy: meUser?.name || 'Director',
          notes: d.notes || 'Full season multi-module consolidated settlement'
        }

        p.settlements.unshift(settlementRecord)

        // Post Credit entry into Central Fisherman Financial Ledger offsetting the deductions!
        if (totalDeductions > 0 && d.supId) {
          postLedgerEntry(p, {
            supId: d.supId,
            boatId: boat?.id,
            seasonId,
            date: d.date || today(),
            type: 'Settlement Deduction Offset',
            debit: 0,
            credit: totalDeductions,
            source: 'settlement',
            refId: settlementRecord.id,
            ref: no,
            notes: `Consolidated season credit offset: Fuel (${d.fuelDeducted || 0}), Food (${d.foodDeducted || 0}), Maint (${d.maintDeducted || 0}), Gear (${d.gearDeducted || 0}), Adv (${d.advancesDeducted || 0})`,
            createdBy: meUser?.name || 'Director'
          })
        }

        // If net payable is disbursed now, record payment into supplier payouts
        if (netPayable > 0 && d.supId) {
          p.pays.push({
            id: uid('p'),
            sup: d.supId,
            amt: netPayable,
            m: d.method || 'M-Pesa (Mobile Money)',
            date: today(),
            ref: no
          })
        }

        L(p, `${no}: Finalized season settlement for ${sup?.name || d.supId} (Earnings: ${d.agreedEarnings}, Deductions: ${totalDeductions}, Net Disbursed: ${netPayable})`)
        return p
      }),

    // Fisherman & Boat onboarding
    createFishermanAccount: d =>
      up(p => {
        p.suppliers = p.suppliers || []
        p.boats = p.boats || []
        const supId = uid('s')
        const boatId = uid('boat')
        const supNo = 'SUP-' + String(p.suppliers.length + 301).padStart(5, '0')
        const boatReg = d.boatReg || ('TZN-' + Math.floor(100 + Math.random() * 900))

        const newBoat = {
          id: boatId,
          regNo: boatReg,
          name: d.boatName || `${d.name}'s Boat`,
          ownerType: 'Fisherman-owned',
          ownerId: supId,
          captain: d.captain || d.name,
          engine: d.engine || 'Yamaha Outboard 40HP 2-Stroke',
          boatType: d.boatType || 'Planked Wooden Mashua (10m)',
          status: 'Operational',
          engineHours: +d.engineHours || 0,
          lastService: today(),
          notes: d.notes || 'Registered by landing station operator',
          crewMembers: d.crewMembers || []
        }
        p.boats.push(newBoat)

        const newSup = {
          id: supId,
          no: supNo,
          name: d.name,
          phone: d.phone,
          site: d.site || 'Kigoma Landing Site',
          cat: d.cat || 'Individual Fisherman',
          boat: newBoat.name,
          boatId: boatId,
          boatReg: boatReg,
          nida: d.nida || '',
          creditLimit: +d.creditLimit || 2500000,
          status: 'Active',
          totalSupplied: 0
        }
        p.suppliers.push(newSup)

        L(p, `Operator registered fisherman account ${d.name} (${supNo}) with boat ${newBoat.name} (${boatReg}) and ${d.crewMembers?.length || 0} crew members`)
        return p
      }),

    updateBoatCrew: (boatId, crewMembers) =>
      up(p => {
        p.boats = p.boats || []
        const b = p.boats.find(x => x.id === boatId)
        if (b) {
          b.crewMembers = crewMembers
          L(p, `Updated crew roster for boat ${b.name} (${b.regNo}): ${crewMembers.length} members`)
        }
        return p
      }),

    setActiveBoat: boatId =>
      up(p => {
        p.activeBoatId = boatId
        return p
      }),

    assignBoatCrew: d =>
      up(p => {
        p.boatCrewAssignments = p.boatCrewAssignments || []
        p.seq.asg = p.seq.asg || 20
        const id = 'asg_' + p.seq.asg++
        const boat = (p.boats || []).find(b => b.id === d.boatId)

        const existingActive = p.boatCrewAssignments.find(
          x => (x.fishermanName || '').trim().toLowerCase() === (d.fishermanName || '').trim().toLowerCase() &&
               x.status === 'Active' &&
               x.accountType === 'Permanent'
        )
        if (existingActive && existingActive.boatId !== d.boatId) {
          existingActive.status = 'Transferred'
          existingActive.endDate = d.startDate || today()
          existingActive.notes = (existingActive.notes || '') + ` | Transferred to ${boat?.name || d.boatId}`
        }

        const newAsg = {
          id,
          boatId: d.boatId,
          boatReg: boat?.regNo || boat?.code || 'FISH-001',
          boatName: boat?.name || 'Vessel',
          supId: d.supId || ('sup_' + uid('')),
          fishermanName: d.fishermanName,
          position: d.position || 'Crew',
          accountType: d.accountType || 'Permanent',
          phone: d.phone || '',
          nida: d.nida || '',
          seasonId: d.seasonId || p.activeSeasonId || 'seas_2026_q1',
          startDate: d.startDate || today(),
          endDate: null,
          status: 'Active',
          balance: +d.initialBalance || 0,
          balanceType: d.balanceType || 'owed_by_fisherman',
          balanceMeaning: d.balanceMeaning || 'Active season account balance',
          rateAgreement: d.rateAgreement || 'Standard Crew Catch Share (20%)',
          totalTrips: 0,
          totalDeliveredKg: 0,
          notes: d.notes || 'Assigned to vessel crew roster'
        }
        p.boatCrewAssignments.unshift(newAsg)

        if (d.position === 'Captain' && boat) {
          boat.captain = d.fishermanName
        }

        L(p, `Assigned ${d.fishermanName} as ${d.position} to boat ${boat?.name || d.boatId} (${newAsg.accountType})`)
        return p
      }),

    updateCrewAssignment: (id, d) =>
      up(p => {
        p.boatCrewAssignments = p.boatCrewAssignments || []
        const asg = p.boatCrewAssignments.find(x => x.id === id)
        if (asg) {
          Object.assign(asg, d)
          if (asg.position === 'Captain') {
            const boat = (p.boats || []).find(b => b.id === asg.boatId)
            if (boat) boat.captain = asg.fishermanName
          }
          L(p, `Updated crew assignment for ${asg.fishermanName} on boat ${asg.boatName}`)
        }
        return p
      }),

    createKibaluaEngagement: d =>
      up(p => {
        p.kibaluaEngagements = p.kibaluaEngagements || []
        p.seq.kib = p.seq.kib || 105
        const no = 'KIB-' + String(p.seq.kib++).padStart(5, '0')
        const boat = (p.boats || []).find(b => b.id === d.boatId)
        const durationDays = +d.durationDays || 1
        const dailyRate = +d.dailyRate || 25000
        const grossPayable = +d.grossPayable || (durationDays * dailyRate)
        const advancePaid = +d.advancePaid || 0
        const remainingPayable = grossPayable - advancePaid - (+d.allocatedExpenses || 0)

        const kib = {
          id: uid('kib'),
          no,
          boatId: d.boatId,
          boatReg: boat?.regNo || boat?.code || 'FISH-001',
          boatName: boat?.name || 'Vessel',
          fishermanName: d.fishermanName,
          phone: d.phone || '',
          position: 'Crew (Kibalua)',
          engagementType: 'Kibalua',
          durationDays,
          startDate: d.startDate || today(),
          endDate: d.endDate || today(),
          dailyRate,
          grossPayable,
          advancePaid,
          allocatedExpenses: +d.allocatedExpenses || 0,
          remainingPayable,
          tripsCount: +d.tripsCount || 1,
          paymentStatus: advancePaid >= grossPayable ? 'Paid' : 'Pending Payment',
          status: 'Active',
          seasonId: d.seasonId || p.activeSeasonId || 'seas_2026_q1',
          notes: d.notes || `${durationDays}-day temporary Kibalua engagement`
        }

        p.kibaluaEngagements.unshift(kib)

        if (advancePaid > 0) {
          p.advances = p.advances || []
          p.seq.adv = (p.seq.adv || 100) + 1
          p.advances.unshift({
            id: uid('adv'),
            no: 'ADV-' + String(p.seq.adv).padStart(5, '0'),
            date: d.startDate || today(),
            at: (d.startDate || today()) + 'T08:00',
            supId: 'kib_' + kib.id,
            fishermanName: d.fishermanName,
            boatId: d.boatId,
            seasonId: kib.seasonId,
            amount: advancePaid,
            category: 'Kibalua Daily Advance',
            purpose: `Initial advance for ${durationDays}-day Kibalua engagement on ${boat?.name}`,
            method: 'Cash',
            status: 'Approved',
            classification: 'Fisherman-recoverable',
            recovered: 0,
            notes: `Disbursed under voucher ${no}`
          })
        }

        L(p, `${no}: Registered ${durationDays}-day Kibalua engagement for ${d.fishermanName} on boat ${boat?.name} (Gross: TZS ${grossPayable})`)
        return p
      }),

    completeKibaluaEngagement: (id, d) =>
      up(p => {
        p.kibaluaEngagements = p.kibaluaEngagements || []
        const kib = p.kibaluaEngagements.find(k => k.id === id)
        if (kib) {
          kib.status = 'Completed'
          kib.completedDate = d.completedDate || today()
          kib.finalPaymentPaid = +d.finalPaymentPaid || kib.remainingPayable
          kib.paymentMethod = d.paymentMethod || 'Cash'
          kib.paymentStatus = 'Fully Paid'
          kib.remainingPayable = 0
          kib.notes = (kib.notes || '') + ` | Engagement completed & settled on ${kib.completedDate}`
          L(p, `${kib.no}: Settled Kibalua engagement for ${kib.fishermanName} with final payment of TZS ${kib.finalPaymentPaid}`)
        }
        return p
      }),

    processFishermanExit: d =>
      up(p => {
        p.boatCrewAssignments = p.boatCrewAssignments || []
        p.fishermanExitRecords = p.fishermanExitRecords || []
        const asg = p.boatCrewAssignments.find(a => a.id === d.assignmentId)
        if (asg) {
          asg.status = 'Exited'
          asg.endDate = d.lastWorkingDate || today()
          asg.notes = (asg.notes || '') + ` | Exited on ${asg.endDate} (${d.reason})`

          const exitRecord = {
            id: uid('exit'),
            assignmentId: asg.id,
            boatId: asg.boatId,
            boatReg: asg.boatReg,
            boatName: asg.boatName,
            fishermanName: asg.fishermanName,
            supId: asg.supId,
            phone: asg.phone,
            position: asg.position,
            lastWorkingDate: d.lastWorkingDate || today(),
            reason: d.reason || 'Resigned',
            outstandingAdvances: +d.outstandingAdvances || asg.balance || 0,
            unreturnedGear: d.unreturnedGear || 'None',
            finalBalanceDue: +d.finalBalanceDue || asg.balance || 0,
            approvedBy: (p.staff || []).find(u => u.id === p.me)?.name || 'Operations Manager',
            approvedDate: today(),
            status: 'Approved & Retained on Ledger',
            notes: d.notes || 'Formal exit clearance processed; accounts preserved for seasonal audit.'
          }
          p.fishermanExitRecords.unshift(exitRecord)
          L(p, `Processed exit clearance for ${asg.fishermanName} from boat ${asg.boatName} (${d.reason}). Unpaid balance preserved.`)
        }
        return p
      }),

    allocateBoatExpense: d =>
      up(p => {
        p.boatExpenseAllocations = p.boatExpenseAllocations || []
        const boat = (p.boats || []).find(b => b.id === d.boatId)
        const totalAmount = +d.totalAmount || 0
        const activeCrew = (p.boatCrewAssignments || []).filter(
          a => a.boatId === d.boatId && a.status === 'Active'
        )
        const count = activeCrew.length || 1
        const perPerson = Math.round(totalAmount / count)

        const splitItems = activeCrew.map(c => ({
          assignmentId: c.id,
          supId: c.supId,
          name: c.fishermanName,
          role: c.position,
          amount: d.rule === 'Company-funded' ? 0 : perPerson,
          status: d.rule === 'Company-funded' ? 'Company Absorbed' : 'Posted to Ledger'
        }))

        const alloc = {
          id: uid('alloc'),
          boatId: d.boatId,
          boatReg: boat?.regNo || boat?.code || 'FISH-001',
          boatName: boat?.name || 'Vessel',
          date: d.date || today(),
          seasonId: d.seasonId || p.activeSeasonId || 'seas_2026_q1',
          expenseType: d.expenseType || 'Food & Catering',
          description: d.description || 'Shared boat operational expense',
          totalAmount,
          rule: d.rule || 'Equal allocation',
          splitItems,
          postedBy: (p.staff || []).find(u => u.id === p.me)?.name || 'Accountant',
          notes: d.notes || `Shared expense split among ${count} active crew members`
        }

        p.boatExpenseAllocations.unshift(alloc)

        if (d.rule !== 'Company-funded') {
          splitItems.forEach(item => {
            if (item.supId && item.amount > 0) {
              postLedgerEntry(p, {
                supId: item.supId,
                boatId: d.boatId,
                seasonId: alloc.seasonId,
                date: d.date || today(),
                type: `Shared ${d.expenseType}`,
                debit: item.amount,
                credit: 0,
                source: 'expenses',
                refId: alloc.id,
                ref: boat?.regNo || boat?.code || 'BOAT-EXP',
                notes: `Allocated shared expense: ${d.description || d.expenseType} (${d.rule})`,
                createdBy: alloc.postedBy
              })
              const asg = activeCrew.find(c => c.id === item.assignmentId)
              if (asg) {
                asg.balance = (asg.balance || 0) + item.amount
              }
            }
          })
        }

        L(p, `Allocated TZS ${totalAmount} shared expense on ${boat?.name} (${d.rule}) across ${count} crew`)
        return p
      }),

    reset: () =>
      up(p => Object.assign(p, mkBranch(p.suppliers[0]?.site || 'Mwanza Main Landing (Kirumba)', 1.2, true)))
  }

  const x = {
    login: (u, pin) => {
      u = u.trim().toLowerCase()
      const h = H(pin)
      if (u === db.plat.admin.username && h === db.plat.admin.pin) {
        mut(n => {
          n.ses = { kind: 'super' }
        })
        return { ok: 1 }
      }
      for (const t of db.tenants) {
        const m = t.staff.find(y => y.username === u && y.pin === h)
        if (m) {
          if (t.status === 'suspended') return { err: 'This company account is suspended.' }
          if (!m.active) return { err: 'This account has been deactivated.' }
          mut(n => {
            const t2 = n.tenants.find(z => z.id === t.id)
            t2.staff.find(z => z.id === m.id).last = nowL()
            n.ses = {
              kind: 'tenant',
              tid: t.id,
              uid: m.id,
              bid: m.branch && m.branch !== 'all' && t.branches.some(b => b.id === m.branch) ? m.branch : t.branches[0].id
            }
          })
          return { ok: 1 }
        }
      }
      return { err: 'Incorrect username or 4-digit PIN.' }
    },
    logout: () =>
      mut(n => {
        n.ses = null
      }),
    switchBranch: id =>
      mut(n => {
        n.ses.bid = id
      }),
    addBranch: (name, region) =>
      mut(n => {
        n.tenants.find(z => z.id === n.ses.tid).branches.push({
          id: uid('br'),
          name,
          region,
          data: mkBranch(region, 1, false)
        })
      }),
    register: f =>
      mut(n => {
        const id = uid('t')
        const o = ST(f.name, f.username, 'Owner', 'all', f.pin)
        o.phone = f.phone
        o.email = f.email
        n.tenants.push({
          id,
          name: f.company,
          plan: f.plan,
          status: 'trial',
          created: today(),
          sector: f.sector,
          region: f.region,
          staff: [o],
          branches: f.branches.map((b, i) => ({
            id: uid('br'),
            name: b.name,
            region: b.region || f.region,
            data: mkBranch(b.region || f.region, 1, f.demo && i === 0)
          }))
        })
        n.ses = { kind: 'tenant', tid: id, uid: o.id, bid: n.tenants.find(z => z.id === id).branches[0].id }
      }),
    setTenant: (id, p) =>
      mut(n => {
        Object.assign(n.tenants.find(z => z.id === id), p)
      }),
    resetPin: (id, pin) =>
      mut(n => {
        const t = n.tenants.find(z => z.id === id)
        const o = t.staff.find(y => y.role === 'Owner') || t.staff[0]
        o.pin = H(pin)
      }),
    impersonate: id =>
      mut(n => {
        const t = n.tenants.find(z => z.id === id)
        const o = t.staff.find(y => y.role === 'Owner') || t.staff[0]
        n.ses = { kind: 'tenant', tid: id, uid: o.id, bid: t.branches[0].id, imp: 1 }
      }),
    exitImp: () =>
      mut(n => {
        n.ses = { kind: 'super' }
      })
  }

  return <C.Provider value={{ s, a, db, T, B, me, x, ses }}>{children}</C.Provider>
}

import { createContext, useContext, useEffect, useState } from 'react'

const KEY = 'fishtrade.v7'
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
  'Purchasing Officer': ['home', 'buy', 'fuel', 'maintenance', 'stock', 'transport', 'reports'],
  'Quality Inspector': ['home', 'quality', 'stock', 'reports'],
  Storekeeper: ['home', 'stock', 'fuel', 'maintenance', 'quality', 'reports'],
  Accountant: ['home', 'hq', 'payments', 'fuel', 'maintenance', 'expenses', 'suppliers', 'sales', 'transport', 'reports'],
  'Sales Officer': ['home', 'sales', 'transport', 'stock', 'reports'],
  'Transport Officer': ['home', 'transport', 'maintenance'],
  Auditor: ['home', 'hq', 'buy', 'fuel', 'maintenance', 'stock', 'sales', 'suppliers', 'quality', 'payments', 'transport', 'expenses', 'compliance', 'audit', 'reports']
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

export const supFuelDebt = (s, id) => {
  const issues = (s.fuelIssues || []).filter(f => f.supId === id)
  const debit = issues.reduce((a, f) => a + (f.total || 0), 0)
  const directPaid = issues.reduce((a, f) => a + (f.paid || 0), 0)
  const extraPaid = (s.fuelPayments || []).filter(p => p.supId === id).reduce((a, p) => a + (p.amt || 0), 0)
  const settled = (s.settlements || []).filter(st => st.supId === id).reduce((a, st) => a + (st.fuelDeducted || 0), 0)
  return Math.max(0, debit - directPaid - extraPaid - settled)
}

export const supMaintDebt = (s, id) => {
  const debit = (s.maintenanceOrders || []).filter(m => m.supId === id).reduce((a, m) => a + (m.recoverable || 0), 0)
  const extraPaid = (s.maintPayments || []).filter(p => p.supId === id).reduce((a, p) => a + (p.amt || 0), 0)
  const settled = (s.settlements || []).filter(st => st.supId === id).reduce((a, st) => a + (st.maintDeducted || 0), 0)
  return Math.max(0, debit - extraPaid - settled)
}

export const supAccountStatement = (s, id) => {
  const fishOwed = supBal(s, id)
  const fuelDebt = supFuelDebt(s, id)
  const maintDebt = supMaintDebt(s, id)
  const totalDebt = fuelDebt + maintDebt
  const netBalance = fishOwed - totalDebt
  return {
    fishOwed,
    fuelDebt,
    maintDebt,
    totalDebt,
    netBalance
  }
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
    seq: { pur: 126, sal: 85, fuel: 104, wo: 126, set: 41 },
    suppliers: [],
    batches: [],
    pays: [],
    customers: [],
    sales: [],
    exps: [],
    trips: [],
    comp: [],
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
    boats: [],
    spareParts: [],
    maintenanceOrders: [],
    maintPayments: [],
    settlements: []
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
      creditLimit: 2000000,
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
      creditLimit: 3500000,
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
      creditLimit: 5000000,
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
      creditLimit: 1500000,
      status: 'Active',
      totalSupplied: 3200
    }
  ]

  d.boats = [
    {
      id: 'boat0',
      regNo: 'TZN-304',
      name: 'MV Furaha',
      ownerType: 'Fisherman-owned',
      ownerId: 's0',
      captain: 'Mzee Juma',
      engine: 'Yamaha Outboard 40HP 2-Stroke',
      boatType: 'Planked Wooden Mashua (10m)',
      status: 'Operational',
      engineHours: 340,
      lastService: d0(14),
      notes: 'Equipped with insulated fish boxes and night floodlights',
      crewMembers: [
        { name: 'Hamisi Juma', role: 'First Mate / Net Handler', phone: '0754 112 301', nida: '19940212-33101-001' },
        { name: 'Bakari Ally', role: 'Engine Operator & Mechanic', phone: '0768 440 291', nida: '19910518-33101-002' },
        { name: 'Daudi Omari', role: 'Deep Water Line Fisher', phone: '0713 902 119', nida: '19960909-33101-003' }
      ]
    },
    {
      id: 'boat1',
      regNo: 'TZN-108',
      name: 'Kigoma Star 01',
      ownerType: 'BMU-owned',
      ownerId: 's1',
      captain: 'Ally Katonga',
      engine: 'Yamaha 25HP Outboard',
      boatType: 'Fiberglass Fishing Canoe (8m)',
      status: 'Operational',
      engineHours: 510,
      lastService: d0(20),
      notes: 'BMU night fishing vessel with pressure lanterns',
      crewMembers: [
        { name: 'Rashidi Mwinyi', role: 'Net Handler (Dagaa)', phone: '0755 221 441', nida: '19890412-22101-004' },
        { name: 'Khalfan Saidi', role: 'Boat Steersman', phone: '0714 883 192', nida: '19931201-22101-005' }
      ]
    },
    {
      id: 'boat2',
      regNo: 'TZN-205',
      name: 'MV Victoria Queen',
      ownerType: 'Company-owned',
      ownerId: 'company',
      captain: 'Capt. Omary & Crew',
      engine: 'Suzuki 60HP 4-Stroke Lean Burn',
      boatType: 'Heavy Wooden Transport Dhow (12m)',
      status: 'Under Maintenance',
      engineHours: 780,
      lastService: d0(3),
      notes: 'Company collection vessel for offshore islands',
      crewMembers: [
        { name: 'Selemani Omary', role: 'Chief Engineer', phone: '0767 114 990', nida: '19820711-11002-006' },
        { name: 'Baraka John', role: 'Deck Hand & Weighing Lead', phone: '0718 332 441', nida: '19950319-11002-007' }
      ]
    },
    {
      id: 'boat3',
      regNo: 'TZN-412',
      name: 'Ziwa Express',
      ownerType: 'Fisherman-owned',
      ownerId: 's3',
      captain: 'Mussa Hamisi',
      engine: 'Tohatsu 30HP Outboard',
      boatType: 'Planked Canoe (9m)',
      status: 'Operational',
      engineHours: 190,
      lastService: d0(30),
      notes: 'Tilapia & Dagaa gill netter',
      crewMembers: [
        { name: 'Athumani Mussa', role: 'Gill Net Hauler', phone: '0784 991 223', nida: '19980104-55102-008' }
      ]
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

  d.customers = [
    { id: 'c0', code: 'IND-01', name: 'ABC Fish Processing Ltd', phone: '028 250 0110', location: 'Nyakato Industrial Area, Mwanza', limit: 40000000, contact: 'Mr. Patrick Temba' },
    { id: 'c1', code: 'IND-02', name: 'Victoria Perch Exporters Ltd', phone: '028 254 0220', location: 'Ilemela Port Road, Mwanza', limit: 35000000, contact: 'Grace Minja' },
    { id: 'c2', code: 'IND-03', name: 'TanFish Cold Chains Dar', phone: '022 212 9000', location: 'Kurasini Harbor, Dar es Salaam', limit: 25000000, contact: 'Ally Rashid' }
  ]

  const basePrices = {
    'Nile Perch': 8000,
    'Tilapia': 5200,
    'Dagaa (Sardines)': 2600,
    'Catfish': 4500
  }

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

  d.settlements = [
    {
      id: 'set0',
      no: 'SET-00041',
      date: d0(1),
      at: d0(1) + 'T11:45',
      purId: 'PUR-000120',
      supId: 's0',
      fishTotal: 2000000,
      fuelDeducted: 940000,
      maintDeducted: 0,
      netPayable: 1060000,
      method: 'M-Pesa (Mobile Money)',
      notes: 'Fuel credit debt TZS 940,000 deducted from Nile Perch 2,000kg catch payout'
    },
    {
      id: 'set1',
      no: 'SET-00040',
      date: d0(3),
      at: d0(3) + 'T14:20',
      purId: 'PUR-000121',
      supId: 's1',
      fishTotal: 3120000,
      fuelDeducted: 384000,
      maintDeducted: 0,
      netPayable: 2736000,
      method: 'Bank RTGS',
      notes: 'Fuel issued for Dagaa night expedition deducted from batch purchase'
    },
    {
      id: 'set2',
      no: 'SET-00039',
      date: d0(6),
      at: d0(6) + 'T09:15',
      purId: 'PUR-000124',
      supId: 's3',
      fishTotal: 1850000,
      fuelDeducted: 256000,
      maintDeducted: 0,
      netPayable: 1594000,
      method: 'M-Pesa (Mobile Money)',
      notes: 'Partial fuel recovery against Tilapia delivery'
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
  v: 7,
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

export function Store({ children }) {
  const [db, setDb] = useState(() => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY))
      if (v && v.v === 6) return v
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
    issueFuel: d =>
      up(p => {
        p.fuelTanks = p.fuelTanks || []
        p.fuelIssues = p.fuelIssues || []
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

        const issueRecord = {
          id: uid('fi'),
          no,
          date: d.date || today(),
          at: nowL(),
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
          arrangement: d.arrangement || 'Cash / Immediate',
          issuedBy: meUser?.name || 'Landing Officer',
          notes: d.notes || ''
        }
        p.fuelIssues.unshift(issueRecord)
        L(p, `${no}: Issued ${d.litres}L ${d.fuel} to ${sup?.name || 'Fisherman'} (${boat?.regNo || 'Boat'}). TZS ${total} (Paid: ${paid}, Debt: ${balance})`)
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
          tankId: d.tankId,
          fuel: tank?.fuel || d.fuel || 'Petrol',
          litres: +d.litres,
          costPerL: +d.costPerL,
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
        p.fuelPayments.unshift({
          id: uid('fp'),
          supId,
          amt: +amt,
          m,
          date: today(),
          at: nowL(),
          ref,
          notes
        })
        L(p, `Fuel Debt Payment: Received TZS ${amt} (${m}) from fisherman ${sup?.name || supId}`)
        return p
      }),

    addBoat: d =>
      up(p => {
        p.boats = p.boats || []
        const boatId = uid('boat')
        p.boats.push({
          id: boatId,
          status: 'Operational',
          engineHours: +d.engineHours || 0,
          lastService: today(),
          ...d
        })
        L(p, `Boat Registered: Added ${d.name} (${d.regNo}) for ${d.captain || 'Captain'}`)
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
        p.seq.wo = p.seq.wo || 120
        const no = 'WO-' + String(p.seq.wo++).padStart(6, '0')
        const boat = (p.boats || []).find(b => b.id === d.boatId)
        
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
        if (d.arrangement === 'Company-assisted (Deduct from fish)' || d.arrangement === 'Fisherman-paid (Credit)') {
          recoverable = totalCost
        }

        const woRecord = {
          id: uid('wo'),
          no,
          date: d.date || today(),
          at: nowL(),
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
          notes: d.notes || ''
        }

        p.maintenanceOrders.unshift(woRecord)

        // Update boat status if in progress
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

    settleFisherman: d =>
      up(p => {
        p.settlements = p.settlements || []
        p.seq.set = p.seq.set || 40
        const no = 'SET-' + String(p.seq.set++).padStart(5, '0')
        const sup = p.suppliers.find(x => x.id === d.supId)

        p.settlements.unshift({
          id: uid('st'),
          no,
          date: today(),
          at: nowL(),
          purId: d.purId || '',
          supId: d.supId,
          fishTotal: +d.fishTotal || 0,
          fuelDeducted: +d.fuelDeducted || 0,
          maintDeducted: +d.maintDeducted || 0,
          netPayable: +d.netPayable || 0,
          method: d.method || 'M-Pesa (Mobile Money)',
          notes: d.notes || 'Automated fish purchase & credit recovery settlement'
        })

        // Also record the payout into p.pays if net payable > 0
        if (+d.netPayable > 0) {
          p.pays.push({
            id: uid('p'),
            sup: d.supId,
            amt: +d.netPayable,
            m: d.method || 'M-Pesa (Mobile Money)',
            date: today(),
            ref: no
          })
        }

        L(p, `${no}: Net Settlement for ${sup?.name || d.supId} - Fish TZS ${d.fishTotal}, Fuel Off: TZS ${d.fuelDeducted || 0}, Maint Off: TZS ${d.maintDeducted || 0}, Net Paid: TZS ${d.netPayable}`)
        return p
      }),

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
          creditLimit: +d.creditLimit || 2000000,
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

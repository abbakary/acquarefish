import React, { useState } from 'react'
import {
  Wrench,
  Plus,
  Search,
  Ship,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Package,
  Calendar,
  DollarSign,
  User,
  Settings,
  ArrowRight,
  Filter,
  Check,
  FileText,
  TrendingUp,
  Cpu
} from 'lucide-react'
import { useS, supMaintDebt } from '../store'
import { Modal, Field, Badge, f, tzs, fmtT } from '../ui'

export default function Maintenance() {
  const { s, a } = useS()
  const [tab, setTab] = useState('orders') // 'orders' | 'boats' | 'spares' | 'schedules'
  const [newOrderModal, setNewOrderModal] = useState(false)
  const [newBoatModal, setNewBoatModal] = useState(false)
  const [newSpareModal, setNewSpareModal] = useState(false)
  const [viewOrder, setViewOrder] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')

  const boats = s.boats || []
  const orders = s.maintenanceOrders || []
  const spareParts = s.spareParts || []
  const suppliers = s.suppliers || []

  // Top KPIs
  const totalBoats = boats.length
  const operationalBoats = boats.filter(b => b.status === 'Operational').length
  const operationalPct = totalBoats > 0 ? Math.round((operationalBoats / totalBoats) * 100) : 100
  const activeOrders = orders.filter(o => o.status !== 'Completed').length
  const totalSpend = orders.reduce((sum, o) => sum + (o.totalCost || 0), 0)
  const totalRecoverableDebt = suppliers.reduce((sum, sup) => sum + supMaintDebt(s, sup.id), 0)

  // Work Order Form State
  const [woForm, setWoForm] = useState({
    boatId: boats[0]?.id || '',
    supId: suppliers[0]?.id || '',
    title: 'Engine 100-Hr Overhaul & Gear Oil Service',
    fault: 'Engine stalling at idle speed; propeller vibration felt during high load',
    mechanic: 'Fundi Rashidi (Mwanza Marine Workshop)',
    arrangement: 'Company-assisted (Deduct from fish)',
    partsCost: '60000',
    laborCost: '40000',
    otherCost: '0',
    status: 'In Progress',
    selectedPartId: spareParts[0]?.id || '',
    selectedPartQty: '2',
    addedParts: []
  })

  // Boat Form State
  const [boatForm, setBoatForm] = useState({
    regNo: 'TZN-' + Math.floor(100 + Math.random() * 900),
    name: 'MV Baraka',
    ownerType: 'Fisherman-owned',
    ownerId: suppliers[0]?.id || 's0',
    captain: 'Juma Selemani',
    engine: 'Yamaha Outboard 40HP 2-Stroke',
    boatType: 'Planked Wooden Mashua (10m)',
    engineHours: '120',
    notes: 'Insulated deck box installed'
  })

  // Spare Part Form State
  const [partForm, setPartForm] = useState({
    name: '',
    partNo: '',
    category: 'Ignition',
    stock: '10',
    minStock: '3',
    unitCost: '15000',
    sellPrice: '20000',
    unit: 'pcs'
  })

  // Handle adding part into work order
  const handleAddPartToOrder = () => {
    const part = spareParts.find(p => p.id === woForm.selectedPartId)
    if (!part) return
    const qty = +woForm.selectedPartQty || 1
    const cost = qty * (part.sellPrice || part.unitCost)
    const newAdded = [
      ...woForm.addedParts,
      { partId: part.id, name: part.name, qty, cost }
    ]
    const updatedPartsCost = newAdded.reduce((sum, x) => sum + x.cost, 0)
    setWoForm(prev => ({
      ...prev,
      addedParts: newAdded,
      partsCost: String(updatedPartsCost)
    }))
  }

  const submitWorkOrder = () => {
    a.addWorkOrder({
      boatId: woForm.boatId,
      supId: woForm.supId,
      title: woForm.title,
      fault: woForm.fault,
      mechanic: woForm.mechanic,
      arrangement: woForm.arrangement,
      parts: woForm.addedParts,
      partsCost: +woForm.partsCost || 0,
      laborCost: +woForm.laborCost || 0,
      otherCost: +woForm.otherCost || 0,
      status: woForm.status
    })
    setNewOrderModal(false)
  }

  const submitBoat = () => {
    a.addBoat(boatForm)
    setNewBoatModal(false)
  }

  const submitSpare = () => {
    a.addSparePart({
      name: partForm.name,
      partNo: partForm.partNo,
      category: partForm.category,
      stock: +partForm.stock,
      minStock: +partForm.minStock,
      unitCost: +partForm.unitCost,
      sellPrice: +partForm.sellPrice,
      unit: partForm.unit
    })
    setNewSpareModal(false)
  }

  const updateOrderStatus = (id, newStatus) => {
    a.updateWorkOrder(id, { status: newStatus })
  }

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    const boat = boats.find(b => b.id === o.boatId)
    const matchSearch =
      o.no.toLowerCase().includes(search.toLowerCase()) ||
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      (boat?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (boat?.regNo || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'All' || o.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="page-body">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 m-0">
              Fleet &amp; Boat Maintenance Management
            </h2>
            <Badge variant="blue">Lake Marine Ops</Badge>
          </div>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Track vessel registries, scheduled marine services, repair work orders, marine spare parts, and recoverable credit.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNewBoatModal(true)}
            className="btn-secondary text-xs"
          >
            <Ship size={15} /> + Register Boat
          </button>
          <button
            onClick={() => setNewOrderModal(true)}
            className="btn-primary"
          >
            <Plus size={16} /> New Work Order (<span className="text-xs font-mono">&lt; 1 min</span>)
          </button>
        </div>
      </div>

      {/* Top Fleet Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Fleet & Operational Rate */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Registered Fleet
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black font-mono text-slate-900">{totalBoats}</span>
                <span className="text-xs text-slate-500 font-medium">Boats Active</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800">
              <Ship size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Operational Rate:</span>
            <span className="font-bold text-emerald-700">{operationalPct}% Ready for Lake</span>
          </div>
        </div>

        {/* Active Work Orders */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Active Repairs &amp; Service
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black font-mono text-amber-600">{activeOrders}</span>
                <span className="text-xs text-slate-500 font-medium">Under Maintenance</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
              <Wrench size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Workshop:</span>
            <span className="font-medium text-slate-700">Mwanza Port Marine</span>
          </div>
        </div>

        {/* Total Maintenance Investment */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Maintenance Spend
              </span>
              <span className="text-2xl font-black font-mono text-slate-900 mt-1 block">
                {tzs(totalSpend)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Parts &amp; Labor:</span>
            <span className="font-bold font-mono text-slate-800">{orders.length} Completed / Active</span>
          </div>
        </div>

        {/* Recoverable Maintenance Debt */}
        <div className="bg-white rounded-xl border border-amber-200 bg-amber-50/20 p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                Recoverable Debt (Assisted)
              </span>
              <span className="text-2xl font-black font-mono text-amber-950 mt-1 block">
                {tzs(totalRecoverableDebt)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-amber-100 flex items-center justify-between text-xs text-amber-900">
            <span>Deducted automatically on:</span>
            <span className="font-bold">Next Fish Catch</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6">
        <button
          onClick={() => setTab('orders')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            tab === 'orders'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wrench size={15} /> Work Orders &amp; Repairs ({orders.length})
        </button>
        <button
          onClick={() => setTab('boats')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            tab === 'boats'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Ship size={15} /> Boat Registry ({boats.length})
        </button>
        <button
          onClick={() => setTab('spares')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            tab === 'spares'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package size={15} /> Marine Spare Parts ({spareParts.length})
        </button>
        <button
          onClick={() => setTab('schedules')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            tab === 'schedules'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar size={15} /> Engine Hour Schedules
        </button>
      </div>

      {/* TAB 1: WORK ORDERS & REPAIRS */}
      {tab === 'orders' && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by WO #, boat name, registration, or fault..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-10 text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {['All', 'Reported', 'In Progress', 'Completed'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                    filterStatus === status
                      ? 'bg-blue-900 text-white border-blue-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Boat &amp; Vessel</th>
                  <th>Job Title &amp; Fault</th>
                  <th>Mechanic</th>
                  <th>Cost Breakdown</th>
                  <th>Total Cost</th>
                  <th>Arrangement</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(item => {
                  const boat = boats.find(b => b.id === item.boatId)
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="font-mono font-bold text-blue-900">{item.no}</td>
                      <td className="whitespace-nowrap font-mono text-xs text-slate-700 font-medium">
                        {item.date}
                      </td>
                      <td>
                        <b className="text-slate-900 block">{boat?.name || 'Vessel'}</b>
                        <span className="text-xs font-mono text-slate-500">{boat?.regNo}</span>
                      </td>
                      <td className="max-w-[220px]">
                        <b className="text-slate-900 block truncate">{item.title}</b>
                        <span className="text-[11px] text-slate-500 line-clamp-1">{item.fault}</span>
                      </td>
                      <td>
                        <span className="text-xs text-slate-800 font-medium block">{item.mechanic}</span>
                      </td>
                      <td className="text-xs">
                        <span className="text-slate-500 block">Parts: {tzs(item.partsCost)}</span>
                        <span className="text-slate-500 block">Labor: {tzs(item.laborCost)}</span>
                      </td>
                      <td className="font-mono font-bold text-slate-900">{tzs(item.totalCost)}</td>
                      <td>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            item.arrangement === 'Company-paid'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {item.arrangement}
                        </span>
                      </td>
                      <td>
                        <Badge
                          variant={
                            item.status === 'Completed'
                              ? 'green'
                              : item.status === 'In Progress'
                                ? 'amber'
                                : 'blue'
                          }
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {item.status !== 'Completed' && (
                            <button
                              onClick={() => updateOrderStatus(item.id, 'Completed')}
                              title="Mark as Completed"
                              className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold inline-flex items-center gap-1 transition"
                            >
                              <Check size={12} /> Sign-off
                            </button>
                          )}
                          <button
                            onClick={() => setViewOrder(item)}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BOAT REGISTRY */}
      {tab === 'boats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boats.map(boat => {
            const owner = suppliers.find(s => s.id === boat.ownerId)
            const activeWO = orders.find(o => o.boatId === boat.id && o.status !== 'Completed')
            const isOperational = boat.status === 'Operational'

            return (
              <div
                key={boat.id}
                className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between shadow-sm hover:border-blue-400 transition"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-blue-900 block">{boat.regNo}</span>
                      <h3 className="text-base font-bold text-slate-900 m-0 mt-0.5">{boat.name}</h3>
                      <span className="text-xs text-slate-500 block">{boat.boatType}</span>
                    </div>
                    <Badge variant={isOperational ? 'green' : 'amber'}>
                      {boat.status}
                    </Badge>
                  </div>

                  <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ownership:</span>
                      <b className="text-slate-800">{boat.ownerType}</b>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Captain / Assigned:</span>
                      <b className="text-slate-900">{boat.captain || owner?.name || 'Assigned Crew'}</b>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1.5">
                      <span className="text-slate-500">Outboard Engine:</span>
                      <b className="font-mono text-slate-900">{boat.engine}</b>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Engine Hours:</span>
                      <b className="font-mono text-blue-950">{boat.engineHours || 0} Hours</b>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1">
                      <span className="text-slate-500">Last Service Date:</span>
                      <span className="font-mono text-slate-700">{boat.lastService || '-'}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1">
                      <span className="text-slate-500">Assigned Crew Members:</span>
                      <b className="text-blue-900 font-semibold">{(boat.crewMembers || []).length} Fishermen</b>
                    </div>
                  </div>

                  {activeWO && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle size={14} className="shrink-0 text-amber-600" />
                      <span className="truncate">
                        <b>{activeWO.no}:</b> {activeWO.title}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setWoForm(prev => ({
                        ...prev,
                        boatId: boat.id,
                        supId: boat.ownerId || '',
                        title: `Routine Inspection for ${boat.name}`
                      }))
                      setNewOrderModal(true)
                    }}
                    className="flex-1 py-1.5 bg-blue-900 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 transition text-center"
                  >
                    + Work Order
                  </button>
                  <button
                    onClick={() => {
                      const nextStatus = isOperational ? 'Under Maintenance' : 'Operational'
                      a.updateBoat(boat.id, { status: nextStatus })
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                  >
                    Toggle Status
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* TAB 3: MARINE SPARE PARTS */}
      {tab === 'spares' && (
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">
              Marine engine parts inventory automatically deducts stock when work orders are issued.
            </span>
            <button
              onClick={() => setNewSpareModal(true)}
              className="btn-primary text-xs"
            >
              <Plus size={14} /> Add Marine Spare Part
            </button>
          </div>

          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Part #</th>
                  <th>Part Description</th>
                  <th>Category</th>
                  <th>Stock on Hand</th>
                  <th>Cost Price</th>
                  <th>Vessel Sell Price</th>
                  <th>Status</th>
                  <th className="text-right">Restock</th>
                </tr>
              </thead>
              <tbody>
                {spareParts.map(item => {
                  const isLow = (item.stock || 0) <= (item.minStock || 5)
                  return (
                    <tr key={item.id}>
                      <td className="font-mono font-bold text-blue-900">{item.partNo}</td>
                      <td>
                        <b className="text-slate-900 block">{item.name}</b>
                        <span className="text-[11px] text-slate-400">Unit: {item.unit}</span>
                      </td>
                      <td>
                        <Badge variant="blue">{item.category}</Badge>
                      </td>
                      <td>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {item.stock} {item.unit}
                        </span>
                        <span className="text-[11px] text-slate-400 block">Min: {item.minStock}</span>
                      </td>
                      <td className="font-mono">{tzs(item.unitCost)}</td>
                      <td className="font-mono font-bold text-slate-900">{tzs(item.sellPrice)}</td>
                      <td>
                        {isLow ? (
                          <Badge variant="red">Low Stock</Badge>
                        ) : (
                          <Badge variant="green">In Stock</Badge>
                        )}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => {
                            a.addSparePart({ partNo: item.partNo, stock: 10 })
                          }}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition"
                        >
                          <Plus size={12} /> +10 Pcs
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

      {/* TAB 4: ENGINE HOUR SCHEDULES */}
      {tab === 'schedules' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              interval: '100 Engine Hours',
              title: 'Minor Service & Spark Plugs',
              items: [
                'Inspect & replace NGK spark plugs',
                'Check gearcase oil for water intrusion',
                'Clean carburetor float chambers & fuel filter',
                'Inspect propeller blades for bending or nicks'
              ],
              boatsDue: boats.filter(b => (b.engineHours || 0) >= 100 && (b.engineHours || 0) < 250)
            },
            {
              interval: '250 Engine Hours',
              title: 'Intermediate Service & Impeller',
              items: [
                'Drain & refill lower unit Yamalube gear oil',
                'Replace water pump impeller & gasket',
                'Inspect sacrificial zinc anodes against electrolysis',
                'Grease steering pivot & throttle cables'
              ],
              boatsDue: boats.filter(b => (b.engineHours || 0) >= 250 && (b.engineHours || 0) < 500)
            },
            {
              interval: '500 Engine Hours',
              title: 'Major Overhaul & Compression',
              items: [
                'Cylinder head compression test & decarbonizing',
                'Inspect reed valves and crankcase seals',
                'Full propeller shaft alignment & bearing check',
                'Ultrasonic carburetor cleaning & jet replacement'
              ],
              boatsDue: boats.filter(b => (b.engineHours || 0) >= 500)
            }
          ].map(sched => (
            <div key={sched.interval} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block font-mono">
                {sched.interval}
              </span>
              <h3 className="text-base font-bold text-slate-900 m-0 mt-1">{sched.title}</h3>

              <ul className="mt-3 space-y-1.5 text-xs text-slate-600 pl-4 list-disc">
                {sched.items.map((it, idx) => (
                  <li key={idx}>{it}</li>
                ))}
              </ul>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Boats In This Service Tier ({sched.boatsDue.length})
                </span>
                <div className="space-y-1.5">
                  {sched.boatsDue.map(b => (
                    <div
                      key={b.id}
                      className="p-2 bg-slate-50 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div>
                        <b className="text-slate-900 block">{b.name} ({b.regNo})</b>
                        <span className="text-slate-500 font-mono">{b.engineHours} Hours</span>
                      </div>
                      <Badge variant="amber">Tier Active</Badge>
                    </div>
                  ))}
                  {sched.boatsDue.length === 0 && (
                    <span className="text-xs text-slate-400 italic block">No boats currently in this bracket.</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: NEW WORK ORDER */}
      {newOrderModal && (
        <Modal title="Create Marine Fleet Work Order" close={() => setNewOrderModal(false)}>
          <div className="flex flex-col gap-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Vessel / Boat">
                <select
                  value={woForm.boatId}
                  onChange={e => {
                    const b = boats.find(x => x.id === e.target.value)
                    setWoForm({
                      ...woForm,
                      boatId: e.target.value,
                      supId: b?.ownerId || woForm.supId
                    })
                  }}
                  className="input-field"
                >
                  {boats.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.regNo}) · {b.engine}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Fisherman / Boat Owner">
                <select
                  value={woForm.supId}
                  onChange={e => setWoForm({ ...woForm, supId: e.target.value })}
                  className="input-field"
                >
                  <option value="company">Company Owned Fleet</option>
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name} ({sup.cat})
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Maintenance Title / Scope">
              <input
                type="text"
                value={woForm.title}
                onChange={e => setWoForm({ ...woForm, title: e.target.value })}
                className="input-field font-semibold"
              />
            </Field>

            <Field label="Fault Description / Symptoms">
              <textarea
                rows={2}
                value={woForm.fault}
                onChange={e => setWoForm({ ...woForm, fault: e.target.value })}
                className="input-field"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Assigned Mechanic / Marine Workshop">
                <input
                  type="text"
                  value={woForm.mechanic}
                  onChange={e => setWoForm({ ...woForm, mechanic: e.target.value })}
                  className="input-field"
                />
              </Field>

              <Field label="Financial Arrangement">
                <select
                  value={woForm.arrangement}
                  onChange={e => setWoForm({ ...woForm, arrangement: e.target.value })}
                  className="input-field"
                >
                  <option>Company-assisted (Deduct from fish)</option>
                  <option>Company-paid</option>
                  <option>Fisherman-paid (Cash)</option>
                  <option>Fisherman-paid (Credit)</option>
                </select>
              </Field>
            </div>

            {/* Spare Parts Usage Picker */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-slate-800 block mb-2">Marine Spare Parts Requisition</span>
              <div className="flex gap-2">
                <select
                  value={woForm.selectedPartId}
                  onChange={e => setWoForm({ ...woForm, selectedPartId: e.target.value })}
                  className="input-field flex-1"
                >
                  {spareParts.map(sp => (
                    <option key={sp.id} value={sp.id}>
                      {sp.name} ({sp.partNo}) · Stock: {sp.stock} {sp.unit} · TZS {f(sp.sellPrice)}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={woForm.selectedPartQty}
                  onChange={e => setWoForm({ ...woForm, selectedPartQty: e.target.value })}
                  className="input-field w-20 font-mono font-bold"
                />
                <button
                  type="button"
                  onClick={handleAddPartToOrder}
                  className="btn-secondary text-xs"
                >
                  + Add Part
                </button>
              </div>

              {/* Added parts list */}
              {woForm.addedParts.length > 0 && (
                <div className="mt-2 space-y-1">
                  {woForm.addedParts.map((pt, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-xs bg-white p-1.5 rounded border border-slate-200"
                    >
                      <span>
                        {pt.name} × {pt.qty}
                      </span>
                      <b className="font-mono text-slate-900">{tzs(pt.cost)}</b>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cost Summary Breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Spare Parts Cost (TZS)">
                <input
                  type="number"
                  value={woForm.partsCost}
                  onChange={e => setWoForm({ ...woForm, partsCost: e.target.value })}
                  className="input-field font-mono font-bold"
                />
              </Field>

              <Field label="Labor &amp; Service Fee (TZS)">
                <input
                  type="number"
                  value={woForm.laborCost}
                  onChange={e => setWoForm({ ...woForm, laborCost: e.target.value })}
                  className="input-field font-mono font-bold"
                />
              </Field>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-slate-500 block">Total Work Order Cost:</span>
                <b className="text-lg font-mono text-blue-950 font-bold">
                  {tzs((+woForm.partsCost || 0) + (+woForm.laborCost || 0))}
                </b>
              </div>
              {woForm.arrangement.includes('Deduct') && (
                <Badge variant="amber">Recoverable from Fish Catch</Badge>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button type="button" onClick={() => setNewOrderModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={submitWorkOrder} className="btn-primary">
                <CheckCircle2 size={16} /> Open Work Order
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: REGISTER BOAT */}
      {newBoatModal && (
        <Modal title="Register Fishing Boat / Marine Vessel" close={() => setNewBoatModal(false)}>
          <div className="flex flex-col gap-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Boat Registration #">
                <input
                  type="text"
                  value={boatForm.regNo}
                  onChange={e => setBoatForm({ ...boatForm, regNo: e.target.value })}
                  className="input-field font-mono font-bold"
                />
              </Field>

              <Field label="Vessel Name">
                <input
                  type="text"
                  value={boatForm.name}
                  onChange={e => setBoatForm({ ...boatForm, name: e.target.value })}
                  className="input-field font-bold"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Ownership Structure">
                <select
                  value={boatForm.ownerType}
                  onChange={e => setBoatForm({ ...boatForm, ownerType: e.target.value })}
                  className="input-field"
                >
                  <option>Fisherman-owned</option>
                  <option>Company-owned</option>
                  <option>BMU-owned</option>
                  <option>Joint Venture</option>
                </select>
              </Field>

              <Field label="Registered Fisherman / Owner">
                <select
                  value={boatForm.ownerId}
                  onChange={e => setBoatForm({ ...boatForm, ownerId: e.target.value })}
                  className="input-field"
                >
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name} ({sup.cat})
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Engine Specifications">
                <input
                  type="text"
                  value={boatForm.engine}
                  onChange={e => setBoatForm({ ...boatForm, engine: e.target.value })}
                  className="input-field"
                />
              </Field>

              <Field label="Hull / Boat Type">
                <input
                  type="text"
                  value={boatForm.boatType}
                  onChange={e => setBoatForm({ ...boatForm, boatType: e.target.value })}
                  className="input-field"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Current Engine Hours">
                <input
                  type="number"
                  value={boatForm.engineHours}
                  onChange={e => setBoatForm({ ...boatForm, engineHours: e.target.value })}
                  className="input-field font-mono"
                />
              </Field>

              <Field label="Captain / Skipper">
                <input
                  type="text"
                  value={boatForm.captain}
                  onChange={e => setBoatForm({ ...boatForm, captain: e.target.value })}
                  className="input-field"
                />
              </Field>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setNewBoatModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={submitBoat} className="btn-primary">
                Save Boat Profile
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: ADD MARINE SPARE PART */}
      {newSpareModal && (
        <Modal title="Register Marine Spare Part" close={() => setNewSpareModal(false)}>
          <div className="flex flex-col gap-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Part Name">
                <input
                  type="text"
                  placeholder="e.g. Yamaha Water Pump Impeller"
                  value={partForm.name}
                  onChange={e => setPartForm({ ...partForm, name: e.target.value })}
                  className="input-field font-bold"
                />
              </Field>

              <Field label="Part Number / SKU">
                <input
                  type="text"
                  placeholder="e.g. YAM-IMP-40"
                  value={partForm.partNo}
                  onChange={e => setPartForm({ ...partForm, partNo: e.target.value })}
                  className="input-field font-mono"
                />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Category">
                <select
                  value={partForm.category}
                  onChange={e => setPartForm({ ...partForm, category: e.target.value })}
                  className="input-field"
                >
                  <option>Ignition</option>
                  <option>Lubricants</option>
                  <option>Propulsion</option>
                  <option>Electrical</option>
                  <option>Rigging</option>
                  <option>Cooling</option>
                </select>
              </Field>

              <Field label="Initial Stock">
                <input
                  type="number"
                  value={partForm.stock}
                  onChange={e => setPartForm({ ...partForm, stock: e.target.value })}
                  className="input-field font-mono font-bold"
                />
              </Field>

              <Field label="Unit of Measure">
                <input
                  type="text"
                  value={partForm.unit}
                  onChange={e => setPartForm({ ...partForm, unit: e.target.value })}
                  className="input-field"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Wholesale Cost Price (TZS)">
                <input
                  type="number"
                  value={partForm.unitCost}
                  onChange={e => setPartForm({ ...partForm, unitCost: e.target.value })}
                  className="input-field font-mono"
                />
              </Field>

              <Field label="Vessel Sell Price (TZS)">
                <input
                  type="number"
                  value={partForm.sellPrice}
                  onChange={e => setPartForm({ ...partForm, sellPrice: e.target.value })}
                  className="input-field font-mono font-bold text-blue-900"
                />
              </Field>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setNewSpareModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={submitSpare}
                disabled={!partForm.name || !partForm.partNo}
                className="btn-primary"
              >
                Save Spare Part
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 4: VIEW WORK ORDER DETAILS */}
      {viewOrder && (
        <Modal title={`Work Order Details: ${viewOrder.no}`} close={() => setViewOrder(null)}>
          <div className="flex flex-col gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 m-0">{viewOrder.title}</h3>
                  <span className="text-[11px] text-slate-500 font-mono">Date: {viewOrder.date}</span>
                </div>
                <Badge
                  variant={
                    viewOrder.status === 'Completed'
                      ? 'green'
                      : viewOrder.status === 'In Progress'
                        ? 'amber'
                        : 'blue'
                  }
                >
                  {viewOrder.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">VESSEL:</span>
                  <b className="text-slate-900">
                    {boats.find(b => b.id === viewOrder.boatId)?.name || 'Vessel'} (
                    {boats.find(b => b.id === viewOrder.boatId)?.regNo})
                  </b>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">MECHANIC:</span>
                  <b className="text-slate-900">{viewOrder.mechanic}</b>
                </div>
              </div>

              <div className="pt-1">
                <span className="text-slate-400 block text-[10px]">REPORTED FAULT:</span>
                <p className="text-slate-800 m-0 mt-0.5">{viewOrder.fault}</p>
              </div>

              {viewOrder.parts && viewOrder.parts.length > 0 && (
                <div className="border-t border-slate-200 pt-2">
                  <span className="text-slate-400 block text-[10px] mb-1">PARTS USED:</span>
                  <div className="space-y-1">
                    {viewOrder.parts.map((p, idx) => (
                      <div key={idx} className="flex justify-between bg-white p-1.5 rounded border border-slate-200">
                        <span>{p.name} × {p.qty}</span>
                        <b className="font-mono">{tzs(p.cost)}</b>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-slate-200 pt-2 flex justify-between">
                <span>Parts Total:</span>
                <b className="font-mono">{tzs(viewOrder.partsCost)}</b>
              </div>
              <div className="flex justify-between">
                <span>Labor Total:</span>
                <b className="font-mono">{tzs(viewOrder.laborCost)}</b>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
                <span>TOTAL JOB COST:</span>
                <span className="font-mono text-blue-950">{tzs(viewOrder.totalCost)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              {viewOrder.status !== 'Completed' ? (
                <button
                  type="button"
                  onClick={() => {
                    updateOrderStatus(viewOrder.id, 'Completed')
                    setViewOrder(null)
                  }}
                  className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-xs"
                >
                  <Check size={14} /> Complete &amp; Sign-off Work Order
                </button>
              ) : (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 size={16} /> Job Completed &amp; Verified
                </span>
              )}
              <button
                type="button"
                onClick={() => setViewOrder(null)}
                className="btn-secondary text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

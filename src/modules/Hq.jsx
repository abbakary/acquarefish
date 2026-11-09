import React, { useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts'
import {
  Building2,
  TrendingUp,
  MapPin,
  Plus,
  ArrowRight,
  ShieldCheck,
  Award,
  DollarSign,
  Truck,
  Warehouse,
  Anchor
} from 'lucide-react'
import { useS, PLANS, SPECIES, supBal, cusBal, stock } from '../store'
import { Modal, Field, Badge, FishPhoto, f, tzs } from '../ui'

const BRANCH_COLORS = ['#0b3a8c', '#ea580c', '#10b981', '#6366f1', '#ec4899']

const sm = (l, g) => (l || []).reduce((t, x) => t + g(x), 0)

const met = (d, from) => {
  if (!d) {
    return {
      rev: 0, cogs: 0, gp: 0, tr: 0, ex: 0, ws: 0, net: 0, mg: 0,
      bkg: 0, skg: 0, stk: 0, debt: 0, owed: 0, pend: 0
    }
  }
  const ok = x => !from || (x.date || '') >= from
  const bs = (d.batches || []).filter(ok)
  const ss = (d.sales || []).filter(ok)
  const rev = sm(ss, x => (x.kg || 0) * (x.price || 0))
  const cogs = sm(ss, x => x.cogs || 0)
  const tr = sm((d.trips || []).filter(ok), x => x.cost || 0)
  const ex = sm((d.exps || []).filter(ok), x => x.amt || 0)
  const ws = sm(d.batches || [], b => (b.waste || 0) * (b.price || 0))
  const gp = rev - cogs
  return {
    rev,
    cogs,
    gp,
    tr,
    ex,
    ws,
    net: gp - tr - ex - ws,
    mg: rev ? (gp / rev) * 100 : 0,
    bkg: sm(bs, b => b.kg || 0),
    skg: sm(ss, x => x.kg || 0),
    stk: sm(Object.values(stock(d || {})), v => v || 0),
    debt: sm(d.customers || [], c => cusBal(d, c.id)),
    owed: sm(d.suppliers || [], y => supBal(d, y.id)),
    pend: (d.batches || []).filter(b => b.st === 'pending').length
  }
}

export default function Hq({ go }) {
  const { T, x, B } = useS()
  const [period, setPeriod] = useState('30 days')
  const [open, setOpen] = useState(false)
  const [nb, setNb] = useState({ name: '', region: 'Mwanza' })

  if (!T) {
    return (
      <div className="page-body">
        <div className="panel p-8 text-center text-slate-500">
          <Building2 size={40} className="mx-auto mb-3 text-slate-400" />
          <h3 className="text-base font-bold text-slate-800">Executive HQ Analytics</h3>
          <p className="text-xs text-slate-500 mt-1">
            Please log in with an administrator or multi-branch account to view cross-station consolidated metrics.
          </p>
        </div>
      </div>
    )
  }

  const n = period === '7 days' ? 7 : period === '30 days' ? 30 : 0
  const dAgo = days => {
    const d = new Date()
    d.setDate(d.getDate() - days)
    return d.toISOString().slice(0, 10)
  }
  const from = n ? dAgo(n) : ''
  const lim = PLANS.find(q => q.id === T?.plan)?.branches || 1
  const branches = T?.branches || []

  const rows = branches.map((b, i) => ({
    b,
    color: BRANCH_COLORS[i % 5],
    m: met(b.data, from)
  }))

  const tot = k => sm(rows, r => r.m[k])

  // Recharts comparison data
  const comparisonData = rows.map(r => ({
    name: (r.b?.name || 'Station').split(' (')[0],
    revenue: r.m.rev,
    costs: r.m.cogs + r.m.tr + r.m.ex + r.m.ws,
    netProfit: r.m.net,
    volumeKg: r.m.bkg
  }))

  return (
    <div className="page-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 m-0">Executive Multi-Branch Analytics</h2>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Cross-branch consolidation for {T?.name || 'Fisheries Group'} across Lake Victoria &amp; Lake Tanganyika value chains.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
            {['7 days', '30 days', 'All time'].map(t => (
              <button
                key={t}
                onClick={() => setPeriod(t)}
                className={`px-3 py-1.5 rounded-md transition ${period === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <button onClick={() => setOpen(true)} className="btn-primary text-xs">
            <Plus size={14} /> Add Station
          </button>
        </div>
      </div>

      {/* Group Level KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap">
            <DollarSign size={22} />
          </div>
          <div className="kpi-content">
            <small>Group Revenue</small>
            <b>{tzs(tot('rev'))}</b>
            <span className="kpi-sub">All branches consolidated</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap green">
            <TrendingUp size={22} />
          </div>
          <div className="kpi-content">
            <small>Consolidated Net Profit</small>
            <b>{tzs(tot('net'))}</b>
            <span className="kpi-sub text-emerald-600 font-semibold">After logistics &amp; losses</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap amber">
            <Anchor size={22} />
          </div>
          <div className="kpi-content">
            <small>Total Fish Sourced</small>
            <b>{f(tot('bkg'))} <span className="text-xs font-sans text-slate-400">kg</span></b>
            <span className="kpi-sub">{f(tot('skg'))} kg delivered</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap purple">
            <Building2 size={22} />
          </div>
          <div className="kpi-content">
            <small>Landing Branches</small>
            <b>{branches.length} <span className="text-xs font-sans text-slate-400">sites</span></b>
            <span className="kpi-sub">{T?.plan || 'Business'} Tier</span>
          </div>
        </div>
      </div>

      {/* Multi-Branch Recharts Visual Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Revenue vs. Operating Costs by Branch</h3>
              <p>Performance comparison in TZS</p>
            </div>
          </div>
          <div className="w-full h-72 min-h-[288px]">
            <ResponsiveContainer width="100%" height={280} minHeight={280}>
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <Tooltip
                  formatter={(val, name) => [tzs(val), name === 'revenue' ? 'Revenue' : 'Total Costs']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="revenue" name="Sales Revenue" fill="#0b3a8c" radius={[4, 4, 0, 0]} />
                <Bar dataKey="costs" name="Total Landed Costs" fill="#ea580c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Fish Volume Sourced by Branch</h3>
              <p>Kilograms landed at each station</p>
            </div>
          </div>
          <div className="w-full h-72 min-h-[288px]">
            <ResponsiveContainer width="100%" height={280} minHeight={280}>
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <Tooltip
                  formatter={val => [`${f(val)} kg`, 'Volume Sourced']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Bar dataKey="volumeKg" name="Kilograms Purchased" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Multi-Branch Side-by-Side Table */}
      <div className="panel p-0 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-900 m-0">Landing Station Comparison Matrix</h3>
            <p className="text-xs text-slate-500 m-0">Click 'Switch Branch' to navigate operational data to that specific station</p>
          </div>
          <span className="text-xs text-slate-500 font-semibold font-mono">
            Active: <strong>{B?.name || 'All Stations'}</strong>
          </span>
        </div>
        <div className="data-table-wrap border-0 rounded-none">
          <table className="data-table">
            <thead>
              <tr>
                <th>Branch Station</th>
                <th>Revenue</th>
                <th>Gross Margin</th>
                <th>Net Profit</th>
                <th>Purchased (kg)</th>
                <th>Sold (kg)</th>
                <th>Cold Stock (kg)</th>
                <th>Transport</th>
                <th>Debts Owed</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.b.id} className={B && r.b.id === B.id ? 'bg-blue-50/40' : ''}>
                  <td>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className={B && r.b.id === B.id ? 'text-blue-700' : 'text-slate-400'} />
                      <b className="text-slate-900">{r.b.name}</b>
                      {B && r.b.id === B.id && <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">CURRENT</span>}
                    </div>
                  </td>
                  <td>
                    <b className="font-mono text-slate-900">{tzs(r.m.rev)}</b>
                  </td>
                  <td>
                    <span className="font-mono font-bold text-emerald-700">{r.m.mg.toFixed(1)}%</span>
                  </td>
                  <td>
                    <b className={`font-mono ${r.m.net >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {tzs(r.m.net)}
                    </b>
                  </td>
                  <td>
                    <span className="font-mono text-slate-800">{f(r.m.bkg)} kg</span>
                  </td>
                  <td>
                    <span className="font-mono text-slate-800">{f(r.m.skg)} kg</span>
                  </td>
                  <td>
                    <b className="font-mono text-blue-800">{f(r.m.stk)} kg</b>
                  </td>
                  <td>
                    <span className="font-mono text-slate-600">{tzs(r.m.tr)}</span>
                  </td>
                  <td>
                    <span className="font-mono text-slate-600">{tzs(r.m.debt)}</span>
                  </td>
                  <td className="text-right">
                    {!B || r.b.id !== B.id ? (
                      <button
                        onClick={() => {
                          x.switchBranch(r.b.id)
                          go('home')
                        }}
                        className="btn-primary text-xs py-1 px-2.5 bg-blue-800 hover:bg-blue-900"
                      >
                        Switch View
                      </button>
                    ) : (
                      <span className="text-xs text-blue-700 font-bold">Viewing</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Branch Modal */}
      {open && (
        <Modal
          title="Add New Landing Station Branch"
          subtitle={`Your ${T?.plan || 'Business'} plan allows up to ${lim} stations.`}
          onClose={() => setOpen(false)}
        >
          {(T?.branches || []).length >= lim ? (
            <p className="text-sm text-rose-700">
              Station limit reached for your current subscription. Please upgrade to Business or Enterprise.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              <Field label="Landing Station Name">
                <input
                  type="text"
                  placeholder="e.g. Bukoba Kemondo Bay Station"
                  value={nb.name}
                  onChange={e => setNb({ ...nb, name: e.target.value })}
                  className="input-field"
                />
              </Field>

              <Field label="Region / Location">
                <select
                  value={nb.region}
                  onChange={e => setNb({ ...nb, region: e.target.value })}
                  className="input-field"
                >
                  <option value="Mwanza">Mwanza (Lake Victoria)</option>
                  <option value="Kigoma">Kigoma (Lake Tanganyika)</option>
                  <option value="Musoma">Musoma (Mara Region)</option>
                  <option value="Kagera">Kagera / Bukoba</option>
                  <option value="Dar es Salaam">Dar es Salaam (Marine Port)</option>
                </select>
              </Field>

              <button
                type="button"
                disabled={!nb.name}
                onClick={() => {
                  x.addBranch(nb.name, nb.region)
                  setOpen(false)
                  setNb({ name: '', region: 'Mwanza' })
                }}
                className="btn-primary mt-2"
              >
                Create Station
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}

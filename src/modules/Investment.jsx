import React, { useState } from 'react'
import {
  Hammer,
  Plus,
  Search,
  Ship,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Clock,
  FileText,
  Calendar,
  Layers,
  Percent,
  Check,
  ChevronRight,
  ShieldCheck,
  Building2,
  ArrowRight,
  Wrench
} from 'lucide-react'
import { useS } from '../store'
import { Modal, Field, Badge, f, tzs, fmtT } from '../ui'

export default function Investment() {
  const { s, a } = useS()
  const [tab, setTab] = useState('projects') // 'projects' | 'costs' | 'agreements'
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [stageModalOpen, setStageModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [search, setSearch] = useState('')

  const projects = s.boatProjects || []
  const suppliers = s.suppliers || []
  const boats = s.boats || []

  // Top KPIs
  const totalProjects = projects.length
  const activeProjects = projects.filter(p => p.status === 'Under Construction' || p.status === 'In Progress')
  const totalInvestmentSpend = projects.reduce((sum, p) => sum + (p.costBreakdown?.total || 0), 0)
  const totalPaidOut = projects.reduce((sum, p) => sum + (p.paidStages || 0), 0)
  const totalContractualRecoverable = projects.reduce((sum, p) => sum + (p.contractualRecoverable || 0), 0)

  // New Project Form State
  const [projectForm, setProjectForm] = useState({
    name: 'MV Ziwa Ushindi II (12m Heavy Mashua)',
    targetBoatName: 'MV Ziwa Ushindi II',
    builder: 'Fundi Mzee Selemani (Kirumba Boat Yard)',
    builderPhone: '0754 990 123',
    assignedSupId: suppliers[0]?.id || '',
    timberMaterials: '3000000',
    labour: '1500000',
    engine: '4000000',
    equipment: '500000',
    paidStages: '4500000',
    ownershipType: 'Company Asset with Fisherman Hire-Purchase',
    contractualRecoverable: '4000000',
    repaymentTerms: '20% deduction from agreed fish catch over 2 seasons',
    targetCompletion: new Date(Date.now() + 45 * 864e5).toISOString().slice(0, 10),
    notes: 'Premium hardwood timber for deep lake operations'
  })

  // Staged Payment Form State
  const [paymentForm, setPaymentForm] = useState({
    amount: '1000000',
    stageName: 'Marine Engine Installation'
  })

  const submitProject = () => {
    if (!projectForm.name.trim()) return
    a.addBoatProject(projectForm)
    setProjectModalOpen(false)
  }

  const submitStagedPayment = () => {
    if (!selectedProject || !(+paymentForm.amount > 0)) return
    a.addProjectPayment(selectedProject.id, +paymentForm.amount, paymentForm.stageName)
    setStageModalOpen(false)
  }

  const handleUpdateProgress = (projId, newPct, newStatus) => {
    a.updateProjectProgress(projId, newPct, newStatus)
  }

  return (
    <div className="page-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 m-0">Boat Construction &amp; Capital Investment</h2>
            <Badge variant="blue">Capital Assets</Badge>
          </div>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Monitor boat construction projects, materials, yard labour, marine engines, staged disbursements, and hire-purchase recovery contracts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setProjectModalOpen(true)} className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-500 font-bold">
            <Plus size={14} /> + New Boat Construction Project
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Capital Projects</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black font-mono text-slate-900">{totalProjects}</span>
                <span className="text-xs text-slate-500">Vessels ({activeProjects.length} Active in Yard)</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800">
              <Hammer size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Disbursed:</span>
            <span className="font-mono font-bold text-slate-800">{tzs(totalPaidOut)}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Project Commitments</span>
              <span className="text-2xl font-black font-mono text-blue-900 mt-1 block">{tzs(totalInvestmentSpend)}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-800">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Includes:</span>
            <span className="text-slate-700">Timber, Labour, Engine, Rigging</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-amber-200 bg-amber-50/20 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Contractual Recoverable</span>
              <span className="text-2xl font-black font-mono text-amber-950 mt-1 block">{tzs(totalContractualRecoverable)}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-amber-100 flex items-center justify-between text-xs text-amber-900">
            <span>Accounting Distinction:</span>
            <span className="font-bold">Company Asset vs Hire-Purchase</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Yard Partner</span>
              <span className="text-sm font-bold text-slate-900 mt-1 block">Kirumba Boat Yard</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
              <Ship size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Supervision:</span>
            <span className="font-semibold text-emerald-700">TMDA &amp; Marine Inspection</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-xs font-bold">
        <button
          onClick={() => setTab('projects')}
          className={`pb-3 transition flex items-center gap-2 border-b-2 ${
            tab === 'projects' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Hammer size={15} /> Construction Projects &amp; Progress ({projects.length})
        </button>
        <button
          onClick={() => setTab('costs')}
          className={`pb-3 transition flex items-center gap-2 border-b-2 ${
            tab === 'costs' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers size={15} /> Materials &amp; Staged Payments Breakdown
        </button>
        <button
          onClick={() => setTab('agreements')}
          className={`pb-3 transition flex items-center gap-2 border-b-2 ${
            tab === 'agreements' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText size={15} /> Fisherman Hire-Purchase Agreements
        </button>
      </div>

      {/* TAB 1: CONSTRUCTION PROJECTS */}
      {tab === 'projects' && (
        <div className="flex flex-col gap-4">
          <div className="p-4 bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="space-y-1">
              <b className="text-sm">Boat Construction &amp; Asset Policy</b>
              <p className="text-xs text-blue-100 max-w-2xl m-0">
                The ERP clearly distinguishes the boat as a <b>Company Asset</b> from any portion contractually recoverable from a fisherman. Construction costs do not automatically inflate fisherman debt unless specified under hire-purchase terms.
              </p>
            </div>
            <button onClick={() => setProjectModalOpen(true)} className="px-4 py-2 bg-white text-blue-950 font-bold text-xs rounded-lg shadow hover:bg-blue-50 transition whitespace-nowrap">
              + New Boat Construction
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {projects.map(proj => {
              const assignedSup = suppliers.find(s => s.id === proj.assignedSupId)
              const totalCost = proj.costBreakdown?.total || 9000000
              const paid = proj.paidStages || 0
              const pct = proj.progressPct || 50

              return (
                <div key={proj.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:border-blue-400 transition">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] font-mono font-bold text-blue-900 block">{proj.projectNo}</span>
                        <h3 className="text-base font-bold text-slate-900 m-0 mt-0.5">{proj.name}</h3>
                        <span className="text-xs text-slate-500 block">Builder: {proj.builder} ({proj.builderPhone})</span>
                      </div>
                      <Badge variant={proj.status === 'Completed & Commissioned' ? 'green' : 'amber'}>
                        {proj.status}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-600">Construction Milestones:</span>
                        <b className="text-blue-900 font-mono">{pct}% Completed</b>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-blue-800 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Cost Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 bg-slate-50 rounded border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Timber</span>
                        <b className="font-mono text-slate-900">{tzs(proj.costBreakdown?.timberMaterials || 3000000)}</b>
                      </div>
                      <div className="p-2 bg-slate-50 rounded border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Labour</span>
                        <b className="font-mono text-slate-900">{tzs(proj.costBreakdown?.labour || 1500000)}</b>
                      </div>
                      <div className="p-2 bg-slate-50 rounded border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Engine</span>
                        <b className="font-mono text-slate-900">{tzs(proj.costBreakdown?.engine || 4000000)}</b>
                      </div>
                      <div className="p-2 bg-slate-50 rounded border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Equipment</span>
                        <b className="font-mono text-slate-900">{tzs(proj.costBreakdown?.equipment || 500000)}</b>
                      </div>
                    </div>

                    {/* Staged Payments Status */}
                    <div className="flex items-center justify-between p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs">
                      <div>
                        <span className="text-slate-500 block">Total Project Investment:</span>
                        <b className="text-sm font-mono text-slate-900 font-bold">{tzs(totalCost)}</b>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 block">Paid Stages:</span>
                        <b className="text-sm font-mono text-emerald-700 font-bold">{tzs(paid)}</b>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setSelectedProject(proj)
                        setStageModalOpen(true)
                      }}
                      className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <DollarSign size={13} /> Record Staged Payment
                    </button>
                    {proj.status !== 'Completed & Commissioned' && (
                      <button
                        onClick={() => handleUpdateProgress(proj.id, 100, 'Completed & Commissioned')}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition flex items-center gap-1"
                      >
                        <Check size={13} /> Complete &amp; Commission
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MATERIALS & COSTS */}
      {tab === 'costs' && (
        <div className="flex flex-col gap-3">
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project # &amp; Vessel</th>
                  <th>Timber &amp; Materials</th>
                  <th>Yard Labour</th>
                  <th>Outboard Engine</th>
                  <th>Rigging &amp; Gear</th>
                  <th>Total Budget</th>
                  <th>Paid to Date</th>
                  <th>Balance Remaining</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p.id}>
                    <td>
                      <b className="text-slate-900 block">{p.name}</b>
                      <span className="text-[11px] font-mono text-slate-400">{p.projectNo}</span>
                    </td>
                    <td className="font-mono">{tzs(p.costBreakdown?.timberMaterials || 3000000)}</td>
                    <td className="font-mono">{tzs(p.costBreakdown?.labour || 1500000)}</td>
                    <td className="font-mono">{tzs(p.costBreakdown?.engine || 4000000)}</td>
                    <td className="font-mono">{tzs(p.costBreakdown?.equipment || 500000)}</td>
                    <td className="font-mono font-bold text-slate-900">{tzs(p.costBreakdown?.total || 9000000)}</td>
                    <td className="font-mono text-emerald-700 font-bold">{tzs(p.paidStages || 0)}</td>
                    <td className="font-mono text-amber-700 font-bold">{tzs(p.balanceToPay || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: HIRE-PURCHASE AGREEMENTS */}
      {tab === 'agreements' && (
        <div className="flex flex-col gap-3">
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project #</th>
                  <th>Beneficiary Fisherman</th>
                  <th>Ownership Model</th>
                  <th>Total Asset Value</th>
                  <th>Contractual Recoverable</th>
                  <th>Repayment Terms</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => {
                  const sup = suppliers.find(s => s.id === p.assignedSupId)
                  return (
                    <tr key={p.id}>
                      <td className="font-mono font-bold text-blue-900">{p.projectNo}</td>
                      <td>
                        <b className="text-slate-900 block">{sup?.name || 'Unassigned'}</b>
                        <span className="text-[11px] text-slate-500 font-mono">{sup?.phone || '-'}</span>
                      </td>
                      <td>
                        <Badge variant="blue">{p.ownershipType}</Badge>
                      </td>
                      <td className="font-mono font-bold text-slate-900">{tzs(p.costBreakdown?.total || 9000000)}</td>
                      <td className="font-mono font-bold text-amber-800">{tzs(p.contractualRecoverable || 0)}</td>
                      <td className="text-xs text-slate-600">{p.repaymentTerms || 'Catch deduction agreement'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: NEW CONSTRUCTION PROJECT */}
      {projectModalOpen && (
        <Modal title="Register Boat Construction Project" close={() => setProjectModalOpen(false)}>
          <div className="flex flex-col gap-4 text-xs">
            <Field label="Project &amp; Vessel Name">
              <input
                type="text"
                value={projectForm.name}
                onChange={e => setProjectForm({ ...projectForm, name: e.target.value, targetBoatName: e.target.value })}
                className="input-field font-bold"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Boat Yard / Builder Name">
                <input
                  type="text"
                  value={projectForm.builder}
                  onChange={e => setProjectForm({ ...projectForm, builder: e.target.value })}
                  className="input-field"
                />
              </Field>

              <Field label="Builder Contact #">
                <input
                  type="text"
                  value={projectForm.builderPhone}
                  onChange={e => setProjectForm({ ...projectForm, builderPhone: e.target.value })}
                  className="input-field font-mono"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Beneficiary Fisherman / Operator">
                <select
                  value={projectForm.assignedSupId}
                  onChange={e => setProjectForm({ ...projectForm, assignedSupId: e.target.value })}
                  className="input-field"
                >
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.id}>{sup.name} ({sup.cat})</option>
                  ))}
                </select>
              </Field>

              <Field label="Target Completion Date">
                <input
                  type="date"
                  value={projectForm.targetCompletion}
                  onChange={e => setProjectForm({ ...projectForm, targetCompletion: e.target.value })}
                  className="input-field"
                />
              </Field>
            </div>

            {/* Cost Breakdown Inputs */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-slate-800 block">Capital Cost Breakdown (TZS)</span>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Timber &amp; Materials">
                  <input
                    type="number"
                    value={projectForm.timberMaterials}
                    onChange={e => setProjectForm({ ...projectForm, timberMaterials: e.target.value })}
                    className="input-field font-mono font-bold"
                  />
                </Field>
                <Field label="Yard Labour">
                  <input
                    type="number"
                    value={projectForm.labour}
                    onChange={e => setProjectForm({ ...projectForm, labour: e.target.value })}
                    className="input-field font-mono font-bold"
                  />
                </Field>
                <Field label="Outboard Engine">
                  <input
                    type="number"
                    value={projectForm.engine}
                    onChange={e => setProjectForm({ ...projectForm, engine: e.target.value })}
                    className="input-field font-mono font-bold"
                  />
                </Field>
                <Field label="Rigging &amp; Other Equipment">
                  <input
                    type="number"
                    value={projectForm.equipment}
                    onChange={e => setProjectForm({ ...projectForm, equipment: e.target.value })}
                    className="input-field font-mono font-bold"
                  />
                </Field>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Ownership Structure">
                <select
                  value={projectForm.ownershipType}
                  onChange={e => setProjectForm({ ...projectForm, ownershipType: e.target.value })}
                  className="input-field"
                >
                  <option>Company Asset with Fisherman Hire-Purchase</option>
                  <option>100% Company-Owned Asset</option>
                  <option>Fisherman-Owned with Company Loan</option>
                </select>
              </Field>

              <Field label="Contractual Recoverable Amount (TZS)">
                <input
                  type="number"
                  value={projectForm.contractualRecoverable}
                  onChange={e => setProjectForm({ ...projectForm, contractualRecoverable: e.target.value })}
                  className="input-field font-mono font-bold text-amber-800"
                />
              </Field>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button type="button" onClick={() => setProjectModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={submitProject} className="btn-primary">
                Register Capital Project
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: STAGED PAYMENT */}
      {stageModalOpen && selectedProject && (
        <Modal title={`Record Staged Payment: ${selectedProject.name}`} close={() => setStageModalOpen(false)}>
          <div className="flex flex-col gap-4 text-xs">
            <Field label="Milestone / Construction Stage">
              <input
                type="text"
                value={paymentForm.stageName}
                onChange={e => setPaymentForm({ ...paymentForm, stageName: e.target.value })}
                className="input-field font-semibold"
              />
            </Field>

            <Field label="Disbursement Amount (TZS)">
              <input
                type="number"
                value={paymentForm.amount}
                onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                className="input-field font-mono font-bold text-base"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setStageModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={submitStagedPayment} className="btn-primary">
                Confirm Payment
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

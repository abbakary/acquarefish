import React, { useState } from 'react'
import {
  DollarSign,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Smartphone,
  CreditCard,
  User,
  Ship,
  TrendingUp,
  FileText,
  BadgeCheck,
  Check,
  X,
  Filter,
  ArrowDownRight,
  RotateCcw
} from 'lucide-react'
import { useS, supAdvancesDebt } from '../store'
import { Modal, Field, Badge, f, tzs, fmtT } from '../ui'

export default function Advances() {
  const { s, a } = useS()
  const [tab, setTab] = useState('requests') // 'requests' | 'history' | 'repayments'
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [approvalModalOpen, setApprovalModalOpen] = useState(false)
  const [repayModalOpen, setRepayModalOpen] = useState(false)
  const [selectedAdvance, setSelectedAdvance] = useState(null)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')

  const advances = s.advances || []
  const suppliers = s.suppliers || []
  const boats = s.boats || []

  // Top KPIs
  const totalAdvancesCount = advances.length
  const pendingApprovals = advances.filter(a => a.status === 'Pending Approval')
  const totalAdvancesSum = advances.filter(a => a.status === 'Approved').reduce((sum, x) => sum + (x.amount || 0), 0)
  const totalRecovered = advances.reduce((sum, x) => sum + (x.recovered || 0), 0)
  const totalOutstandingAdvancesDebt = suppliers.reduce((sum, sup) => sum + supAdvancesDebt(s, sup.id), 0)

  // Request Form State
  const [requestForm, setRequestForm] = useState({
    supId: suppliers[0]?.id || '',
    amount: '50000',
    category: 'Daily Matumizi',
    purpose: 'Daily crew lunch and personal family upkeep',
    method: 'M-Pesa (Mobile Money)',
    phone: suppliers[0]?.phone || '',
    classification: 'Fisherman-recoverable',
    notes: 'Requested at morning landing call'
  })

  // Approval Form State
  const [approvalForm, setApprovalForm] = useState({
    status: 'Approved',
    approvedAmount: '50000',
    notes: 'Approved as requested'
  })

  // Repayment Form State
  const [repayForm, setRepayForm] = useState({
    amount: '30000',
    method: 'Cash',
    notes: 'Direct cash counter payment'
  })

  const submitRequestAdvance = () => {
    if (!(+requestForm.amount > 0)) return
    a.requestAdvance({
      supId: requestForm.supId,
      amount: +requestForm.amount,
      category: requestForm.category,
      purpose: requestForm.purpose,
      method: requestForm.method,
      phone: requestForm.phone,
      classification: requestForm.classification,
      notes: requestForm.notes
    })
    setRequestModalOpen(false)
  }

  const submitApproval = () => {
    if (!selectedAdvance) return
    a.approveAdvance(selectedAdvance.id, approvalForm.status, +approvalForm.approvedAmount)
    setApprovalModalOpen(false)
    setSelectedAdvance(null)
  }

  const submitRepayment = () => {
    if (!selectedAdvance || !(+repayForm.amount > 0)) return
    a.repayAdvance(selectedAdvance.id, +repayForm.amount, repayForm.method, repayForm.notes)
    setRepayModalOpen(false)
    setSelectedAdvance(null)
  }

  return (
    <div className="page-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 m-0">Fisherman Cash Advances &amp; Daily Matumizi</h2>
            <Badge variant="blue">Crew Liquidity</Badge>
          </div>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Administer personal advances, daily crew matumizi, manager sign-offs, M-Pesa disbursements, and ledger debit recoveries.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setRequestModalOpen(true)} className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-500 font-bold">
            <Plus size={14} /> + Request Cash Advance / Matumizi
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pending Manager Approvals</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-2xl font-black font-mono ${pendingApprovals.length > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                  {pendingApprovals.length}
                </span>
                <span className="text-xs text-slate-500">Requests</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
              <Clock size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Action:</span>
            <span className="font-semibold text-slate-800">Verify credit limit before approval</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Advances Disbursed</span>
              <span className="text-2xl font-black font-mono text-slate-900 mt-1 block">{tzs(totalAdvancesSum)}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Direct Recoveries:</span>
            <span className="font-bold font-mono text-emerald-700">{tzs(totalRecovered)}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-amber-200 bg-amber-50/20 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Outstanding Advances Debt</span>
              <span className="text-2xl font-black font-mono text-amber-950 mt-1 block">{tzs(totalOutstandingAdvancesDebt)}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-amber-100 flex items-center justify-between text-xs text-amber-900">
            <span>Ledger status:</span>
            <span className="font-bold">Offsets against catch payout</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Supported Channels</span>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">M-Pesa</span>
                <span className="px-2 py-0.5 rounded bg-red-50 text-red-800 border border-red-200 text-[10px] font-bold">Airtel</span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold">Cash</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
              <Smartphone size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Mobile Money:</span>
            <span className="font-bold text-emerald-700">Instant Disbursement</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-xs font-bold">
        <button
          onClick={() => setTab('requests')}
          className={`pb-3 transition flex items-center gap-2 border-b-2 ${
            tab === 'requests' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock size={15} /> Advance Requests &amp; Approvals ({pendingApprovals.length} Pending)
        </button>
        <button
          onClick={() => setTab('history')}
          className={`pb-3 transition flex items-center gap-2 border-b-2 ${
            tab === 'history' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign size={15} /> Active Debts &amp; Matumizi History ({advances.length})
        </button>
      </div>

      {/* TAB 1: ADVANCE REQUESTS & APPROVALS */}
      {tab === 'requests' && (
        <div className="flex flex-col gap-3">
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Voucher #</th>
                  <th>Date</th>
                  <th>Fisherman</th>
                  <th>Category</th>
                  <th>Purpose</th>
                  <th>Amount Requested</th>
                  <th>Disbursement Method</th>
                  <th>Approval Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {advances.map(adv => {
                  const sup = suppliers.find(s => s.id === adv.supId)
                  return (
                    <tr key={adv.id} className="hover:bg-slate-50/80 transition">
                      <td className="font-mono font-bold text-blue-900">{adv.no}</td>
                      <td>
                        <span className="text-xs text-slate-700 block">{adv.date}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{fmtT(adv.at || adv.date)}</span>
                      </td>
                      <td>
                        <b className="text-slate-900 block">{sup?.name || adv.supId}</b>
                        <span className="text-[11px] text-slate-500 font-mono">{sup?.phone || '-'}</span>
                      </td>
                      <td>
                        <Badge variant={adv.category === 'Emergency / Medical' ? 'red' : 'blue'}>
                          {adv.category}
                        </Badge>
                      </td>
                      <td className="text-xs max-w-[200px]">
                        <span className="text-slate-800 block truncate">{adv.purpose}</span>
                        <span className="text-[11px] text-slate-400 block">{adv.notes || '-'}</span>
                      </td>
                      <td className="font-mono font-bold text-slate-900 text-sm">{tzs(adv.amount)}</td>
                      <td>
                        <span className="text-xs font-semibold text-slate-700 block">{adv.method}</span>
                        <span className="text-[11px] font-mono text-slate-400">{adv.phone || '-'}</span>
                      </td>
                      <td>
                        <Badge
                          variant={
                            adv.status === 'Approved'
                              ? 'green'
                              : adv.status === 'Rejected'
                                ? 'red'
                                : 'amber'
                          }
                        >
                          {adv.status}
                        </Badge>
                      </td>
                      <td className="text-right">
                        {adv.status === 'Pending Approval' ? (
                          <button
                            onClick={() => {
                              setSelectedAdvance(adv)
                              setApprovalForm({
                                status: 'Approved',
                                approvedAmount: String(adv.amount),
                                notes: 'Approved by manager'
                              })
                              setApprovalModalOpen(true)
                            }}
                            className="px-2.5 py-1 rounded bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold inline-flex items-center gap-1 transition"
                          >
                            <BadgeCheck size={13} /> Review Request
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedAdvance(adv)
                              setRepayModalOpen(true)
                            }}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition"
                          >
                            <DollarSign size={12} /> Log Repayment
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE DEBTS & HISTORY */}
      {tab === 'history' && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {suppliers.map(sup => {
              const supAdv = advances.filter(a => a.supId === sup.id && a.status === 'Approved')
              const totalAdv = supAdv.reduce((s, a) => s + (a.amount || 0), 0)
              const totalRec = supAdv.reduce((s, a) => s + (a.recovered || 0), 0)
              const outstanding = Math.max(0, totalAdv - totalRec)

              return (
                <div key={sup.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <b className="text-slate-900 block">{sup.name}</b>
                      <span className="text-xs text-slate-400 font-mono">{sup.no}</span>
                    </div>
                    <Badge variant={outstanding > 0 ? 'amber' : 'green'}>
                      {outstanding > 0 ? 'Active Debt' : 'Clear'}
                    </Badge>
                  </div>
                  <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Total Borrowed:</span>
                      <b className="font-mono text-slate-800">{tzs(totalAdv)}</b>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Direct Repaid:</span>
                      <span className="font-mono text-emerald-700 font-bold">{tzs(totalRec)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-1">
                      <span className="font-bold text-slate-800">Outstanding:</span>
                      <b className="font-mono text-red-600 font-bold">{tzs(outstanding)}</b>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: REQUEST ADVANCE */}
      {requestModalOpen && (
        <Modal title="Request Fisherman Cash Advance / Daily Matumizi" close={() => setRequestModalOpen(false)}>
          <div className="flex flex-col gap-4 text-xs">
            <Field label="Fisherman / Beneficiary">
              <select
                value={requestForm.supId}
                onChange={e => {
                  const sObj = suppliers.find(x => x.id === e.target.value)
                  setRequestForm({
                    ...requestForm,
                    supId: e.target.value,
                    phone: sObj?.phone || requestForm.phone
                  })
                }}
                className="input-field"
              >
                {suppliers.map(sup => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name} ({sup.no}) · Limit: {tzs(sup.creditLimit || 2000000)}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Amount Requested (TZS)">
                <input
                  type="number"
                  value={requestForm.amount}
                  onChange={e => setRequestForm({ ...requestForm, amount: e.target.value })}
                  className="input-field font-mono font-bold text-base"
                />
              </Field>

              <Field label="Advance Category">
                <select
                  value={requestForm.category}
                  onChange={e => setRequestForm({ ...requestForm, category: e.target.value })}
                  className="input-field"
                >
                  <option>Daily Matumizi</option>
                  <option>Weekly Crew Advance</option>
                  <option>Emergency / Medical</option>
                  <option>School Fees / Family Support</option>
                  <option>Off-Season Upkeep</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Payment Channel">
                <select
                  value={requestForm.method}
                  onChange={e => setRequestForm({ ...requestForm, method: e.target.value })}
                  className="input-field"
                >
                  <option>M-Pesa (Mobile Money)</option>
                  <option>Airtel Money</option>
                  <option>Tigo Pesa</option>
                  <option>Cash at Dock</option>
                  <option>Bank RTGS</option>
                </select>
              </Field>

              <Field label="Recipient Phone / Account Number">
                <input
                  type="text"
                  value={requestForm.phone}
                  onChange={e => setRequestForm({ ...requestForm, phone: e.target.value })}
                  className="input-field font-mono"
                />
              </Field>
            </div>

            <Field label="Purpose Description">
              <input
                type="text"
                value={requestForm.purpose}
                onChange={e => setRequestForm({ ...requestForm, purpose: e.target.value })}
                className="input-field font-medium"
              />
            </Field>

            <Field label="Classification">
              <select
                value={requestForm.classification}
                onChange={e => setRequestForm({ ...requestForm, classification: e.target.value })}
                className="input-field font-semibold"
              >
                <option>Fisherman-recoverable</option>
                <option>Company-funded (Welfare / Non-recoverable)</option>
                <option>Partially Recoverable</option>
              </select>
            </Field>

            <div className="flex justify-between items-center pt-2">
              <button type="button" onClick={() => setRequestModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={submitRequestAdvance} className="btn-primary">
                Submit for Approval
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: MANAGER APPROVAL */}
      {approvalModalOpen && selectedAdvance && (
        <Modal title={`Manager Approval: ${selectedAdvance.no}`} close={() => setApprovalModalOpen(false)}>
          <div className="flex flex-col gap-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <b className="text-slate-900">{suppliers.find(s => s.id === selectedAdvance.supId)?.name}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Requested Amount:</span>
                <b className="font-mono text-blue-900 text-sm">{tzs(selectedAdvance.amount)}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Purpose:</span>
                <span className="text-slate-700">{selectedAdvance.purpose}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Approval Action">
                <select
                  value={approvalForm.status}
                  onChange={e => setApprovalForm({ ...approvalForm, status: e.target.value })}
                  className="input-field font-semibold"
                >
                  <option>Approved</option>
                  <option>Rejected</option>
                </select>
              </Field>

              <Field label="Approved Amount (TZS)">
                <input
                  type="number"
                  value={approvalForm.approvedAmount}
                  onChange={e => setApprovalForm({ ...approvalForm, approvedAmount: e.target.value })}
                  className="input-field font-mono font-bold"
                />
              </Field>
            </div>

            <Field label="Approval Notes / Authorization">
              <input
                type="text"
                value={approvalForm.notes}
                onChange={e => setApprovalForm({ ...approvalForm, notes: e.target.value })}
                className="input-field"
              />
            </Field>

            <div className="flex justify-between items-center pt-2">
              <button type="button" onClick={() => setApprovalModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={submitApproval} className="btn-primary">
                Confirm Approval &amp; Disburse
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: LOG REPAYMENT */}
      {repayModalOpen && selectedAdvance && (
        <Modal title={`Log Direct Repayment: ${selectedAdvance.no}`} close={() => setRepayModalOpen(false)}>
          <div className="flex flex-col gap-4 text-xs">
            <Field label="Repayment Amount (TZS)">
              <input
                type="number"
                value={repayForm.amount}
                onChange={e => setRepayForm({ ...repayForm, amount: e.target.value })}
                className="input-field font-mono font-bold text-base text-emerald-800"
              />
            </Field>

            <Field label="Payment Method">
              <select
                value={repayForm.method}
                onChange={e => setRepayForm({ ...repayForm, method: e.target.value })}
                className="input-field"
              >
                <option>Cash</option>
                <option>M-Pesa (Mobile Money)</option>
                <option>Airtel Money</option>
                <option>Bank RTGS</option>
              </select>
            </Field>

            <Field label="Notes">
              <input
                type="text"
                value={repayForm.notes}
                onChange={e => setRepayForm({ ...repayForm, notes: e.target.value })}
                className="input-field"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setRepayModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={submitRepayment} className="btn-primary">
                Record Credit Repayment
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

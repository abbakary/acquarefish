import React, { useState } from 'react'
import {
  DollarSign,
  CreditCard,
  Search,
  CheckCircle2,
  Phone,
  Printer,
  Calendar,
  ArrowUpRight
} from 'lucide-react'
import { useS, supBal, canUserDo } from '../store'
import { Modal, Field, Badge, ReceiptModal, f, tzs, fmtT } from '../ui'

export default function Payments() {
  const { s, a, me } = useS()
  const canDisburse = canUserDo(me, 'canPay')
  const [payTarget, setPayTarget] = useState(null)
  const [amt, setAmt] = useState('')
  const [method, setMethod] = useState('M-Pesa (Mobile Money)')
  const [voucher, setVoucher] = useState(null)
  const [search, setSearch] = useState('')

  const totalOwed = s.suppliers.reduce((t, y) => t + supBal(s, y.id), 0)
  const totalPaid = s.pays.reduce((t, p) => t + p.amt, 0)

  const handlePay = () => {
    if (!payTarget || !(+amt > 0)) return
    const payAmt = +amt
    a.pay(payTarget.id, payAmt, method)
    setVoucher({
      sup: payTarget.name,
      site: payTarget.site,
      amt: payAmt,
      method,
      date: new Date().toLocaleDateString('en-GB')
    })
    setPayTarget(null)
    setAmt('')
  }

  const suppliers = s.suppliers.filter(y =>
    y.name.toLowerCase().includes(search.toLowerCase()) ||
    y.site.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 m-0">Supplier Payments &amp; Fishermen Debts</h2>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Disburse payments via mobile money (M-Pesa, Airtel Money) or bank transfer and track outstanding balances.
          </p>
        </div>
      </div>

      {!canDisburse && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
          <span>
            <strong>View-Only Security Notice:</strong> Your user profile has read-only access to fishermen accounts. Catch payment disbursement requires authorized finance permission.
          </span>
          <Badge variant="amber">Audit / Read-Only</Badge>
        </div>
      )}

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap amber">
            <DollarSign size={22} />
          </div>
          <div className="kpi-content">
            <small>Total Debt Owed to Fishermen</small>
            <b className="text-rose-700">{tzs(totalOwed)}</b>
            <span className="kpi-sub">Across all landing sites</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap green">
            <CreditCard size={22} />
          </div>
          <div className="kpi-content">
            <small>Total Payments Disbursed</small>
            <b>{tzs(totalPaid)}</b>
            <span className="kpi-sub font-mono">{s.pays.length} vouchers issued</span>
          </div>
        </div>
      </div>

      {/* Supplier Balances Table */}
      <div className="panel p-0 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 m-0">Fishermen Account Balances</h3>
            <p className="text-xs text-slate-500 m-0">Active balances from fish delivery receipts</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search supplier..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9 py-1.5 text-xs"
            />
          </div>
        </div>
        <div className="data-table-wrap border-0 rounded-none">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fisherman / Supplier</th>
                <th>Category</th>
                <th>Landing Station</th>
                <th>Phone Number</th>
                <th>Outstanding Debt</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map(y => {
                const bal = supBal(s, y.id)
                return (
                  <tr key={y.id}>
                    <td>
                      <b className="text-slate-900 block">{y.name}</b>
                      <small className="text-slate-400 font-mono">{y.no || y.id}</small>
                    </td>
                    <td>
                      <Badge variant={y.cat === 'BMU Fishing Group' ? 'blue' : 'neutral'}>
                        {y.cat}
                      </Badge>
                    </td>
                    <td>{y.site}</td>
                    <td className="font-mono text-xs">{y.phone}</td>
                    <td>
                      <b className={`font-mono text-sm ${bal > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {tzs(bal)}
                      </b>
                    </td>
                    <td className="text-right">
                      {bal > 0 ? (
                        canDisburse ? (
                          <button
                            onClick={() => {
                              setPayTarget(y)
                              setAmt(String(bal))
                            }}
                            className="btn-primary text-xs py-1 px-3 bg-emerald-600 hover:bg-emerald-700"
                          >
                            Disburse Payment
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono italic">
                            Disbursement Restricted
                          </span>
                        )
                      ) : (
                        <span className="text-xs text-emerald-700 font-semibold">Settled</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History */}
      <div className="panel p-0 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 m-0">Recent Payment Disbursements</h3>
          <p className="text-xs text-slate-500 m-0">Vouchers paid via mobile money and bank</p>
        </div>
        <div className="data-table-wrap border-0 rounded-none">
          <table className="data-table">
            <thead>
              <tr>
                <th>Voucher #</th>
                <th>Recipient</th>
                <th>Channel</th>
                <th>Amount (TZS)</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[...s.pays].reverse().slice(0, 10).map((p, idx) => {
                const supObj = s.suppliers.find(y => y.id === p.sup)
                return (
                  <tr key={p.id || idx}>
                    <td>
                      <span className="font-mono text-blue-700 font-semibold">{p.ref || `PAY-00${idx + 1}`}</span>
                    </td>
                    <td>
                      <b className="text-slate-900">{supObj?.name || 'Fisherman'}</b>
                    </td>
                    <td>
                      <span className="text-slate-700">{p.m}</span>
                    </td>
                    <td>
                      <b className="font-mono text-emerald-700">{tzs(p.amt)}</b>
                    </td>
                    <td>
                      <span className="font-mono text-xs text-slate-500">{p.date}</span>
                    </td>
                    <td>
                      <Badge variant="green">Disbursed</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Make Payment Modal */}
      {payTarget && (
        <Modal
          title={`Disburse Payment: ${payTarget.name}`}
          subtitle={`Current Balance Owed: ${tzs(supBal(s, payTarget.id))}`}
          onClose={() => setPayTarget(null)}
        >
          <div className="flex flex-col gap-4">
            <Field label="Amount to Disburse (TZS)">
              <input
                type="number"
                value={amt}
                onChange={e => setAmt(e.target.value)}
                className="input-field font-mono text-lg font-bold"
              />
            </Field>

            <Field label="Payment Channel">
              <select
                value={method}
                onChange={e => setMethod(e.target.value)}
                className="input-field font-semibold"
              >
                <option>M-Pesa (Mobile Money)</option>
                <option>Airtel Money</option>
                <option>Tigo Pesa</option>
                <option>CRDB Bank</option>
                <option>NMB Bank</option>
                <option>Cash Voucher</option>
              </select>
            </Field>

            <button
              type="button"
              disabled={!(+amt > 0 && +amt <= supBal(s, payTarget.id))}
              onClick={handlePay}
              className="btn-primary bg-emerald-600 hover:bg-emerald-700 mt-2"
            >
              Confirm Disbursement &amp; Generate Voucher
            </button>
          </div>
        </Modal>
      )}

      {/* Voucher Modal */}
      {voucher && (
        <ReceiptModal
          title="Payment Disbursement Voucher"
          lines={[
            ['Payee', voucher.sup],
            ['Landing Station', voucher.site],
            ['Disbursement Channel', voucher.method],
            ['Amount Paid', tzs(voucher.amt)],
            ['Date', voucher.date],
            ['Status', 'PROCESSED & APPROVED']
          ]}
          onClose={() => setVoucher(null)}
        />
      )}
    </div>
  )
}

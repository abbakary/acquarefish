import React, { useState } from 'react'
import { Fish, ShieldCheck, ArrowRight, User, Lock, Award } from 'lucide-react'
import { useS } from '../store'
import { Field } from '../ui'

export default function Login({ go }) {
  const { x } = useS()
  const [u, setU] = useState('owner')
  const [p, setP] = useState('1234')
  const [err, setErr] = useState('')

  const sub = () => {
    const r = x.login(u, p)
    if (r?.err) setErr(r.err)
    else go('')
  }

  const key = e => e.key === 'Enter' && sub()

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-900">
      {/* Left Banner with Authentic Lake Victoria Fishermen Photo */}
      <div className="relative md:w-1/2 min-h-[240px] md:min-h-screen bg-slate-950 flex flex-col justify-between p-8 md:p-12 overflow-hidden">
        <img
          src="/landing/hero.jpg"
          alt="Lake Victoria fishermen"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-900/20" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 text-white mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
              <Fish size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">
              FishTrade <span className="text-blue-400">ERP</span>
            </span>
          </div>
          <span className="text-xs font-mono text-blue-300 uppercase tracking-wider">
            Tanzania Seafood Supply Chain
          </span>
        </div>

        <div className="relative z-10 flex flex-col gap-3 max-w-md pt-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight m-0">
            Precision fish trade from beach to factory gate.
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed m-0">
            Seamless multi-branch operations for Lake Victoria &amp; Lake Tanganyika fish buying companies.
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold pt-2">
            <ShieldCheck size={16} /> FiRCIS &amp; GS1 Traceability Standards Compliant
          </div>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-slate-50">
        <div className="w-full max-w-md flex flex-col gap-5">
          <button
            onClick={() => go('')}
            className="text-xs font-bold text-blue-800 hover:underline w-fit mb-2"
          >
            &larr; Back to Public Portal
          </button>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 m-0">Sign in to workspace</h2>
            <p className="text-xs text-slate-500 mt-1 mb-0">
              Enter your assigned username and 4-digit PIN.
            </p>
          </div>

          <div className="panel flex flex-col gap-4">
            <Field label="Username">
              <input
                type="text"
                value={u}
                autoCapitalize="none"
                placeholder="e.g. owner, juma, neema"
                onChange={e => {
                  setU(e.target.value)
                  setErr('')
                }}
                onKeyDown={key}
                className="input-field font-semibold"
              />
            </Field>

            <Field label="4-Digit PIN / Password">
              <input
                type="password"
                value={p}
                placeholder="••••"
                onChange={e => {
                  setP(e.target.value)
                  setErr('')
                }}
                onKeyDown={key}
                className="input-field font-mono font-bold tracking-widest"
              />
            </Field>

            {err && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-bold text-rose-700">
                {err}
              </div>
            )}

            <button
              onClick={sub}
              className="btn-primary w-full py-3 justify-center text-sm font-bold shadow-sm"
            >
              Sign In to Station <ArrowRight size={16} />
            </button>
          </div>

          {/* Quick Demo Accounts Selection */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col gap-2.5 text-xs">
            <b className="text-slate-800 uppercase tracking-wide text-[11px]">One-Click Demo Credentials:</b>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setU('owner'); setP('1234') }}
                className="p-2 text-left rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition"
              >
                <strong className="block text-slate-900">Company Owner</strong>
                <span className="text-[11px] text-slate-500 font-mono">owner / 1234</span>
              </button>
              <button
                type="button"
                onClick={() => { setU('juma'); setP('1111') }}
                className="p-2 text-left rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition"
              >
                <strong className="block text-slate-900">Purchasing Officer</strong>
                <span className="text-[11px] text-slate-500 font-mono">juma / 1111</span>
              </button>
              <button
                type="button"
                onClick={() => { setU('neema'); setP('2222') }}
                className="p-2 text-left rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition"
              >
                <strong className="block text-slate-900">Quality Inspector</strong>
                <span className="text-[11px] text-slate-500 font-mono">neema / 2222</span>
              </button>
              <button
                type="button"
                onClick={() => { setU('admin'); setP('admin123') }}
                className="p-2 text-left rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition"
              >
                <strong className="block text-slate-900">Platform Admin</strong>
                <span className="text-[11px] text-slate-500 font-mono">admin / admin123</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500">
            Need to register a new fish trading company?{' '}
            <button onClick={() => go('register')} className="text-blue-800 font-bold hover:underline">
              Create an account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

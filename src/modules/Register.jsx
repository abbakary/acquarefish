import React, { useState } from 'react'
import { Fish, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react'
import { useS, PLANS } from '../store'
import { Field, tzs } from '../ui'

const RSTEPS = ['Company Info', 'Director Profile', 'Landing Branches', 'Choose Plan', 'Review & Launch']

export default function Register({ go }) {
  const { db, x } = useS()
  const [i, setI] = useState(0)
  const [d, setD] = useState({
    company: '',
    sector: 'Fish buying & trading',
    region: 'Mwanza',
    name: '',
    phone: '',
    email: '',
    username: '',
    pin: '',
    branches: [{ name: 'Kirumba Landing Pier (Main)', region: 'Mwanza' }],
    plan: 'Business',
    demo: true
  })

  const set = k => e => setD({ ...d, [k]: e.target.value })
  const pl = PLANS.find(p => p.id === d.plan)

  const taken = db.tenants.some(t => t.staff.some(y => y.username === d.username)) || d.username === 'admin'
  const err = [
    !d.company.trim() || !d.region.trim() ? 'Please provide company name and region.' : '',
    !d.name.trim() || !/^[a-z0-9._]{3,}$/.test(d.username)
      ? 'Enter your name and a lowercase username (3+ chars).'
      : taken
      ? 'That username is already taken.'
      : !/^\d{4,6}$/.test(d.pin)
      ? 'PIN must be 4 to 6 digits.'
      : '',
    d.branches.some(b => !b.name.trim())
      ? 'Please name each landing branch.'
      : d.branches.length > pl.branches
      ? `Your selected plan allows ${pl.branches} branch(es).`
      : '',
    '',
    ''
  ][i]

  const sb = (k, v, j) => setD({ ...d, branches: d.branches.map((b, n) => (n === j ? { ...b, [k]: v } : b)) })

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-900">
      {/* Left Banner */}
      <div className="relative md:w-5/12 min-h-[220px] md:min-h-screen bg-slate-950 flex flex-col justify-between p-8 md:p-12 overflow-hidden">
        <img
          src="/landing/hero.jpg"
          alt="Lake Victoria fishermen"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/40" />

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
            Lake Victoria &amp; Tanganyika
          </span>
        </div>

        <div className="relative z-10 flex flex-col gap-3 max-w-sm pt-8">
          <h2 className="text-2xl font-bold text-white tracking-tight m-0">
            Set up your commercial seafood ERP in 2 minutes.
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed m-0">
            Scale from artisanal fishermen weighing on the beach to multimillion-shilling factory supply contracts.
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold pt-2">
            <ShieldCheck size={16} /> 14 Days Free · No Credit Card Required
          </div>
        </div>
      </div>

      {/* Right Registration Wizard */}
      <div className="md:w-7/12 flex items-center justify-center p-6 md:p-12 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-lg flex flex-col gap-5">
          <button
            onClick={() => go('')}
            className="text-xs font-bold text-blue-800 hover:underline w-fit"
          >
            &larr; Back to Public Portal
          </button>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 m-0">Create company account</h2>
            <p className="text-xs text-slate-500 mt-1 mb-0">Step {i + 1} of 5: {RSTEPS[i]}</p>
          </div>

          {/* Steps Indicator */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-xs">
            {RSTEPS.map((stepName, n) => (
              <span
                key={stepName}
                className={`font-semibold ${n === i ? 'text-blue-700' : n < i ? 'text-emerald-600' : 'text-slate-400'}`}
              >
                {n + 1}. {stepName}
              </span>
            ))}
          </div>

          <div className="panel flex flex-col gap-4">
            {i === 0 && (
              <>
                <Field label="Company / Trading Business Name">
                  <input
                    value={d.company}
                    placeholder="e.g. Mara Fish Exporters Co."
                    onChange={set('company')}
                    className="input-field"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Sector Category">
                    <select value={d.sector} onChange={set('sector')} className="input-field">
                      <option>Fish buying &amp; trading</option>
                      <option>Fish processing factory</option>
                      <option>Seafood export supply</option>
                      <option>BMU Fisherman Cooperative</option>
                    </select>
                  </Field>
                  <Field label="HQ Primary Region">
                    <input
                      value={d.region}
                      onChange={set('region')}
                      placeholder="e.g. Mwanza"
                      className="input-field"
                    />
                  </Field>
                </div>
              </>
            )}

            {i === 1 && (
              <>
                <Field label="Director / Owner Full Name">
                  <input
                    value={d.name}
                    placeholder="e.g. John Mwita"
                    onChange={set('name')}
                    className="input-field"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Phone (M-Pesa / WhatsApp)">
                    <input
                      type="tel"
                      value={d.phone}
                      placeholder="0754 111 222"
                      onChange={set('phone')}
                      className="input-field font-mono"
                    />
                  </Field>
                  <Field label="Email Address">
                    <input
                      type="email"
                      value={d.email}
                      placeholder="director@fishcompany.co.tz"
                      onChange={set('email')}
                      className="input-field"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Login Username">
                    <input
                      value={d.username}
                      autoCapitalize="none"
                      placeholder="e.g. owner, juma"
                      onChange={e => setD({ ...d, username: e.target.value.toLowerCase() })}
                      className="input-field font-mono"
                    />
                  </Field>
                  <Field label="Owner 4-Digit PIN">
                    <input
                      type="password"
                      value={d.pin}
                      placeholder="••••"
                      onChange={set('pin')}
                      className="input-field font-mono tracking-widest"
                    />
                  </Field>
                </div>
              </>
            )}

            {i === 2 && (
              <div className="flex flex-col gap-3">
                {d.branches.map((b, j) => (
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl" key={j}>
                    <Field label={`Station ${j + 1} Name`}>
                      <input
                        value={b.name}
                        onChange={e => sb('name', e.target.value, j)}
                        className="input-field"
                      />
                    </Field>
                    <Field label="Landing Region / Pier">
                      <input
                        value={b.region}
                        placeholder={d.region}
                        onChange={e => sb('region', e.target.value, j)}
                        className="input-field"
                      />
                    </Field>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setD({ ...d, branches: [...d.branches, { name: '', region: '' }] })}
                  className="btn-secondary text-xs w-fit"
                >
                  + Add Another Station
                </button>
              </div>
            )}

            {i === 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PLANS.map(p => (
                  <div
                    key={p.id}
                    onClick={() => setD({ ...d, plan: p.id })}
                    className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition ${
                      d.plan === p.id
                        ? 'border-blue-700 bg-blue-50/70 text-blue-950 shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <b className="text-sm block">{p.id}</b>
                      <span className="text-lg font-bold font-mono text-slate-900 block mt-1">{tzs(p.price)}/mo</span>
                      <p className="text-[11px] text-slate-600 mt-2 mb-0">{p.note}</p>
                    </div>
                    <span className="text-[10px] font-mono text-blue-700 font-semibold block mt-3">
                      {p.branches > 50 ? 'Unlimited' : p.branches} Station(s)
                    </span>
                  </div>
                ))}
              </div>
            )}

            {i === 4 && (
              <div className="flex flex-col gap-3 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Company Name:</span>
                    <b className="text-slate-900">{d.company} ({d.sector})</b>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Owner Account:</span>
                    <b className="text-slate-900">{d.name} (@{d.username})</b>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Initial Stations:</span>
                    <b className="text-slate-900">{d.branches.map(b => b.name).join(', ')}</b>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Selected Plan:</span>
                    <b className="text-blue-700 font-bold">{d.plan} · 14 Days Free Trial</b>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer p-2 bg-blue-50/50 rounded-lg border border-blue-200 text-blue-900">
                  <input
                    type="checkbox"
                    checked={d.demo}
                    onChange={e => setD({ ...d, demo: e.target.checked })}
                  />
                  <span>Seed demo Lake Victoria catch data (Nile Perch, Tilapia, KYC Trucks)</span>
                </label>
              </div>
            )}

            {err && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-bold text-rose-700">
                {err}
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              {i > 0 ? (
                <button type="button" onClick={() => setI(i - 1)} className="btn-secondary text-xs">
                  &larr; Back
                </button>
              ) : <div />}
              {i < 4 ? (
                <button
                  type="button"
                  disabled={!!err}
                  onClick={() => setI(i + 1)}
                  className="btn-primary text-xs"
                >
                  Continue &rarr;
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    x.register(d)
                    go('')
                  }}
                  className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-700 font-bold"
                >
                  <CheckCircle2 size={16} /> Complete Registration &amp; Open Workspace
                </button>
              )}
            </div>
          </div>

          <div className="text-center text-xs text-slate-500">
            Already have a company account?{' '}
            <button onClick={() => go('login')} className="text-blue-800 font-bold hover:underline">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

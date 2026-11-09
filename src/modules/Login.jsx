import React, { useState } from 'react'
import {
  Fish,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Sparkles,
  Award,
  Scale,
  Building2,
  Check
} from 'lucide-react'
import { useS } from '../store'

const DEMO_ACCOUNTS = [
  {
    u: 'owner',
    p: '1234',
    titleSw: 'Mkurugenzi wa Kampuni (Owner)',
    titleEn: 'Company Owner & Director',
    role: 'Owner',
    descSw: 'Upatikanaji kamili wa mapato, faida, benki, mikataba ya viwanda na matawi yote.',
    descEn: 'Full access to revenues, net margins, bank ledgers, factory sales, and all landing branches.'
  },
  {
    u: 'juma',
    p: '1111',
    titleSw: 'Afisa Ununuzi & Mizani (Weigher)',
    titleEn: 'Landing Pier Weighing Officer',
    role: 'Purchasing Officer',
    descSw: 'Kupima samaki mwaloni, kutoa stakabadhi za wavuvi, mgao wa mafuta na barafu.',
    descEn: 'Dockside scale weighing, fisherman catch receipts, fuel disbursements, and crate ice logs.'
  },
  {
    u: 'neema',
    p: '2222',
    titleSw: 'Mkaguzi wa Ubora (HACCP Inspector)',
    titleEn: 'Quality & HACCP Inspector',
    role: 'Quality Inspector',
    descSw: 'Kupima joto la samaki (< 4.0°C), alama za organoleptic, na kufungia stoo za baridi.',
    descEn: 'Temperature core probe logs (< 4.0°C), organoleptic freshness scoring, and cold room clearances.'
  },
  {
    u: 'admin',
    p: 'admin123',
    titleSw: 'Msimamizi Mkuu wa Mfumo (Super Admin)',
    titleEn: 'Platform Super Administrator',
    role: 'Platform Admin',
    descSw: 'Kusimamia leseni za makampuni ya uvuvi, mipango ya malipo, na usanidi wa mfumo.',
    descEn: 'Manage tenant seafood companies, subscriptions, audit trails, and platform governance.'
  }
]

export default function Login({ go }) {
  const { x } = useS()
  const [lang, setLang] = useState('sw') // 'sw' | 'en'
  const [tab, setTab] = useState('standard') // 'standard' | 'demo'
  const [u, setU] = useState('owner')
  const [p, setP] = useState('1234')
  const [showPass, setShowPass] = useState(false)
  const [err, setErr] = useState('')

  const isSw = lang === 'sw'

  const handleLogin = (customU, customP) => {
    const targetU = customU !== undefined ? customU : u
    const targetP = customP !== undefined ? customP : p
    const r = x.login(targetU, targetP)
    if (r?.err) {
      setErr(r.err)
    } else {
      go('')
    }
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col items-center py-10 px-4">
      {/* Top Bar with Brand & Language Switcher */}
      <div className="w-full max-w-xl flex items-center justify-between mb-6">
        <button
          onClick={() => go('')}
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-bold text-sm transition"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-700 to-blue-900 text-white flex items-center justify-center font-bold shadow-xs">
            <Fish size={18} />
          </div>
          <span className="tracking-tight text-slate-900">
            FishTrade <span className="text-[#0d7a68]">ERP</span>
          </span>
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setLang('sw')}
            className={`px-2.5 py-1 rounded-lg transition ${
              lang === 'sw' ? 'bg-[#0d7a68] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            Kiswahili
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-2.5 py-1 rounded-lg transition ${
              lang === 'en' ? 'bg-[#0d7a68] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Main Center Wizard Heading */}
      <div className="text-center mb-6">
        <h1 className="wizard-title text-3xl sm:text-4xl font-extrabold text-[#0f172a] m-0">
          {isSw ? 'Ingia kwenye mfumo' : 'Sign in to workspace'}
        </h1>
        <p className="text-sm text-slate-500 mt-1 mb-0 font-medium">
          {isSw ? 'Chagua njia ya kuingia kwenye kituo chako cha biashara' : 'Access your commercial seafood branch terminal'}
        </p>
      </div>

      {/* Mode Switcher Tabs matching Wizard aesthetics */}
      <div className="w-full max-w-xl mb-6">
        <div className="bg-slate-200/80 p-1 rounded-2xl grid grid-cols-2 gap-1 text-xs font-bold">
          <button
            onClick={() => { setTab('standard'); setErr('') }}
            className={`py-2.5 rounded-xl transition ${
              tab === 'standard' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isSw ? 'Akaunti Yako (Standard Sign In)' : 'Account Sign In'}
          </button>
          <button
            onClick={() => { setTab('demo'); setErr('') }}
            className={`py-2.5 rounded-xl transition ${
              tab === 'demo' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isSw ? 'Majaribio ya Papo Hapo (Demo Profiles)' : '1-Click Demo Profiles'}
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex flex-col gap-6">
        {tab === 'standard' ? (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 m-0">
                {isSw ? 'Taarifa za Kuingilia' : 'Sign in credentials'}
              </h2>
              <p className="text-xs text-slate-500 mt-1 mb-0">
                {isSw
                  ? 'Weka jina lako la utumiaji na nenosiri/PIN ya tarakimu 4 uliyopewa.'
                  : 'Enter your assigned username and 4-digit PIN.'}
              </p>
            </div>

            {/* USERNAME */}
            <div>
              <label className="wizard-input-label block mb-1.5">
                {isSw ? 'JINA LA UTUMIAJI (USERNAME / SIMU)' : 'USERNAME OR PHONE'}
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={u}
                  autoCapitalize="none"
                  onChange={e => {
                    setU(e.target.value)
                    setErr('')
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={isSw ? 'e.g. owner, juma, neema' : 'e.g. owner, juma'}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d7a68] focus:border-transparent transition"
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {isSw ? 'Tumia jina la utumiaji ulilosajili na mkurugenzi wako.' : 'Use the username assigned by your company administrator.'}
              </span>
            </div>

            {/* PASSWORD / PIN */}
            <div>
              <label className="wizard-input-label block mb-1.5">
                {isSw ? 'NENOSIRI AU PIN YA TARAKIMU 4' : '4-DIGIT PIN / PASSWORD'}
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={p}
                  onChange={e => {
                    setP(e.target.value)
                    setErr('')
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-sm font-mono tracking-widest text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d7a68] focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {err && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 animate-shake">
                {err}
              </div>
            )}

            <button
              type="button"
              onClick={() => handleLogin()}
              className="wizard-btn-primary w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
            >
              <span>{isSw ? 'Ingia Kwenye Kituo →' : 'Sign In to Station →'}</span>
            </button>
          </div>
        ) : (
          /* 1-Click Demo Accounts View */
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 m-0">
                {isSw ? 'Majaribio ya Haraka ya Mfumo' : '1-Click Role Profiles'}
              </h2>
              <p className="text-xs text-slate-500 mt-1 mb-0">
                {isSw
                  ? 'Bofya profaili yoyote kuingia mara moja na kujionea utendaji kazi halisi.'
                  : 'Click any role below to instantly log in and experience the tailored workflow.'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.u}
                  type="button"
                  onClick={() => handleLogin(acc.u, acc.p)}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-teal-50/70 hover:border-[#0d7a68] text-left transition flex items-center justify-between gap-3 group"
                >
                  <div className="flex flex-col gap-0.5">
                    <b className="text-xs font-bold text-slate-900 group-hover:text-[#0d7a68] transition">
                      {isSw ? acc.titleSw : acc.titleEn}
                    </b>
                    <p className="text-[11px] text-slate-500 m-0">
                      {isSw ? acc.descSw : acc.descEn}
                    </p>
                    <span className="font-mono text-[10px] text-slate-400 mt-1">
                      Username: <strong>{acc.u}</strong> · PIN: <strong>{acc.p}</strong>
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 group-hover:bg-[#0d7a68] group-hover:text-white group-hover:border-[#0d7a68] transition flex items-center justify-center shrink-0 text-slate-400">
                    <ArrowRight size={14} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#0d7a68] shrink-0" />
          <span>
            {isSw
              ? 'Mifumo ya usalama na ufuatiliaji wa FiRCIS & GS1 imewashwa kikamilifu.'
              : 'End-to-end encrypted session with GS1 traceability integrity.'}
          </span>
        </div>
      </div>

      {/* Bottom Switcher: Need to register? */}
      <div className="mt-6 text-center text-xs text-slate-500">
        {isSw ? 'Huna akaunti ya biashara?' : "Don't have a company account?"}{' '}
        <button
          onClick={() => go('register')}
          className="text-[#0d7a68] font-bold hover:underline"
        >
          {isSw ? 'Sajili biashara yako hapa' : 'Register your business here'}
        </button>
      </div>
    </div>
  )
}

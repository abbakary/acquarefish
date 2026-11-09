import React, { useState } from 'react'
import {
  Fish,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Scale,
  Warehouse,
  ShieldCheck,
  Check,
  Sparkles,
  Globe
} from 'lucide-react'
import { useS, PLANS } from '../store'
import { tzs } from '../ui'

const WIZARD_STEPS = [
  { key: 'account', labelSw: 'Account', labelEn: 'Account' },
  { key: 'business_type', labelSw: 'Business type', labelEn: 'Business type' },
  { key: 'plan', labelSw: 'Plan', labelEn: 'Plan' },
  { key: 'shop_details', labelSw: 'Shop details', labelEn: 'Shop details' },
  { key: 'review', labelSw: 'Review', labelEn: 'Review' }
]

const BUSINESS_TYPES = [
  {
    id: 'Fish buying & trading',
    titleSw: 'Walanguzi & Wanunuzi wa Samaki',
    titleEn: 'Fish Buying & Trading Company',
    descSw: 'Kununua samaki bandarini/mwalo, kupima, kuweka barafu na kuuza viwandani au masoko ya mijini.',
    descEn: 'Purchase from artisanal fishermen at lake piers, weigh, ice, and supply factories or urban markets.',
    icon: Scale
  },
  {
    id: 'Fish processing factory',
    titleSw: 'Kiwanda cha Kusindika & Kuuza Nje',
    titleEn: 'Fish Processing & Export Factory',
    descSw: 'Kupokea tani nyingi za Sangara/Sato, kutengeneza minofu (fillets), kufungia na kusafirisha nje ya nchi.',
    descEn: 'Industrial processing plant receiving bulk tonnage, fillet production, blast freezing, and export logistics.',
    icon: Building2
  },
  {
    id: 'BMU Fisherman Cooperative',
    titleSw: 'Ushirika wa Wavuvi BMU / Kikundi',
    titleEn: 'Fishermen BMU Cooperative',
    descSw: 'Kusimamia wavuvi wengi, boti, mgao wa mafuta, zana za uvuvi, na kuuza kwa bei ya pamoja.',
    descEn: 'Community beach management unit managing shared boats, fuel issues, nets, and collective catch auctions.',
    icon: Fish
  },
  {
    id: 'Seafood export supply',
    titleSw: 'Usafirishaji wa Jokofu & Stoo',
    titleEn: 'Cold Chain Logistics & Depot',
    descSw: 'Kusafirisha samaki kwa malori ya jokofu (1-3 ton KYC) na vyumba vya baridi kati ya mikoa.',
    descEn: 'Dedicated refrigerated transport fleet and multi-chamber cold storage distribution network.',
    icon: Warehouse
  }
]

const REGIONS = [
  'Mwanza (Ziwa Victoria)',
  'Kigoma (Ziwa Tanganyika)',
  'Musoma / Mara (Ziwa Victoria)',
  'Bukoba / Kagera (Ziwa Victoria)',
  'Ukerewe / Nansio (Ziwa Victoria)',
  'Dar es Salaam (Pwani ya Hindi)'
]

export default function Register({ go }) {
  const { db, x } = useS()
  const [lang, setLang] = useState('sw') // 'sw' | 'en'
  const [step, setStep] = useState(0)

  // Password visibility states
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    pin: '',
    pinConfirm: '',
    company: '',
    sector: 'Fish buying & trading',
    region: 'Mwanza (Ziwa Victoria)',
    fircisLicense: '',
    plan: 'Business',
    branches: [{ name: 'Kirumba Landing Pier (Kuu)', region: 'Mwanza', scaleType: 'Bluetooth Digital Scale' }],
    demo: true
  })

  const [fieldError, setFieldError] = useState('')

  const isSw = lang === 'sw'
  const selectedPlan = PLANS.find(p => p.id === form.plan) || PLANS[1]

  const update = key => e => {
    setFieldError('')
    setForm({ ...form, [key]: e.target.value })
  }

  const validateStep = currentStep => {
    if (currentStep === 0) {
      if (!form.name.trim()) return isSw ? 'Tafadhali ingiza jina lako kamili.' : 'Please enter your full name.'
      if (!form.email.trim() || !form.email.includes('@')) {
        return isSw ? 'Tafadhali ingiza barua pepe halali ya biashara.' : 'Please enter a valid business email.'
      }
      if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 9) {
        return isSw ? 'Tafadhali ingiza namba sahihi ya simu ya Tanzania.' : 'Please enter a valid Tanzanian phone number.'
      }
      const u = form.username.trim().toLowerCase()
      if (!u || u.length < 3) {
        return isSw ? 'Jina la utumiaji linahitaji angalau herufi 3.' : 'Username must be at least 3 characters.'
      }
      const taken = db.tenants.some(t => t.staff.some(y => y.username === u)) || u === 'admin'
      if (taken) {
        return isSw ? 'Jina hilo la utumiaji limeshasajiliwa tayari.' : 'That username is already taken.'
      }
      if (!form.pin || form.pin.length < 4) {
        return isSw ? 'Nenosiri/PIN lazima liwe na angalau tarakimu 4.' : 'PIN/password must be at least 4 digits.'
      }
      if (form.pin !== form.pinConfirm) {
        return isSw ? 'Nenosiri halilingani na uthibitisho.' : 'Passwords do not match.'
      }
    } else if (currentStep === 1) {
      if (!form.company.trim()) {
        return isSw ? 'Tafadhali andika jina la kampuni au biashara yako.' : 'Please enter your business or company name.'
      }
    } else if (currentStep === 3) {
      if (form.branches.some(b => !b.name.trim())) {
        return isSw ? 'Tafadhali taja jina la kila kituo cha kupokelea samaki.' : 'Please enter a name for each landing station.'
      }
    }
    return ''
  }

  const handleNext = () => {
    const err = validateStep(step)
    if (err) {
      setFieldError(err)
      return
    }
    setFieldError('')
    if (step < WIZARD_STEPS.length - 1) {
      setStep(step + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Final Submit
      x.register({
        company: form.company,
        sector: form.sector,
        region: form.region,
        name: form.name,
        phone: form.phone,
        email: form.email,
        username: form.username.toLowerCase(),
        pin: form.pin,
        branches: form.branches,
        plan: form.plan,
        demo: form.demo
      })
      go('')
    }
  }

  const handleBack = () => {
    setFieldError('')
    if (step > 0) {
      setStep(step - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const updateBranch = (index, field, value) => {
    const updated = form.branches.map((b, i) => (i === index ? { ...b, [field]: value } : b))
    setForm({ ...form, branches: updated })
  }

  const addBranch = () => {
    if (form.branches.length >= selectedPlan.branches) {
      setFieldError(
        isSw
          ? `Mpango wa ${selectedPlan.id} unaruhusu vituo ${selectedPlan.branches} pekee.`
          : `The ${selectedPlan.id} plan allows up to ${selectedPlan.branches} stations.`
      )
      return
    }
    setForm({
      ...form,
      branches: [
        ...form.branches,
        {
          name: `Landing Station ${form.branches.length + 1}`,
          region: form.region,
          scaleType: 'Bluetooth Digital Scale'
        }
      ]
    })
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

      {/* Main Center Wizard Heading (Matches screenshot style) */}
      <div className="text-center mb-6">
        <h1 className="wizard-title text-3xl sm:text-4xl font-extrabold text-[#0f172a] m-0">
          {isSw ? 'Sajili biashara yako' : 'Register your business'}
        </h1>
        <p className="text-sm text-slate-500 mt-1 mb-0 font-medium">
          {isSw ? `Hatua ${step + 1} kati ya 5` : `Step ${step + 1} of 5`}
        </p>
      </div>

      {/* 5-Step Segmented Progress Bar (Directly matching uploaded reference) */}
      <div className="w-full max-w-xl mb-6">
        {/* Progress segment bars */}
        <div className="grid grid-cols-5 gap-2">
          {WIZARD_STEPS.map((s, idx) => (
            <div
              key={s.key}
              className={`h-1.5 rounded-full transition-colors duration-300 ${
                idx <= step ? 'wizard-segment-active' : 'wizard-segment-inactive'
              }`}
            />
          ))}
        </div>

        {/* Segment Labels */}
        <div className="grid grid-cols-5 text-center mt-2">
          {WIZARD_STEPS.map((s, idx) => (
            <span
              key={s.key}
              className={`text-[11px] font-semibold transition-colors ${
                idx === step
                  ? 'text-[#0d7a68] font-bold'
                  : idx < step
                  ? 'text-slate-700'
                  : 'text-slate-400'
              }`}
            >
              {isSw ? s.labelSw : s.labelEn}
            </span>
          ))}
        </div>
      </div>

      {/* Form Card (Max-w-xl, rounded-3xl, centered white panel matching screenshot) */}
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex flex-col gap-6">
        {/* STEP 1: Account (Akaunti yako) */}
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-xl font-bold text-slate-900 m-0">
              {isSw ? 'Akaunti yako' : 'Your account credentials'}
            </h2>

            {/* JINA KAMILI */}
            <div>
              <label className="wizard-input-label block mb-1.5">
                {isSw ? 'JINA KAMILI' : 'FULL NAME'}
              </label>
              <input
                type="text"
                value={form.name}
                onChange={update('name')}
                placeholder={isSw ? 'Jina kamili' : 'Full name'}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d7a68] focus:border-transparent transition"
              />
            </div>

            {/* BARUA PEPE & SIMU (Two Column on Tablet/Desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="wizard-input-label block mb-1.5">
                  {isSw ? 'BARUA PEPE' : 'BUSINESS EMAIL'}
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={update('email')}
                    placeholder={isSw ? 'wewe@biashara.co.tz' : 'you@company.co.tz'}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d7a68] focus:border-transparent transition"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {isSw ? 'Tumia barua pepe halisi ya biashara yako.' : 'Use your active business email address.'}
                </span>
              </div>

              <div>
                <label className="wizard-input-label block mb-1.5">
                  {isSw ? 'SIMU (TANZANIA)' : 'PHONE (TANZANIA)'}
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={update('phone')}
                    placeholder="+255 754 111 222"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d7a68] focus:border-transparent transition"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {isSw ? 'Namba 0/9 (unaweza kubandika +255 au 0).' : 'Format 0/9 (supports +255 or 0xxx).'}
                </span>
              </div>
            </div>

            {/* USERNAME */}
            <div>
              <label className="wizard-input-label block mb-1.5">
                {isSw ? 'JINA LA UTUMIAJI (USERNAME YA KUINGILIA)' : 'LOGIN USERNAME'}
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={form.username}
                  autoCapitalize="none"
                  onChange={e => {
                    setFieldError('')
                    setForm({ ...form, username: e.target.value.toLowerCase().trim() })
                  }}
                  placeholder="e.g. juma, owner, mwanza_trader"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d7a68] focus:border-transparent transition"
                />
              </div>
            </div>

            {/* NENOSIRI & THIBITISHA NENOSIRI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="wizard-input-label block mb-1.5">
                  {isSw ? 'NENOSIRI / PIN' : 'PASSWORD / PIN'}
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.pin}
                    onChange={update('pin')}
                    placeholder={isSw ? 'Angalau tarakimu 4' : 'At least 4 digits'}
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d7a68] focus:border-transparent transition"
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

              <div>
                <label className="wizard-input-label block mb-1.5">
                  {isSw ? 'THIBITISHA NENOSIRI' : 'CONFIRM PASSWORD'}
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.pinConfirm}
                    onChange={update('pinConfirm')}
                    placeholder={isSw ? 'Angalau tarakimu 4' : 'At least 4 digits'}
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d7a68] focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Business Type (Aina ya Biashara) */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 m-0">
                {isSw ? 'Aina ya biashara yako' : 'Your business type & licensing'}
              </h2>
              <p className="text-xs text-slate-500 mt-1 mb-0">
                {isSw
                  ? 'Chagua mfumo wa uendeshaji unaolingana na kampuni yako ya uvuvi.'
                  : 'Select the operational model matching your seafood enterprise.'}
              </p>
            </div>

            {/* JINA LA BIASHARA */}
            <div>
              <label className="wizard-input-label block mb-1.5">
                {isSw ? 'JINA LA KAMPUNI / BIASHARA YA UVUVI' : 'SEAFOOD COMPANY NAME'}
              </label>
              <input
                type="text"
                value={form.company}
                onChange={update('company')}
                placeholder={isSw ? 'e.g. Mara Fresh Fish Exporters Co.' : 'e.g. Victoria Seafood Trading Ltd'}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d7a68] focus:border-transparent transition"
              />
            </div>

            {/* SECTOR CARDS */}
            <div>
              <label className="wizard-input-label block mb-2">
                {isSw ? 'KATEGORIA YA SHUGHULI' : 'PRIMARY OPERATING MODEL'}
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {BUSINESS_TYPES.map(bt => {
                  const Icon = bt.icon
                  const selected = form.sector === bt.id
                  return (
                    <div
                      key={bt.id}
                      onClick={() => setForm({ ...form, sector: bt.id })}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3.5 ${
                        selected
                          ? 'bg-teal-50/70 border-[#0d7a68] text-slate-900 ring-1 ring-[#0d7a68]'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          selected ? 'bg-[#0d7a68] text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <b className="text-xs font-bold block">{isSw ? bt.titleSw : bt.titleEn}</b>
                        <p className="text-[11px] text-slate-500 m-0 mt-0.5 leading-snug">
                          {isSw ? bt.descSw : bt.descEn}
                        </p>
                      </div>
                      {selected && <Check size={18} className="text-[#0d7a68] shrink-0 mt-0.5" />}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* REGION SELECTION */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="wizard-input-label block mb-1.5">
                  {isSw ? 'ENEO KUU LA UENDESHAJI' : 'PRIMARY OPERATING REGION'}
                </label>
                <select
                  value={form.region}
                  onChange={update('region')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0d7a68] transition"
                >
                  {REGIONS.map(r => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="wizard-input-label block mb-1.5">
                  {isSw ? 'LESENI YA FiRCIS / TIN (HIARI)' : 'FiRCIS PERMIT / TIN (OPTIONAL)'}
                </label>
                <input
                  type="text"
                  value={form.fircisLicense}
                  onChange={update('fircisLicense')}
                  placeholder="e.g. FRC-2026-9910"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d7a68] transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Plan (Chagua Mpango) */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 m-0">
                {isSw ? 'Chagua mpango wa biashara' : 'Select your subscription plan'}
              </h2>
              <p className="text-xs text-slate-500 mt-1 mb-0">
                {isSw
                  ? 'Mipango yote inajumuisha siku 14 za majaribio ya bure bila malipo yoyote ya awali.'
                  : 'All plans include a full 14-day free trial with zero upfront payment.'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {PLANS.map(p => {
                const selected = form.plan === p.id
                return (
                  <div
                    key={p.id}
                    onClick={() => setForm({ ...form, plan: p.id })}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-4 ${
                      selected
                        ? 'border-[#0d7a68] bg-teal-50/70 text-slate-900 ring-2 ring-[#0d7a68]/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <b className="text-sm font-bold text-slate-900">{p.id}</b>
                        {p.id === 'Business' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0d7a68] text-white">
                            {isSw ? 'Inayopendekezwa' : 'Popular'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 m-0">{p.note}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-700 font-medium mt-1">
                        <span>{p.branches > 50 ? 'Unlimited' : p.branches} Landing Station(s)</span>
                        <span>·</span>
                        <span>{p.users > 500 ? 'Unlimited' : p.users} Staff Accounts</span>
                        <span>·</span>
                        <span>Offline PWA</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <b className="text-lg font-mono font-extrabold text-[#0d7a68]">{tzs(p.price)}</b>
                      <small className="text-[11px] text-slate-400 block">{isSw ? '/mwezi' : '/month'}</small>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
              <span>
                {isSw
                  ? 'Siku 14 za bure. Hakuna kadi ya benki inayohitajika kuanza.'
                  : '14 days free trial. No credit card required to start.'}
              </span>
            </div>
          </div>
        )}

        {/* STEP 4: Shop Details (Maelezo ya Kituo / Landing Pier) */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 m-0">
                {isSw ? 'Maelezo ya vituo vya kupokelea' : 'Landing pier & station details'}
              </h2>
              <p className="text-xs text-slate-500 mt-1 mb-0">
                {isSw
                  ? 'Weka majina ya vituo vya kwanza ambapo wavuvi watapimia samaki wao.'
                  : 'Configure the initial receiving piers where fishermen catch will be weighed.'}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {form.branches.map((b, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>{isSw ? `Kituo ${idx + 1}` : `Station ${idx + 1}`}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {idx === 0 ? (isSw ? 'Kituo Kikuu (Main)' : 'Primary Station') : ''}
                    </span>
                  </div>

                  <div>
                    <label className="wizard-input-label block mb-1">
                      {isSw ? 'JINA LA KITUO / LANDING PIER' : 'STATION / LANDING PIER NAME'}
                    </label>
                    <input
                      type="text"
                      value={b.name}
                      onChange={e => updateBranch(idx, 'name', e.target.value)}
                      placeholder={isSw ? 'e.g. Kirumba Mwaloni Pier' : 'e.g. Kirumba Main Pier'}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0d7a68] transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="wizard-input-label block mb-1">
                        {isSw ? 'ENEO / MKOA' : 'REGION'}
                      </label>
                      <input
                        type="text"
                        value={b.region}
                        onChange={e => updateBranch(idx, 'region', e.target.value)}
                        placeholder="Mwanza"
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="wizard-input-label block mb-1">
                        {isSw ? 'AINA YA MIZANI' : 'SCALE TYPE'}
                      </label>
                      <select
                        value={b.scaleType}
                        onChange={e => updateBranch(idx, 'scaleType', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white"
                      >
                        <option>Bluetooth Digital Scale</option>
                        <option>Platform Scale (500kg)</option>
                        <option>Crane Hook Scale</option>
                        <option>Manual Mechanical Scale</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              {form.branches.length < selectedPlan.branches && (
                <button
                  type="button"
                  onClick={addBranch}
                  className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 text-xs font-bold text-[#0d7a68] hover:bg-teal-50/50 transition text-center"
                >
                  + {isSw ? 'Ongeza Kituo Kingine cha Kupokelea' : 'Add Another Landing Station'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: Review (Hakiki na Anza) */}
        {step === 4 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 m-0">
                {isSw ? 'Hakiki taarifa zako' : 'Review and launch workspace'}
              </h2>
              <p className="text-xs text-slate-500 mt-1 mb-0">
                {isSw
                  ? 'Thibitisha maelezo kabla ya kufungua mfumo wako wa FishTrade ERP.'
                  : 'Confirm details before opening your FishTrade ERP operational system.'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">{isSw ? 'Jina la Kampuni:' : 'Company:'}</span>
                <b className="text-slate-900">{form.company}</b>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">{isSw ? 'Sekta / Mfumo:' : 'Model:'}</span>
                <b className="text-slate-900">{form.sector}</b>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">{isSw ? 'Akaunti ya Mmiliki:' : 'Owner Account:'}</span>
                <b className="text-slate-900">{form.name} (@{form.username})</b>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">{isSw ? 'Mawasiliano:' : 'Contact:'}</span>
                <span className="font-mono text-slate-900">{form.phone} · {form.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">{isSw ? 'Vituo vya Kupokelea:' : 'Initial Stations:'}</span>
                <b className="text-slate-900">{form.branches.map(b => b.name).join(', ')}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isSw ? 'Mpango:' : 'Plan:'}</span>
                <b className="text-[#0d7a68]">{form.plan} · {isSw ? 'Siku 14 za Bure' : '14 Days Free'}</b>
              </div>
            </div>

            {/* Seed Demo Catch Data Checkbox */}
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200 cursor-pointer">
              <input
                type="checkbox"
                checked={form.demo}
                onChange={e => setForm({ ...form, demo: e.target.checked })}
                className="mt-0.5 accent-[#0d7a68]"
              />
              <div className="text-xs">
                <b className="text-teal-950 block">
                  {isSw
                    ? 'Weka data za mfano za Ziwa Victoria & Tanganyika'
                    : 'Seed sample Lake Victoria & Tanganyika catch data'}
                </b>
                <span className="text-teal-800 text-[11px] block mt-0.5">
                  {isSw
                    ? 'Inajumuisha boti za mfano, wavuvi, samaki wa Sangara, Sato, Dagaa, na malori ya KYC kwa majaribio ya haraka.'
                    : 'Includes sample boats, fishermen, Nile Perch, Tilapia, and cold chain trucks for quick exploration.'}
                </span>
              </div>
            </label>
          </div>
        )}

        {/* Error notification if any */}
        {fieldError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 animate-shake">
            {fieldError}
          </div>
        )}

        {/* Action Button: Endelea -> / Continue matching the screenshot button */}
        <div className="flex items-center gap-3 pt-2">
          {step > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition flex items-center gap-1.5"
            >
              <ArrowLeft size={16} />
              <span>{isSw ? 'Nyuma' : 'Back'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="wizard-btn-primary flex-1 py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
          >
            <span>
              {step < 4
                ? isSw
                  ? 'Endelea →'
                  : 'Continue →'
                : isSw
                ? 'Kamilisha Usajili & Fungua Mfumo →'
                : 'Complete Registration & Open ERP →'}
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Switcher: Already registered? Sign In */}
      <div className="mt-6 text-center text-xs text-slate-500">
        {isSw ? 'Una akaunti tayari?' : 'Already have an account?'}{' '}
        <button
          onClick={() => go('login')}
          className="text-[#0d7a68] font-bold hover:underline"
        >
          {isSw ? 'Ingia hapa' : 'Sign In'}
        </button>
      </div>
    </div>
  )
}

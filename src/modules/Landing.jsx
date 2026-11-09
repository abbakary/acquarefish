import React, { useState, useEffect } from 'react'
import {
  Fish,
  Scale,
  Warehouse,
  ShieldCheck,
  Truck,
  Building2,
  QrCode,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Smartphone,
  ChevronDown,
  Sparkles,
  Award,
  ThermometerSnowflake,
  Calculator,
  RefreshCw,
  Ship,
  Phone,
  Clock,
  Layers,
  Activity,
  Check
} from 'lucide-react'
import { PLANS } from '../store'
import { FishPhoto, tzs } from '../ui'

// Animated Number Counter Hook & Component
function AnimatedCounter({ end, duration = 2000, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTimestamp = null
    const step = timestamp => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      const easeOutQuad = 1 - (1 - progress) * (1 - progress)
      setCount(Math.floor(easeOutQuad * end))
      if (progress < 1) {
        window.requestAnimationFrame(step)
      } else {
        setCount(end)
      }
    }
    const animationFrame = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(animationFrame)
  }, [end, duration])

  return (
    <span className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

const LIVE_LANDINGS = [
  { boat: 'MV Furaha', pier: 'Kirumba Mwaloni', sp: 'Nile Perch', kg: 340, temp: 1.1, grade: 'Grade A', val: 2788000, time: '2m ago' },
  { boat: 'Kigoma Star 01', pier: 'Katonga BMU Beach', sp: 'Dagaa (Sardines)', kg: 520, temp: 1.8, grade: 'Standard', val: 1352000, time: '5m ago' },
  { boat: 'MV Victoria Queen', pier: 'Mwigobero Pier', sp: 'Fresh Tilapia', kg: 410, temp: 1.4, grade: 'Grade A', val: 2214000, time: '11m ago' },
  { boat: 'Ziwa Express', pier: 'Nansio Ukerewe', sp: 'Nile Perch', kg: 280, temp: 0.9, grade: 'Export Grade', val: 2296000, time: '18m ago' },
  { boat: 'MV Ushindi', pier: 'Kemondo Bay Bukoba', sp: 'Fresh Tilapia', kg: 360, temp: 1.2, grade: 'Grade A', val: 1944000, time: '24m ago' }
]

const SPECIES_DATA = [
  {
    name: 'Nile Perch (Sangara)',
    scientific: 'Lates niloticus',
    img: '/src/assets/images/fresh_nile_perch_1793949222944.jpg',
    buyPrice: 8200,
    factoryPrice: 11500,
    optimalTemp: '0°C to 2°C',
    yield: 'High Fillet Recovery (40-45%)',
    destinations: 'ABC Processing, Victoria Perch Exporters, EU Air Freight',
    haccpRule: 'Core reception probe < 4.0°C mandatory, organoleptic freshness index 1-2.'
  },
  {
    name: 'Fresh Tilapia (Sato)',
    scientific: 'Oreochromis niloticus',
    img: '/src/assets/images/fresh_tilapia_1793949223137.jpg',
    buyPrice: 5400,
    factoryPrice: 7800,
    optimalTemp: '0°C to 3°C',
    yield: 'Whole Round & Gutted (88%)',
    destinations: 'Domestic Urban Markets (Dar, Mwanza, Dodoma) & Supermarkets',
    haccpRule: 'Clear red gills, firm flesh elasticity, crystal-clear eyes.'
  },
  {
    name: 'Dagaa / Sardines (Mukene)',
    scientific: 'Rastrineobola argentea',
    img: '/src/assets/images/dagaa_sardines_1793949223072.jpg',
    buyPrice: 2600,
    factoryPrice: 4100,
    optimalTemp: 'Chilled / Sun-Dried Aerated',
    yield: 'Direct Human Consumption & Aquaculture Feeds',
    destinations: 'Regional East Africa (DRC, Rwanda, Kenya, Uganda)',
    haccpRule: 'Moisture content < 12%, low sand impurity, silver sheen.'
  },
  {
    name: 'African Catfish (Kambale)',
    scientific: 'Clarias gariepinus',
    img: '/public/fish/catfish.jpg',
    buyPrice: 4800,
    factoryPrice: 7200,
    optimalTemp: 'Live Tank or 2°C to 4°C Slush Ice',
    yield: 'Whole Live & Smoked Steaks',
    destinations: 'Specialized Domestic Restaurants & Export Markets',
    haccpRule: 'Intact skin slime layer, no bruising, live reception preferred.'
  }
]

const FEATURES = [
  {
    icon: Scale,
    title: 'Landing Pier Weighing in < 45 Seconds',
    desc: 'Capture fishermen catch directly at the lake pier with bluetooth digital scale integration, automatic tare deduction, and immediate WhatsApp payout receipts.'
  },
  {
    icon: Warehouse,
    title: 'Cold Storage & Blast Freezing Control',
    desc: 'Multi-chamber inventory tracking (0°C chillers to -18°C blast freezers) with FIFO lot segregation, landed cost per kg, and real-time shrinkage alerts.'
  },
  {
    icon: ShieldCheck,
    title: 'HACCP & FiRCIS Sanitary Compliance',
    desc: 'Enforce organoleptic quality scoring and digital reception probe logs (< 4.0°C). Automatically sync with Tanzania Ministry of Fisheries standards.'
  },
  {
    icon: Building2,
    title: 'Industrial Factory Supply Contracts',
    desc: 'Supply major processing factories (ABC Fish Processing, Victoria Perch) with credit limits, commercial tax invoices, and automated lot traceability.'
  },
  {
    icon: Truck,
    title: 'Refrigerated Fleet & Ice Management',
    desc: 'Monitor 1–3 ton KYC insulated transport trucks, transit temperature probes, driver delivery confirmations, and route fuel efficiency.'
  },
  {
    icon: QrCode,
    title: 'GS1 Traceability from Hook to Fork',
    desc: 'Every single kilogram generates a secure GS1 QR batch code linking the fisherman boat, landing beach, inspector score, and delivery invoice.'
  }
]

const FAQS = [
  {
    q: 'Does FishTrade ERP work offline at remote lake landing beaches?',
    a: 'Yes. The application is built as a Progressive Web App (PWA) with local indexed storage. Weighing officers can record catches, calculate amounts, and issue offline vouchers on remote islands or piers even when cellular data drops, automatically syncing upon reconnection.'
  },
  {
    q: 'Can company directors monitor multiple landing sites across Tanzania?',
    a: 'Absolutely. The Business and Enterprise tiers provide unified multi-branch analytics, allowing owners to compare volume, margins, landed costs, and supplier payables across Mwanza, Kigoma, Musoma, and Bukoba in real time.'
  },
  {
    q: 'Does FishTrade replace official government FiRCIS permits?',
    a: 'No. FishTrade ERP complements Tanzania’s Ministry of Livestock & Fisheries FiRCIS platform by archiving permit numbers, sanitary certificates, movement clearances, and sending automated notifications before renewal deadlines.'
  },
  {
    q: 'What payment channels are supported for artisanal fishermen?',
    a: 'The system natively reconciles M-Pesa, Airtel Money, Tigo Pesa, bank transfers (CRDB / NMB), and cash vouchers, automatically keeping each boat owner and crew ledger balance transparent and auditable.'
  }
]

const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

export default function Landing({ go: nav }) {
  const [activeSpeciesIdx, setActiveSpeciesIdx] = useState(0)
  const [calcKg, setCalcKg] = useState(1200)
  const [calcSpecies, setCalcSpecies] = useState(0)
  const [simTemp, setSimTemp] = useState(1.4)
  const [chillerMode, setChillerMode] = useState('chill') // 'chill' | 'blast'

  // Calculations for interactive margin simulator
  const activeCalcSp = SPECIES_DATA[calcSpecies]
  const buyCost = calcKg * activeCalcSp.buyPrice
  const iceAndTransport = calcKg * 650 // TZS 650/kg for ice, transport, handling
  const totalLandedCost = buyCost + iceAndTransport
  const factoryRevenue = calcKg * activeCalcSp.factoryPrice
  const netEstimatedProfit = factoryRevenue - totalLandedCost
  const profitMarginPct = Math.round((netEstimatedProfit / factoryRevenue) * 100)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-700 selection:text-white">
      {/* Top Bar Navigation (Clean Top Bar Contract) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-700 to-blue-900 text-white flex items-center justify-center font-bold shadow-sm">
              <Fish size={20} />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              FishTrade <span className="text-teal-700">ERP</span>
            </span>
          </div>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <button onClick={() => scrollTo('features')} className="hover:text-teal-800 transition whitespace-nowrap">Features</button>
            <button onClick={() => scrollTo('species')} className="hover:text-teal-800 transition whitespace-nowrap">Species</button>
            <button onClick={() => scrollTo('calculator')} className="hover:text-teal-800 transition whitespace-nowrap">Margin Simulator</button>
            <button onClick={() => scrollTo('traceability')} className="hover:text-teal-800 transition whitespace-nowrap">Traceability</button>
            <button onClick={() => scrollTo('pricing')} className="hover:text-teal-800 transition whitespace-nowrap">Pricing</button>
            <button onClick={() => scrollTo('faq')} className="hover:text-teal-800 transition whitespace-nowrap">FAQ</button>
          </nav>

          {/* Zone 3: Primary Action buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => nav('login')}
              className="text-xs font-bold text-slate-700 hover:text-teal-800 px-3 py-2 transition"
            >
              Sign In
            </button>
            <button
              onClick={() => nav('register')}
              className="wizard-btn-primary text-xs py-2 px-4 rounded-xl font-bold shadow-sm"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </header>

      {/* Live Operational Ticker Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800 overflow-hidden py-2 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-teal-400 font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            <span className="uppercase tracking-wider text-[11px]">Live Lake Landings:</span>
          </div>
          <div className="overflow-hidden relative flex-1">
            <div className="animate-ticker gap-8 text-slate-300">
              {LIVE_LANDINGS.concat(LIVE_LANDINGS).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 whitespace-nowrap text-[11px]">
                  <span className="font-bold text-white">{item.boat}</span>
                  <span className="text-slate-400">@ {item.pier}</span>
                  <span className="font-semibold text-teal-300 font-mono">{item.kg}kg {item.sp}</span>
                  <span className="text-slate-400">({item.temp}°C)</span>
                  <span className="text-amber-300 font-mono font-bold">TZS {(item.val / 1e6).toFixed(2)}M</span>
                  <span className="text-slate-500 font-mono">[{item.time}]</span>
                  <span className="text-slate-700">·</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section with High-Impact Lake Victoria Dawn Photography */}
      <section className="relative bg-slate-950 text-white overflow-hidden py-16 md:py-24 border-b border-slate-800">
        <img
          src="/landing/hero.jpg"
          alt="Tanzanian fishermen arriving at Lake Victoria landing site at dawn"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-85 brightness-105 contrast-110 animate-hero-pan"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-slate-950/40" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/80 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-900/80 backdrop-blur-md border border-teal-400/40 text-teal-200 text-xs font-semibold w-fit shadow-lg">
              <Award size={14} className="text-amber-400" />
              Tanzania Fishery ERP · Lake Victoria &amp; Lake Tanganyika Operations
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15] drop-shadow-lg">
              Run your fish trade from the landing beach to the export factory gate.
            </h1>

            <p className="text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed drop-shadow">
              Eliminate paper weighing books and lost profits. Digitize artisanal fishermen purchases, cold room inventory, HACCP temperature logs, and industrial processing factory dispatches in real time.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => nav('register')}
                className="wizard-btn-primary text-sm py-3 px-6 rounded-xl font-bold shadow-xl flex items-center gap-2"
              >
                Launch Company ERP <ArrowRight size={16} />
              </button>
              <button
                onClick={() => nav('login')}
                className="text-sm py-3 px-5 rounded-xl bg-slate-900/80 text-white border border-white/25 hover:bg-slate-900/95 backdrop-blur-md font-semibold transition"
              >
                Sign In to Branch Station
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-200 font-medium">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-teal-400" /> 14-Day Free Trial</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-teal-400" /> FiRCIS Regulations Compliant</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-teal-400" /> Works Offline via Mobile PWA</span>
            </div>
          </div>

          {/* Real-time Swimming Nile Perch & Live Monitoring Card */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Live Fish Quality Showcase */}
            <div className="relative rounded-2xl overflow-hidden border border-teal-400/30 bg-gradient-to-br from-teal-950/80 via-slate-900/80 to-blue-950/80 backdrop-blur-md p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-teal-200 font-semibold">
                    Lake Victoria · Lates Niloticus
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30">
                  EXPORT GRADE A
                </span>
              </div>

              {/* Animated Swimming Visual */}
              <div className="relative h-44 rounded-xl overflow-hidden bg-gradient-to-b from-teal-600/20 via-blue-900/30 to-slate-950/70 border border-white/10 flex items-center justify-center">
                <div className="w-4/5 h-full flex items-center justify-center animate-swim-nile-perch">
                  <img
                    src="/fish/nile-perch.jpg"
                    alt="Fresh Lake Victoria Nile Perch"
                    className="w-full h-36 object-cover rounded-xl shadow-2xl border border-white/20 brightness-105"
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-teal-300/15 to-transparent animate-water-shimmer" />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-white font-bold block">Fresh Nile Perch (Sangara)</span>
                  <span className="text-slate-300 text-[11px]">Kirumba Mwaloni Pier Reception</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-emerald-400 font-bold block">0.9°C Chilled</span>
                  <span className="text-[10px] text-teal-200 uppercase font-mono">HACCP Approved</span>
                </div>
              </div>
            </div>

            {/* Cold Storage Active Chamber Card */}
            <div className="bg-slate-900/85 backdrop-blur-md border border-white/15 rounded-2xl p-4 shadow-2xl flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300">
                  <ThermometerSnowflake size={14} className="text-teal-400" />
                  <span>Main Cold Storage Chamber</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setChillerMode('chill'); setSimTemp(1.4) }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition ${chillerMode === 'chill' ? 'bg-teal-700 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Chiller (0-2°C)
                  </button>
                  <button
                    onClick={() => { setChillerMode('blast'); setSimTemp(-18.4) }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition ${chillerMode === 'blast' ? 'bg-blue-700 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Blast (-18°C)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                  <small className="text-slate-400 text-[10px] block uppercase font-mono">Chamber Temp</small>
                  <b className="text-lg font-mono text-teal-300">{simTemp}°C</b>
                </div>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                  <small className="text-slate-400 text-[10px] block uppercase font-mono">Stock Held</small>
                  <b className="text-lg font-mono text-white">4,820 <span className="text-xs text-slate-400">kg</span></b>
                </div>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                  <small className="text-slate-400 text-[10px] block uppercase font-mono">Available Space</small>
                  <b className="text-lg font-mono text-emerald-400">72%</b>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* High-Impact Animated Counters Strip */}
      <section className="bg-white border-b border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="flex flex-col gap-1 border-r border-slate-100 last:border-0 pr-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-teal-700 font-mono">
                <AnimatedCounter end={18450} suffix="+" />
              </span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Metric Tons</span>
              <span className="text-[11px] text-slate-500">Fish weighed &amp; traded</span>
            </div>

            <div className="flex flex-col gap-1 border-r border-slate-100 last:border-0 pr-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                <AnimatedCounter end={520} suffix="+" />
              </span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Fishermen</span>
              <span className="text-[11px] text-slate-500">Registered boats &amp; crew</span>
            </div>

            <div className="flex flex-col gap-1 border-r border-slate-100 last:border-0 pr-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-700 font-mono">
                <AnimatedCounter end={18} suffix=" Hubs" />
              </span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Landing Stations</span>
              <span className="text-[11px] text-slate-500">Lake Victoria &amp; Tanganyika</span>
            </div>

            <div className="flex flex-col gap-1 border-r border-slate-100 last:border-0 pr-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">
                TZS <AnimatedCounter end={68} suffix=".4B" />
              </span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Disbursed</span>
              <span className="text-[11px] text-slate-500">Via M-Pesa &amp; CRDB Bank</span>
            </div>

            <div className="flex flex-col gap-1 border-r border-slate-100 last:border-0 pr-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-700 font-mono">
                <AnimatedCounter end={99} suffix=".6%" />
              </span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">HACCP Grade A</span>
              <span className="text-[11px] text-slate-500">Export factory compliance</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono">
                &lt; <AnimatedCounter end={45} suffix="s" />
              </span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Dock Scale Speed</span>
              <span className="text-[11px] text-slate-500">Fast digital weigh-in</span>
            </div>
          </div>
        </div>
      </section>

      {/* Commercial Species Showcase with High Quality Photography */}
      <section id="species" className="py-16 md:py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block mb-2">
            Target Commercial Value Chains
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Precision management for Lake Victoria &amp; Tanganyika species
          </h2>
          <p className="text-slate-600 text-sm mt-3">
            Each species has customized organoleptic quality metrics, target chill temperatures, and automated pricing tier formulas.
          </p>
        </div>

        {/* Species Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {SPECIES_DATA.map((sp, idx) => (
            <button
              key={sp.name}
              onClick={() => setActiveSpeciesIdx(idx)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeSpeciesIdx === idx
                  ? 'bg-teal-700 text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Fish size={16} />
              <span>{sp.name}</span>
            </button>
          ))}
        </div>

        {/* Selected Species Card Spotlight */}
        {(() => {
          const sp = SPECIES_DATA[activeSpeciesIdx]
          return (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-0">
              <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-[420px] bg-slate-900 overflow-hidden">
                <img
                  src={sp.img}
                  alt={sp.name}
                  className="absolute inset-0 w-full h-full object-cover brightness-105 contrast-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-xs font-mono text-teal-300 italic block">{sp.scientific}</span>
                  <b className="text-xl font-bold">{sp.name}</b>
                </div>
              </div>

              <div className="lg:col-span-7 p-8 flex flex-col justify-between gap-6">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <small className="text-slate-400 text-xs block">Benchmark Pier Buy Price</small>
                      <b className="text-2xl font-mono text-slate-900 font-extrabold">{tzs(sp.buyPrice)} <span className="text-xs text-slate-500 font-normal">/ kg</span></b>
                    </div>
                    <div className="text-right">
                      <small className="text-slate-400 text-xs block">Industrial Sale Benchmark</small>
                      <b className="text-2xl font-mono text-teal-700 font-extrabold">{tzs(sp.factoryPrice)} <span className="text-xs text-slate-500 font-normal">/ kg</span></b>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <ThermometerSnowflake size={14} className="text-teal-700" /> Target Cold Chain Temp
                      </span>
                      <span className="font-mono text-sm text-teal-900 font-bold">{sp.optimalTemp}</span>
                      <small className="text-[11px] text-slate-500 mt-1">{sp.haccpRule}</small>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <TrendingUp size={14} className="text-teal-700" /> Commercial Yield &amp; Grade
                      </span>
                      <span className="text-sm font-semibold text-slate-900">{sp.yield}</span>
                      <small className="text-[11px] text-slate-500 mt-1">Export factory reception grade standard</small>
                    </div>
                  </div>

                  <div className="mt-5 p-4 rounded-xl bg-teal-50/60 border border-teal-200 text-xs text-teal-950 flex flex-col gap-1">
                    <b className="font-bold">Primary Processing Factories &amp; Market Outlets:</b>
                    <span>{sp.destinations}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500">Ready to track {sp.name} at your landing pier?</span>
                  <button
                    onClick={() => nav('register')}
                    className="wizard-btn-primary text-xs py-2.5 px-5 rounded-xl font-bold flex items-center gap-2"
                  >
                    Start Free Trial <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )
        })()}
      </section>

      {/* Interactive Margin & Volume Profit Simulator */}
      <section id="calculator" className="py-16 md:py-24 bg-gradient-to-b from-slate-100 to-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block mb-2">
              Financial Transparency
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Interactive Fish Trade Margin Simulator
            </h2>
            <p className="text-slate-600 text-sm mt-3">
              Calculate projected profits per consignment, taking into account fisherman payments, ice, salt, transport logistics, and factory dispatch prices.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 flex flex-col gap-5">
              <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-3">
                <Calculator size={20} className="text-teal-700" />
                <span>Simulation Parameters</span>
              </div>

              {/* Species Selector */}
              <div>
                <label className="wizard-input-label block mb-2">Chagua Samaki (Select Species):</label>
                <div className="grid grid-cols-2 gap-2">
                  {SPECIES_DATA.map((s, idx) => (
                    <button
                      key={s.name}
                      onClick={() => setCalcSpecies(idx)}
                      className={`p-2.5 rounded-xl text-xs font-bold text-left border transition ${
                        calcSpecies === idx
                          ? 'bg-teal-50 border-teal-600 text-teal-900'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {s.name.split(' (')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Volume Slider */}
              <div className="mt-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="wizard-input-label">Kiasi cha Samaki (Consignment Volume):</label>
                  <span className="font-mono text-base font-extrabold text-teal-800">{calcKg.toLocaleString()} kg</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="10000"
                  step="100"
                  value={calcKg}
                  onChange={e => setCalcKg(+e.target.value)}
                  className="w-full accent-teal-700 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                  <span>200 kg</span>
                  <span>5,000 kg</span>
                  <span>10,000 kg</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Fisherman Purchase Price:</span>
                  <span className="font-mono font-bold text-slate-900">{tzs(activeCalcSp.buyPrice)}/kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ice, Handling &amp; KYC Freight:</span>
                  <span className="font-mono font-bold text-slate-900">TZS 650/kg</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
                  <span className="text-slate-700">Factory Dispatched Rate:</span>
                  <span className="font-mono text-teal-700">{tzs(activeCalcSp.factoryPrice)}/kg</span>
                </div>
              </div>
            </div>

            {/* Simulated Outcome Display */}
            <div className="lg:col-span-6 bg-gradient-to-br from-teal-900 to-slate-900 rounded-2xl p-6 text-white flex flex-col justify-between gap-6 shadow-inner">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-teal-300 font-bold block mb-1">
                  Consignment Profit Forecast
                </span>
                <h3 className="text-xl font-bold text-white m-0">Commercial Payout Breakdown</h3>

                <div className="flex flex-col gap-3 mt-6">
                  <div className="flex justify-between items-baseline border-b border-white/10 pb-2">
                    <span className="text-xs text-slate-300">Expected Gross Factory Revenue:</span>
                    <span className="text-base font-mono font-bold text-white">{tzs(factoryRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-baseline border-b border-white/10 pb-2">
                    <span className="text-xs text-slate-300">Total Fishermen Catch Cost:</span>
                    <span className="text-sm font-mono text-slate-300">- {tzs(buyCost)}</span>
                  </div>
                  <div className="flex justify-between items-baseline border-b border-white/10 pb-2">
                    <span className="text-xs text-slate-300">Ice &amp; Refrigerated Transport:</span>
                    <span className="text-sm font-mono text-slate-300">- {tzs(iceAndTransport)}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-between">
                  <div>
                    <small className="text-teal-200 text-xs block">Estimated Net Profit</small>
                    <b className="text-2xl font-mono text-emerald-400 font-extrabold">{tzs(netEstimatedProfit)}</b>
                  </div>
                  <div className="text-right">
                    <small className="text-teal-200 text-xs block">Gross Margin</small>
                    <b className="text-2xl font-mono text-white font-extrabold">{profitMarginPct}%</b>
                  </div>
                </div>
              </div>

              <button
                onClick={() => nav('register')}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition text-center"
              >
                Track Live Margins in ERP &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section id="features" className="py-16 md:py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block mb-2">
            Comprehensive Platform
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Engineered for every role in Tanzania seafood trading
          </h2>
          <p className="text-slate-600 text-sm mt-3">
            One unified ERP replacing scattered notebooks with digital workflows for landing officers, quality inspectors, cold storekeepers, and company directors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(f => {
            const Icon = f.icon
            return (
              <div key={f.title} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col gap-3 group">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 group-hover:bg-teal-700 group-hover:text-white transition flex items-center justify-center shadow-xs">
                  <Icon size={22} />
                </div>
                <h4 className="text-base font-bold text-slate-900 m-0">{f.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed m-0">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Complete Traceability Section with High-Res Supply Chain Diagram */}
      <section id="traceability" className="py-16 md:py-24 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 flex flex-col gap-5">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                Core Differentiator
              </span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
                Complete Fish Traceability from Boat to Export Gate
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Every catch lot receives a verifiable GS1 batch code. If an industrial client, health inspector, or EU auditor questions a fish consignment, you can instantly prove the supplier boat, landing beach, ice temperature log, and refrigerated carrier.
              </p>

              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                  <div>
                    <b className="text-sm text-white block">Landing Pier Digital Scale Catch Receipt</b>
                    <p className="text-xs text-slate-400 m-0">Instant weigh-in with boat registration, fisherman ID, and WhatsApp receipt.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                  <div>
                    <b className="text-sm text-white block">Chilled Storage &amp; FIFO Batch Segregation</b>
                    <p className="text-xs text-slate-400 m-0">Chamber probe readings (0°C to 2°C) locked into database with zero paper tampering.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
                  <div>
                    <b className="text-sm text-white block">Factory Gate Delivery Clearance</b>
                    <p className="text-xs text-slate-400 m-0">Commercial invoice, tax clearance, and sanitary permit generated in one click.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-3xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-950">
                <img
                  src="/photos/traceability-flow.png"
                  alt="Seafood Traceability Flow"
                  className="w-full h-auto object-cover"
                />
                <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-300">End-to-End Seafood Traceability Flow</span>
                  <span className="font-mono text-emerald-400 font-bold">100% GS1 Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cold Chain Fleet Showcase */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block mb-2">
            Cold Chain Infrastructure
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Refrigerated Transport Fleet &amp; Landing Pier Collections
          </h2>
          <p className="text-slate-600 text-sm mt-3">
            Maintain freshness from landing docks to industrial processing zones across Lake Victoria.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm flex flex-col group">
            <div className="h-64 overflow-hidden relative">
              <img
                src="/photos/refrigerated-truck.png"
                alt="KYC Refrigerated Truck at dock"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <span className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-mono font-bold px-3 py-1 rounded-full">
                1–3 TON KYC CARRIER
              </span>
            </div>
            <div className="p-6 flex flex-col gap-2">
              <h4 className="text-base font-bold text-slate-900 m-0">Dockside Landing Collection</h4>
              <p className="text-xs text-slate-600 leading-relaxed m-0">
                Collect fish directly from fishing boats at Kirumba, Katonga, and Mwigobero piers with instant crate weighing, ice application, and temperature verification.
              </p>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm flex flex-col group">
            <div className="h-64 overflow-hidden relative">
              <img
                src="/photos/cold-storage.png"
                alt="Cold storage facility dispatch"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <span className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-mono font-bold px-3 py-1 rounded-full">
                CENTRAL COLD STORAGE
              </span>
            </div>
            <div className="p-6 flex flex-col gap-2">
              <h4 className="text-base font-bold text-slate-900 m-0">Factory Dispatch &amp; Cold Storage</h4>
              <p className="text-xs text-slate-600 leading-relaxed m-0">
                Chilled dispatch to ABC Fish Processing and export factories with temperature data logging, delivery notes, and automated commercial invoice generation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section (Transparent Pricing in TZS) */}
      <section id="pricing" className="py-16 md:py-24 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block mb-2">
              Transparent Pricing
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Tailored to Tanzanian Fish Traders
            </h2>
            <p className="text-slate-600 text-sm mt-3">
              Start with one landing site, then scale to multi-branch operations across Lake Victoria and Lake Tanganyika.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PLANS.map(p => (
              <div
                key={p.id}
                className={`rounded-3xl p-8 bg-white border flex flex-col justify-between gap-6 shadow-sm transition ${
                  p.id === 'Business' ? 'border-teal-700 ring-2 ring-teal-700/20 shadow-xl relative' : 'border-slate-200 hover:shadow-md'
                }`}
              >
                {p.id === 'Business' && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-teal-700 text-white text-[11px] font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Inayopendekezwa Zaidi
                  </span>
                )}
                <div className="flex flex-col gap-3">
                  <h4 className="text-lg font-bold text-slate-900 m-0">{p.id} Plan</h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold font-mono text-slate-900">{tzs(p.price)}</span>
                    <span className="text-xs text-slate-500 font-semibold">/month</span>
                  </div>
                  <p className="text-xs text-slate-600 m-0">{p.note}</p>
                  <div className="border-t border-slate-100 pt-4 flex flex-col gap-2.5 text-xs text-slate-700">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-teal-700" />
                      <strong>{p.branches > 50 ? 'Unlimited' : p.branches}</strong> Landing Station(s)
                    </span>
                    <span className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-teal-700" />
                      <strong>{p.users > 500 ? 'Unlimited' : p.users}</strong> Staff User Accounts
                    </span>
                    <span className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-teal-700" />
                      Offline Mobile PWA Weigher App
                    </span>
                    <span className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-teal-700" />
                      WhatsApp Voucher Receipts
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => nav('register')}
                  className={`wizard-btn-primary w-full text-xs py-3 rounded-xl justify-center font-bold ${
                    p.id === 'Business' ? 'bg-teal-700 hover:bg-teal-800' : 'bg-slate-900 hover:bg-slate-800'
                  }`}
                >
                  Start 14-Day Free Trial
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-24 max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block mb-2">
            Maswali Yanayoulizwa Mara kwa Mara
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {FAQS.map(faq => (
            <details key={faq.q} className="p-5 bg-white rounded-2xl border border-slate-200 group shadow-xs">
              <summary className="text-sm font-bold text-slate-900 cursor-pointer flex justify-between items-center list-none">
                {faq.q}
                <ChevronDown size={16} className="text-slate-400 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-xs text-slate-600 leading-relaxed mt-3 pt-3 border-t border-slate-100 m-0">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bg-gradient-to-r from-teal-950 via-slate-900 to-blue-950 text-white py-16 px-6 text-center border-t border-teal-900">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-5">
          <h2 className="text-2xl sm:text-3xl font-bold m-0">
            Digitize your seafood supply chain today.
          </h2>
          <p className="text-sm text-teal-100 max-w-xl">
            Join fish traders across Lake Victoria and Lake Tanganyika moving from handwritten paper books to high-precision ERP management.
          </p>
          <button
            onClick={() => nav('register')}
            className="wizard-btn-primary py-3.5 px-8 text-sm font-bold rounded-xl shadow-xl"
          >
            Create Company Account · 14 Days Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-bold">
            <Fish size={16} className="text-teal-400" /> FishTrade ERP Tanzania
          </div>
          <p className="m-0 text-slate-500">
            Fish Procurement, Inventory, Distribution &amp; Financial ERP for Tanzania Fisheries.
          </p>
        </div>
      </footer>
    </div>
  )
}

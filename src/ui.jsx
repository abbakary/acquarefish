import React, { useState, useEffect } from 'react'
import {
  Fish,
  Scale,
  Anchor,
  Truck,
  Warehouse,
  ShieldCheck,
  DollarSign,
  Users,
  Building2,
  QrCode,
  ClipboardCheck,
  FileText,
  BarChart3,
  ArrowRight,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Share2,
  Printer,
  Sparkles,
  RefreshCw,
  Plus,
  WifiOff,
  Smartphone
} from 'lucide-react'

export const f = n => Math.round(+n || 0).toLocaleString('en-US')
export const tzs = n => 'TZS ' + f(n)
export const fmtT = t => new Date(t).toLocaleString('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})
export const atOf = b => b.at || (b.date || '') + 'T00:00'

export const FISH_PHOTOS = {
  'Nile Perch': '/fish/nile-perch.jpg',
  'Tilapia': '/fish/tilapia.jpg',
  'Dagaa (Sardines)': '/fish/dagaa-sardines.jpg',
  'Catfish': '/fish/catfish.jpg'
}

export function FishPhoto({ sp, size = 40, className = '' }) {
  const [err, setErr] = useState(false)
  const normalized = Object.keys(FISH_PHOTOS).find(k => (sp || '').toLowerCase().includes(k.toLowerCase().split(' ')[0])) || 'Nile Perch'
  const src = FISH_PHOTOS[normalized]

  if (err || !src) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-blue-50 text-blue-700 border border-blue-200 shrink-0 ${className}`}
        style={{ width: size, height: size * 0.75 }}
      >
        <Fish size={size * 0.5} />
      </div>
    )
  }

  return (
    <div
      className={`relative rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100 ${className}`}
      style={{ width: size, height: size * 0.75 }}
    >
      <img
        src={src}
        alt={sp}
        className="w-full h-full object-cover"
        onError={() => setErr(true)}
      />
    </div>
  )
}

export function Badge({ children, variant = 'neutral' }) {
  const styles = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${styles[variant] || styles.neutral}`}>
      {children}
    </span>
  )
}

export function Modal({ title, subtitle, onClose, children, maxWidth = 'max-w-xl' }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-dialog ${maxWidth}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 m-0">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 m-0 mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            ✕
          </button>
        </div>
        <div className="modal-body overflow-y-auto max-h-[75vh] flex flex-col gap-4">
          {children}
        </div>
      </div>
    </div>
  )
}

export function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-baseline">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{label}</label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

export function ScaleTerminal({ weight, onTare, onSimulateWeigh, unit = 'kg' }) {
  return (
    <div className="scale-terminal">
      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
        <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
          <Scale size={14} /> CONNECTED DIGITAL SCALE · PANASONIC INDUSTRIAL (COM4)
        </span>
        <span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800 text-[10px] font-mono">
          STABLE
        </span>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="scale-screen flex-1 w-full">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">GROSS WEIGHT</div>
            <div className="scale-digits">{Number(weight || 0).toFixed(1)}</div>
          </div>
          <div className="text-right">
            <div className="scale-unit">{unit}</div>
            <div className="text-[11px] text-emerald-500 font-mono">TARE: 0.0 kg</div>
          </div>
        </div>
        <div className="w-28 h-20 rounded-lg overflow-hidden border border-slate-700 shrink-0 hidden sm:block relative bg-slate-900 shadow">
          <img src="/photos/scale-dock.png" alt="Dock Scale" className="w-full h-full object-cover" />
          <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[8px] text-emerald-400 text-center font-mono py-0.5">DOCK SENSOR</span>
        </div>
      </div>
      <div className="scale-controls">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTare}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold rounded border border-slate-700 transition"
          >
            TARE (ZERO)
          </button>
          <button
            type="button"
            onClick={onSimulateWeigh}
            className="px-3 py-1.5 bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold rounded border border-emerald-700/60 flex items-center gap-1.5 transition"
          >
            <RefreshCw size={12} /> Auto-Capture Scale
          </button>
        </div>
        <span className="text-[11px] text-slate-400">Calibrated: 05/11/2026</span>
      </div>
    </div>
  )
}

export function ReceiptModal({ title, lines, onClose, qrData }) {
  return (
    <Modal title={title} subtitle="Official FishTrade Delivery & Financial Voucher" onClose={onClose}>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col gap-3 font-mono text-xs text-slate-800">
        <div className="flex justify-between items-start border-b border-slate-200 pb-3">
          <div>
            <b className="text-sm font-sans text-slate-900">FISHTRADE ERP TANZANIA</b>
            <div className="text-[11px] text-slate-500 font-sans">Lake Victoria Seafood Operations</div>
          </div>
          <div className="text-right">
            <span className="text-slate-400 text-[10px]">VERIFIED RECORD</span>
            <div className="text-emerald-600 font-bold">APPROVED</div>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 py-2">
          {lines.map((l, i) => (
            <div key={i} className="flex justify-between border-b border-dashed border-slate-200 py-1">
              {typeof l === 'string' ? <span>{l}</span> : <><span>{l[0]}</span><b>{l[1]}</b></>}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] text-slate-500">
          <span>Batch QR Traceability: ENABLED</span>
          <span>FiRCIS Compliant</span>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-2">
        <a
          href={'https://wa.me/?text=' + encodeURIComponent(title + '\n' + lines.map(x => Array.isArray(x) ? x.join(': ') : x).join('\n'))}
          target="_blank"
          rel="noreferrer"
          className="flex-1 btn-primary bg-emerald-600 hover:bg-emerald-700 text-center justify-center no-underline"
        >
          <Share2 size={16} /> Send via WhatsApp
        </a>
        <button
          onClick={() => window.print()}
          className="btn-secondary"
        >
          <Printer size={16} /> Print Voucher
        </button>
      </div>
    </Modal>
  )
}

export function TraceabilityModal({ batch, onClose }) {
  if (!batch) return null

  return (
    <Modal title={`Traceability Chain: ${batch.no}`} subtitle="Lake Victoria to Processing Factory Journey" onClose={onClose} maxWidth="max-w-2xl">
      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 text-white mb-2">
        <img
          src="/assets/aistudio/image_c593d6e6.png"
          alt="Traceability Flow"
          className="w-full h-36 object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent p-4 flex flex-col justify-end">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] text-sky-400 font-mono uppercase tracking-wider">Certified GS1 & FiRCIS Traceable</span>
              <h4 className="text-lg font-bold m-0">{batch.sp} ({batch.grade})</h4>
            </div>
            <div className="bg-white/10 backdrop-blur px-3 py-1 rounded-lg border border-white/20 text-xs font-mono font-bold">
              {batch.kg} KG
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2.5 text-xs">
          <span className="font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
            <Anchor size={14} className="text-blue-600" /> 1. Origin & Catch
          </span>
          <div className="flex justify-between"><span className="text-slate-500">Landing Site:</span><b className="text-slate-800">{batch.site}</b></div>
          <div className="flex justify-between"><span className="text-slate-500">Supplier:</span><b className="text-slate-800">{batch.sup}</b></div>
          <div className="flex justify-between"><span className="text-slate-500">Harvest Date:</span><b className="text-slate-800 font-mono">{batch.date}</b></div>
          <div className="flex justify-between"><span className="text-slate-500">Purchase ID:</span><b className="text-blue-700 font-mono">{batch.pur}</b></div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2.5 text-xs">
          <span className="font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600" /> 2. Quality & Cold Chain
          </span>
          <div className="flex justify-between"><span className="text-slate-500">Inspection Status:</span><Badge variant={batch.st === 'accepted' ? 'green' : 'amber'}>{batch.st}</Badge></div>
          <div className="flex justify-between"><span className="text-slate-500">Reception Temp:</span><b className="text-emerald-700 font-mono">{batch.temp || 2.1}°C (Compliant)</b></div>
          <div className="flex justify-between"><span className="text-slate-500">Warehouse:</span><b className="text-slate-800">{batch.wh}</b></div>
          <div className="flex justify-between"><span className="text-slate-500">Current Stock:</span><b className="text-slate-900 font-mono">{batch.rem} kg remaining</b></div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-lg border border-blue-200 flex items-center justify-center p-1 text-slate-900">
            <QrCode size={36} />
          </div>
          <div>
            <b className="text-sm text-blue-950">QR Code Traceability Tag</b>
            <p className="text-xs text-blue-800 m-0">Scan at processing plant or customs export point</p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="btn-secondary bg-white text-xs"
        >
          <Printer size={14} /> Print Tag
        </button>
      </div>
    </Modal>
  )
}

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
    setIsInstalled(isStandalone)

    const ua = window.navigator.userAgent.toLowerCase()
    setIsIOS(/iphone|ipad|ipod/.test(ua))

    const handler = e => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (isInstalled) return null

  if (deferredPrompt) {
    return (
      <button
        onClick={async () => {
          await deferredPrompt.prompt()
          const { outcome } = await deferredPrompt.userChoice
          if (outcome === 'accepted') setDeferredPrompt(null)
        }}
        className="btn-secondary text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
      >
        <Smartphone size={14} /> Install PWA
      </button>
    )
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowGuide(true)}
          className="btn-secondary text-xs bg-slate-50 border-slate-200 text-slate-700"
        >
          <Smartphone size={14} /> Install App
        </button>
        {showGuide && (
          <Modal title="Install on iPhone / iPad" onClose={() => setShowGuide(false)}>
            <p className="text-sm text-slate-600">
              1. Tap the <strong>Share</strong> button in Safari toolbar.<br />
              2. Scroll down and tap <strong>Add to Home Screen</strong>.
            </p>
          </Modal>
        )}
      </>
    )
  }

  return null
}

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const on = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="offline-banner">
      <WifiOff size={16} />
      <span>Offline Mode — Purchases and weights are saved locally and will sync once connected.</span>
    </div>
  )
}

// Backward-compatible component aliases
export const Sheet = ({ title, onClose, children }) => (
  <Modal title={title} onClose={onClose}>
    {children}
  </Modal>
)

export const Btn = ({ c = '', children, ...p }) => (
  <button {...p} className={`btn-primary ${c}`}>
    {children}
  </button>
)

export const Fab = ({ onClick, children }) => (
  <button onClick={onClick} className="btn-primary fixed bottom-20 right-6 shadow-xl z-40 rounded-full py-3 px-5">
    {children}
  </button>
)

export const Seg = ({ v, set, items }) => (
  <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
    {items.map(i => (
      <button
        key={i}
        onClick={() => set(i)}
        className={`px-3 py-1.5 rounded-md transition ${v === i ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
      >
        {i}
      </button>
    ))}
  </div>
)

export const Empty = ({ t }) => (
  <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
    <Fish size={32} className="text-slate-400 mx-auto mb-2" />
    <p className="text-sm text-slate-500 m-0">{t}</p>
  </div>
)

export const Kpis = ({ a }) => (
  <div className="kpi-grid">
    {a.map(k => (
      <div className="kpi-card" key={k[0]}>
        <div className="kpi-content">
          <small>{k[0]}</small>
          <b>{k[1]}</b>
        </div>
      </div>
    ))}
  </div>
)

export const FishImg = ({ sp, s = 40 }) => (
  <FishPhoto sp={sp} size={s} />
)

export const Scene = () => null


import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Check,
  CheckCircle2,
  LineChart,
  MapPin,
  MessageSquareText,
  Phone,
  ScanBarcode,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { BUSINESS_TYPES, PLANS } from '@/lib/catalog'
import { cn, formatRWF } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Counter, Reveal } from '@/lib/reveal'

const FEATURES = [
  { icon: ScanBarcode, title: 'Fast POS & sales', desc: 'Barcode, cart, discounts, multiple payment methods and receipts — built for busy counters.' },
  { icon: Boxes, title: 'Inventory that adds up', desc: 'An auditable stock ledger: purchases, production, waste and transfers — no silent corrections.' },
  { icon: Users, title: 'Customers & credit', desc: 'Full customer profiles, balances, order history and reminders for inactive customers.' },
  { icon: BarChart3, title: 'Real business reports', desc: 'Revenue, margins, top products, branch comparison and waste — automatically explained.' },
  { icon: LineChart, title: 'Demand forecasting', desc: 'Know tomorrow\u2019s demand before you bake. Reduce waste, order the right ingredients.' },
  { icon: Sparkles, title: 'AI business assistant', desc: 'Ask questions in plain language. Get answers, alerts and recommendations — not just charts.' },
]

const STEPS = [
  { n: '01', t: 'Register your business', d: 'Choose a plan and tell us about your business — takes 5 minutes.' },
  { n: '02', t: 'Get approved & pay', d: 'Our team approves your subscription via mobile money or bank.' },
  { n: '03', t: 'Set up your workspace', d: 'Add products, customers, stock and your team with easy imports.' },
  { n: '04', t: 'Operate with AI', d: 'Run daily operations and get alerts, forecasts and recommendations.' },
]

const NAV = [
  { href: '#features', label: 'Features' },
  { href: '#how', label: 'How it works' },
  { href: '#showcase', label: 'Product' },
  { href: '#pricing', label: 'Pricing' },
]

const CHART_BARS = [38, 52, 44, 66, 58, 82, 74, 96, 88, 100, 92, 78]

function DashboardMockup() {
  return (
    <div className="relative">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-emerald-900/10">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <p className="text-sm font-bold text-slate-900">ABC Bakery Ltd</p>
            <p className="text-[11px] text-slate-400">Owner dashboard · this morning</p>
          </div>
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { l: "Today's sales", v: '1,240,000', c: 'text-emerald-600' },
            { l: 'Orders', v: '386', c: 'text-slate-900' },
            { l: 'AI risk alerts', v: '2', c: 'text-amber-500' },
          ].map((k) => (
            <div key={k.l} className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-medium text-slate-400">{k.l}</p>
              <p className={cn('mt-1 text-sm font-bold', k.c)}>{k.v}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-slate-100 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-700">Revenue — last 12 days</p>
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
              <TrendingUp className="h-3 w-3" /> +18.4%
            </span>
          </div>
          <div className="mt-3 flex h-24 items-end gap-1.5">
            {CHART_BARS.map((h, i) => (
              <div
                key={i}
                className={cn(
                  'flex-1 rounded-t-md transition-all duration-500',
                  i >= 9 ? 'bg-gradient-to-t from-emerald-600 to-teal-400' : 'bg-emerald-100',
                )}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-violet-200 bg-violet-50/60 p-3">
          <Sparkles className="h-4 w-4 shrink-0 text-violet-500" />
          <p className="text-[11px] leading-snug text-violet-800">
            <span className="font-semibold">AI:</span> Yeast runs out tomorrow — order 30 kg today to avoid stopping production.
          </p>
        </div>
      </div>

      <div className="animate-float absolute -left-6 -top-8 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10 sm:block">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <ScanBarcode className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-bold text-slate-900">Receipt #INV-7429</p>
            <p className="text-[10px] text-slate-400">Paid · MTN MoMo · 1 min ago</p>
          </div>
          <CheckCircle2 className="ml-2 h-4 w-4 text-emerald-500" />
        </div>
      </div>

      <div className="animate-float-slow absolute -bottom-8 -right-4 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10 sm:block">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Zap className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-bold text-slate-900">Waste +12% this week</p>
            <p className="text-[10px] text-slate-400">Evening shift · flagged by AI</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-slate-900/5 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-sm shadow-emerald-500/30 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3">
              E
            </div>
            <span className="text-base font-extrabold tracking-tight text-slate-900">EgukaSystem</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="relative transition-colors hover:text-emerald-600 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-emerald-500 after:transition-all after:duration-300 hover:after:w-full">
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-slate-700 transition-colors hover:text-emerald-600">
              Sign in
            </Link>
            <Link to="/register">
              <Button size="sm">Register business</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="aurora grid-pattern relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pb-20 pt-20 text-center sm:pt-24">
          <Reveal>
            <div className="animate-pulse-soft mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-4 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Built for Rwandan SMEs — bakeries, shops, restaurants & more
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="mx-auto mt-7 max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-6xl">
              The AI-powered operating system for{' '}
              <span className="shimmer-text">growing businesses</span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-500">
              One system for sales, inventory, customers, production, finance and employees — with an AI layer that tells
              you what happened, what&rsquo;s likely to happen, and what to do next.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link to="/register">
                <Button size="lg" className="group shadow-lg shadow-emerald-600/20">
                  Start your business
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">Try the demo</Button>
              </Link>
            </div>
          </Reveal>

          <Reveal delay={400}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> No credit card required</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> 14-day trial on approval</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Your data, always yours</span>
            </div>
          </Reveal>
        </div>

        <div className="mx-auto max-w-5xl px-6 pb-24">
          <Reveal delay={200} dir="scale">
            <DashboardMockup />
          </Reveal>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50 py-6">
        <div className="mx-auto max-w-6xl overflow-hidden px-6">
          <div className="flex w-max animate-marquee items-center gap-10 hover:[animation-play-state:paused]">
            {[...BUSINESS_TYPES, ...BUSINESS_TYPES].map((b, i) => (
              <span key={`${b.value}-${i}`} className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-slate-400">
                <b.icon className="h-4 w-4 text-emerald-500/70" /> {b.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-950 py-16">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 text-center md:grid-cols-4">
          {[
            { target: 120, suffix: '+', label: 'Businesses onboarded' },
            { target: 850, suffix: 'M+', label: 'RWF processed / month', format: (v: number) => Math.round(v).toLocaleString('en-US') },
            { target: 98, suffix: '%', label: 'Stock accuracy' },
            { target: 4.9, suffix: '/5', label: 'Owner satisfaction', format: (v: number) => v.toFixed(1) },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 90}>
              <p className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                <Counter target={s.target} suffix={s.suffix} format={s.format} className="tabular-nums" />
              </p>
              <p className="mt-2 text-xs font-medium uppercase tracking-wider text-slate-400">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">How it works</p>
          <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Register. Get approved. Run your business.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 110} className="relative">
              <div className="group h-full rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-600/5">
                <p className="bg-gradient-to-br from-emerald-500 to-teal-600 bg-clip-text text-3xl font-extrabold text-transparent transition-transform duration-300 group-hover:scale-110">
                  {s.n}
                </p>
                <p className="mt-3 text-sm font-bold text-slate-900">{s.t}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="features" className="border-y border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Features</p>
            <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Everything your business needs
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-slate-500">
              From the counter to the oven to the accountant — one workspace, no paper, no spreadsheets.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 100}>
                <div className="group h-full rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-600/5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-600/25">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm font-bold text-slate-900">{f.title}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="showcase" className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <Reveal dir="left">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">The 6 a.m. view</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Never open your business blind again
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                Every morning, EgukaSystem compiles yesterday&rsquo;s performance, today&rsquo;s risks and tomorrow&rsquo;s
                demand into one screen — in the language you already speak.
              </p>
            </Reveal>
            <div className="mt-8 space-y-4">
              {[
                { icon: Zap, t: 'Alerts before they cost you', d: 'Stock that will run out, invoices overdue, waste creeping up — surfaced automatically.' },
                { icon: TrendingUp, t: 'Forecasts you can act on', d: 'Tomorrow&rsquo;s demand per product, so you bake, order and staff exactly what&rsquo;s needed.' },
                { icon: MessageSquareText, t: 'Ask AI in plain language', d: '"How was Sunday compared to last month?" — answered in seconds, not spreadsheets.' },
              ].map((item, i) => (
                <Reveal key={item.t} dir="left" delay={150 + i * 100}>
                  <div className="group flex gap-4 rounded-2xl border border-transparent p-3 transition-all duration-200 hover:border-slate-200 hover:bg-white hover:shadow-lg hover:shadow-slate-900/5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white">
                      <item.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.t}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.d}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal dir="right">
            <DashboardMockup />
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-950 py-20">
        <div className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -top-20 left-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal dir="scale">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
              <Store className="h-6 w-6" />
            </div>
            <blockquote className="mt-8 text-xl font-medium leading-relaxed text-slate-200 sm:text-2xl">
              &ldquo;We stopped guessing. Yesterday&rsquo;s numbers, today&rsquo;s alerts and tomorrow&rsquo;s plan are
              on one screen when I open the shop at 6 a.m. Waste is down, and I finally understand my margins.&rdquo;
            </blockquote>
            <div className="mt-8 flex items-center justify-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                EM
              </span>
              <div className="text-left">
                <p className="text-sm font-bold text-white">Eric Mugisha</p>
                <p className="text-xs text-slate-400">Owner · ABC Bakery Ltd, Kigali</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="pricing" className="border-t border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Pricing</p>
            <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Simple monthly pricing in RWF
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-sm text-slate-500">
              Every plan includes cloud access, backups and support. Scale as you grow.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-4">
            {PLANS.map((p, i) => {
              const popular = p.id === 'growth'
              return (
                <Reveal key={p.id} delay={i * 100} className="h-full">
                  <div
                    className={cn(
                      'group flex h-full flex-col rounded-2xl border-2 bg-white p-6 transition-all duration-300 hover:-translate-y-1.5',
                      popular
                        ? 'border-emerald-500 shadow-xl shadow-emerald-500/15 hover:shadow-2xl hover:shadow-emerald-500/20'
                        : 'border-slate-200 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-600/5',
                    )}
                  >
                    {popular && (
                      <span className="mb-2 inline-flex w-fit animate-pulse-soft items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        <Sparkles className="h-3 w-3" /> Most popular
                      </span>
                    )}
                    <p className="text-base font-bold text-slate-900">{p.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{p.tagline}</p>
                    <p className="mt-4 text-3xl font-extrabold text-slate-900">
                      {p.priceMonthly > 0 ? formatRWF(p.priceMonthly) : 'Custom'}
                      {p.priceMonthly > 0 && <span className="text-sm font-medium text-slate-400">/mo</span>}
                    </p>
                    <ul className="mt-5 flex-1 space-y-2">
                      {p.features.slice(0, 6).map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" /> {f}
                        </li>
                      ))}
                    </ul>
                    <Link to="/register" className="mt-6">
                      <Button variant={popular ? 'primary' : 'outline'} className="w-full">
                        Choose {p.name}
                      </Button>
                    </Link>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <Reveal dir="scale">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 px-8 py-14 text-center shadow-2xl shadow-emerald-600/25 sm:px-14">
            <div className="animate-float-slow pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="animate-float pointer-events-none absolute -bottom-14 -left-10 h-56 w-56 rounded-full bg-teal-400/20 blur-2xl" />
            <p className="relative text-xs font-bold uppercase tracking-[0.25em] text-emerald-100">Ready when you are</p>
            <h2 className="relative mx-auto mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Your business runs on information. Start running it on insight.
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-sm leading-relaxed text-emerald-50/90">
              Join the SMEs in Kigali and across Rwanda operating with one system and an AI assistant that never sleeps.
            </p>
            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/register">
                <Button size="lg" variant="dark" className="bg-white text-emerald-700 shadow-lg hover:bg-emerald-50">
                  Get started free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" className="border border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20">
                  Explore the demo
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-slate-100 bg-slate-950">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white">
                E
              </div>
              <span className="text-base font-extrabold tracking-tight text-white">EgukaSystem</span>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              The AI-powered business operating system for African SMEs. Built in Kigali, for businesses that move fast.
            </p>
            <div className="mt-4 flex gap-2">
              {[Store, TrendingUp, Users].map((Icon, i) => (
                <span key={i} className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-slate-400 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-600 hover:text-white">
                  <Icon className="h-4 w-4" />
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Product</p>
            <ul className="mt-4 space-y-2.5 text-xs text-slate-400">
              {['POS & sales', 'Inventory', 'Production', 'Customers & credit', 'Reports & AI'].map((l) => (
                <li key={l}><a href="#features" className="transition-colors hover:text-emerald-400">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Company</p>
            <ul className="mt-4 space-y-2.5 text-xs text-slate-400">
              {['About', 'Pricing', 'How it works', 'Careers', 'Contact'].map((l) => (
                <li key={l}><a href="#how" className="transition-colors hover:text-emerald-400">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Get in touch</p>
            <ul className="mt-4 space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-emerald-500" /> KN 4 Ave, Kigali, Rwanda</li>
              <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-emerald-500" /> +250 788 000 000</li>
              <li className="flex items-center gap-2"><MessageSquareText className="h-3.5 w-3.5 text-emerald-500" /> hello@egukasystem.rw</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-900 py-6 text-center text-[11px] text-slate-500">
          © 2026 EgukaSystem Ltd — Kigali, Rwanda. AI-powered business operating system for African SMEs.
        </div>
      </footer>
    </div>
  )
}
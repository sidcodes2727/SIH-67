export default function About() {
  return (
    <div className="min-h-[calc(100dvh-6rem)] w-full">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-600/20 via-cyan-600/10 to-sky-700/10 p-8 md:p-12 border border-white/10">
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs tracking-wide text-white/80">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Heavy Metal Pollution Index
          </span>
          <h1 className="mt-4 text-3xl md:text-5xl font-semibold leading-tight">
            Understand water quality at a glance with HMPI
          </h1>
          <p className="mt-4 text-white/80 text-sm md:text-base">
            Upload measurements, compute a standardized index, and visualize hotspots. Built for environmental monitoring and rapid decision making.
          </p>
        </div>

        {/* Decorative blur blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      </section>

      {/* Highlights */}
      <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-emerald-500/15 p-2 border border-emerald-400/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 text-emerald-300">
                <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h3A1.5 1.5 0 0 1 9 4.5v15A1.5 1.5 0 0 1 7.5 21h-3A1.5 1.5 0 0 1 3 19.5v-15ZM10.5 8.25A1.5 1.5 0 0 1 12 6.75h3a1.5 1.5 0 0 1 1.5 1.5v11.25A1.5 1.5 0 0 1 15 21h-3a1.5 1.5 0 0 1-1.5-1.5V8.25ZM18 12a1.5 1.5 0 0 1 1.5-1.5H21A1.5 1.5 0 0 1 22.5 12v7.5A1.5 1.5 0 0 1 21 21h-1.5A1.5 1.5 0 0 1 18 19.5V12Z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Actionable Index</h3>
              <p className="text-sm text-white/70">Single score summarizing multiple metals for quick assessment.</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-cyan-500/15 p-2 border border-cyan-400/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 text-cyan-300">
                <path d="M11.47 3.84a.75.75 0 0 1 1.06 0l6.63 6.63a.75.75 0 0 1 0 1.06l-6.63 6.63a.75.75 0 0 1-1.06 0L4.84 11.53a.75.75 0 0 1 0-1.06l6.63-6.63Z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Upload & Validate</h3>
              <p className="text-sm text-white/70">CSV/XLSX parsing with strict validation to ensure clean data.</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-sky-500/15 p-2 border border-sky-400/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 text-sky-300">
                <path d="M12 2.25a.75.75 0 0 1 .75.75v17.19l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Export & Share</h3>
              <p className="text-sm text-white/70">Create CSV and PDF summaries to distribute insights quickly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HMPI definition */}
      <section className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6">
          <h2 className="text-xl font-semibold">What is HMPI?</h2>
          <p className="mt-2 text-white/80 text-sm">
            HMPI (Heavy Metal Pollution Index) condenses multiple contaminant measurements into a single interpretable score.
          </p>

          <div className="mt-4 rounded-lg bg-black/30 border border-white/10 p-4">
            <p className="text-sm text-white/80">Sub-index method</p>
            <div className="mt-2 grid gap-2 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <code className="rounded bg-white/10 px-2 py-1">Qi = (Mi / Si) × 100</code>
                <span className="text-white/60">,</span>
                <code className="rounded bg-white/10 px-2 py-1">Wi = 1 / Si</code>
              </div>
              <div>
                <code className="rounded bg-white/10 px-2 py-1">HMPI = Σ(Qi × Wi) / Σ(Wi)</code>
              </div>
              <p className="text-xs text-white/60">Mi: measured concentration, Si: permissible limit for each metal.</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
              <span className="size-1.5 rounded-full bg-emerald-400" /> Safe &lt; 50
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-200">
              <span className="size-1.5 rounded-full bg-amber-400" /> Moderate 50–100
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1 text-xs text-rose-200">
              <span className="size-1.5 rounded-full bg-rose-400" /> Hazardous &gt; 100
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="font-medium">Supported Metals</h3>
          <p className="text-sm text-white/70 mt-1">Configured in <code className="bg-white/10 px-1.5 py-0.5 rounded">src/services/hmpiService.js</code></p>
          <div className="mt-4 flex flex-wrap gap-2">
            {['Pb', 'Cd', 'As', 'Hg', 'Cr'].map((m) => (
              <span key={m} className="rounded-md border border-white/10 bg-black/30 px-3 py-1 text-sm">
                {m}
              </span>
            ))}
          </div>
          <div className="mt-4 text-xs text-white/60">
            Add or adjust limits to fit your regulatory context.
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mt-10 rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold">How it works</h2>
        <ol className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 list-none">
          {[{
            title: 'Add data',
            desc: 'Upload CSV/XLSX or add a single record with coordinates and timestamp.',
          }, {
            title: 'Compute index',
            desc: 'We calculate HMPI for each location/time group using the sub-index method.',
          }, {
            title: 'Visualize & export',
            desc: 'Explore trends and hotspots, then export CSV/PDF for reporting.',
          }].map((s, i) => (
            <li key={s.title} className="relative rounded-lg border border-white/10 bg-black/30 p-4">
              <div className="absolute -top-3 -left-3 size-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-sm">
                {i + 1}
              </div>
              <h4 className="font-medium">{s.title}</h4>
              <p className="mt-1 text-sm text-white/70">{s.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="mt-10 text-center">
        <p className="text-white/80">Ready to get insights?</p>
        <div className="mt-3 inline-flex gap-3">
          <a href="/upload" className="rounded-md bg-emerald-500/90 hover:bg-emerald-500 text-black font-medium px-4 py-2 transition-colors">Upload Data</a>
          <a href="/dashboard" className="rounded-md border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2 transition-colors">Go to Dashboard</a>
        </div>
      </section>
    </div>
  );
}

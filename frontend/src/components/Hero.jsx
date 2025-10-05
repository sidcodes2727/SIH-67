import { motion } from 'framer-motion';

export default function Hero({ onUpload, onDashboard, onAbout }) {
  return (
    <div className="relative container text-center py-20 md:py-28 overflow-hidden">
      {/* Background ornaments */}
      <div className="absolute inset-0 -z-10">
        <div className="hero-orb top-[-20%] left-[10%]" />
        <div className="hero-orb top-[10%] right-[5%] opacity-70" />
        <div className="bg-dot-grid" />
      </div>
      <motion.div
        className="absolute inset-x-0 -top-10 mx-auto h-40 w-40 md:h-56 md:w-56 rounded-full blur-3xl"
        style={{ background:
          'radial-gradient(circle at 50% 50%, rgba(100,255,218,0.25), transparent 60%)' }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      />
      {/* Small badge */}
      <motion.div
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 text-sm text-white/80 bg-white/5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <span className="text-primary">●</span> HMPI Platform
      </motion.div>

      <motion.h1
        className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-primary"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Heavy Metal Pollution Index
      </motion.h1>
      <motion.p
        className="mt-4 text-white/70 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Quantify water quality, visualize hotspots, and export clean reports. Built for scientists and policymakers.
      </motion.p>
      <motion.div className="mt-10 flex flex-wrap gap-4 justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <button className="btn " onClick={onUpload}>Upload Data</button>
        <button className="btn bg-white/10 hover:opacity-100" onClick={onDashboard}>View Dashboard</button>
        <button className="px-4 py-2 rounded-lg border border-white/15 text-white/90 hover:border-white/30" onClick={onAbout}>About HMPI</button>
      </motion.div>

      {/* Stats strip */}
      <div className="mt-12 divider-faint" />
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
        <div className="card p-4">
          <div className="text-2xl font-bold">10k+</div>
          <div className="text-white/60 text-sm">Samples analyzed</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold">120+</div>
          <div className="text-white/60 text-sm">Regions mapped</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold">5</div>
          <div className="text-white/60 text-sm">Key metals tracked</div>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
        <motion.div className="card p-5 hover:translate-y-[-2px] transition" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="mb-2 text-primary">📈</div>
          <div className="font-semibold">Insightful Analytics</div>
          <div className="text-white/70 text-sm mt-1">Track concentrations across regions and time with interactive charts.</div>
        </motion.div>
        <motion.div className="card p-5 hover:translate-y-[-2px] transition" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }}>
          <div className="mb-2 text-primary">🗺️</div>
          <div className="font-semibold">Geospatial Mapping</div>
          <div className="text-white/70 text-sm mt-1">Explore hotspots on an interactive map with contextual details.</div>
        </motion.div>
        <motion.div className="card p-5 hover:translate-y-[-2px] transition sm:col-span-2 lg:col-span-1" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
          <div className="mb-2 text-primary">📤</div>
          <div className="font-semibold">Simple Uploads</div>
          <div className="text-white/70 text-sm mt-1">Import your datasets and get instant, clean visual summaries.</div>
        </motion.div>
      </div>
    </div>
  );
}

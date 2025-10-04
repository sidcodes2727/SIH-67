import { motion } from 'framer-motion';

export default function Hero({ onUpload, onDashboard, onAbout }) {
  return (
    <div className="relative text-center py-20 md:py-28">
      <motion.div
        className="absolute inset-x-0 -top-10 mx-auto h-40 w-40 md:h-56 md:w-56 rounded-full blur-3xl"
        style={{ background:
          'radial-gradient(circle at 50% 50%, rgba(100,255,218,0.25), transparent 60%)' }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      />

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
        <button className="btn" onClick={onUpload}>Upload Data</button>
        <button className="btn" onClick={onDashboard}>View Dashboard</button>
        <button className="btn" onClick={onAbout}>About HMPI</button>
      </motion.div>
    </div>
  );
}

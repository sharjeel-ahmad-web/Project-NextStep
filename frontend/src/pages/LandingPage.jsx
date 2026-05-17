import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Award, Map, Sparkles, Target } from 'lucide-react'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import ThemeToggle from '../components/ThemeToggle'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const LandingPage = () => {
  useDocumentMeta({
    title: 'NextStep AI | Professional Learning Roadmaps',
    description: 'Analyze skills, generate a roadmap, learn in your language, and export proof. Clean, calm, and focused.',
  })

  const features = [
    { icon: Target, title: 'Intelligent Skill Analysis', desc: 'We scan your background to pinpoint exactly what you need to learn.' },
    { icon: Map, title: 'Precision Roadmaps', desc: 'Follow a curated sequence of targeted lessons, cutting out the noise.' },
    { icon: Award, title: 'Certified Outcomes', desc: 'Earn verified credentials and build a robust portfolio as you progress.' },
  ]

  return (
    <div className="bg-[var(--background)] text-[var(--text-primary)] min-h-screen relative overflow-hidden">
      {/* Background Orbs for Premium Aesthetic */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--brand-lilac)]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--brand-blue)]/10 blur-[120px] pointer-events-none" />

      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border-soft)] bg-[var(--surface)]/80 backdrop-blur-md">
        <div className="page-shell flex items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--brand-blue)] to-[var(--brand-charcoal)] text-white font-bold shadow-lg shadow-[var(--brand-blue)]/20">
              NS
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">NextStep AI</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <ThemeToggle />
            </div>
            <Link to="/login" className="text-sm font-semibold hover:text-[var(--brand-blue)] transition-colors">Sign in</Link>
            <Link to="/register" className="btn-primary py-2 px-5 text-sm shadow-md">Get Started</Link>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.section 
          className="page-shell max-w-4xl mx-auto text-center mt-10 md:mt-20 mb-32"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[var(--brand-blue)] shadow-sm">
            <Sparkles size={14} /> Professional Learning Path
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-8">
            Master your next role with <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-lilac)]">
              zero distractions.
            </span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="max-w-2xl mx-auto text-lg md:text-xl text-[var(--text-secondary)] mb-10 leading-relaxed">
            Run a precise skill analysis, get a focused roadmap, and accelerate your career. A calm, premium environment designed for serious learners.
          </motion.p>
          
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary w-full sm:w-auto text-base px-8 py-4 shadow-xl shadow-[var(--brand-orange)]/20">
              Start Free Journey
              <ArrowRight size={18} />
            </Link>
            <Link to="/analyze" className="btn-secondary w-full sm:w-auto text-base px-8 py-4 bg-white/5 border-[var(--border-strong)] hover:bg-white/10">
              Run Skill Scan
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-[var(--border-soft)]">
             <div className="flex flex-col items-center justify-center gap-2">
               <p className="text-3xl font-black text-[var(--text-primary)]">15+</p>
               <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Target Roles</p>
             </div>
             <div className="flex flex-col items-center justify-center gap-2">
               <p className="text-3xl font-black text-[var(--text-primary)]">100%</p>
               <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Focused</p>
             </div>
             <div className="flex flex-col items-center justify-center gap-2">
               <p className="text-3xl font-black text-[var(--text-primary)]">24/7</p>
               <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Availability</p>
             </div>
             <div className="flex flex-col items-center justify-center gap-2">
               <p className="text-3xl font-black text-[var(--text-primary)]">3</p>
               <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Languages</p>
             </div>
          </motion.div>
        </motion.section>

        <section className="page-shell mt-24 max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Engineered for success</h2>
            <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">Everything you need to level up, beautifully integrated into one simple platform.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="glass-card hover:-translate-y-2 transition-transform duration-300 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--surface-strong)] to-[var(--surface)] border border-[var(--border-soft)] flex items-center justify-center mb-6 text-[var(--brand-blue)] group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <item.icon size={26} />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="page-shell mt-32 max-w-5xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-[2rem] border border-[var(--border-soft)] bg-gradient-to-br from-[var(--brand-charcoal)] to-[#1a1d21] p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-black/20"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--brand-blue)] rounded-full mix-blend-screen filter blur-[80px] opacity-30 animate-pulse"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Ready to accelerate?</h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10">
                Join thousands of learners achieving their goals with clarity and precision. Your next career step starts here.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register" className="btn-primary text-base px-10 py-4 shadow-lg shadow-[var(--brand-orange)]/30 hover:scale-105 transition-transform">
                  Create your account
                </Link>
                <Link to="/roadmaps" className="btn-secondary !text-[var(--text-primary)] border-white/20 text-base px-10 py-4 transition-all hover:scale-105">
                  Explore Roadmaps
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-[var(--border-soft)] bg-[var(--surface)] mt-auto">
        <div className="page-shell py-8 px-4 flex flex-col md:flex-row items-center justify-between text-sm text-[var(--text-secondary)]">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-[var(--brand-blue)] to-[var(--brand-charcoal)] text-white flex items-center justify-center text-[10px] font-bold">NS</div>
            <p>© {new Date().getFullYear()} NextStep AI. Professional learning.</p>
          </div>
          <div className="flex items-center gap-6 font-medium">
            <Link to="/privacy" className="hover:text-[var(--text-primary)] transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-[var(--text-primary)] transition-colors">Terms of Service</Link>
            <Link to="/contact" className="hover:text-[var(--text-primary)] transition-colors">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

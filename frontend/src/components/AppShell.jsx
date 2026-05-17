import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export const pageTransition = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export const PageContainer = ({ children, narrow = false }) => (
  <div className={`mx-auto w-full px-4 py-6 sm:px-5 lg:px-6 lg:py-8 ${narrow ? 'max-w-5xl' : 'max-w-7xl'}`}>
    {children}
  </div>
)

export const PageIntro = ({ eyebrow, title, description, actions }) => (
  <motion.div {...pageTransition} className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
    <div className="space-y-3">
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold sm:text-5xl tracking-tight">{title}</h1>
        {description ? <p className="max-w-3xl text-lg leading-relaxed text-[var(--text-secondary)]">{description}</p> : null}
      </div>
    </div>
    {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
  </motion.div>
)

export const SectionCard = ({ children, className = '' }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
    className={`glass-card ${className}`.trim()}
  >
    {children}
  </motion.div>
)

export const StatCard = ({ icon: Icon, label, value, tone = 'blue', detail }) => {
  const tones = {
    blue: 'bg-[var(--brand-blue)]/12 text-[var(--brand-blue)]',
    orange: 'bg-[var(--brand-orange)]/12 text-[var(--brand-orange)]',
    green: 'bg-[var(--brand-green)]/12 text-[var(--brand-green)]',
    lilac: 'bg-[var(--brand-lilac)]/14 text-[var(--brand-lilac)]',
    charcoal: 'bg-[var(--brand-charcoal)]/12 text-[var(--text-primary)]',
  }

  return (
    <SectionCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--text-muted)]">{label}</p>
          <p className="mt-3 text-3xl font-extrabold">{value}</p>
          {detail ? <p className="mt-2 text-sm text-[var(--text-secondary)]">{detail}</p> : null}
        </div>
        <div className={`rounded-2xl p-3 ${tones[tone] || tones.blue}`}>
          <Icon size={22} />
        </div>
      </div>
    </SectionCard>
  )
}

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <SectionCard className="py-14 text-center">
    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-strong)] text-[var(--brand-blue)]">
      <Icon size={28} />
    </div>
    <h2 className="text-2xl font-bold">{title}</h2>
    <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-[var(--text-secondary)]">{description}</p>
    {action ? <div className="mt-6">{action}</div> : null}
  </SectionCard>
)

export const LoadingScreen = ({ label = 'Loading content...' }) => (
  <div className="flex min-h-[70vh] items-center justify-center px-4">
    <div className="text-center">
      <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-[var(--brand-blue)] border-t-transparent" />
      <p className="mt-4 text-sm font-semibold text-[var(--text-secondary)]">{label}</p>
    </div>
  </div>
)

export const AuthShell = ({ title, subtitle, children, footer, headerActions }) => (
  <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10 sm:px-6">
    <div className="pointer-events-none absolute left-1/4 top-24 h-48 w-48 -translate-x-1/2 rounded-full bg-[var(--brand-blue)]/10 blur-3xl" />
    <div className="pointer-events-none absolute bottom-32 right-1/4 h-40 w-40 rounded-full bg-[var(--brand-lilac)]/15 blur-3xl" />

    <motion.div {...pageTransition} className="relative w-full max-w-[400px]">
      <div className="surface-panel rounded-2xl p-8 sm:p-9">
        <header className="mb-8 flex items-start justify-between gap-4">
          <Link to="/" className="font-[family-name:var(--font-heading)] text-lg font-semibold tracking-tight text-[var(--text-primary)] hover:text-[var(--brand-blue)]">
            NextStep
          </Link>
          {headerActions ? <div className="flex shrink-0 items-center gap-2">{headerActions}</div> : null}
        </header>

        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-[1.625rem]">
            {title}
          </h1>
          {subtitle ? <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{subtitle}</p> : null}
        </div>

        {children}

        {footer ? <div className="mt-8 border-t border-[var(--border-soft)] pt-6">{footer}</div> : null}


      </div>
    </motion.div>
  </div>
)

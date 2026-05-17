import { Mail, MapPin, MessageSquare, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageContainer, PageIntro, SectionCard } from '../components/AppShell'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

const ContactPage = () => {
  useDocumentMeta({
    title: 'Contact | NextStep AI',
    description: 'Contact NextStep AI for learner support, institute onboarding, and partnership questions.',
  })

  return (
    <PageContainer narrow>
      <PageIntro
        eyebrow="Contact"
        title="Talk to the team behind the roadmap platform"
        description="Use this page for support, institute onboarding, partnership discussions, or certificate verification help. Clear contact details help learners and reviewers trust the platform."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {[
          [Mail, 'Email support', 'support@nextstepai.app', 'Response for learner and account issues'],
          [Phone, 'Phone', '+92 300 0000000', 'For institute and business inquiries'],
          [MapPin, 'Office hours', 'Mon to Fri, 9 AM to 6 PM', 'Timezone-aware support for training teams'],
        ].map(([Icon, title, value, text]) => (
          <SectionCard key={title}>
            <div className="mb-4 inline-flex rounded-2xl bg-[var(--brand-blue)]/12 p-3 text-[var(--brand-blue)]">
              <Icon size={20} />
            </div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="mt-2 text-base font-semibold">{value}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{text}</p>
          </SectionCard>
        ))}
      </div>

      <SectionCard className="mt-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Need platform information first?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
              Review our privacy and terms pages for platform policies, learner data handling, and certificate usage information.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/privacy" className="btn-secondary">
              Privacy Policy
            </Link>
            <Link to="/terms" className="btn-primary">
              Terms of Use
            </Link>
          </div>
        </div>
      </SectionCard>

      <SectionCard className="mt-5">
        <div className="flex items-start gap-3">
          <MessageSquare className="mt-1 text-[var(--brand-orange)]" size={20} />
          <div>
            <h2 className="text-xl font-bold">Support note</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
              Replace the placeholder contact details with your real business email, phone number, and address before production. That step is important for trust and AdSense review.
            </p>
          </div>
        </div>
      </SectionCard>
    </PageContainer>
  )
}

export default ContactPage

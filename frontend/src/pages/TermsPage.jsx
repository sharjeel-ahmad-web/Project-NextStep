import { PageContainer, PageIntro, SectionCard } from '../components/AppShell'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

const sections = [
  {
    title: 'Platform purpose',
    text: 'NextStep AI helps learners understand skill gaps, follow role-based roadmaps, track progress, and generate certificates from completed learning activity.',
  },
  {
    title: 'Account responsibility',
    text: 'Users are responsible for maintaining accurate profile details, protecting their login credentials, and using the platform for lawful educational activity.',
  },
  {
    title: 'Learning recommendations',
    text: 'Roadmaps, video suggestions, and AI guidance are educational recommendations. Users should still evaluate job requirements, institute standards, and hiring expectations independently.',
  },
  {
    title: 'Certificates and verification',
    text: 'Certificates reflect progress completed inside the platform. Sharing or verifying a certificate does not guarantee employment, admission, or third-party accreditation.',
  },
]

const TermsPage = () => {
  useDocumentMeta({
    title: 'Terms of Use | NextStep AI',
    description: 'Terms governing the use of NextStep AI roadmaps, progress tracking, and certificate tools.',
  })

  return (
    <PageContainer narrow>
      <PageIntro
        eyebrow="Terms"
        title="Terms of use"
        description="These terms explain the intended use of the roadmap platform and set expectations around recommendations, certificates, and account responsibility."
      />

      <div className="space-y-5">
        {sections.map((section) => (
          <SectionCard key={section.title}>
            <h2 className="text-2xl font-bold">{section.title}</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{section.text}</p>
          </SectionCard>
        ))}
      </div>
    </PageContainer>
  )
}

export default TermsPage

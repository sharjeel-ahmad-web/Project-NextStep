import { PageContainer, PageIntro, SectionCard } from '../components/AppShell'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

const sections = [
  {
    title: 'Information we use',
    text: 'NextStep AI stores account details, roadmap progress, quiz outcomes, and certificate records so learners can continue their journey and verify completed work.',
  },
  {
    title: 'How learner data is used',
    text: 'Data supports account login, roadmap generation, progress tracking, leaderboard activity, and certificate issuance. Resume files and goal descriptions are used only to generate learning analysis.',
  },
  {
    title: 'Third-party services',
    text: 'The platform may connect with Google authentication, AI services, analytics tools, and video platforms to deliver roadmap and learning content.',
  },
  {
    title: 'User control',
    text: 'Learners can request updates to their profile information and should contact support for data correction or account-related issues.',
  },
]

const PrivacyPage = () => {
  useDocumentMeta({
    title: 'Privacy Policy | NextStep AI',
    description: 'Learn how NextStep AI handles learner data, progress information, and certificate records.',
  })

  return (
    <PageContainer narrow>
      <PageIntro
        eyebrow="Privacy"
        title="Privacy policy for learners and institutes"
        description="This page gives review teams and users a clear summary of how account, roadmap, and certificate data is handled on the platform."
      />

      <div className="space-y-5">
        {sections.map((section) => (
          <SectionCard key={section.title}>
            <h2 className="text-2xl font-bold">{section.title}</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{section.text}</p>
          </SectionCard>
        ))}

        <SectionCard>
          <h2 className="text-2xl font-bold">Production checklist</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
            Before launch, replace this summary with your final legal copy, add a real company identity, and include your working support contact. Those details matter for platform trust and ad-policy readiness.
          </p>
        </SectionCard>
      </div>
    </PageContainer>
  )
}

export default PrivacyPage

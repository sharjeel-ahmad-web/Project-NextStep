import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, Award, Zap, Calendar, Trophy, Star, Upload, Trash2, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import { gamificationAPI, profileAPI } from '../services/api'
import { EmptyState, LoadingScreen, PageContainer, PageIntro, SectionCard, StatCard } from '../components/AppShell'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const ProfilePage = () => {
  useDocumentMeta({
    title: 'Profile | NextStep AI',
    description: 'Manage your learner profile, avatar, gamification stats, and earned badges.',
    robots: 'noindex, follow',
  })

  const { user, setUser } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '' })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const [statsResponse, badgesResponse] = await Promise.all([gamificationAPI.getStats(), gamificationAPI.getBadges()])
      setStats(statsResponse.data)
      setBadges(badgesResponse.data.badges || [])
    } catch (error) {
      toast.error('Failed to load profile stats')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (event) => {
    event.preventDefault()
    try {
      const { data } = await profileAPI.update(formData)
      setUser(data.user)
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed')
    }
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const uploadData = new FormData()
    uploadData.append('image', file)

    setUploading(true)
    try {
      const { data } = await profileAPI.uploadAvatar(uploadData)
      setUser(data.user)
      toast.success('Profile image updated')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = async () => {
    if (!window.confirm('Are you sure you want to remove your profile image?')) return
    try {
      const { data } = await profileAPI.deleteAvatar()
      setUser(data.user)
      toast.success('Profile image removed')
    } catch (error) {
      toast.error('Failed to remove image')
    }
  }

  if (loading) {
    return <LoadingScreen label="Loading your profile..." />
  }

  return (
    <PageContainer>
      <PageIntro
        eyebrow="Learner Profile"
        title="Your Profile"
        description="Manage your personal details, track your learning stats, and view your earned badges."
      />

      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-8">
        <motion.div variants={fadeUp}>
          <SectionCard className="relative overflow-hidden border-[var(--brand-blue)]/20">
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-[var(--brand-blue)] rounded-full mix-blend-screen filter blur-[100px] opacity-10 pointer-events-none"></div>

            <div className="grid gap-8 lg:grid-cols-[auto_1fr] items-start relative z-10">
              <div className="relative mx-auto lg:mx-0 flex flex-col items-center">
                <div className="group relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-[var(--surface-elevated)] bg-[var(--surface-strong)] text-5xl font-bold text-[var(--brand-blue)] shadow-xl">
                  {user?.avatar ? <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" /> : user?.name?.charAt(0).toUpperCase()}
                  
                  <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-sm">
                    <Camera className="text-white mb-2" size={24} />
                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                  </label>
                  {uploading ? <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm"><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div> : null}
                </div>
                {user?.avatar && !uploading && (
                  <button type="button" onClick={handleDeleteImage} className="mt-4 text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors">
                    <Trash2 size={12} /> Remove
                  </button>
                )}
              </div>

              <div className="w-full">
                {isEditing ? (
                  <form onSubmit={handleUpdate} className="space-y-5 bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border-soft)]">
                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Full Name</label>
                        <input type="text" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} className="input-field" placeholder="Full name" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Email Address</label>
                        <input type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} className="input-field" placeholder="Email address" required />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 pt-2">
                      <button type="submit" className="btn-primary">Save Changes</button>
                      <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border-soft)]">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h2 className="text-3xl font-extrabold text-[var(--text-primary)]">{user?.name}</h2>
                        <p className="mt-1 text-base font-medium text-[var(--text-secondary)]">{user?.email}</p>
                      </div>
                      <button type="button" onClick={() => setIsEditing(true)} className="btn-secondary text-sm px-4 py-2">
                        Edit Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </SectionCard>
        </motion.div>

        <motion.div variants={staggerContainer} className="grid gap-5 md:grid-cols-3">
          <motion.div variants={fadeUp}>
            <StatCard icon={Zap} label="Total XP" value={stats?.xp || 0} tone="orange" />
          </motion.div>
          <motion.div variants={fadeUp}>
            <StatCard icon={Trophy} label="Current Level" value={stats?.level || 1} tone="blue" />
          </motion.div>
          <motion.div variants={fadeUp}>
            <StatCard icon={Calendar} label="Day Streak" value={stats?.streak || 0} tone="green" />
          </motion.div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--brand-orange)] to-[var(--brand-lilac)] flex items-center justify-center text-white shadow-md">
              <Award size={20} />
            </div>
            <h2 className="text-2xl font-bold">Earned Badges</h2>
          </div>

          {badges.length === 0 ? (
            <EmptyState icon={Star} title="No badges yet" description="Keep progressing through your learning roadmap to unlock unique achievement badges." />
          ) : (
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {badges.map((badge) => (
                <motion.div key={badge.id} variants={fadeUp}>
                  <div className="group h-full rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-6 text-center transition-all hover:-translate-y-2 hover:shadow-xl hover:border-[var(--brand-orange)]/30">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--surface-strong)] to-[var(--surface)] text-[var(--brand-orange)] shadow-inner group-hover:scale-110 transition-transform duration-300">
                      <Star size={32} />
                    </div>
                    <h3 className="mt-5 text-sm font-extrabold text-[var(--text-primary)]">{badge.name}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">{badge.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </PageContainer>
  )
}

export default ProfilePage

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Award, Map, Activity, Trash2, UserCog, Search, LayoutDashboard, ShieldCheck, Settings, Database, RefreshCw, TrendingUp, ClipboardCheck, Plus, X, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminAPI } from '../services/api'
import { courseService } from '../services/courseApi'
import { EmptyState, LoadingScreen, PageContainer, PageIntro, SectionCard, StatCard } from '../components/AppShell'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

const AdminDashboard = () => {
  useDocumentMeta({
    title: 'Admin Dashboard | NextStep AI',
    description: 'Administrative controls for platform users, system stats, and content oversight.',
    robots: 'noindex, follow',
  })

  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtering, setFiltering] = useState(false)
  const [reviews, setReviews] = useState([])
  const [courses, setCourses] = useState([])
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [newCourse, setNewCourse] = useState({ title: '', description: '', category: 'Web Development', level: 'beginner', duration_hours: 0, price: 0, instructor_id: 'admin' })
  const [editingCourse, setEditingCourse] = useState(null)
  const [showLessonForm, setShowLessonForm] = useState(false)
  const [newLesson, setNewLesson] = useState({ title: '', description: '', video_url: '', duration_minutes: 0, order: 1 })

  useEffect(() => {
    fetchAdminData()
    fetchUsers()
    fetchReviews()
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const data = await courseService.getAllCourses();
      setCourses(Array.isArray(data) ? data : (data.data || []));
    } catch (error) {
      toast.error('Failed to load courses')
    }
  }

  const fetchAdminData = async () => {
    try {
      const statsResponse = await adminAPI.getStats()
      setStats(statsResponse.data)
    } catch (error) {
      toast.error('Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    setFiltering(true)
    try {
      const usersResponse = await adminAPI.getUsers({ search: searchTerm })
      setUsers(usersResponse.data.users || usersResponse.data.data || [])
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setFiltering(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await adminAPI.getPracticeReviews()
      setReviews(response.data.reviews || [])
    } catch (error) {
      toast.error('Failed to load review queue')
    }
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

    try {
      await adminAPI.deleteUser(id)
      toast.success('User deleted successfully')
      fetchUsers()
      fetchAdminData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user')
    }
  }

  const handleUpdateRole = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'

    try {
      await adminAPI.updateRole(id, newRole)
      toast.success('User role updated')
      fetchUsers()
    } catch (error) {
      toast.error('Failed to update role')
    }
  }

  const handleReview = async (progressId, taskId, status) => {
    try {
      await adminAPI.reviewPracticeTask(progressId, {
        task_id: taskId,
        status,
        mentor_feedback: status === 'approved' ? 'Good practical proof. Keep building on this.' : 'Needs revision. Improve clarity, polish, and practical explanation.',
      })
      toast.success('Practice task reviewed')
      fetchReviews()
    } catch (error) {
      toast.error('Failed to review task')
    }
  }

  const handleCreateCourse = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.createCourse(newCourse)
      toast.success('Course created successfully')
      setShowCourseForm(false)
      fetchCourses()
    } catch (error) {
      toast.error('Failed to create course')
    }
  }

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Delete this course permanently?')) return
    try {
      await adminAPI.deleteCourse(id)
      toast.success('Course deleted')
      fetchCourses()
    } catch (error) {
      toast.error('Failed to delete course')
    }
  }

  const handleUpdateCourse = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.updateCourse(editingCourse._id, editingCourse)
      toast.success('Course updated')
      setEditingCourse(null)
      fetchCourses()
    } catch (error) {
      toast.error('Failed to update course')
    }
  }

  const handleAddLesson = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.addLesson(editingCourse._id, newLesson)
      toast.success('Lesson added')
      setShowLessonForm(false)
      setNewLesson({ title: '', description: '', video_url: '', duration_minutes: 0, order: newLesson.order + 1 })
      
      const data = await courseService.getCourseById(editingCourse._id)
      setEditingCourse(data.course || data)
    } catch (error) {
      toast.error('Failed to add lesson')
    }
  }

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson permanently?')) return
    try {
      await adminAPI.deleteLesson(lessonId)
      toast.success('Lesson deleted')
      
      const data = await courseService.getCourseById(editingCourse._id)
      setEditingCourse(data.course || data)
    } catch (error) {
      toast.error('Failed to delete lesson')
    }
  }

  const loadCourseForEditing = async (courseId) => {
    try {
      const data = await courseService.getCourseById(courseId)
      setEditingCourse(data.course || data)
    } catch (error) {
      toast.error('Failed to load course details')
    }
  }


  if (loading) {
    return <LoadingScreen label="Loading admin dashboard..." />
  }

  const navigation = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'users', icon: Users, label: 'User Management' },
    { id: 'content', icon: Database, label: 'System Content' },
    { id: 'reviews', icon: ClipboardCheck, label: 'Practice Reviews' },
    { id: 'settings', icon: Settings, label: 'Global Settings' },
  ]

  return (
    <PageContainer>
      <PageIntro
        eyebrow="Admin dashboard"
        title="Platform management"
        description="Review system health, inspect platform usage, and manage user access from a cleaner responsive panel."
      />

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <SectionCard className="h-fit">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-charcoal)] text-white">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-lg font-bold">Admin Panel</p>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Management suite</p>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            {navigation.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                  activeTab === item.id
                    ? 'bg-[var(--brand-charcoal)] text-white'
                    : 'bg-[var(--surface)] text-[var(--text-secondary)]'
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-[1.4rem] bg-[var(--surface)] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">System status</p>
            <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)]">
              <span className="h-2 w-2 rounded-full bg-[var(--brand-green)]" />
              All systems operational
            </div>
          </div>
        </SectionCard>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div key="overview" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={Users} label="Total Users" value={stats?.total_users || 0} tone="blue" />
                <StatCard icon={Map} label="Total Roadmaps" value={stats?.total_roadmaps || 0} tone="lilac" />
                <StatCard icon={Award} label="Certificates Issued" value={stats?.total_certificates || 0} tone="orange" />
                <StatCard icon={Activity} label="Active Today" value={stats?.active_today || 0} tone="green" />
              </div>

              <SectionCard className="mt-6 min-h-[280px]">
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <RefreshCw size={42} className="animate-spin text-[var(--brand-blue)]/45" />
                  <h2 className="mt-5 text-2xl font-bold">Activity feed coming soon</h2>
                  <p className="mt-3 max-w-md text-sm leading-7 text-[var(--text-secondary)]">
                    This space is reserved for live system events, moderation activity, and platform health monitoring.
                  </p>
                </div>
              </SectionCard>
            </motion.div>
          ) : null}

          {activeTab === 'users' ? (
            <motion.div key="users" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              <SectionCard>
                <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">User management</h2>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">Search, update roles, and manage learner accounts.</p>
                  </div>
                  <div className="relative w-full lg:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') fetchUsers()
                      }}
                      className="input-field pl-11"
                      placeholder="Search name or email"
                    />
                  </div>
                </div>

                {filtering ? (
                  <LoadingScreen label="Filtering users..." />
                ) : users.length === 0 ? (
                  <EmptyState icon={Users} title="No users found" description="No accounts match the current search criteria." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left">
                      <thead>
                        <tr className="border-b border-[var(--border-soft)] text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                          <th className="py-4 pr-4">User</th>
                          <th className="py-4 pr-4 text-center">Role</th>
                          <th className="py-4 pr-4 text-center">Stats</th>
                          <th className="py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((entry) => (
                          <tr key={entry.id} className="border-b border-[var(--border-soft)]/70">
                            <td className="py-4 pr-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-sky)] font-bold text-[var(--brand-charcoal)]">
                                  {entry.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold">{entry.name}</p>
                                  <p className="text-sm text-[var(--text-secondary)]">{entry.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 pr-4 text-center">
                              <span className="rounded-full bg-[var(--surface)] px-3 py-2 text-xs font-bold">
                                {entry.role || 'user'}
                              </span>
                            </td>
                            <td className="py-4 pr-4 text-center">
                              <p className="font-bold text-[var(--brand-orange)]">{entry.xp || 0} XP</p>
                              <p className="text-xs text-[var(--text-muted)]">Level {entry.level || 1}</p>
                            </td>
                            <td className="py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => handleUpdateRole(entry.id, entry.role)} className="rounded-full p-2 text-[var(--text-muted)] transition hover:bg-[var(--surface)] hover:text-[var(--brand-blue)]">
                                  <UserCog size={16} />
                                </button>
                                <button type="button" onClick={() => handleDeleteUser(entry.id)} disabled={entry.role === 'admin'} className="rounded-full p-2 text-[var(--text-muted)] transition hover:bg-[var(--surface)] hover:text-red-500 disabled:opacity-40">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </SectionCard>
            </motion.div>
          ) : null}

          {activeTab === 'reviews' ? (
            <motion.div key="reviews" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              <SectionCard>
                <div className="mb-5">
                  <h2 className="text-2xl font-bold">Practice review queue</h2>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">Approve or send back submitted mini projects and portfolio work.</p>
                </div>

                {reviews.length === 0 ? (
                  <EmptyState icon={ClipboardCheck} title="No reviews pending" description="Submitted assignment reviews will appear here." />
                ) : (
                  <div className="grid gap-4">
                    {reviews.map((item) => (
                      <div key={`${item.progress_id}-${item.task_id}`} className="rounded-[1.4rem] bg-[var(--surface)] p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <p className="text-sm font-bold">{item.title}</p>
                            <p className="mt-1 text-sm text-[var(--brand-blue)]">{item.user_name} - {item.target_role}</p>
                            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{item.submission_notes || 'No notes submitted.'}</p>
                            {item.portfolio_url ? <p className="mt-2 text-xs break-all text-[var(--text-secondary)]">Portfolio: {item.portfolio_url}</p> : null}
                            {item.submission_file_url ? <p className="mt-1 text-xs break-all text-[var(--text-secondary)]">File: {item.submission_file_url}</p> : null}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => handleReview(item.progress_id, item.task_id, 'approved')} className="btn-primary">
                              Approve
                            </button>
                            <button type="button" onClick={() => handleReview(item.progress_id, item.task_id, 'needs_revision')} className="btn-secondary">
                              Needs Revision
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </motion.div>
          ) : null}

          {activeTab === 'content' ? (
            <motion.div key="content" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              <SectionCard>
                {editingCourse ? (
                  <div>
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">Edit Course: {editingCourse.title}</h2>
                        <button onClick={() => setEditingCourse(null)} className="text-sm text-[var(--brand-blue)] hover:underline mt-1 block">&larr; Back to all courses</button>
                      </div>
                      <button onClick={handleUpdateCourse} className="btn-primary">Save Changes</button>
                    </div>
                    
                    <div className="grid gap-6 lg:grid-cols-2">
                      <div className="rounded-2xl border border-[var(--border-soft)] p-5">
                        <h3 className="font-bold mb-4">Course Details</h3>
                        <div className="grid gap-3">
                          <div>
                            <label className="text-xs font-semibold text-[var(--text-muted)]">Title</label>
                            <input className="input-field w-full mt-1" value={editingCourse.title} onChange={e => setEditingCourse({...editingCourse, title: e.target.value})} />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-[var(--text-muted)]">Description</label>
                            <textarea className="input-field w-full mt-1 min-h-[80px]" value={editingCourse.description} onChange={e => setEditingCourse({...editingCourse, description: e.target.value})} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-semibold text-[var(--text-muted)]">Price</label>
                              <input type="number" className="input-field w-full mt-1" value={editingCourse.price} onChange={e => setEditingCourse({...editingCourse, price: parseFloat(e.target.value)})} />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-[var(--text-muted)]">Level</label>
                              <select className="input-field w-full mt-1" value={editingCourse.level} onChange={e => setEditingCourse({...editingCourse, level: e.target.value})}>
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[var(--border-soft)] p-5">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold">Lessons Curriculum</h3>
                          <button onClick={() => setShowLessonForm(!showLessonForm)} className="text-[var(--brand-blue)] text-sm font-bold flex items-center gap-1">
                            {showLessonForm ? <X size={14} /> : <Plus size={14} />} {showLessonForm ? 'Cancel' : 'Add Lesson'}
                          </button>
                        </div>

                        {showLessonForm && (
                          <form onSubmit={handleAddLesson} className="mb-4 rounded-xl border border-[var(--brand-blue)]/30 bg-[var(--brand-blue)]/5 p-4 grid gap-3">
                            <input required placeholder="Lesson Title" className="input-field w-full text-sm py-2" value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})} />
                            <input required placeholder="Video URL" className="input-field w-full text-sm py-2" value={newLesson.video_url} onChange={e => setNewLesson({...newLesson, video_url: e.target.value})} />
                            <div className="flex gap-2">
                              <input required type="number" placeholder="Mins" className="input-field w-full text-sm py-2" value={newLesson.duration_minutes || ''} onChange={e => setNewLesson({...newLesson, duration_minutes: parseInt(e.target.value)})} />
                              <button type="submit" className="bg-[var(--brand-blue)] text-white font-bold rounded-lg px-4 text-sm w-full">Add</button>
                            </div>
                          </form>
                        )}

                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                          {!editingCourse.lessons || editingCourse.lessons.length === 0 ? (
                            <p className="text-sm text-[var(--text-muted)] italic">No lessons added yet.</p>
                          ) : (
                            editingCourse.lessons.map((lesson, idx) => (
                              <div key={lesson._id} className="flex items-center justify-between bg-[var(--surface-strong)] p-3 rounded-xl">
                                <div>
                                  <p className="font-semibold text-sm">{idx + 1}. {lesson.title}</p>
                                  <p className="text-xs text-[var(--text-muted)]">{lesson.duration_minutes} mins</p>
                                </div>
                                <button onClick={() => handleDeleteLesson(lesson._id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-full transition">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">Course Management</h2>
                        <p className="mt-2 text-sm text-[var(--text-secondary)]">Create, update, and manage public courses.</p>
                      </div>
                      <button onClick={() => setShowCourseForm(!showCourseForm)} className="btn-primary flex items-center gap-2">
                        {showCourseForm ? <X size={16} /> : <Plus size={16} />}
                        {showCourseForm ? 'Cancel' : 'New Course'}
                      </button>
                    </div>

                    <AnimatePresence>
                      {showCourseForm && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-8 overflow-hidden rounded-[1.4rem] border border-[var(--brand-blue)]/30 bg-[var(--brand-blue)]/5 p-5">
                          <h3 className="mb-4 text-lg font-bold">Add New Course</h3>
                          <form onSubmit={handleCreateCourse} className="grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                              <label className="mb-1 block text-sm font-semibold">Course Title</label>
                              <input required type="text" className="input-field w-full" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="mb-1 block text-sm font-semibold">Description</label>
                              <textarea required className="input-field w-full min-h-[100px]" value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} />
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-semibold">Category</label>
                              <input required type="text" className="input-field w-full" value={newCourse.category} onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })} />
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-semibold">Level</label>
                              <select className="input-field w-full" value={newCourse.level} onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}>
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                              </select>
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-semibold">Duration (Hours)</label>
                              <input required type="number" min="0" className="input-field w-full" value={newCourse.duration_hours} onChange={(e) => setNewCourse({ ...newCourse, duration_hours: parseInt(e.target.value) })} />
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-semibold">Price ($)</label>
                              <input required type="number" min="0" step="0.01" className="input-field w-full" value={newCourse.price} onChange={(e) => setNewCourse({ ...newCourse, price: parseFloat(e.target.value) })} />
                            </div>
                            <div className="sm:col-span-2 flex justify-end">
                              <button type="submit" className="btn-primary">Publish Course</button>
                            </div>
                          </form>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {courses.length === 0 ? (
                      <EmptyState icon={BookOpen} title="No courses available" description="Create your first course to populate the library." />
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {courses.map((course) => (
                          <div key={course._id} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--brand-blue)]/30">
                            <div className="flex justify-between items-start mb-3">
                              <div className="rounded-full bg-[var(--brand-blue)]/10 px-3 py-1 text-xs font-bold text-[var(--brand-blue)]">{course.category}</div>
                              <div className="flex gap-2">
                                <button onClick={() => loadCourseForEditing(course._id)} className="text-[var(--text-muted)] hover:text-[var(--brand-blue)] transition-colors p-1">
                                  <Settings size={16} />
                                </button>
                                <button onClick={() => handleDeleteCourse(course._id)} className="text-[var(--text-muted)] hover:text-red-500 transition-colors p-1">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            <h3 className="font-bold text-lg mb-1 cursor-pointer hover:text-[var(--brand-blue)] transition-colors" onClick={() => loadCourseForEditing(course._id)}>{course.title}</h3>
                            <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4">{course.description}</p>
                            <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-muted)]">
                              <span>{course.level} • {course.duration_hours}h</span>
                              <span className="text-[var(--text-primary)]">{course.price > 0 ? `$${course.price}` : 'Free'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </SectionCard>
            </motion.div>
          ) : null}

          {activeTab === 'settings' ? (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EmptyState
                icon={TrendingUp}
                title="Expansion module"
                description="Settings module is reserved for the next admin release."
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </PageContainer>
  )
}

export default AdminDashboard

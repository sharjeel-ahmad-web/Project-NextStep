import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, ChevronRight, HelpCircle, Trophy, RefreshCw, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { quizAPI } from '../services/api'

const QuizModal = ({ video, skillName, progressId, nodeId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(true)
  const [quiz, setQuiz] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [results, setResults] = useState(null)

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true)
      try {
        const { data } = await quizAPI.get({
          video_id: video.video_id,
          video_title: video.title,
          skill_name: skillName,
        })
        setQuiz(data.data)
      } catch (error) {
        toast.error('Failed to load quiz. Please try again.')
        onClose()
      } finally {
        setLoading(false)
      }
    }

    fetchQuiz()
  }, [video.video_id, video.title, skillName, onClose])

  const handleSelectOption = (option) => {
    setAnswers((currentAnswers) => ({ ...currentAnswers, [currentQuestionIndex]: option }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((currentIndex) => currentIndex + 1)
    }
  }

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quiz.questions.length) {
      toast.error('Please answer all questions first!')
      return
    }

    setSubmitting(true)
    try {
      const { data } = await quizAPI.submit({
        quiz_id: quiz.id,
        answers,
        progress_id: progressId,
        node_id: nodeId,
      })
      setResults(data.data)
      if (data.data.passed) {
        onSuccess()
      }
    } catch (error) {
      toast.error('Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="glass-card relative max-h-[92vh] w-full max-w-2xl overflow-y-auto">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 text-[var(--text-muted)] transition hover:bg-[var(--surface)]">
          <X size={20} />
        </button>

        {loading ? (
          <div className="py-12 text-center">
            <RefreshCw className="mx-auto h-10 w-10 animate-spin text-[var(--brand-blue)]" />
            <p className="mt-4 text-sm font-semibold text-[var(--text-secondary)]">AI is generating your quiz...</p>
          </div>
        ) : !results ? (
          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-blue)]">
                  Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </span>
                <HelpCircle size={18} className="text-[var(--text-muted)]" />
              </div>
              <h2 className="text-2xl font-bold leading-tight">{quiz.questions[currentQuestionIndex].question}</h2>
            </div>

            <div className="space-y-3">
              {quiz.questions[currentQuestionIndex].options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  className={`flex w-full items-center justify-between rounded-[1.4rem] border p-4 text-left transition ${
                    answers[currentQuestionIndex] === option
                      ? 'border-[var(--brand-blue)] bg-[var(--brand-blue)]/10'
                      : 'border-[var(--border-soft)] bg-[var(--surface)]'
                  }`}
                >
                  <span className="font-semibold">{option}</span>
                  {answers[currentQuestionIndex] === option ? <CheckCircle size={18} className="text-[var(--brand-blue)]" /> : null}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface)]">
                <div className="h-full bg-[var(--brand-blue)]" style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }} />
              </div>
              {currentQuestionIndex < quiz.questions.length - 1 ? (
                <button type="button" onClick={handleNext} disabled={!answers[currentQuestionIndex]} className="btn-primary disabled:opacity-50">
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={submitting || !answers[currentQuestionIndex]} className="btn-primary disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Finish Quiz'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">
            <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${results.passed ? 'bg-[var(--brand-green)]/15 text-[var(--brand-green)]' : 'bg-red-500/12 text-red-500'}`}>
              {results.passed ? <Trophy size={42} /> : <XCircle size={42} />}
            </div>
            <h2 className="mt-6 text-3xl font-extrabold">{results.passed ? 'Congratulations!' : 'Keep Learning!'}</h2>
            <p className="mt-3 text-base text-[var(--text-secondary)]">
              You scored <span className="font-bold text-[var(--text-primary)]">{Math.round(results.percentage)}%</span> ({results.score}/{results.total})
            </p>

            <div className={`mt-6 rounded-[1.4rem] p-4 text-sm font-semibold ${results.passed ? 'bg-[var(--brand-green)]/15 text-[var(--text-primary)]' : 'bg-red-500/12 text-red-500'}`}>
              {results.passed ? "You've unlocked the next module and earned +30 XP." : 'You need at least 70% to pass. Review the video and try again.'}
            </div>

            <div className="mt-6 max-h-64 space-y-3 overflow-y-auto text-left">
              {results.results.map((result, index) => (
                <div key={`${result.question}-${index}`} className={`rounded-[1.4rem] border p-4 ${result.is_correct ? 'border-[var(--brand-green)]/20 bg-[var(--brand-green)]/8' : 'border-red-500/20 bg-red-500/8'}`}>
                  <p className="font-semibold">{result.question}</p>
                  <p className={`mt-2 text-sm ${result.is_correct ? 'text-[var(--brand-green)]' : 'text-red-500'}`}>Your answer: {result.user_answer || '(No answer)'}</p>
                  {!result.is_correct ? <p className="mt-1 text-sm text-[var(--brand-green)]">Correct answer: {result.correct_answer}</p> : null}
                  <p className="mt-2 text-xs leading-6 text-[var(--text-secondary)]">{result.explanation}</p>
                </div>
              ))}
            </div>

            <button type="button" onClick={onClose} className="btn-primary mt-6 w-full">
              {results.passed ? 'Back to Roadmap' : 'Close Quiz'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default QuizModal

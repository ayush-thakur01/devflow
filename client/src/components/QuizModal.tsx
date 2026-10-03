import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, XCircle, RotateCcw, Sparkles } from 'lucide-react'
import api from '../services/api'
import Button from './ui/Button'

const QuizModal = ({ isOpen, onClose, noteId, noteContent }) => {
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(false)

  const startQuiz = async () => {
    setLoading(true)
    setQuestions([])
    setCurrent(0)
    setSelected(null)
    setShowAnswer(false)
    setScore(0)
    setCompleted(false)
    try {
      const res = await api.post('/ai/generate-quiz', { noteId, content: noteContent })
      setQuestions(res.data.data.questions || [])
    } catch {}
    finally { setLoading(false) }
  }

  const handleAnswer = (idx) => {
    if (showAnswer) return
    setSelected(idx)
    setShowAnswer(true)
    if (idx === questions[current].correctIndex) setScore(s => s + 1)
  }

  const nextQuestion = () => {
    if (current + 1 >= questions.length) {
      setCompleted(true)
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setShowAnswer(false)
    }
  }

  const resetQuiz = () => {
    setCurrent(0)
    setSelected(null)
    setShowAnswer(false)
    setScore(0)
    setCompleted(false)
    startQuiz()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="fixed inset-0 bg-surface-950/80 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-md rounded-2xl border border-surface-700/50 bg-surface-900 shadow-2xl shadow-black/50 overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-800/50">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-brand-400" />
                <h2 className="text-sm font-semibold text-white">AI Quiz</h2>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800/40 transition">
                <X size={16} />
              </button>
            </div>

            <div className="p-5">
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 rounded-full border-2 border-surface-600 border-t-brand-400 animate-spin mx-auto" />
                  <p className="text-xs text-surface-500 mt-3">Generating quiz questions...</p>
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-surface-400 mb-4">Generate quiz questions from your note content</p>
                  <Button onClick={startQuiz} size="sm"><Sparkles size={14} /> Generate Quiz</Button>
                </div>
              ) : completed ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                    score / questions.length >= 0.7 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-amber-500/10 border border-amber-500/20'
                  }`}>
                    <span className="text-2xl font-bold text-white">{score}/{questions.length}</span>
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">
                    {score / questions.length >= 0.7 ? 'Great job!' : 'Keep practicing!'}
                  </p>
                  <p className="text-xs text-surface-500 mb-4">You got {score} out of {questions.length} correct</p>
                  <Button onClick={resetQuiz} size="sm" variant="secondary"><RotateCcw size={13} /> Try Again</Button>
                </motion.div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] text-surface-500 font-medium">Question {current + 1} of {questions.length}</span>
                    <span className="text-[10px] text-brand-400 font-medium">Score: {score}</span>
                  </div>
                  <div className="h-1 rounded-full bg-surface-800 mb-4">
                    <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
                  </div>

                  <p className="text-sm text-surface-200 font-medium mb-4">{questions[current].question}</p>

                  <div className="space-y-2 mb-4">
                    {questions[current].options.map((opt, idx) => {
                      let cls = 'border-surface-800/50 hover:border-surface-700 hover:bg-surface-800/30'
                      if (showAnswer) {
                        if (idx === questions[current].correctIndex) cls = 'border-emerald-500/30 bg-emerald-500/5'
                        else if (idx === selected) cls = 'border-rose-500/30 bg-rose-500/5'
                      } else if (idx === selected) {
                        cls = 'border-brand-500/30 bg-brand-500/5'
                      }
                      return (
                        <button key={idx} onClick={() => handleAnswer(idx)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition ${cls}`}>
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-md bg-surface-800/50 flex items-center justify-center text-[10px] font-medium text-surface-400 flex-shrink-0">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="text-surface-300">{opt}</span>
                            {showAnswer && idx === questions[current].correctIndex && <CheckCircle size={14} className="text-emerald-400 ml-auto flex-shrink-0" />}
                            {showAnswer && idx === selected && idx !== questions[current].correctIndex && <XCircle size={14} className="text-rose-400 ml-auto flex-shrink-0" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {showAnswer && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-surface-800/30 border border-surface-800/30 mb-4">
                      <p className="text-[10px] text-surface-400">{questions[current].explanation}</p>
                    </motion.div>
                  )}

                  {showAnswer && (
                    <div className="flex justify-end">
                      <Button onClick={nextQuestion} size="sm">
                        {current + 1 >= questions.length ? 'Finish' : 'Next Question'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default QuizModal

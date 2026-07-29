import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, MessageSquare, AlertCircle, Bot, User, Sparkles, Code2, HelpCircle } from 'lucide-react'
import api, { streamFromApi } from '../services/api'
import MarkdownRenderer from '../components/MarkdownRenderer'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import QuizModal from '../components/QuizModal'
import CodeReviewModal from '../components/CodeReviewModal'

const MentorPage = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your DevFlow AI Mentor. I can see your learning paths and study goals. Ask me anything!", timestamp: new Date() },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [streamingMessage, setStreamingMessage] = useState('')
  const [activeRoadmap, setActiveRoadmap] = useState(null)
  const [quizOpen, setQuizOpen] = useState(false)
  const [codeReviewOpen, setCodeReviewOpen] = useState(false)
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/learning-paths')
        const paths = res.data.data.learningPaths || []
        if (paths.length > 0) setActiveRoadmap(paths.find(p => p.status === 'in-progress') || paths[0])
      } catch {}
    }
    fetch()
  }, [])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, streamingMessage])
  useEffect(() => { inputRef.current?.focus() }, [])

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input
    if (!text.trim()) return
    if (!textToSend) setInput('')
    const userMsg = { role: 'user', content: text, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    setError('')
    setStreamingMessage('')
    const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
    let assistantContent = ''
    streamFromApi('/ai/mentor/stream', { question: text, history, roadmapId: activeRoadmap?._id || null },
      (chunk) => { assistantContent += chunk; setStreamingMessage(assistantContent) },
      () => { setMessages(prev => [...prev, { role: 'assistant', content: assistantContent, timestamp: new Date() }]); setStreamingMessage(''); setLoading(false) },
      (errMsg) => { setError(errMsg || 'Failed to get response.'); setStreamingMessage(''); setLoading(false) }
    )
  }

  const quickPrompts = [
    { label: 'Avoid burnout', query: 'I feel overwhelmed. Strategies to avoid burnout?' },
    { label: 'Project ideas', query: 'Recommend a starter project based on my goals.' },
    { label: 'Study schedule', query: 'Help me plan a weekly study schedule.' },
  ]

  return (
    <div className="flex h-[calc(100vh-60px)] md:h-screen text-surface-200 overflow-hidden">
      <div className="hidden lg:flex w-64 border-r border-surface-800/40 bg-surface-950/80 flex-col p-5 space-y-5 flex-shrink-0 overflow-y-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-indigo-500 flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">AI Mentor</h2>
            <p className="text-[9px] uppercase tracking-wider text-brand-400 font-semibold">Goal-aware</p>
          </div>
        </div>

        {activeRoadmap ? (
          <Card padding={false} className="premium-hover">
            <div className="p-3.5 space-y-2">
              <span className="text-[9px] uppercase tracking-wider text-surface-500 font-semibold">Context</span>
              <p className="text-xs font-medium text-surface-200 truncate">{activeRoadmap.title}</p>
              <div className="flex justify-between text-[10px] text-surface-400 pt-2 border-t border-surface-800/40">
                <span>Progress</span>
                <span className="font-semibold text-brand-400">{activeRoadmap.progress}%</span>
              </div>
            </div>
          </Card>
        ) : (
          <Card padding={false} className="premium-hover">
            <div className="p-3.5 text-center">
              <p className="text-xs text-surface-500">No active roadmap. Build one in Roadmaps to get personalized answers!</p>
            </div>
          </Card>
        )}

        <div className="border-t border-surface-800/30 pt-4 space-y-3">
          <span className="text-[9px] uppercase tracking-wider text-surface-500 font-semibold">Quick Prompts</span>
          <div className="space-y-1.5">
            {quickPrompts.map((p, idx) => (
              <motion.button key={idx} whileHover={{ x: 3 }} onClick={() => handleSendMessage(p.query)} disabled={loading}
                className="premium-hover-light w-full text-left rounded-lg px-3 py-2 text-xs bg-surface-800/30 border border-surface-800/40 hover:border-brand-400/20 text-surface-400 hover:text-surface-200 transition-all disabled:opacity-50"
              >
                {p.label}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="border-t border-surface-800/30 pt-4 space-y-3">
          <span className="text-[9px] uppercase tracking-wider text-surface-500 font-semibold">AI Tools</span>
          <div className="space-y-1.5">
            <motion.button whileHover={{ x: 3 }} onClick={() => setQuizOpen(true)}
              className="premium-hover-light w-full text-left rounded-lg px-3 py-2 text-xs bg-surface-800/30 border border-surface-800/40 hover:border-brand-400/20 text-surface-400 hover:text-surface-200 transition-all flex items-center gap-2"
            >
              <HelpCircle size={13} /> Generate Quiz
            </motion.button>
            <motion.button whileHover={{ x: 3 }} onClick={() => setCodeReviewOpen(true)}
              className="premium-hover-light w-full text-left rounded-lg px-3 py-2 text-xs bg-surface-800/30 border border-surface-800/40 hover:border-brand-400/20 text-surface-400 hover:text-surface-200 transition-all flex items-center gap-2"
            >
              <Code2 size={13} /> Code Review
            </motion.button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-surface-950 flex flex-col h-full overflow-hidden">
        <header className="px-6 py-3 border-b border-surface-800/30 bg-surface-950/60 backdrop-blur flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
              <MessageSquare size={16} className="text-brand-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">Mentorship Chat</h1>
              <p className="text-[9px] uppercase tracking-wider text-surface-500 font-semibold">Goal & Progress Aware AI</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4 scrollbar-custom">
          <AnimatePresence initial={false}>
            {messages.map((m, idx) => {
              const isAI = m.role === 'assistant'
              return (
                <motion.div key={idx} initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                  <div className={`flex items-start gap-3 max-w-xl ${isAI ? '' : 'flex-row-reverse'}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isAI ? 'bg-brand-500/10 border border-brand-500/20' : 'bg-surface-800/60 border border-surface-700/40'}`}>
                      {isAI ? <Bot size={14} className="text-brand-400" /> : <User size={14} className="text-surface-400" />}
                    </div>
                    <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${isAI ? 'bg-surface-900/60 border border-surface-800/40 text-surface-200' : 'bg-brand-500/10 border border-brand-500/20 text-white'}`}>
                      {isAI ? <MarkdownRenderer content={m.content} /> : <p className="text-sm">{m.content}</p>}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          <AnimatePresence>
            {streamingMessage && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="flex items-start gap-3 max-w-xl">
                  <div className="w-7 h-7 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                    <Bot size={14} className="text-brand-400" />
                  </div>
                  <div className="rounded-xl px-4 py-3 bg-surface-900/60 border border-surface-800/40 text-sm text-surface-200">
                    <MarkdownRenderer content={streamingMessage} />
                  </div>
                </div>
              </motion.div>
            )}

            {loading && !streamingMessage && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="flex items-start gap-3 max-w-xl">
                  <div className="w-7 h-7 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                    <Bot size={14} className="text-brand-400" />
                  </div>
                  <div className="rounded-xl px-4 py-3 bg-surface-900/60 border border-surface-800/40 flex items-center gap-1.5">
                    {[0, 1, 2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-surface-500 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />)}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 flex items-center gap-2 text-xs text-rose-400">
              <AlertCircle size={14} /><span>{error}</span>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 md:p-5 bg-surface-950/80 border-t border-surface-800/30 flex-shrink-0">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(input) }} className="relative flex items-center">
            <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask your mentor a question..." disabled={loading}
              className="w-full rounded-xl border border-surface-800/50 bg-surface-900/50 pl-4 pr-14 py-3 text-sm text-surface-200 placeholder-surface-500/60 outline-none transition focus:border-brand-400/30 disabled:opacity-50"
            />
            <Button type="submit" disabled={loading || !input.trim()} size="sm" className="absolute right-1.5 !p-2 !rounded-lg"><Send size={14} /></Button>
          </form>
        </div>
      </div>

      <QuizModal isOpen={quizOpen} onClose={() => setQuizOpen(false)} />
      <CodeReviewModal isOpen={codeReviewOpen} onClose={() => setCodeReviewOpen(false)} />
    </div>
  )
}

export default MentorPage

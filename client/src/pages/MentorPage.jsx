import { useState, useEffect, useRef } from 'react'
import { Send, Sparkles, MessageSquare, AlertCircle } from 'lucide-react'
import api from '../services/api'
import MarkdownRenderer from '../components/MarkdownRenderer'

const MentorPage = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am your DevFlow AI Mentor. I'm aware of your learning paths and study goals. How can I help you accelerate your learning today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeRoadmap, setActiveRoadmap] = useState(null)
  
  const chatEndRef = useRef(null)

  const fetchActiveRoadmap = async () => {
    try {
      const response = await api.get('/learning-paths')
      const paths = response.data.data.learningPaths || []
      if (paths.length > 0) {
        // Find most recently updated path
        const active = paths.find(p => p.status === 'in-progress') || paths[0]
        setActiveRoadmap(active)
      }
    } catch (err) {
      // Ignore context loading failure
    }
  }

  useEffect(() => {
    fetchActiveRoadmap()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input
    if (!text.trim()) return

    if (!textToSend) setInput('')
    
    // Add user message
    const userMsg = { role: 'user', content: text, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    
    setLoading(true)
    setError('')

    try {
      // Assemble message history for context
      const history = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content,
      }))

      const response = await api.post('/ai/mentor', {
        question: text,
        history,
        roadmapId: activeRoadmap?._id || null,
      })

      const reply = response.data.data.answer
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: reply, timestamp: new Date() },
      ])
    } catch (err) {
      setError('AI Mentor was unable to respond. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const quickPrompts = [
    { label: '🔥 How to avoid burnout?', query: 'I am feeling overwhelmed with study. What are strategies to avoid burnout?' },
    { label: '🚀 Recommend a project idea', query: 'Can you recommend a starter project idea based on my current learning goals?' },
    { label: '📅 Create study schedule', query: 'Help me plan a weekly study schedule to optimize my learning efficiency.' },
  ]

  return (
    <div className="flex h-[calc(100vh-60px)] md:h-screen text-slate-200 overflow-hidden">
      {/* Mentor Details & Quick Prompts Sidebar */}
      <div className="hidden lg:flex w-72 border-r border-slate-900 bg-slate-950 flex-col p-6 space-y-6 flex-shrink-0 overflow-y-auto">
        <div className="flex items-center gap-2.5 text-sky-400">
          <Sparkles size={20} className="animate-pulse" />
          <h2 className="text-base font-bold text-white">AI Mentor</h2>
        </div>

        {/* Active Context Card */}
        {activeRoadmap ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold block">Roadmap Context</span>
            <span className="text-xs font-bold text-white block leading-snug truncate">{activeRoadmap.title}</span>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-850">
              <span>Goal Progress:</span>
              <span className="font-extrabold text-sky-400">{activeRoadmap.progress}%</span>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-850/60 bg-slate-900/10 p-4 text-center">
            <p className="text-xs text-slate-500">No active roadmap context yet. Build one in Roadmaps to customize answers!</p>
          </div>
        )}

        <div className="border-t border-slate-900 pt-5 space-y-3.5">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Quick Prompts</span>
          <div className="space-y-2">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.query)}
                disabled={loading}
                className="w-full text-left rounded-xl p-3 text-xs bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-300 hover:text-white transition-all disabled:opacity-50"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Pane */}
      <div className="flex-1 bg-slate-950 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="px-6 py-4.5 border-b border-slate-900/80 bg-slate-950/40 backdrop-blur flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <MessageSquare size={18} />
            </div>
            <div>
              <h1 className="font-bold text-base text-white">Mentorship Chat</h1>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Goal &amp; Progress Aware AI</p>
            </div>
          </div>
        </header>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {messages.map((m, idx) => {
            const isAI = m.role === 'assistant'
            return (
              <div key={idx} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-2xl rounded-3xl p-5 border text-sm leading-relaxed ${
                    isAI
                      ? 'bg-slate-900/40 border-slate-900 text-slate-200'
                      : 'bg-sky-500/10 border-sky-500/20 text-white'
                  }`}
                >
                  {isAI ? (
                    <MarkdownRenderer content={m.content} />
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              </div>
            )
          })}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-3xl p-4 bg-slate-900/40 border border-slate-900 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-650 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 rounded-full bg-slate-650 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 rounded-full bg-slate-650 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          {error && (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 flex items-center gap-3 text-rose-400 text-xs">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-slate-950/60 border-t border-slate-900/80 flex-shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your mentor a question..."
              disabled={loading}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 pl-4.5 pr-14 py-3.5 text-xs sm:text-sm text-slate-200 placeholder-slate-550 outline-none transition focus:border-sky-500 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 p-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-sky-500/10"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default MentorPage

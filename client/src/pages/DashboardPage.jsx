import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import useAuthStore from '../store/authStore'

const DashboardPage = () => {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10 sm:px-8 lg:px-12">
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-sky-300/80">DevFlow</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Welcome back{user ? `, ${user.firstName || user.username}` : ''}</h1>
          <p className="mt-3 max-w-2xl text-slate-400">Your workspace for learning, productivity, and AI-powered guidance.</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/30">
          <p className="text-sm text-slate-500">Next goal</p>
          <p className="mt-3 text-lg font-semibold text-white">Launch your first learning roadmap</p>
          <Link
            to="/dashboard"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            View roadmap <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-3">
        <article className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.35)]">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Today's Focus</p>
          <h2 className="mt-4 text-2xl font-semibold text-white">Study the AI roadmap</h2>
          <p className="mt-3 text-slate-400">Continue your progress with a structured plan generated just for you.</p>
        </article>

        <article className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.35)]">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Current streak</p>
          <p className="mt-4 text-5xl font-semibold text-white">0</p>
          <p className="mt-3 text-slate-400">Build momentum with daily learning sessions.</p>
        </article>

        <article className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.35)]">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Tasks</p>
          <p className="mt-4 text-5xl font-semibold text-white">0 / 0</p>
          <p className="mt-3 text-slate-400">Stay on top of your daily, weekly, and monthly goals.</p>
        </article>
      </section>
    </div>
  )
}

export default DashboardPage

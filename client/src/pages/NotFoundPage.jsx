import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-10">
      <div className="max-w-xl rounded-3xl border border-slate-800 bg-slate-900/90 p-10 text-center shadow-[0_24px_80px_rgba(15,23,42,0.45)]">
        <p className="text-sm uppercase tracking-[0.35em] text-sky-300/80">404</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">Page not found</h1>
        <p className="mt-4 text-slate-400">The page you are looking for may have moved or does not exist.</p>
        <Link
          to="/dashboard"
          className="mt-8 inline-flex rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
        >
          Go back to dashboard
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage

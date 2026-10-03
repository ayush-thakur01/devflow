import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if ((this.state as any).hasError) {
      return (
        <div className="min-h-screen bg-surface-950 text-surface-100 flex items-center justify-center px-4">
          <div className="glass-strong rounded-2xl p-8 shadow-modal text-center max-w-sm">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-rose-400" />
            </div>
            <h1 className="text-lg font-bold text-white">Something went wrong</h1>
            <p className="mt-2 text-xs text-surface-400">An unexpected error occurred. Please try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-400"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return (this.props as any).children
  }
}

export default ErrorBoundary

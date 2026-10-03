import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import ErrorBoundary from './components/ui/ErrorBoundary'
import ToastContainer from './components/ui/ToastContainer'
import { AmbientBackground } from './components/ui/AmbientBackground'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AmbientBackground />
        <div className="relative text-slate-100 min-h-screen" style={{ zIndex: 1 }}>
          <AppRoutes />
          <ToastContainer />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App

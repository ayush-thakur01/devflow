import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, CheckSquare, FileText, Map, MessageSquare, TrendingUp, LogOut, Menu, X, Flame, Search, User, Settings } from 'lucide-react'
import useAuthStore from '../store/authStore'
import SearchModal from '../components/SearchModal'
import { Dock } from '../components/ui/Dock'

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  { name: 'Notes', path: '/notes', icon: FileText },
  { name: 'Roadmaps', path: '/roadmaps', icon: Map },
  { name: 'Mentor', path: '/mentor', icon: MessageSquare },
  { name: 'Analytics', path: '/analytics', icon: TrendingUp },
]

const NavItem = ({ item, isActive, onClick }) => {
  const Icon = item.icon
  return (
    <Link to={item.path} onClick={onClick} className="relative block group">
      {isActive && (
        <motion.div
          layoutId="nav-active"
          className="absolute inset-0 rounded-xl bg-cyan-500/8 border border-cyan-500/15"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
      <div className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        isActive ? 'text-cyan-400' : 'text-surface-400 hover:text-surface-200'
      }`}>
        <Icon size={18} className={`transition-colors duration-200 ${isActive ? 'text-cyan-400' : 'text-surface-500 group-hover:text-cyan-400'}`} />
        <span>{item.name}</span>
      </div>
    </Link>
  )
}

const SidebarContent = ({ onNavClick }: { onNavClick?: () => void }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)
  const [searchOpen, setSearchOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#00cc6a] flex items-center justify-center shadow-lg shadow-[#00ff88]/20 ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
            <span className="font-bold text-white text-sm">D</span>
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">DevFlow</span>
            <span className="text-[9px] block uppercase tracking-[0.2em] text-[#00ff88] font-semibold mt-0.5">Workspace</span>
          </div>
        </Link>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <button
          onClick={() => setSearchOpen(true)}
          className="w-full flex items-center gap-2 rounded-xl border border-surface-800/50 bg-surface-900/50 px-3 py-2 text-xs text-surface-500 hover:border-surface-700 hover:text-surface-400 transition-all duration-200 text-left"
        >
          <Search size={14} />
          <span>Quick search...</span>
          <kbd className="ml-auto hidden sm:inline-flex items-center gap-0.5 rounded-md border border-surface-700/50 bg-surface-800/50 px-1.5 py-0.5 text-[10px] text-surface-500 font-mono">
            ⌘K
          </kbd>
        </button>
      </div>
      <SearchModal isOpen={searchOpen} onOpen={() => setSearchOpen(true)} onClose={() => setSearchOpen(false)} />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            isActive={location.pathname === item.path}
            onClick={onNavClick}
          />
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-surface-800/50">
        {user && (
          <div className="flex items-center gap-3 mb-3 px-3 py-2.5 rounded-xl bg-surface-800/30 border border-surface-700/30">
            <Link to="/profile" className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#00ff88] to-[#00cc6a] flex items-center justify-center font-bold text-white text-xs shadow-lg shadow-[#00ff88]/20 flex-shrink-0 hover:ring-2 hover:ring-[#00ff88]/30 transition">
              {user.username ? String(user.username).substring(0, 2).toUpperCase() : 'U'}
            </Link>
            <div className="flex-1 min-w-0">
              <Link to="/profile" className="text-xs font-semibold text-surface-200 truncate block hover:text-[#00ff88] transition">{String(user.firstName || user.username)}</Link>
              <p className="text-[10px] text-surface-500 truncate">{String(user.email || '')}</p>
            </div>
            <div className="flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/15 px-2 py-1 rounded-lg text-[11px] font-semibold">
              <Flame size={10} className="fill-amber-400" />
              <span>{Number(user.streak) || 0}</span>
            </div>
          </div>
        )}
        <div className="flex gap-1.5 mb-2">
          <Link to="/profile" className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-surface-400 hover:text-surface-200 hover:bg-surface-800/40 border border-transparent hover:border-surface-800/50 transition">
            <User size={13} /> Profile
          </Link>
          <Link to="/settings" className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-surface-400 hover:text-surface-200 hover:bg-surface-800/40 border border-transparent hover:border-surface-800/50 transition">
            <Settings size={13} /> Settings
          </Link>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-surface-400 transition-all duration-200 hover:bg-rose-500/5 hover:text-rose-400 hover:border-rose-500/10 border border-transparent"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  )
}

const DashboardLayout = ({ children }) => {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#0B0F19] flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r border-white/[0.04] bg-[#111827]/95 backdrop-blur-xl h-screen sticky top-0 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-5 py-3.5 bg-[#0B0F19]/90 backdrop-blur-xl border-b border-white/[0.04] sticky top-0 z-40">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center">
              <span className="font-bold text-white text-[10px]">D</span>
            </div>
            <span className="text-sm font-bold text-white">DevFlow</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg border border-surface-800 bg-surface-900 text-surface-400 hover:text-surface-200 transition"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </header>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="md:hidden fixed inset-0 z-50 flex"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="fixed inset-0 bg-surface-950/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
              <motion.aside
                className="relative w-64 bg-surface-950 h-full border-r border-surface-800/50 flex-col shadow-2xl shadow-black/50"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <SidebarContent onNavClick={() => setMobileOpen(false)} />
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>

        {/* macOS-style Dock navigation */}
        <div className="sticky bottom-0 z-40 flex justify-center pb-3 pt-2 bg-gradient-to-t from-surface-950 via-surface-950/95 to-transparent pointer-events-none">
          <div className="pointer-events-auto">
            <Dock
              items={navItems.map((item) => ({
                icon: <item.icon size={18} />,
                label: item.name,
                href: item.path,
                isActive: location.pathname === item.path,
              }))}
              magnification={1.5}
              distance={100}
              iconSize={36}
              gap={4}
              borderRadius={12}
              alwaysShowLabels={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout

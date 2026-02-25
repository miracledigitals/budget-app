import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Sun, Moon, LogOut, Layout } from 'lucide-react'
import { motion } from 'framer-motion'

export function Navbar() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="navbar glass" 
      aria-label="Main Navigation"
    >
      <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div className="brand-icon" style={{ 
          background: 'var(--primary)', 
          color: 'white', 
          padding: '0.5rem', 
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Layout size={20} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.2 }}>Budget Studio</span>
          <span className="date-badge" aria-hidden="true" style={{ fontSize: '0.7rem', opacity: 0.8 }}>Finances, beautifully</span>
        </div>
      </div>

      <div className="nav-actions">
        <button 
          className="btn-icon" 
          aria-label="Toggle theme" 
          onClick={toggleTheme}
          style={{ padding: '0.6rem' }}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        {user && (
          <div className="user-chip" aria-label="User">
            <span className="user-email" style={{ 
              whiteSpace: 'nowrap', 
              fontSize: '0.875rem', 
              fontWeight: 600,
              color: 'var(--text-main)' 
            }}>
              {user.email}
            </span>
            <button 
              className="btn-icon" 
              onClick={signOut} 
              aria-label="Logout"
              style={{ padding: '0.4rem', color: 'var(--text-muted)' }}
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </motion.header>
  )
}

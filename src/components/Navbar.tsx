import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

export function Navbar() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="navbar" aria-label="Main Navigation">
      <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Budget Studio</span>
        <span className="date-badge" aria-hidden="true">Finances, beautifully</span>
      </div>
      <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button className="btn-icon" aria-label="Toggle theme" onClick={toggleTheme}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        {user && (
          <span className="user-chip" aria-label="User">
            <span className="user-email" style={{ whiteSpace: 'nowrap' }}>{user.email}</span>
            <button className="btn-icon" onClick={signOut} aria-label="Logout">⎋</button>
          </span>
        )}
      </div>
    </header>
  )
}

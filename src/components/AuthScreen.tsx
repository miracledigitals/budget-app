import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, UserPlus, LogIn, AlertCircle, CheckCircle, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (isRegistering) {
        await signUp(email, password);
        setSuccess('Registration successful! Redirecting to dashboard...');
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-card"
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            background: 'var(--primary)',
            color: 'white',
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
            boxShadow: 'var(--shadow-md)'
          }}>
            <Layout size={28} />
          </div>
          <h1>{isRegistering ? 'Create Account' : 'Welcome Back'}</h1>
          <p className="auth-subtitle">{isRegistering ? 'Start managing your finances beautifully' : 'Sign in to access your dashboard'}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={14} /> Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={14} /> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="auth-message error"
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="auth-message success"
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              >
                <CheckCircle size={18} />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            className={`btn btn-${isRegistering ? 'primary' : 'primary'} btn-block`}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              padding: '1rem'
            }}
          >
            {loading ? (
              <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
            ) : (
              <>
                {isRegistering ? <UserPlus size={18} /> : <LogIn size={18} />}
                {isRegistering ? 'Create Account' : 'Sign In'}
              </>
            )}
          </button>
        </form>

        <button
          className="btn-switch"
          onClick={() => { setIsRegistering(!isRegistering); setError(''); setSuccess(''); }}
          style={{ transition: 'all 0.2s' }}
        >
          {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Register now"}
        </button>
      </motion.div>
    </div>
  );
}

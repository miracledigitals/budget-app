import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

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
        setSuccess('Registration successful! Check your email to confirm your account.');
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
      <div className="auth-card">
        <h1>{isRegistering ? 'Create Account' : 'Welcome Back'}</h1>
        <p className="auth-subtitle">{isRegistering ? 'Start managing your finances' : 'Please sign in'}</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <div className="auth-message error">{error}</div>}
          {success && <div className="auth-message success">{success}</div>}
          
          <button type="submit" className={`btn btn-${isRegistering ? 'success' : 'primary'} btn-block`} disabled={loading}>
            {loading ? 'Loading...' : isRegistering ? 'Register Now' : 'Sign In'}
          </button>
        </form>
        
        <button className="btn-switch" onClick={() => { setIsRegistering(!isRegistering); setError(''); setSuccess(''); }}>
          {isRegistering ? 'Have an account? Sign In' : "Don't have an account? Register"}
        </button>
      </div>
    </div>
  );
}

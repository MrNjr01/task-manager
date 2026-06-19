import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form onSubmit={handleSubmit} className="w-full max-w-sm p-8 border rounded-lg shadow-sm bg-card space-y-4">
        <h1 className="text-2xl font-bold text-center">Simple Task Manager</h1>
        <p className="text-center text-muted-foreground text-sm">Sign in to your account</p>
        {error && <p className="text-sm text-destructive text-center">{error}</p>}
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3 py-2 border rounded-md bg-background" placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 border rounded-md bg-background" placeholder="••••••••" />
        </div>
        <button type="submit" disabled={loading} className="w-full py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 disabled:opacity-50">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

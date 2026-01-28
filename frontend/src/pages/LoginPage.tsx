import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/atoms';
import { Button } from '../components/action';
import { Card } from '../components/display';
import { Stack } from '../components/layout';
import { Alert } from '../components/feedback';
import { IconVessel } from '../assets/icons';
import './LoginPage.css';

// No default/demo credentials — all values come from user input. Never commit test credentials.

export default function LoginPage() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/metrics', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username, password);
      navigate('/metrics', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="login-page">
        <div className="loading-fallback">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <Card variant="outlined" padding="lg" className="login-card">
          <Stack direction="column" gap="lg" align="center">
            <div className="login-header">
              <IconVessel size={48} className="login-icon" aria-hidden="true" />
              <h1 className="login-title">Porto do Açu Loading Dashboard</h1>
              <p className="login-subtitle">PRIO Offshore Logistics</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <Stack direction="column" gap="md">
                {error && (
                  <Alert severity="error" title="Login Failed">
                    {error}
                  </Alert>
                )}

                <Input
                  type="text"
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  disabled={loading}
                  aria-label="Username"
                />

                <Input
                  type="password"
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={loading}
                  aria-label="Password"
                />

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  disabled={loading || !username || !password}
                >
                  Sign In
                </Button>
              </Stack>
            </form>
          </Stack>
        </Card>
      </div>
    </div>
  );
}

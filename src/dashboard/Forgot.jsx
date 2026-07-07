import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLoading } from '../components/LoadingProvider';
export default function Forgot() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { withLoading } = useLoading();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    await withLoading(async () => {
      try {
        const response = await fetch('http://localhost:4000/reset-password', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Reset password failed');
        }

        setMessage(data.message || 'Password updated successfully.');
        navigate('/');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 540 }}>
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="card-title mb-3">Reset Password</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Enter your email</label>
              <input
                className="form-control"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">New password</label>
              <input
                className="form-control"
                type="password"
                placeholder="Enter the new password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <button className="btn btn-warning w-100" type="submit" disabled={loading}>
              {loading ? 'Updating password...' : 'Reset password'}
            </button>
          </form>
          {message && <div className="mt-3 text-success">{message}</div>}
          {error && <div className="mt-3 text-danger">{error}</div>}
          <p className="mt-3"><Link to="/">Back to login</Link></p>
        </div>
      </div>
    </div>
  );
}

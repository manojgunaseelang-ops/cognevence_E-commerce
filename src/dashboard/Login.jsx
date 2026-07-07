import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLoading } from '../components/LoadingProvider';
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { withLoading } = useLoading();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    await withLoading(async () => {
      try {
        const response = await fetch('http://localhost:4000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Login failed');
        const normalizedEmail = email.toLowerCase().trim();
        const token = data.token || null;
        if (!token) throw new Error('No token received from server');
        localStorage.setItem('wellStoreAuth', JSON.stringify({ email: normalizedEmail, token }));

        // Ask backend for current user using token to decide navigation (admin vs user)
        try {
          const meRes = await fetch('http://localhost:4000/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const meData = await meRes.json();
          const user = meData.user;
          if (user && user.isAdmin) navigate('/admin');
          else navigate('/home');
        } catch (e) {
          // Fallback: navigate to home
          navigate('/home');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });
  };
  return(
    <div className="container mt-5" style={{ maxWidth: 480 }}>
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="card-title mb-3">Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
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
              <label className="form-label">Password</label>
              <input
                className="form-control"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <button className="btn btn-primary w-100" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          {error && <div className="mt-3 text-danger">{error}</div>}
          <div className="mt-3">
            <small>Don't have an account? <Link to="/signup">Sign up</Link></small>
            <br />
            <small><Link to="/forgot">Forgot password?</Link></small>
          </div>
        </div>
      </div>
    </div>
  )
}
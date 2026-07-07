import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLoading } from '../components/LoadingProvider';

export default function Signup() {
  const [name, setName] = useState("");
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
        const response = await fetch("http://localhost:4000/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Signup failed");
        }

        navigate("/");
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
          <h2 className="card-title mb-3">Sign Up</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                className="form-control"
                type="text"
                placeholder="Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className="mb-3">
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
              <input
                className="form-control"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <button className="btn btn-success w-100" type="submit" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign up'}
            </button>
          </form>
          {error && <div className="mt-3 text-danger">{error}</div>}
          <p className="mt-3 mb-0">Already have an account? <Link to="/">Login</Link></p>
        </div>
      </div>
    </div>
  )
}

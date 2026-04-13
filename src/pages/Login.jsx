import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(form.email, form.password)
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      toast.success('Welcome back!')
      navigate('/portal')
    }
  }

  return (
    <div>
      <Navbar />
      <div className="page-wrap" style={{ maxWidth: 420, paddingTop: '3rem' }}>
        <div className="page-header" style={{ textAlign: 'center' }}>
          <h1>Patient Login</h1>
          <p>Access your appointments and prescriptions</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            {error && <p style={{ color: '#E24B4A', fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="divider" />
          <p style={{ fontSize: 13, color: '#6b7280', textAlign: 'center' }}>
            New patient?{' '}
            <Link to="/register" style={{ color: '#1D9E75', fontWeight: 500 }}>Create account →</Link>
          </p>
        </div>

        <div className="card" style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🔐</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500 }}>Admin / Doctor?</p>
            <p style={{ fontSize: 12, color: '#6b7280' }}>
              Use your admin credentials to access the{' '}
              <Link to="/admin" style={{ color: '#1D9E75' }}>Admin Panel</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

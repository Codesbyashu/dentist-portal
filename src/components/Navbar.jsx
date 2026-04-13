import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    toast.success('Signed out successfully')
    navigate('/')
  }

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid #e2e8e5',
      padding: '0 1rem',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1000,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🦷</span>
          <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: '1.1rem', color: '#1D9E75' }}>
            DentaCare
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user ? (
            <>
              <span style={{ fontSize: 13, color: '#6b7280' }}>
                {profile?.full_name || user.email}
              </span>
              {profile?.role === 'admin' ? (
                <Link to="/admin" className="btn btn-ghost" style={{ padding: '7px 14px' }}>
                  Admin Panel
                </Link>
              ) : (
                <Link to="/portal" className="btn btn-ghost" style={{ padding: '7px 14px' }}>
                  My Portal
                </Link>
              )}
              <button onClick={handleSignOut} className="btn btn-outline" style={{ padding: '7px 14px' }}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost" style={{ padding: '7px 14px' }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '7px 14px' }}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

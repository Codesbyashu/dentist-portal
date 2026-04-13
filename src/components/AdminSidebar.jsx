import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const links = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/appointments', label: 'Appointments', icon: '📅' },
  { to: '/admin/patients', label: 'Patients', icon: '👥' },
  { to: '/admin/prescriptions', label: 'Prescriptions', icon: '💊' },
]

export default function AdminSidebar() {
  const { pathname } = useLocation()
  const { profile } = useAuth()

  return (
    <aside style={{
      width: 200,
      background: '#fff',
      border: '1px solid #e2e8e5',
      borderRadius: 12,
      padding: '1rem',
      height: 'fit-content',
      flexShrink: 0,
    }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <p style={{ fontFamily: 'Fraunces, serif', color: '#1D9E75', fontWeight: 600 }}>Admin Panel</p>
        <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{profile?.full_name}</p>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {links.map(({ to, label, icon }) => {
          const active = pathname === to
          return (
            <Link
              key={to}
              to={to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: active ? 500 : 400,
                background: active ? '#E1F5EE' : 'transparent',
                color: active ? '#085041' : '#6b7280',
                transition: 'all 0.12s',
              }}
            >
              <span style={{ fontSize: 14 }}>{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

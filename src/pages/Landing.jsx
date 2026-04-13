import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'

const services = [
  { icon: '🦷', name: 'General Checkup', desc: 'Routine exams & cleanings' },
  { icon: '✨', name: 'Teeth Whitening', desc: 'Professional brightening' },
  { icon: '🦴', name: 'Root Canal', desc: 'Pain-free treatment' },
  { icon: '😁', name: 'Braces & Aligners', desc: 'Orthodontic solutions' },
  { icon: '🔬', name: 'X-Ray & Diagnosis', desc: 'Advanced imaging' },
  { icon: '🧹', name: 'Deep Cleaning', desc: 'Scaling & polishing' },
]

export default function Landing() {
  const { user, profile } = useAuth()

  return (
    <div>
      <Navbar />
      <div className="page-wrap">
        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #E1F5EE 0%, #B5D4F4 100%)',
          borderRadius: 16,
          padding: '2.5rem 2rem',
          marginBottom: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: '2rem', top: '50%', transform: 'translateY(-50%)', fontSize: '7rem', opacity: 0.12, pointerEvents: 'none' }}>🦷</div>
          <span style={{
            display: 'inline-block',
            background: '#1D9E75',
            color: '#fff',
            fontSize: 11,
            padding: '4px 12px',
            borderRadius: 20,
            marginBottom: '1rem',
            letterSpacing: '0.5px',
          }}>Trusted Dental Care</span>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2.2rem', color: '#085041', lineHeight: 1.2, marginBottom: '0.75rem' }}>
            Your smile,<br />our priority.
          </h1>
          <p style={{ color: '#0F6E56', fontSize: 15, marginBottom: '1.5rem', maxWidth: 420 }}>
            Book appointments, view prescriptions and manage your dental health — all in one place.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {user ? (
              <Link to={profile?.role === 'admin' ? '/admin' : '/book'} className="btn btn-primary">
                {profile?.role === 'admin' ? 'Go to Admin Panel' : 'Book Appointment'}
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">Book Appointment</Link>
                <Link to="/login" className="btn btn-outline">Patient Login</Link>
              </>
            )}
          </div>
        </div>

        {/* Services */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p className="section-title">Our Services</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            {services.map(s => (
              <div key={s.name} className="card" style={{ padding: '1rem' }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
                <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>{s.name}</p>
                <p style={{ fontSize: 12, color: '#6b7280' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor CTA */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>👨‍⚕️</div>
            <div>
              <p style={{ fontWeight: 500 }}>Dr. Anil Sharma — Chief Dentist</p>
              <p style={{ fontSize: 12, color: '#6b7280' }}>BDS, MDS · 15+ years experience · Available Mon–Sat</p>
            </div>
          </div>
          <Link to={user ? '/book' : '/register'} className="btn btn-primary">Book Now</Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: '1.5rem' }}>
          {[['500+', 'Happy Patients'], ['15+', 'Years Experience'], ['2', 'Expert Doctors']].map(([val, label]) => (
            <div key={label} className="card" style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'Fraunces, serif', fontSize: '1.8rem', color: '#1D9E75' }}>{val}</p>
              <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'

export default function PatientPortal() {
  const { user, profile } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  async function fetchData() {
    setLoading(true)
    const [apptRes, rxRes] = await Promise.all([
      supabase
        .from('appointments')
        .select('*, doctors(name, specialization)')
        .eq('patient_id', user.id)
        .order('appointment_date', { ascending: false }),
      supabase
        .from('prescriptions')
        .select('*, doctors(name)')
        .eq('patient_id', user.id)
        .order('issued_date', { ascending: false })
    ])
    setAppointments(apptRes.data || [])
    setPrescriptions(rxRes.data || [])
    setLoading(false)
  }

  const upcoming = appointments.filter(a => a.status === 'upcoming')
  const past = appointments.filter(a => a.status !== 'upcoming')

  if (loading) return <><Navbar /><div className="loading">Loading your portal...</div></>

  return (
    <div>
      <Navbar />
      <div className="page-wrap">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.6rem' }}>
              Welcome back, {profile?.full_name?.split(' ')[0] || 'Patient'} 👋
            </h1>
            <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Your dental health dashboard</p>
          </div>
          <Link to="/book" className="btn btn-primary">+ Book Appointment</Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: '1.5rem' }}>
          {[
            ['Total Visits', appointments.length],
            ['Upcoming', upcoming.length],
            ['Prescriptions', prescriptions.length],
          ].map(([label, value]) => (
            <div key={label} style={{ background: '#f8faf9', borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>{label}</p>
              <p style={{ fontSize: 22, fontWeight: 500, color: label === 'Upcoming' && value > 0 ? '#1D9E75' : '#1a1a1a' }}>{value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Appointments */}
          <div>
            <p className="section-title">Appointments</p>

            {upcoming.length === 0 && past.length === 0 ? (
              <div className="card empty-state">
                <p>No appointments yet.</p>
                <Link to="/book" style={{ color: '#1D9E75', fontSize: 13, marginTop: 8, display: 'inline-block' }}>Book your first →</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[...upcoming, ...past].slice(0, 6).map(appt => (
                  <div key={appt.id} className="card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: 14 }}>{appt.service}</p>
                      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                        {new Date(appt.appointment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' · '}{appt.appointment_time?.slice(0, 5)}
                        {appt.doctors && ` · ${appt.doctors.name}`}
                      </p>
                    </div>
                    <span className={`badge badge-${appt.status}`}>{appt.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prescriptions */}
          <div>
            <p className="section-title">Prescriptions</p>

            {prescriptions.length === 0 ? (
              <div className="card empty-state">
                <p>No prescriptions yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {prescriptions.map(rx => (
                  <div key={rx.id} className="card" style={{ padding: '12px 14px', display: 'flex', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#B5D4F4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>💊</div>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: 13 }}>{rx.medication}</p>
                      {rx.dosage && <p style={{ fontSize: 12, color: '#6b7280' }}>{rx.dosage}</p>}
                      {rx.instructions && <p style={{ fontSize: 12, color: '#6b7280' }}>{rx.instructions}</p>}
                      <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                        {rx.doctors?.name} · {new Date(rx.issued_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

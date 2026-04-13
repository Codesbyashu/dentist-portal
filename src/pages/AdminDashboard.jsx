import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import AdminSidebar from '../components/AdminSidebar'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, today: 0, patients: 0, pending: 0 })
  const [todayAppts, setTodayAppts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
    const [allAppts, todayRes, patients] = await Promise.all([
      supabase.from('appointments').select('id, status'),
      supabase.from('appointments').select('*, profiles(full_name, phone), doctors(name)').eq('appointment_date', todayStr).order('appointment_time'),
      supabase.from('profiles').select('id').eq('role', 'patient'),
    ])
    const total = allAppts.data?.length || 0
    const pending = allAppts.data?.filter(a => a.status === 'upcoming').length || 0
    setStats({ total, today: todayRes.data?.length || 0, patients: patients.data?.length || 0, pending })
    setTodayAppts(todayRes.data || [])
    setLoading(false)
  }

  if (loading) return <><Navbar /><div className="loading">Loading...</div></>

  return (
    <div>
      <Navbar />
      <div className="page-wrap">
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
          <AdminSidebar />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="page-header">
              <h1>Dashboard</h1>
              <p>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: '1.5rem' }}>
              {[
                ["Today's Appointments", stats.today, '#1D9E75'],
                ['Total Patients', stats.patients, null],
                ['Total Appointments', stats.total, null],
                ['Upcoming', stats.pending, '#BA7517'],
              ].map(([label, value, color]) => (
                <div key={label} style={{ background: '#f8faf9', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>{label}</p>
                  <p style={{ fontSize: 22, fontWeight: 500, color: color || '#1a1a1a' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Today's list */}
            <p className="section-title">Today's appointments</p>
            {todayAppts.length === 0 ? (
              <div className="card empty-state"><p>No appointments today.</p></div>
            ) : (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8e5' }}>
                      {['Patient', 'Time', 'Service', 'Status'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, color: '#6b7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {todayAppts.map((appt, i) => (
                      <tr key={appt.id} style={{ borderBottom: i < todayAppts.length - 1 ? '1px solid #e2e8e5' : 'none' }}>
                        <td style={{ padding: '10px 14px' }}>
                          <p style={{ fontWeight: 500 }}>{appt.profiles?.full_name || 'Patient'}</p>
                          <p style={{ fontSize: 11, color: '#9ca3af' }}>{appt.profiles?.phone}</p>
                        </td>
                        <td style={{ padding: '10px 14px' }}>{appt.appointment_time?.slice(0, 5)}</td>
                        <td style={{ padding: '10px 14px' }}>{appt.service}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span className={`badge badge-${appt.status}`}>{appt.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

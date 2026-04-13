import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import AdminSidebar from '../components/AdminSidebar'

export default function AdminPatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchPatients() }, [])

  async function fetchPatients() {
    const { data } = await supabase
      .from('profiles')
      .select('*, appointments(count)')
      .eq('role', 'patient')
      .order('created_at', { ascending: false })
    setPatients(data || [])
    setLoading(false)
  }

  const filtered = patients.filter(p =>
    p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  )

  if (loading) return <><Navbar /><div className="loading">Loading...</div></>

  return (
    <div>
      <Navbar />
      <div className="page-wrap">
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
          <AdminSidebar />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 10 }}>
              <div className="page-header" style={{ marginBottom: 0 }}>
                <h1>All Patients</h1>
                <p>{patients.length} registered patients</p>
              </div>
              <input
                placeholder="Search by name or phone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: 240, padding: '8px 12px' }}
              />
            </div>

            {filtered.length === 0 ? (
              <div className="card empty-state"><p>No patients found.</p></div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                {filtered.map(p => (
                  <div key={p.id} className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, fontSize: 13, color: '#0F6E56', flexShrink: 0 }}>
                        {p.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: 500, fontSize: 14 }}>{p.full_name || 'Unknown'}</p>
                        <p style={{ fontSize: 12, color: '#6b7280' }}>{p.phone || 'No phone'}</p>
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid #e2e8e5', paddingTop: 10, fontSize: 12, color: '#6b7280' }}>
                      <p>Registered: {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
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

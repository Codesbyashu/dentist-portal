import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import AdminSidebar from '../components/AdminSidebar'
import toast from 'react-hot-toast'

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [rxModal, setRxModal] = useState(null)
  const [rxForm, setRxForm] = useState({ medication: '', dosage: '', instructions: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchAppointments() }, [])

  async function fetchAppointments() {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, profiles(id, full_name, phone), doctors(id, name)')
      .order('appointment_date', { ascending: false })
    if (error) console.error('fetch error:', error)
    setAppointments(data || [])
    setLoading(false)
  }

  async function updateStatus(id, status) {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id)
    if (error) { toast.error('Failed to update'); return }
    toast.success('Marked as ' + status)
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  async function savePrescription(e) {
    e.preventDefault()
    if (!rxForm.medication.trim()) { toast.error('Enter medication name'); return }

    // Debug — log what we are sending
    console.log('Saving prescription:', {
      patient_id: rxModal?.profiles?.id,
      doctor_id: rxModal?.doctors?.id,
      appointment_id: rxModal?.id,
      medication: rxForm.medication,
    })

    if (!rxModal?.profiles?.id || !rxModal?.doctors?.id) {
      toast.error('Missing patient or doctor info — reload page and try again')
      return
    }

    setSaving(true)
    const { data, error } = await supabase.from('prescriptions').insert({
      patient_id: rxModal.profiles.id,
      doctor_id: rxModal.doctors.id,
      appointment_id: rxModal.id,
      medication: rxForm.medication,
      dosage: rxForm.dosage || null,
      instructions: rxForm.instructions || null,
      issued_date: rxModal.appointment_date,
    }).select()

    setSaving(false)
    console.log('Insert result:', { data, error })

    if (error) {
      toast.error('Error: ' + error.message)
    } else {
      toast.success('Prescription saved! ✅')
      setRxModal(null)
      setRxForm({ medication: '', dosage: '', instructions: '' })
    }
  }

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)

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
                <h1>All Appointments</h1>
                <p>{appointments.length} total</p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['all', 'upcoming', 'completed', 'cancelled'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} className="btn" style={{ padding: '6px 12px', fontSize: 12, background: filter === f ? '#1D9E75' : '#fff', color: filter === f ? '#fff' : '#6b7280', border: '1px solid ' + (filter === f ? '#1D9E75' : '#e2e8e5') }}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="card empty-state"><p>No appointments found.</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filtered.map(appt => (
                  <div key={appt.id} className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, fontSize: 13, color: '#0F6E56', flexShrink: 0 }}>
                          {appt.profiles?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: 500, fontSize: 14 }}>{appt.profiles?.full_name}</p>
                          <p style={{ fontSize: 12, color: '#6b7280' }}>
                            {new Date(appt.appointment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {' · '}{appt.appointment_time?.slice(0, 5)}
                            {' · '}{appt.service}
                            {' · '}{appt.doctors?.name}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span className={'badge badge-' + appt.status}>{appt.status}</span>
                        {appt.status !== 'completed' && (
                          <button onClick={() => updateStatus(appt.id, 'completed')} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid #e2e8e5', background: '#f0fff8', color: '#0F6E56', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                            Done
                          </button>
                        )}
                        {appt.status !== 'cancelled' && (
                          <button onClick={() => updateStatus(appt.id, 'cancelled')} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid #e2e8e5', background: '#fff0f0', color: '#E24B4A', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => { setRxModal(rxModal?.id === appt.id ? null : appt); setRxForm({ medication: '', dosage: '', instructions: '' }) }}
                          style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid #B5D4F4', background: rxModal?.id === appt.id ? '#185FA5' : '#E6F1FB', color: rxModal?.id === appt.id ? '#fff' : '#185FA5', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}
                        >
                          Add Rx
                        </button>
                      </div>
                    </div>

                    {rxModal?.id === appt.id && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #e2e8e5' }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#185FA5', marginBottom: 12 }}>
                          Prescription for {appt.profiles?.full_name}
                        </p>
                        <form onSubmit={savePrescription}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <div className="field">
                              <label>Medication *</label>
                              <input placeholder="e.g. Amoxicillin 500mg" value={rxForm.medication} onChange={e => setRxForm({ ...rxForm, medication: e.target.value })} required />
                            </div>
                            <div className="field">
                              <label>Dosage</label>
                              <input placeholder="e.g. 3x daily for 5 days" value={rxForm.dosage} onChange={e => setRxForm({ ...rxForm, dosage: e.target.value })} />
                            </div>
                            <div className="field" style={{ gridColumn: '1 / -1' }}>
                              <label>Instructions</label>
                              <input placeholder="e.g. Take after meals" value={rxForm.instructions} onChange={e => setRxForm({ ...rxForm, instructions: e.target.value })} />
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button type="submit" className="btn btn-primary" style={{ fontSize: 13 }} disabled={saving}>
                              {saving ? 'Saving...' : 'Save Prescription'}
                            </button>
                            <button type="button" className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => setRxModal(null)}>
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
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

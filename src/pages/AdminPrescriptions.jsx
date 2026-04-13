import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import AdminSidebar from '../components/AdminSidebar'
import toast from 'react-hot-toast'

export default function AdminPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_id: '',
    medication: '',
    dosage: '',
    instructions: '',
    issued_date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [rxRes, pRes, dRes, aRes] = await Promise.all([
      supabase.from('prescriptions').select('*, profiles(full_name), doctors(name), appointments(service, appointment_date)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name').eq('role', 'patient').order('full_name'),
      supabase.from('doctors').select('*'),
      supabase.from('appointments').select('id, service, appointment_date, profiles(full_name)').order('appointment_date', { ascending: false }).limit(50),
    ])
    setPrescriptions(rxRes.data || [])
    setPatients(pRes.data || [])
    setDoctors(dRes.data || [])
    setAppointments(aRes.data || [])
    if (pRes.data?.[0]) setForm(f => ({ ...f, patient_id: pRes.data[0].id }))
    if (dRes.data?.[0]) setForm(f => ({ ...f, doctor_id: dRes.data[0].id }))
    setLoading(false)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.medication.trim()) { toast.error('Please enter medication name'); return }
    setSaving(true)
    const payload = {
      patient_id: form.patient_id,
      doctor_id: form.doctor_id,
      appointment_id: form.appointment_id || null,
      medication: form.medication,
      dosage: form.dosage,
      instructions: form.instructions,
      issued_date: form.issued_date,
    }
    const { error } = await supabase.from('prescriptions').insert(payload)
    setSaving(false)
    if (error) {
      toast.error('Failed to save prescription')
    } else {
      toast.success('Prescription saved!')
      setShowForm(false)
      setForm(f => ({ ...f, medication: '', dosage: '', instructions: '', appointment_id: '' }))
      fetchAll()
    }
  }

  async function deletePrescription(id) {
    if (!confirm('Delete this prescription?')) return
    const { error } = await supabase.from('prescriptions').delete().eq('id', id)
    if (error) { toast.error('Failed to delete'); return }
    toast.success('Deleted')
    setPrescriptions(prev => prev.filter(p => p.id !== id))
  }

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
                <h1>Prescriptions</h1>
                <p>{prescriptions.length} total prescriptions</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
                {showForm ? '✕ Cancel' : '+ Add Prescription'}
              </button>
            </div>

            {/* Add Prescription Form */}
            {showForm && (
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontWeight: 500, marginBottom: '1rem', fontSize: 15 }}>New Prescription</p>
                <form onSubmit={handleSave}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="field">
                      <label>Patient</label>
                      <select value={form.patient_id} onChange={e => setForm({ ...form, patient_id: e.target.value })}>
                        {patients.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label>Doctor</label>
                      <select value={form.doctor_id} onChange={e => setForm({ ...form, doctor_id: e.target.value })}>
                        {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label>Linked Appointment (optional)</label>
                      <select value={form.appointment_id} onChange={e => setForm({ ...form, appointment_id: e.target.value })}>
                        <option value="">— None —</option>
                        {appointments.map(a => (
                          <option key={a.id} value={a.id}>
                            {a.profiles?.full_name} · {a.service} · {new Date(a.appointment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label>Issue Date</label>
                      <input type="date" value={form.issued_date} onChange={e => setForm({ ...form, issued_date: e.target.value })} />
                    </div>
                    <div className="field">
                      <label>Medication</label>
                      <input
                        placeholder="e.g. Amoxicillin 500mg"
                        value={form.medication}
                        onChange={e => setForm({ ...form, medication: e.target.value })}
                        required
                      />
                    </div>
                    <div className="field">
                      <label>Dosage</label>
                      <input
                        placeholder="e.g. 3x daily for 5 days"
                        value={form.dosage}
                        onChange={e => setForm({ ...form, dosage: e.target.value })}
                      />
                    </div>
                    <div className="field" style={{ gridColumn: '1 / -1' }}>
                      <label>Instructions</label>
                      <textarea
                        placeholder="e.g. Take after meals, avoid alcohol..."
                        value={form.instructions}
                        onChange={e => setForm({ ...form, instructions: e.target.value })}
                        rows={2}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Prescription'}
                  </button>
                </form>
              </div>
            )}

            {/* Prescriptions List */}
            {prescriptions.length === 0 ? (
              <div className="card empty-state"><p>No prescriptions added yet.</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {prescriptions.map(rx => (
                  <div key={rx.id} className="card" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#B5D4F4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>💊</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                        <div>
                          <p style={{ fontWeight: 500, fontSize: 14 }}>{rx.medication}</p>
                          {rx.dosage && <p style={{ fontSize: 13, color: '#374151', marginTop: 2 }}>{rx.dosage}</p>}
                          {rx.instructions && <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{rx.instructions}</p>}
                        </div>
                        <button onClick={() => deletePrescription(rx.id)} className="btn btn-danger" style={{ fontSize: 11, padding: '4px 10px', flexShrink: 0 }}>
                          Delete
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>
                          Patient: <span style={{ color: '#374151', fontWeight: 500 }}>{rx.profiles?.full_name}</span>
                        </span>
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>
                          By: <span style={{ color: '#374151' }}>{rx.doctors?.name}</span>
                        </span>
                        {rx.appointments && (
                          <span style={{ fontSize: 11, color: '#9ca3af' }}>
                            Visit: <span style={{ color: '#374151' }}>{rx.appointments.service} · {new Date(rx.appointments.appointment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                          </span>
                        )}
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>
                          Issued: {new Date(rx.issued_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
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

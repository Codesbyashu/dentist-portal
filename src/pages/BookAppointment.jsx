import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'

const SERVICES = ['General Checkup', 'Teeth Cleaning', 'Tooth Extraction', 'Root Canal', 'Teeth Whitening', 'Braces Consultation', 'X-Ray & Diagnosis', 'Deep Cleaning']
const TIME_SLOTS = ['09:00', '10:00', '10:30', '11:00', '12:00', '14:00', '15:00', '15:30', '16:00', '17:00']

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)
  return days
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function BookAppointment() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const today = new Date()

  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [service, setService] = useState(SERVICES[0])
  const [doctors, setDoctors] = useState([])
  const [doctorId, setDoctorId] = useState('')
  const [notes, setNotes] = useState('')
  const [takenSlots, setTakenSlots] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('doctors').select('*').then(({ data }) => {
      setDoctors(data || [])
      if (data?.[0]) setDoctorId(data[0].id)
    })
  }, [])

  useEffect(() => {
    if (selectedDay) fetchTakenSlots()
  }, [selectedDay, month, year, doctorId])

  async function fetchTakenSlots() {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    const { data } = await supabase
      .from('appointments')
      .select('appointment_time')
      .eq('appointment_date', dateStr)
      .eq('doctor_id', doctorId)
      .neq('status', 'cancelled')
    setTakenSlots((data || []).map(a => a.appointment_time.slice(0, 5)))
  }

  async function handleBook() {
    if (!selectedDay || !selectedTime) { toast.error('Please select a date and time'); return }
    setLoading(true)
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    const { error } = await supabase.from('appointments').insert({
      patient_id: user.id,
      doctor_id: doctorId,
      appointment_date: dateStr,
      appointment_time: selectedTime + ':00',
      service,
      notes,
      status: 'upcoming',
    })
    setLoading(false)
    if (error) {
      toast.error('Something went wrong. Please try again.')
    } else {
      toast.success('Appointment booked successfully!')
      navigate('/portal')
    }
  }

  const calendar = buildCalendar(year, month)
  const todayDate = today.getDate()
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1)
    setSelectedDay(null); setSelectedTime(null)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1)
    setSelectedDay(null); setSelectedTime(null)
  }

  const selectedDoctor = doctors.find(d => d.id === doctorId)
  const selectedDate = selectedDay
    ? `${selectedDay} ${MONTH_NAMES[month]} ${year}`
    : 'Not selected'

  return (
    <div>
      <Navbar />
      <div className="page-wrap">
        <div className="page-header">
          <h1>Book Appointment</h1>
          <p>Choose your preferred date, time and service</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Left: Calendar + Time */}
          <div className="card">
            {/* Calendar header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <button onClick={prevMonth} className="btn btn-ghost" style={{ padding: '4px 10px' }}>‹</button>
              <span style={{ fontWeight: 500, fontSize: 15 }}>{MONTH_NAMES[month]} {year}</span>
              <button onClick={nextMonth} className="btn btn-ghost" style={{ padding: '4px 10px' }}>›</button>
            </div>
            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <div key={i} style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', padding: '2px 0' }}>{d}</div>
              ))}
            </div>
            {/* Days */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: '1rem' }}>
              {calendar.map((day, i) => {
                if (!day) return <div key={i} />
                const isPast = isCurrentMonth && day < todayDate
                const isToday = isCurrentMonth && day === todayDate
                const isSelected = day === selectedDay
                return (
                  <button
                    key={i}
                    disabled={isPast}
                    onClick={() => { setSelectedDay(day); setSelectedTime(null) }}
                    style={{
                      textAlign: 'center',
                      padding: '6px 2px',
                      borderRadius: 6,
                      fontSize: 13,
                      border: isToday ? '1.5px solid #1D9E75' : 'none',
                      background: isSelected ? '#1D9E75' : 'transparent',
                      color: isSelected ? '#fff' : isPast ? '#d1d5db' : isToday ? '#1D9E75' : '#1a1a1a',
                      cursor: isPast ? 'not-allowed' : 'pointer',
                      fontFamily: 'DM Sans, sans-serif',
                    }}
                  >
                    {day}
                  </button>
                )
              })}
            </div>

            {/* Time slots */}
            <p className="section-title">Available Time Slots</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {TIME_SLOTS.map(slot => {
                const taken = takenSlots.includes(slot)
                const sel = selectedTime === slot
                return (
                  <button
                    key={slot}
                    disabled={taken || !selectedDay}
                    onClick={() => setSelectedTime(slot)}
                    style={{
                      padding: '7px',
                      border: sel ? '1.5px solid #1D9E75' : '1px solid #e2e8e5',
                      borderRadius: 7,
                      fontSize: 12,
                      textAlign: 'center',
                      cursor: taken || !selectedDay ? 'not-allowed' : 'pointer',
                      background: sel ? '#E1F5EE' : taken ? '#f9f9f9' : '#fff',
                      color: sel ? '#085041' : taken ? '#d1d5db' : '#6b7280',
                      textDecoration: taken ? 'line-through' : 'none',
                      fontFamily: 'DM Sans, sans-serif',
                      fontWeight: sel ? 500 : 400,
                    }}
                  >
                    {slot}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right: Details + Confirm */}
          <div className="card">
            <p className="section-title">Appointment Details</p>
            <div className="field">
              <label>Service</label>
              <select value={service} onChange={e => setService(e.target.value)}>
                {SERVICES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Doctor</label>
              <select value={doctorId} onChange={e => { setDoctorId(e.target.value); setSelectedTime(null) }}>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Notes (optional)</label>
              <textarea
                placeholder="e.g. upper left molar pain, sensitivity..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Summary */}
            <div style={{ background: '#f8faf9', borderRadius: 10, padding: '12px 14px', marginBottom: '1rem', fontSize: 13 }}>
              {[
                ['Service', service],
                ['Date', selectedDate],
                ['Time', selectedTime || 'Not selected'],
                ['Doctor', selectedDoctor?.name || '—'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#6b7280' }}>{label}</span>
                  <span style={{ fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={handleBook}
              disabled={loading || !selectedDay || !selectedTime}
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

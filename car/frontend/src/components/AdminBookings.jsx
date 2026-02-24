import React, { useEffect, useState } from 'react'
import { getAllBookings, updateBookingStatus } from '../api'

const adminStatuses = ['BOOKED', 'COMPLETED', 'CANCELLED']

export default function AdminBookings({ user }) {
  const [bookings, setBookings] = useState([])
  const [statusByBooking, setStatusByBooking] = useState({})

  const load = async () => {
    try {
      const data = await getAllBookings(user.id)
      setBookings(data)
      const next = {}
      data.forEach(b => {
        next[b.id] = b.status
      })
      setStatusByBooking(next)
    } catch (e) {
      alert(e.message)
    }
  }

  useEffect(() => { load() }, [user.id])

  const saveStatus = async (bookingId) => {
    try {
      await updateBookingStatus(bookingId, statusByBooking[bookingId], user.id)
      await load()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>All Bookings (Admin)</h2>
        <p className="muted">Review and manage platform reservations.</p>
      </div>

      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Car</th>
              <th>Start</th>
              <th>End</th>
              <th>Total</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{booking.userId}</td>
                <td>{booking.carId}</td>
                <td>{booking.startDate}</td>
                <td>{booking.endDate}</td>
                <td>₹{Number(booking.totalPrice).toFixed(2)}</td>
                <td>
                  <select
                    value={statusByBooking[booking.id] || booking.status}
                    onChange={(e) =>
                      setStatusByBooking({ ...statusByBooking, [booking.id]: e.target.value })
                    }
                  >
                    {adminStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <button className="primary-btn" onClick={() => saveStatus(booking.id)}>
                    Save
                  </button>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan="8" className="empty-cell">No bookings found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

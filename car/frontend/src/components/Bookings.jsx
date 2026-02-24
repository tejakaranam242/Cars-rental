import React, { useEffect, useState } from 'react'
import { getBookingsByUser, updateBookingStatus } from '../api'

export default function Bookings({ user, refreshKey }) {
  const [bookings, setBookings] = useState([])

  const load = async () => {
    try {
      setBookings(await getBookingsByUser(user.id))
    } catch (e) {
      alert(e.message)
    }
  }

  useEffect(() => { if (user) load() }, [user, refreshKey])

  const cancelBooking = async (bookingId) => {
    try {
      await updateBookingStatus(bookingId, 'CANCELLED', user.id)
      await load()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Your Booking History</h2>
        <p className="muted">Track all your reservations and statuses.</p>
      </div>

      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Car ID</th>
              <th>From</th>
              <th>To</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.carId}</td>
                <td>{b.startDate}</td>
                <td>{b.endDate}</td>
                <td>₹{Number(b.totalPrice).toFixed(2)}</td>
                <td>{b.status}</td>
                <td>
                  {b.status === 'BOOKED' ? (
                    <button className="secondary-btn" onClick={() => cancelBooking(b.id)}>Cancel</button>
                  ) : (
                    <span className="muted">-</span>
                  )}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-cell">No bookings yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

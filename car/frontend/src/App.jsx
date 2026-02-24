import React, { useState } from 'react'
import Cars from './components/Cars'
import Auth from './components/Auth'
import Bookings from './components/Bookings'
import AdminBookings from './components/AdminBookings'

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [bookingRefreshKey, setBookingRefreshKey] = useState(0)

  const handleLogin = (u) => {
    setUser(u)
    localStorage.setItem('user', JSON.stringify(u))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const refreshBookings = () => {
    setBookingRefreshKey(k => k + 1)
  }

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">Car Rental Booking Platform</p>
          <h1>HCL Car Rentals</h1>
        </div>
        <div className="topbar-actions">
          {user ? (
            <>
              <span className="chip">{user.name} ({user.role})</span>
              <button className="secondary-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Auth onLogin={handleLogin} />
          )}
        </div>
      </header>

      <main className="content">
        {user && (
          <>
            <Cars user={user} onBookingCreated={refreshBookings} />
            {user.role === 'CUSTOMER' && (
              <Bookings user={user} refreshKey={bookingRefreshKey} />
            )}
            {user.role === 'ADMIN' && (
              <AdminBookings user={user} />
            )}
          </>
        )}
        {!user && (
          <section className="panel">
            <h2>Customer Features</h2>
            <p className="muted">
              Register, view available cars by date, place bookings, and track booking history.
            </p>
            <h2>Admin Features</h2>
            <p className="muted">
              Add/update/delete cars and review all platform bookings from one dashboard.
            </p>
          </section>
        )}
      </main>
    </div>
  )
}

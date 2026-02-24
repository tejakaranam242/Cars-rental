import React, { useEffect, useState } from 'react'
import { addCar, createBooking, deleteCar, getCars, updateCar } from '../api'

function today() {
  return new Date().toISOString().split('T')[0]
}

function tomorrow() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

export default function Cars({ user, onBookingCreated }) {
  const isAdmin = user?.role === 'ADMIN'
  const isCustomer = user?.role === 'CUSTOMER'

  const [cars, setCars] = useState([])
  const [filters, setFilters] = useState({ startDate: today(), endDate: tomorrow() })
  const [carForm, setCarForm] = useState({ make: '', model: '', year: new Date().getFullYear(), color: '', rentalPricePerDay: '' })
  const [editingId, setEditingId] = useState(null)

  const load = async (nextFilters = filters) => {
    try {
      setCars(await getCars(nextFilters))
    } catch (e) {
      alert(e.message)
    }
  }

  useEffect(() => { load() }, [])

  const applyFilter = async (e) => {
    e.preventDefault()
    await load(filters)
  }

  const resetFilter = async () => {
    const defaultFilters = { startDate: '', endDate: '' }
    setFilters(defaultFilters)
    await load(defaultFilters)
  }

  const bookCar = async (carId) => {
    if (!isCustomer) return
    if (!filters.startDate || !filters.endDate) {
      alert('Select start and end dates before booking')
      return
    }
    try {
      await createBooking({
        userId: user.id,
        carId,
        startDate: filters.startDate,
        endDate: filters.endDate
      })
      alert('Booking created successfully')
      if (onBookingCreated) onBookingCreated()
      await load(filters)
    } catch (e) {
      alert(e.message)
    }
  }

  const submitCar = async (e) => {
    e.preventDefault()
    if (!isAdmin) return
    const payload = {
      ...carForm,
      year: Number(carForm.year),
      rentalPricePerDay: Number(carForm.rentalPricePerDay)
    }
    try {
      if (editingId) {
        await updateCar(editingId, payload, user.id)
      } else {
        await addCar(payload, user.id)
      }
      setCarForm({ make: '', model: '', year: new Date().getFullYear(), color: '', rentalPricePerDay: '' })
      setEditingId(null)
      await load(filters)
    } catch (e) {
      alert(e.message)
    }
  }

  const startEdit = (car) => {
    setEditingId(car.id)
    setCarForm({
      make: car.make,
      model: car.model,
      year: car.year,
      color: car.color || '',
      rentalPricePerDay: car.rentalPricePerDay
    })
  }

  const removeCar = async (id) => {
    if (!window.confirm('Delete this car?')) return
    try {
      await deleteCar(id, user.id)
      await load(filters)
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Available Cars</h2>
        <p className="muted">Choose dates to see cars you can book right now.</p>
      </div>

      <form className="grid-form compact" onSubmit={applyFilter}>
        <label>
          Start Date
          <input
            type="date"
            value={filters.startDate}
            onChange={e => setFilters({ ...filters, startDate: e.target.value })}
          />
        </label>
        <label>
          End Date
          <input
            type="date"
            value={filters.endDate}
            onChange={e => setFilters({ ...filters, endDate: e.target.value })}
          />
        </label>
        <div className="inline-actions">
          <button className="primary-btn" type="submit">Check Availability</button>
          <button type="button" className="secondary-btn" onClick={resetFilter}>Show All</button>
        </div>
      </form>

      <div className="car-grid">
        {cars.map(car => (
          <article key={car.id} className="car-card">
            <p className="pill">#{car.id}</p>
            <h3>{car.make} {car.model}</h3>
            <p>{car.year} • {car.color || 'N/A color'}</p>
            <p className="price">₹{Number(car.rentalPricePerDay).toFixed(2)} / day</p>
            {isCustomer && (
              <button className="primary-btn" onClick={() => bookCar(car.id)}>Book Car</button>
            )}
            {isAdmin && (
              <div className="inline-actions">
                <button className="secondary-btn" onClick={() => startEdit(car)}>Edit</button>
                <button className="danger-btn" onClick={() => removeCar(car.id)}>Delete</button>
              </div>
            )}
          </article>
        ))}
      </div>

      {isAdmin && (
        <div className="admin-box">
          <h3>{editingId ? `Update Car #${editingId}` : 'Add New Car'}</h3>
          <form className="grid-form" onSubmit={submitCar}>
            <label>
              Make
              <input
                placeholder="Toyota"
                value={carForm.make}
                onChange={e => setCarForm({ ...carForm, make: e.target.value })}
                required
              />
            </label>
            <label>
              Model
              <input
                placeholder="Innova"
                value={carForm.model}
                onChange={e => setCarForm({ ...carForm, model: e.target.value })}
                required
              />
            </label>
            <label>
              Year
              <input
                type="number"
                value={carForm.year}
                onChange={e => setCarForm({ ...carForm, year: e.target.value })}
                required
              />
            </label>
            <label>
              Color
              <input
                placeholder="White"
                value={carForm.color}
                onChange={e => setCarForm({ ...carForm, color: e.target.value })}
              />
            </label>
            <label>
              Price Per Day
              <input
                type="number"
                step="0.01"
                value={carForm.rentalPricePerDay}
                onChange={e => setCarForm({ ...carForm, rentalPricePerDay: e.target.value })}
                required
              />
            </label>
            <div className="inline-actions">
              <button className="primary-btn" type="submit">{editingId ? 'Update Car' : 'Add Car'}</button>
              {editingId && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    setEditingId(null)
                    setCarForm({ make: '', model: '', year: new Date().getFullYear(), color: '', rentalPricePerDay: '' })
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </section>
  )
}

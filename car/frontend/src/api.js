import axios from 'axios'

const api = axios.create({ baseURL: '/' })

function parseError(error) {
  const message =
    error?.response?.data?.message ||
    error?.response?.data ||
    error?.message ||
    'Request failed'
  throw new Error(message)
}

function withUserHeader(userId) {
  return { headers: { 'X-USER-ID': String(userId) } }
}

export async function register(user) {
  try {
    return (await api.post('/api/auth/register', user)).data
  } catch (error) {
    parseError(error)
  }
}

export async function login(credentials) {
  try {
    return (await api.post('/api/auth/login', credentials)).data
  } catch (error) {
    parseError(error)
  }
}

export async function getCars(filters = {}) {
  try {
    const params = {}
    if (filters.startDate && filters.endDate) {
      params.startDate = filters.startDate
      params.endDate = filters.endDate
    }
    return (await api.get('/api/cars', { params })).data
  } catch (error) {
    parseError(error)
  }
}

export async function addCar(car, adminUserId) {
  try {
    return (await api.post('/api/cars', car, withUserHeader(adminUserId))).data
  } catch (error) {
    parseError(error)
  }
}

export async function updateCar(id, car, adminUserId) {
  try {
    return (await api.put(`/api/cars/${id}`, car, withUserHeader(adminUserId))).data
  } catch (error) {
    parseError(error)
  }
}

export async function deleteCar(id, adminUserId) {
  try {
    await api.delete(`/api/cars/${id}`, withUserHeader(adminUserId))
  } catch (error) {
    parseError(error)
  }
}

export async function createBooking(payload) {
  try {
    return (await api.post('/api/bookings', payload)).data
  } catch (error) {
    parseError(error)
  }
}

export async function getBookingsByUser(id) {
  try {
    return (await api.get(`/api/bookings/user/${id}`)).data
  } catch (error) {
    parseError(error)
  }
}

export async function getAllBookings(adminUserId) {
  try {
    return (await api.get('/api/bookings', withUserHeader(adminUserId))).data
  } catch (error) {
    parseError(error)
  }
}

export async function updateBookingStatus(id, status, actorUserId) {
  try {
    return (await api.put(`/api/bookings/${id}`, { status, actorUserId })).data
  } catch (error) {
    parseError(error)
  }
}

export default api

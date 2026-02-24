import React, { useState } from 'react'
import { register, login } from '../api'

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const submit = async (e) => {
    e.preventDefault()
    try {
      const data =
        mode === 'login'
          ? await login({ email: form.email, password: form.password })
          : await register(form)
      onLogin(data)
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <section className="auth-card">
      <h2>{mode === 'login' ? 'Welcome Back' : 'Create Your Account'}</h2>
      <p className="muted">
        {mode === 'login'
          ? 'Log in to book your next ride.'
          : 'Register as a customer to start booking cars.'}
      </p>
      <form onSubmit={submit}>
        {mode === 'register' && (
          <input
            placeholder="Full Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
        )}
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          required
        />
        <button type="submit" className="primary-btn">
          {mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>
      <button className="link-btn" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Login'}
      </button>
    </section>
  )
}

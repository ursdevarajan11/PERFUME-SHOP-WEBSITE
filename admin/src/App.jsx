import React, { useEffect, useState } from 'react'
import Navbar from './Components/Navbar/Navbar'
import Admin from './Components/Pages/Admin/Admin'
import { getApiUrl } from './config'

const App = () => {
  const [access, setAccess] = useState('checking')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(getApiUrl('/auth/status'), { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) return false
        const data = await response.json()
        return data.isAdmin
      })
      .then((isAdmin) => setAccess(isAdmin ? 'admin' : 'signed-out'))
      .catch((requestError) => {
        console.error('Could not verify admin session:', requestError)
        setAccess('signed-out')
      })
  }, [])

  const login = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const response = await fetch(getApiUrl('/login'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (!response.ok || !data.isAdmin) {
        setError(data.errors || 'This account is not authorized to administer the shop.')
        await fetch(getApiUrl('/logout'), { method: 'POST', credentials: 'include' })
        return
      }
      setAccess('admin')
    } catch (requestError) {
      console.error('Admin login failed:', requestError)
      setError('Unable to reach the backend. Please try again.')
    }
  }

  const logout = async () => {
    try {
      await fetch(getApiUrl('/logout'), { method: 'POST', credentials: 'include' })
    } catch (requestError) {
      console.error('Admin logout failed:', requestError)
    } finally {
      setAccess('signed-out')
      setPassword('')
    }
  }

  if (access === 'checking') return <p role="status">Checking admin session...</p>

  if (access !== 'admin') {
    return (
      <main style={{ maxWidth: 420, margin: '10vh auto', padding: 24 }}>
        <h1>Admin sign in</h1>
        <form onSubmit={login}>
          <label htmlFor="admin-email">Email</label>
          <input id="admin-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
          <label htmlFor="admin-password">Password</label>
          <input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          {error && <p role="alert">{error}</p>}
          <button type="submit">Sign in</button>
        </form>
      </main>
    )
  }

  return (
    <div>
      <Navbar/>
      <Admin/>
      <button type="button" onClick={logout}>Sign out</button>
    </div>
  )
}

export default App

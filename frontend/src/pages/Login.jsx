import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Login.module.css'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function handleLogin() {
    setError('')

    if (!username || !password) {
      setError('Por favor, preencha todos os campos.')
      return
    }

    setLoading(true)

    // Simula delay de autenticação
    setTimeout(() => {
      if (username === 'admin' && password === 'admin') {
        localStorage.setItem('auth', 'true')
        window.location.href = '/'
      } else {
        setError('Usuário ou senha incorretos.')
        setLoading(false)
      }
    }, 500)
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Login</h1>

        <div className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="username">Insira a sua conta de trabalho:</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder=""
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Insira a senha:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder=""
              disabled={loading}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            className={styles.btnEntrar}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </div>

        <div className={styles.divider}>Continue de outra forma:</div>

        <div className={styles.socialButtons}>
          <button className={styles.socialBtn} style={{ background: 'white' }} disabled>
            <span style={{ fontSize: '28px', color: '#4285f4', fontWeight: 'bold' }}>G</span>
          </button>
          <button className={styles.socialBtn} style={{ background: '#1877f2' }} disabled>
            <span style={{ fontSize: '28px', color: 'white', fontWeight: 'bold' }}>f</span>
          </button>
          <button className={styles.socialBtn} style={{ background: '#0d5f5f' }} disabled />
          <button className={styles.socialBtn} style={{ background: '#0d5f5f' }} disabled />
        </div>

        <div className={styles.logoEdenred}>
          <img src="/images/logored.svg" alt="Edenred" />
        </div>
      </div>
    </div>
  )
}

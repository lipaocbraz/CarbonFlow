import { Link, useLocation, useNavigate } from 'react-router-dom'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('auth')
    navigate('/login')
  }

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.navbarLogo}>
        <img
          src="/images/logo.png"
          alt="CarbonFlow"
          style={{ height: 32 }}
          onError={e => { e.target.style.display = 'none' }}
        />
      </Link>
      <div className={styles.navbarLinks}>
        <Link
          to="/tabela-dados"
          className={pathname === '/tabela-dados' ? styles.navbarLinkActive : ''}
        >
          Resultados
        </Link>
        <a href="#">Suporte</a>
        <a href="#">Config</a>
        <button onClick={handleLogout} className={styles.navbarLogout}>
          Sair
        </button>
      </div>
    </nav>
  )
}

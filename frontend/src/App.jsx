import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Tabela_dados from './pages/Tabela_dados'
import Suporte from './pages/Suporte'
import Configuracoes from './pages/Configuracoes'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const auth = localStorage.getItem('auth')
    setIsAuthenticated(!!auth)
    setLoading(false)

    // Listener para mudanças no localStorage
    const handleStorageChange = () => {
      const updatedAuth = localStorage.getItem('auth')
      setIsAuthenticated(!!updatedAuth)
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Carregando...</div>
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
      <Route path="/tabela-dados" element={isAuthenticated ? <Tabela_dados /> : <Navigate to="/login" />} />
      <Route path="/suporte" element={isAuthenticated ? <Suporte /> : <Navigate to="/login" />} />
      <Route path="/configuracoes" element={isAuthenticated ? <Configuracoes /> : <Navigate to="/login" />} />
      <Route path="/relatorios-exportaveis" element={isAuthenticated ? <div /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} />} />
    </Routes>
  )
}
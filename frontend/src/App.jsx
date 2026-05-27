import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Tabela_dados from './pages/Tabela_dados'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tabela-dados" element={<Tabela_dados />} />
      <Route path="/relatorios-exportaveis" element={<div />} />
    </Routes>
  )
}
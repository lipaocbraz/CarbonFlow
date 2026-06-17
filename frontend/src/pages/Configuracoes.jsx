import { useState } from 'react'
import Navbar from '../components/Navbar'
import styles from './Configuracoes.module.css'

const IDIOMAS = ['Português', 'English', 'Deutsch', 'Espanhol']

const FATORES_EMISSAO = [
  { categoria: 'Voucher em papel',                 tipo: 'Físico',  valor: '4,50 g CO₂e/un' },
  { categoria: 'Cartão de benefício plástico',     tipo: 'Físico',  valor: '25,00 g CO₂e/un' },
  { categoria: 'Extrato impresso (correio)',        tipo: 'Físico',  valor: '3,40 g CO₂e/un' },
  { categoria: 'Correspondência postal',           tipo: 'Físico',  valor: '12,00 g CO₂e/un' },
  { categoria: 'Voucher digital (app/plataforma)', tipo: 'Digital', valor: '0,036 g CO₂e/un' },
  { categoria: 'Cartão virtual (token digital)',   tipo: 'Digital', valor: '0,010 g CO₂e/un' },
  { categoria: 'Transação via aplicativo mobile',  tipo: 'Digital', valor: '0,017 g CO₂e/un' },
  { categoria: 'Extrato digital (e-mail/push)',    tipo: 'Digital', valor: '0,001 g CO₂e/un' },
]

const USUARIOS = [
  { nome: 'Gabriela de Andrade', cargo: 'Administradora' },
  { nome: 'Rodrigo Carvalho',    cargo: 'Acesso administrativo' },
  { nome: 'Marcelha Nunes',      cargo: 'Fazer simulações básicas' },
  { nome: 'Fernanda Alves',      cargo: 'Visualizar resultados' },
  { nome: 'Guilherme Araujo',    cargo: 'Exportar dados' },
  { nome: 'Maria da Silva',      cargo: 'Visualizar resultados' },
  { nome: 'Destane Hein',        cargo: 'Exportar dados' },
]

function initials(nome) {
  return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function loadEmpresa() {
  try { return JSON.parse(localStorage.getItem('cf_empresa') || '{}') } catch { return {} }
}

export default function Configuracoes() {
  const [aba, setAba] = useState('acessibilidade')

  const [modoEscuro, setModoEscuro] = useState(
    () => localStorage.getItem('darkMode') === 'true'
  )
  const [tamanhoFonte, setTamanhoFonte] = useState(60)
  const [dislexia, setDislexia] = useState(true)
  const [idioma, setIdioma] = useState('Português')

  const empresaInit = loadEmpresa()
  const [cnpj, setCnpj]           = useState(empresaInit.cnpj           ?? '')
  const [cnae, setCnae]           = useState(empresaInit.cnae           ?? '')
  const [setor, setSetor]         = useState(empresaInit.setor         ?? '')
  const [porte, setPorte]         = useState(empresaInit.porte         ?? '')
  const [colaboradores, setColaboradores] = useState(empresaInit.colaboradores ?? '')

  function salvarEmpresa() {
    localStorage.setItem('cf_empresa', JSON.stringify({ cnpj, cnae, setor, porte, colaboradores }))
  }

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.container}>

          <div className={styles.tabBar}>
            <button
              className={`${styles.tabBtn} ${aba === 'acessibilidade' ? styles.tabBtnActive : ''}`}
              onClick={() => setAba('acessibilidade')}
            >
              Acessibilidade
            </button>
            <button
              className={`${styles.tabBtn} ${aba === 'ajuste' ? styles.tabBtnActive : ''}`}
              onClick={() => setAba('ajuste')}
            >
              Ajuste
            </button>
          </div>

          {aba === 'acessibilidade' && (
            <>
              <h2 className={styles.title}>Opções de acessibilidade</h2>

              <div className={styles.optionRow}>
                <span className={styles.optionLabel}>Modo escuro</span>
                <button
                  className={`${styles.toggle} ${modoEscuro ? styles.toggleOn : ''}`}
                  onClick={() => {
                    const next = !modoEscuro
                    setModoEscuro(next)
                    localStorage.setItem('darkMode', next)
                    document.documentElement.classList.toggle('dark', next)
                  }}
                  aria-checked={modoEscuro}
                  role="switch"
                >
                  <span className={styles.toggleThumb} />
                </button>
              </div>

              <div className={styles.optionRow}>
                <span className={styles.optionLabel}>Tamanho da fonte</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={tamanhoFonte}
                  onChange={e => setTamanhoFonte(Number(e.target.value))}
                  className={styles.slider}
                />
              </div>

              <div className={styles.optionRow}>
                <span className={styles.optionLabel}>Dislexia</span>
                <button
                  className={`${styles.toggle} ${dislexia ? styles.toggleOn : ''}`}
                  onClick={() => setDislexia(v => !v)}
                  aria-checked={dislexia}
                  role="switch"
                >
                  <span className={styles.toggleThumb} />
                </button>
              </div>

              <div className={`${styles.optionRow} ${styles.optionRowIdioma}`}>
                <span className={styles.optionLabel}>Idioma</span>
                <div className={styles.idiomaGroup}>
                  {IDIOMAS.map(lang => (
                    <button
                      key={lang}
                      className={`${styles.idiomaBtn} ${idioma === lang ? styles.idiomaBtnActive : ''}`}
                      onClick={() => setIdioma(lang)}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {aba === 'ajuste' && (
            <div className={styles.ajusteContent}>

              {/* Dados da empresa */}
              <div className={styles.ajusteSection}>
                <div className={styles.ajusteSectionHeader}>Dados da empresa</div>
                <div className={styles.empresaGrid}>
                  <div className={styles.empresaField}>
                    <label className={styles.empresaLabel}>CNPJ</label>
                    <input
                      className={styles.empresaInput}
                      value={cnpj}
                      onChange={e => setCnpj(e.target.value)}
                      placeholder="XX.XXX.XXX/XXXX-XX"
                      onBlur={salvarEmpresa}
                    />
                  </div>
                  <div className={styles.empresaField}>
                    <label className={styles.empresaLabel}>CNAE</label>
                    <input
                      className={styles.empresaInput}
                      value={cnae}
                      onChange={e => setCnae(e.target.value)}
                      placeholder="Código CNAE"
                      onBlur={salvarEmpresa}
                    />
                  </div>
                  <div className={styles.empresaField}>
                    <label className={styles.empresaLabel}>Setor de atuação</label>
                    <input
                      className={styles.empresaInput}
                      value={setor}
                      onChange={e => setSetor(e.target.value)}
                      placeholder="Ex: Benefícios corporativos"
                      onBlur={salvarEmpresa}
                    />
                  </div>
                  <div className={styles.empresaField}>
                    <label className={styles.empresaLabel}>Porte da empresa</label>
                    <input
                      className={styles.empresaInput}
                      value={porte}
                      onChange={e => setPorte(e.target.value)}
                      placeholder="Ex: Médio porte"
                      onBlur={salvarEmpresa}
                    />
                  </div>
                  <div className={`${styles.empresaField} ${styles.empresaFieldFull}`}>
                    <label className={styles.empresaLabel}>Quantidade de colaboradores</label>
                    <input
                      className={styles.empresaInput}
                      type="number"
                      min="0"
                      value={colaboradores}
                      onChange={e => setColaboradores(e.target.value)}
                      placeholder="0"
                      onBlur={salvarEmpresa}
                    />
                  </div>
                </div>
              </div>

              {/* Fatores de emissão */}
              <div className={styles.ajusteSection}>
                <div className={styles.ajusteSectionHeader}>Fatores de emissão</div>
                <div className={styles.tabelaWrapper}>
                  <table className={styles.tabela}>
                    <thead>
                      <tr>
                        <th>Categoria</th>
                        <th>Tipo</th>
                        <th>Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {FATORES_EMISSAO.map((f, i) => (
                        <tr key={i}>
                          <td>{f.categoria}</td>
                          <td>
                            <span className={`${styles.tipoBadge} ${f.tipo === 'Digital' ? styles.tipoBadgeDigital : ''}`}>
                              {f.tipo}
                            </span>
                          </td>
                          <td className={styles.tabelaValor}>{f.valor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Usuários e permissões */}
              <div className={styles.ajusteSection}>
                <div className={styles.ajusteSectionHeader}>Usuários e permissões</div>
                <div className={styles.usuariosList}>
                  {USUARIOS.map((u, i) => (
                    <div key={i} className={styles.usuarioItem}>
                      <div className={styles.usuarioAvatar}>{initials(u.nome)}</div>
                      <div className={styles.usuarioInfo}>
                        <div className={styles.usuarioNome}>{u.nome}</div>
                        <div className={styles.usuarioCargo}>{u.cargo}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </>
  )
}

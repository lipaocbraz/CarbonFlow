import { useState } from 'react'
import Navbar from '../components/Navbar'
import styles from './Configuracoes.module.css'

const IDIOMAS = ['Português', 'English', 'Deutsch', 'Espanhol']

export default function Configuracoes() {
  const [modoEscuro, setModoEscuro] = useState(false)
  const [tamanhoFonte, setTamanhoFonte] = useState(60)
  const [dislexia, setDislexia] = useState(true)
  const [idioma, setIdioma] = useState('Português')

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.container}>
          <h2 className={styles.title}>Opções de acessibilidade</h2>

          <div className={styles.optionRow}>
            <span className={styles.optionLabel}>Modo escuro</span>
            <button
              className={`${styles.toggle} ${modoEscuro ? styles.toggleOn : ''}`}
              onClick={() => setModoEscuro(v => !v)}
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

        </div>
      </div>
    </>
  )
}

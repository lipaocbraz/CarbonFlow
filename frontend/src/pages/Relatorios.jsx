import { useState } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'
import styles from './Relatorios.module.css'

export default function Relatorios() {
  const [gerandoRelatorio, setGerandoRelatorio] = useState(false)
  const [erroRelatorio, setErroRelatorio] = useState('')

  async function baixarPDF() {
    setErroRelatorio('')
    const raw = sessionStorage.getItem('cf_h2')
    if (!raw) {
      setErroRelatorio('Nenhum cálculo comparativo encontrado. Volte à página inicial e realize uma comparação de emissões.')
      return
    }
    const resultadoComp = JSON.parse(raw)
    setGerandoRelatorio(true)
    try {
      const response = await api.post(
        '/emissions/report',
        {
          physicalOperationType: resultadoComp.physicalOperationType,
          physicalQuantity: resultadoComp.physicalQuantity,
          digitalOperationType: resultadoComp.digitalOperationType,
          digitalQuantity: resultadoComp.digitalQuantity,
        },
        { responseType: 'blob' }
      )
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'relatorio-carbonflow.pdf')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch {
      setErroRelatorio('Não foi possível gerar o relatório. Verifique se o backend está em execução.')
    } finally {
      setGerandoRelatorio(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <h1 className={styles.title}>Relatórios exportáveis</h1>

        <div className={styles.grid}>
          {/* Card PDF */}
          <div className={styles.cardWrapper}>
            <div className={styles.card}>
              <img
                src="/images/relatorio_exemplo.png"
                alt="Prévia do relatório PDF"
                className={styles.previewImg}
              />
            </div>
            <button
              className={styles.btn}
              onClick={baixarPDF}
              disabled={gerandoRelatorio}
            >
              {gerandoRelatorio ? 'Gerando...' : 'PDF'}
            </button>
            {erroRelatorio && (
              <div className={styles.erro}>{erroRelatorio}</div>
            )}
          </div>

          {/* Card Planilha */}
          <div className={styles.cardWrapper}>
            <div className={`${styles.card} ${styles.cardBlue}`} />
            <button className={styles.btn} disabled>
              Planilha editável
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

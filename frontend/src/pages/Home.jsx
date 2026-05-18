import { useState } from 'react'
import api from '../services/api'
import styles from './Home.module.css'

const OPERACOES_FISICAS = [
  { value: 'VOUCHER_PAPEL', label: 'Voucher em papel' },
  { value: 'CARTAO_PLASTICO', label: 'Cartão de benefício plástico' },
  { value: 'EXTRATO_IMPRESSO', label: 'Extrato impresso (enviado por correio)' },
  { value: 'CORRESPONDENCIA_POSTAL', label: 'Correspondência postal' },
]

const OPERACOES_DIGITAIS = [
  { value: 'VOUCHER_DIGITAL', label: 'Voucher digital (app / plataforma online)' },
  { value: 'CARTAO_VIRTUAL', label: 'Cartão virtual (token digital)' },
  { value: 'TRANSACAO_APP', label: 'Transação via aplicativo mobile' },
  { value: 'EXTRATO_DIGITAL', label: 'Extrato digital (email / push)' },
]

function formatarEmissoes(kgCO2e) {
  if (kgCO2e >= 1) return kgCO2e.toFixed(4) + ' kg CO₂e'
  if (kgCO2e >= 0.001) return (kgCO2e * 1000).toFixed(4) + ' g CO₂e'
  return (kgCO2e * 1000000).toFixed(2) + ' mg CO₂e'
}

export default function Home() {
  const [tipoProduto, setTipoProduto] = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [peso, setPeso] = useState('')
  const [tipoTransacao, setTipoTransacao] = useState('fisico')
  const [operacaoFisica, setOperacaoFisica] = useState('')
  const [operacaoDigital, setOperacaoDigital] = useState('')
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const operationType = tipoTransacao === 'fisico' ? operacaoFisica : operacaoDigital
  const transactionType = tipoTransacao === 'fisico' ? 'FISICO' : 'DIGITAL'

  async function calcular() {
    setErro('')
    setResultado(null)

    if (!tipoProduto) { setErro('Selecione o tipo de produto.'); return }
    if (!quantidade || quantidade < 1) { setErro('Informe uma quantidade válida (mínimo 1).'); return }
    if (!operationType) { setErro('Selecione o tipo de operação de entrega / transação.'); return }

    setCarregando(true)
    try {
      const { data } = await api.post('/emissions/calculate', {
        transactionType,
        operationType,
        quantity: Number(quantidade),
      })
      setResultado(data)
    } catch (e) {
      setErro(e.response?.data?.message || 'Não foi possível conectar ao servidor. Verifique se o backend está em execução.')
    } finally {
      setCarregando(false)
    }
  }

  function trocarTransacao(tipo) {
    setTipoTransacao(tipo)
    setResultado(null)
    setErro('')
  }

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navbarLogo}>
          <img
            src="/images/logo.png"
            alt="CarbonFlow"
            style={{ height: 32 }}
            onError={e => { e.target.style.display = 'none' }}
          />
          CarbonFlow
        </div>
        <div className={styles.navbarLinks}>
          <a href="#">Resultados</a>
          <a href="#">Suporte</a>
          <a href="#">Config</a>
        </div>
      </nav>

      <div className={styles.main}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Calculadora de impacto ambiental por operação</div>

          <div className={styles.sectionLabel}>Dados do produto</div>

          <div className={styles.field}>
            <label htmlFor="tipo-produto">Tipo de produto</label>
            <select
              id="tipo-produto"
              value={tipoProduto}
              onChange={e => setTipoProduto(e.target.value)}
            >
              <option value="">Selecione...</option>
              <option value="Livro">Livro</option>
              <option value="Eletrônico">Eletrônico</option>
              <option value="Roupa">Roupa</option>
              <option value="Alimento">Alimento</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="quantidade">Quantidade</label>
              <input
                id="quantidade"
                type="number"
                min="1"
                value={quantidade}
                onChange={e => setQuantidade(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="peso">Peso estimado (kg)</label>
              <input
                id="peso"
                type="number"
                min="0"
                step="0.01"
                placeholder="ex: 0.5"
                value={peso}
                onChange={e => setPeso(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.sectionLabel}>Meio de entrega / transação</div>

          <div className={styles.tabs}>
            <div
              className={`${styles.tab} ${tipoTransacao === 'fisico' ? styles.active : ''}`}
              onClick={() => trocarTransacao('fisico')}
            >
              Físico
            </div>
            <div
              className={`${styles.tab} ${tipoTransacao === 'digital' ? styles.active : ''}`}
              onClick={() => trocarTransacao('digital')}
            >
              Digital
            </div>
          </div>

          {tipoTransacao === 'fisico' && (
            <div className={styles.field}>
              <label htmlFor="operacao-fisica">Tipo de operação física</label>
              <select
                id="operacao-fisica"
                value={operacaoFisica}
                onChange={e => setOperacaoFisica(e.target.value)}
              >
                <option value="">Selecione...</option>
                {OPERACOES_FISICAS.map(op => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
            </div>
          )}

          {tipoTransacao === 'digital' && (
            <div className={styles.field}>
              <label htmlFor="operacao-digital">Tipo de operação digital</label>
              <select
                id="operacao-digital"
                value={operacaoDigital}
                onChange={e => setOperacaoDigital(e.target.value)}
              >
                <option value="">Selecione...</option>
                {OPERACOES_DIGITAIS.map(op => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
            </div>
          )}

          <button
            className={styles.btnCalc}
            onClick={calcular}
            disabled={carregando}
          >
            {carregando ? 'Calculando...' : 'Calcular emissões'}
          </button>

          {resultado && (
            <div className={styles.resultArea}>
              <div className={styles.resultTitle}>Resultado do cálculo</div>
              <hr className={styles.resultDivider} />
              <div className={styles.resultGrid}>
                <div>
                  <div className={styles.resultLabel}>Produto</div>
                  <div className={styles.resultDesc}>{tipoProduto}</div>
                </div>
                <div>
                  <div className={styles.resultLabel}>Peso estimado</div>
                  <div className={styles.resultDesc}>{peso ? `${peso} kg` : '—'}</div>
                </div>
                <div>
                  <div className={styles.resultLabel}>Operação</div>
                  <div className={styles.resultDesc}>{resultado.description}</div>
                </div>
                <div>
                  <div className={styles.resultLabel}>Quantidade</div>
                  <div className={styles.resultDesc}>{resultado.quantity} unidade(s)</div>
                </div>
              </div>
              <hr className={styles.resultDivider} />
              <div className={styles.resultLabel}>Emissões totais estimadas</div>
              <div className={styles.resultValue}>{formatarEmissoes(resultado.emissionsKgCO2e)}</div>
              <div className={styles.resultNote}>{resultado.emissionsKgCO2e.toFixed(8)} kg CO₂e (valor exato)</div>
            </div>
          )}

          {erro && (
            <div className={styles.errorArea}>{erro}</div>
          )}
        </div>
      </div>
    </>
  )
}

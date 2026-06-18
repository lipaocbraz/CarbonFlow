import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import styles from './Home.module.css'
import Navbar from '../components/Navbar'

const MESES_LABELS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const MESES_SHORT  = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const ANO_ATUAL = new Date().getFullYear()
const ANOS = [ANO_ATUAL - 1, ANO_ATUAL, ANO_ATUAL + 1]

const CATEGORIAS_OPERACAO = [
  { value: 'VOUCHER', label: 'Voucher' },
  { value: 'CARTAO', label: 'Cartão de benefício' },
  { value: 'EXTRATO', label: 'Extrato' },
  { value: 'CORRESPONDENCIA', label: 'Correspondência / Transação' },
]


function salvarHistorico(entry) {
  const prev = JSON.parse(localStorage.getItem('cf_history') || '[]')
  const updated = [...prev.filter(e => e.period !== entry.period), entry]
    .sort((a, b) => a.period.localeCompare(b.period))
  localStorage.setItem('cf_history', JSON.stringify(updated))
}

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

function formatarPeriodo(periodo) {
  const [ano, mes] = periodo.split('-')
  return `${MESES_LABELS[parseInt(mes, 10) - 1]}/${ano}`
}

function calcularNivelImpacto(kg) {
  if (kg < 0.1) {
    return {
      nivel: 'Baixo',
      cor: '#4ade80',
      percentual: Math.max((kg / 0.1) * 30, 4),
      mensagem: 'Esta operação tem impacto ambiental muito baixo. Equivale a atividades cotidianas de mínimo consumo energético.',
    }
  }
  if (kg < 1) {
    return {
      nivel: 'Médio',
      cor: '#fbbf24',
      percentual: 30 + ((kg - 0.1) / 0.9) * 40,
      mensagem: 'Esta operação tem impacto ambiental moderado. Pequenas mudanças de hábito ou a escolha por alternativas digitais podem ajudar a reduzir essas emissões.',
    }
  }
  return {
    nivel: 'Alto',
    cor: '#ff2d2d',
    percentual: Math.min(70 + ((kg - 1) / 9) * 30, 100),
    mensagem: 'Esta operação tem impacto ambiental significativo. Considere alternativas digitais ou compensações de carbono para reduzir sua pegada ambiental.',
  }
}

function gerarComparacoes(kg) {
  const kmCarro = kg / 0.21
  const cargasSmartphone = kg / 0.005
  const diasArvore = (kg / 21) * 365
  return [
    {
      icone: '🚗',
      valor: kmCarro < 0.1 ? `${(kmCarro * 1000).toFixed(0)} m` : `${kmCarro.toFixed(2)} km`,
      descricao: 'rodados de carro',
    },
    {
      icone: '📱',
      valor: cargasSmartphone < 1
        ? `${(cargasSmartphone * 100).toFixed(0)}% de uma carga`
        : `${cargasSmartphone.toFixed(1)} cargas`,
      descricao: 'de smartphone carregado',
    },
    {
      icone: '🌳',
      valor: diasArvore < 1 ? `${(diasArvore * 24).toFixed(1)} h` : `${diasArvore.toFixed(1)} dias`,
      descricao: 'de absorção de uma árvore',
    },
  ]
}

export default function Home() {
  const navigate = useNavigate()

  // --- História 1: Entrada de dados por período ---
  const [catPeriodo, setCatPeriodo] = useState('')
  const [qtdFisicaPeriodo, setQtdFisicaPeriodo] = useState('')
  const [qtdDigitalPeriodo, setQtdDigitalPeriodo] = useState('')
  const [periodo, setPeriodo] = useState('')
  const [resultadoPeriodo, setResultadoPeriodo] = useState(null)
  const [erroPeriodo, setErroPeriodo] = useState('')
  const [carregandoPeriodo, setCarregandoPeriodo] = useState(false)
  const [tocados, setTocados] = useState({})

  const errosCampos = {
    catPeriodo: !catPeriodo ? 'Selecione o tipo de operação.' : null,
    qtdFisicaPeriodo: qtdFisicaPeriodo === ''
      ? 'Informe o número de transações físicas.'
      : Number(qtdFisicaPeriodo) < 0 ? 'Valor deve ser zero ou maior.' : null,
    qtdDigitalPeriodo: qtdDigitalPeriodo === ''
      ? 'Informe o número de transações digitais.'
      : Number(qtdDigitalPeriodo) < 0 ? 'Valor deve ser zero ou maior.' : null,
    periodo: !periodo ? 'Selecione o período.' : null,
  }
  const formularioPeriodoValido = Object.values(errosCampos).every(v => v === null)

  function touch(campo) {
    setTocados(t => ({ ...t, [campo]: true }))
  }

  function fieldState(campo) {
    if (!tocados[campo]) return styles.field
    return errosCampos[campo] ? `${styles.field} ${styles.fieldInvalido}` : `${styles.field} ${styles.fieldValido}`
  }

  async function calcularPeriodo() {
    setTocados({ catPeriodo: true, qtdFisicaPeriodo: true, qtdDigitalPeriodo: true, periodo: true })
    if (!formularioPeriodoValido) return
    setErroPeriodo('')
    setResultadoPeriodo(null)
    setCarregandoPeriodo(true)
    try {
      const { data } = await api.post('/emissions/period', {
        operationCategory: catPeriodo,
        physicalQuantity: Number(qtdFisicaPeriodo),
        digitalQuantity: Number(qtdDigitalPeriodo),
        period: periodo,
      })
      setResultadoPeriodo(data)
    } catch (e) {
      setErroPeriodo(e.response?.data?.message || 'Não foi possível conectar ao servidor. Verifique se o backend está em execução.')
    } finally {
      setCarregandoPeriodo(false)
    }
  }

  // --- Calculadora por operação ---

  const [tipoProduto, setTipoProduto] = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [peso, setPeso] = useState('')
  const [tipoTransacao, setTipoTransacao] = useState('fisico')
  const [operacaoFisica, setOperacaoFisica] = useState('')
  const [operacaoDigital, setOperacaoDigital] = useState('')
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const [operacaoFisicaComp, setOperacaoFisicaComp] = useState('')
  const [qtdFisicaComp, setQtdFisicaComp] = useState(1)
  const [operacaoDigitalComp, setOperacaoDigitalComp] = useState('')
  const [qtdDigitalComp, setQtdDigitalComp] = useState(1)
  const [mesComp, setMesComp] = useState(new Date().getMonth() + 1)
  const [anoComp, setAnoComp] = useState(ANO_ATUAL)
  const [vezesNoMes, setVezesNoMes] = useState(1)
  const [resultadoComp, setResultadoComp] = useState(null)
  const [erroComp, setErroComp] = useState('')
  const [carregandoComp, setCarregandoComp] = useState(false)
  const [erroRelatorio, setErroRelatorio] = useState('')
  const [gerandoRelatorio, setGerandoRelatorio] = useState(false)

  const [formAberto, setFormAberto] = useState(false)

  const operationType = tipoTransacao === 'fisico' ? operacaoFisica : operacaoDigital
  const transactionType = tipoTransacao === 'fisico' ? 'FISICO' : 'DIGITAL'

  const historicoSalvo = JSON.parse(localStorage.getItem('cf_history') || '[]')
  const temResultado = resultado !== null || resultadoComp !== null || historicoSalvo.length > 0

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
      sessionStorage.setItem('cf_h1', JSON.stringify({ resultado: data, tipoProduto, peso, tipoTransacao }))
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

  async function comparar() {
    setErroComp('')
    setResultadoComp(null)
    if (!operacaoFisicaComp) { setErroComp('Selecione o tipo de operação física.'); return }
    if (!qtdFisicaComp || qtdFisicaComp < 1) { setErroComp('Informe uma quantidade física válida (mínimo 1).'); return }
    if (!operacaoDigitalComp) { setErroComp('Selecione o tipo de operação digital.'); return }
    if (!qtdDigitalComp || qtdDigitalComp < 1) { setErroComp('Informe uma quantidade digital válida (mínimo 1).'); return }
    setCarregandoComp(true)
    try {
      const { data } = await api.post('/emissions/compare', {
        physicalOperationType: operacaoFisicaComp,
        physicalQuantity: Number(qtdFisicaComp),
        digitalOperationType: operacaoDigitalComp,
        digitalQuantity: Number(qtdDigitalComp),
      })
      setResultadoComp(data)
      sessionStorage.setItem('cf_h2', JSON.stringify(data))
      const period = `${anoComp}-${String(mesComp).padStart(2, '0')}`
      salvarHistorico({
        period,
        label: `${MESES_SHORT[mesComp - 1]}/${anoComp}`,
        vezesNoMes: Number(vezesNoMes),
        physicalOperationType: data.physicalOperationType,
        physicalDescription: data.physicalDescription,
        physicalQuantity: data.physicalQuantity,
        digitalOperationType: data.digitalOperationType,
        digitalDescription: data.digitalDescription,
        digitalQuantity: data.digitalQuantity,
        physicalEmissionsKgCO2e: data.physicalEmissionsKgCO2e,
        digitalEmissionsKgCO2e: data.digitalEmissionsKgCO2e,
        avoidedCarbonKgCO2e: data.avoidedCarbonKgCO2e,
        totalPhysicalKgCO2e: data.physicalEmissionsKgCO2e * Number(vezesNoMes),
        totalDigitalKgCO2e: data.digitalEmissionsKgCO2e * Number(vezesNoMes),
        totalAvoidedKgCO2e: data.avoidedCarbonKgCO2e * Number(vezesNoMes),
      })
    } catch (e) {
      setErroComp(e.response?.data?.message || 'Não foi possível conectar ao servidor. Verifique se o backend está em execução.')
    } finally {
      setCarregandoComp(false)
    }
  }

  async function gerarRelatorio() {
    setErroRelatorio('')
    if (!resultadoComp) {
      setErroRelatorio('Nenhum cálculo comparativo foi realizado. Preencha os campos do comparador e clique em "Comparar emissões" antes de gerar o relatório.')
      return
    }
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
    } catch (e) {
      setErroRelatorio('Não foi possível gerar o relatório. Verifique se o backend está em execução e tente novamente.')
    } finally {
      setGerandoRelatorio(false)
    }
  }

  return (
    <>
      <Navbar />

      <div className={styles.main}>
        <div className={styles.layout}>

          {/* COLUNA ESQUERDA */}
          <div className={styles.leftCol}>

            {/* ── Entrada de dados por período (História 1) ── */}
            <div className={styles.card}>
              <div className={styles.cardTitle}>Entrada de dados por período</div>

              <div className={styles.sectionLabel}>Parâmetros da operação</div>

              <div className={fieldState('catPeriodo')}>
                <label htmlFor="cat-periodo">Tipo de operação</label>
                <select
                  id="cat-periodo"
                  value={catPeriodo}
                  onChange={e => { setCatPeriodo(e.target.value); touch('catPeriodo') }}
                  onBlur={() => touch('catPeriodo')}
                >
                  <option value="">Selecione...</option>
                  {CATEGORIAS_OPERACAO.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                {tocados.catPeriodo && errosCampos.catPeriodo && (
                  <span className={styles.fieldErroMsg}>{errosCampos.catPeriodo}</span>
                )}
                {tocados.catPeriodo && !errosCampos.catPeriodo && (
                  <span className={styles.fieldOkMsg}>✓ Dados registrados</span>
                )}
              </div>

              <div className={styles.row}>
                <div className={fieldState('qtdFisicaPeriodo')}>
                  <label htmlFor="qtd-fisica-periodo">Transações físicas</label>
                  <input
                    id="qtd-fisica-periodo"
                    type="number"
                    min="0"
                    placeholder="ex: 500"
                    value={qtdFisicaPeriodo}
                    onChange={e => { setQtdFisicaPeriodo(e.target.value); touch('qtdFisicaPeriodo') }}
                    onBlur={() => touch('qtdFisicaPeriodo')}
                  />
                  {tocados.qtdFisicaPeriodo && errosCampos.qtdFisicaPeriodo && (
                    <span className={styles.fieldErroMsg}>{errosCampos.qtdFisicaPeriodo}</span>
                  )}
                  {tocados.qtdFisicaPeriodo && !errosCampos.qtdFisicaPeriodo && (
                    <span className={styles.fieldOkMsg}>✓ Dados registrados</span>
                  )}
                </div>

                <div className={fieldState('qtdDigitalPeriodo')}>
                  <label htmlFor="qtd-digital-periodo">Transações digitais</label>
                  <input
                    id="qtd-digital-periodo"
                    type="number"
                    min="0"
                    placeholder="ex: 1200"
                    value={qtdDigitalPeriodo}
                    onChange={e => { setQtdDigitalPeriodo(e.target.value); touch('qtdDigitalPeriodo') }}
                    onBlur={() => touch('qtdDigitalPeriodo')}
                  />
                  {tocados.qtdDigitalPeriodo && errosCampos.qtdDigitalPeriodo && (
                    <span className={styles.fieldErroMsg}>{errosCampos.qtdDigitalPeriodo}</span>
                  )}
                  {tocados.qtdDigitalPeriodo && !errosCampos.qtdDigitalPeriodo && (
                    <span className={styles.fieldOkMsg}>✓ Dados registrados</span>
                  )}
                </div>
              </div>

              <div className={fieldState('periodo')}>
                <label htmlFor="periodo">Período</label>
                <input
                  id="periodo"
                  type="month"
                  value={periodo}
                  onChange={e => { setPeriodo(e.target.value); touch('periodo') }}
                  onBlur={() => touch('periodo')}
                />
                {tocados.periodo && errosCampos.periodo && (
                  <span className={styles.fieldErroMsg}>{errosCampos.periodo}</span>
                )}
                {tocados.periodo && !errosCampos.periodo && (
                  <span className={styles.fieldOkMsg}>✓ Dados registrados</span>
                )}
              </div>

              <button
                className={styles.btnCalc}
                onClick={calcularPeriodo}
                disabled={carregandoPeriodo}
              >
                {carregandoPeriodo ? 'Calculando...' : 'Calcular emissões por período'}
              </button>

              {resultadoPeriodo && (() => {
                const physKg = resultadoPeriodo.physicalEmissionsKgCO2e
                const digKg = resultadoPeriodo.digitalEmissionsKgCO2e
                const totalKg = physKg + digKg
                const avoidedKg = resultadoPeriodo.avoidedCarbonKgCO2e
                const physPct = totalKg > 0 ? (physKg / totalKg * 100) : 50
                const pctSaved = totalKg > 0 ? (avoidedKg / totalKg * 100) : 0
                return (
                  <div className={styles.indicadoresCard}>
                    <div className={styles.indicadoresHeader}>
                      <div>
                        <div className={styles.indicadoresHeaderLabel}>Quantidade de carbono emitida no período</div>
                        <div className={styles.indicadoresHeaderTotal}>{formatarEmissoes(totalKg)}</div>
                        <div className={styles.indicadoresHeaderOp}>{resultadoPeriodo.operationLabel} · {resultadoPeriodo.physicalQuantity.toLocaleString('pt-BR')} físicas / {resultadoPeriodo.digitalQuantity.toLocaleString('pt-BR')} digitais</div>
                      </div>
                      <div className={styles.indicadoresPeriodoBadge}>{formatarPeriodo(resultadoPeriodo.period)}</div>
                    </div>
                    <div className={styles.indicadoresChartSection}>
                      <div className={styles.indicadoresDonutWrapper}>
                        <div className={styles.indicadoresDonut} style={{ '--phys-pct': `${physPct}%` }} />
                        <div className={styles.indicadoresDonutCenter}>
                          <span className={styles.indicadoresDonutValue} style={{ color: avoidedKg >= 0 ? '#4ade80' : '#f87171' }}>
                            {pctSaved.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className={styles.indicadoresChartInfo}>
                        <div className={styles.indicadoresLegend}>
                          <div className={styles.indicadoresLegendItem}>
                            <span className={styles.indicadoresLegendDot} style={{ background: '#162056' }} />
                            Físico
                          </div>
                          <div className={styles.indicadoresLegendItem}>
                            <span className={styles.indicadoresLegendDot} style={{ background: '#f72717' }} />
                            Digital
                          </div>
                        </div>
                        <p className={styles.indicadoresDesc}>
                          {avoidedKg >= 0
                            ? `Ao usar meios digitais, você evitou ${formatarEmissoes(avoidedKg)} de CO₂ neste período.`
                            : `As emissões digitais superaram as físicas em ${formatarEmissoes(Math.abs(avoidedKg))} neste período.`}
                        </p>
                      </div>
                    </div>
                    <div className={styles.indicadoresStats}>
                      <div className={styles.indicadoresStat}>
                        <span className={styles.indicadoresStatDot} style={{ background: '#162056' }} />
                        <div>
                          <div className={styles.indicadoresStatLabel}>Emissões físicas</div>
                          <div className={styles.indicadoresStatDesc}>{resultadoPeriodo.physicalDescription}</div>
                          <div className={styles.indicadoresStatValue}>{formatarEmissoes(physKg)}</div>
                        </div>
                      </div>
                      <div className={styles.indicadoresStat}>
                        <span className={styles.indicadoresStatDot} style={{ background: '#f72717' }} />
                        <div>
                          <div className={styles.indicadoresStatLabel}>Emissões digitais</div>
                          <div className={styles.indicadoresStatDesc}>{resultadoPeriodo.digitalDescription}</div>
                          <div className={styles.indicadoresStatValue}>{formatarEmissoes(digKg)}</div>
                        </div>
                      </div>
                    </div>
                    <div className={styles.indicadoresAvoidedRow}>
                      <div className={styles.indicadoresAvoidedLabel}>Carbono evitado</div>
                      <div>
                        <div className={styles.indicadoresAvoidedValue} style={{ color: avoidedKg >= 0 ? '#4ade80' : '#f87171' }}>
                          {avoidedKg >= 0 ? '' : '−'}{formatarEmissoes(Math.abs(avoidedKg))}
                        </div>
                        <div className={styles.indicadoresAvoidedNote}>{avoidedKg.toFixed(8)} kg CO₂e</div>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {erroPeriodo && <div className={styles.errorArea}>{erroPeriodo}</div>}
            </div>

            <button
              className={styles.btnAdicionar}
              onClick={() => setFormAberto(v => !v)}
            >
              {formAberto ? '▲' : '▼'} Adicionar Dados
            </button>

            {formAberto && (
              <div className={styles.formContent}>
                <div className={styles.card}>
                  <div className={styles.cardTitle}>Calculadora de impacto ambiental por operação</div>

                  <div className={styles.sectionLabel}>Dados do produto</div>

                  <div className={styles.field}>
                    <label htmlFor="tipo-produto">Tipo de produto</label>
                    <select id="tipo-produto" value={tipoProduto} onChange={e => setTipoProduto(e.target.value)}>
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
                      <input id="quantidade" type="number" min="1" value={quantidade} onChange={e => setQuantidade(e.target.value)} />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="peso">Peso estimado (kg)</label>
                      <input id="peso" type="number" min="0" step="0.01" placeholder="ex: 0.5" value={peso} onChange={e => setPeso(e.target.value)} />
                    </div>
                  </div>

                  <div className={styles.sectionLabel}>Meio de entrega / transação</div>

                  <div className={styles.tabs}>
                    <div className={`${styles.tab} ${tipoTransacao === 'fisico' ? styles.active : ''}`} onClick={() => trocarTransacao('fisico')}>Físico</div>
                    <div className={`${styles.tab} ${tipoTransacao === 'digital' ? styles.active : ''}`} onClick={() => trocarTransacao('digital')}>Digital</div>
                  </div>

                  {tipoTransacao === 'fisico' && (
                    <div className={styles.field}>
                      <label htmlFor="operacao-fisica">Tipo de operação física</label>
                      <select id="operacao-fisica" value={operacaoFisica} onChange={e => setOperacaoFisica(e.target.value)}>
                        <option value="">Selecione...</option>
                        {OPERACOES_FISICAS.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                      </select>
                    </div>
                  )}

                  {tipoTransacao === 'digital' && (
                    <div className={styles.field}>
                      <label htmlFor="operacao-digital">Tipo de operação digital</label>
                      <select id="operacao-digital" value={operacaoDigital} onChange={e => setOperacaoDigital(e.target.value)}>
                        <option value="">Selecione...</option>
                        {OPERACOES_DIGITAIS.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                      </select>
                    </div>
                  )}

                  <button className={styles.btnCalc} onClick={calcular} disabled={carregando}>
                    {carregando ? 'Calculando...' : 'Calcular emissões'}
                  </button>

                  {erro && <div className={styles.errorArea}>{erro}</div>}
                </div>

                <div className={styles.compCard}>
                  <div className={styles.cardTitle}>Comparador de emissões: físico vs. digital</div>

                  <div className={styles.compCols}>
                    <div>
                      <div className={styles.compColLabel}>Físico</div>
                      <div className={styles.field}>
                        <label htmlFor="comp-op-fisica">Tipo de operação física</label>
                        <select id="comp-op-fisica" value={operacaoFisicaComp} onChange={e => setOperacaoFisicaComp(e.target.value)}>
                          <option value="">Selecione...</option>
                          {OPERACOES_FISICAS.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                        </select>
                      </div>
                      <div className={styles.field}>
                        <label htmlFor="comp-qtd-fisica">Quantidade</label>
                        <input id="comp-qtd-fisica" type="number" min="1" value={qtdFisicaComp} onChange={e => setQtdFisicaComp(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <div className={styles.compColLabel}>Digital</div>
                      <div className={styles.field}>
                        <label htmlFor="comp-op-digital">Tipo de operação digital</label>
                        <select id="comp-op-digital" value={operacaoDigitalComp} onChange={e => setOperacaoDigitalComp(e.target.value)}>
                          <option value="">Selecione...</option>
                          {OPERACOES_DIGITAIS.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                        </select>
                      </div>
                      <div className={styles.field}>
                        <label htmlFor="comp-qtd-digital">Quantidade</label>
                        <input id="comp-qtd-digital" type="number" min="1" value={qtdDigitalComp} onChange={e => setQtdDigitalComp(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className={styles.sectionLabel} style={{ marginTop: '1rem' }}>Período da operação</div>
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label>Mês</label>
                      <select value={mesComp} onChange={e => setMesComp(Number(e.target.value))}>
                        {MESES_LABELS.map((m, i) => (
                          <option key={i + 1} value={i + 1}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.field}>
                      <label>Ano</label>
                      <select value={anoComp} onChange={e => setAnoComp(Number(e.target.value))}>
                        {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label>Vezes que a operação ocorre no mês</label>
                    <input type="number" min="1" value={vezesNoMes} onChange={e => setVezesNoMes(e.target.value)} />
                  </div>

                  <button className={styles.btnCalc} onClick={comparar} disabled={carregandoComp}>
                    {carregandoComp ? 'Comparando...' : 'Comparar emissões'}
                  </button>

                  {erroComp && <div className={styles.errorArea}>{erroComp}</div>}
                </div>
              </div>
            )}

            {temResultado && (
              <button className={styles.btnRelatorio} onClick={() => navigate('/relatorios')}>
                Ver relatório
              </button>
            )}
          </div>

          {/* COLUNA DIREITA */}
          <div className={styles.rightCol}>
            {!temResultado ? (
              <>
                <div className={styles.resultadosTitle}>Resultados</div>
                <div className={styles.semCalculo}>Cálculo não realizado</div>
              </>
            ) : (
              <>
                <Link
                  to="/tabela-dados"
                  state={{ resultado, resultadoComp, tipoProduto, peso, tipoTransacao }}
                  className={styles.resultadosTitleLink}
                >
                  Resultados
                </Link>

                {resultado && (() => {
                  const impacto = calcularNivelImpacto(resultado.emissionsKgCO2e)
                  const comparacoes = gerarComparacoes(resultado.emissionsKgCO2e)
                  return (
                    <div className={styles.resultArea}>
                      <div className={styles.resultHeader}>
                        <div className={styles.resultTitle}>Resultado do cálculo</div>
                        <span className={styles.impactBadge} style={{ color: impacto.cor, borderColor: impacto.cor }}>
                          Impacto {impacto.nivel}
                        </span>
                      </div>
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
                      <div className={styles.resultValue} style={{ color: impacto.cor }}>
                        {formatarEmissoes(resultado.emissionsKgCO2e)}
                      </div>
                      <div className={styles.resultNote}>
                        Referência técnica: {resultado.emissionsKgCO2e.toFixed(8)} kg CO₂e
                      </div>
                      <div className={styles.impactBarWrapper}>
                        <div className={styles.impactBarTrack}>
                          <div className={styles.impactBarFill} style={{ width: `${impacto.percentual}%`, background: impacto.cor }} />
                        </div>
                        <div className={styles.impactBarLabels}>
                          <span>Baixo</span><span>Médio</span><span>Alto</span>
                        </div>
                      </div>
                      <hr className={styles.resultDivider} />
                      <div className={styles.mensagemBox}>
                        <span className={styles.mensagemIcone}>💡</span>
                        <p className={styles.mensagemTexto}>{impacto.mensagem}</p>
                      </div>
                      <div className={styles.comparacoesLabel}>Isso equivale a...</div>
                      <div className={styles.comparacoesGrid}>
                        {comparacoes.map((c, i) => (
                          <div key={i} className={styles.comparacaoCard}>
                            <span className={styles.comparacaoIcone}>{c.icone}</span>
                            <div className={styles.comparacaoValor}>{c.valor}</div>
                            <div className={styles.comparacaoDesc}>{c.descricao}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                {resultadoComp && (
                  <div className={styles.resultArea} style={{ marginTop: '1rem' }}>
                    <div className={styles.resultTitle}>Resultado da comparação</div>
                    <hr className={styles.resultDivider} />
                    <div className={styles.compResultGrid}>
                      <div>
                        <div className={styles.resultLabel}>Emissões físicas</div>
                        <div className={styles.resultDesc}>{resultadoComp.physicalDescription}</div>
                        <div className={styles.resultDesc}>{resultadoComp.physicalQuantity} unidade(s)</div>
                        <div className={styles.resultValue}>{formatarEmissoes(resultadoComp.physicalEmissionsKgCO2e)}</div>
                      </div>
                      <div>
                        <div className={styles.resultLabel}>Emissões digitais</div>
                        <div className={styles.resultDesc}>{resultadoComp.digitalDescription}</div>
                        <div className={styles.resultDesc}>{resultadoComp.digitalQuantity} unidade(s)</div>
                        <div className={styles.resultValue}>{formatarEmissoes(resultadoComp.digitalEmissionsKgCO2e)}</div>
                      </div>
                    </div>
                    <hr className={styles.resultDivider} />
                    <div className={styles.resultLabel}>Carbono potencialmente evitado</div>
                    <div className={styles.avoidedValue}>{formatarEmissoes(resultadoComp.avoidedCarbonKgCO2e)}</div>
                    <div className={styles.resultNote}>{resultadoComp.avoidedCarbonKgCO2e.toFixed(8)} kg CO₂e (valor exato)</div>
                  </div>
                )}

                <button
                  className={styles.btnPlanoAcao}
                  onClick={() => navigate('/plano', { state: { resultado, resultadoComp, tipoProduto, peso, tipoTransacao } })}
                >
                  Ver plano de ação
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </>
  )
}

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
    cor: '#f87171',
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
  const [resultadoComp, setResultadoComp] = useState(null)
  const [erroComp, setErroComp] = useState('')
  const [carregandoComp, setCarregandoComp] = useState(false)

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
    } catch (e) {
      setErroComp(e.response?.data?.message || 'Não foi possível conectar ao servidor. Verifique se o backend está em execução.')
    } finally {
      setCarregandoComp(false)
    }
  }

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navbarLogo}>
          <img src="/images/logo.png" alt="CarbonFlow" style={{ height: 32 }} onError={e => { e.target.style.display = 'none' }} />
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

          <button className={styles.btnCalc} onClick={comparar} disabled={carregandoComp}>
            {carregandoComp ? 'Comparando...' : 'Comparar emissões'}
          </button>

          {resultadoComp && (
            <div className={styles.resultArea}>
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
              <div className={styles.resultLabel}>Carbono evitado</div>
              <div className={styles.avoidedValue}>{formatarEmissoes(resultadoComp.avoidedCarbonKgCO2e)}</div>
              <div className={styles.resultNote}>{resultadoComp.avoidedCarbonKgCO2e.toFixed(8)} kg CO₂e (valor exato)</div>
            </div>
          )}

          {erroComp && <div className={styles.errorArea}>{erroComp}</div>}
        </div>
      </div>
    </>
  )
}

import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer,
  LineChart, Line,
} from 'recharts'
import Navbar from '../components/Navbar'
import styles from './Tabela_dados.module.css'

const COR_FISICO  = '#ff2d2d'
const COR_DIGITAL = '#162056'
const COR_EVITADO = '#d9d9d9'

function formatKg(v) {
  if (v == null) return '—'
  if (v >= 1)     return v.toFixed(4) + ' kg'
  if (v >= 0.001) return (v * 1000).toFixed(4) + ' g'
  return (v * 1_000_000).toFixed(2) + ' mg'
}

function tryParse(key) {
  try { return JSON.parse(sessionStorage.getItem(key)) } catch { return null }
}

function loadHistory() {
  try { return JSON.parse(localStorage.getItem('cf_history') || '[]') } catch { return [] }
}

function getYear(h) {
  if (h.period) return h.period.split('-')[0]
  if (h.label) {
    const parts = h.label.split('/')
    return parts[parts.length - 1]
  }
  return ''
}

// Seleciona até n pontos: sempre o primeiro e o último, e os pontos
// intermediários onde houve maior mudança de tendência (inflexões),
// para destacar o que de fato variou ao longo do período registrado.
function pickKeyPoints(arr, n = 5) {
  if (arr.length <= n) return arr

  const keys = ['Físico', 'Digital', 'Evitado']
  const scores = arr.map((point, i) => {
    if (i === 0 || i === arr.length - 1) return -1
    let score = 0
    for (const key of keys) {
      const before = point[key] - arr[i - 1][key]
      const after  = arr[i + 1][key] - point[key]
      score += Math.abs(after - before)
    }
    return score
  })

  const middleCount = n - 2
  const middleIndices = scores
    .map((score, i) => [score, i])
    .filter(([, i]) => i !== 0 && i !== arr.length - 1)
    .sort((a, b) => b[0] - a[0])
    .slice(0, middleCount)
    .map(([, i]) => i)
    .sort((a, b) => a - b)

  const indices = [0, ...middleIndices, arr.length - 1]
  return indices.map(i => arr[i])
}

export default function Tabela_dados() {
  const location = useLocation()
  const ls = location.state || {}

  const h1Stored = tryParse('cf_h1')
  const h2Stored = tryParse('cf_h2')

  const resultado     = ls.resultado     ?? h1Stored?.resultado     ?? null
  const resultadoComp = ls.resultadoComp ?? h2Stored                ?? null
  const tipoProduto   = ls.tipoProduto   ?? h1Stored?.tipoProduto   ?? ''
  const peso          = ls.peso          ?? h1Stored?.peso          ?? ''
  const tipoTransacao = ls.tipoTransacao ?? h1Stored?.tipoTransacao ?? 'fisico'

  const history = loadHistory()

  const semDados = resultado === null && resultadoComp === null

  const carbonEmitido = resultadoComp?.physicalEmissionsKgCO2e ?? resultado?.emissionsKgCO2e ?? 0
  const carbonEvitado = resultadoComp?.avoidedCarbonKgCO2e ?? (resultado ? resultado.emissionsKgCO2e * 0.6 : 0)
  const percentualReducao = carbonEmitido > 0
    ? ((carbonEvitado / (carbonEmitido + carbonEvitado)) * 100).toFixed(1)
    : 0

  // Totais acumulados do histórico
  const totalHistoricoFisico  = history.reduce((s, h) => s + h.totalPhysicalKgCO2e, 0)
  const totalHistoricoDigital = history.reduce((s, h) => s + h.totalDigitalKgCO2e, 0)
  const totalHistoricoEvitado = history.reduce((s, h) => s + h.totalAvoidedKgCO2e, 0)

  /* ── Pie ── */
  const physicalVal = resultadoComp?.physicalEmissionsKgCO2e
    ?? (tipoTransacao === 'fisico'  ? resultado?.emissionsKgCO2e : null)
  const digitalVal  = resultadoComp?.digitalEmissionsKgCO2e
    ?? (tipoTransacao === 'digital' ? resultado?.emissionsKgCO2e : null)

  const reducaoPercentual = resultadoComp
    ? (resultadoComp.physicalEmissionsKgCO2e > 0
        ? ((resultadoComp.avoidedCarbonKgCO2e / resultadoComp.physicalEmissionsKgCO2e) * 100).toFixed(1)
        : '-0.3')
    : '-0.3'

  /* ── Bar chart: mensal (filtrado por ano selecionado) ── */
  const barDataMensal = resultadoComp
    ? [{ name: 'Operação', Físico: parseFloat(resultadoComp.physicalEmissionsKgCO2e.toFixed(6)), Digital: parseFloat(resultadoComp.digitalEmissionsKgCO2e.toFixed(6)) }]
    : resultado
    ? [{ name: resultado.description, Físico: parseFloat(resultado.emissionsKgCO2e.toFixed(6)), Digital: 0 }]
    : []

  const availableYears = [...new Set(history.map(getYear))].filter(Boolean).sort((a, b) => b.localeCompare(a))

  const [selectedYear, setSelectedYear] = useState(null)
  const currentYear = selectedYear ?? availableYears[0] ?? ''

  const barDataMensalAno = history
    .filter(h => getYear(h) === currentYear)
    .map(h => ({
      name: h.label,
      Físico:  parseFloat(h.totalPhysicalKgCO2e.toFixed(6)),
      Digital: parseFloat(h.totalDigitalKgCO2e.toFixed(6)),
    }))

  const barData = barDataMensalAno.length > 0 ? barDataMensalAno : barDataMensal

  /* ── Pontos por ano: emissão de carbono atual ── */
  const barDataPorAno = Object.values(
    history.reduce((acc, h) => {
      const ano = getYear(h)
      if (!acc[ano]) acc[ano] = { name: ano, Físico: 0, Digital: 0 }
      acc[ano].Físico  += h.totalPhysicalKgCO2e
      acc[ano].Digital += h.totalDigitalKgCO2e
      return acc
    }, {})
  )
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(a => ({ ...a, Físico: parseFloat(a.Físico.toFixed(6)), Digital: parseFloat(a.Digital.toFixed(6)) }))

  /* ── Line chart: evolução temporal (5 pontos de maior mudança no histórico) ── */
  const lineDataTemporal = history.length > 1
    ? pickKeyPoints(history.map(h => ({
        label: h.label,
        Físico:  parseFloat(h.totalPhysicalKgCO2e.toFixed(6)),
        Digital: parseFloat(h.totalDigitalKgCO2e.toFixed(6)),
        Evitado: parseFloat(h.totalAvoidedKgCO2e.toFixed(6)),
      })), 5)
    : null  // null = mostrar mensagem ou usar fallback

  // Fallback quando não há histórico suficiente
  const lineDataFallback = resultadoComp
    ? [
        { label: 'Física', Físico: parseFloat(resultadoComp.physicalEmissionsKgCO2e.toFixed(6)), Digital: 0, Evitado: 0 },
        { label: 'Digital', Físico: 0, Digital: parseFloat(resultadoComp.digitalEmissionsKgCO2e.toFixed(6)), Evitado: parseFloat(resultadoComp.avoidedCarbonKgCO2e.toFixed(6)) },
      ]
    : []

  const lineData = lineDataTemporal ?? lineDataFallback

  return (
    <div className={styles.page}>
      <Navbar />

      {semDados ? (
        <div className={styles.semDados}>Cálculo não realizado</div>
      ) : (
        <>
          {/* ── Indicadores Gerais ── */}
          <div className={styles.indicatorsSection}>
            <div className={styles.indicatorsSectionTitle}>Indicadores Gerais</div>
            <div className={styles.indicatorCard}>
              <div className={styles.indicatorContent}>
                <div className={styles.indicatorTexts}>
                  <div className={styles.indicatorItem}>
                    <div className={styles.indicatorLabel}>Quantidade de carbono emitida no período:</div>
                    <div className={styles.indicatorValue}>{formatKg(carbonEmitido)}</div>
                  </div>
                  <div className={styles.indicatorItem}>
                    <div className={styles.indicatorLabel}>Potencial de redução ao adotar o meio digital:</div>
                    <div className={styles.indicatorValue}>{formatKg(carbonEvitado)}</div>
                  </div>
                  <div className={styles.indicatorItem}>
                    <div className={styles.indicatorLabel}>Redução potencial se o digital fosse adotado:</div>
                    <div className={styles.indicatorValue}>{percentualReducao}% menos emissões.</div>
                  </div>
                  {history.length > 0 && (
                    <div className={styles.indicatorItem}>
                      <div className={styles.indicatorLabel}>Períodos registrados ({history.length}):</div>
                      <div className={styles.indicatorValue}>
                        Físico acumulado: {formatKg(totalHistoricoFisico)} · Evitado: {formatKg(totalHistoricoEvitado)}
                      </div>
                    </div>
                  )}
                </div>
                <div className={styles.indicatorChart}>
                  <div className={styles.customBarChart}>
                    <div className={styles.barItem}>
                      <div className={styles.barLabel}>carbono emitido</div>
                      <div className={styles.barContainer}>
                        <div className={styles.bar} style={{ width: `${(carbonEmitido / Math.max(carbonEmitido, carbonEvitado)) * 100}%`, background: COR_FISICO }} />
                      </div>
                      <div className={styles.barValue}>{formatKg(carbonEmitido)}</div>
                    </div>
                    <div className={styles.barItem}>
                      <div className={styles.barLabel}>Dispersão de Carbono</div>
                      <div className={styles.barContainer}>
                        <div className={styles.bar} style={{ width: `${(carbonEvitado / Math.max(carbonEmitido, carbonEvitado)) * 100}%`, background: COR_EVITADO }} />
                      </div>
                      <div className={styles.barValue}>{formatKg(carbonEvitado)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Gráficos ── */}
          <div className={styles.chartsSection}>
            <div className={styles.chartsSectionTitle}>Gráficos</div>

            <div className={styles.chartsGrid}>

              {/* Donut — Carbono evitado */}
              <div className={styles.chartCard}>
                <span className={styles.chartLabelPill}>Dispersão de Carbono</span>
                {!physicalVal && !digitalVal ? (
                  <p className={styles.semDados}>Sem dados de cálculo. Volte à calculadora.</p>
                ) : (
                  <>
                    <div className={styles.chartContainer}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Físico',  value: physicalVal ?? 0, fill: COR_FISICO  },
                              { name: 'Digital', value: digitalVal  ?? 0, fill: COR_DIGITAL },
                            ]}
                            dataKey="value"
                            cx="50%"
                            cy="50%"
                            innerRadius="50%"
                            outerRadius="80%"
                          >
                            <Cell fill={COR_FISICO}  />
                            <Cell fill={COR_DIGITAL} />
                          </Pie>
                          <Tooltip formatter={(v, name) => [formatKg(v) + ' CO₂e', name]} />
                        </PieChart>
                      </ResponsiveContainer>
                      {resultadoComp && (
                        <div className={styles.pieCenter}>
                          {reducaoPercentual > 0 ? '+' : ''}{reducaoPercentual}%
                        </div>
                      )}
                    </div>
                    <div className={styles.pieCenterText}>
                      {resultadoComp
                        ? `Se o meio digital fosse adotado, seriam potencialmente evitados ${formatKg(resultadoComp.avoidedCarbonKgCO2e)} CO₂e.`
                        : tipoTransacao === 'digital'
                          ? 'Emissão calculada para operação digital.'
                          : 'Emissão calculada para operação física.'}
                    </div>
                    <div className={styles.piePercentages}>
                      {physicalVal != null && (
                        <div className={styles.piePercItem}>
                          <span className={styles.piePercDot} style={{ background: COR_FISICO }} />
                          <span>Físico: {formatKg(physicalVal)} CO₂e</span>
                        </div>
                      )}
                      {digitalVal != null && (
                        <div className={styles.piePercItem}>
                          <span className={styles.piePercDot} style={{ background: COR_DIGITAL }} />
                          <span>Digital: {formatKg(digitalVal)} CO₂e</span>
                        </div>
                      )}
                      {resultadoComp && (
                        <div className={styles.piePercItem}>
                          <span className={styles.piePercDot} style={{ background: COR_EVITADO }} />
                          <span>Evitado: {formatKg(resultadoComp.avoidedCarbonKgCO2e)} CO₂e</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Bar — Mensal (filtrado por ano) */}
              <div className={styles.chartCard}>
                <div className={styles.chartHeaderWithToggle}>
                  <span className={styles.chartLabelPill}>Emissão de carbono mensal</span>
                  {availableYears.length > 0 && (
                    <select
                      className={styles.yearSelect}
                      value={currentYear}
                      onChange={e => setSelectedYear(e.target.value)}
                    >
                      {availableYears.map(ano => (
                        <option key={ano} value={ano}>{ano}</option>
                      ))}
                    </select>
                  )}
                </div>
                {barData.length === 0 ? (
                  <p className={styles.semDados}>Sem dados de cálculo.</p>
                ) : (
                  <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis width={70} tick={{ fontSize: 11 }} tickFormatter={v => formatKg(v)} />
                        <Tooltip formatter={(v, name) => [formatKg(v) + ' CO₂e', name]} />
                        <Legend />
                        <Bar dataKey="Físico"  barSize={32} fill={COR_FISICO}  />
                        <Bar dataKey="Digital" barSize={32} fill={COR_DIGITAL} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Line — Emissão de carbono atual (pontos por ano) */}
              <div className={styles.chartCard}>
                <div className={styles.chartHeaderWithToggle}>
                  <span className={styles.chartLabelPill}>Emissão de carbono atual</span>
                </div>
                {barDataPorAno.length === 0 ? (
                  <p className={styles.semDados}>Sem dados de cálculo.</p>
                ) : (
                  <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={barDataPorAno} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis width={70} tick={{ fontSize: 11 }} tickFormatter={v => formatKg(v)} />
                        <Tooltip formatter={(v, name) => [formatKg(v) + ' CO₂e', name]} />
                        <Legend />
                        <Line type="monotone" dataKey="Físico"  stroke={COR_FISICO}  strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="Digital" stroke={COR_DIGITAL} strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Line — Comparação Temporal */}
              <div className={styles.chartCard}>
                <div className={styles.chartHeaderWithToggle}>
                  <span className={styles.chartLabelPill}>Evolução Temporal</span>
                  {history.length > 0 && (
                    <span style={{ fontSize: 11, color: '#888' }}>
                      {history.length} período{history.length > 1 ? 's' : ''} registrado{history.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {lineData.length === 0 ? (
                  <p className={styles.semDados}>Sem dados de cálculo.</p>
                ) : lineData.length === 1 && history.length <= 1 ? (
                  <p className={styles.semDados} style={{ fontSize: 13 }}>
                    Adicione comparações em mais períodos para ver a evolução temporal.
                  </p>
                ) : (
                  <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={lineData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                        <YAxis width={70} tick={{ fontSize: 11 }} tickFormatter={v => formatKg(v)} />
                        <Tooltip formatter={(v, name) => [formatKg(v) + ' CO₂e', name]} />
                        <Legend />
                        <Line type="monotone" dataKey="Físico"  stroke={COR_FISICO}  strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="Digital" stroke={COR_DIGITAL} strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="Evitado" stroke="#4ade80"     strokeWidth={2} dot={{ r: 4 }} strokeDasharray="4 2" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  )
}

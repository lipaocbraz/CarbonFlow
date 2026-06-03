import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer,
  LineChart, Line,
} from 'recharts'
import Navbar from '../components/Navbar'
import styles from './Tabela_dados.module.css'

const COR_FISICO  = '#990b00'
const COR_DIGITAL = '#f72717'
const COR_EVITADO = '#4ade80'

function formatKg(v) {
  if (v == null) return '—'
  if (v >= 1)      return v.toFixed(4) + ' kg'
  if (v >= 0.001)  return (v * 1000).toFixed(4) + ' g'
  return (v * 1_000_000).toFixed(2) + ' mg'
}

function tryParse(key) {
  try { return JSON.parse(sessionStorage.getItem(key)) } catch { return null }
}

export default function Tabela_dados() {
  const location = useLocation()
  const ls = location.state || {}

  const h1Stored = tryParse('cf_h1')
  const h2Stored = tryParse('cf_h2')

  const resultado    = ls.resultado    ?? h1Stored?.resultado    ?? null
  const resultadoComp = ls.resultadoComp ?? h2Stored              ?? null
  const tipoProduto  = ls.tipoProduto  ?? h1Stored?.tipoProduto  ?? ''
  const peso         = ls.peso         ?? h1Stored?.peso         ?? ''

  const [viewMode, setViewMode] = useState('mensal')

  const semDados = resultado === null && resultadoComp === null

  const carbonEmitido = resultadoComp?.physicalEmissionsKgCO2e ?? resultado?.emissionsKgCO2e ?? 0
  const carbonEvitado = resultadoComp?.avoidedCarbonKgCO2e ?? 0
  const percentualReducao = carbonEmitido > 0
    ? ((carbonEvitado / (carbonEmitido + carbonEvitado)) * 100).toFixed(1)
    : 0

  /* ── Dados para o Pie (Dispersão de carbono) ── */
  const pieOuter = resultadoComp
    ? [
        { name: 'Físico',  value: resultadoComp.physicalEmissionsKgCO2e  },
        { name: 'Digital', value: resultadoComp.digitalEmissionsKgCO2e   },
      ]
    : resultado
    ? [{ name: resultado.description, value: resultado.emissionsKgCO2e }]
    : []

  const pieInner = resultadoComp
    ? [
        { name: 'Emissões digitais', value: resultadoComp.digitalEmissionsKgCO2e  },
        { name: 'Carbono evitado',   value: resultadoComp.avoidedCarbonKgCO2e     },
      ]
    : []

  const pieColors  = [COR_FISICO, COR_DIGITAL]
  const innerColors = [COR_DIGITAL, COR_EVITADO]

  /* ── Dados para o Bar (Mensal vs Anual) ── */
  const barDataMensal = resultadoComp
    ? [
        {
          name: 'Operação',
          Físico:  parseFloat(resultadoComp.physicalEmissionsKgCO2e.toFixed(6)),
          Digital: parseFloat(resultadoComp.digitalEmissionsKgCO2e.toFixed(6)),
        },
      ]
    : resultado
    ? [{ name: resultado.description, Físico: parseFloat(resultado.emissionsKgCO2e.toFixed(6)), Digital: 0 }]
    : []

  const barDataAnual = resultadoComp
    ? [
        {
          name: 'Jan.',
          Físico:  parseFloat((resultadoComp.physicalEmissionsKgCO2e * 0.9).toFixed(6)),
          Digital: parseFloat((resultadoComp.digitalEmissionsKgCO2e * 0.95).toFixed(6)),
        },
        {
          name: 'Fev.',
          Físico:  parseFloat((resultadoComp.physicalEmissionsKgCO2e * 1.1).toFixed(6)),
          Digital: parseFloat((resultadoComp.digitalEmissionsKgCO2e * 1.05).toFixed(6)),
        },
        {
          name: 'Mar.',
          Físico:  parseFloat((resultadoComp.physicalEmissionsKgCO2e * 0.85).toFixed(6)),
          Digital: parseFloat((resultadoComp.digitalEmissionsKgCO2e * 0.9).toFixed(6)),
        },
        {
          name: 'Abr.',
          Físico:  parseFloat((resultadoComp.physicalEmissionsKgCO2e * 1.2).toFixed(6)),
          Digital: parseFloat((resultadoComp.digitalEmissionsKgCO2e * 1.1).toFixed(6)),
        },
        {
          name: 'Mai.',
          Físico:  parseFloat((resultadoComp.physicalEmissionsKgCO2e * 0.95).toFixed(6)),
          Digital: parseFloat((resultadoComp.digitalEmissionsKgCO2e * 0.88).toFixed(6)),
        },
        {
          name: 'Jun.',
          Físico:  parseFloat((resultadoComp.physicalEmissionsKgCO2e * 1.05).toFixed(6)),
          Digital: parseFloat((resultadoComp.digitalEmissionsKgCO2e * 0.92).toFixed(6)),
        },
      ]
    : []

  const barData = viewMode === 'mensal' ? barDataMensal : barDataAnual

  /* ── Dados para Line Chart (Comparação Temporal Mensal) ── */
  const lineDataMensal = [
    { month: 'Jan.', Físico: 2.4, Digital: 1.2 },
    { month: 'Fev.', Físico: 1.8, Digital: 1.0 },
    { month: 'Mar.', Físico: 2.6, Digital: 1.4 },
    { month: 'Abr.', Físico: 2.2, Digital: 1.1 },
    { month: 'Mai.', Físico: 2.8, Digital: 1.2 },
    { month: 'Jun.', Físico: 2.5, Digital: 1.3 },
  ]

  const lineDataAnual = [
    { year: '2020', Físico: 25.4, Digital: 12.8 },
    { year: '2021', Físico: 28.6, Digital: 14.2 },
    { year: '2022', Físico: 26.8, Digital: 13.5 },
    { year: '2023', Físico: 31.2, Digital: 15.4 },
    { year: '2024', Físico: 29.5, Digital: 14.8 },
    { year: '2025', Físico: 32.1, Digital: 16.2 },
  ]

  const lineData = viewMode === 'mensal' ? lineDataMensal : lineDataAnual

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
                    <div className={styles.indicatorLabel}>Quanto deixou de ser emitido pelo uso do método digital:</div>
                    <div className={styles.indicatorValue}>{formatKg(carbonEvitado)}</div>
                  </div>
                  <div className={styles.indicatorItem}>
                    <div className={styles.indicatorLabel}>Comparação entre físico e digital:</div>
                    <div className={styles.indicatorValue}>{percentualReducao}% menos emissões.</div>
                  </div>
                </div>
                <div className={styles.indicatorChart}>
                  <div className={styles.customBarChart}>
                    <div className={styles.barItem}>
                      <div className={styles.barLabel}>carbono emitido</div>
                      <div className={styles.barContainer}>
                        <div
                          className={styles.bar}
                          style={{
                            width: `${(carbonEmitido / Math.max(carbonEmitido, carbonEvitado)) * 100}%`,
                            background: COR_FISICO,
                          }}
                        />
                      </div>
                      <div className={styles.barValue}>{formatKg(carbonEmitido)}</div>
                    </div>
                    <div className={styles.barItem}>
                      <div className={styles.barLabel}>carbono evitado</div>
                      <div className={styles.barContainer}>
                        <div
                          className={styles.bar}
                          style={{
                            width: `${(carbonEvitado / Math.max(carbonEmitido, carbonEvitado)) * 100}%`,
                            background: COR_EVITADO,
                          }}
                        />
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

              {/* Pie — Dispersão de carbono */}
              <div className={styles.chartCard}>
                <span className={styles.chartLabelPill}>Dispersão de carbono</span>

                {pieOuter.length === 0 ? (
                  <p className={styles.noData}>Sem dados de cálculo. Volte à calculadora.</p>
                ) : (
                  <>
                    <div className={styles.chartContainer}>
                      <PieChart style={{ width: '100%', height: '100%' }} responsive>
                        <Pie
                          data={pieOuter}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          outerRadius="60%"
                        >
                          {pieOuter.map((_, i) => (
                            <Cell key={i} fill={pieColors[i % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v, name) => [formatKg(v) + ' CO₂e', name]}
                        />
                      </PieChart>
                    </div>
                    <div className={styles.legend}>
                      <span>
                        <span className={styles.legendDot} style={{ background: COR_FISICO }} />
                        Físico
                      </span>
                      <span>
                        <span className={styles.legendDot} style={{ background: COR_DIGITAL }} />
                        Digital
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Donut — Carbono evitado vs Emissões digitais */}
              {pieInner.length > 0 && (
                <div className={styles.chartCard}>
                  <span className={styles.chartLabelPill}>Carbono evitado</span>

                  <>
                    <div className={styles.chartContainer}>
                      <PieChart style={{ width: '100%', height: '100%' }} responsive>
                        <Pie
                          data={pieInner}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          innerRadius="50%"
                          outerRadius="80%"
                        >
                          {pieInner.map((_, i) => (
                            <Cell key={i} fill={innerColors[i % innerColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v, name) => [formatKg(v) + ' CO₂e', name]}
                        />
                      </PieChart>
                      <div className={styles.pieCenter}>-0,3%</div>
                    </div>
                    <div className={styles.pieCenterText}>Sua dispersão de carbono diminuiu em 0,3% no último mês.</div>
                    <div className={styles.piePercentages}>
                      <div className={styles.piePercItem}>
                        <span className={styles.piePercDot} style={{ background: COR_DIGITAL }} />
                        <span>Emissões digitais: {pieInner.length > 0 ? ((pieInner[0].value / (pieInner[0].value + pieInner[1].value)) * 100).toFixed(1) : 0}%</span>
                      </div>
                      <div className={styles.piePercItem}>
                        <span className={styles.piePercDot} style={{ background: COR_EVITADO }} />
                        <span>Carbono evitado: {pieInner.length > 0 ? ((pieInner[1].value / (pieInner[0].value + pieInner[1].value)) * 100).toFixed(1) : 0}%</span>
                      </div>
                    </div>
                    <div className={styles.legend}>
                      <span>
                        <span className={styles.legendDot} style={{ background: COR_DIGITAL }} />
                        Emissões digitais
                      </span>
                      <span>
                        <span className={styles.legendDot} style={{ background: COR_EVITADO }} />
                        Carbono evitado
                      </span>
                    </div>
                  </>
                </div>
              )}

              {/* Bar — Mensal/Anual */}
              <div className={styles.chartCard}>
                <div className={styles.chartHeaderWithToggle}>
                  <span className={styles.chartLabelPill}>Emissão de carbono em porcentagem</span>
                  <div className={styles.toggleGroup}>
                    <button
                      className={`${styles.toggleBtn} ${viewMode === 'mensal' ? styles.toggleBtnActive : ''}`}
                      onClick={() => setViewMode('mensal')}
                    >
                      Mensal
                    </button>
                    <button
                      className={`${styles.toggleBtn} ${viewMode === 'anual' ? styles.toggleBtnActive : ''}`}
                      onClick={() => setViewMode('anual')}
                    >
                      Anual
                    </button>
                  </div>
                </div>

                {barData.length === 0 ? (
                  <p className={styles.noData}>Sem dados de cálculo. Volte à calculadora.</p>
                ) : (
                  <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={barData}
                        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={viewMode === 'mensal' ? 'name' : viewMode === 'mensal' ? 'name' : 'name'} tick={{ fontSize: 12 }} />
                        <YAxis
                          width={70}
                          tick={{ fontSize: 11 }}
                          tickFormatter={v => formatKg(v)}
                        />
                        <Tooltip
                          formatter={(v, name) => [formatKg(v) + ' CO₂e', name]}
                        />
                        <Legend />
                        <Bar dataKey="Físico"  barSize={32} fill={COR_FISICO}  />
                        <Bar dataKey="Digital" barSize={32} fill={COR_DIGITAL} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* ── Line Charts (Comparação Temporal) ── */}
              <div className={styles.chartCard}>
              <div className={styles.chartHeaderWithToggle}>
                <span className={styles.chartLabelPill}>Comparação Temporal</span>
                <div className={styles.toggleGroup}>
                  <button
                    className={`${styles.toggleBtn} ${viewMode === 'mensal' ? styles.toggleBtnActive : ''}`}
                    onClick={() => setViewMode('mensal')}
                  >
                    Mensal
                  </button>
                  <button
                    className={`${styles.toggleBtn} ${viewMode === 'anual' ? styles.toggleBtnActive : ''}`}
                    onClick={() => setViewMode('anual')}
                  >
                    Anual
                  </button>
                </div>
              </div>

              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={lineData}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={viewMode === 'mensal' ? 'month' : 'year'} tick={{ fontSize: 12 }} />
                    <YAxis
                      width={70}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(v) => [v.toFixed(2) + ' kg CO₂e']}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Físico"
                      stroke={COR_FISICO}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Digital"
                      stroke={COR_DIGITAL}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  )
}

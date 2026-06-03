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
  if (v >= 1)     return v.toFixed(4) + ' kg'
  if (v >= 0.001) return (v * 1000).toFixed(4) + ' g'
  return (v * 1_000_000).toFixed(2) + ' mg'
}

function tryParse(key) {
  try { return JSON.parse(sessionStorage.getItem(key)) } catch { return null }
}

function nivelImpacto(kg) {
  if (kg == null) return { nivel: '—', cor: '#999' }
  if (kg < 0.1)   return { nivel: 'Baixo', cor: '#4ade80' }
  if (kg < 1)     return { nivel: 'Médio', cor: '#fbbf24' }
  return { nivel: 'Alto', cor: '#f87171' }
}

function gerarDadosMensais(pBase, dBase) {
  const meses = ['Jan.', 'Fev.', 'Mar.', 'Abr.', 'Mai.', 'Jun.', 'Jul.', 'Ago.', 'Set.', 'Out.', 'Nov.', 'Dez.']
  return meses.map((name, i) => ({
    name,
    Físico:  pBase > 0 ? parseFloat((pBase  * (1 + 0.30 * Math.sin(i * 1.1 + 0.3))).toFixed(8)) : 0,
    Digital: dBase > 0 ? parseFloat((dBase  * (1 + 0.25 * Math.cos(i * 0.9 + 1.0))).toFixed(8)) : 0,
  }))
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

  const [viewMode, setViewMode] = useState('mensal')

  const semDados = resultado === null && resultadoComp === null

  const carbonEmitido = resultadoComp?.physicalEmissionsKgCO2e ?? resultado?.emissionsKgCO2e ?? 0
  const carbonEvitado = resultadoComp?.avoidedCarbonKgCO2e ?? (resultado ? resultado.emissionsKgCO2e * 0.6 : 0)
  const percentualReducao = carbonEmitido > 0
    ? ((carbonEvitado / (carbonEmitido + carbonEvitado)) * 100).toFixed(1)
    : 0

  /* ── Dados para o Pie (Dispersão de carbono) ── */
  const physicalVal = resultadoComp?.physicalEmissionsKgCO2e
    ?? (tipoTransacao === 'fisico'  ? resultado?.emissionsKgCO2e : null)
  const digitalVal  = resultadoComp?.digitalEmissionsKgCO2e
    ?? (tipoTransacao === 'digital' ? resultado?.emissionsKgCO2e : null)

  const pieOuter = resultadoComp
    ? [
        { name: 'Físico',  value: physicalVal, fill: COR_FISICO  },
        { name: 'Digital', value: digitalVal,  fill: COR_DIGITAL },
      ]
    : resultado
    ? tipoTransacao === 'digital'
      ? [{ name: 'Digital', value: resultado.emissionsKgCO2e, fill: COR_DIGITAL }]
      : [{ name: 'Físico',  value: resultado.emissionsKgCO2e, fill: COR_FISICO  }]
    : []

  const pieInner = resultadoComp
    ? [
        { name: 'Emissões digitais', value: resultadoComp.digitalEmissionsKgCO2e  },
        { name: 'Carbono evitado',   value: resultadoComp.avoidedCarbonKgCO2e     },
      ]
    : resultado
    ? [
        { name: 'Emissões digitais', value: resultado.emissionsKgCO2e * 0.4 },
        { name: 'Carbono evitado',   value: resultado.emissionsKgCO2e * 0.6 },
      ]
    : []

  // Calcula a redução de carbono em porcentagem (APÓS pieInner ser definido)
  const reducaoPercentual = pieInner.length > 0 && pieInner[0]?.value && pieInner[1]?.value
    ? ((pieInner[1].value / (pieInner[0].value + pieInner[1].value)) * 100 - 50).toFixed(1)
    : '-0,3'

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
        { name: 'Jan.', Físico: parseFloat((resultadoComp.physicalEmissionsKgCO2e * 0.9).toFixed(6)), Digital: parseFloat((resultadoComp.digitalEmissionsKgCO2e * 0.95).toFixed(6)) },
        { name: 'Fev.', Físico: parseFloat((resultadoComp.physicalEmissionsKgCO2e * 1.1).toFixed(6)), Digital: parseFloat((resultadoComp.digitalEmissionsKgCO2e * 1.05).toFixed(6)) },
        { name: 'Mar.', Físico: parseFloat((resultadoComp.physicalEmissionsKgCO2e * 0.85).toFixed(6)), Digital: parseFloat((resultadoComp.digitalEmissionsKgCO2e * 0.9).toFixed(6)) },
        { name: 'Abr.', Físico: parseFloat((resultadoComp.physicalEmissionsKgCO2e * 1.2).toFixed(6)), Digital: parseFloat((resultadoComp.digitalEmissionsKgCO2e * 1.1).toFixed(6)) },
        { name: 'Mai.', Físico: parseFloat((resultadoComp.physicalEmissionsKgCO2e * 0.95).toFixed(6)), Digital: parseFloat((resultadoComp.digitalEmissionsKgCO2e * 0.88).toFixed(6)) },
        { name: 'Jun.', Físico: parseFloat((resultadoComp.physicalEmissionsKgCO2e * 1.05).toFixed(6)), Digital: parseFloat((resultadoComp.digitalEmissionsKgCO2e * 0.92).toFixed(6)) },
      ]
    : []

  const barData = viewMode === 'mensal' ? barDataMensal : barDataAnual

  /* ── Dados para Line Chart (Comparação Temporal) - Dinâmicos ── */
  const lineDataMensal = resultadoComp
    ? [
        { month: 'Jan.', Físico: parseFloat((resultadoComp.physicalEmissionsKgCO2e * 0.85).toFixed(2)), Digital: parseFloat((resultadoComp.digitalEmissionsKgCO2e * 0.88).toFixed(2)) },
        { month: 'Fev.', Físico: parseFloat((resultadoComp.physicalEmissionsKgCO2e * 0.92).toFixed(2)), Digital: parseFloat((resultadoComp.digitalEmissionsKgCO2e * 0.95).toFixed(2)) },
        { month: 'Mar.', Físico: parseFloat((resultadoComp.physicalEmissionsKgCO2e * 1.05).toFixed(2)), Digital: parseFloat((resultadoComp.digitalEmissionsKgCO2e * 1.08).toFixed(2)) },
        { month: 'Abr.', Físico: parseFloat((resultadoComp.physicalEmissionsKgCO2e * 1.15).toFixed(2)), Digital: parseFloat((resultadoComp.digitalEmissionsKgCO2e * 1.12).toFixed(2)) },
        { month: 'Mai.', Físico: parseFloat((resultadoComp.physicalEmissionsKgCO2e * 1.08).toFixed(2)), Digital: parseFloat((resultadoComp.digitalEmissionsKgCO2e * 0.98).toFixed(2)) },
        { month: 'Jun.', Físico: parseFloat((resultadoComp.physicalEmissionsKgCO2e * 1.12).toFixed(2)), Digital: parseFloat((resultadoComp.digitalEmissionsKgCO2e * 1.02).toFixed(2)) },
      ]
    : [
        { month: 'Jan.', Físico: 0, Digital: 0 },
        { month: 'Fev.', Físico: 0, Digital: 0 },
        { month: 'Mar.', Físico: 0, Digital: 0 },
        { month: 'Abr.', Físico: 0, Digital: 0 },
        { month: 'Mai.', Físico: 0, Digital: 0 },
        { month: 'Jun.', Físico: 0, Digital: 0 },
      ]

  const lineDataAnual = resultadoComp
    ? [
        { year: '2020', Físico: parseFloat((resultadoComp.physicalEmissionsKgCO2e * 10).toFixed(2)), Digital: parseFloat((resultadoComp.digitalEmissionsKgCO2e * 10).toFixed(2)) },
        { year: '2021', Físico: parseFloat((resultadoComp.physicalEmissionsKgCO2e * 11.5).toFixed(2)), Digital: parseFloat((resultadoComp.digitalEmissionsKgCO2e * 11).toFixed(2)) },
        { year: '2022', Físico: parseFloat((resultadoComp.physicalEmissionsKgCO2e * 10.8).toFixed(2)), Digital: parseFloat((resultadoComp.digitalEmissionsKgCO2e * 10.5).toFixed(2)) },
        { year: '2023', Físico: parseFloat((resultadoComp.physicalEmissionsKgCO2e * 12.5).toFixed(2)), Digital: parseFloat((resultadoComp.digitalEmissionsKgCO2e * 12).toFixed(2)) },
        { year: '2024', Físico: parseFloat((resultadoComp.physicalEmissionsKgCO2e * 11.8).toFixed(2)), Digital: parseFloat((resultadoComp.digitalEmissionsKgCO2e * 11.5).toFixed(2)) },
        { year: '2025', Físico: parseFloat((resultadoComp.physicalEmissionsKgCO2e * 12.8).toFixed(2)), Digital: parseFloat((resultadoComp.digitalEmissionsKgCO2e * 12.5).toFixed(2)) },
      ]
    : [
        { year: '2020', Físico: 0, Digital: 0 },
        { year: '2021', Físico: 0, Digital: 0 },
        { year: '2022', Físico: 0, Digital: 0 },
        { year: '2023', Físico: 0, Digital: 0 },
        { year: '2024', Físico: 0, Digital: 0 },
        { year: '2025', Físico: 0, Digital: 0 },
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

              {/* Donut — Físico vs Digital (carbono evitado no centro) */}
              <div className={styles.chartCard}>
                <span className={styles.chartLabelPill}>Carbono evitado</span>

                {!physicalVal && !digitalVal ? (
                  <p className={styles.noData}>Sem dados de cálculo. Volte à calculadora.</p>
                ) : (
                  <>
                    <div className={styles.chartContainer}>
                      <PieChart style={{ width: '100%', height: '100%' }} responsive>
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
                      {resultadoComp && (
                        <div className={styles.pieCenter}>
                          {reducaoPercentual > 0 ? '+' : ''}{reducaoPercentual}%
                        </div>
                      )}
                    </div>

                    <div className={styles.pieCenterText}>
                      {resultadoComp
                        ? `Ao usar o meio digital, foram evitados ${formatKg(resultadoComp.avoidedCarbonKgCO2e)} CO₂e.`
                        : tipoTransacao === 'digital'
                          ? 'Emissão calculada para operação digital.'
                          : 'Emissão calculada para operação física.'
                      }
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

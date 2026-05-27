import { useLocation, Link } from 'react-router-dom'
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer,
} from 'recharts'
import Navbar from '../components/Navbar'
import styles from './Tabela_dados.module.css'

const COR_FISICO  = '#990b00'
const COR_DIGITAL = '#162056'
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

  const semDados = resultado === null && resultadoComp === null

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

  /* ── Dados para o Bar (Mensal) ── */
  const barData = resultadoComp
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

  return (
    <div className={styles.page}>
      <Navbar />

      {semDados ? (
        <div className={styles.semDados}>Cálculo não realizado</div>
      ) : (

      /* Gráficos */
      <div className={styles.chartsSection}>
        <div className={styles.chartsSectionTitle}>Gráficos</div>

        <div className={styles.chartsGrid}>

          {/* Pie — Dispersão de carbono */}
          <div className={styles.chartCard}>
            <span className={styles.chartLabelPill}>A dispersão de carbono</span>

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
                      outerRadius="50%"
                    >
                      {pieOuter.map((_, i) => (
                        <Cell key={i} fill={pieColors[i % pieColors.length]} />
                      ))}
                    </Pie>
                    {pieInner.length > 0 && (
                      <Pie
                        data={pieInner}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        innerRadius="60%"
                        outerRadius="80%"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(1)}%`
                        }
                      >
                        {pieInner.map((_, i) => (
                          <Cell key={i} fill={innerColors[i % innerColors.length]} />
                        ))}
                      </Pie>
                    )}
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
                  {pieInner.length > 0 && (
                    <span>
                      <span className={styles.legendDot} style={{ background: COR_EVITADO }} />
                      Evitado
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Bar — Mensal */}
          <div className={styles.chartCard}>
            <span className={styles.chartLabelPill}>Mensal</span>

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
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
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

        </div>
      </div>
      )}
    </div>
  )
}

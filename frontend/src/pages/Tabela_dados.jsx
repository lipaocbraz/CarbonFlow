import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import {
  PieChart, Pie, Sector, Tooltip,
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

function renderActiveShape({
  cx, cy, midAngle, innerRadius, outerRadius,
  startAngle, endAngle, fill, payload, percent, value,
}) {
  const RADIAN = Math.PI / 180
  const sin = Math.sin(-RADIAN * (midAngle ?? 1))
  const cos = Math.cos(-RADIAN * (midAngle ?? 1))
  const sx = (cx ?? 0) + ((outerRadius ?? 0) + 10) * cos
  const sy = (cy ?? 0) + ((outerRadius ?? 0) + 10) * sin
  const mx = (cx ?? 0) + ((outerRadius ?? 0) + 30) * cos
  const my = (cy ?? 0) + ((outerRadius ?? 0) + 30) * sin
  const ex = mx + (cos >= 0 ? 1 : -1) * 22
  const ey = my
  const textAnchor = cos >= 0 ? 'start' : 'end'

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} fontSize={13} fontWeight={600}>
        {payload.name}
      </text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle}
        innerRadius={(outerRadius ?? 0) + 6} outerRadius={(outerRadius ?? 0) + 10} fill={fill} />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" fontSize={12}>
        {formatKg(value) + ' CO₂e'}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" fontSize={11}>
        {`(${((percent ?? 0) * 100).toFixed(1)}%)`}
      </text>
    </g>
  )
}

export default function Tabela_dados() {
  const location = useLocation()
  const ls = location.state || {}

  const h1Stored = tryParse('cf_h1')
  const h2Stored = tryParse('cf_h2')

  const resultado      = ls.resultado      ?? h1Stored?.resultado      ?? null
  const resultadoComp  = ls.resultadoComp  ?? h2Stored                 ?? null
  const tipoProduto    = ls.tipoProduto    ?? h1Stored?.tipoProduto    ?? ''
  const peso           = ls.peso           ?? h1Stored?.peso           ?? ''
  const tipoTransacao  = ls.tipoTransacao  ?? h1Stored?.tipoTransacao  ?? 'fisico'

  const semDados = resultado === null && resultadoComp === null

  const [activePieIndex, setActivePieIndex] = useState(0)

  /* ── Dados para o Pie (Dispersão de carbono) ── */
  const pieOuter = resultadoComp
    ? [
        { name: 'Físico',  value: resultadoComp.physicalEmissionsKgCO2e,  fill: COR_FISICO  },
        { name: 'Digital', value: resultadoComp.digitalEmissionsKgCO2e,   fill: COR_DIGITAL },
      ]
    : resultado
    ? tipoTransacao === 'digital'
      ? [{ name: 'Digital', value: resultado.emissionsKgCO2e, fill: COR_DIGITAL }]
      : [{ name: 'Físico',  value: resultado.emissionsKgCO2e, fill: COR_FISICO  }]
    : []

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
    ? tipoTransacao === 'digital'
      ? [{ name: 'Operação', Físico: 0, Digital: parseFloat(resultado.emissionsKgCO2e.toFixed(6)) }]
      : [{ name: 'Operação', Físico: parseFloat(resultado.emissionsKgCO2e.toFixed(6)), Digital: 0 }]
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
                  <PieChart
                    style={{ width: '100%', maxWidth: 500, aspectRatio: 1 }}
                    responsive
                    margin={{ top: 50, right: 120, bottom: 0, left: 120 }}
                  >
                    <Pie
                      activeIndex={activePieIndex}
                      activeShape={renderActiveShape}
                      data={pieOuter}
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="80%"
                      dataKey="value"
                      onMouseEnter={(_, index) => setActivePieIndex(index)}
                    />
                    <Tooltip content={() => null} />
                  </PieChart>
                </div>
                <div className={styles.legend}>
                  {pieOuter.some(d => d.name === 'Físico') && (
                    <span>
                      <span className={styles.legendDot} style={{ background: COR_FISICO }} />
                      Físico
                    </span>
                  )}
                  {pieOuter.some(d => d.name === 'Digital') && (
                    <span>
                      <span className={styles.legendDot} style={{ background: COR_DIGITAL }} />
                      Digital
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

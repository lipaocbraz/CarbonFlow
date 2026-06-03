import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  PieChart, Pie, Sector, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts'
import Navbar from '../components/Navbar'
import styles from './Tabela_dados.module.css'

const COR_FISICO  = '#990b00'
const COR_DIGITAL = '#162056'

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

  const semDados = resultado === null && resultadoComp === null

  const [activePieIndex, setActivePieIndex] = useState(0)

  /* ── Valores derivados ── */
  const physicalVal = resultadoComp?.physicalEmissionsKgCO2e
    ?? (tipoTransacao === 'fisico'  ? resultado?.emissionsKgCO2e : null)
  const digitalVal  = resultadoComp?.digitalEmissionsKgCO2e
    ?? (tipoTransacao === 'digital' ? resultado?.emissionsKgCO2e : null)
  const avoidedVal  = resultadoComp?.avoidedCarbonKgCO2e ?? null

  const impacto = nivelImpacto(physicalVal ?? digitalVal)

  /* ── Percentual central do Pie ── */
  const centerPct = resultadoComp && physicalVal > 0
    ? `${((avoidedVal / physicalVal) * 100).toFixed(1)}%`
    : '—'

  const pieDesc = resultadoComp
    ? avoidedVal >= 0
      ? `Sua dispersão de carbono diminuiu em ${((avoidedVal / physicalVal) * 100).toFixed(1)}% ao usar o meio digital.`
      : `Sua dispersão de carbono aumentou em ${(Math.abs(avoidedVal / physicalVal) * 100).toFixed(1)}% ao usar o meio digital.`
    : tipoTransacao === 'digital'
      ? 'Emissão calculada para a operação digital selecionada.'
      : 'Emissão calculada para a operação física selecionada.'

  /* ── Indicadores ── */
  const indicadores = [
    { label: 'Produto',            value: tipoProduto || '—' },
    { label: 'Peso estimado',      value: peso ? `${peso} kg` : '—' },
    { label: 'Emissões físicas',   value: physicalVal != null ? formatKg(physicalVal) + ' CO₂e' : '—' },
    { label: 'Emissões digitais',  value: digitalVal  != null ? formatKg(digitalVal)  + ' CO₂e' : '—' },
    { label: 'Carbono evitado',    value: avoidedVal  != null ? formatKg(avoidedVal)  + ' CO₂e' : '—' },
    { label: 'Nível de impacto',   value: impacto.nivel, cor: impacto.cor },
  ]

  /* ── Dados Pie ── */
  const pieData = resultadoComp
    ? [
        { name: 'Físico',  value: physicalVal, fill: COR_FISICO  },
        { name: 'Digital', value: digitalVal,  fill: COR_DIGITAL },
      ]
    : resultado
    ? tipoTransacao === 'digital'
      ? [{ name: 'Digital', value: resultado.emissionsKgCO2e, fill: COR_DIGITAL }]
      : [{ name: 'Físico',  value: resultado.emissionsKgCO2e, fill: COR_FISICO  }]
    : []

  /* ── Dados Bar mensal ── */
  const barMensal = gerarDadosMensais(physicalVal ?? 0, digitalVal ?? 0)

  /* ── Active shape (dentro do componente para fechar sobre centerPct) ── */
  function renderActiveShape({
    cx, cy, midAngle, innerRadius, outerRadius,
    startAngle, endAngle, fill, percent, value,
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
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#111" fontSize={26} fontWeight={700}>
          {centerPct}
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

  return (
    <div className={styles.page}>
      <Navbar />

      {semDados ? (
        <div className={styles.semDados}>Cálculo não realizado</div>
      ) : (
        <div className={styles.content}>

          {/* ── Indicadores Gerais ── */}
          <h2 className={styles.sectionTitle}>Indicadores Gerais</h2>
          <div className={styles.indicadoresBox}>
            {indicadores.map((row, i) => (
              <div key={i} className={styles.indicadorRow}>
                <span className={styles.indicadorLabel}>{row.label}</span>
                <span className={styles.indicadorValue} style={row.cor ? { color: row.cor } : {}}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.separator} />

          {/* ── Gráficos ── */}
          <h2 className={styles.sectionTitle}>Gráficos</h2>

          {/* Pie */}
          <span className={styles.chartLabelPill}>Dispersão de carbono</span>
          <div className={styles.pieContainer}>
            <PieChart
              style={{ width: '100%', maxWidth: 420, aspectRatio: 1 }}
              responsive
              margin={{ top: 40, right: 110, bottom: 10, left: 110 }}
            >
              <Pie
                activeIndex={activePieIndex}
                activeShape={renderActiveShape}
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="72%"
                dataKey="value"
                onMouseEnter={(_, index) => setActivePieIndex(index)}
              />
              <Tooltip content={() => null} />
            </PieChart>
          </div>
          <p className={styles.pieDesc}>{pieDesc}</p>

          <div className={styles.separator} />

          {/* Bar mensal */}
          <span className={styles.chartLabelPill}>Mensal</span>
          <div className={styles.barHeader}>
            <div className={styles.barLegend}>
              <span>
                <span className={styles.legendSquare} style={{ background: COR_FISICO }} />
                Físico
              </span>
              <span>
                <span className={styles.legendSquare} style={{ background: COR_DIGITAL }} />
                Digital
              </span>
            </div>
            <span className={styles.barAxisLabel}>Emissão de carbono em porcentagem</span>
          </div>

          <div className={styles.barRow}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barMensal.slice(0, 6)} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis width={65} tick={{ fontSize: 10 }} tickFormatter={v => formatKg(v)} />
                <Tooltip formatter={(v, name) => [formatKg(v) + ' CO₂e', name]} />
                <Bar dataKey="Físico"  barSize={18} fill={COR_FISICO}  />
                <Bar dataKey="Digital" barSize={18} fill={COR_DIGITAL} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.barRow}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barMensal.slice(6)} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis width={65} tick={{ fontSize: 10 }} tickFormatter={v => formatKg(v)} />
                <Tooltip formatter={(v, name) => [formatKg(v) + ' CO₂e', name]} />
                <Bar dataKey="Físico"  barSize={18} fill={COR_FISICO}  />
                <Bar dataKey="Digital" barSize={18} fill={COR_DIGITAL} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}
    </div>
  )
}

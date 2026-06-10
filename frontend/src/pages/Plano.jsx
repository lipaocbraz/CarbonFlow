import { useLocation } from 'react-router-dom'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'
import Navbar from '../components/Navbar'
import styles from './Plano.module.css'

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

function formatPct(v) {
  if (!isFinite(v)) return '—'
  return `${v.toFixed(1)}%`
}

export default function Plano() {
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
  const totalHistoricoFisico  = history.reduce((s, h) => s + h.totalPhysicalKgCO2e, 0)
  const totalHistoricoDigital = history.reduce((s, h) => s + h.totalDigitalKgCO2e, 0)
  const totalHistoricoEvitado = history.reduce((s, h) => s + h.totalAvoidedKgCO2e, 0)

  // Base de comparação para os gráficos de "antes/depois": preferência pelo
  // total histórico de emissões físicas, com fallback para o cálculo atual.
  const carbonBase = totalHistoricoFisico > 0 ? totalHistoricoFisico : carbonEmitido

  /* ── Tabela "Plano De Ação" — gerada a partir dos dados reais inputados/salvos ── */
  const planoLinhas = []

  if (resultado) {
    const reducaoPct = resultadoComp?.physicalEmissionsKgCO2e > 0
      ? (resultadoComp.avoidedCarbonKgCO2e / resultadoComp.physicalEmissionsKgCO2e) * 100
      : null

    planoLinhas.push({
      area: tipoProduto || 'Operação calculada',
      situacao: `${resultado.quantity} unidade(s) de ${resultado.description}`
        + (peso ? ` · peso estimado: ${peso} kg` : '')
        + ` · emissão de ${formatKg(resultado.emissionsKgCO2e)} CO₂e`,
      recomendacao: tipoTransacao === 'fisico'
        ? 'Avaliar substituição por uma alternativa digital equivalente'
        : 'Manter o meio digital e monitorar o consumo gerado',
      reducao: reducaoPct != null ? formatPct(reducaoPct) : '—',
      reducaoSub: reducaoPct != null ? 'ao adotar o meio digital' : 'sem comparação registrada',
    })
  }

  if (resultadoComp) {
    const avoided = resultadoComp.avoidedCarbonKgCO2e
    const reducaoPct = resultadoComp.physicalEmissionsKgCO2e > 0
      ? (avoided / resultadoComp.physicalEmissionsKgCO2e) * 100
      : null

    planoLinhas.push({
      area: 'Comparação Físico × Digital',
      situacao: `Físico: ${resultadoComp.physicalQuantity}x ${resultadoComp.physicalDescription} `
        + `(${formatKg(resultadoComp.physicalEmissionsKgCO2e)}) · Digital: ${resultadoComp.digitalQuantity}x `
        + `${resultadoComp.digitalDescription} (${formatKg(resultadoComp.digitalEmissionsKgCO2e)})`,
      recomendacao: avoided >= 0
        ? `Migrar de "${resultadoComp.physicalDescription}" para "${resultadoComp.digitalDescription}"`
        : `Revisar os volumes da operação digital "${resultadoComp.digitalDescription}"`,
      reducao: reducaoPct != null ? formatPct(Math.abs(reducaoPct)) : '—',
      reducaoSub: avoided >= 0 ? 'de redução potencial no cenário digital' : 'de aumento no cenário digital',
    })
  }

  if (history.length > 0) {
    const pctEvitadoHist = (totalHistoricoFisico + totalHistoricoEvitado) > 0
      ? (totalHistoricoEvitado / (totalHistoricoFisico + totalHistoricoEvitado)) * 100
      : null

    planoLinhas.push({
      area: `Histórico acumulado (${history.length} período${history.length > 1 ? 's' : ''})`,
      situacao: `Físico: ${formatKg(totalHistoricoFisico)} · Digital: ${formatKg(totalHistoricoDigital)} · `
        + `Evitado: ${formatKg(totalHistoricoEvitado)}`,
      recomendacao: 'Acompanhar a evolução mensal na Tabela de Dados e priorizar os períodos com maior emissão física',
      reducao: pctEvitadoHist != null ? formatPct(pctEvitadoHist) : '—',
      reducaoSub: 'de carbono evitado no período registrado',
    })

    const pico = history.reduce((max, h) => h.totalPhysicalKgCO2e > (max?.totalPhysicalKgCO2e ?? -1) ? h : max, null)
    if (pico) {
      const picoPct = (pico.totalPhysicalKgCO2e + pico.totalAvoidedKgCO2e) > 0
        ? (pico.totalAvoidedKgCO2e / (pico.totalPhysicalKgCO2e + pico.totalAvoidedKgCO2e)) * 100
        : null

      planoLinhas.push({
        area: `Pico de emissão — ${pico.label}`,
        situacao: `${formatKg(pico.totalPhysicalKgCO2e)} CO₂e em ${pico.vezesNoMes}x ${pico.physicalDescription || 'operação física'}`,
        recomendacao: `Priorizar a digitalização das operações de ${pico.label}`
          + (pico.digitalDescription ? ` (ex: ${pico.digitalDescription})` : ''),
        reducao: picoPct != null ? formatPct(picoPct) : '—',
        reducaoSub: 'de redução potencial nesse período',
      })
    }
  }

  /* ── Status de implementação ── */
  const statusItems = [
    {
      titulo: 'Instalação de energia solar',
      percentual: 72,
      info: 'A conversão para energia solar atualmente está em 72% de implementação',
      lineLabel: 'Energia Solar',
    },
    {
      titulo: 'Resíduos',
      percentual: 48,
      info: 'A aplicação de reciclagem aos resíduos sólidos atualmente está em 48% de implementação.',
      lineLabel: 'Reciclagem de Resíduos',
    },
    {
      titulo: 'Digitalização de P.A',
      percentual: 37,
      info: 'A conversão de processos administrativos para o âmbito digital está em 37%.',
      lineLabel: 'Digitalização de P.A',
    },
    {
      titulo: 'P.A: Impressões',
      percentual: 72,
      info: 'A conversão para assinaturas eletrônicas e armazenamento na nuvem está em 72% de implementação',
      lineLabel: 'Assinatura Eletrônica',
    },
  ]

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.content}>

        {/* ── Seção 1: Plano De Ação ── */}
        <div className={styles.section}>
          <div className={styles.title}>Plano De Ação</div>

          {planoLinhas.length === 0 ? (
            <p className={styles.semDados}>
              Nenhum cálculo realizado ainda. Volte à Home e calcule ou compare emissões
              para gerar o plano de ação.
            </p>
          ) : (
            <div className={styles.planoTableWrapper}>
              <table className={styles.planoTable}>
                <thead>
                  <tr>
                    <th>Área</th>
                    <th>Situação identificada</th>
                    <th>Recomendações</th>
                    <th>Redução estimada</th>
                  </tr>
                </thead>
                <tbody>
                  {planoLinhas.map((linha, i) => (
                    <tr key={i}>
                      <td>{linha.area}</td>
                      <td>{linha.situacao}</td>
                      <td>{linha.recomendacao}</td>
                      <td className={styles.reducao}>
                        {linha.reducao}
                        {linha.reducaoSub && <span className={styles.reducaoSub}>{linha.reducaoSub}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Seção 2: Status de Implementação ── */}
        <div className={styles.section}>
          <div className={styles.title}>Status de Implementação</div>

          {semDados && history.length === 0 && (
            <p className={styles.semDados} style={{ padding: '0 0 1rem' }}>
              Sem dados de cálculo. Os gráficos abaixo usam valores ilustrativos —
              volte à calculadora para ver a comparação com seus dados reais.
            </p>
          )}

          {statusItems.map((item, i) => {
            const antes  = carbonBase > 0 ? carbonBase : 1
            const depois = antes * (1 - item.percentual / 100)

            const donutData = [
              { name: 'Implementado', value: item.percentual },
              { name: 'Restante', value: 100 - item.percentual },
            ]

            const lineData = [
              { label: 'Carbono emitido anteriormente', valor: parseFloat(antes.toFixed(6)) },
              { label: `Carbono emitido: ${item.lineLabel}`, valor: parseFloat(depois.toFixed(6)) },
            ]

            return (
              <div className={styles.statusItem} key={i}>
                <div className={styles.statusBadge}>{item.titulo}</div>

                <div className={styles.statusRow}>
                  {/* Informação textual */}
                  <div className={styles.statusInfo}>
                    <strong>{item.percentual}%</strong>
                    {item.info}
                  </div>

                  {/* Gráfico de pizza com % no centro */}
                  <div className={styles.donutContainer}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          innerRadius="55%"
                          outerRadius="80%"
                        >
                          <Cell fill={COR_DIGITAL} />
                          <Cell fill={COR_EVITADO} />
                        </Pie>
                        <Tooltip formatter={(v, name) => [`${v}%`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className={styles.pieCenter}>{item.percentual}%</div>
                  </div>

                  {/* Gráfico de linha comparando emissões antes/depois */}
                  <div className={styles.lineContainer}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={lineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                        <YAxis width={60} tick={{ fontSize: 11 }} tickFormatter={v => formatKg(v)} />
                        <Tooltip formatter={v => [formatKg(v) + ' CO₂e', 'Emissão']} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="valor" name="Carbono emitido" stroke={COR_FISICO} strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}

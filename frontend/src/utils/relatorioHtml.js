/**
 * Utilitário para geração do relatório consultivo de emissões de carbono.
 * Gera um documento HTML estilizado com a identidade visual da Edenred/CarbonFlow
 * que pode ser impresso/salvo como PDF pelo usuário via diálogo de impressão do navegador.
 */

/**
 * Formata um valor de emissão em kg CO₂e para a unidade mais legível.
 * @param {number} kgCO2e
 * @returns {string}
 */
function formatarEmissoes(kgCO2e) {
  const abs = Math.abs(kgCO2e)
  const sinal = kgCO2e < 0 ? '-' : ''
  if (abs >= 1) return sinal + abs.toFixed(4) + ' kg CO₂e'
  if (abs >= 0.001) return sinal + (abs * 1000).toFixed(4) + ' g CO₂e'
  return sinal + (abs * 1000000).toFixed(2) + ' mg CO₂e'
}

/**
 * Gera o texto do resumo executivo com base nos dados da comparação.
 * @param {object} dados - ComparisonResult do backend
 * @returns {string}
 */
function gerarResumoExecutivo(dados) {
  const reducaoPct =
    dados.physicalEmissionsKgCO2e > 0
      ? ((dados.avoidedCarbonKgCO2e / dados.physicalEmissionsKgCO2e) * 100).toFixed(1)
      : 0

  if (dados.avoidedCarbonKgCO2e > 0) {
    return `Esta análise <strong>simula</strong> o impacto ambiental de
      <strong>${dados.physicalQuantity} unidade(s)</strong> de
      <em>${dados.physicalDescription}</em> em contraste com
      <strong>${dados.digitalQuantity} unidade(s)</strong> de
      <em>${dados.digitalDescription}</em>.
      Os resultados indicam que, caso o meio digital fosse adotado, haveria uma redução
      potencial de <strong>${reducaoPct}%</strong> nas emissões de CO₂e,
      representando <strong>${formatarEmissoes(dados.avoidedCarbonKgCO2e)}</strong> de
      carbono potencialmente evitado. Esses dados são estimativas baseadas em fatores
      de emissão padronizados e evidenciam o potencial da digitalização como estratégia
      de sustentabilidade.`
  }

  if (dados.avoidedCarbonKgCO2e < 0) {
    return `Esta análise <strong>simula</strong> o impacto ambiental de
      <strong>${dados.physicalQuantity} unidade(s)</strong> de
      <em>${dados.physicalDescription}</em> em contraste com
      <strong>${dados.digitalQuantity} unidade(s)</strong> de
      <em>${dados.digitalDescription}</em>.
      No cenário hipotético analisado, as emissões digitais superariam as físicas em
      <strong>${formatarEmissoes(Math.abs(dados.avoidedCarbonKgCO2e))}</strong>.
      Recomenda-se revisar os volumes e tipos de operação para identificar
      oportunidades de otimização ambiental.`
  }

  return `Esta análise <strong>simula</strong> o impacto ambiental de
    <strong>${dados.physicalQuantity} unidade(s)</strong> de
    <em>${dados.physicalDescription}</em> em contraste com
    <strong>${dados.digitalQuantity} unidade(s)</strong> de
    <em>${dados.digitalDescription}</em>.
    O cenário hipotético indica emissões equivalentes entre os dois meios para os volumes informados.`
}

/**
 * Gera o HTML completo do relatório consultivo.
 * @param {object} dados - ComparisonResult do backend (retornado pelo endpoint /compare)
 * @returns {string} - String HTML completa pronta para abrir em nova janela
 */
export function gerarHtmlRelatorio(dados) {
  const agora = new Date()
  const dataFormatada = agora.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  const horaFormatada = agora.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const reducaoPct =
    dados.physicalEmissionsKgCO2e > 0
      ? ((dados.avoidedCarbonKgCO2e / dados.physicalEmissionsKgCO2e) * 100).toFixed(1)
      : '—'

  const avoidedLabel =
    dados.avoidedCarbonKgCO2e >= 0 ? 'Carbono potencialmente evitado' : 'Carbono adicional no cenário digital'

  const avoidedColor = dados.avoidedCarbonKgCO2e >= 0 ? '#f72717' : '#b71c1c'

  const resumoExecutivo = gerarResumoExecutivo(dados)

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Relatório Consultivo de Emissões — CarbonFlow</title>
  <style>
    /* ── Reset ─────────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* ── Base ──────────────────────────────────────── */
    body {
      font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
      background: #ffffff;
      color: #162056;
      font-size: 14px;
      line-height: 1.5;
    }

    /* ── Header ────────────────────────────────────── */
    .header {
      background: #162056;
      padding: 28px 40px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }
    .header-left { display: flex; flex-direction: column; gap: 4px; }
    .header-logo {
      color: #f7faf7;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.3px;
    }
    .header-logo span { color: #f72717; }
    .header-subtitle {
      color: rgba(247, 250, 247, 0.75);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .header-right { text-align: right; }
    .header-badge {
      display: inline-block;
      background: #f72717;
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 6px;
    }
    .header-date {
      color: rgba(247, 250, 247, 0.7);
      font-size: 12px;
    }

    /* ── Accent bar ────────────────────────────────── */
    .accent-bar { height: 4px; background: #f72717; }

    /* ── Content ───────────────────────────────────── */
    .content { padding: 36px 40px; max-width: 860px; margin: 0 auto; }

    /* ── Sections ──────────────────────────────────── */
    .section { margin-bottom: 32px; }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      color: #f72717;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 1.5px solid #f72717;
    }

    /* ── Executive summary ─────────────────────────── */
    .summary-box {
      background: #162056;
      color: #f7faf7;
      padding: 20px 24px;
      border-radius: 8px;
      font-size: 13.5px;
      line-height: 1.7;
    }
    .summary-box strong { color: #ffffff; }
    .summary-box em { font-style: normal; color: rgba(247, 250, 247, 0.85); }

    /* ── Metrics row ───────────────────────────────── */
    .metrics-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
      margin-bottom: 28px;
    }
    .metric-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 14px 16px;
    }
    .metric-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #888;
      margin-bottom: 4px;
    }
    .metric-value {
      font-size: 20px;
      font-weight: 700;
      color: #162056;
    }
    .metric-desc {
      font-size: 11px;
      color: #666;
      margin-top: 2px;
    }

    /* ── Comparison table ──────────────────────────── */
    table {
      width: 100%;
      border-collapse: collapse;
    }
    thead tr {
      background: #162056;
      color: #f7faf7;
    }
    thead th {
      padding: 10px 14px;
      font-size: 11px;
      font-weight: 600;
      text-align: left;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    tbody tr:nth-child(even) { background: #f4f6f4; }
    tbody tr:nth-child(odd) { background: #ffffff; }
    tbody td {
      padding: 10px 14px;
      font-size: 13px;
      border-bottom: 0.5px solid #e8e8e8;
      color: #162056;
    }
    .td-accent { font-weight: 600; }
    .tag {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .tag-fisico { background: #e8eaf6; color: #162056; }
    .tag-digital { background: #e8f5e9; color: #1b5e20; }

    /* ── Avoided carbon highlight ──────────────────── */
    .avoided-box {
      border-radius: 8px;
      padding: 24px 28px;
      text-align: center;
      border: 2px solid;
    }
    .avoided-box .avoided-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      opacity: 0.85;
      margin-bottom: 8px;
    }
    .avoided-box .avoided-value {
      font-size: 40px;
      font-weight: 800;
      line-height: 1;
    }
    .avoided-box .avoided-sub {
      font-size: 12px;
      opacity: 0.75;
      margin-top: 8px;
    }
    .avoided-box .avoided-pct {
      display: inline-block;
      margin-top: 10px;
      font-size: 14px;
      font-weight: 600;
      opacity: 0.9;
    }

    /* ── Recommendation ────────────────────────────── */
    .rec-box {
      background: #f4f6f4;
      border-left: 4px solid #162056;
      padding: 16px 20px;
      border-radius: 0 8px 8px 0;
      font-size: 13px;
      line-height: 1.65;
      color: #333;
    }
    .rec-box strong { color: #162056; }

    /* ── Footer ────────────────────────────────────── */
    .footer {
      margin-top: 40px;
      padding: 16px 40px;
      background: #162056;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .footer-brand {
      color: #f7faf7;
      font-size: 12px;
      font-weight: 500;
    }
    .footer-brand span { color: #f72717; }
    .footer-note {
      color: rgba(247, 250, 247, 0.6);
      font-size: 11px;
      text-align: right;
    }

    /* ── Print button (não aparece no PDF) ─────────── */
    .print-btn {
      display: block;
      margin: 24px auto 0;
      padding: 10px 28px;
      background: #162056;
      color: #f7faf7;
      border: 1.5px solid #f72717;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s;
    }
    .print-btn:hover { background: #0f1840; }

    /* ── Print media ───────────────────────────────── */
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
      .content { padding: 28px 32px; }
      .footer { page-break-inside: avoid; }
    }
  </style>
</head>
<body>

  <!-- ══ HEADER ══════════════════════════════════════════ -->
  <div class="header">
    <div class="header-left">
      <div class="header-logo">Carbon<span>Flow</span></div>
      <div class="header-subtitle">Relatório Consultivo de Emissões de Carbono</div>
    </div>
    <div class="header-right">
      <div class="header-badge">Confidencial</div>
      <div class="header-date">Emitido em ${dataFormatada} às ${horaFormatada}</div>
    </div>
  </div>
  <div class="accent-bar"></div>

  <!-- ══ CONTENT ══════════════════════════════════════════ -->
  <div class="content">

    <!-- Resumo Executivo -->
    <div class="section">
      <div class="section-title">Resumo Executivo</div>
      <div class="summary-box">
        <p>${resumoExecutivo}</p>
      </div>
    </div>

    <!-- Métricas-chave -->
    <div class="metrics-row">
      <div class="metric-card">
        <div class="metric-label">Emissões — Físico</div>
        <div class="metric-value" style="color: #c62828;">${formatarEmissoes(dados.physicalEmissionsKgCO2e)}</div>
        <div class="metric-desc">${dados.physicalQuantity} unidade(s) · ${dados.physicalDescription}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Emissões — Digital</div>
        <div class="metric-value" style="color: #2e7d32;">${formatarEmissoes(dados.digitalEmissionsKgCO2e)}</div>
        <div class="metric-desc">${dados.digitalQuantity} unidade(s) · ${dados.digitalDescription}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Redução percentual</div>
        <div class="metric-value" style="color: #162056;">${reducaoPct}%</div>
        <div class="metric-desc">redução potencial ao adotar o meio digital</div>
      </div>
    </div>

    <!-- Comparação Detalhada -->
    <div class="section">
      <div class="section-title">Comparação Detalhada de Emissões</div>
      <table>
        <thead>
          <tr>
            <th>Meio</th>
            <th>Tipo de Operação</th>
            <th>Quantidade</th>
            <th>Emissões Totais (kg CO₂e)</th>
            <th>Valor Formatado</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="tag tag-fisico">Físico</span></td>
            <td class="td-accent">${dados.physicalDescription}</td>
            <td>${dados.physicalQuantity} unid.</td>
            <td>${dados.physicalEmissionsKgCO2e.toFixed(8)}</td>
            <td><strong>${formatarEmissoes(dados.physicalEmissionsKgCO2e)}</strong></td>
          </tr>
          <tr>
            <td><span class="tag tag-digital">Digital</span></td>
            <td class="td-accent">${dados.digitalDescription}</td>
            <td>${dados.digitalQuantity} unid.</td>
            <td>${dados.digitalEmissionsKgCO2e.toFixed(8)}</td>
            <td><strong>${formatarEmissoes(dados.digitalEmissionsKgCO2e)}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Carbono Evitado -->
    <div class="section">
      <div class="section-title">${avoidedLabel}</div>
      <div class="avoided-box" style="border-color: ${avoidedColor}; color: ${avoidedColor}; background: ${dados.avoidedCarbonKgCO2e >= 0 ? '#fff5f5' : '#fff8f8'};">
        <div class="avoided-label">${avoidedLabel}</div>
        <div class="avoided-value">${formatarEmissoes(dados.avoidedCarbonKgCO2e)}</div>
        <div class="avoided-sub">${dados.avoidedCarbonKgCO2e.toFixed(8)} kg CO₂e (valor exato)</div>
        ${dados.avoidedCarbonKgCO2e >= 0
          ? `<div class="avoided-pct">≈ ${reducaoPct}% de redução em relação ao meio físico</div>`
          : ''}
      </div>
    </div>

    <!-- Recomendação -->
    <div class="section">
      <div class="section-title">Recomendação Consultiva</div>
      <div class="rec-box">
        ${dados.avoidedCarbonKgCO2e >= 0
          ? `<strong>Adoção do meio digital recomendada.</strong>
            A simulação indica que substituir <em>${dados.physicalDescription}</em> por
            <em>${dados.digitalDescription}</em> poderia reduzir as emissões em
            aproximadamente ${reducaoPct}%. Trata-se de um cenário hipotético baseado
            em fatores de emissão padronizados — os valores reais dependerão do volume
            efetivo de operações. Recomenda-se avaliar a viabilidade da transição e
            monitorar os indicadores reais ao longo do tempo.`
          : `<strong>Atenção: revisão dos volumes recomendada.</strong>
            No cenário hipotético analisado, o meio digital apresentaria emissões
            superiores ao físico. Isso pode ocorrer por diferença significativa nos
            volumes ou por características específicas da operação. Recomenda-se revisar
            os dados de entrada e avaliar oportunidades de otimização.`}
      </div>
    </div>

  </div>
  <!-- ══ FIM CONTENT ══════════════════════════════════════ -->

  <!-- Botão de impressão (não aparece no PDF) -->
  <div class="no-print" style="text-align: center; padding: 0 40px 32px;">
    <button class="print-btn" onclick="window.print()">
      Salvar como PDF / Imprimir
    </button>
    <p style="font-size: 11px; color: #888; margin-top: 8px;">
      Utilize "Salvar como PDF" no diálogo de impressão para gerar o arquivo.
    </p>
  </div>

  <!-- ══ FOOTER ════════════════════════════════════════════ -->
  <div class="footer">
    <div class="footer-brand">Carbon<span>Flow</span> — Powered by Edenred</div>
    <div class="footer-note">
      Documento gerado automaticamente · ${dataFormatada}<br />
      Os valores são estimativas baseadas em fatores de emissão padronizados.
    </div>
  </div>

</body>
</html>`
}

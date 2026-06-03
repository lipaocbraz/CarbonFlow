package com.carbonflow.service;

import com.carbonflow.model.ComparisonRequest;
import com.carbonflow.model.ComparisonResult;
import com.carbonflow.model.PeriodData;
import com.carbonflow.model.ReportRequest;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
public class ReportService {

    // Identidade visual Edenred / CarbonFlow
    private static final Color NAVY      = new Color(22,  32,  86);
    private static final Color RED       = new Color(247, 39,  23);
    private static final Color LIGHT     = new Color(247, 250, 247);
    private static final Color LIGHT_GRAY = new Color(244, 246, 244);
    private static final Color BORDER_GRAY = new Color(224, 224, 224);

    private final EmissionService emissionService;

    public ReportService(EmissionService emissionService) {
        this.emissionService = emissionService;
    }

    /**
     * Gera os bytes do relatório PDF a partir dos parâmetros da comparação.
     * Recalcula no servidor para garantir integridade dos dados.
     */
    public byte[] generateReport(ReportRequest request) {
        // Converte ReportRequest → ComparisonRequest e recalcula no servidor
        ComparisonRequest compReq = new ComparisonRequest();
        compReq.setPhysicalOperationType(request.getPhysicalOperationType());
        compReq.setPhysicalQuantity(request.getPhysicalQuantity());
        compReq.setDigitalOperationType(request.getDigitalOperationType());
        compReq.setDigitalQuantity(request.getDigitalQuantity());

        ComparisonResult result = emissionService.compare(compReq);

        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 40f, 40f, 40f, 40f);
            PdfWriter.getInstance(document, baos);

            document.open();

            addHeader(document);
            addSpacer(document, 14f);
            addExecutiveSummary(document, result);
            addSpacer(document, 10f);
            addMetricsRow(document, result);
            addSpacer(document, 10f);
            addComparisonTable(document, result);
            addSpacer(document, 10f);
            addAvoidedCarbon(document, result);
            addSpacer(document, 10f);
            addRecommendation(document, result);

            if (request.getPeriods() != null && !request.getPeriods().isEmpty()) {
                addSpacer(document, 10f);
                addTemporalHistory(document, request.getPeriods());
            }

            addSpacer(document, 24f);
            addFooter(document);

            document.close();
            return baos.toByteArray();

        } catch (DocumentException e) {
            throw new RuntimeException("Erro ao gerar o relatório PDF: " + e.getMessage(), e);
        }
    }

    // ── Cabeçalho ────────────────────────────────────────────
    private void addHeader(Document document) throws DocumentException {
        String dataHora = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm"));

        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100f);
        headerTable.setWidths(new float[]{2f, 1.5f});

        // Coluna esquerda: nome do sistema + subtítulo
        Paragraph leftPara = new Paragraph();
        leftPara.add(new Chunk("CarbonFlow\n",
                new Font(Font.HELVETICA, 20, Font.BOLD, LIGHT)));
        leftPara.add(new Chunk("Relatório Consultivo de Emissões de Carbono",
                new Font(Font.HELVETICA, 9, Font.NORMAL, new Color(190, 196, 215))));

        PdfPCell leftCell = new PdfPCell(leftPara);
        leftCell.setBackgroundColor(NAVY);
        leftCell.setBorder(Rectangle.NO_BORDER);
        leftCell.setPadding(20f);
        headerTable.addCell(leftCell);

        // Coluna direita: badge + data
        Paragraph rightPara = new Paragraph();
        rightPara.setAlignment(Element.ALIGN_RIGHT);
        rightPara.add(new Chunk("RELATÓRIO CONSULTIVO\n",
                new Font(Font.HELVETICA, 8, Font.BOLD, RED)));
        rightPara.add(new Chunk("Emitido em " + dataHora,
                new Font(Font.HELVETICA, 8, Font.NORMAL, new Color(175, 181, 200))));

        PdfPCell rightCell = new PdfPCell(rightPara);
        rightCell.setBackgroundColor(NAVY);
        rightCell.setBorder(Rectangle.NO_BORDER);
        rightCell.setPadding(20f);
        rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        headerTable.addCell(rightCell);

        document.add(headerTable);

        // Barra de destaque vermelha
        PdfPTable accentBar = new PdfPTable(1);
        accentBar.setWidthPercentage(100f);
        PdfPCell accentCell = new PdfPCell(new Phrase(" "));
        accentCell.setBackgroundColor(RED);
        accentCell.setBorder(Rectangle.NO_BORDER);
        accentCell.setFixedHeight(4f);
        accentBar.addCell(accentCell);
        document.add(accentBar);
    }

    // ── Resumo Executivo ─────────────────────────────────────
    private void addExecutiveSummary(Document document, ComparisonResult result) throws DocumentException {
        addSectionTitle(document, "RESUMO EXECUTIVO");

        String reducaoPct = calcReducaoPct(result);
        String texto;

        if (result.getAvoidedCarbonKgCO2e() > 0) {
            texto = String.format(
                "Esta análise comparativa simula o impacto ambiental de %d unidade(s) de %s " +
                "em contraste com %d unidade(s) de %s. Os resultados indicam que, caso o meio " +
                "digital fosse adotado, haveria uma redução potencial de %s nas emissões de CO2e, " +
                "representando %s de carbono potencialmente evitado. Esses dados evidenciam o " +
                "potencial estratégico da digitalização como alavanca de sustentabilidade.",
                result.getPhysicalQuantity(), result.getPhysicalDescription(),
                result.getDigitalQuantity(),  result.getDigitalDescription(),
                reducaoPct, formatarEmissoes(result.getAvoidedCarbonKgCO2e())
            );
        } else if (result.getAvoidedCarbonKgCO2e() < 0) {
            texto = String.format(
                "Esta análise comparativa simula o impacto ambiental de %d unidade(s) de %s " +
                "em contraste com %d unidade(s) de %s. No cenário hipotético analisado, as emissões " +
                "digitais superariam as físicas em %s. Recomenda-se revisar os volumes e tipos de " +
                "operação considerados para identificar oportunidades de otimização ambiental.",
                result.getPhysicalQuantity(), result.getPhysicalDescription(),
                result.getDigitalQuantity(),  result.getDigitalDescription(),
                formatarEmissoes(Math.abs(result.getAvoidedCarbonKgCO2e()))
            );
        } else {
            texto = String.format(
                "Esta análise comparativa simula o impacto ambiental de %d unidade(s) de %s " +
                "em contraste com %d unidade(s) de %s. " +
                "O cenário hipotético indica emissões equivalentes entre os dois meios para os volumes informados.",
                result.getPhysicalQuantity(), result.getPhysicalDescription(),
                result.getDigitalQuantity(),  result.getDigitalDescription()
            );
        }

        Paragraph summaryPara = new Paragraph(texto,
                new Font(Font.HELVETICA, 10, Font.NORMAL, LIGHT));
        summaryPara.setLeading(16f);

        PdfPTable summaryTable = new PdfPTable(1);
        summaryTable.setWidthPercentage(100f);
        PdfPCell summaryCell = new PdfPCell(summaryPara);
        summaryCell.setBackgroundColor(NAVY);
        summaryCell.setBorder(Rectangle.NO_BORDER);
        summaryCell.setPadding(16f);
        summaryTable.addCell(summaryCell);
        document.add(summaryTable);
    }

    // ── Métricas principais (3 cartões) ──────────────────────
    private void addMetricsRow(Document document, ComparisonResult result) throws DocumentException {
        PdfPTable table = new PdfPTable(3);
        table.setWidthPercentage(100f);

        addMetricCard(table,
                "EMISSÕES — FÍSICO",
                formatarEmissoes(result.getPhysicalEmissionsKgCO2e()),
                result.getPhysicalQuantity() + " unid. · " + result.getPhysicalDescription(),
                new Color(198, 40, 40));

        addMetricCard(table,
                "EMISSÕES — DIGITAL",
                formatarEmissoes(result.getDigitalEmissionsKgCO2e()),
                result.getDigitalQuantity() + " unid. · " + result.getDigitalDescription(),
                new Color(46, 125, 50));

        addMetricCard(table,
                "REDUÇÃO PERCENTUAL",
                calcReducaoPct(result),
                "redução potencial ao adotar o meio digital",
                NAVY);

        document.add(table);
    }

    private void addMetricCard(PdfPTable table, String label, String value, String desc, Color valueColor) {
        Paragraph content = new Paragraph();
        content.add(new Chunk(label + "\n",
                new Font(Font.HELVETICA, 8, Font.BOLD, new Color(136, 136, 136))));
        content.add(new Chunk(value + "\n",
                new Font(Font.HELVETICA, 15, Font.BOLD, valueColor)));
        content.add(new Chunk(desc,
                new Font(Font.HELVETICA, 9, Font.NORMAL, new Color(102, 102, 102))));

        PdfPCell cell = new PdfPCell(content);
        cell.setBorderColor(BORDER_GRAY);
        cell.setBorderWidth(0.5f);
        cell.setPadding(12f);
        table.addCell(cell);
    }

    // ── Tabela de comparação detalhada ───────────────────────
    private void addComparisonTable(Document document, ComparisonResult result) throws DocumentException {
        addSectionTitle(document, "COMPARAÇÃO DETALHADA DE EMISSÕES");

        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100f);
        table.setWidths(new float[]{1f, 2.5f, 1f, 2f, 1.5f});

        // Cabeçalho da tabela
        String[] headers = {"Meio", "Tipo de Operação", "Quantidade", "Emissões (kg CO2e)", "Valor"};
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h,
                    new Font(Font.HELVETICA, 9, Font.BOLD, LIGHT)));
            cell.setBackgroundColor(NAVY);
            cell.setBorder(Rectangle.NO_BORDER);
            cell.setPadding(8f);
            table.addCell(cell);
        }

        // Linha física
        addTableRow(table,
                "FÍSICO",
                result.getPhysicalDescription(),
                result.getPhysicalQuantity() + " unid.",
                String.format(Locale.US, "%.8f", result.getPhysicalEmissionsKgCO2e()),
                formatarEmissoes(result.getPhysicalEmissionsKgCO2e()),
                new Color(232, 234, 246));

        // Linha digital
        addTableRow(table,
                "DIGITAL",
                result.getDigitalDescription(),
                result.getDigitalQuantity() + " unid.",
                String.format(Locale.US, "%.8f", result.getDigitalEmissionsKgCO2e()),
                formatarEmissoes(result.getDigitalEmissionsKgCO2e()),
                new Color(232, 245, 233));

        document.add(table);
    }

    private void addTableRow(PdfPTable table, String meio, String operacao,
                              String quantidade, String valorExato, String valorFormatado,
                              Color bgColor) {
        Font rowFont  = new Font(Font.HELVETICA, 9, Font.NORMAL, NAVY);
        Font boldFont = new Font(Font.HELVETICA, 9, Font.BOLD,   NAVY);

        String[] values = {meio, operacao, quantidade, valorExato, valorFormatado};
        Font[]   fonts  = {boldFont, rowFont, rowFont, rowFont, boldFont};

        for (int i = 0; i < values.length; i++) {
            PdfPCell cell = new PdfPCell(new Phrase(values[i], fonts[i]));
            cell.setBackgroundColor(bgColor);
            cell.setBorderColor(BORDER_GRAY);
            cell.setBorderWidth(0.5f);
            cell.setPadding(8f);
            table.addCell(cell);
        }
    }

    // ── Carbono evitado (destaque) ───────────────────────────
    private void addAvoidedCarbon(Document document, ComparisonResult result) throws DocumentException {
        boolean positivo = result.getAvoidedCarbonKgCO2e() >= 0;
        addSectionTitle(document, positivo ? "CARBONO POTENCIALMENTE EVITADO" : "CARBONO ADICIONAL NO CENÁRIO DIGITAL");

        String valorExato = String.format(Locale.US, "%.8f kg CO2e (valor exato)", result.getAvoidedCarbonKgCO2e());
        String pctTexto   = (positivo && result.getPhysicalEmissionsKgCO2e() > 0)
                ? "  (~" + calcReducaoPct(result) + " de redução em relação ao físico)"
                : "";

        Paragraph content = new Paragraph();
        content.setAlignment(Element.ALIGN_CENTER);
        content.add(new Chunk(formatarEmissoes(result.getAvoidedCarbonKgCO2e()) + "\n",
                new Font(Font.HELVETICA, 28, Font.BOLD, RED)));
        content.add(new Chunk(valorExato + pctTexto,
                new Font(Font.HELVETICA, 9, Font.NORMAL, new Color(102, 102, 102))));

        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100f);
        PdfPCell cell = new PdfPCell(content);
        cell.setBorderColor(RED);
        cell.setBorderWidth(1.5f);
        cell.setPadding(16f);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
        document.add(table);
    }

    // ── Recomendação consultiva ──────────────────────────────
    private void addRecommendation(Document document, ComparisonResult result) throws DocumentException {
        addSectionTitle(document, "RECOMENDAÇÃO CONSULTIVA");

        String texto;
        if (result.getAvoidedCarbonKgCO2e() >= 0) {
            texto = String.format(
                "Adoção do meio digital recomendada. A simulação indica que substituir %s por %s " +
                "poderia reduzir as emissões em aproximadamente %s. Trata-se de um cenário hipotético " +
                "baseado em fatores de emissão padronizados — os valores reais dependerão do volume " +
                "efetivo de operações. Para organizações com metas de descarbonização, recomenda-se " +
                "avaliar a viabilidade da transição e monitorar os indicadores reais ao longo do tempo.",
                result.getPhysicalDescription(), result.getDigitalDescription(), calcReducaoPct(result)
            );
        } else {
            texto =
                "Atenção: revisão dos volumes recomendada. No cenário avaliado, o meio digital " +
                "apresenta emissões superiores ao físico. Isso pode ocorrer por diferença significativa " +
                "nos volumes ou por características específicas da operação. Recomenda-se revisar " +
                "os dados de entrada e avaliar oportunidades de otimização das operações digitais selecionadas.";
        }

        // Borda esquerda azul + fundo cinza claro (simulando o estilo "rec-box" do HTML)
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100f);
        table.setWidths(new float[]{0.04f, 1f});

        PdfPCell borderCell = new PdfPCell(new Phrase(" "));
        borderCell.setBackgroundColor(NAVY);
        borderCell.setBorder(Rectangle.NO_BORDER);
        table.addCell(borderCell);

        PdfPCell textCell = new PdfPCell(new Paragraph(texto,
                new Font(Font.HELVETICA, 10, Font.NORMAL, new Color(51, 51, 51))));
        textCell.setBackgroundColor(LIGHT_GRAY);
        textCell.setBorder(Rectangle.NO_BORDER);
        textCell.setPadding(14f);
        table.addCell(textCell);

        document.add(table);
    }

    // ── Histórico por período ────────────────────────────────
    private void addTemporalHistory(Document document, List<PeriodData> periods) throws DocumentException {
        addSectionTitle(document, "HISTÓRICO POR PERÍODO");

        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100f);
        table.setWidths(new float[]{1.2f, 0.8f, 2f, 2f, 1.5f});

        String[] headers = {"Período", "Ocorrências/mês", "Físico (total)", "Digital (total)", "Potencial evitado"};
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, new Font(Font.HELVETICA, 9, Font.BOLD, LIGHT)));
            cell.setBackgroundColor(NAVY);
            cell.setBorder(Rectangle.NO_BORDER);
            cell.setPadding(7f);
            table.addCell(cell);
        }

        boolean alt = false;
        double acumFisico = 0, acumDigital = 0, acumEvitado = 0;
        for (PeriodData p : periods) {
            Color bg = alt ? LIGHT_GRAY : new Color(255, 255, 255);
            Font f = new Font(Font.HELVETICA, 9, Font.NORMAL, NAVY);
            String[] vals = {
                p.getPeriodLabel(),
                String.valueOf(p.getVezesNoMes()) + "x",
                formatarEmissoes(p.getTotalPhysicalKgCO2e()),
                formatarEmissoes(p.getTotalDigitalKgCO2e()),
                formatarEmissoes(p.getTotalAvoidedKgCO2e()),
            };
            for (String v : vals) {
                PdfPCell cell = new PdfPCell(new Phrase(v, f));
                cell.setBackgroundColor(bg);
                cell.setBorderColor(BORDER_GRAY);
                cell.setBorderWidth(0.5f);
                cell.setPadding(7f);
                table.addCell(cell);
            }
            acumFisico  += p.getTotalPhysicalKgCO2e();
            acumDigital += p.getTotalDigitalKgCO2e();
            acumEvitado += p.getTotalAvoidedKgCO2e();
            alt = !alt;
        }

        // Linha de totais
        Font boldBlue = new Font(Font.HELVETICA, 9, Font.BOLD, NAVY);
        String[] totals = {"TOTAL", "—", formatarEmissoes(acumFisico), formatarEmissoes(acumDigital), formatarEmissoes(acumEvitado)};
        for (String v : totals) {
            PdfPCell cell = new PdfPCell(new Phrase(v, boldBlue));
            cell.setBackgroundColor(new Color(232, 234, 246));
            cell.setBorderColor(BORDER_GRAY);
            cell.setBorderWidth(0.5f);
            cell.setPadding(7f);
            table.addCell(cell);
        }

        document.add(table);
    }

    // ── Rodapé ───────────────────────────────────────────────
    private void addFooter(Document document) throws DocumentException {
        String data = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

        PdfPTable footerTable = new PdfPTable(2);
        footerTable.setWidthPercentage(100f);

        PdfPCell leftCell = new PdfPCell(new Paragraph("CarbonFlow — Powered by Edenred",
                new Font(Font.HELVETICA, 9, Font.BOLD, LIGHT)));
        leftCell.setBackgroundColor(NAVY);
        leftCell.setBorder(Rectangle.NO_BORDER);
        leftCell.setPadding(14f);
        footerTable.addCell(leftCell);

        Paragraph rightPara = new Paragraph();
        rightPara.setAlignment(Element.ALIGN_RIGHT);
        rightPara.add(new Chunk("Documento gerado automaticamente · " + data + "\n",
                new Font(Font.HELVETICA, 8, Font.NORMAL, new Color(175, 181, 200))));
        rightPara.add(new Chunk("Os valores são estimativas baseadas em fatores de emissão padronizados.",
                new Font(Font.HELVETICA, 7, Font.NORMAL, new Color(150, 155, 170))));

        PdfPCell rightCell = new PdfPCell(rightPara);
        rightCell.setBackgroundColor(NAVY);
        rightCell.setBorder(Rectangle.NO_BORDER);
        rightCell.setPadding(14f);
        rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        footerTable.addCell(rightCell);

        document.add(footerTable);
    }

    // ── Helpers ──────────────────────────────────────────────

    /** Adiciona um título de seção com linha vermelha abaixo. */
    private void addSectionTitle(Document document, String title) throws DocumentException {
        Paragraph titlePara = new Paragraph(title,
                new Font(Font.HELVETICA, 9, Font.BOLD, RED));
        titlePara.setSpacingBefore(6f);
        titlePara.setSpacingAfter(6f);
        document.add(titlePara);

        PdfPTable lineTable = new PdfPTable(1);
        lineTable.setWidthPercentage(100f);
        PdfPCell lineCell = new PdfPCell(new Phrase(" "));
        lineCell.setBackgroundColor(RED);
        lineCell.setBorder(Rectangle.NO_BORDER);
        lineCell.setFixedHeight(1.5f);
        lineTable.addCell(lineCell);
        lineTable.setSpacingAfter(10f);
        document.add(lineTable);
    }

    /** Adiciona espaçamento vertical entre seções. */
    private void addSpacer(Document document, float height) throws DocumentException {
        Paragraph spacer = new Paragraph(" ");
        spacer.setSpacingBefore(height / 2f);
        spacer.setSpacingAfter(height / 2f);
        document.add(spacer);
    }

    /** Calcula e formata o percentual de redução de emissões. */
    private String calcReducaoPct(ComparisonResult result) {
        if (result.getPhysicalEmissionsKgCO2e() <= 0) return "—";
        double pct = (result.getAvoidedCarbonKgCO2e() / result.getPhysicalEmissionsKgCO2e()) * 100;
        return String.format(Locale.US, "%.1f%%", pct);
    }

    /**
     * Formata um valor em kg CO2e para a unidade mais legível,
     * espelhando a função formatarEmissoes() do frontend.
     */
    private String formatarEmissoes(double kgCO2e) {
        double abs  = Math.abs(kgCO2e);
        String sinal = kgCO2e < 0 ? "-" : "";
        if (abs >= 1)     return String.format(Locale.US, "%s%.4f kg CO2e",  sinal, abs);
        if (abs >= 0.001) return String.format(Locale.US, "%s%.4f g CO2e",   sinal, abs * 1000);
        return               String.format(Locale.US, "%s%.2f mg CO2e", sinal, abs * 1_000_000);
    }
}

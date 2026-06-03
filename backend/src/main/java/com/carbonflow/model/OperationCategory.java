package com.carbonflow.model;

public enum OperationCategory {
    VOUCHER("Voucher", "VOUCHER_PAPEL", "VOUCHER_DIGITAL"),
    CARTAO("Cartão de benefício", "CARTAO_PLASTICO", "CARTAO_VIRTUAL"),
    EXTRATO("Extrato", "EXTRATO_IMPRESSO", "EXTRATO_DIGITAL"),
    CORRESPONDENCIA("Correspondência / Transação", "CORRESPONDENCIA_POSTAL", "TRANSACAO_APP");

    private final String label;
    private final String physicalOperationType;
    private final String digitalOperationType;

    OperationCategory(String label, String physicalOperationType, String digitalOperationType) {
        this.label = label;
        this.physicalOperationType = physicalOperationType;
        this.digitalOperationType = digitalOperationType;
    }

    public String getLabel() { return label; }
    public String getPhysicalOperationType() { return physicalOperationType; }
    public String getDigitalOperationType() { return digitalOperationType; }
}
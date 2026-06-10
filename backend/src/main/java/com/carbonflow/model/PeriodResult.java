package com.carbonflow.model;

public class PeriodResult {
    private String operationCategory;
    private String operationLabel;
    private String period;
    private long physicalQuantity;
    private long digitalQuantity;
    private String physicalDescription;
    private String digitalDescription;
    private double physicalEmissionsKgCO2e;
    private double digitalEmissionsKgCO2e;
    private double avoidedCarbonKgCO2e;

    public PeriodResult(
            String operationCategory,
            String operationLabel,
            String period,
            long physicalQuantity,
            long digitalQuantity,
            String physicalDescription,
            String digitalDescription,
            double physicalEmissionsKgCO2e,
            double digitalEmissionsKgCO2e
    ) {
        this.operationCategory = operationCategory;
        this.operationLabel = operationLabel;
        this.period = period;
        this.physicalQuantity = physicalQuantity;
        this.digitalQuantity = digitalQuantity;
        this.physicalDescription = physicalDescription;
        this.digitalDescription = digitalDescription;
        this.physicalEmissionsKgCO2e = physicalEmissionsKgCO2e;
        this.digitalEmissionsKgCO2e = digitalEmissionsKgCO2e;
        this.avoidedCarbonKgCO2e = physicalEmissionsKgCO2e - digitalEmissionsKgCO2e;
    }

    public String getOperationCategory() { return operationCategory; }
    public String getOperationLabel() { return operationLabel; }
    public String getPeriod() { return period; }
    public long getPhysicalQuantity() { return physicalQuantity; }
    public long getDigitalQuantity() { return digitalQuantity; }
    public String getPhysicalDescription() { return physicalDescription; }
    public String getDigitalDescription() { return digitalDescription; }
    public double getPhysicalEmissionsKgCO2e() { return physicalEmissionsKgCO2e; }
    public double getDigitalEmissionsKgCO2e() { return digitalEmissionsKgCO2e; }
    public double getAvoidedCarbonKgCO2e() { return avoidedCarbonKgCO2e; }
}
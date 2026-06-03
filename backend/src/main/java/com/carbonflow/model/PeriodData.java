package com.carbonflow.model;

public class PeriodData {
    private String periodLabel;
    private int vezesNoMes;
    private String physicalDescription;
    private String digitalDescription;
    private double totalPhysicalKgCO2e;
    private double totalDigitalKgCO2e;
    private double totalAvoidedKgCO2e;

    public String getPeriodLabel()           { return periodLabel; }
    public void setPeriodLabel(String v)     { this.periodLabel = v; }

    public int getVezesNoMes()               { return vezesNoMes; }
    public void setVezesNoMes(int v)         { this.vezesNoMes = v; }

    public String getPhysicalDescription()   { return physicalDescription; }
    public void setPhysicalDescription(String v) { this.physicalDescription = v; }

    public String getDigitalDescription()    { return digitalDescription; }
    public void setDigitalDescription(String v)  { this.digitalDescription = v; }

    public double getTotalPhysicalKgCO2e()   { return totalPhysicalKgCO2e; }
    public void setTotalPhysicalKgCO2e(double v) { this.totalPhysicalKgCO2e = v; }

    public double getTotalDigitalKgCO2e()    { return totalDigitalKgCO2e; }
    public void setTotalDigitalKgCO2e(double v)  { this.totalDigitalKgCO2e = v; }

    public double getTotalAvoidedKgCO2e()    { return totalAvoidedKgCO2e; }
    public void setTotalAvoidedKgCO2e(double v)  { this.totalAvoidedKgCO2e = v; }
}

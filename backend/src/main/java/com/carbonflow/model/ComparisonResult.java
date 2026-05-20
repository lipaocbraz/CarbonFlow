package com.carbonflow.model;

public class ComparisonResult {
    private String physicalOperationType;
    private String physicalDescription;
    private long physicalQuantity;
    private double physicalEmissionsKgCO2e;

    private String digitalOperationType;
    private String digitalDescription;
    private long digitalQuantity;
    private double digitalEmissionsKgCO2e;

    private double avoidedCarbonKgCO2e;

    public ComparisonResult(
            String physicalOperationType,
            String physicalDescription,
            long physicalQuantity,
            double physicalEmissionsKgCO2e,
            String digitalOperationType,
            String digitalDescription,
            long digitalQuantity,
            double digitalEmissionsKgCO2e
    ) {
        this.physicalOperationType = physicalOperationType;
        this.physicalDescription = physicalDescription;
        this.physicalQuantity = physicalQuantity;
        this.physicalEmissionsKgCO2e = physicalEmissionsKgCO2e;
        this.digitalOperationType = digitalOperationType;
        this.digitalDescription = digitalDescription;
        this.digitalQuantity = digitalQuantity;
        this.digitalEmissionsKgCO2e = digitalEmissionsKgCO2e;
        this.avoidedCarbonKgCO2e = physicalEmissionsKgCO2e - digitalEmissionsKgCO2e; //calculo
    }

    public String getPhysicalOperationType(){ 
        return physicalOperationType; 
    }
    public String getPhysicalDescription(){ 
        return physicalDescription; 
    }
    public long getPhysicalQuantity(){ 
        return physicalQuantity; 
    }
    public double getPhysicalEmissionsKgCO2e(){ 
        return physicalEmissionsKgCO2e; 
    }

    public String getDigitalOperationType(){ 
        return digitalOperationType; 
    }
    public String getDigitalDescription(){ 
        return digitalDescription; 
    }
    public long getDigitalQuantity(){ 
        return digitalQuantity; 
    }
    public double getDigitalEmissionsKgCO2e(){ 
        return digitalEmissionsKgCO2e; 
    }

    public double getAvoidedCarbonKgCO2e(){ 
        return avoidedCarbonKgCO2e; 
    }
}
package com.carbonflow.model;

public class EmissionResult {
    private String operationType;
    private TransactionType transactionType;
    private String description;
    private long quantity;
    private double emissionsKgCO2e;

    public EmissionResult(String operationType, TransactionType transactionType,
                          String description, long quantity, double emissionsKgCO2e) {
        this.operationType = operationType;
        this.transactionType = transactionType;
        this.description = description;
        this.quantity = quantity;
        this.emissionsKgCO2e = emissionsKgCO2e;
    }

    public String getOperationType(){ 
        return operationType; 
    }
    public TransactionType getTransactionType(){ 
        return transactionType; 
    }
    public String getDescription(){ 
        return description; 
    }
    public long getQuantity()
    { return quantity; 
        
    }
    public double getEmissionsKgCO2e(){ 
        return emissionsKgCO2e; 
    }
    
}

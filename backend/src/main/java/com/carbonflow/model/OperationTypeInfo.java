package com.carbonflow.model;

public class OperationTypeInfo {
    private String operationType;
    private TransactionType transactionType;
    private String description;
    private double factor;

    public OperationTypeInfo(String operationType, TransactionType transactionType,
                             String description, double factor) {
        this.operationType = operationType;
        this.transactionType = transactionType;
        this.description = description;
        this.factor = factor;
    }

    public String getOperationType(){ 
        return operationType; 
    }
    public TransactionType getTransactionType(){ 
        return transactionType; 
    }
    public String getDescription(){ return description; 

    }
    public double getFactor(){ 
        return factor; 
    }
}

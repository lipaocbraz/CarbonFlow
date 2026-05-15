package com.carbonflow.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TransactionRequest {
    @NotNull(message = "O meio da transação é obrigatório (FISICO ou DIGITAL).")
    private TransactionType transactionType;

    @NotBlank(message = "O tipo de operação é obrigatório.")
    private String operationType;

    @NotNull(message = "A quantidade de transações é obrigatória.")
    @Min(value = 1, message = "A quantidade deve ser maior que zero.")
    private Long quantity;

    public TransactionType getTransactionType() { 
        return transactionType; 
    }

    public void setTransactionType(TransactionType transactionType){
         this.transactionType = transactionType; 
    }

    public String getOperationType(){ 
        return operationType;
    }

    public void setOperationType(String operationType){ 
        this.operationType = operationType; 
    }

    public Long getQuantity(){ 
        return quantity; 
    }

    public void setQuantity(Long quantity){ 
        this.quantity = quantity; 
    }
}

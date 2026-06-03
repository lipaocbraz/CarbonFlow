package com.carbonflow.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class PeriodRequest {

    @NotNull(message = "O tipo de operação é obrigatório.")
    private OperationCategory operationCategory;

    @NotNull(message = "A quantidade de transações físicas é obrigatória.")
    @Min(value = 0, message = "A quantidade física deve ser zero ou maior.")
    private Long physicalQuantity;

    @NotNull(message = "A quantidade de transações digitais é obrigatória.")
    @Min(value = 0, message = "A quantidade digital deve ser zero ou maior.")
    private Long digitalQuantity;

    @NotBlank(message = "O período é obrigatório.")
    private String period;

    public OperationCategory getOperationCategory() { return operationCategory; }
    public void setOperationCategory(OperationCategory operationCategory) { this.operationCategory = operationCategory; }

    public Long getPhysicalQuantity() { return physicalQuantity; }
    public void setPhysicalQuantity(Long physicalQuantity) { this.physicalQuantity = physicalQuantity; }

    public Long getDigitalQuantity() { return digitalQuantity; }
    public void setDigitalQuantity(Long digitalQuantity) { this.digitalQuantity = digitalQuantity; }

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }
}
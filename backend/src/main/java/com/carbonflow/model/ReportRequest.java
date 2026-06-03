package com.carbonflow.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class ReportRequest {

    @NotBlank(message = "O tipo de operação física é obrigatório.")
    private String physicalOperationType;

    @NotNull(message = "A quantidade de transações físicas é obrigatória.")
    @Min(value = 1, message = "A quantidade física deve ser maior que zero.")
    private Long physicalQuantity;

    @NotBlank(message = "O tipo de operação digital é obrigatório.")
    private String digitalOperationType;

    @NotNull(message = "A quantidade de transações digitais é obrigatória.")
    @Min(value = 1, message = "A quantidade digital deve ser maior que zero.")
    private Long digitalQuantity;

    public String getPhysicalOperationType() { return physicalOperationType; }
    public void setPhysicalOperationType(String physicalOperationType) { this.physicalOperationType = physicalOperationType; }

    public Long getPhysicalQuantity() { return physicalQuantity; }
    public void setPhysicalQuantity(Long physicalQuantity) { this.physicalQuantity = physicalQuantity; }

    public String getDigitalOperationType() { return digitalOperationType; }
    public void setDigitalOperationType(String digitalOperationType) { this.digitalOperationType = digitalOperationType; }

    public Long getDigitalQuantity() { return digitalQuantity; }
    public void setDigitalQuantity(Long digitalQuantity) { this.digitalQuantity = digitalQuantity; }

    private List<PeriodData> periods;
    public List<PeriodData> getPeriods() { return periods; }
    public void setPeriods(List<PeriodData> periods) { this.periods = periods; }
}

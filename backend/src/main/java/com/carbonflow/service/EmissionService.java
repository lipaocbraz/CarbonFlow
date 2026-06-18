package com.carbonflow.service;

import com.carbonflow.exception.EmissionFactorNotFoundException;
import com.carbonflow.model.ComparisonRequest;
import com.carbonflow.model.ComparisonResult;
import com.carbonflow.model.EmissionResult;
import com.carbonflow.model.OperationCategory;
import com.carbonflow.model.OperationTypeInfo;
import com.carbonflow.model.PeriodRequest;
import com.carbonflow.model.PeriodResult;
import com.carbonflow.model.TransactionRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class EmissionService {

    private final Map<String, Double> emissionFactors;
    private final List<OperationTypeInfo> operationTypes;

    public EmissionService(Map<String, Double> emissionFactors, List<OperationTypeInfo> operationTypes) {
        this.emissionFactors = emissionFactors;
        this.operationTypes = operationTypes;
    }

    public EmissionResult calculate(TransactionRequest request) {
        String operationType = request.getOperationType().toUpperCase();

        Double factor = emissionFactors.get(operationType);
        if (factor == null) {
            throw new EmissionFactorNotFoundException(operationType);
        }

        String description = operationType;

        for (OperationTypeInfo op : operationTypes){
            if (op.getOperationType().equals(operationType)){
                description = op.getDescription();
                break;
            }
        }

        double weight = (request.getWeightKg() != null && request.getWeightKg() > 0)
                ? request.getWeightKg()
                : 1.0;
        double totalEmissions = factor * request.getQuantity() * weight;

        return new EmissionResult(
                operationType,
                request.getTransactionType(),
                description,
                request.getQuantity(),
                totalEmissions
        );
    }

    public List<OperationTypeInfo> getAllOperationTypes() {
        return operationTypes;
    }

    public ComparisonResult compare(ComparisonRequest request) {
        String physicalOperationType = request.getPhysicalOperationType().toUpperCase();
        String digitalOperationType = request.getDigitalOperationType().toUpperCase();

        Double physicalFactor = emissionFactors.get(physicalOperationType);
        if (physicalFactor == null) {
            throw new EmissionFactorNotFoundException(physicalOperationType);
        }

        Double digitalFactor = emissionFactors.get(digitalOperationType);
        if (digitalFactor == null) {
            throw new EmissionFactorNotFoundException(digitalOperationType);
        }

        String physicalDescription = "";
        for (OperationTypeInfo op : operationTypes) {
            if (op.getOperationType().equals(physicalOperationType)) {
                physicalDescription = op.getDescription();
                break;
            }
        }

        String digitalDescription = "";
        for (OperationTypeInfo op : operationTypes) {
            if (op.getOperationType().equals(digitalOperationType)) {
                digitalDescription = op.getDescription();
                break;
            }
        }

        double physicalEmissions = physicalFactor * request.getPhysicalQuantity();
        double digitalEmissions = digitalFactor * request.getDigitalQuantity();

        return new ComparisonResult(
                physicalOperationType,
                physicalDescription,
                request.getPhysicalQuantity(),
                physicalEmissions,
                digitalOperationType,
                digitalDescription,
                request.getDigitalQuantity(),
                digitalEmissions
        );
    }

    public PeriodResult calculateByPeriod(PeriodRequest request) {
        OperationCategory category = request.getOperationCategory();

        Double physicalFactor = emissionFactors.get(category.getPhysicalOperationType());
        if (physicalFactor == null) {
            throw new EmissionFactorNotFoundException(category.getPhysicalOperationType());
        }

        Double digitalFactor = emissionFactors.get(category.getDigitalOperationType());
        if (digitalFactor == null) {
            throw new EmissionFactorNotFoundException(category.getDigitalOperationType());
        }

        String physicalDescription = category.getPhysicalOperationType();
        String digitalDescription = category.getDigitalOperationType();
        for (OperationTypeInfo op : operationTypes) {
            if (op.getOperationType().equals(category.getPhysicalOperationType())) {
                physicalDescription = op.getDescription();
            }
            if (op.getOperationType().equals(category.getDigitalOperationType())) {
                digitalDescription = op.getDescription();
            }
        }

        double physicalEmissions = physicalFactor * request.getPhysicalQuantity();
        double digitalEmissions = digitalFactor * request.getDigitalQuantity();

        // Carbono evitado: comparando com o cenário onde TUDO seria físico
        double totalIfAllPhysical = physicalFactor * (request.getPhysicalQuantity() + request.getDigitalQuantity());
        double actualEmissions = physicalEmissions + digitalEmissions;
        double avoidedCarbon = totalIfAllPhysical - actualEmissions;

        return new PeriodResult(
                category.name(),
                category.getLabel(),
                request.getPeriod(),
                request.getPhysicalQuantity(),
                request.getDigitalQuantity(),
                physicalDescription,
                digitalDescription,
                physicalEmissions,
                digitalEmissions,
                avoidedCarbon
        );
    }
}
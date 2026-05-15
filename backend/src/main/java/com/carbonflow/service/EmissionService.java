package com.carbonflow.service;

import com.carbonflow.exception.EmissionFactorNotFoundException;
import com.carbonflow.model.EmissionResult;
import com.carbonflow.model.OperationTypeInfo;
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

        String description = operationType; //valor padrão caso não encontre

        for (OperationTypeInfo op : operationTypes){
            if (op.getOperationType().equals(operationType)){
                description = op.getDescription();
                break;
            }
        }

        double totalEmissions = factor * request.getQuantity(); //caculo (fator pela qntd)

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
}
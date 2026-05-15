package com.carbonflow.exception;

public class EmissionFactorNotFoundException extends RuntimeException{
    private final String field; //armazena qual campo causou o problema

    public EmissionFactorNotFoundException(String operationType) {
        super("Fator de emissão não encontrado para o tipo de operação: " + operationType);
        this.field = "operationType";
    }

    public String getField() {
        return field;
    }
}
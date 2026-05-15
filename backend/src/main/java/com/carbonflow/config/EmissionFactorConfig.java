package com.carbonflow.config;

import com.carbonflow.model.OperationTypeInfo;
import com.carbonflow.model.TransactionType;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Map;

@Configuration
public class EmissionFactorConfig {

    @Bean
    public Map<String, Double> emissionFactors() {
        return Map.of( //"mapa" imutável
            "VOUCHER_PAPEL",          0.00450,
            "CARTAO_PLASTICO",        0.02500,
            "EXTRATO_IMPRESSO",       0.00340,
            "CORRESPONDENCIA_POSTAL", 0.01200,
            "VOUCHER_DIGITAL",        0.000036,
            "CARTAO_VIRTUAL",         0.000010,
            "TRANSACAO_APP",          0.000017,
            "EXTRATO_DIGITAL",        0.000001
        );
    }

    @Bean
    public List<OperationTypeInfo> operationTypes() {
        return List.of( //lista imutável
            new OperationTypeInfo("VOUCHER_PAPEL",          TransactionType.FISICO,  "Voucher em papel",                        0.00450),
            new OperationTypeInfo("CARTAO_PLASTICO",        TransactionType.FISICO,  "Cartão de benefício plástico",            0.02500),
            new OperationTypeInfo("EXTRATO_IMPRESSO",       TransactionType.FISICO,  "Extrato impresso enviado por correio",    0.00340),
            new OperationTypeInfo("CORRESPONDENCIA_POSTAL", TransactionType.FISICO,  "Correspondência postal",                  0.01200),
            new OperationTypeInfo("VOUCHER_DIGITAL",        TransactionType.DIGITAL, "Voucher digital (app/plataforma online)", 0.000036),
            new OperationTypeInfo("CARTAO_VIRTUAL",         TransactionType.DIGITAL, "Cartão virtual (token digital)",          0.000010),
            new OperationTypeInfo("TRANSACAO_APP",          TransactionType.DIGITAL, "Transação via aplicativo mobile",         0.000017),
            new OperationTypeInfo("EXTRATO_DIGITAL",        TransactionType.DIGITAL, "Extrato digital (email/push)",            0.000001)
        );
    }
}
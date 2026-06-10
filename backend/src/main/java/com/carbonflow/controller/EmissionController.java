package com.carbonflow.controller;

import com.carbonflow.model.ComparisonRequest;
import com.carbonflow.model.ComparisonResult;
import com.carbonflow.model.EmissionResult;
import com.carbonflow.model.OperationTypeInfo;
import com.carbonflow.model.PeriodRequest;
import com.carbonflow.model.PeriodResult;
import com.carbonflow.model.TransactionRequest;
import com.carbonflow.service.EmissionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emissions")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class EmissionController {

    private final EmissionService emissionService;

    public EmissionController(EmissionService emissionService) {
        this.emissionService = emissionService;
    }

    @PostMapping("/calculate")
    public ResponseEntity<EmissionResult> calculate(@Valid @RequestBody TransactionRequest request) {
        EmissionResult result = emissionService.calculate(request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/operation-types")
    public ResponseEntity<List<OperationTypeInfo>> getOperationTypes() {
        List<OperationTypeInfo> types = emissionService.getAllOperationTypes();
        return ResponseEntity.ok(types);
    }

    @PostMapping("/compare")
    public ResponseEntity<ComparisonResult> compare(@Valid @RequestBody ComparisonRequest request) {
        ComparisonResult result = emissionService.compare(request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/period")
    public ResponseEntity<PeriodResult> calculateByPeriod(@Valid @RequestBody PeriodRequest request) {
        PeriodResult result = emissionService.calculateByPeriod(request);
        return ResponseEntity.ok(result);
    }
}
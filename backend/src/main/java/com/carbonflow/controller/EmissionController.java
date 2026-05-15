package com.carbonflow.controller;

import com.carbonflow.model.EmissionResult;
import com.carbonflow.model.OperationTypeInfo;
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
    public ResponseEntity<EmissionResult> calculate(@Valid @RequestBody TransactionRequest request) { //recebe
        EmissionResult result = emissionService.calculate(request); //"leva"
        return ResponseEntity.ok(result); //"traz"
    }

    @GetMapping("/operation-types")
    public ResponseEntity<List<OperationTypeInfo>> getOperationTypes() {
        List<OperationTypeInfo> types = emissionService.getAllOperationTypes();
        return ResponseEntity.ok(types);
    }
}
package com.carbonflow.controller;

import com.carbonflow.model.ReportRequest;
import com.carbonflow.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/emissions")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping("/report")
    public ResponseEntity<byte[]> generateReport(@Valid @RequestBody ReportRequest request) {
        byte[] pdf = reportService.generateReport(request);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=relatorio-carbonflow.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}

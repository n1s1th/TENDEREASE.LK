package lk.tenderease.tender.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lk.tenderease.common.dto.PageResponse;
import lk.tenderease.tender.dto.response.TenderSummaryDTO;
import lk.tenderease.tender.enums.TenderStatus;
import lk.tenderease.tender.service.TenderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cao/tenders")
@RequiredArgsConstructor
@Tag(name = "CAO Tender API", description = "Endpoints for CAO dashboard to manage tenders")
public class CaoTenderController {

    private final TenderService tenderService;

    @GetMapping
    public ResponseEntity<PageResponse<TenderSummaryDTO>> getAllTendersForCao(
            @RequestParam(required = false) TenderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<TenderSummaryDTO> tenderPage = tenderService.getAllTendersForCao(status, pageable);
        
        PageResponse<TenderSummaryDTO> response = PageResponse.<TenderSummaryDTO>builder()
                .content(tenderPage.getContent())
                .pageNumber(tenderPage.getNumber())
                .pageSize(tenderPage.getSize())
                .totalElements(tenderPage.getTotalElements())
                .totalPages(tenderPage.getTotalPages())
                .last(tenderPage.isLast())
                .build();
                
        return ResponseEntity.ok(response);
    }
}

package lk.tenderease.officerdashboard.controller;

import lk.tenderease.officerdashboard.dto.DashboardTenderResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/officer/tenders")
@RequiredArgsConstructor
public class OfficerTenderController {

    @GetMapping
    public Map<String, Object> list(
            @RequestParam(defaultValue = "pending") String tab,
            @RequestParam(required = false) String department,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize
    ) {
        List<DashboardTenderResponse> tenders = new ArrayList<>();
        
        // Removed hardcoded mock data to use real database data
        // TODO: Integrate with tender-service to fetch actual officer-specific tenders

        Map<String, Object> response = new HashMap<>();
        response.put("data", tenders);
        Map<String, Object> pagination = new HashMap<>();
        pagination.put("currentPage", page);
        pagination.put("totalPages", 1);
        pagination.put("pageSize", pageSize);
        pagination.put("totalItems", tenders.size());
        response.put("pagination", pagination);

        return response;
    }

    @GetMapping("/clarifications")
    public List<Map<String, Object>> listClarifications() {
        List<Map<String, Object>> clarifications = new ArrayList<>();
        // Removed hardcoded mock data. 
        // Frontend now calls tender-service (8082) directly for clarifications.

        return clarifications;
    }
}

package lk.tenderease.officerdashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardTenderResponse {
    private String id;
    private String title;
    private String category;
    private String type;
    private String closingDate;
    private Double score;
    private String status;
    private String department;
    private Double estimatedBudget;
    private String recommendationStatus;
}

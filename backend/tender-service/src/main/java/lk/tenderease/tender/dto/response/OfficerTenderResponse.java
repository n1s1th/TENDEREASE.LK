package lk.tenderease.tender.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for the Officer Dashboard tender table.
 * Maps to what the frontend AssignedTenderTable expects.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfficerTenderResponse {
    private String id;
    private String tenderNo;
    private String title;
    private String category;
    private String status;
    private String closingDate;
    private String role;
    private String createdAt;
}

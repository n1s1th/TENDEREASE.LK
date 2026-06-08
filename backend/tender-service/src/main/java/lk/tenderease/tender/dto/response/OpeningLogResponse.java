package lk.tenderease.tender.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for the Opening Logs in the Officer Dashboard Quick Actions.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpeningLogResponse {
    private String id;
    private String tenderNo;
    private String title;
    private String openingDate;
    private String status;
    private String category;
}

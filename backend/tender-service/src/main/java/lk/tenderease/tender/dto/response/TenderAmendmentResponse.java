package lk.tenderease.tender.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response representing a tender amendment/addendum")
public class TenderAmendmentResponse {
    private Long id;
    private UUID tenderId;
    private Integer amendmentNumber;
    private String title;
    private String description;
    private Integer version;
    private LocalDateTime previousClosingDate;
    private LocalDateTime newClosingDate;
    private LocalDateTime createdAt;
    private String downloadUrl;
}

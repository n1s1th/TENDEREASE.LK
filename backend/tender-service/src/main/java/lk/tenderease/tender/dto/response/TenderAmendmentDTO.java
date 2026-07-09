package lk.tenderease.tender.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenderAmendmentDTO {

    private Long id;
    private Integer amendmentNumber;
    private String title;
    private String description;
    private String changeNote;
    private LocalDateTime newClosingDate;
    private LocalDateTime createdAt;

    // Document versioning fields
    private String documentName;
    private Integer version;
    private String downloadUrl;
}
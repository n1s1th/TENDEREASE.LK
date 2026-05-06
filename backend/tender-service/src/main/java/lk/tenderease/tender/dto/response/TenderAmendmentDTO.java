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
    private LocalDateTime newClosingDate;
    private LocalDateTime createdAt;
}
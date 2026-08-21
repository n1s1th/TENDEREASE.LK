package lk.tenderease.tender.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClarificationDTO {

    private Long id;
    private String tenderId;
    private String tenderTitle;
    private String tenderNumber;
    private String question;
    private String answer;
    private LocalDateTime askedAt;
    private LocalDateTime answeredAt;
    private String bidderEmail;
    private String category;
    private String department;
    private LocalDateTime closingDate;
}

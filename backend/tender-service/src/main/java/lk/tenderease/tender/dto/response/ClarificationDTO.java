package lk.tenderease.tender.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClarificationDTO {

    private Long id;
    private String question;
    private String answer;
    private LocalDateTime askedAt;
    private LocalDateTime answeredAt;

    private String tenderId;
    private String tenderTitle;
    private String tenderNumber;
    private String department;
    private String category;
    private LocalDateTime closingDate;
    private String bidderEmail;
}
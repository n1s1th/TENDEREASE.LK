package lk.tenderease.tender.dto.event;

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
public class TenderSubmittedEvent {
    private UUID tenderId;
    private String tenderNumber;
    private String title;
    private String submittedBy;
    private LocalDateTime submittedAt;
}

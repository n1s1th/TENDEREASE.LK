package lk.tenderease.tender.dto.response;

import lk.tenderease.tender.enums.TimelineEventType;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimelineDTO {

    private TimelineEventType eventType;
    private String description;
    private LocalDateTime timestamp;
}
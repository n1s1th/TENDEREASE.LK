package lk.tenderease.common.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenderEvent {
    private String tenderId;
    private String eventType; // CREATED, PUBLISHED, CLOSED
    private String triggerBy;
}

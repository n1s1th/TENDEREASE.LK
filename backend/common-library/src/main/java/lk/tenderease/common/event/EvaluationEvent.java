package lk.tenderease.common.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationEvent {
    private String evaluationId;
    private String tenderId;
    private String eventType;
}

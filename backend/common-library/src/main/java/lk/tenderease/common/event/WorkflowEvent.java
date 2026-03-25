package lk.tenderease.common.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowEvent {
    private String workflowId;
    private String resourceId;
    private String eventType; // APPROVED, REJECTED
}

package lk.tenderease.common.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserEvent {
    private String userId;
    private String eventType; // REGISTERED, ACCEPTED, DELETED
    private String status;    // PENDING, ACTIVE, etc.
    private String role;      // OFFICER, CAO, BIDDER
    private String triggerBy;
}

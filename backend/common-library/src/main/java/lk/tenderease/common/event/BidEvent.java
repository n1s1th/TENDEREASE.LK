package lk.tenderease.common.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BidEvent {
    private String bidId;
    private String tenderId;
    private String eventType; // SUBMITTED, OPENED
    private String vendorId;
}

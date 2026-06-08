package lk.tenderease.bid.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BidResponse {
    private String id;
    private String tenderId;
    private String bidderName;
    private String bidderEmail;
    private String companyName;
    private BigDecimal bidAmount;
    private String currency;
    private String status;
    private String submittedAt;
}

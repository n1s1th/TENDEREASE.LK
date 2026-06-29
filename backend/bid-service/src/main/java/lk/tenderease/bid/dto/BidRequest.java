package lk.tenderease.bid.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BidRequest {
    private String tenderId;
    private String bidderEmail;
    private String bidderName;
    private String companyName;
    private BigDecimal bidAmount;
    private String currency = "LKR";
    private String notes;
    private Map<String, Object> bidData;
}

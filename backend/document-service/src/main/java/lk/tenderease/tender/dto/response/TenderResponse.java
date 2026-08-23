package lk.tenderease.tender.dto.response;
 
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lk.tenderease.tender.enums.BiddingMethod;
import lk.tenderease.tender.enums.ProcurementType;
import lk.tenderease.tender.enums.TenderStatus;
import lk.tenderease.tender.enums.TenderType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TenderResponse {
    private UUID id;
    private String tenderNumber;
    private String title;
    private String description;
    private ProcurementType procurementType;
    private BiddingMethod biddingMethod;
    private TenderType tenderType;
    private Long ministryId;
    private String ministryName;
    private Long departmentId;
    private String departmentName;
    private BigDecimal estimatedBudget;
    private Long fundingSourceId;
    private String fundingSourceName;
    private TenderStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private LocalDateTime closingDate;
    private Long timeRemaining;
    private String rejectionReason;
    private String sbdTemplate;
    private String templateVersion;
}

package lk.tenderease.user.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class VendorRegistrationResponse {
    private UUID vendorId;
    private String businessName;
    private String registrationNumber;
    private String officialEmail;
    private String status;
    private LocalDateTime createdAt;
}

package lk.tenderease.user.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class VendorProfileResponse {
    private UUID vendorId;
    private String status;
    private String businessName;
    private String registrationAuthority;
    private String registrationNumber;
    private String organizationType;
    private String country;
    private String registrationAddress;
    private String city;
    private String province;
    private String website;
    private String officialEmail;
    private String officialTelephone;
    private String cidaGrade;
    private Boolean drcVerified;
    private String drcCompanyName;
    private LocalDate drcIncorporationDate;
    private OfficerDetail authorizedOfficer;
    private List<VendorDocumentResponse> documents;
    private Boolean termsAccepted;
    private LocalDateTime termsAcceptedAt;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<String> departments;

    @Data
    @Builder
    public static class OfficerDetail {
        private String nicOrPassportNo;
        private String name;
        private String designation;
        private String mobilePhone;
        private String email;
    }
}

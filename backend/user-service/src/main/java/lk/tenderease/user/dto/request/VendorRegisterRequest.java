package lk.tenderease.user.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lk.tenderease.user.enums.OrganizationType;
import lombok.Data;

@Data
public class VendorRegisterRequest {

    @Valid
    @NotNull
    private OrganizationDetail organization;

    @Valid
    @NotNull
    private OfficerDetail authorizedOfficer;

    @Data
    public static class OrganizationDetail {
        @NotBlank
        private String businessName;
        private String registrationAuthority;
        @NotBlank
        private String registrationNumber;
        @NotNull
        private OrganizationType organizationType;
        private String country;
        private String registrationAddress;
        private String city;
        private String province;
        private String website;
        @NotBlank
        @Email
        private String officialEmail;
        private String officialTelephone;
    }

    @Data
    public static class OfficerDetail {
        @NotBlank
        private String nicOrPassportNo;
        @NotBlank
        private String name;
        private String designation;
        private String mobilePhone;
        @Email
        private String email;
    }
}

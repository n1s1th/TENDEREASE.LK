package lk.tenderease.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifyRegistrationResponse {
    private boolean verified;
    private String companyName;
    private String incorporationDate;
    private String companyType;
    private String address;
    private String status;
    private String message;
}

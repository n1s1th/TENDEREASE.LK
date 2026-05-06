package lk.tenderease.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyRegistrationRequest {
    @NotBlank
    private String certificateNo;
}

package lk.tenderease.user.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VendorSubmitRequest {
    @NotNull
    @AssertTrue(message = "Terms and Conditions must be accepted")
    private Boolean termsAccepted;
}

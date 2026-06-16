package lk.tenderease.evaluation.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class OpeningAttendanceRequest {
    @NotBlank(message = "Officer ID is required")
    private String officerId;

    @NotBlank(message = "Officer name is required")
    private String officerName;

    @NotBlank(message = "Designation is required")
    private String designation;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    private String email;

    private String organisation;

    private String role;
}

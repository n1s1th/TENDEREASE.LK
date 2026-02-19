package com.tenderease.backend.vendor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorRegistrationResponse {
    private boolean success;
    private String vendorId;
    private String message;
    private LocalDateTime timestamp;
    private String errorCode;
}

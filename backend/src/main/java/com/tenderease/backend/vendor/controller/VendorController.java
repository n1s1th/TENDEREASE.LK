package com.tenderease.backend.vendor.controller;

import com.tenderease.backend.vendor.dto.VendorRegistrationResponse;
import com.tenderease.backend.vendor.service.VendorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
public class VendorController {

    private final VendorService vendorService;

    /**
     * Register a new vendor/supplier.
     * Accepts multipart/form-data containing all registration fields + uploaded
     * files.
     * No authentication required.
     */
    @PostMapping(value = "/register", consumes = "multipart/form-data")
    public ResponseEntity<VendorRegistrationResponse> registerVendor(
            @RequestParam("businessRegistrationAuthority") String businessRegistrationAuthority,
            @RequestParam("businessName") String businessName,
            @RequestParam("country") String country,
            @RequestParam("businessRegistrationNo") String businessRegistrationNo,
            @RequestParam("typeOfOrganization") String typeOfOrganization,
            @RequestParam("registeredAddress") String registeredAddress,
            @RequestParam("city") String city,
            @RequestParam("province") String province,
            @RequestParam(value = "website", required = false) String website,
            @RequestParam("officialEmail") String officialEmail,
            @RequestParam("officialTelephone") String officialTelephone,
            @RequestParam("nicPassport") String nicPassport,
            @RequestParam("name") String name,
            @RequestParam("designation") String designation,
            @RequestParam("mobilePhone") String mobilePhone,
            @RequestParam("email") String email,
            @RequestParam("businessRegistrationDocument") MultipartFile businessRegistrationDocument,
            @RequestParam(value = "otherDocuments", required = false) MultipartFile[] otherDocuments) {
        log.info("Received vendor registration request for: {}", businessName);

        VendorRegistrationResponse response = vendorService.registerVendor(
                businessRegistrationAuthority,
                businessName,
                country,
                businessRegistrationNo,
                typeOfOrganization,
                registeredAddress,
                city,
                province,
                website,
                officialEmail,
                officialTelephone,
                nicPassport,
                name,
                designation,
                mobilePhone,
                email,
                businessRegistrationDocument,
                otherDocuments);

        if (response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}

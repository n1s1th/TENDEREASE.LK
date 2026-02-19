package com.tenderease.backend.vendor.service;

import com.tenderease.backend.vendor.dto.VendorRegistrationResponse;
import org.springframework.web.multipart.MultipartFile;

public interface VendorService {
    VendorRegistrationResponse registerVendor(
            String businessRegistrationAuthority,
            String businessName,
            String country,
            String businessRegistrationNo,
            String typeOfOrganization,
            String registeredAddress,
            String city,
            String province,
            String website,
            String officialEmail,
            String officialTelephone,
            String nicPassport,
            String name,
            String designation,
            String mobilePhone,
            String email,
            MultipartFile businessRegistrationDocument,
            MultipartFile[] otherDocuments);
}

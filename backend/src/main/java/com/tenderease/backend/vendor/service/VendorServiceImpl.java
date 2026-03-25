package com.tenderease.backend.vendor.service;

import com.tenderease.backend.vendor.dto.VendorRegistrationResponse;
import com.tenderease.backend.vendor.entity.Vendor;
import com.tenderease.backend.vendor.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class VendorServiceImpl implements VendorService {

    private final VendorRepository vendorRepository;

    private static final String UPLOAD_DIR = "./uploads/vendors/";

    @Override
    public VendorRegistrationResponse registerVendor(
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
            MultipartFile[] otherDocuments) {
        // Check for duplicate business registration number
        if (vendorRepository.existsByBusinessRegistrationNo(businessRegistrationNo)) {
            return VendorRegistrationResponse.builder()
                    .success(false)
                    .message("A vendor with this business registration number already exists.")
                    .errorCode("DUPLICATE_REG_NO")
                    .timestamp(LocalDateTime.now())
                    .build();
        }

        // Check for duplicate official email
        if (vendorRepository.existsByOfficialEmail(officialEmail)) {
            return VendorRegistrationResponse.builder()
                    .success(false)
                    .message("A vendor with this official email already exists.")
                    .errorCode("DUPLICATE_EMAIL")
                    .timestamp(LocalDateTime.now())
                    .build();
        }

        // Save the business registration document
        String businessDocPath;
        try {
            businessDocPath = saveFile(businessRegistrationDocument, businessRegistrationNo);
        } catch (IOException e) {
            log.error("Failed to save business registration document", e);
            return VendorRegistrationResponse.builder()
                    .success(false)
                    .message("Failed to upload business registration document. Please try again.")
                    .errorCode("FILE_UPLOAD_ERROR")
                    .timestamp(LocalDateTime.now())
                    .build();
        }

        // Save other documents (if any)
        List<String> otherDocPaths = new ArrayList<>();
        if (otherDocuments != null) {
            for (MultipartFile doc : otherDocuments) {
                if (doc != null && !doc.isEmpty()) {
                    try {
                        otherDocPaths.add(saveFile(doc, businessRegistrationNo));
                    } catch (IOException e) {
                        log.warn("Failed to save additional document: {}", doc.getOriginalFilename(), e);
                    }
                }
            }
        }

        // Build and save the Vendor entity
        Vendor vendor = Vendor.builder()
                .businessRegistrationAuthority(businessRegistrationAuthority)
                .businessName(businessName)
                .country(country)
                .businessRegistrationNo(businessRegistrationNo)
                .typeOfOrganization(typeOfOrganization)
                .registeredAddress(registeredAddress)
                .city(city)
                .province(province)
                .website(website != null && !website.isBlank() ? website : null)
                .officialEmail(officialEmail)
                .officialTelephone(officialTelephone)
                .nicPassport(nicPassport)
                .officerName(name)
                .designation(designation)
                .mobilePhone(mobilePhone)
                .officerEmail(email)
                .businessRegistrationDocumentPath(businessDocPath)
                .otherDocumentPaths(otherDocPaths)
                .build();

        Vendor saved = vendorRepository.save(vendor);

        String vendorId = "VEND-" + String.format("%06d", saved.getId());
        log.info("Vendor registered successfully: {} ({})", businessName, vendorId);

        return VendorRegistrationResponse.builder()
                .success(true)
                .vendorId(vendorId)
                .message("Vendor registration successful. You will receive a confirmation email shortly.")
                .timestamp(LocalDateTime.now())
                .build();
    }

    private String saveFile(MultipartFile file, String prefix) throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String uniqueFilename = prefix.replaceAll("[^a-zA-Z0-9]", "_") + "_" + UUID.randomUUID() + extension;
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return filePath.toString();
    }
}

package lk.tenderease.user.service;

import lk.tenderease.common.dto.PageResponse;
import lk.tenderease.user.dto.request.VendorRegisterRequest;
import lk.tenderease.user.dto.request.VendorSubmitRequest;
import lk.tenderease.user.dto.request.VerifyRegistrationRequest;
import lk.tenderease.user.dto.response.VendorDocumentResponse;
import lk.tenderease.user.dto.response.VendorProfileResponse;
import lk.tenderease.user.dto.response.VendorRegistrationResponse;
import lk.tenderease.user.dto.response.VerifyRegistrationResponse;
import lk.tenderease.user.enums.VendorDocumentType;
import lk.tenderease.user.enums.VendorStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface VendorRegistrationService {
    VerifyRegistrationResponse verifyRegistrationNumber(VerifyRegistrationRequest request);
    VendorRegistrationResponse register(VendorRegisterRequest request);
    VendorDocumentResponse uploadDocument(UUID vendorId, MultipartFile file, VendorDocumentType documentType, String documentTitle);
    void deleteDocument(UUID vendorId, UUID docId);
    VendorRegistrationResponse submit(UUID vendorId, VendorSubmitRequest request);
    VendorProfileResponse getVendorById(UUID id);
    PageResponse<VendorProfileResponse> listVendors(VendorStatus status, Pageable pageable);
    VendorProfileResponse approveVendor(UUID id);
    VendorProfileResponse rejectVendor(UUID id, String reason);
    VendorProfileResponse getVendorByEmail(String email);
}

package lk.tenderease.tender.service.impl;

import lk.tenderease.common.dto.PageResponse;
import lk.tenderease.tender.dto.request.ComplianceChecklistRequest;
import lk.tenderease.tender.dto.request.CreateTenderRequest;
import lk.tenderease.tender.dto.request.DocumentUploadRequest;
import lk.tenderease.tender.dto.request.TenderScheduleRequest;
import lk.tenderease.tender.dto.response.*;
import lk.tenderease.tender.enums.ProcurementType;
import lk.tenderease.tender.enums.TenderStatus;
import lk.tenderease.tender.service.TenderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TenderServiceImpl implements TenderService {

    @Override
    public TenderResponse createTender(CreateTenderRequest request, String createdByUserId) {
        return null; // TODO: implement
    }

    @Override
    public TenderDetailResponse getTenderById(UUID id) {
        return null; // TODO: implement
    }

    @Override
    public TenderResponse updateTender(UUID id, CreateTenderRequest request, String callerUserId) {
        return null; // TODO: implement
    }

    @Override
    public void deleteTender(UUID id, String callerUserId) {
        // TODO: implement
    }

    @Override
    public PageResponse<TenderResponse> listMyTenders(TenderStatus status, Pageable pageable, String callerUserId) {
        return null; // TODO: implement
    }

    @Override
    public PageResponse<TenderResponse> listAllTenders(TenderStatus status, Pageable pageable) {
        return null; // TODO: implement
    }

    @Override
    public TenderDocumentResponse uploadDocument(UUID tenderId, DocumentUploadRequest request, String callerUserId) {
        return null; // TODO: implement
    }

    @Override
    public void deleteDocument(UUID tenderId, UUID docId, String callerUserId) {
        // TODO: implement
    }

    @Override
    public TenderScheduleResponse getSchedule(UUID tenderId) {
        return null; // TODO: implement
    }

    @Override
    public TenderScheduleResponse saveSchedule(UUID tenderId, TenderScheduleRequest request, String callerUserId) {
        return null; // TODO: implement
    }

    @Override
    public ComplianceChecklistResponse getComplianceChecklist(UUID tenderId) {
        return null; // TODO: implement
    }

    @Override
    public ComplianceChecklistResponse saveComplianceChecklist(UUID tenderId, ComplianceChecklistRequest request, String callerUserId) {
        return null; // TODO: implement
    }

    @Override
    public TenderNoticePreviewResponse generateNoticePreview(UUID tenderId) {
        return null; // TODO: implement
    }

    @Override
    public TenderResponse submitForApproval(UUID tenderId, String callerUserId) {
        return null; // TODO: implement
    }

    @Override
    public List<MinistryResponse> listMinistries() {
        return null; // TODO: implement
    }

    @Override
    public List<DepartmentResponse> listDepartmentsByMinistry(Long ministryId) {
        return null; // TODO: implement
    }

    @Override
    public List<FundingSourceResponse> listFundingSources() {
        return null; // TODO: implement
    }

    @Override
    public List<SbdTemplateResponse> listSbdTemplates(ProcurementType procurementType) {
        return null; // TODO: implement
    }

    @Override
    public List<String> listProcurementTypes() {
        return null; // TODO: implement
    }

    @Override
    public List<String> listBiddingMethods() {
        return null; // TODO: implement
    }

    @Override
    public List<String> listTenderTypes() {
        return null; // TODO: implement
    }
}

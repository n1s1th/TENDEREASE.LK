package lk.tenderease.tender.service.impl;

import lk.tenderease.common.dto.PageResponse;
import lk.tenderease.tender.dto.request.ComplianceChecklistRequest;
import lk.tenderease.tender.dto.request.CreateTenderRequest;
import lk.tenderease.tender.dto.request.DocumentUploadRequest;
import lk.tenderease.tender.dto.request.TenderScheduleRequest;
import lk.tenderease.tender.dto.response.*;
import lk.tenderease.tender.entity.Department;
import lk.tenderease.tender.entity.FundingSource;
import lk.tenderease.tender.entity.Ministry;
import lk.tenderease.tender.entity.Tender;
import lk.tenderease.tender.enums.BiddingMethod;
import lk.tenderease.tender.enums.ProcurementType;
import lk.tenderease.tender.enums.TenderStatus;
import lk.tenderease.tender.enums.TenderType;
import lk.tenderease.tender.repository.DepartmentRepository;
import lk.tenderease.tender.repository.FundingSourceRepository;
import lk.tenderease.tender.repository.MinistryRepository;
import lk.tenderease.tender.repository.SbdTemplateRepository;
import lk.tenderease.tender.repository.TenderRepository;
import lk.tenderease.tender.service.TenderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TenderServiceImpl implements TenderService {

    private final MinistryRepository ministryRepository;
    private final DepartmentRepository departmentRepository;
    private final FundingSourceRepository fundingSourceRepository;
    private final SbdTemplateRepository sbdTemplateRepository;
    private final TenderRepository tenderRepository;

    @Override
    @Transactional
    public TenderResponse createTender(CreateTenderRequest request, String createdByUserId) {
        log.info("Creating tender '{}' for user '{}'", request.getTitle(), createdByUserId);

        // Check for duplicate tender number
        if (tenderRepository.existsByTenderNumber(request.getTenderNumber())) {
            throw new RuntimeException("Tender number '" + request.getTenderNumber() + "' already exists");
        }

        // Fetch related entities
        Ministry ministry = ministryRepository.findById(request.getMinistryId())
                .orElseThrow(() -> new RuntimeException("Ministry not found with ID: " + request.getMinistryId()));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found with ID: " + request.getDepartmentId()));

        FundingSource fundingSource = null;
        if (request.getFundingSourceId() != null) {
            fundingSource = fundingSourceRepository.findById(request.getFundingSourceId())
                    .orElseThrow(() -> new RuntimeException("Funding source not found with ID: " + request.getFundingSourceId()));
        }

        // Build tender entity
        Tender tender = Tender.builder()
                .tenderNumber(request.getTenderNumber())
                .title(request.getTitle())
                .description(request.getDescription())
                .procurementType(request.getProcurementType())
                .biddingMethod(request.getBiddingMethod())
                .tenderType(request.getTenderType())
                .ministry(ministry)
                .department(department)
                .estimatedBudget(request.getEstimatedBudget())
                .fundingSource(fundingSource)
                .status(TenderStatus.DRAFT)
                .build();

        // Set audit fields manually (since AuditorAware is not configured for dev)
        tender.setCreatedBy(createdByUserId != null ? createdByUserId : "dev-user");
        tender.setCreatedAt(LocalDateTime.now());
        tender.setUpdatedAt(LocalDateTime.now());

        Tender saved = tenderRepository.save(tender);
        log.info("Tender created with ID: {}", saved.getId());

        return mapToResponse(saved);
    }

    private TenderResponse mapToResponse(Tender tender) {
        return TenderResponse.builder()
                .id(tender.getId())
                .tenderNumber(tender.getTenderNumber())
                .title(tender.getTitle())
                .description(tender.getDescription())
                .procurementType(tender.getProcurementType())
                .biddingMethod(tender.getBiddingMethod())
                .tenderType(tender.getTenderType())
                .ministryId(tender.getMinistry().getId())
                .ministryName(tender.getMinistry().getName())
                .departmentId(tender.getDepartment().getId())
                .departmentName(tender.getDepartment().getName())
                .estimatedBudget(tender.getEstimatedBudget())
                .fundingSourceId(tender.getFundingSource() != null ? tender.getFundingSource().getId() : null)
                .fundingSourceName(tender.getFundingSource() != null ? tender.getFundingSource().getName() : null)
                .status(tender.getStatus())
                .createdAt(tender.getCreatedAt())
                .updatedAt(tender.getUpdatedAt())
                .createdBy(tender.getCreatedBy())
                .build();
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

    // ── Reference Data ──────────────────────────────────────────────────────

    @Override
    public List<MinistryResponse> listMinistries() {
        log.debug("Fetching all ministries");
        return ministryRepository.findAll().stream()
                .map(m -> MinistryResponse.builder()
                        .id(m.getId())
                        .name(m.getName())
                        .code(m.getCode())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<DepartmentResponse> listDepartmentsByMinistry(Long ministryId) {
        log.debug("Fetching departments for ministry ID: {}", ministryId);
        return departmentRepository.findByMinistryId(ministryId).stream()
                .map(d -> DepartmentResponse.builder()
                        .id(d.getId())
                        .name(d.getName())
                        .ministryId(d.getMinistry().getId())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<FundingSourceResponse> listFundingSources() {
        log.debug("Fetching all funding sources");
        return fundingSourceRepository.findAll().stream()
                .map(f -> FundingSourceResponse.builder()
                        .id(f.getId())
                        .name(f.getName())
                        .sourceType(f.getSourceType())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<SbdTemplateResponse> listSbdTemplates(ProcurementType procurementType) {
        log.debug("Fetching SBD templates for procurement type: {}", procurementType);
        if (procurementType != null) {
            return sbdTemplateRepository.findByProcurementTypeAndIsActiveTrue(procurementType).stream()
                    .map(t -> SbdTemplateResponse.builder()
                            .id(t.getId())
                            .name(t.getName())
                            .procurementType(t.getProcurementType())
                            .version(t.getVersion())
                            .build())
                    .collect(Collectors.toList());
        }
        return sbdTemplateRepository.findAll().stream()
                .filter(t -> Boolean.TRUE.equals(t.getIsActive()))
                .map(t -> SbdTemplateResponse.builder()
                        .id(t.getId())
                        .name(t.getName())
                        .procurementType(t.getProcurementType())
                        .version(t.getVersion())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<String> listProcurementTypes() {
        return Arrays.stream(ProcurementType.values())
                .map(Enum::name)
                .collect(Collectors.toList());
    }

    @Override
    public List<String> listBiddingMethods() {
        return Arrays.stream(BiddingMethod.values())
                .map(Enum::name)
                .collect(Collectors.toList());
    }

    @Override
    public List<String> listTenderTypes() {
        return Arrays.stream(TenderType.values())
                .map(Enum::name)
                .collect(Collectors.toList());
    }
}

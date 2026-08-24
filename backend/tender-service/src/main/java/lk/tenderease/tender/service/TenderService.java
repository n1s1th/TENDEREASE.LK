package lk.tenderease.tender.service;

import lk.tenderease.common.dto.PageResponse;
import lk.tenderease.tender.dto.request.ComplianceChecklistRequest;
import lk.tenderease.tender.dto.request.CreateTenderRequest;
import lk.tenderease.tender.dto.request.DocumentUploadRequest;
import lk.tenderease.tender.dto.request.TenderScheduleRequest;
import lk.tenderease.tender.dto.request.ClarificationAnswerRequestDTO;
import lk.tenderease.tender.dto.request.ClarificationRequestDTO;
import lk.tenderease.tender.dto.response.AddendumVersionResponse;
import lk.tenderease.tender.dto.response.ClarificationDTO;
import lk.tenderease.tender.dto.response.ComplianceChecklistResponse;
import lk.tenderease.tender.dto.response.ContactDTO;
import lk.tenderease.tender.dto.response.DepartmentResponse;
import lk.tenderease.tender.dto.response.FundingSourceResponse;
import lk.tenderease.tender.dto.response.MinistryResponse;
import lk.tenderease.tender.dto.response.SbdTemplateResponse;
import lk.tenderease.tender.dto.response.TenderAmendmentDTO;
import lk.tenderease.tender.dto.response.TenderDetailResponse;
import lk.tenderease.tender.dto.response.TenderDetailsDTO;
import lk.tenderease.tender.dto.response.TenderDocumentDTO;
import lk.tenderease.tender.dto.response.TenderDocumentResponse;
import lk.tenderease.tender.dto.response.TenderNoticePreviewResponse;
import lk.tenderease.tender.dto.response.TenderResponse;
import lk.tenderease.tender.dto.response.TenderScheduleResponse;
import lk.tenderease.tender.dto.response.TenderSummaryDTO;
import lk.tenderease.tender.dto.response.TimelineDTO;
import lk.tenderease.tender.enums.ProcurementType;
import lk.tenderease.tender.enums.TenderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

/**
 * Service interface for the Tender Creation module.
 * Handles the complete tender creation workflow including CRUD operations,
 * document management, scheduling, compliance checking, and submission.
 */
public interface TenderService {

    // ── Tender CRUD ──────────────────────────────────────────────────────────

    /**
     * Creates a new tender in DRAFT status.
     *
     * @param request          the tender creation request payload
     * @param createdByUserId  the username/ID of the creating user
     * @return the created tender response
     * @throws lk.tenderease.tender.exception.DuplicateTenderNumberException      if tenderNumber already exists
     * @throws lk.tenderease.tender.exception.InvalidMinistryDepartmentException  if departmentId does not belong to ministryId
     */
    TenderResponse createTender(CreateTenderRequest request, String createdByUserId);

    /**
     * Returns full tender detail including documents, schedule, checklist, and notice preview.
     *
     * @param id the tender UUID
     * @return the full tender detail response
     * @throws lk.tenderease.tender.exception.TenderNotFoundException if tender is not found
     */
    TenderDetailResponse getTenderById(UUID id);
    TenderDetailResponse getTenderByNumber(String tenderNumber);
    byte[] viewDocument(UUID docId);

    /**
     * Builds a ZIP archive of every document attached to a tender, read from S3.
     *
     * @param tenderId the tender whose documents should be bundled
     * @return the ZIP payload
     */
    byte[] getDocumentsArchive(UUID tenderId);

    /**
     * Returns the display filename for a stored tender file, or empty when the key
     * is not a known tender document or addendum version. Acts as the whitelist for
     * the public file endpoint.
     */
    java.util.Optional<String> resolveDownloadFilename(String s3Key);
    java.util.Map<String, Long> getKPIs(String department, String category, String month);
    java.util.List<java.util.Map<String, Object>> getKPITrend(String department, String category);
    TenderResponse updateTenderStatus(UUID id, TenderStatus status, String reason, String callerUserId);

    /**
     * Updates a DRAFT tender.
     *
     * @param id              the tender UUID
     * @param request         the update request payload
     * @param callerUserId    the username/ID of the calling user
     * @return the updated tender response
     * @throws lk.tenderease.tender.exception.TenderNotEditableException          if status is not DRAFT
     * @throws lk.tenderease.tender.exception.UnauthorizedTenderAccessException   if caller is not owner or ADMIN
     */
    TenderResponse updateTender(UUID id, CreateTenderRequest request, String callerUserId);

    /**
     * Deletes a DRAFT tender and all child records (cascade).
     *
     * @param id              the tender UUID
     * @param callerUserId    the username/ID of the calling user
     * @throws lk.tenderease.tender.exception.TenderNotEditableException          if status is not DRAFT
     * @throws lk.tenderease.tender.exception.UnauthorizedTenderAccessException   if caller is not owner or ADMIN
     */
    void deleteTender(UUID id, String callerUserId);

    /**
     * Lists tenders owned by callerUserId with optional status filter and pagination.
     *
     * @param status          optional status filter
     * @param pageable        pagination and sorting parameters
     * @param callerUserId    the username/ID of the calling user
     * @return paginated list of tender responses
     */
    PageResponse<TenderResponse> listMyTenders(TenderStatus status, Pageable pageable, String callerUserId);

    /**
     * Admin: lists all tenders across all users.
     *
     * @param status   optional status filter
     * @param pageable pagination and sorting parameters
     * @return paginated list of tender responses
     */
    PageResponse<TenderResponse> listAllTenders(TenderStatus status, Pageable pageable);

    // ── Documents ────────────────────────────────────────────────────────────

    /**
     * Uploads a document file for a tender.
     *
     * @param tenderId        the tender UUID
     * @param request         the document upload request (multipart)
     * @param callerUserId    the username/ID of the calling user
     * @return the uploaded document response
     * @throws lk.tenderease.tender.exception.InvalidFileTypeException        for disallowed MIME types
     * @throws lk.tenderease.tender.exception.FileSizeLimitExceededException  if file exceeds 50 MB
     * @throws lk.tenderease.tender.exception.SbdTemplateMismatchException    if sbdTemplateId does not match tender procurementType
     */
    TenderDocumentResponse uploadDocument(UUID tenderId, DocumentUploadRequest request, String callerUserId);

    /**
     * Deletes a document.
     *
     * @param tenderId        the tender UUID
     * @param docId           the document UUID
     * @param callerUserId    the username/ID of the calling user
     * @throws lk.tenderease.tender.exception.TenderDocumentNotFoundException if document is not found
     */
    void deleteDocument(UUID tenderId, UUID docId, String callerUserId);

    // ── Schedule ─────────────────────────────────────────────────────────────

    /**
     * Returns the schedule for a tender.
     *
     * @param tenderId the tender UUID
     * @return the schedule response
     * @throws lk.tenderease.tender.exception.TenderScheduleNotFoundException if schedule has not been saved yet
     */
    TenderScheduleResponse getSchedule(UUID tenderId);

    /**
     * Saves or updates the schedule.
     *
     * @param tenderId        the tender UUID
     * @param request         the schedule request payload
     * @param callerUserId    the username/ID of the calling user
     * @return the saved schedule response
     * @throws lk.tenderease.tender.exception.InvalidScheduleDatesException       if date ordering rules are violated
     * @throws lk.tenderease.tender.exception.PreBidMeetingDateRequiredException  if preBidMeetingEnabled=true but date/time null
     */
    TenderScheduleResponse saveSchedule(UUID tenderId, TenderScheduleRequest request, String callerUserId);

    // ── Compliance Checklist ─────────────────────────────────────────────────

    /**
     * Returns the compliance checklist for a tender.
     *
     * @param tenderId the tender UUID
     * @return the compliance checklist response
     */
    ComplianceChecklistResponse getComplianceChecklist(UUID tenderId);

    /**
     * Saves or updates the compliance checklist.
     *
     * @param tenderId        the tender UUID
     * @param request         the checklist request payload
     * @param callerUserId    the username/ID of the calling user
     * @return the saved checklist response
     */
    ComplianceChecklistResponse saveComplianceChecklist(UUID tenderId, ComplianceChecklistRequest request, String callerUserId);

    // ── Notice Preview ───────────────────────────────────────────────────────

    /**
     * Generates the Invitation for Bids notice text from tender data.
     *
     * @param tenderId the tender UUID
     * @return the generated notice preview response
     * @throws lk.tenderease.tender.exception.TenderNotFoundException if tender does not exist
     */
    TenderNoticePreviewResponse generateNoticePreview(UUID tenderId);

    // ── Submission ───────────────────────────────────────────────────────────

    /**
     * Submits a DRAFT tender for approval.
     * Requires all checklist items = true, at least 1 document uploaded, and schedule saved.
     * On success: sets status = PENDING_APPROVAL, calls WorkflowService, publishes TenderSubmittedEvent.
     *
     * @param tenderId        the tender UUID
     * @param callerUserId    the username/ID of the calling user
     * @return the updated tender response
     * @throws lk.tenderease.tender.exception.TenderNotEditableException              if status != DRAFT
     * @throws lk.tenderease.tender.exception.TenderDocumentRequiredException         if no documents uploaded
     * @throws lk.tenderease.tender.exception.TenderScheduleNotFoundException         if schedule not saved
     * @throws lk.tenderease.tender.exception.ComplianceChecklistIncompleteException  if any checklist item is false
     */
    TenderResponse submitForApproval(UUID tenderId, String callerUserId);

    // ── Reference Data ───────────────────────────────────────────────────────

    /**
     * Lists all ministries.
     * @return list of ministry responses
     */
    List<MinistryResponse> listMinistries();

    /**
     * Lists departments belonging to a specific ministry.
     * @param ministryId the ministry ID
     * @return list of department responses
     */
    List<DepartmentResponse> listDepartmentsByMinistry(Long ministryId);

    /**
     * Lists all funding sources.
     * @return list of funding source responses
     */
    List<FundingSourceResponse> listFundingSources();

    /**
     * Lists active SBD templates filtered by procurement type.
     * @param procurementType optional filter by procurement type
     * @return list of SBD template responses
     */
    List<SbdTemplateResponse> listSbdTemplates(ProcurementType procurementType);

    /**
     * Lists all available procurement type enum values.
     * @return list of procurement type names
     */
    List<String> listProcurementTypes();

    /**
     * Lists all available bidding method enum values.
     * @return list of bidding method names
     */
    List<String> listBiddingMethods();

    /**
     * Lists all available tender type enum values.
     * @return list of tender type names
     */
    List<String> listTenderTypes();

    /**
     * Lists published tenders for the public portal.
     *
     * @param lifecycle "open" or "closed" to split by whether bidding is still
     *                  possible (closing date aware); null/blank returns both
     */
    Page<TenderSummaryDTO> getAllPublishedTenders(String search, TenderStatus status, ProcurementType procurementType,
                                                  String lifecycle, Pageable pageable);

    TenderDetailsDTO getPublicTenderById(UUID id);

    // ══════════════════════════════════════════════════════════════════════════
    // SAVED TENDERS (BOOKMARKS)
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Bookmarks a tender for a user. Saving an already-saved tender is a no-op.
     *
     * @param userId   stable identifier of the owner
     * @param tenderId the tender to bookmark
     */
    void saveTender(String userId, UUID tenderId);

    /**
     * Removes a bookmark. Removing one that does not exist is a no-op.
     *
     * @param userId   stable identifier of the owner
     * @param tenderId the tender to un-bookmark
     */
    void unsaveTender(String userId, UUID tenderId);

    /**
     * Lists a user's bookmarked tenders, most recently saved first.
     * Bookmarks whose tender no longer exists are skipped.
     *
     * @param userId   stable identifier of the owner
     * @param pageable paging information
     * @return a page of tender summaries
     */
    Page<TenderSummaryDTO> getSavedTenders(String userId, Pageable pageable);

    /**
     * Returns the ids of every tender the user has bookmarked, so the UI can render
     * bookmark state without a request per tender.
     *
     * @param userId stable identifier of the owner
     * @return the bookmarked tender ids
     */
    List<UUID> getSavedTenderIds(String userId);
    TenderDetailsDTO getPublicTenderByNumber(String tenderNumber);

    List<TenderDocumentDTO> getDocuments(UUID tenderId);

    List<TenderAmendmentDTO> getAddenda(UUID tenderId);

    TenderAmendmentDTO createAddendum(UUID tenderId, lk.tenderease.tender.dto.request.CreateAddendumRequest request, org.springframework.web.multipart.MultipartFile file, String callerUserId);

    AddendumVersionResponse uploadAddendumVersion(UUID tenderId, Long addendumId, org.springframework.web.multipart.MultipartFile file, String changeDescription, String callerUserId);

    List<AddendumVersionResponse> getAddendumVersionHistory(UUID tenderId, Long addendumId);

    AddendumVersionResponse getAddendumVersion(UUID tenderId, Long addendumId, Integer versionNumber);

    AddendumVersionResponse getCurrentAddendumVersion(UUID tenderId, Long addendumId);

    List<ClarificationDTO> getClarifications(UUID tenderId);

    List<TimelineDTO> getTimeline(UUID tenderId);

    void addTimelineEvent(UUID tenderId, lk.tenderease.tender.enums.TimelineEventType eventType, String description, String createdBy, String creatorRole);

    List<ContactDTO> getContacts(UUID tenderId);

    void submitClarification(UUID tenderId, ClarificationRequestDTO request, String bidderEmail);

    ClarificationDTO answerClarification(UUID tenderId, Long clarificationId, ClarificationAnswerRequestDTO request);
}

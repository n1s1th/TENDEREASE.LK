# Tender Service

## Description
Core management of Tenders.

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /api/tenders | Create tenders |
| GET    | /api/tenders | List tenders |



# Tender Service — Sprint 2 Skeleton Generation

## Summary

Generated the complete **compilable but hollow** service skeleton for the Tender Creation Service (`tender-service`) module in the TenderEase e-procurement system. All deliverables from the specification have been created and the project **compiles successfully**.

## Key Adaptation: BaseEntity Uses UUID

> [!IMPORTANT]
> The existing `BaseEntity` in `common-library` uses **UUID** for IDs (not `BIGSERIAL`/`Long`) and **String** for `createdBy` (not `Long`). All entities, repositories, DTOs, service interface, and controller have been adapted accordingly.

## Files Generated

### ✅ 5 Enum Files
| File | Values |
|---|---|
| [ProcurementType.java](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/enums/ProcurementType.java) | GOODS, WORKS, SERVICES, CONSULTANCY |
| [BiddingMethod.java](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/enums/BiddingMethod.java) | NCB, ICB, LIB, DC, SSS |
| [TenderType.java](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/enums/TenderType.java) | OPEN_TENDER, RESTRICTED, FRAMEWORK_AGREEMENT |
| [TenderStatus.java](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/enums/TenderStatus.java) | DRAFT, PENDING_APPROVAL, APPROVED, REJECTED |
| [DocumentType.java](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/enums/DocumentType.java) | SBD, SPECIFICATION, TERMS_AND_CONDITIONS, DRAWING, COMPLIANCE_CHECKLIST, OTHER |

---

### ✅ 8 Entity Classes
| Entity | Extends | Table |
|---|---|---|
| [Tender.java](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/entity/Tender.java) | BaseEntity (UUID) | `tender` |
| [TenderDocument.java](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/entity/TenderDocument.java) | BaseEntity (UUID) | `tender_document` |
| [TenderSchedule.java](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/entity/TenderSchedule.java) | BaseEntity (UUID) | `tender_schedule` |
| [TenderComplianceChecklist.java](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/entity/TenderComplianceChecklist.java) | BaseEntity (UUID) | `tender_compliance_checklist` |
| [Ministry.java](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/entity/Ministry.java) | — (Long PK) | `ministry` |
| [Department.java](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/entity/Department.java) | — (Long PK) | `department` |
| [FundingSource.java](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/entity/FundingSource.java) | — (Long PK) | `funding_source` |
| [SbdTemplate.java](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/entity/SbdTemplate.java) | — (Long PK) | `sbd_template` |

---

### ✅ 8 Repository Interfaces
| Repository | Key Methods |
|---|---|
| [TenderRepository](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/repository/TenderRepository.java) | findByStatus, findByCreatedBy, findByTenderNumber, findByCreatedByAndStatus, existsByTenderNumber |
| [TenderDocumentRepository](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/repository/TenderDocumentRepository.java) | findByTenderId |
| [TenderScheduleRepository](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/repository/TenderScheduleRepository.java) | findByTenderId |
| [TenderComplianceChecklistRepository](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/repository/TenderComplianceChecklistRepository.java) | findByTenderId |
| [MinistryRepository](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/repository/MinistryRepository.java) | JpaRepository defaults |
| [DepartmentRepository](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/repository/DepartmentRepository.java) | findByMinistryId |
| [FundingSourceRepository](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/repository/FundingSourceRepository.java) | JpaRepository defaults |
| [SbdTemplateRepository](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/repository/SbdTemplateRepository.java) | findByProcurementTypeAndIsActiveTrue |

---

### ✅ All DTO Classes

**Request DTOs (4):**
- [CreateTenderRequest](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/dto/request/CreateTenderRequest.java)
- [TenderScheduleRequest](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/dto/request/TenderScheduleRequest.java)
- [ComplianceChecklistRequest](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/dto/request/ComplianceChecklistRequest.java)
- [DocumentUploadRequest](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/dto/request/DocumentUploadRequest.java)

**Response DTOs (10):**
- [TenderResponse](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/dto/response/TenderResponse.java)
- [TenderDetailResponse](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/dto/response/TenderDetailResponse.java) (extends TenderResponse)
- [TenderDocumentResponse](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/dto/response/TenderDocumentResponse.java)
- [TenderScheduleResponse](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/dto/response/TenderScheduleResponse.java)
- [ComplianceChecklistResponse](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/dto/response/ComplianceChecklistResponse.java)
- [MinistryResponse](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/dto/response/MinistryResponse.java)
- [DepartmentResponse](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/dto/response/DepartmentResponse.java)
- [FundingSourceResponse](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/dto/response/FundingSourceResponse.java)
- [SbdTemplateResponse](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/dto/response/SbdTemplateResponse.java)
- [TenderNoticePreviewResponse](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/dto/response/TenderNoticePreviewResponse.java)

**Event DTOs (2):**
- [TenderCreatedEvent](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/dto/event/TenderCreatedEvent.java)
- [TenderSubmittedEvent](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/dto/event/TenderSubmittedEvent.java)

---

### ✅ Service Interface
- [TenderService.java](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/service/TenderService.java) — Full JavaDoc on every method

---

### ✅ Controller Shell
- [TenderController.java](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/controller/TenderController.java) — All 18 endpoints with `@Operation`, `@ApiResponses`, `@PreAuthorize`, and `return null; // TODO: implement`

---

### ✅ RabbitMQ Configuration
- [TenderRabbitMQConfig.java](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/config/TenderRabbitMQConfig.java) — TopicExchange, 2 queues, 2 bindings, Jackson converter

---

### ✅ 14 Custom Exception Classes

| Exception | Trigger |
|---|---|
| [TenderNotFoundException](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/exception/TenderNotFoundException.java) | Tender ID does not exist |
| [TenderNotEditableException](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/exception/TenderNotEditableException.java) | Status is not DRAFT |
| [UnauthorizedTenderAccessException](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/exception/UnauthorizedTenderAccessException.java) | Not owner and not ADMIN |
| [DuplicateTenderNumberException](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/exception/DuplicateTenderNumberException.java) | tenderNumber exists |
| [InvalidMinistryDepartmentException](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/exception/InvalidMinistryDepartmentException.java) | Dept not in ministry |
| [TenderDocumentNotFoundException](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/exception/TenderDocumentNotFoundException.java) | Doc ID not found |
| [InvalidFileTypeException](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/exception/InvalidFileTypeException.java) | Not PDF/DOC/DOCX |
| [FileSizeLimitExceededException](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/exception/FileSizeLimitExceededException.java) | >50 MB |
| [SbdTemplateMismatchException](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/exception/SbdTemplateMismatchException.java) | SBD type ≠ tender type |
| [TenderScheduleNotFoundException](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/exception/TenderScheduleNotFoundException.java) | Schedule not saved |
| [InvalidScheduleDatesException](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/exception/InvalidScheduleDatesException.java) | Date ordering violated |
| [PreBidMeetingDateRequiredException](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/exception/PreBidMeetingDateRequiredException.java) | Enabled but no date/time |
| [TenderDocumentRequiredException](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/exception/TenderDocumentRequiredException.java) | Submit with 0 docs |
| [ComplianceChecklistIncompleteException](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/java/lk/tenderease/tender/exception/ComplianceChecklistIncompleteException.java) | Checklist items false |

---

### ✅ Flyway Migrations
| Migration | Contents |
|---|---|
| [V1__create_reference_tables.sql](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/resources/db/migration/V1__create_reference_tables.sql) | ministry, department, funding_source, sbd_template |
| [V2__create_tender_tables.sql](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/resources/db/migration/V2__create_tender_tables.sql) | tender (UUID PK), tender_document, tender_schedule, tender_compliance_checklist |
| [V3__seed_reference_data.sql](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/resources/db/migration/V3__seed_reference_data.sql) | 5 ministries, 10 departments, 3 funding sources, 4 SBD templates |

---

### ✅ application.yml
- [application.yml](file:///c:/Users/User/Desktop/Projects/TENDEREASE.LK/backend/tender-service/src/main/resources/application.yml) — Complete with multipart limits, RabbitMQ topology, Redis cache, external service URLs, Keycloak JWT

---

## Build Verification

```
BUILD SUCCESS — Maven compile
- TenderEase Parent              : SUCCESS
- Common Library                 : SUCCESS
- Tender Service                 : SUCCESS
Total time: 2.393 s
```

## POM Update

Added `spring-boot-starter-security` and `spring-boot-starter-oauth2-resource-server` dependencies to support `@PreAuthorize` and JWT resource server configuration.

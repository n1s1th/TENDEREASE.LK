package lk.tenderease.tender.enums;

public enum TenderStatus {

    // Creation phase
    DRAFT,

    // Approval workflow
    PENDING_APPROVAL,
    APPROVED,
    REJECTED,

    // Post-approval lifecycle
    PUBLISHED,
    CLOSED,
    CANCELLED
}
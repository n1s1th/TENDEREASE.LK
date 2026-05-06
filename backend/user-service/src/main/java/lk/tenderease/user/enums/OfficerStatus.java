package lk.tenderease.user.enums;

/**
 * Enumeration representing the lifecycle status of an officer registration.
 *
 * <ul>
 *   <li>{@link #PENDING}  – Registration submitted, awaiting admin review.</li>
 *   <li>{@link #APPROVED} – Registration approved by admin.</li>
 *   <li>{@link #REJECTED} – Registration rejected by admin.</li>
 * </ul>
 */
public enum OfficerStatus {
    PENDING,
    APPROVED,
    REJECTED
}

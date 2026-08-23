package lk.tenderease.tender.enums;

/**
 * Milestones shown on a tender's procurement timeline.
 *
 * <p>Deliberately limited to the tender's own lifecycle. Events belonging to other
 * services (bid submissions, opening sessions, evaluation scoring) are not part of
 * this timeline, so historic rows carrying those values are filtered out in
 * {@code TenderTimelineRepository} rather than loaded and discarded.
 */
public enum TimelineEventType {
    CREATED,
    PUBLISHED,
    AMENDED,
    CLOSED,
    APPROVED,
    AWARDED
}

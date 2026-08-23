package lk.tenderease.tender.repository;

import lk.tenderease.tender.entity.TenderTimeline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TenderTimelineRepository extends JpaRepository<TenderTimeline, Long> {

    List<TenderTimeline> findByTenderIdOrderByTimestampDesc(UUID tenderId);

    /**
     * Loads only the lifecycle milestones this service owns.
     *
     * <p>The filter runs in SQL against the raw column, so rows written by other
     * services — including values that are not (or are no longer) part of
     * {@code TimelineEventType} — are never hydrated. Without this, a single
     * unrecognised row makes the whole timeline fail to load.
     */
    @Query(value = """
        SELECT * FROM tender_timeline
        WHERE tender_id = :tenderId
          AND event_type IN ('CREATED', 'PUBLISHED', 'AMENDED', 'CLOSED', 'APPROVED', 'AWARDED')
        ORDER BY timestamp ASC
    """, nativeQuery = true)
    List<TenderTimeline> findLifecycleEvents(@Param("tenderId") UUID tenderId);
}

package lk.tenderease.tender.repository;

import lk.tenderease.tender.entity.TenderTimeline;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TenderTimelineRepository extends JpaRepository<TenderTimeline, Long> {

    List<TenderTimeline> findByTenderIdOrderByTimestampDesc(UUID tenderId);
}
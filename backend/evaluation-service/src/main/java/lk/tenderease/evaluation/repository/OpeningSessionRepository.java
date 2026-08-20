package lk.tenderease.evaluation.repository;

import lk.tenderease.evaluation.entity.OpeningSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OpeningSessionRepository extends JpaRepository<OpeningSession, UUID> {
    Optional<OpeningSession> findByTenderId(UUID tenderId);
    Optional<OpeningSession> findFirstByTenderIdOrderByScheduledOpeningTimeDesc(UUID tenderId);
}

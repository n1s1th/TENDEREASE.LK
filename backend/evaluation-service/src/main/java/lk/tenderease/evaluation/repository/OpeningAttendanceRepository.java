package lk.tenderease.evaluation.repository;

import lk.tenderease.evaluation.entity.OpeningAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OpeningAttendanceRepository extends JpaRepository<OpeningAttendance, UUID> {
    List<OpeningAttendance> findBySessionId(UUID sessionId);
    boolean existsBySessionIdAndOfficerId(UUID sessionId, String officerId);
}

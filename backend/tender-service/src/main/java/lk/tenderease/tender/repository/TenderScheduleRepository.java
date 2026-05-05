package lk.tenderease.tender.repository;

import lk.tenderease.tender.entity.TenderSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenderScheduleRepository extends JpaRepository<TenderSchedule, UUID> {

    Optional<TenderSchedule> findByTenderId(UUID tenderId);
}

package lk.tenderease.tender.repository;

import lk.tenderease.tender.entity.TenderContact;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TenderContactRepository extends JpaRepository<TenderContact, Long> {

    List<TenderContact> findByTenderId(UUID tenderId);
}
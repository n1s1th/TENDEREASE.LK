package lk.tenderease.tender.repository;

import lk.tenderease.tender.entity.TenderDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TenderDocumentRepository extends JpaRepository<TenderDocument, Long> {

    List<TenderDocument> findByTenderId(UUID tenderId);
}
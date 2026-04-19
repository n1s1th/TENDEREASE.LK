package lk.tenderease.tender.repository;

import lk.tenderease.tender.entity.TenderDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TenderDocumentRepository extends JpaRepository<TenderDocument, UUID> {

    List<TenderDocument> findByTenderId(UUID tenderId);
}

package lk.tenderease.tender.repository;

import lk.tenderease.tender.entity.TenderTemplate;
import lk.tenderease.tender.enums.TemplateStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenderTemplateRepository extends JpaRepository<TenderTemplate, UUID> {
    
    List<TenderTemplate> findAllByIsActiveTrue();
    
    List<TenderTemplate> findAllByTemplateCodeOrderByVersionDesc(String templateCode);
    
    Optional<TenderTemplate> findTopByTemplateCodeOrderByVersionDesc(String templateCode);
}

package lk.tenderease.tender.repository;

import lk.tenderease.tender.entity.SbdTemplate;
import lk.tenderease.tender.enums.ProcurementType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SbdTemplateRepository extends JpaRepository<SbdTemplate, Long> {

    List<SbdTemplate> findByProcurementTypeAndIsActiveTrue(ProcurementType procurementType);
}

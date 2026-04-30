package lk.tenderease.tender.repository;

import lk.tenderease.tender.entity.TenderCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TenderCategoryRepository extends JpaRepository<TenderCategory, Long> {
}
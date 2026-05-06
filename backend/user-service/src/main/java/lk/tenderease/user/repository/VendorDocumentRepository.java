package lk.tenderease.user.repository;

import lk.tenderease.user.entity.VendorDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface VendorDocumentRepository extends JpaRepository<VendorDocument, UUID> {
    long countByVendorProfileId(UUID vendorProfileId);
}

package lk.tenderease.user.repository;

import lk.tenderease.user.entity.VendorProfile;
import lk.tenderease.user.enums.VendorStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface VendorProfileRepository extends JpaRepository<VendorProfile, UUID> {
    boolean existsByRegistrationNumber(String registrationNumber);
    boolean existsByOfficialEmail(String officialEmail);
    java.util.Optional<VendorProfile> findByOfficialEmail(String officialEmail);
    Page<VendorProfile> findByStatus(VendorStatus status, Pageable pageable);
}

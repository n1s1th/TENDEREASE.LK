package com.tenderease.backend.vendor.repository;

import com.tenderease.backend.vendor.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {
    Optional<Vendor> findByBusinessRegistrationNo(String businessRegistrationNo);

    Optional<Vendor> findByOfficialEmail(String officialEmail);

    boolean existsByBusinessRegistrationNo(String businessRegistrationNo);

    boolean existsByOfficialEmail(String officialEmail);
}

package lk.tenderease.tender.repository;

import lk.tenderease.tender.entity.AddendumVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AddendumVersionRepository extends JpaRepository<AddendumVersion, UUID> {

    List<AddendumVersion> findByAddendumIdOrderByVersionNumberAsc(Long addendumId);

    Optional<AddendumVersion> findByAddendumIdAndVersionNumber(Long addendumId, Integer versionNumber);

    Optional<AddendumVersion> findTopByAddendumIdOrderByVersionNumberDesc(Long addendumId);

    Optional<AddendumVersion> findByS3Key(String s3Key);

    @Query("SELECT COALESCE(MAX(v.versionNumber), 0) FROM AddendumVersion v WHERE v.addendum.id = :addendumId")
    Integer findMaxVersionNumber(@Param("addendumId") Long addendumId);
}

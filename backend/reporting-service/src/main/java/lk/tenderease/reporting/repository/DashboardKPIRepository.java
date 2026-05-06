package lk.tenderease.reporting.repository;

import lk.tenderease.reporting.entity.DashboardKPI;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DashboardKPIRepository extends JpaRepository<DashboardKPI, String> {
}

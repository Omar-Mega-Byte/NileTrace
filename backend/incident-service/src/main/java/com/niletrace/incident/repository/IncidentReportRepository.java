package com.niletrace.incident.repository;

import com.niletrace.incident.model.IncidentReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface IncidentReportRepository extends JpaRepository<IncidentReport, UUID> {

    Optional<IncidentReport> findByIncidentId(UUID incidentId);

    boolean existsByIncidentId(UUID incidentId);
}

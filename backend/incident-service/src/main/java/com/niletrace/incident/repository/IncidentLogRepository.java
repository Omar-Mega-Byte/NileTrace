package com.niletrace.incident.repository;

import com.niletrace.incident.model.IncidentLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IncidentLogRepository extends JpaRepository<IncidentLog, UUID> {

    List<IncidentLog> findByIncidentId(UUID incidentId);

    void deleteByIncidentId(UUID incidentId);
}

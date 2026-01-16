package com.niletrace.incident.repository;

import com.niletrace.incident.model.Incident;
import com.niletrace.incident.model.enums.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, UUID> {

    List<Incident> findByOwnerIdOrderByCreatedAtDesc(UUID ownerId);

    Optional<Incident> findByIdAndOwnerId(UUID id, UUID ownerId);

    List<Incident> findByOwnerIdAndStatus(UUID ownerId, IncidentStatus status);
}

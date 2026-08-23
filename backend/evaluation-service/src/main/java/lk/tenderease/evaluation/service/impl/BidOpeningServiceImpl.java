package lk.tenderease.evaluation.service.impl;

import lk.tenderease.common.constant.OpeningStatus;
import lk.tenderease.common.exception.BusinessException;
import lk.tenderease.evaluation.dto.request.OpeningAttendanceRequest;
import lk.tenderease.evaluation.dto.response.OpeningAttendanceResponse;
import lk.tenderease.evaluation.dto.response.OpeningSessionResponse;
import lk.tenderease.evaluation.entity.OpeningAttendance;
import lk.tenderease.evaluation.entity.OpeningSession;
import lk.tenderease.evaluation.mapper.EvaluationMapper;
import lk.tenderease.evaluation.repository.OpeningAttendanceRepository;
import lk.tenderease.evaluation.repository.OpeningSessionRepository;
import lk.tenderease.evaluation.service.BidOpeningService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BidOpeningServiceImpl implements BidOpeningService {

    private final OpeningSessionRepository sessionRepository;
    private final OpeningAttendanceRepository attendanceRepository;
    private final EvaluationMapper mapper;

    @jakarta.annotation.PostConstruct
    public void syncActiveSessionsToTenderService() {
        new Thread(() -> {
            try {
                // Wait 4 seconds for services to fully initialize
                Thread.sleep(4000);
                log.info("Self-healing: Synchronizing active opening sessions to tender-service status...");
                List<OpeningSession> openSessions = sessionRepository.findAll();
                org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
                for (OpeningSession session : openSessions) {
                    if (session.getStatus() == OpeningStatus.OPEN) {
                        try {
                            String getUrl = "http://localhost:8082/api/v1/tenders/" + session.getTenderId();
                            java.util.Map<?, ?> tender = restTemplate.getForObject(getUrl, java.util.Map.class);
                            if (tender != null) {
                                String currentStatus = (String) tender.get("status");
                                if ("PUBLISHED".equals(currentStatus) || "PENDING_OPENING".equals(currentStatus)) {
                                    String tenderServiceUrl = "http://localhost:8082/api/v1/tenders/" + session.getTenderId() + "/status?status=OPEN";
                                    restTemplate.put(tenderServiceUrl, null);
                                    log.info("Self-healed: Synced tender {} status to OPEN", session.getTenderId());
                                }
                            }
                        } catch (Exception e) {
                            log.error("Failed to sync tender {} status: {}", session.getTenderId(), e.getMessage());
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Failed to sync active sessions: {}", e.getMessage());
            }
        }).start();
    }

    @Override
    @Transactional(readOnly = true)
    public OpeningSessionResponse getOpeningSession(UUID tenderId) {
        OpeningSession session = sessionRepository.findFirstByTenderIdOrderByScheduledOpeningTimeDesc(tenderId)
                .orElseGet(() -> createDefaultSession(tenderId));
        return mapper.toDto(session);
    }

    private OpeningSession createDefaultSession(UUID tenderId) {
        log.info("Creating default opening session for tender: {}", tenderId);
        OpeningSession session = new OpeningSession();
        session.setTenderId(tenderId);
        // Default to 7 days from now if not specified (in real scenario, get from tender-service)
        session.setScheduledOpeningTime(LocalDateTime.now().plusDays(7));
        session.setStatus(OpeningStatus.SCHEDULED);
        return sessionRepository.save(session);
    }

    @Override
    @Transactional
    public OpeningAttendanceResponse markAttendance(UUID sessionId, OpeningAttendanceRequest request) {
        OpeningSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new BusinessException("Opening session not found"));

        if (session.getStatus() == OpeningStatus.CLOSED) {
            throw new BusinessException("Cannot mark attendance for a closed session");
        }

        if (attendanceRepository.existsBySessionIdAndOfficerId(sessionId, request.getOfficerId())) {
            throw new BusinessException("Attendance already marked for this officer");
        }

        OpeningAttendance attendance = new OpeningAttendance();
        attendance.setSession(session);
        attendance.setOfficerId(request.getOfficerId());

        // Fetch details from officer registration (user-service) in real-time
        String officerName = request.getOfficerName();
        String designation = request.getDesignation();
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String userServiceUrl = "http://localhost:8081/api/officers/email/" + request.getOfficerId();
            java.util.Map<?, ?> officerProfile = restTemplate.getForObject(userServiceUrl, java.util.Map.class);
            if (officerProfile != null) {
                if (officerProfile.get("name") != null) {
                    officerName = officerProfile.get("name").toString();
                }
                if (officerProfile.get("designation") != null) {
                    designation = officerProfile.get("designation").toString();
                }
            }
        } catch (Exception e) {
            log.error("Failed to fetch officer profile from user-service for email {}: {}", request.getOfficerId(), e.getMessage());
        }

        attendance.setOfficerName(officerName);
        attendance.setDesignation(designation);
        attendance.setOrganisation(request.getOrganisation());
        attendance.setRole(request.getRole());

        return mapper.toDto(attendanceRepository.save(attendance));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OpeningAttendanceResponse> getAttendance(UUID sessionId) {
        return attendanceRepository.findBySessionId(sessionId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OpeningSessionResponse startOpeningSession(UUID sessionId, String officerName) {
        OpeningSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new BusinessException("Opening session not found"));

        if (session.getStatus() != OpeningStatus.SCHEDULED) {
            throw new BusinessException("Session is already open or closed");
        }

        // Logic to verify minimum attendance (Quorum)
        List<OpeningAttendance> attendanceList = attendanceRepository.findBySessionId(sessionId);
        if (attendanceList.size() < 3) {
            throw new BusinessException("Minimum 3 members required for quorum to open bids");
        }

        session.setStatus(OpeningStatus.OPEN);
        session.setActualOpeningTime(LocalDateTime.now());
        session.setOpenedBy(officerName);

        log.info("Bid opening session {} started by {}", sessionId, officerName);
        
        // Update the tender status in tender-service to 'OPEN'
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String tenderServiceUrl = "http://localhost:8082/api/v1/tenders/" + session.getTenderId() + "/status?status=OPEN";
            restTemplate.put(tenderServiceUrl, null);
            log.info("Successfully updated tender status to OPEN in tender-service");
        } catch (Exception e) {
            log.error("Failed to update tender status in tender-service: {}", e.getMessage());
        }
        
        // TODO: Publish event to bid-service to unseal bids
        
        return mapper.toDto(sessionRepository.save(session));
    }

    @Override
    @Transactional
    public void deleteAttendance(UUID attendanceId) {
        log.info("Deleting opening attendance with ID: {}", attendanceId);
        attendanceRepository.deleteById(attendanceId);
    }
}

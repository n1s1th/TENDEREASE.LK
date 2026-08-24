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
    @Transactional
    public OpeningSessionResponse getOpeningSession(UUID tenderId) {
        OpeningSession session = sessionRepository.findFirstByTenderIdOrderByScheduledOpeningTimeDesc(tenderId)
                .orElseGet(() -> createDefaultSession(tenderId));

        // Sync scheduled opening time with tender closing date if session is still SCHEDULED
        if (session.getStatus() == OpeningStatus.SCHEDULED) {
            try {
                org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
                String tenderServiceUrl = "http://localhost:8082/api/tenders/" + tenderId;
                java.util.Map<?, ?> response = restTemplate.getForObject(tenderServiceUrl, java.util.Map.class);
                if (response != null && response.get("closingDate") != null) {
                    LocalDateTime closingDate = parseClosingDate(response.get("closingDate"));
                    if (closingDate != null && !closingDate.equals(session.getScheduledOpeningTime())) {
                        session.setScheduledOpeningTime(closingDate);
                        session = sessionRepository.save(session);
                        log.info("Synced scheduled opening time to: {}", closingDate);
                    }
                }
            } catch (Exception e) {
                log.error("Failed to sync closingDate from tender-service: {}", e.getMessage());
            }
        }

        return mapper.toDto(session);
    }

    private OpeningSession createDefaultSession(UUID tenderId) {
        log.info("Creating default opening session for tender: {}", tenderId);
        OpeningSession session = new OpeningSession();
        session.setTenderId(tenderId);
        
        LocalDateTime openingTime = null;
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String tenderServiceUrl = "http://localhost:8082/api/tenders/" + tenderId;
            java.util.Map<?, ?> response = restTemplate.getForObject(tenderServiceUrl, java.util.Map.class);
            if (response != null && response.get("closingDate") != null) {
                openingTime = parseClosingDate(response.get("closingDate"));
                log.info("Fetched closingDate from tender-service for default session: {}", openingTime);
            }
        } catch (Exception e) {
            log.error("Failed to fetch closingDate from tender-service for default session: {}", e.getMessage());
        }

        if (openingTime == null) {
            openingTime = LocalDateTime.now().plusDays(7);
        }

        session.setScheduledOpeningTime(openingTime);
        session.setStatus(OpeningStatus.SCHEDULED);
        return sessionRepository.save(session);
    }

    private LocalDateTime parseClosingDate(Object closingDateObj) {
        if (closingDateObj == null) return null;
        if (closingDateObj instanceof List) {
            List<?> list = (List<?>) closingDateObj;
            int year = list.size() > 0 ? ((Number) list.get(0)).intValue() : 2026;
            int month = list.size() > 1 ? ((Number) list.get(1)).intValue() : 1;
            int day = list.size() > 2 ? ((Number) list.get(2)).intValue() : 1;
            int hour = list.size() > 3 ? ((Number) list.get(3)).intValue() : 0;
            int minute = list.size() > 4 ? ((Number) list.get(4)).intValue() : 0;
            int second = list.size() > 5 ? ((Number) list.get(5)).intValue() : 0;
            return LocalDateTime.of(year, month, day, hour, minute, second);
        } else {
            String dateStr = closingDateObj.toString();
            if (dateStr.contains("Z")) {
                dateStr = dateStr.substring(0, dateStr.indexOf("Z"));
            }
            if (dateStr.contains("+")) {
                dateStr = dateStr.substring(0, dateStr.indexOf("+"));
            }
            return LocalDateTime.parse(dateStr);
        }
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

        if (request.getAttendanceTime() != null) {
            attendance.setAttendanceTime(request.getAttendanceTime());
        } else {
            attendance.setAttendanceTime(LocalDateTime.now());
        }

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

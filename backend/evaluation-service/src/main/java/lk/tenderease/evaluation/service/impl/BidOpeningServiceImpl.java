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

    @Override
    @Transactional(readOnly = true)
    public OpeningSessionResponse getOpeningSession(UUID tenderId) {
        OpeningSession session = sessionRepository.findByTenderId(tenderId)
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
        attendance.setOfficerName(request.getOfficerName());
        attendance.setDesignation(request.getDesignation());
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
}

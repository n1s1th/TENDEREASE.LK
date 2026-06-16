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
        return toSessionDto(session);
    }

    private OpeningSession createDefaultSession(UUID tenderId) {
        log.info("Creating default opening session for tender: {}", tenderId);
        OpeningSession session = new OpeningSession();
        session.setTenderId(tenderId);
        // Default to 7 days from now if not specified (in real scenario, get from tender-service)
        LocalDateTime scheduledTime = LocalDateTime.now().plusDays(7);
        session.setScheduledOpeningTime(scheduledTime);
        // Default bid submission deadline to 2 hours after scheduled opening time
        // This will be overridden by the tender creation page when it is available
        session.setBidSubmissionDeadline(scheduledTime.plusHours(2));
        session.setStatus(OpeningStatus.SCHEDULED);
        return sessionRepository.save(session);
    }

    @Override
    @Transactional
    public OpeningAttendanceResponse markAttendance(UUID sessionId, OpeningAttendanceRequest request) {
        OpeningSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new BusinessException("Opening session not found"));

        if (session.getStatus() == OpeningStatus.OPEN || session.getStatus() == OpeningStatus.CLOSED) {
            throw new BusinessException("Cannot modify attendance after session has been opened");
        }

        if (attendanceRepository.existsBySessionIdAndOfficerId(sessionId, request.getOfficerId())) {
            throw new BusinessException("Attendance already marked for this officer");
        }

        OpeningAttendance attendance = new OpeningAttendance();
        attendance.setSession(session);
        attendance.setOfficerId(request.getOfficerId());
        attendance.setOfficerName(request.getOfficerName());
        attendance.setDesignation(request.getDesignation());
        attendance.setEmail(request.getEmail());
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
        
        // TODO: Publish event to bid-service to unseal bids
        
        return toSessionDto(sessionRepository.save(session));
    }

    @Override
    @Transactional
    public OpeningAttendanceResponse updateAttendance(UUID sessionId, UUID attendanceId, OpeningAttendanceRequest request) {
        OpeningSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new BusinessException("Opening session not found"));

        if (session.getStatus() == OpeningStatus.OPEN || session.getStatus() == OpeningStatus.CLOSED) {
            throw new BusinessException("Cannot modify attendance after session has been opened");
        }

        OpeningAttendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new BusinessException("Attendance record not found"));

        // Verify the attendance belongs to this session
        if (!attendance.getSession().getId().equals(sessionId)) {
            throw new BusinessException("Attendance record does not belong to this session");
        }

        attendance.setOfficerName(request.getOfficerName());
        attendance.setDesignation(request.getDesignation());
        attendance.setEmail(request.getEmail());
        attendance.setOrganisation(request.getOrganisation());
        attendance.setRole(request.getRole());

        return mapper.toDto(attendanceRepository.save(attendance));
    }

    @Override
    @Transactional
    public void deleteAttendance(UUID sessionId, UUID attendanceId) {
        OpeningSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new BusinessException("Opening session not found"));

        if (session.getStatus() == OpeningStatus.OPEN || session.getStatus() == OpeningStatus.CLOSED) {
            throw new BusinessException("Cannot modify attendance after session has been opened");
        }

        OpeningAttendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new BusinessException("Attendance record not found"));

        if (!attendance.getSession().getId().equals(sessionId)) {
            throw new BusinessException("Attendance record does not belong to this session");
        }

        attendanceRepository.delete(attendance);
        log.info("Deleted attendance record {} from session {}", attendanceId, sessionId);
    }

    /**
     * Helper to map OpeningSession to DTO and include attendance count.
     */
    private OpeningSessionResponse toSessionDto(OpeningSession session) {
        OpeningSessionResponse dto = mapper.toDto(session);
        int count = attendanceRepository.findBySessionId(session.getId()).size();
        dto.setAttendanceCount(count);
        return dto;
    }
}

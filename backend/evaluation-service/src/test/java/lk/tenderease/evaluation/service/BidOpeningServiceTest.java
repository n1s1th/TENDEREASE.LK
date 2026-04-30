package lk.tenderease.evaluation.service;

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
import lk.tenderease.evaluation.service.impl.BidOpeningServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BidOpeningServiceTest {

    @Mock
    private OpeningSessionRepository sessionRepository;
    @Mock
    private OpeningAttendanceRepository attendanceRepository;
    @Mock
    private EvaluationMapper mapper;

    @InjectMocks
    private BidOpeningServiceImpl bidOpeningService;

    private UUID tenderId;
    private UUID sessionId;
    private OpeningSession session;

    @BeforeEach
    void setUp() {
        tenderId = UUID.randomUUID();
        sessionId = UUID.randomUUID();
        session = new OpeningSession();
        session.setId(sessionId);
        session.setTenderId(tenderId);
        session.setStatus(OpeningStatus.SCHEDULED);
    }

    @Test
    void getOpeningSession_Success() {
        when(sessionRepository.findByTenderId(tenderId)).thenReturn(Optional.of(session));
        when(mapper.toDto(session)).thenReturn(new OpeningSessionResponse());

        OpeningSessionResponse response = bidOpeningService.getOpeningSession(tenderId);

        assertNotNull(response);
        verify(sessionRepository).findByTenderId(tenderId);
    }

    @Test
    void markAttendance_Success() {
        OpeningAttendanceRequest request = new OpeningAttendanceRequest();
        request.setOfficerId("OFFICER-01");
        request.setOfficerName("John Doe");
        request.setDesignation("Manager");

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(attendanceRepository.existsBySessionIdAndOfficerId(sessionId, request.getOfficerId())).thenReturn(false);
        when(attendanceRepository.save(any(OpeningAttendance.class))).thenReturn(new OpeningAttendance());
        when(mapper.toDto(any(OpeningAttendance.class))).thenReturn(new OpeningAttendanceResponse());

        OpeningAttendanceResponse response = bidOpeningService.markAttendance(sessionId, request);

        assertNotNull(response);
        verify(attendanceRepository).save(any(OpeningAttendance.class));
    }

    @Test
    void startOpeningSession_QuorumError() {
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(attendanceRepository.findBySessionId(sessionId)).thenReturn(Collections.emptyList());

        assertThrows(BusinessException.class, () -> 
            bidOpeningService.startOpeningSession(sessionId, "Chairperson")
        );
    }

    @Test
    void startOpeningSession_Success() {
        List<OpeningAttendance> attendanceList = List.of(
            new OpeningAttendance(), new OpeningAttendance(), new OpeningAttendance()
        );

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(attendanceRepository.findBySessionId(sessionId)).thenReturn(attendanceList);
        when(sessionRepository.save(any(OpeningSession.class))).thenReturn(session);
        when(mapper.toDto(session)).thenReturn(new OpeningSessionResponse());

        OpeningSessionResponse response = bidOpeningService.startOpeningSession(sessionId, "Chairperson");

        assertNotNull(response);
        assertEquals(OpeningStatus.OPEN, session.getStatus());
    }
}

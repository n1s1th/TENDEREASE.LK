package lk.tenderease.evaluation.service;

import lk.tenderease.evaluation.dto.request.OpeningAttendanceRequest;
import lk.tenderease.evaluation.dto.response.OpeningAttendanceResponse;
import lk.tenderease.evaluation.dto.response.OpeningSessionResponse;

import java.util.List;
import java.util.UUID;

public interface BidOpeningService {
    OpeningSessionResponse getOpeningSession(UUID tenderId);
    OpeningAttendanceResponse markAttendance(UUID sessionId, OpeningAttendanceRequest request);
    List<OpeningAttendanceResponse> getAttendance(UUID sessionId);
    OpeningSessionResponse startOpeningSession(UUID sessionId, String officerName);
}

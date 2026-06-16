package lk.tenderease.evaluation.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class OpeningAttendanceResponse {
    private UUID id;
    private String officerId;
    private String officerName;
    private String designation;
    private String organisation;
    private String role;
    private LocalDateTime attendanceTime;
}

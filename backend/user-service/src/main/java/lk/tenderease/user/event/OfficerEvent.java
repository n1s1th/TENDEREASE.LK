package lk.tenderease.user.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Event DTO published to RabbitMQ when an officer registration lifecycle
 * event occurs (registered, approved, rejected).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfficerEvent implements Serializable {

    private String referenceId;
    private String email;
    private String status;
    private String eventType;
    private String officerName;
    private LocalDateTime timestamp;
}

package lk.tenderease.evaluation.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "opening_attendance")
@Getter
@Setter
public class OpeningAttendance {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "opening_session_id", nullable = false)
    private OpeningSession session;

    @Column(name = "officer_id", nullable = false, length = 50)
    private String officerId;

    @Column(name = "officer_name", nullable = false)
    private String officerName;

    @Column(nullable = false, length = 150)
    private String designation;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(length = 150)
    private String organisation;

    @Column(length = 50)
    private String role;

    @CreationTimestamp
    @Column(name = "attendance_time", updatable = false)
    private LocalDateTime attendanceTime;
}

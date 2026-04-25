package lk.tenderease.tender.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "clarification_response")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClarificationResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String response;

    private Long respondedBy;

    private LocalDateTime respondedAt;

    @OneToOne
    @JoinColumn(name = "clarification_id")
    private TenderClarification clarification;
}
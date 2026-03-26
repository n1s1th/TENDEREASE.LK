package lk.tenderease.tender.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tender_contacts")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenderContact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String officerName;
    private String designation;
    private String email;
    private String phone;

    @ManyToOne
    @JoinColumn(name = "tender_id")
    private Tender tender;
}
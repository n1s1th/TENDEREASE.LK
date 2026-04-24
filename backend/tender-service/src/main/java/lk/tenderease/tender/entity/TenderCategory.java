package lk.tenderease.tender.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tender_categories")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenderCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;

    private Long parentCategoryId;
}
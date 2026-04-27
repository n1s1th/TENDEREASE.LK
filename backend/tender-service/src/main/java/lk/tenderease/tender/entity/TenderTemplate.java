package lk.tenderease.tender.entity;

import jakarta.persistence.*;
import lk.tenderease.common.entity.BaseEntity;
import lk.tenderease.tender.dto.template.TemplateSchema;
import lk.tenderease.tender.enums.TemplateStatus;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "tender_templates")
public class TenderTemplate extends BaseEntity {

    @Column(name = "template_code", nullable = false, length = 100)
    private String templateCode;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "version", nullable = false)
    private Integer version;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private TemplateStatus status;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "schema", columnDefinition = "jsonb")
    private TemplateSchema schema;
}

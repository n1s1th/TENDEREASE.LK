package lk.tenderease.tender.dto.template;

import lk.tenderease.tender.enums.TemplateStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenderTemplateResponse {
    private UUID id;
    private String templateCode;
    private String name;
    private String description;
    private Integer version;
    private TemplateStatus status;
    private boolean isActive;
    private TemplateSchema schema;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

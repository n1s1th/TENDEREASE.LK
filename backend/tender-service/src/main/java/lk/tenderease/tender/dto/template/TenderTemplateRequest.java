package lk.tenderease.tender.dto.template;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenderTemplateRequest {
    @NotBlank(message = "Template name is required")
    private String name;
    
    private String description;
    
    private TemplateSchema schema;
}

package lk.tenderease.tender.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenderDocumentResponse {
    private UUID id;
    private String fileName;
    private String documentType;
}

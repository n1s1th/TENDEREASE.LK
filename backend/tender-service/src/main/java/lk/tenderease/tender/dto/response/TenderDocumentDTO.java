package lk.tenderease.tender.dto.response;

import lk.tenderease.tender.enums.DocumentType;
import lombok.*;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenderDocumentDTO {

    private UUID id;
    private String documentName;
    private DocumentType documentType;
    private String downloadUrl; // from document-service
    private Integer version;
}

package lk.tenderease.tender.dto.response;

import lk.tenderease.tender.enums.DocumentType;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenderDocumentDTO {

    private Long id;
    private String documentName;
    private DocumentType documentType;
    private String downloadUrl; // from document-service
    private Integer version;
}
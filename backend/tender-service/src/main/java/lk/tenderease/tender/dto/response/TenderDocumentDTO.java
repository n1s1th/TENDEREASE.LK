package lk.tenderease.tender.dto.response;

import lk.tenderease.tender.enums.DocumentType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenderDocumentDTO {

    private UUID id;
    private String documentName;
    private DocumentType documentType;
    private String mimeType;
    private Long fileSizeBytes;
    private Integer version;
    private LocalDateTime uploadedAt;
    private String downloadUrl;
}

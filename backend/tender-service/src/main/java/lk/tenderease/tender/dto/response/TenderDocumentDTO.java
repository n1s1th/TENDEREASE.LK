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
    private UUID tenderId;
    private String documentName;
    private DocumentType documentType;
    /** URL served by this service, streaming the object out of S3. */
    private String downloadUrl;
    private Integer version;

    /** Size of the stored object in bytes; the UI formats this for display. */
    private Long fileSizeBytes;
    private String mimeType;
    private LocalDateTime uploadedAt;
}

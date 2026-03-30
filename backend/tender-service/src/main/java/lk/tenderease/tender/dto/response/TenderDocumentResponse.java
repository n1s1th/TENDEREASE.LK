package lk.tenderease.tender.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lk.tenderease.tender.enums.DocumentType;
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
@Schema(description = "Tender document response")
public class TenderDocumentResponse {

    @Schema(description = "Unique document identifier")
    private UUID id;

    @Schema(description = "ID of the parent tender")
    private UUID tenderId;

    @Schema(description = "Name of the document file")
    private String documentName;

    @Schema(description = "Type classification of the document")
    private DocumentType documentType;

    @Schema(description = "ID of the associated SBD template")
    private Long sbdTemplateId;

    @Schema(description = "Version of the SBD template")
    private String templateVersion;

    @Schema(description = "File size in bytes")
    private Long fileSizeBytes;

    @Schema(description = "MIME type of the file")
    private String mimeType;

    @Schema(description = "Timestamp when the document was uploaded")
    private LocalDateTime uploadedAt;
}

package lk.tenderease.tender.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lk.tenderease.tender.enums.DocumentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request payload for uploading a document to a tender")
public class DocumentUploadRequest {

    @NotNull(message = "File is required")
    @Schema(description = "The document file to upload (PDF, DOC, or DOCX)")
    private MultipartFile file;

    @NotNull(message = "Document type is required")
    @Schema(description = "Classification of the document", example = "SBD")
    private DocumentType documentType;

    @Schema(description = "ID of the SBD template (required for SBD document type)", example = "1")
    private Long sbdTemplateId;
}

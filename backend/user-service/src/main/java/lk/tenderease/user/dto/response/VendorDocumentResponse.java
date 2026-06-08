package lk.tenderease.user.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class VendorDocumentResponse {
    private UUID docId;
    private String documentType;
    private String documentTitle;
    private String originalFileName;
    private Long fileSizeBytes;
    private String mimeType;
    private LocalDateTime uploadedAt;
}

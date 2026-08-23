package lk.tenderease.tender.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Addendum version response with file metadata")
public class AddendumVersionResponse {

    @Schema(description = "Unique version identifier")
    private UUID id;

    @Schema(description = "Sequential version number (1, 2, 3, ...)")
    private Integer versionNumber;

    @Schema(description = "URL for downloading this version from the tender service (backed by S3)")
    private String secureUrl;

    @Schema(description = "Original filename as uploaded")
    private String originalFilename;

    @Schema(description = "MIME type of the file")
    private String contentType;

    @Schema(description = "File size in bytes")
    private Long fileSize;

    @Schema(description = "Description of what changed in this version")
    private String changeDescription;

    @Schema(description = "User who uploaded this version")
    private String uploadedBy;

    @Schema(description = "Timestamp when this version was created")
    private LocalDateTime createdAt;
}

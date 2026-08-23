package lk.tenderease.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.core.io.Resource;

/**
 * A vendor document streamed straight out of S3, together with the metadata the
 * controller needs to build the HTTP response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorDocumentDownload {

    /** Stream backed by the S3 object. */
    private Resource resource;

    /** Original file name as uploaded by the vendor. */
    private String fileName;

    /** MIME type recorded at upload time. */
    private String contentType;

    /** Size in bytes, or null when unknown. */
    private Long contentLength;
}

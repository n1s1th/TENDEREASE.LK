package lk.tenderease.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

import java.util.List;
import java.util.UUID;

/**
 * Validates vendor documents and stores them in S3.
 *
 * <p>Keys follow {@code vendors/{vendorId}/{documentType}/{uuid}_{filename}} so every
 * vendor's documents stay grouped by type inside the shared bucket.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageService {

    private static final long MAX_FILE_SIZE_BYTES = 20L * 1024 * 1024; // 20 MB
    private static final List<String> ALLOWED_MIME_TYPES = List.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    private static final String VENDOR_PREFIX = "vendors";

    private final S3Service s3Service;

    /**
     * Uploads the file to S3 and returns the key that should be persisted on the document.
     */
    public String store(MultipartFile file, UUID vendorId, String documentType) {
        validateFile(file);

        String key = S3Service.buildKey(
                VENDOR_PREFIX,
                vendorId.toString(),
                documentType,
                file.getOriginalFilename());

        s3Service.uploadFile(key, file);
        log.info("Stored vendor document at S3 key: {}", key);
        return key;
    }

    /** Opens a stream for a previously stored document. */
    public ResponseInputStream<GetObjectResponse> load(String s3Key) {
        return s3Service.openStream(s3Key);
    }

    /** Removes a stored document. Never throws for an already-missing object. */
    public void delete(String s3Key) {
        try {
            s3Service.deleteFile(s3Key);
        } catch (RuntimeException e) {
            log.error("Failed to delete S3 object {}: {}", s3Key, e.getMessage());
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("File size exceeds the maximum allowed limit of 20 MB");
        }
        String mimeType = file.getContentType();
        if (mimeType == null || !ALLOWED_MIME_TYPES.contains(mimeType)) {
            throw new IllegalArgumentException(
                    "Invalid file type. Only PDF, DOC, and DOCX files are allowed. Got: " + mimeType);
        }
    }
}

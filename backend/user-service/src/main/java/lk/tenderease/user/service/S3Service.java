package lk.tenderease.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.io.InputStream;
import java.util.Locale;
import java.util.UUID;

/**
 * Single entry point for every file operation in the User Service.
 *
 * <p>All objects live in one bucket under a predictable prefix layout, so keys stay
 * readable and each service owns its own namespace:
 * <pre>
 *   vendors/{vendorId}/{documentType}/{uuid}_{filename}
 *   tenders/{tenderId}/documents/{uuid}_{filename}
 *   tenders/{tenderId}/addenda/{addendumId}/v{n}/{uuid}_{filename}
 *   bids/{tenderId}/{uuid}_{filename}
 * </pre>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    /** Uploads a multipart file under the given key. */
    public void uploadFile(String key, MultipartFile file) {
        log.info("Uploading '{}' to S3 bucket '{}' with key '{}'", file.getOriginalFilename(), bucketName, key);
        try (InputStream in = file.getInputStream()) {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(request, RequestBody.fromInputStream(in, file.getSize()));
            log.info("Uploaded file to S3: {}", key);
        } catch (S3Exception | IOException e) {
            log.error("Error uploading file to S3 key {}: {}", key, e.getMessage());
            throw new RuntimeException("Could not upload file to S3", e);
        }
    }

    /** Uploads raw bytes (generated documents, archives) under the given key. */
    public void uploadBytes(String key, byte[] content, String contentType) {
        log.info("Uploading {} bytes to S3 bucket '{}' with key '{}'", content.length, bucketName, key);
        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(contentType != null ? contentType : "application/octet-stream")
                    .contentLength((long) content.length)
                    .build();

            s3Client.putObject(request, RequestBody.fromBytes(content));
        } catch (S3Exception e) {
            log.error("Error uploading bytes to S3 key {}: {}", key, e.getMessage());
            throw new RuntimeException("Could not upload file to S3", e);
        }
    }

    /** Reads the whole object into memory. Prefer {@link #openStream(String)} for large files. */
    public byte[] downloadFile(String key) {
        log.debug("Downloading S3 object '{}' from bucket '{}'", key, bucketName);
        try {
            return s3Client.getObjectAsBytes(getRequest(key)).asByteArray();
        } catch (NoSuchKeyException e) {
            throw new IllegalArgumentException("File not found in S3: " + key, e);
        } catch (S3Exception e) {
            log.error("Error downloading S3 key {}: {}", key, e.getMessage());
            throw new RuntimeException("Could not download file from S3", e);
        }
    }

    /** Opens a stream to the object so it can be piped straight to the HTTP response. */
    public ResponseInputStream<GetObjectResponse> openStream(String key) {
        log.debug("Opening S3 stream for '{}' in bucket '{}'", key, bucketName);
        try {
            return s3Client.getObject(getRequest(key));
        } catch (NoSuchKeyException e) {
            throw new IllegalArgumentException("File not found in S3: " + key, e);
        } catch (S3Exception e) {
            log.error("Error streaming S3 key {}: {}", key, e.getMessage());
            throw new RuntimeException("Could not read file from S3", e);
        }
    }

    /** Deletes the object. Missing keys are treated as already deleted. */
    public void deleteFile(String key) {
        if (key == null || key.isBlank()) {
            return;
        }
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucketName).key(key).build());
            log.info("Deleted S3 object: {}", key);
        } catch (NoSuchKeyException e) {
            log.warn("S3 object already absent: {}", key);
        } catch (S3Exception e) {
            log.error("Failed to delete S3 key {}: {}", key, e.getMessage());
            throw new RuntimeException("Could not delete file from S3", e);
        }
    }

    /** Returns true when an object exists under the key. */
    public boolean exists(String key) {
        if (key == null || key.isBlank()) {
            return false;
        }
        try {
            s3Client.headObject(HeadObjectRequest.builder().bucket(bucketName).key(key).build());
            return true;
        } catch (NoSuchKeyException e) {
            return false;
        } catch (S3Exception e) {
            if (e.statusCode() == 404) {
                return false;
            }
            throw new RuntimeException("Could not check file in S3", e);
        }
    }

    /**
     * Builds a key from folder segments plus a unique, sanitized file name, e.g.
     * {@code buildKey("tenders", tenderId, "documents", "My Doc.pdf")}.
     */
    public static String buildKey(String... segments) {
        if (segments.length == 0) {
            throw new IllegalArgumentException("At least a file name is required to build an S3 key");
        }
        StringBuilder key = new StringBuilder();
        for (int i = 0; i < segments.length - 1; i++) {
            key.append(sanitizeSegment(segments[i])).append('/');
        }
        return key.append(UUID.randomUUID())
                .append('_')
                .append(sanitizeFilename(segments[segments.length - 1]))
                .toString();
    }

    /** Strips slashes and unsafe characters from a single folder segment. */
    public static String sanitizeSegment(String segment) {
        if (segment == null || segment.isBlank()) {
            return "unknown";
        }
        return segment.trim().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9._-]", "-");
    }

    /** Keeps the original file name recognisable while removing path traversal characters. */
    public static String sanitizeFilename(String filename) {
        if (filename == null || filename.isBlank()) {
            return "document";
        }
        String name = filename.replace('\\', '/');
        name = name.substring(name.lastIndexOf('/') + 1);
        name = name.replaceAll("[^a-zA-Z0-9._-]", "_");
        return name.isBlank() ? "document" : name;
    }

    private GetObjectRequest getRequest(String key) {
        return GetObjectRequest.builder().bucket(bucketName).key(key).build();
    }
}

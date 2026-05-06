package lk.tenderease.user.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    private static final long MAX_FILE_SIZE_BYTES = 20L * 1024 * 1024; // 20 MB
    private static final List<String> ALLOWED_MIME_TYPES = List.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    @Value("${app.upload.base-dir:./uploads}")
    private String baseUploadDir;

    public String store(MultipartFile file, UUID vendorId, String documentType) {
        validateFile(file);

        String safeFileName = UUID.randomUUID() + "_" + sanitizeFilename(file.getOriginalFilename());
        Path targetDir = Paths.get(baseUploadDir, "vendors", vendorId.toString(), documentType.toLowerCase());

        try {
            Files.createDirectories(targetDir);
            Path targetPath = targetDir.resolve(safeFileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            log.info("Stored file at: {}", targetPath);
            return targetPath.toString();
        } catch (IOException e) {
            log.error("Failed to store file: {}", e.getMessage());
            throw new RuntimeException("Could not store the file. Please try again.", e);
        }
    }

    public void delete(String filePath) {
        try {
            Path path = Paths.get(filePath);
            boolean deleted = Files.deleteIfExists(path);
            if (deleted) {
                log.info("Deleted file: {}", filePath);
            } else {
                log.warn("File not found for deletion: {}", filePath);
            }
        } catch (IOException e) {
            log.error("Failed to delete file {}: {}", filePath, e.getMessage());
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

    private String sanitizeFilename(String filename) {
        if (filename == null) return "document";
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}

package lk.tenderease.tender.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    @org.springframework.beans.factory.annotation.Value("${app.upload-dir:../uploads}")
    private String uploadDir;

    @SuppressWarnings("unchecked")
    public Map<String, Object> uploadFile(MultipartFile file, String folder) {
        try {
            log.info("Uploading file '{}' to Cloudinary folder '{}'", file.getOriginalFilename(), folder);
            Map<String, Object> params = ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "auto",
                    "use_filename", true,
                    "unique_filename", true
            );
            return (Map<String, Object>) cloudinary.uploader().upload(file.getBytes(), params);
        } catch (Exception e) {
            log.warn("Cloudinary upload failed ({}). Falling back to local storage for dev.", e.getMessage());
            try {
                java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);
                if (!java.nio.file.Files.exists(uploadPath)) {
                    java.nio.file.Files.createDirectories(uploadPath);
                }
                String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.pdf";
                String filename = java.util.UUID.randomUUID().toString() + "_" + originalFilename;
                java.nio.file.Path target = uploadPath.resolve(filename);
                java.nio.file.Files.copy(file.getInputStream(), target, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

                String localUrl = "http://localhost:8082/api/tenders/files/" + filename;
                return Map.of(
                        "public_id", folder + "/" + filename,
                        "url", localUrl,
                        "secure_url", localUrl
                );
            } catch (IOException localEx) {
                log.error("Local fallback upload also failed: {}", localEx.getMessage(), localEx);
                throw new RuntimeException("Could not upload file", localEx);
            }
        }
    }
}

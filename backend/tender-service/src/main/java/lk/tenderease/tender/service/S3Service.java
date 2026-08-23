package lk.tenderease.tender.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    public void uploadFile(String key, MultipartFile file) {
        log.info("Uploading file '{}' to S3 bucket '{}' with key '{}'", file.getOriginalFilename(), bucketName, key);
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            log.info("Successfully uploaded file to S3: {}", key);
        } catch (S3Exception | IOException e) {
            log.error("Error uploading file to S3: {}", e.getMessage());
            throw new RuntimeException("Could not upload file to S3", e);
        }
    }

    public byte[] downloadFile(String key) {
        log.info("Downloading file from S3 bucket '{}' with key '{}'", bucketName, key);
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            ResponseBytes<GetObjectResponse> objectBytes = s3Client.getObjectAsBytes(getObjectRequest);
            return objectBytes.asByteArray();
        } catch (S3Exception e) {
            log.error("Error downloading file from S3: {}", e.getMessage());
            throw new RuntimeException("Could not download file from S3", e);
        }
    }
}

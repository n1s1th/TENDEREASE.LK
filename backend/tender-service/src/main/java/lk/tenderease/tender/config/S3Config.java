package lk.tenderease.tender.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class S3Config {

    @Value("${aws.access-key}")
    private String accessKey;

    @Value("${aws.secret-key}")
    private String secretKey;

    @Value("${aws.region}")
    private String region;

    @Bean
    public S3Client s3Client() {
        String effectiveRegion = (region != null && !region.isBlank()) ? region : "ap-south-1";
        if (accessKey == null || accessKey.isBlank() || secretKey == null || secretKey.isBlank()) {
            return S3Client.builder()
                    .region(Region.of(effectiveRegion))
                    .credentialsProvider(software.amazon.awssdk.auth.credentials.AnonymousCredentialsProvider.create())
                    .build();
        }
        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);
        return S3Client.builder()
                .region(Region.of(effectiveRegion))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .build();
    }
}

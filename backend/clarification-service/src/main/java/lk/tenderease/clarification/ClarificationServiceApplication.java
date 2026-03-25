package lk.tenderease.clarification;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication(scanBasePackages = {
    "lk.tenderease.clarification",
    "lk.tenderease.common"
})
@EnableDiscoveryClient
@EnableJpaAuditing
public class ClarificationServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ClarificationServiceApplication.class, args);
    }
}

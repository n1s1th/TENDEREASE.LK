package lk.tenderease.evaluation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication(scanBasePackages = {
    "lk.tenderease.evaluation",
    "lk.tenderease.common"
})
@EnableDiscoveryClient
@EnableJpaAuditing
public class EvaluationServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(EvaluationServiceApplication.class, args);
    }
}

package lk.tenderease.appeal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication(scanBasePackages = {
    "lk.tenderease.appeal",
    "lk.tenderease.common"
})
@EnableDiscoveryClient
public class AppealServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AppealServiceApplication.class, args);
    }
}

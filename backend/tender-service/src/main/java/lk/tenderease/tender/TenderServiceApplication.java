package lk.tenderease.tender;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.oauth2.resource.servlet.OAuth2ResourceServerAutoConfiguration;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;

@SpringBootApplication(scanBasePackages = {
    "lk.tenderease.tender",
    "lk.tenderease.common"
})
@EnableDiscoveryClient
public class TenderServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(TenderServiceApplication.class, args);
    }
}

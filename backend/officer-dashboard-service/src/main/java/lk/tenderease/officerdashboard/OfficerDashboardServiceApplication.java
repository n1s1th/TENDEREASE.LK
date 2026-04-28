package lk.tenderease.officerdashboard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication(scanBasePackages = {
        "lk.tenderease.officerdashboard",
        "lk.tenderease.common"
})
@EnableDiscoveryClient
public class OfficerDashboardServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(OfficerDashboardServiceApplication.class, args);
    }
}

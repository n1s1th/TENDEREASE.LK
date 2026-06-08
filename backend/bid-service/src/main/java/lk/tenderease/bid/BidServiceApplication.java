package lk.tenderease.bid;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;

@SpringBootApplication
@ComponentScan(
    basePackages = {
        "lk.tenderease.bid",
        "lk.tenderease.common"
    },
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.REGEX,
        pattern = {
            "lk\\.tenderease\\.common\\.security\\..*",
            "lk\\.tenderease\\.common\\.config\\.RabbitMQConfig",
            "lk\\.tenderease\\.common\\.config\\.RedisConfig"
        }
    )
)
public class BidServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(BidServiceApplication.class, args);
    }
}

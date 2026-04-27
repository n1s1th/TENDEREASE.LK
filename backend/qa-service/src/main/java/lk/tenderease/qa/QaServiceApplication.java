package lk.tenderease.qa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@EnableCaching
@SpringBootApplication
public class QaServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(QaServiceApplication.class, args);
    }
}

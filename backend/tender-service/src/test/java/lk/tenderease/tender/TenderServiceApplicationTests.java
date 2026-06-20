package lk.tenderease.tender;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class TenderServiceApplicationTests {

    @Test
    void contextLoads() {
        // Basic test to check if the application context loads successfully
        // This implicitly tests that the Auth configs and basic beans are wired correctly.
    }

}

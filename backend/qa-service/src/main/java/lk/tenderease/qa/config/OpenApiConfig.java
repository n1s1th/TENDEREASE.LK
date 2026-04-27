package lk.tenderease.qa.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI qaOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("TenderEase Q&A Service API")
                        .version("v1")
                        .description("Platform-wide public Q&A service for TenderEase.lk"))
                .schemaRequirement("headerAuth", new SecurityScheme()
                        .type(SecurityScheme.Type.APIKEY)
                        .in(SecurityScheme.In.HEADER)
                        .name("X-Roles"))
                .addSecurityItem(new SecurityRequirement().addList("headerAuth"));
    }
}

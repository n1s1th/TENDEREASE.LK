package lk.tenderease.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            .authorizeExchange(exchanges -> exchanges
                // Allow CORS preflight requests
                .pathMatchers(HttpMethod.OPTIONS).permitAll()
                // Allow public endpoints
                .pathMatchers("/api/public/**", "/actuator/**", "/eureka/**").permitAll()
                // Allow vendor registration endpoints
                .pathMatchers(
                    "/api/v1/vendors/register", 
                    "/api/v1/vendors/verify-registration",
                    "/api/v1/vendors/*/documents",
                    "/api/v1/vendors/*/documents/**",
                    "/api/v1/vendors/*/submit"
                ).permitAll()
                .anyExchange().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(org.springframework.security.config.Customizer.withDefaults()));
        return http.build();
    }
}

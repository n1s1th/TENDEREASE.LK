package lk.tenderease.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            .cors(ServerHttpSecurity.CorsSpec::disable)
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
                // For now, keep dev branch openness but keep the above for clarity
                .anyExchange().permitAll()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
        return http.build();
    }
}

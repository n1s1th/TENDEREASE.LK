package lk.tenderease.user.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.annotation.Order;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security configuration for the Officer Registration Service.
 *
 * <p>Overrides the common-library {@code KeycloakSecurityConfig} to:
 * <ul>
 *   <li>Permit {@code POST /api/officers/register} as a <strong>PUBLIC</strong> endpoint</li>
 *   <li>Permit Swagger/OpenAPI endpoints</li>
 *   <li>Require authentication for all other officer endpoints</li>
 * </ul>
 *
 * <p>Uses {@code @Order(1)} to take precedence over the common config.</p>
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class OfficerSecurityConfig {

    private final Converter<Jwt, AbstractAuthenticationToken> keycloakJwtConverter;

    @Bean
    @Primary
    @Order(1)
    public SecurityFilterChain officerSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/officers/register").permitAll()
                // CAO dashboard endpoints (dev mode - no JWT)
                .requestMatchers("/api/cao/**").permitAll()
                // Swagger/OpenAPI
                .requestMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                // Actuator
                .requestMatchers("/actuator/**").permitAll()
                // Admin officer management endpoints require authentication
                .requestMatchers("/api/officers/**").authenticated()
                // Vendor endpoints (existing) require authentication
                .requestMatchers("/api/v1/vendors/**").authenticated()
                // All other requests
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(keycloakJwtConverter))
            );

        return http.build();
    }
}

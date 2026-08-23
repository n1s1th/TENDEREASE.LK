package lk.tenderease.tender.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;

/**
 * Resolves a stable identifier for the calling user.
 *
 * <p>Mirrors {@link CurrentBidderEmailResolver}, but prefers the Keycloak {@code sub}
 * claim so bookmarks stay attached to the same person even if their email changes.
 * The {@code X-User-Email} header is honoured as a development fallback, matching how
 * the rest of this service identifies callers while JWT enforcement is disabled.
 */
@Component
@RequiredArgsConstructor
public class CurrentUserResolver {

    private final ObjectMapper objectMapper;

    private static final String BEARER_PREFIX = "Bearer ";

    public Optional<String> resolve(String authorizationHeader, String fallbackEmailHeader) {
        Optional<String> fromToken = readSubject(authorizationHeader);
        if (fromToken.isPresent()) {
            return fromToken;
        }

        if (StringUtils.hasText(fallbackEmailHeader)) {
            return Optional.of(fallbackEmailHeader.trim());
        }

        return Optional.empty();
    }

    private Optional<String> readSubject(String authorizationHeader) {
        if (!StringUtils.hasText(authorizationHeader) || !authorizationHeader.startsWith(BEARER_PREFIX)) {
            return Optional.empty();
        }

        try {
            String token = authorizationHeader.substring(BEARER_PREFIX.length());

            // A JWT is header.payload.signature — take the segment between the dots.
            int firstDot = token.indexOf('.');
            int secondDot = firstDot < 0 ? -1 : token.indexOf('.', firstDot + 1);
            if (firstDot < 0 || secondDot < 0) {
                return Optional.empty();
            }

            byte[] payloadBytes = Base64.getUrlDecoder().decode(token.substring(firstDot + 1, secondDot));
            JsonNode payload = objectMapper.readTree(new String(payloadBytes, StandardCharsets.UTF_8));

            return firstText(payload, "sub")
                    .or(() -> firstText(payload, "email"))
                    .or(() -> firstText(payload, "preferred_username"));
        } catch (Exception ignored) {
            return Optional.empty();
        }
    }

    private Optional<String> firstText(JsonNode payload, String fieldName) {
        JsonNode value = payload.get(fieldName);
        if (value == null || !StringUtils.hasText(value.asText())) {
            return Optional.empty();
        }
        return Optional.of(value.asText().trim());
    }
}

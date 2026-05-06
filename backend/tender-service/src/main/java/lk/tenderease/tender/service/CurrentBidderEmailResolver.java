package lk.tenderease.tender.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CurrentBidderEmailResolver {

    private final ObjectMapper objectMapper;

    public Optional<String> resolve(String authorizationHeader, String fallbackEmailHeader) {
        if (StringUtils.hasText(fallbackEmailHeader)) {
            return Optional.of(fallbackEmailHeader.trim());
        }

        if (!StringUtils.hasText(authorizationHeader) || !authorizationHeader.startsWith("Bearer ")) {
            return Optional.empty();
        }

        try {
            String token = authorizationHeader.substring("Bearer ".length());
            String[] tokenParts = token.split("\\.");
            if (tokenParts.length < 2) {
                return Optional.empty();
            }

            byte[] decodedPayload = Base64.getUrlDecoder().decode(tokenParts[1]);
            JsonNode payload = objectMapper.readTree(new String(decodedPayload, StandardCharsets.UTF_8));
            return firstText(payload, "email")
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

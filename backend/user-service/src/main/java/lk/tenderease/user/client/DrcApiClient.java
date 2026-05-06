package lk.tenderease.user.client;

import lk.tenderease.user.dto.response.VerifyRegistrationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DrcApiClient {

    private static final String DRC_VERIFY_URL = "https://erocapiv2.drc.gov.lk/api/v1/verify-company";

    private final RestTemplate restTemplate;

    public VerifyRegistrationResponse verify(String certificateNo) {
        log.info("Verifying certificate number: {}", certificateNo);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> payload = Map.of("certificateNo", certificateNo);
        HttpEntity<Map<String, String>> request = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<DrcVerifyApiResponse> response = restTemplate.exchange(
                    DRC_VERIFY_URL,
                    HttpMethod.POST,
                    request,
                    DrcVerifyApiResponse.class
            );

            DrcVerifyApiResponse body = response.getBody();
            if (body == null) {
                log.warn("DRC API returned null body for certificate: {}", certificateNo);
                return VerifyRegistrationResponse.builder()
                        .verified(false)
                        .message("No response from the registration authority. Please try again.")
                        .build();
            }

            log.info("DRC response for {}: status={}, company={}", certificateNo, body.isStatus(), body.getCompanyName());

            return VerifyRegistrationResponse.builder()
                    .verified(body.isStatus())
                    .companyName(body.getCompanyName())
                    .incorporationDate(body.getIncorporationAt())
                    .message(body.getMessage())
                    .build();

        } catch (RestClientException e) {
            log.error("DRC API call failed for certificate {}: {}", certificateNo, e.getMessage());
            return VerifyRegistrationResponse.builder()
                    .verified(false)
                    .message("Unable to reach the registration verification service. Please try again later.")
                    .build();
        }
    }

    @lombok.Data
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    static class DrcVerifyApiResponse {
        private String message;

        @com.fasterxml.jackson.annotation.JsonProperty("company_name")
        private String companyName;

        @com.fasterxml.jackson.annotation.JsonProperty("incorporation_at")
        private String incorporationAt;

        private boolean status;
        private String postfix;
    }
}

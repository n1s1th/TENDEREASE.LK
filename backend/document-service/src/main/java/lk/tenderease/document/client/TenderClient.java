package lk.tenderease.document.client;

import lk.tenderease.tender.dto.response.TenderDetailResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

// url is set for Cloud Run (no Eureka). Falls back to local tender-service for dev.
@FeignClient(name = "tender-service", url = "${services.tender.url:http://localhost:8082}", path = "/api/v1/tenders")
public interface TenderClient {

    @GetMapping("/{id}")
    TenderDetailResponse getTenderById(@PathVariable("id") UUID id);
}

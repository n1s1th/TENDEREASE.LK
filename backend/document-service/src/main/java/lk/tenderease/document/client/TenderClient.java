package lk.tenderease.document.client;

import lk.tenderease.tender.dto.response.TenderDetailResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "tender-service", path = "/api/v1/tenders")
public interface TenderClient {

    @GetMapping("/{id}")
    TenderDetailResponse getTenderById(@PathVariable("id") UUID id);
}

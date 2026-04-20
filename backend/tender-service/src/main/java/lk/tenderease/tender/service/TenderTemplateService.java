package lk.tenderease.tender.service;

import lk.tenderease.tender.dto.template.TenderTemplateRequest;
import lk.tenderease.tender.dto.template.TenderTemplateResponse;

import java.util.List;
import java.util.UUID;

public interface TenderTemplateService {
    TenderTemplateResponse createTemplate(TenderTemplateRequest request);
    TenderTemplateResponse updateTemplate(UUID id, TenderTemplateRequest request);
    TenderTemplateResponse getTemplate(UUID id);
    List<TenderTemplateResponse> getActiveTemplates();
    TenderTemplateResponse publishTemplate(UUID id);
    void archiveTemplate(UUID id);
}
